import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import ViewComponent from "../components/ViewComponent";
import CommentBox from "../components/CommentBox";

const View = () => {
  const { id } = useParams();

  const [currentRecipe, updateRecipies] = useState({
    id: -1,
    title: "",
    photo_url: "",
    username: "",
    ingredients: "",
    preparation: "",
  });

  const [Comments, loadCommentBox] = useState([]);

  useEffect(() => {
    fetch(`/api/view_current_recipe?id=${id}`, {
      method: "GET",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        updateRecipies(data.Recipe);
        loadCommentBox(data.Comments);
      })
      .catch((err) => console.error(err));
  }, [id]);

  return (
    <div>
      <ViewComponent
        id={currentRecipe.id}
        title={currentRecipe.title}
        photo_url={currentRecipe.photo_url}
        username={currentRecipe.username}
        ingredients={currentRecipe.ingredients}
        preparation={currentRecipe.preparation}
        onCommentAdded={(newComment) => {
          loadCommentBox((prev) => [...prev, newComment]);
        }}
      />
    </div>
  );
};

export default View;