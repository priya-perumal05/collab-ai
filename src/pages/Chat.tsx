import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useData } from "../hooks/useData";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import { Message, User } from "../types";
import { Avatar } from "../components/ui/Avatar";
import { Send, Search, Info, MessageCircle, ArrowLeft } from "lucide-react";
import { cn } from "../lib/utils";
export default function Chat() {
  const { currentUser, userProfile } = useAuth();
  const { users } = useData();
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const teamMembers = users.filter((u) => u.id !== currentUser?.uid);
  const filteredUsers = teamMembers.filter((u) =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );
  useEffect(() => {
    if (!currentUser || !selectedUser) return;
    const q1 = query(
      collection(db, "messages"),
      where("senderId", "==", currentUser.uid),
      where("receiverId", "==", selectedUser.id),
    );
    const q2 = query(
      collection(db, "messages"),
      where("senderId", "==", selectedUser.id),
      where("receiverId", "==", currentUser.uid),
    );
    const unsub1 = onSnapshot(q1, (snapshot) => {
      const msgs1 = snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() }) as Message,
      );
      setMessages((prev) => {
        const otherMsgs = prev.filter((m) => m.senderId === selectedUser.id);
        const combined = [...msgs1, ...otherMsgs].sort((a, b) => {
          const timeA = a.createdAt?.toMillis() || 0;
          const timeB = b.createdAt?.toMillis() || 0;
          return timeA - timeB;
        });
        return combined;
      });
    });
    const unsub2 = onSnapshot(q2, (snapshot) => {
      const msgs2 = snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() }) as Message,
      );
      setMessages((prev) => {
        const otherMsgs = prev.filter((m) => m.senderId === currentUser.uid);
        const combined = [...msgs2, ...otherMsgs].sort((a, b) => {
          const timeA = a.createdAt?.toMillis() || 0;
          const timeB = b.createdAt?.toMillis() || 0;
          return timeA - timeB;
        });
        return combined;
      });
    });
    return () => {
      unsub1();
      unsub2();
    };
  }, [currentUser, selectedUser]);
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser || !selectedUser) return;
    const messageContent = newMessage.trim();
    setNewMessage("");
    try {
      await addDoc(collection(db, "messages"), {
        senderId: currentUser.uid,
        receiverId: selectedUser.id,
        content: messageContent,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };
  return (
    <div className="w-full h-full flex-1 flex glass-card text-slate-900 dark:text-slate-100 rounded-2xl md:rounded-3xl overflow-hidden shadow-xl animate-in fade-in duration-500">
      {" "}
      {/* Sidebar */}{" "}
      <div className={cn(
        "w-full md:w-80 border-r border-slate-200 dark:border-white/10 flex flex-col bg-slate-50/50 dark:bg-white/[0.02]",
        selectedUser ? "hidden md:flex" : "flex"
      )}>
        {" "}
        <div className="p-6 border-b border-slate-200 dark:border-white/10">
          {" "}
          <h2 className="text-lg md:text-xl font-black text-slate-900 dark:text-white tracking-tight mb-4">
            Messages
          </h2>{" "}
          <div className="relative">
            {" "}
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />{" "}
            <input
              type="text"
              placeholder="Search members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onBlur={() => {
                setTimeout(() => {
                  window.scrollTo(0, 0);
                }, 100);
              }}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-card text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
            />{" "}
          </div>{" "}
        </div>{" "}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {" "}
          {filteredUsers.map((user) => (
            <button
              key={user.id}
              onClick={() => setSelectedUser(user)}
              className={cn(
                "w-full flex items-center gap-3 p-3 rounded-2xl transition-all duration-300",
                selectedUser?.id === user.id
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                  : "hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300",
              )}
            >
              {" "}
              <div className="relative">
                {" "}
                <Avatar
                  src={user.avatar}
                  fallback={user.name.charAt(0)}
                  className={cn(
                    "h-10 w-10 border-2",
                    selectedUser?.id === user.id
                      ? "border-blue-400"
                      : "border-white dark:border-slate-800",
                  )}
                />{" "}
                <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white dark:border-slate-800 bg-emerald-500" />{" "}
              </div>{" "}
              <div className="text-left flex-1 min-w-0">
                {" "}
                <p
                  className={cn(
                    "font-bold truncate text-sm",
                    selectedUser?.id === user.id
                      ? "text-white"
                      : "text-slate-900 dark:text-slate-100",
                  )}
                >
                  {user.name}
                </p>{" "}
                <p
                  className={cn(
                    "text-xs truncate",
                    selectedUser?.id === user.id
                      ? "text-blue-200"
                      : "text-slate-500",
                  )}
                >
                  {user.role}
                </p>{" "}
              </div>{" "}
            </button>
          ))}{" "}
          {filteredUsers.length === 0 && (
            <div className="text-center text-sm text-slate-500 py-8">
              {" "}
              No members found.{" "}
            </div>
          )}{" "}
        </div>{" "}
      </div>{" "}
      {/* Chat Area */}{" "}
      {selectedUser ? (
        <div className={cn(
          "flex-1 flex flex-col relative bg-slate-50/20 dark:bg-transparent",
          !selectedUser ? "hidden md:flex" : "flex"
        )}>
          {" "}
          {/* Chat Header */}{" "}
          <div className="h-16 md:h-20 px-3 md:px-8 border-b border-slate-200 dark:border-white/10 flex items-center justify-between glass-card z-10 shrink-0">
            {" "}
            <div className="flex items-center gap-2 md:gap-4">
              {" "}
              <button 
                onClick={() => setSelectedUser(null)}
                className="md:hidden p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/5 text-slate-500"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <Avatar
                src={selectedUser.avatar}
                fallback={selectedUser.name.charAt(0)}
                className="h-10 w-10 md:h-12 md:w-12 border-2 border-white dark:border-slate-800 shadow-sm"
              />{" "}
              <div>
                {" "}
                <h3 className="text-base md:text-lg font-bold text-slate-900 dark:text-white">
                  {selectedUser.name}
                </h3>{" "}
                <p className="text-[10px] md:text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 md:gap-1.5 mt-0.5">
                  {" "}
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />{" "}
                  Online{" "}
                </p>{" "}
              </div>{" "}
            </div>{" "}
            <button className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/5 text-slate-400 transition-colors">
              {" "}
              <Info className="h-5 w-5" />{" "}
            </button>{" "}
          </div>{" "}
          {/* Messages */}{" "}
          <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
            {" "}
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
                {" "}
                <div className="h-16 w-16 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center mb-4">
                  {" "}
                  <MessageCircle className="h-8 w-8 text-slate-300 dark:text-slate-600" />{" "}
                </div>{" "}
                <p>No messages yet. Start the conversation!</p>{" "}
              </div>
            ) : (
              messages.map((msg, i) => {
                const isMe = msg.senderId === currentUser?.uid;
                const showAvatar =
                  i === 0 || messages[i - 1].senderId !== msg.senderId;
                return (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex items-end gap-3 max-w-[75%]",
                      isMe ? "ml-auto flex-row-reverse" : "",
                    )}
                  >
                    {" "}
                    {showAvatar ? (
                      <Avatar
                        fallback={
                          isMe
                            ? userProfile?.name?.charAt(0) || "?"
                            : selectedUser.name.charAt(0)
                        }
                        src={isMe ? undefined : selectedUser.avatar}
                        className="h-8 w-8 shrink-0 mb-1"
                      />
                    ) : (
                      <div className="w-8 shrink-0" /> /* spacer */
                    )}{" "}
                    <div
                      className={cn(
                        "px-5 py-3 rounded-2xl text-sm relative group",
                        isMe
                          ? "bg-blue-600 text-white rounded-br-sm"
                          : "glass-card text-slate-900 dark:text-slate-100 text-slate-900 dark:text-slate-100 shadow-sm rounded-bl-sm",
                      )}
                    >
                      {" "}
                      {msg.content}{" "}
                      <span
                        className={cn(
                          "absolute -bottom-5 text-[10px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity",
                          isMe ? "right-1" : "left-1",
                        )}
                      >
                        {" "}
                        {msg.createdAt
                          ?.toDate()
                          .toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}{" "}
                      </span>{" "}
                    </div>{" "}
                  </div>
                );
              })
            )}{" "}
          </div>{" "}
          {/* Chat Input */}{" "}
          <div className="p-6 border-t border-slate-200 dark:border-white/10 bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm">
            {" "}
            <form
              onSubmit={handleSend}
              className="relative flex items-center rounded-full glass-card text-slate-900 dark:text-slate-100 focus-within:ring-2 focus-within:ring-blue-500/50 focus-within:border-blue-500 transition-all pr-1.5 p-1.5"
            >
              {" "}
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onBlur={() => {
                  setTimeout(() => {
                    window.scrollTo(0, 0);
                  }, 100);
                }}
                placeholder="Type a message..."
                className="flex-1 bg-transparent border-none outline-none px-4 py-2 text-base md:text-sm text-slate-900 dark:text-white placeholder:text-slate-400"
              />{" "}
              <button
                type="submit"
                disabled={!newMessage.trim()}
                className="h-10 w-10 rounded-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 flex items-center justify-center text-white transition-all shadow-md shadow-blue-500/20"
              >
                {" "}
                <Send className="h-4 w-4 ml-0.5" />{" "}
              </button>{" "}
            </form>{" "}
          </div>{" "}
        </div>
      ) : (
        <div className="hidden md:flex flex-1 flex-col items-center justify-center bg-slate-50/20 dark:bg-transparent text-slate-400">
          {" "}
          <div className="h-20 w-20 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center mb-6">
            {" "}
            <MessageCircle className="h-10 w-10 text-slate-300 dark:text-slate-600" />{" "}
          </div>{" "}
          <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">
            Your Messages
          </h3>{" "}
          <p className="text-sm">
            Select a team member to start chatting.
          </p>{" "}
        </div>
      )}{" "}
    </div>
  );
}
