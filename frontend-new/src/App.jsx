import React from "react";
import { Routes, Route, BrowserRouter as Router, useLocation, Navigate } from "react-router-dom";

import Home from './pages/Home.jsx'
import NavBar from './components/NavBar.jsx'
import View from './pages/View.jsx'
import MyRecipe from './pages/MyRecipe.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Saved from './pages/Saved.jsx'
import "./App.css";

const AppContent = () => {
  const location = useLocation();

  const hideNavBar =
    location.pathname === "/" || location.pathname === "/register";

  return (
    <div>
      {!hideNavBar && <NavBar />}

      <Routes>
        {/* Default route */}
        <Route path="/" element={<Login />} />

        {/* Main pages */}
        <Route path="/home" element={<Home />} />
        <Route path="/saved" element={<Saved />} />
        <Route path="/myrecipe" element={<MyRecipe />} />
        <Route path="/view/:id" element={<View />} />

        {/* Auth */}
        <Route path="/register" element={<Register />} />

        {/* Catch invalid routes */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;