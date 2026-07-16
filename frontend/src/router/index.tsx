import { createBrowserRouter } from "react-router-dom";
import Login from "../pages/Login";
import Register from "../pages/Register";
import ForgotPassword from "../pages/ForgotPassword";
import ChatPage from "../pages/ChatPage";
import ProtectedRoute from "../components/ProtectedRoute";

export const router = createBrowserRouter([
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },
  { path: "/forgot-password", element: <ForgotPassword /> },
  {
    element: <ProtectedRoute />,
    children: [
      { path: "/", element: <ChatPage /> },
      { path: "/chat/:chatId", element: <ChatPage /> },
    ],
  },
]);
