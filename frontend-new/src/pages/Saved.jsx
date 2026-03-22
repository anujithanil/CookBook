import React, { useState, useEffect } from "react";
import RecipeBox from "../components/RecipeBox";

const Saved = () => {
  const [savedRecipe, updateSavedRecipies] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/load_saved_recipe", {
      method: "GET",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        updateSavedRecipies(data.Recipies);
      })
      .catch((err) => console.error(err));
  }, []);

  return (
    <ul>
      {savedRecipe.map((recipe) => (
        <RecipeBox key={recipe.id} {...recipe} />
      ))}
    </ul>
  );
};

export default Saved;