import React, { useEffect, useState } from "react";
import RecipeBox from "../components/RecipeBox";

const MyRecipe = () => {
  const [myRecipies, updateRecipies] = useState([]);
  const [recipeTitle, setRecipeTitle] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [preparation, setPreparation] = useState("");
  const [photo, setPhoto] = useState(null);

  useEffect(() => {
    fetch("/api/load_my_recipe", {
      method: "GET",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        updateRecipies(data.Recipies);
      })
      .catch((err) => console.error(err));
  }, []);

  const uploadRecipe = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("recipeTitle", recipeTitle);
    formData.append("ingredients", ingredients);
    formData.append("preparation", preparation);
    if (photo) formData.append("photo", photo);

    const res = await fetch("/api/myrecipe", {
      method: "POST",
      body: formData,
      credentials: "include",
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("SERVER ERROR:", text);
      return;
    }

    const data = await res.json();

    if (res.ok) {
      updateRecipies([
        ...myRecipies,
        { id: data.id, title: data.title, photo_url: data.photo_url },
      ]);

      setRecipeTitle("");
      setIngredients("");
      setPreparation("");
      setPhoto(null);

      // reset file input (JS version)
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = "";
    } else {
      alert(data.msg || "Error uploading recipe");
    }
  };

  const deleteRecipe = async (id) => {
    updateRecipies(myRecipies.filter((recipe) => recipe.id !== id));

    const res = await fetch("/api/delete_recipe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ rec_id: id }),
    });

    const data = await res.json();

    if (data.msg === "deleted") {
      console.log("DELETED");
    }
  };

  return (
    <div className="flex justify-between">
      <form
        onSubmit={uploadRecipe}
        className="flex flex-col gap-3 p-10 border border-amber-50 shadow-2xl m-3 max-w-fit"
      >
        <h1 className="text-green-500 font-bold text-center text-2xl">
          Share Your Recipe
        </h1>

        <input
          type="text"
          value={recipeTitle}
          onChange={(e) => setRecipeTitle(e.target.value)}
          placeholder="Dish Name"
          required
          className="border p-1 rounded-xl"
        />

        <input
          type="text"
          value={ingredients}
          onChange={(e) => setIngredients(e.target.value)}
          placeholder="Ingredients"
          required
          className="border p-1 rounded-xl"
        />

        <textarea
          value={preparation}
          onChange={(e) => setPreparation(e.target.value)}
          placeholder="Preparation"
          required
          className="border p-1 rounded-xl h-30"
        />

        <input
          type="file"
          accept="image/*"
          onChange={(e) => setPhoto(e.target.files[0] || null)}
          className="border p-1 rounded-xl"
        />

        <button type="submit" className="bg-green-400 text-white">
          Submit
        </button>
      </form>

      <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-6 justify-items-center">
        {myRecipies.map((recipe) => (
          <RecipeBox
            key={recipe.id}
            {...recipe}
            onDelete={() => deleteRecipe(recipe.id)}
          />
        ))}
      </ul>
    </div>
  );
};

export default MyRecipe;