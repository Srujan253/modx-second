import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      console.log("👤 User logged in, initializing socket...");
      console.log("User data:", user);
      
      // Connect to Socket.IO server (authentication via cookies)
      const newSocket = io(import.meta.env.VITE_API_URL?.replace('/api/v1', '') || "http://localhost:5000", {
        withCredentials: true, // Send cookies with the request
      });

      newSocket.on("connect", () => {
        console.log("✅ Socket.IO connected - ID:", newSocket.id);
      });

      newSocket.on("disconnect", () => {
        console.log("❌ Socket.IO disconnected");
      });

      newSocket.on("connect_error", (error) => {
        console.error("🔴 Socket connection error:", error.message);
      });

      setSocket(newSocket);

      return () => {
        console.log("🔌 Closing socket connection");
        newSocket.close();
      };
    } else {
      console.log("⚠️ No user, socket not initialized");
      // If user logs out, close the socket
      if (socket) {
        socket.close();
        setSocket(null);
      }
    }
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};
