import React, { useState, useEffect } from "react";
import RecipeBox from "../components/RecipeBox";

const Home = () => {
  const [allRecipe, updateRecipies] = useState([]);

  useEffect(() => {
    fetch("/api/load_all_recipe", {
      method: "GET",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        updateRecipies(data.Recipies);
      })
      .catch((err) => console.error(err));
  }, []);

  return (
    <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-6 justify-items-center">
      {allRecipe.map((recipe) => (
        <RecipeBox key={recipe.id} {...recipe} />
      ))}
    </ul>
  );
};

export default Home;