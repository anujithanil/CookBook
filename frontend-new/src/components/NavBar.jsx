import React from "react";
import { NavLink, useNavigate } from "react-router-dom";

const NavBar = () => {
  const linkStyle = ({ isActive }) =>
    isActive
      ? "px-3 py-3 border-b-2 text-white text-xl"
      : "px-3 py-3 text-white text-xl";

  const navigate = useNavigate();

  async function handleLogout() {
    try {
      const res = await fetch("/api/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (res.ok) {
        navigate("/");
      }
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="bg-green-500 flex justify-between p-3">
      <h1 className="text-white text-6xl ml-1 font-bold">
        CookBook.com
      </h1>

      <ul className="flex gap-2 mt-5">
        <li>
          <NavLink to="/home" className={linkStyle}>
            Home
          </NavLink>
        </li>

        <li>
          <NavLink to="/saved" className={linkStyle}>
            Saved
          </NavLink>
        </li>

        <li>
          <NavLink to="/myrecipe" className={linkStyle}>
            Your Recipies
          </NavLink>
        </li>

        <li className="px-3 text-white text-xl">
          <button onClick={handleLogout}>Logout</button>
        </li>
      </ul>
    </div>
  );
};

export default NavBar;