import { Link } from "react-router-dom";
import { useAuth } from "../../../backend/src/services/AuthContext";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  return (
    <div>
      <nav
        style={{
          display: "flex",
          gap: "1rem",
          padding: "1rem",
          borderBottom: "1px solid #ccc",
        }}
      >
        <Link to="/">Home</Link>
        {user && <Link to="/add-listing">Add Listing</Link>}
        {user ? (
          <>
            <span>Welcome, {user.name}</span>
            <button onClick={logout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </nav>
      <main style={{ padding: "1rem" }}>{children}</main>
    </div>
  );
}
