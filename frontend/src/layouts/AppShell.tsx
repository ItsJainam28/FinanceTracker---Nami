/* src/layouts/AppShell.tsx */
import { SidebarProvider } from "@/components/ui/sidebar";
import {AppSidebar} from "@/components/sidebar/app-sidebar";
import { Outlet } from "react-router-dom";

export default function AppShell() {
  return (
    <SidebarProvider>
        {/* Take up the entire screen */}
      <div className="flex h-screen w-screen overflow  bg-background text-foreground">
        {/* <AppSidebar /> */}
        <AppSidebar/>
        {/* Give content room when the sidebar is visible on ≥md */}
        <main className="flex-1 bg-background">
          <Outlet />
        </main>
      </div>
    </SidebarProvider>
  );
}
