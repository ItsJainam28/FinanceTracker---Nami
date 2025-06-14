"use client";
import * as React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboardIcon,
  WalletIcon,
  ClipboardListIcon,
  CalendarCheckIcon,
  ListIcon,

  LogOutIcon,

} from "lucide-react";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import api from "@/api/axiosInstance";
import logoUrl from "@/assets/nami-logo.svg";
export default function AppSidebar(
  props: React.ComponentProps<typeof Sidebar>
) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [userName, setUserName] = React.useState("User");
  const [userEmail, setUserEmail] = React.useState("user@example.com");
  const [expensesOpen, setExpensesOpen] = React.useState(false);
  const [scheduledOpen, setScheduledOpen] = React.useState(false);

  React.useEffect(() => {
    (async () => {
      const token = localStorage.getItem("token");
      if (!token) return navigate("/login");
      try {
        const { data } = await api.get("/auth/me");
        setUserName(data.firstname ?? "User");
        setUserEmail(data.email ?? "user@example.com");
      } catch (err) {
        console.error(err);
      }
    })();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <Sidebar
      variant="sidebar"
      className="fixed inset-y-0 left-0 z-40 w-72 shrink-0 bg-black text-white shadow-lg"
      {...props}
    >
      {/* ── HEADER ─────────────────────────────────────── */}
      <SidebarHeader className="px-8 py-8 border-b border-gray-700">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="p-0">
              <Link to="/dashboard" className="flex items-center gap-3">
              <img src={logoUrl} alt="Nami Logo" className="h-8 w-auto" />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* ── NAVIGATION ─────────────────────────────────── */}
      <SidebarContent>
        <ScrollArea className="h-full">
          <nav className="space-y-1 px-4 pb-8 pt-6">
            {/* --- Dashboard, Budgets, Categories, Analytics --- */}
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  className={cn(
                    "w-full justify-start gap-4 rounded-lg px-4 py-3 text-base font-medium transition-colors",
                    pathname === "/dashboard"
                      ? "bg-gray-700 text-white"
                      : "hover:bg-gray-800 hover:text-white"
                  )}
                >
                  <Link to="/dashboard">
                    <LayoutDashboardIcon className="h-5 w-5 shrink-0" />
                    Dashboard
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  className={cn(
                    "w-full justify-start gap-4 rounded-lg px-4 py-3 text-base font-medium transition-colors",
                    pathname === "/budgets"
                      ? "bg-gray-700 text-white"
                      : "hover:bg-gray-800 hover:text-white"
                  )}
                >
                  <Link to="/budgets">
                    <WalletIcon className="h-5 w-5 shrink-0" />
                    Budgets
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  className={cn(
                    "w-full justify-start gap-4 rounded-lg px-4 py-3 text-base font-medium transition-colors",
                    pathname === "/categories"
                      ? "bg-gray-700 text-white"
                      : "hover:bg-gray-800 hover:text-white"
                  )}
                >
                  <Link to="/categories">
                    <ListIcon className="h-5 w-5 shrink-0" />
                    Categories
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

      
            </SidebarMenu>

            {/* --- Expenses Dropdown --- */}
            <SidebarMenu>
              <SidebarMenuItem>
                <button
                  onClick={() => setExpensesOpen(!expensesOpen)}
                  className={cn(
                    "w-full flex items-center justify-between gap-4 rounded-lg px-4 py-3 text-base font-medium transition-colors",
                    pathname.startsWith("/expenses")
                      ? "bg-gray-700 text-white"
                      : "hover:bg-gray-800 hover:text-white"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <ClipboardListIcon className="h-5 w-5 shrink-0" />
                    <span>Expenses</span>
                  </div>
                  <span className="ml-auto">{expensesOpen ? "▾" : "▸"}</span>
                </button>
              </SidebarMenuItem>

              {expensesOpen && (
                <div className="pl-10 text-sm space-y-1">
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      className={cn(
                        "w-full justify-start rounded-md px-3 py-2 transition-colors",
                        pathname === "/expenses"
                          ? "bg-gray-700 text-white"
                          : "hover:bg-gray-800 hover:text-white"
                      )}
                    >
                      <Link to="/expenses">Transactions</Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      className={cn(
                        "w-full justify-start rounded-md px-3 py-2 transition-colors",
                        pathname === "/expenses/new"
                          ? "bg-gray-700 text-white"
                          : "hover:bg-gray-800 hover:text-white"
                      )}
                    >
                      <Link to="/expenses/new">Add Expense</Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </div>
              )}
            </SidebarMenu>

            {/* --- Scheduled Dropdown --- */}
            <SidebarMenu>
              <SidebarMenuItem>
                <button
                  onClick={() => setScheduledOpen(!scheduledOpen)}
                  className={cn(
                    "w-full flex items-center justify-between gap-4 rounded-lg px-4 py-3 text-base font-medium transition-colors",
                    pathname.startsWith("/scheduled-expenses")
                      ? "bg-gray-700 text-white"
                      : "hover:bg-gray-800 hover:text-white"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <CalendarCheckIcon className="h-5 w-5 shrink-0" />
                    <span>Scheduled</span>
                  </div>
                  <span className="ml-auto">{scheduledOpen ? "▾" : "▸"}</span>
                </button>
              </SidebarMenuItem>

              {scheduledOpen && (
                <div className="pl-10 text-sm space-y-1">
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      className={cn(
                        "w-full justify-start rounded-md px-3 py-2 transition-colors",
                        pathname === "/scheduled-expenses"
                          ? "bg-gray-700 text-white"
                          : "hover:bg-gray-800 hover:text-white"
                      )}
                    >
                      <Link to="/scheduled-expenses">All Scheduled</Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      className={cn(
                        "w-full justify-start rounded-md px-3 py-2 transition-colors",
                        pathname === "/scheduled-expenses/new"
                          ? "bg-gray-700 text-white"
                          : "hover:bg-gray-800 hover:text-white"
                      )}
                    >
                      <Link to="/scheduled-expenses/new">Add Scheduled</Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </div>
              )}
            </SidebarMenu>
          </nav>
        </ScrollArea>
      </SidebarContent>

      {/* ── FOOTER ─────────────────────────────────────── */}
      <SidebarFooter className="mt-auto px-5 py-6 border-t border-gray-700">
        <div className="flex items-center gap-3 rounded-lg p-3 hover:bg-gray-800">
          <Avatar className="h-9 w-9">
            <AvatarImage src="/avatars/user.jpg" alt="avatar" />
            <AvatarFallback>{userName.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="text-sm leading-tight truncate">
            <p className="font-semibold">{userName}</p>
            <p className="text-gray-400 text-xs truncate">{userEmail}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 py-2 text-sm font-medium text-white shadow transition hover:bg-red-700"
        >
          <LogOutIcon className="h-4 w-4" />
          Logout
        </button>
      </SidebarFooter>
    </Sidebar>
  );
}
