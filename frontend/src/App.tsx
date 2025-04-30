import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/Auth/LoginPage';
import SignupPage from './pages/Auth/SignupPage';
import DashboardPage from "@/pages/Dashboard/DashboardPage";
import ProtectedRoute from "@/components/common/ProtectedRoute";
import BudgetsPage from './pages/Budgets/BudgetsPage';
import ExpensesPage from './pages/Expenses/ExpensesPage';
import CategoriesPage from './pages/Categories/CategoriesPage';
import ScheduledExpensesPage from './pages/ScheduledExpenses/ScheduledExpensesPage';
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/budgets"
          element={
            <ProtectedRoute>
              <BudgetsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/expenses"
          element={
            <ProtectedRoute>
              <ExpensesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/categories"
          element={
            <ProtectedRoute>
              <CategoriesPage />
            </ProtectedRoute>
          }
        />
          <Route
          path="/scheduled-expenses"
          element={
            <ProtectedRoute>
              <ScheduledExpensesPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
