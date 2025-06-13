import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ListingDetails from "./pages/ListingDetails";
import AddListing from "./pages/AddListing";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/listings/:id" element={<ListingDetails />} />
        <Route
          path="/add-listing"
          element={
            <ProtectedRoute>
              <AddListing />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Layout>
  );
}
