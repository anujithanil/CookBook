const CommentBox = ({ comment, username }) => {
  return (
    <li className="bg-gray-100 p-3 rounded-lg">
      <p className="text-sm text-gray-500">{username}</p>
      <p className="text-gray-800">{comment}</p>
    </li>
  );
};

export default CommentBox;