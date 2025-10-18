import React, { createContext, useContext, useState, ReactNode } from "react";
import { useNavigate } from "react-router-dom";

type ResultsRole = "admin" | "mainAdmin";

interface ResultsAuthContextType {
  resultsUser: ResultsRole | null;
  login: (user: string, pass: string) => Promise<ResultsRole>;
  logout: () => void;
}

const ResultsAuthContext = createContext<ResultsAuthContextType | undefined>(
  undefined
);

// Define the credentials here. In a real app, this would be validated on a backend.
const MOCK_USERS = {
  Admin: "AdminPass", // Password for the regular admin
  MainAdmin: "MainAdminPass", // Password for the main admin
};

export const ResultsAuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [resultsUser, setResultsUser] = useState<ResultsRole | null>(() => {
    // sessionStorage is used to keep the user logged in only for the current tab/session
    return sessionStorage.getItem("resultsUser") as ResultsRole | null;
  });

  const login = async (user: string, pass: string): Promise<ResultsRole> => {
    if (user === "Admin" && pass === MOCK_USERS.Admin) {
      sessionStorage.setItem("resultsUser", "admin");
      setResultsUser("admin");
      return "admin";
    }
    if (user === "MainAdmin" && pass === MOCK_USERS.MainAdmin) {
      sessionStorage.setItem("resultsUser", "mainAdmin");
      setResultsUser("mainAdmin");
      return "mainAdmin";
    }
    throw new Error("Invalid credentials for results access.");
  };

  const logout = () => {
    sessionStorage.removeItem("resultsUser");
    setResultsUser(null);
  };

  return (
    <ResultsAuthContext.Provider value={{ resultsUser, login, logout }}>
      {children}
    </ResultsAuthContext.Provider>
  );
};

export const useResultsAuth = () => {
  const context = useContext(ResultsAuthContext);
  if (!context) {
    throw new Error("useResultsAuth must be used within a ResultsAuthProvider");
  }
  return context;
};
