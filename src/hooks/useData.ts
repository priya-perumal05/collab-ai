import { useState, useEffect } from "react";
import {
  collection,
  onSnapshot,
  query,
  where,
  doc,
  orderBy,
  addDoc,
  updateDoc,
  documentId,
} from "firebase/firestore";
import { db } from "../firebase";
import {
  Task,
  User,
  JoinRequest,
  App,
  SecurityLog,
  TeamSettings,
  Favorite,
  Team,
} from "../types";
import { useAuth } from "../contexts/AuthContext";
import { handleFirestoreError, OperationType } from "../lib/firestore-errors";
export function useData() {
  const { userProfile, currentUser } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);
  const [apps, setApps] = useState<App[]>([]);
  const [securityLogs, setSecurityLogs] = useState<SecurityLog[]>([]);
  const [teamSettings, setTeamSettings] = useState<TeamSettings | null>(null);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [roadmapPhases, setRoadmapPhases] = useState<any[]>([]);
  const [goals, setGoals] = useState<any[]>([]);
  const [managedTeams, setManagedTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!userProfile?.teamId || !currentUser) {
      setLoading(false);
      return;
    }
    const qTasks = query(
      collection(db, "tasks"),
      where("teamId", "==", userProfile.teamId),
    );
    const unsubscribeTasks = onSnapshot(
      qTasks,
      (snapshot) => {
        const tasksData: Task[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          tasksData.push({
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate?.()
              ? data.createdAt.toDate().toISOString()
              : data.createdAt,
            updatedAt: data.updatedAt?.toDate?.()
              ? data.updatedAt.toDate().toISOString()
              : data.updatedAt,
          } as Task);
        });
        setTasks(tasksData);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, "tasks");
      },
    );
    const qUsers = query(
      collection(db, "users"),
      where("teamIds", "array-contains", userProfile.teamId),
    );
    const unsubscribeUsers = onSnapshot(
      qUsers,
      (snapshot) => {
        const usersData: User[] = [];
        snapshot.forEach((doc) => {
          usersData.push({ id: doc.id, ...doc.data() } as User);
        });
        setUsers(usersData);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, "users");
      },
    );
    const qApps = query(
      collection(db, "apps"),
      where("teamId", "==", userProfile.teamId),
    );
    const unsubscribeApps = onSnapshot(
      qApps,
      (snapshot) => {
        const appsData: App[] = [];
        snapshot.forEach((doc) => {
          appsData.push({ id: doc.id, ...doc.data() } as App);
        });
        setApps(appsData);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, "apps");
      },
    );
    const qLogs = query(
      collection(db, "securityLogs"),
      where("teamId", "==", userProfile.teamId),
    );
    const unsubscribeLogs = onSnapshot(
      qLogs,
      (snapshot) => {
        const logsData: SecurityLog[] = [];
        snapshot.forEach((doc) => {
          logsData.push({ id: doc.id, ...doc.data() } as SecurityLog);
        });
        setSecurityLogs(
          logsData.sort((a, b) => {
            const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt || 0);
            const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt || 0);
            return dateB.getTime() - dateA.getTime();
          }),
        );
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, "securityLogs");
      },
    );
    const unsubscribeSettings = onSnapshot(
      doc(db, "teamSettings", userProfile.teamId),
      (snapshot) => {
        if (snapshot.exists()) {
          setTeamSettings({
            id: snapshot.id,
            ...snapshot.data(),
          } as TeamSettings);
        } else {
          setTeamSettings({
            id: userProfile.teamId!,
            teamId: userProfile.teamId!,
            publicAccess: false,
            fileSharing: true,
            apiAccess: true,
            twoFactorRequired: false,
          });
        }
      },
      (error) => {
        handleFirestoreError(
          error,
          OperationType.GET,
          `teamSettings/${userProfile.teamId}`,
        );
      },
    );
    const qFavorites = query(
      collection(db, "favorites"),
      where("userId", "==", currentUser.uid),
    );
    const unsubscribeFavorites = onSnapshot(
      qFavorites,
      (snapshot) => {
        const favData: Favorite[] = [];
        snapshot.forEach((doc) => {
          favData.push({ id: doc.id, ...doc.data() } as Favorite);
        });
        setFavorites(favData);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, "favorites");
      },
    );
    const qRoadmap = query(
      collection(db, "roadmapPhases"),
      where("teamId", "==", userProfile.teamId),
      orderBy("order", "asc"),
    );
    const unsubscribeRoadmap = onSnapshot(
      qRoadmap,
      (snapshot) => {
        const roadmapData: any[] = [];
        snapshot.forEach((doc) => {
          roadmapData.push({ id: doc.id, ...doc.data() });
        });
        setRoadmapPhases(roadmapData);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, "roadmapPhases");
      },
    );
    const qGoals = query(
      collection(db, "goals"),
      where("teamId", "==", userProfile.teamId),
    );
    const unsubscribeGoals = onSnapshot(
      qGoals,
      (snapshot) => {
        const goalsData: any[] = [];
        snapshot.forEach((doc) => {
          goalsData.push({ id: doc.id, ...doc.data() });
        });
        setGoals(goalsData);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, "goals");
      },
    );
    let unsubscribeRequests = () => {};
    if (userProfile.role === "Team Lead") {
      const qRequests = query(
        collection(db, "joinRequests"),
        where("teamLeadId", "==", userProfile.uid),
        where("status", "==", "pending"),
      );
      unsubscribeRequests = onSnapshot(
        qRequests,
        (snapshot) => {
          const requestsData: JoinRequest[] = [];
          snapshot.forEach((doc) => {
            requestsData.push({ id: doc.id, ...doc.data() } as JoinRequest);
          });
          setJoinRequests(requestsData);
        },
        (error) => {
          handleFirestoreError(error, OperationType.LIST, "joinRequests");
        },
      );
    }
    let unsubscribeManagedTeams = () => {};
    if (userProfile.role === "Team Lead") {
      const qManagedTeams = query(
        collection(db, "teams"),
        where("leadId", "==", currentUser.uid),
      );
      unsubscribeManagedTeams = onSnapshot(qManagedTeams, (snapshot) => {
        const teamsData: Team[] = [];
        snapshot.forEach((doc) => teamsData.push({ id: doc.id, ...doc.data() } as Team));
        setManagedTeams(teamsData);
      }, (error) => handleFirestoreError(error, OperationType.LIST, "teams"));
    } else {
      const joinedTeamIds = userProfile.teamIds?.length > 0 ? userProfile.teamIds : (userProfile.teamId ? [userProfile.teamId] : []);
      if (joinedTeamIds.length > 0) {
        // slice to first 10 for in-query limit
        const qJoinedTeams = query(
          collection(db, "teams"),
          where(documentId(), "in", joinedTeamIds.slice(0, 10))
        );
        unsubscribeManagedTeams = onSnapshot(qJoinedTeams, (snapshot) => {
          const teamsData: Team[] = [];
          snapshot.forEach((doc) => teamsData.push({ id: doc.id, ...doc.data() } as Team));
          setManagedTeams(teamsData);
        }, (error) => handleFirestoreError(error, OperationType.LIST, "teams"));
      } else {
        setManagedTeams([]);
      }
    }
    setLoading(false);
    return () => {
      unsubscribeTasks();
      unsubscribeUsers();
      unsubscribeApps();
      unsubscribeLogs();
      unsubscribeSettings();
      unsubscribeRequests();
      unsubscribeFavorites();
      unsubscribeRoadmap();
      unsubscribeGoals();
      unsubscribeManagedTeams();
    };
  }, [userProfile?.teamId, userProfile?.role, currentUser]);
  return {
    tasks,
    users,
    joinRequests,
    apps,
    securityLogs,
    teamSettings,
    favorites,
    roadmapPhases,
    goals,
    managedTeams,
    loading,
  };
}
