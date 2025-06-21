import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPost } from "../services/api";
import { useSettings } from "../context/SettingsContext";
import "./styles/CreatePost.css";

const CreatePost: React.FC = () => {
  const { t } = useSettings();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await createPost(title, content);
      setError(null);
      navigate("/my-posts");    } catch (err: any) {
      let msg = t('failedToCreatePost');
      if (err.response && err.response.data && err.response.data.message) {
        msg = err.response.data.message;
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (    <div className="create-post-page">
      <h2>{t('createPost')}</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="title">{t('title')}:</label>
          <input
            type="text"
            id="title"
            name="title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="content">{t('content')}:</label>
          <textarea
            id="content"
            name="content"
            value={content}
            onChange={e => setContent(e.target.value)}
            required
          ></textarea>
        </div>
        <button type="submit" disabled={loading}>
          {loading ? t('creating') : t('createPost')}
        </button>
      </form>
    </div>
  );
};

export default CreatePost;