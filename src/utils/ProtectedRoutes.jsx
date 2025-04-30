import { useState, useEffect } from "react";
import { Outlet, Navigate } from "react-router-dom";
import useAuthStore from "../store/authStore";
import { authService } from "../api/apiService";

const ProtectedRoutes = () => {
  const { isAuthenticated, initAuth } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    const validateAuth = async () => {
      setIsLoading(true);
      
      // First check if we have a token
      if (!authService.isAuthenticated()) {
        setIsValid(false);
        setIsLoading(false);
        return;
      }
      
      // Initialize auth state from the store
      await initAuth();
      
      // If we're authenticated after initialization, we're good to go
      setIsValid(isAuthenticated);
      setIsLoading(false);
    };

    validateAuth();
  }, [initAuth, isAuthenticated]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-jasper-600"></div>
      </div>
    );
  }

  // If authentication is valid, render the protected route
  return isValid ? <Outlet /> : <Navigate to="/login" />;
};

export default ProtectedRoutes;

