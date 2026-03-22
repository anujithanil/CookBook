import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBookmark, faPencil, faTrash } from "@fortawesome/free-solid-svg-icons";
import { Link, useLocation } from "react-router-dom";

const RecipeBox = ({ id, title, photo_url, onDelete }) => {
  const [saved, updateSave] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(title);
  const [editIngredients, setEditIngredients] = useState("");
  const [editPreparation, setEditPreparation] = useState("");
  const [editPhoto, setEditPhoto] = useState(null);

  const location = useLocation();

  const hideDelete =
    location.pathname === "/saved" || location.pathname === "/home";

  const hideEdit =
    location.pathname === "/saved" || location.pathname === "/home";

  
  useEffect(() => {
    fetch(`/api/check_saved?id=${id}`, {
      method: "GET",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.Result === 1) {
          updateSave(true);
        }
      })
      .catch((err) => console.error(err));
  }, [id]);

  
  const toggleSave = async () => {
    if (!saved) {
      const res = await fetch("/api/saverecipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ rec_id: id }),
      });

      const data = await res.json();

      if (data.msg === "saved") {
        updateSave(true);
      }
    } else {
      const res = await fetch("/api/unsaverecipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ rec_id: id }),
      });

      const data = await res.json();

      if (data.msg === "unsaved") {
        updateSave(false);
      }
    }
  };

 
  const handleEditSave = async () => {
  const formData = new FormData();
  formData.append("rec_id", id);
  formData.append("recipeTitle", editTitle);
  formData.append("ingredients", editIngredients);
  formData.append("preparation", editPreparation);

  if (editPhoto) formData.append("photo", editPhoto);

  const res = await fetch("/api/edit_recipe", {
    method: "POST",
    body: formData,
    credentials: "include",
  });

  const data = await res.json();

  if (res.ok) {
    setIsEditing(false);
    setEditPhoto(null);
    window.location.reload(); 
  } 
  else {
    alert(data.error || "Error updating recipe");
  }
};
  const handleEditClick = async () => {
    const res = await fetch(`/api/view_current_recipe?id=${id}`);
    const data = await res.json();

    const recipe = data.Recipe;

    setEditTitle(recipe.title);
    setEditIngredients(recipe.ingredients);
    setEditPreparation(recipe.preparation);

    setIsEditing(true);
  };
  
  if (isEditing) {
    return (
      <div className="h-70 w-70 p-4 m-3 border rounded-lg shadow-2xl">
        <input
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          className="border p-1 w-full mb-2"
        />

        <textarea
          value={editIngredients}
          onChange={(e) => setEditIngredients(e.target.value)}
          className="border p-1 w-full mb-2"
          placeholder="Ingredients"
        />

        <textarea
          value={editPreparation}
          onChange={(e) => setEditPreparation(e.target.value)}
          className="border p-1 w-full mb-2"
          placeholder="Preparation"
        />

        <input
          type="file"
          onChange={(e) => setEditPhoto(e.target.files[0])}
          className="mb-2"
        />

        <button
          className="bg-green-500 text-white px-2 py-1 mt-2"
          onClick={handleEditSave}
        >
          Save
        </button>

        <button
          className="bg-gray-400 text-white px-2 py-1 mt-2 ml-2"
          onClick={() => setIsEditing(false)}
        >
          Cancel
        </button>
      </div>
    );
  }

  
 return (
  <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden w-64 relative">

    
    {photo_url ? (
      <img
        src={photo_url}
        alt={title}
        className="h-40 w-full object-cover"
      />
    ) : (
      <div className="h-40 flex items-center justify-center bg-gray-100 text-gray-400">
        No Image
      </div>
    )}

   
    <div className="p-4 text-center">

      <h2 className="text-lg font-semibold text-green-600 truncate">
        {title}
      </h2>

      <Link to={`/view/${id}`}>
        <button className="mt-3 bg-green-500 hover:bg-green-600 text-white px-4 py-1 rounded-lg text-sm transition">
          View
        </button>
      </Link>
    </div>

    
    <div className="absolute top-2 right-2 flex gap-2">

     
      {!hideEdit && (
        <FontAwesomeIcon
          icon={faPencil}
          className="text-white bg-black/50 p-2 rounded-full cursor-pointer hover:bg-black/70 transition"
          onClick={handleEditClick}
        />
      )}

      
      <FontAwesomeIcon
        icon={faBookmark}
        className={`p-2 rounded-full cursor-pointer transition ${
          saved
            ? "bg-green-500 text-white"
            : "bg-white text-gray-400"
        }`}
        onClick={toggleSave}
      />
    </div>

    
    {!hideDelete && (
      <FontAwesomeIcon
        icon={faTrash}
        className="absolute bottom-2 left-2 text-red-500 cursor-pointer hover:text-red-600 transition"
        onClick={onDelete}
      />
    )}
  </div>
);
};

export default RecipeBox;