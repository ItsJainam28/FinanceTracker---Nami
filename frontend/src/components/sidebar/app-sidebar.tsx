import * as React from "react"
import { useEffect, useState } from "react";
import api from "@/api/axiosInstance"; // your existing Axios instance

import {
  Bot,
  Command,
  LucideIcon,
  MessageSquare,
} from "lucide-react"

import { NavMain } from "@/components/sidebar/nav-main"
import { NavUser } from "@/components/sidebar/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { navItems } from "@/components/sidebar/nav-items"
import { createChatSession, getChatSessions, ChatSession } from "@/api/assistant";
import { useNavigate } from "react-router-dom";
import { NavProjects } from "./nav-projects";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [user, setUser] = useState({
    name: "User",
    email: "user@example.com",
    avatar: "/avatars/user.jpg",
  });

  const navigate = useNavigate();
  const [sessions, setSessions] = useState<ChatSession[]>([]);

  useEffect(() => {
    const loadSessions = async () => {
      try {
        const response = await getChatSessions();
        console.log('Fetched sessions:', response.data.data);
        setSessions(response.data.data);
      } catch (error) {
        console.error('Failed to load sessions:', error);
        setSessions([]); // Fallback to empty array
      }
    };
    
    loadSessions();
  }, []);

  const handleNewChat = async () => {
    try {
      const { data } = await createChatSession();
      console.log("New chat session created:", data.data._id);
      navigate(`/chat/${data.data._id}`);
    } catch (err) {
      console.error("Failed to start new chat:", err);
    }
  };

  const projectsData = sessions.map(session => ({
    name: session.title,
    url: `/chat/${session._id}`, 
    icon: MessageSquare 
  }));
  

  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
  
        const { data } = await api.get("/auth/me");
        setUser({
          name: data.firstname ?? "User",
          email: data.email ?? "user@example.com",
          avatar: "/avatars/user.jpg", // replace with dynamic avatar if you have one
        });
      } catch (err) {
        console.error("Failed to fetch user:", err);
      }
    })();
  }, []);
  
  return (
    <Sidebar variant="inset"     className="bg-zinc-900 text-white border-r border-zinc-800 shadow-md"{...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg cursor-pointer">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Fincance Tracker</span>
                  <span className="truncate text-xs">Track that Money!</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} />
        <NavProjects projects={projectsData} onNewChat={handleNewChat} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}
