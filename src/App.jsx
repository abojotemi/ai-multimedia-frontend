import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import Login from "./components/Login";
import Register from "./components/Register";
import Upload from "./components/Upload";
import Settings from "./components/Settings";
import Collection from "./components/Collection";
import MainLayout from "./layouts/MainLayout";
import AuthLayout from "./layouts/AuthLayout";
import ProtectedRoute from "./utils/ProtectedRoutes";
import Dashboard from "./components/Dashboard";
import Search from "./components/Search";
import AIProcessing from "./components/AIProcessing";
import DashboardLayout from "./layouts/DashboardLayout";
import useAuthStore from "./store/authStore";

const App = () => {
  const { isAuthenticated, initAuth } = useAuthStore();
  
  // Initialize auth state on app load
  useEffect(() => {
    const initializeAuth = async () => {
      await initAuth();
    };
    
    initializeAuth();
  }, [initAuth]);

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />
          } />
          <Route path="/register" element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />
          } />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="upload" element={<Upload />} />
            <Route path="ai-processing" element={<AIProcessing />} />
            {/* <Route path="search" element={<Search />} />
            <Route path="collection" element={<Collection />} /> */}
            <Route path="settings" element={<Settings />} />
            {/* <Route path="faq" element={<div>FAQ Page</div>} /> */}
          </Route>
        </Route>
        
        {/* Redirect root to dashboard if authenticated, otherwise to login */}
        <Route path="/" element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
        } />
      </Routes>
    </BrowserRouter>
  );
};

export default App;


