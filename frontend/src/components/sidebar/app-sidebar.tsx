import * as React from "react";
import { useEffect, useState } from "react";
import api from "@/api/axiosInstance";

import {
  Command,
  MessageSquare,
} from "lucide-react";

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
} from "@/components/ui/sidebar";
import { navItems } from "@/components/sidebar/nav-items";
import { createChatSession, getChatSessions, deleteSession, updateSessionTitle, ChatSession } from "@/api/assistant";
import { useNavigate } from "react-router-dom";
import { NavProjects } from "./nav-projects";

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
      setSessions(prev => prev.filter(session => session._id !== sessionId));
    } catch (err) {
      console.error("Failed to delete session:", err);
    }
  };

  const handleUpdateSessionTitle = async (sessionId: string, newTitle: string) => {
    try {
      await updateSessionTitle(sessionId, newTitle);
      setSessions(prev =>
        prev.map(session =>
          session._id === sessionId ? { ...session, title: newTitle } : session
        )
      );
    } catch (err) {
      console.error("Failed to update session title:", err);
    }
  };

  const projectsData = sessions.map(session => ({
    _id: session._id,
    name: session.title,
    url: `/chat/${session._id}`,
    icon: MessageSquare,
  }));

  return (
    <Sidebar
      variant="inset"
      className="bg-background text-foreground border-r border-border shadow-sm"
      {...props}
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="bg-muted text-muted-foreground flex aspect-square size-8 items-center justify-center rounded-lg cursor-pointer">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Finance Tracker</span>
                  <span className="truncate text-xs text-muted-foreground">
                    Track that Money!
                  </span>
                </div>
              </a>
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
    </Sidebar>
  );
}
