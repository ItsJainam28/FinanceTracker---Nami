// src/components/DebugSidebar.tsx
"use client";

import * as React from "react";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarRail,
  SidebarProvider,
} from "@/components/ui/sidebar";

export function DebugSidebar() {
  return (
    <SidebarProvider>
      <Sidebar
        collapsible="icon"
        className="bg-gray-800 text-white border-r border-gray-600"
      >
        <SidebarHeader>
          <div className="p-4">Header</div>
        </SidebarHeader>
        <SidebarContent>
          <div className="p-4 border-b border-gray-600">Content</div>
        </SidebarContent>
        <SidebarFooter>
          <div className="p-4 border-t border-gray-600">Footer</div>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
    </SidebarProvider>
  );
}
