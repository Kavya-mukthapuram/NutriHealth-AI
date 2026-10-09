import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Link,
} from "react-router-dom";

import Login from "./pages/login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import HealthProfile from "./pages/HealthProfile";
import FoodDiary from "./pages/FoodDiary";
import Symptoms from "./pages/Symptoms";
import BloodTests from "./pages/BloodTests";
import NutritionAI from "./pages/NutritionAI";

import { supabase } from "./lib/supabase";
import { useEffect, useState } from "react";

function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] =
    useState(true);

  const [loggedIn, setLoggedIn] =
    useState(false);

  useEffect(() => {
    checkAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setLoggedIn(!!session);
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function checkAuth() {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    setLoggedIn(!!session);
    setLoading(false);
  }

  if (loading) {
    return <p>Loading...</p>;
  }

  return loggedIn ? (
    <>
      <Navbar />
      {children}
    </>
  ) : (
    <Navigate to="/login" replace />
  );
}

function Navbar() {
  async function logout() {
    await supabase.auth.signOut();
  }

  return (
    <nav className="navbar">
      <h2>NutriHealth AI</h2>

      <div>
        <Link to="/dashboard">
          Dashboard
        </Link>

        <Link to="/profile">
          Health Profile
        </Link>

        <Link to="/food-diary">
          Food Diary
        </Link>

        <Link to="/nutrition-ai">
  Nutrition AI
</Link>        

        <Link to="/symptoms">
         Symptoms
          </Link>

          <Link to="/blood-tests">
            Blood Tests
          </Link>

        <button onClick={logout}>
          Logout
        </button>
      </div>
    </nav>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <Navigate
              to="/dashboard"
              replace
            />
          }
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <HealthProfile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/food-diary"
          element={
            <ProtectedRoute>
              <FoodDiary />
            </ProtectedRoute>
          }
        />

        <Route
  path="/nutrition-ai"
  element={
    <ProtectedRoute>
      <NutritionAI />
    </ProtectedRoute>
  }
/>

        <Route
  path="/symptoms"
  element={
    <ProtectedRoute>
      <Symptoms />
    </ProtectedRoute>
  }
/> 


<Route
  path="/blood-tests"
  element={
    <ProtectedRoute>
      <BloodTests />
    </ProtectedRoute>
  }
/>

      </Routes>
    </BrowserRouter>
  );
}