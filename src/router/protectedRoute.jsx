import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const name = localStorage.getItem("name"); // or token
  const token = localStorage.getItem("token"); // if you have token

  if (!token) {
    return <Navigate to="/" replace />;
  }

  return children;
}
