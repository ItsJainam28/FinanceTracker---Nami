import { useState } from "react";
import {
  MoreHorizontal,
  Trash2,
  Pencil,
  SquarePen,
  type LucideIcon,
  Link,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

export function NavProjects({
  projects,
  onNewChat,
  updateSessionTitle,
  deleteSession,
}: {
  projects: {
    _id: string;
    name: string;
    url: string;
    icon: LucideIcon;
  }[];
  onNewChat: () => void;
  updateSessionTitle: (id: string, title: string) => Promise<void>;
  deleteSession: (id: string) => Promise<void>;
}) {
  const { isMobile } = useSidebar();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");

  const handleRename = async (id: string, title: string) => {
    try {
      await updateSessionTitle(id, title);
      toast("Chat renamed");
    } catch {
      toast.error("Something went wrong", {
        description: "Unable to rename the chat session.",
      });
    } finally {
      setEditingId(null);
      setNewTitle("");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteSession(id);
      toast.success("Deleted successfully");
    } catch {
      toast.error("Something went wrong", {
        description: "Unable to delete the chat session.",
      });
    }
  };

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden flex flex-col min-h-0">
      <SidebarGroupLabel>Ask Nami</SidebarGroupLabel>
      <SidebarMenu className="flex-1 overflow-y-auto max-h-[calc(100vh-300px)] custom-scroll">
        <SidebarMenuItem>
          <SidebarMenuButton onClick={onNewChat}>
            <SquarePen />
            <span className="font-medium text-sm cursor-pointer">New Chat</span>
          </SidebarMenuButton>
        </SidebarMenuItem>

        {projects.map((item) => (
          <SidebarMenuItem
            key={item._id}
            className="hover:bg-muted transition-colors rounded-md"
          >
            <SidebarMenuButton asChild>
              {editingId === item._id ? (
                <div className="flex items-center gap-2 w-full">
                  <item.icon className="text-muted-foreground" />
                  <Input
                    value={newTitle}
                    autoFocus
                    onChange={(e) => setNewTitle(e.target.value)}
                    onBlur={() => setEditingId(null)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleRename(item._id, newTitle.trim());
                      if (e.key === "Escape") setEditingId(null);
                    }}
                    className="bg-muted border border-border text-foreground text-sm h-8"
                  />
                </div>
              ) : (
                <Link to={item.url}>
                  <item.icon className="text-muted-foreground" />
                  <span>{item.name}</span>
                </Link>
              )}
            </SidebarMenuButton>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuAction showOnHover>
                  <MoreHorizontal />
                  <span className="sr-only">More</span>
                </SidebarMenuAction>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-48 bg-popover text-popover-foreground border border-border"
                side={isMobile ? "bottom" : "right"}
                align={isMobile ? "end" : "start"}
              >
                <DropdownMenuItem
                  className="cursor-pointer hover:bg-muted"
                  onClick={() => {
                    setEditingId(item._id);
                    setNewTitle(item.name);
                  }}
                >
                  <Pencil className="text-muted-foreground mr-2" />
                  <span>Rename</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleDelete(item._id)}
                  className="cursor-pointer hover:bg-muted"
                >
                  <Trash2 className="text-muted-foreground mr-2" />
                  <span>Delete</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
