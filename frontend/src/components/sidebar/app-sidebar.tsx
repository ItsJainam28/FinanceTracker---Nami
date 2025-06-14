import * as React from "react";
import { useEffect, useState } from "react";
import api from "@/api/axiosInstance";
import {  MessageSquare } from "lucide-react";

import { NavMain } from "@/components/sidebar/nav-main";
import { NavUser } from "@/components/sidebar/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { navItems } from "@/components/sidebar/nav-items";
import {
  createChatSession,
  getChatSessions,
  deleteSession,
  updateSessionTitle,
  ChatSession,
} from "@/api/assistant";
import { Link, useNavigate } from "react-router-dom";
import { NavProjects } from "./nav-projects";
import logo from "@/assets/please-work.svg";
import {  NamiLogoAnimated } from "@/components/ui/nami-logo";
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [user, setUser] = useState({
    name: "User",
    email: "user@example.com",
    avatar: "/avatars/user.jpg",
  });

  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const navigate = useNavigate();


  useEffect(() => {
    const loadSessions = async () => {
      try {
        const response = await getChatSessions();
        setSessions(response.data.data);
      } catch (error) {
        console.error("Failed to load sessions:", error);
        setSessions([]);
      }
    };

    loadSessions();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const { data } = await api.get("/auth/me");
        setUser({
          name: data.firstname ?? "User",
          email: data.email ?? "user@example.com",
          avatar: "/avatars/user.jpg",
        });
      } catch (err) {
        console.error("Failed to fetch user:", err);
      }
    })();
  }, []);

  const handleNewChat = async () => {
    try {
      const { data } = await createChatSession();
      navigate(`/chat/${data.data._id}`);
    } catch (err) {
      console.error("Failed to start new chat:", err);
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    try {
      await deleteSession(sessionId);
      setSessions((prev) =>
        prev.filter((session) => session._id !== sessionId)
      );
    } catch (err) {
      console.error("Failed to delete session:", err);
    }
  };

  const handleUpdateSessionTitle = async (
    sessionId: string,
    newTitle: string
  ) => {
    try {
      await updateSessionTitle(sessionId, newTitle);
      setSessions((prev) =>
        prev.map((session) =>
          session._id === sessionId ? { ...session, title: newTitle } : session
        )
      );
    } catch (err) {
      console.error("Failed to update session title:", err);
    }
  };

  const projectsData = sessions.map((session) => ({
    _id: session._id,
    name: session.title,
    url: `/chat/${session._id}`,
    icon: MessageSquare,
  }));
  console.log("Projects Data:", logo);
  return (
    <Sidebar
      variant="inset"
      className="bg-background text-foreground border-r border-border shadow-sm"
      collapsible="icon"
      {...props}
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/dashboard" className="flex items-center justify-start">
                <NamiLogoAnimated />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={navItems} />
        <NavProjects
          projects={projectsData}
          onNewChat={handleNewChat}
          updateSessionTitle={handleUpdateSessionTitle}
          deleteSession={handleDeleteSession}
        />
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
