import {
  LayoutDashboardIcon,
  WalletIcon,
  ListIcon,
  ClipboardListIcon,
  CalendarCheckIcon,
} from "lucide-react"

export const navItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboardIcon,
  },
  {
    title: "Budgets",
    url: "/budgets",
    icon: WalletIcon,
  },
  {
    title: "Expenses",
    url: "/expenses",
    icon: ClipboardListIcon,
  },
  {
    title: "Scheduled",
    url: "/scheduled-expenses",
    icon: CalendarCheckIcon,
  },
  {
    title: "Categories",
    url: "/categories",
    icon: ListIcon,
  },
]