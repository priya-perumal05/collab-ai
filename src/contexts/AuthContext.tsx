import React, { createContext, useContext, useEffect, useState } from "react";
import { User, onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "../firebase";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  getDocFromServer,
} from "firebase/firestore";
import { handleFirestoreError, OperationType } from "../lib/firestore-errors";
interface AuthContextType {
  currentUser: User | null;
  userProfile: any | null;
  teamData: any | null;
  loading: boolean;
  logout: () => Promise<void>;
}
const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  userProfile: null,
  teamData: null,
  loading: true,
  logout: async () => {},
});
export function useAuth() {
  return useContext(AuthContext);
}
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<any | null>(null);
  const [teamData, setTeamData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    /* Test Firestore connection */ const testConnection = async () => {
      try {
        await getDocFromServer(doc(db, "test", "connection"));
      } catch (error) {
        if (
          error instanceof Error &&
          error.message.includes("the client is offline")
        ) {
          console.error(
            "Please check your Firebase configuration: Firestore appears to be offline.",
          );
        }
      }
    };
    testConnection();
    let unsubscribeProfile: (() => void) | null = null;
    let unsubscribeTeam: (() => void) | null = null;
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      try {
        setCurrentUser(user);
        /* Clear previous listeners */ if (unsubscribeProfile)
          unsubscribeProfile();
        if (unsubscribeTeam) unsubscribeTeam();
        if (user) {
          const userRef = doc(db, "users", user.uid);
          /* Listen to user profile */ unsubscribeProfile = onSnapshot(
            userRef,
            async (userSnap) => {
              try {
                let profile: any = null;
                if (userSnap.exists()) {
                  profile = { ...userSnap.data(), uid: user.uid };
                } else {
                  const selectedRole =
                    sessionStorage.getItem("selectedRole") || "Team Member";
                  profile = {
                    uid: user.uid,
                    name: user.displayName || "New User",
                    email: user.email || "",
                    role: selectedRole,
                    department: "General",
                    healthScore: 100,
                    productivityScore: 100,
                    tasksCompleted: 0,
                    punctuality: 100,
                    engagement: 100,
                    createdAt: new Date().toISOString(),
                  };
                  await setDoc(userRef, profile);
                  /* The next snapshot will have the new profile */ return;
                }
                setUserProfile(profile);
                /* Listen to team data if teamId exists */ if (
                  profile?.teamId
                ) {
                  const teamRef = doc(db, "teams", profile.teamId);
                  if (unsubscribeTeam) unsubscribeTeam();
                  unsubscribeTeam = onSnapshot(
                    teamRef,
                    (teamSnap) => {
                      if (teamSnap.exists()) {
                        setTeamData({ id: teamSnap.id, ...teamSnap.data() });
                      } else {
                        setTeamData(null);
                      }
                    },
                    (error) => {
                      handleFirestoreError(
                        error,
                        OperationType.GET,
                        `teams/${profile.teamId}`,
                      );
                    },
                  );
                } else {
                  setTeamData(null);
                }
                setLoading(false);
              } catch (err) {
                console.error("Profile listener error:", err);
                setLoading(false);
              }
            },
            (err) => {
              handleFirestoreError(err, OperationType.GET, `users/${user.uid}`);
            },
          );
        } else {
          setUserProfile(null);
          setTeamData(null);
          setLoading(false);
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        setLoading(false);
      }
    });
    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) unsubscribeProfile();
      if (unsubscribeTeam) unsubscribeTeam();
    };
  }, []);
  const logout = async () => {
    await signOut(auth);
  };
  return (
    <AuthContext.Provider
      value={{ currentUser, userProfile, teamData, loading, logout }}
    >
      {" "}
      {!loading && children}{" "}
    </AuthContext.Provider>
  );
}
