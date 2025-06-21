import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { getAllPosts, createComment } from '../services/api';
import { Post, Comment } from '../types';
import { AuthContext } from '../context/AuthContext';
import '../pages/styles/PostDetail.css';

const PostDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useContext(AuthContext);
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [commentContent, setCommentContent] = useState('');
  const [commentUserName, setCommentUserName] = useState('');

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const posts = await getAllPosts();
        const selectedPost = posts.find((p) => p.id === Number(id));
        if (selectedPost) {
          setPost(selectedPost);
        } else {
          setError('Post not found');
        }
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch post');
        setLoading(false);
      }
    };
    fetchPost();
  }, [id]);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentContent || (!user && !commentUserName)) return;
    try {
      await createComment(commentContent, Number(id), user ? undefined : commentUserName);
      setCommentContent('');
      setCommentUserName('');
      // Refresh post data
      const posts = await getAllPosts();
      const selectedPost = posts.find((p) => p.id === Number(id));
      if (selectedPost) setPost(selectedPost);
    } catch (err) {
      setError('Failed to add comment');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error || !post) return <div>{error || 'Post not found'}</div>;

  return (
    <div className="container">
      <h1>{post.title}</h1>
      <p>{post.content}</p>
      <p>By {post.author.username}</p>
      <h2>Comments</h2>
      <div className="comments">
        {post.comments.map((comment) => (
          <div key={comment.id} className="comment">
            <p>{comment.content}</p>
            <p>By {comment.userName || comment.authorId}</p>
            {/* TODO: Students - Add delete comment button for post owner or admin */}
          </div>
        ))}
      </div>
      <form onSubmit={handleCommentSubmit} className="comment-form">
        <textarea
          value={commentContent}
          onChange={(e) => setCommentContent(e.target.value)}
          placeholder="Write a comment..."
          required
        />
        {!user && (
          <input
            type="text"
            value={commentUserName}
            onChange={(e) => setCommentUserName(e.target.value)}
            placeholder="Your name"
            required
          />
        )}
        <button type="submit">Add Comment</button>
      </form>
    </div>
  );
};

export default PostDetail;

// TODO: Students - Enhance the PostDetail page with the following:
// 1. Add edit/delete post functionality for the post author
// 2. Add delete comment functionality for post owner or admin
// 3. Improve comment form validation and error handling
// 4. Add loading states for comment submission
