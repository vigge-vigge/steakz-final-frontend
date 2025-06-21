import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { getMyPosts, deletePost } from '../services/api';
import { Post } from '../types';
import '../pages/styles/Home.css';

const MyPosts: React.FC = () => {
  const { user } = useContext(AuthContext);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      if (user) {
        try {
          const data = await getMyPosts();
          setPosts(data);
        } catch (err) {
          setPosts([]);
        }
      }
      setLoading(false);
    };
    fetchPosts();
  }, [user]);

  const handleDelete = async (postId: number) => {
    if (!window.confirm('Är du säker på att du vill ta bort detta inlägg?')) return;
    try {
      await deletePost(postId);
      setPosts(posts.filter(post => post.id !== postId));
    } catch (err: any) {
      setError('Misslyckades med att ta bort inlägg');
    }
  };

  if (!user) return <div>Var god logga in för att se dina inlägg.</div>;
  if (loading) return <div>Laddar...</div>;

  return (
    <div className="my-posts-page">
      <h2>Mina inlägg</h2>
      {error && <p className="error">{error}</p>}
      <div className="post-list">
        {posts.length === 0 ? (
          <p>Du har inte skapat några inlägg än.</p>
        ) : (
          posts.map(post => (
            <div key={post.id} className="post-card">
              <h2>{post.title}</h2>
              <p>{post.content}</p>
              {post.comments.length > 0 && (
                <p className="first-comment">
                  Första kommentaren: {post.comments[0].content} av {post.comments[0].userName || post.comments[0].authorId}
                </p>
              )}
              <button onClick={() => handleDelete(post.id)} style={{marginTop: '10px', background: '#dc3545'}}>
                Ta bort
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MyPosts;
