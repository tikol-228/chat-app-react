import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import Auth from "../components/Auth";
import ChatLayout from "../components/ChatLayout";

const ProtectedLayout = () => (
    <Outlet />
);

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