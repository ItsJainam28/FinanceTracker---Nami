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
      isActive: true,
    },
    {
      title: "Budgets",
      url: "/budgets",
      icon: WalletIcon,
    },
    {
      title: "Categories",
      url: "/categories",
      icon: ListIcon,
    },
    {
      title: "Expenses",
      url: "/expenses",
      icon: ClipboardListIcon,
      items: [
        {
          title: "Transactions",
          url: "/expenses",
        },
        {
          title: "Add Expense",
          url: "/expenses/new",
        },
      ],
    },
    {
      title: "Scheduled",
      url: "/scheduled-expenses",
      icon: CalendarCheckIcon,
      items: [
        {
          title: "All Scheduled",
          url: "/scheduled-expenses",
        },
        {
          title: "Add Scheduled",
          url: "/scheduled-expenses/new",
        },
      ],
    },
  ]
  