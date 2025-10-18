import React from "react";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { DataProvider } from "./context/DataContext";
import { HiddenAuthProvider } from "./context/HiddenAuthContext";
import {
  ResultsAuthProvider,
  useResultsAuth,
} from "./context/ResultsAuthContext";

import LoginPage from "./pages/Login";
import VotePage from "./pages/Vote";
import VoteConfirmationPage from "./pages/VoteConfirmation";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminCandidates from "./pages/admin/AdminCandidates";
import AdminVoters from "./pages/admin/AdminVoters";
import AdminResults from "./pages/admin/AdminResults";
import DiscreetResultsDisplay from "./pages/admin/DiscreetResultsDisplay";
import AdminResultsAuth from "./pages/admin/AdminResultsAuth";
import HiddenLoginPage from "./pages/HiddenLogin";
import DiscreetLoginPage from "./pages/DiscreetLogin";
import DiscreetResultsPage from "./pages/DiscreetResults";

const App: React.FC = () => {
  return (
    // CORRECTED ORDER: AuthProvider must be on the outside.
    <AuthProvider>
      <DataProvider>
        <HiddenAuthProvider>
          <ResultsAuthProvider>
            <HashRouter>
              <div className="bg-emerald-50 min-h-screen font-sans">
                <Routes>
                  <Route path="/login" element={<LoginPage />} />
                  <Route
                    path="/vote"
                    element={
                      <VoterProtectedRoute>
                        <VotePage />
                      </VoterProtectedRoute>
                    }
                  />
                  <Route
                    path="/confirmation"
                    element={
                      <VoterProtectedRoute>
                        <VoteConfirmationPage />
                      </VoterProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin"
                    element={
                      <AdminProtectedRoute>
                        <AdminLayout />
                      </AdminProtectedRoute>
                    }
                  >
                    <Route
                      index
                      element={<Navigate to="dashboard" replace />}
                    />
                    <Route path="dashboard" element={<AdminDashboard />} />
                    <Route path="candidates" element={<AdminCandidates />} />
                    <Route path="voters" element={<AdminVoters />} />
                    <Route path="results-auth" element={<AdminResultsAuth />} />
                    <Route
                      path="results"
                      element={
                        <ResultsProtectedRoute requiredRole="admin">
                          <AdminResults />
                        </ResultsProtectedRoute>
                      }
                    />
                    <Route
                      path="discreet-results-display"
                      element={
                        <ResultsProtectedRoute requiredRole="mainAdmin">
                          <DiscreetResultsDisplay />
                        </ResultsProtectedRoute>
                      }
                    />
                    <Route
                      path="discreet-results"
                      element={
                        <ResultsProtectedRoute requiredRole="mainAdmin">
                          <DiscreetResultsPage />
                        </ResultsProtectedRoute>
                      }
                    />
                  </Route>
                  <Route path="/hidden-login" element={<HiddenLoginPage />} />
                  <Route
                    path="/discreet-login"
                    element={<DiscreetLoginPage />}
                  />
                  <Route path="/" element={<RootRedirect />} />
                </Routes>
              </div>
            </HashRouter>
          </ResultsAuthProvider>
        </HiddenAuthProvider>
      </DataProvider>
    </AuthProvider>
  );
};

// --- PROTECTED ROUTE COMPONENTS ---
// These components control access to different parts of the app based on login status.

const ResultsProtectedRoute: React.FC<{
  children: React.ReactElement;
  requiredRole: "admin" | "mainAdmin";
}> = ({ children, requiredRole }) => {
  const { resultsUser } = useResultsAuth();
  if (resultsUser === "mainAdmin" || resultsUser === requiredRole) {
    return children;
  }
  return <Navigate to="/admin/results-auth" replace />;
};

const RootRedirect: React.FC = () => {
  const { user } = useAuth();
  if (user?.role === "admin") return <Navigate to="/admin" replace />;
  if (user?.role === "voter") return <Navigate to="/vote" replace />;
  return <Navigate to="/login" replace />;
};

const AdminProtectedRoute: React.FC<{ children: React.ReactElement }> = ({
  children,
}) => {
  const { user } = useAuth();
  if (user?.role !== "admin") return <Navigate to="/login" replace />;
  return children;
};

const VoterProtectedRoute: React.FC<{ children: React.ReactElement }> = ({
  children,
}) => {
  const { user } = useAuth();
  if (user?.role !== "voter") return <Navigate to="/login" replace />;
  return children;
};

export default App;
