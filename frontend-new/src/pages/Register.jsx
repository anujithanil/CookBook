import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const Register = () => {
  const [userName, displayUserName] = useState("");
  const [password, displayPassword] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userName, password }),
      });

      const data = await res.json();

      if (data.msg === "registered") {
        console.log("Registered successfully, navigating to login");
        navigate("/");
      } else {
        alert(data.msg);
      }
    } catch (err) {
      console.error("Error during registration:", err);
    }
  };

  return (
    <div>
      <h1 className="text-white text-6xl font-bold bg-green-500">
        CookBook.com
      </h1>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col align-center text-center p-5 m-auto mt-3 border border-amber-50 shadow-2xl w-fit h-70"
      >
        <h1 className="text-[20px] font-extrabold text-green-500">
          Register
        </h1>

        <input
          type="text"
          onChange={(e) => displayUserName(e.target.value)}
          value={userName}
          placeholder="enter username"
          className="w-50 border border-gray-400 p-1 m-auto"
        />

        <input
          type="password"
          onChange={(e) => displayPassword(e.target.value)}
          value={password}
          placeholder="enter password"
          className="w-50 border border-gray-400 p-1 m-auto mt-0"
        />

        <button
          type="submit"
          className="bg-green-400 text-amber-50 mb-2"
        >
          Submit
        </button>

        <p>
          Already have an account?
          <Link to="/" className="font-bold text-green-500">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Register;