import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import Auth from "../components/Auth";
import ChatLayout from "../components/ChatLayout";
import React from 'react'

// check auth cookie quickly on client
function isAuthenticated() {
  try {
    return document.cookie.split(';').some(c => c.trim().startsWith('auth='))
  } catch (e) {
    return false
  }
}

const ProtectedLayout: React.FC = () => {
  if (!isAuthenticated()) return <Navigate to="/auth" replace />
  return <Outlet />
}

const router = createBrowserRouter([
  { path: 'auth', element: <Auth /> },
  {
    element: <ProtectedLayout />,
    children: [
      {
        path: '/',
        element: <ChatLayout />,
        children: [
          
          { path: '*', element: <Navigate to="/" replace /> },
        ]
      },
    ],
  },
]);

export default router;