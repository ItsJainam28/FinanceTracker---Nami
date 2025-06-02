import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { Outlet } from "react-router-dom";

export default function AppShell() {
  return (
    <SidebarProvider>
      <AppSidebar />

        <main className="flex-1">
          <Outlet />
        </main>
  
    </SidebarProvider>
  );
}