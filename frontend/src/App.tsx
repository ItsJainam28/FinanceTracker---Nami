/* src/App.tsx */
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import LoginPage from "@/pages/Auth/LoginPage";
import SignupPage from "@/pages/Auth/SignupPage";
import DashboardPage from "@/pages/Dashboard/DashboardPage";
import BudgetsPage from "@/pages/Budgets/BudgetsPage";
import ExpensesPage from "@/pages/Expenses/ExpensesPage";
import CategoriesPage from "@/pages/Categories/CategoriesPage";
import ScheduledExpensesPage from "@/pages/ScheduledExpenses/ScheduledExpensesPage";
import ProtectedRoute from "@/components/common/ProtectedRoute";
import AppShell from "@/layouts/AppShell";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AddExpensePage } from "./pages/Expenses/AddExpensePage";
import { Toaster } from "sonner";
import AddScheduledExpensePage from "@/pages/ScheduledExpenses/AddScheduleExpensePage";
import { ChatPage } from "./pages/Chat/ChatPage";
import { ThemeProvider } from "./components/theme-provider";
const queryClient = new QueryClient();
export default function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
    <QueryClientProvider client={queryClient}>
    <Router>
      <Routes>
        {/* public */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* protected area wrapped once */}
        <Route
          element={
            <ProtectedRoute>
              <AppShell />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/budgets" element={<BudgetsPage />} />
          <Route path="/expenses" element={<ExpensesPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route
            path="/scheduled-expenses"
            element={<ScheduledExpensesPage />}
          />
          <Route path="/expenses/new" element={<AddExpensePage/>} />
          <Route path="/chat/:sessionId" element={<ChatPage/>} />
        <Route path="/scheduled-expenses/new" element={<AddScheduledExpensePage />} />
          
        </Route>
      </Routes>
    </Router>
    <Toaster position="top-right" richColors />
    </QueryClientProvider>
    </ThemeProvider>
  );
}

