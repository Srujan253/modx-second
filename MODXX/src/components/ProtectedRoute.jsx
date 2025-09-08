import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login", { replace: true });
    }
  }, [user, loading, navigate]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <div className="flex flex-col items-center">
          <svg
            className="animate-spin h-10 w-10 text-orange-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <p className="mt-4 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (
    roles &&
    (!user.roles || !roles.some((role) => user.roles.includes(role)))
  ) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-4 text-center">
        <h1 className="text-4xl font-bold mb-4">Access Denied</h1>
        <p className="text-lg text-gray-400">
          You do not have the required permissions to view this page.
        </p>
        <button
          onClick={() => navigate("/")}
          className="mt-6 bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg transition duration-200"
        >
          Go Home
        </button>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
