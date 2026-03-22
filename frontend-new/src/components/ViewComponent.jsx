import React, { useState, useEffect } from "react";
import CommentBox from "../components/CommentBox";

const ViewComponent = ({
  id,
  title,
  photo_url,
  username,
  ingredients,
  preparation,
}) => {

  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);

 
  const loadComments = async () => {
    const res = await fetch(`/api/view_current_recipe?id=${id}`, {
      credentials: "include",
    });
    const data = await res.json();
    setComments(data.Comments);
  };

  useEffect(() => {
    loadComments();
  }, [id]);

  
  const uploadComment = async () => {
    if (!comment.trim()) return;

    const res = await fetch("/api/upload_comment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ comment, id }),
    });

    if (!res.ok) {
      console.error(await res.text());
      return;
    }

    setComment("");
    loadComments();
  };

  return (
    <div className="max-w-4xl mx-auto p-6">

      
      <div className="rounded-2xl overflow-hidden shadow-lg">
        <img
          src={photo_url}
          alt={title}
          className="w-full h-80 object-cover"
        />
      </div>

     
      <h1 className="text-3xl font-bold text-green-600 mt-6 text-center">
        {title}
      </h1>

      
      <div className="bg-white rounded-2xl shadow-md p-6 mt-6">

        <h2 className="text-xl font-semibold text-green-500 mb-2">
          Ingredients
        </h2>
        <p className="text-gray-700 leading-relaxed mb-4">
          {ingredients}
        </p>

        <h2 className="text-xl font-semibold text-green-500 mb-2">
          Preparation
        </h2>
        <p className="text-gray-700 leading-relaxed">
          {preparation}
        </p>

        <p className="text-sm text-gray-400 mt-4">
          Recipe by: {username}
        </p>
      </div>

     
      <div className="bg-white rounded-2xl shadow-md p-6 mt-6">

        <h2 className="text-xl font-semibold text-green-500 mb-4">
          Comments
        </h2>

        
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Write a comment..."
            className="flex-1 border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-green-400"
          />

          <button
            onClick={uploadComment}
            className="bg-green-500 text-white px-4 rounded-lg hover:bg-green-600 transition"
          >
            Post
          </button>
        </div>

       
        <ul className="space-y-3 max-h-60 overflow-y-auto">
          {comments.map((c, index) => (
            <CommentBox
              key={index}
              username={c.username}
              comment={c.comment}
            />
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ViewComponent;