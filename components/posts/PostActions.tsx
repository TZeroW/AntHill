'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePostInteractions } from '../../lib/hooks/usePostInteractions';
import type { Post } from '../../lib/types';

/**
 * PostActions — reemplaza postInteractions.js.
 * Botones de like, comentario y repost con animación.
 */

interface PostActionsProps {
  post: Post;
  currentUser?: { name: string } | null;
}

export default function PostActions({ post, currentUser }: PostActionsProps) {
  const { toggleLike, toggleRepost } = usePostInteractions();
  const [likesCount, setLikesCount] = useState(post.likes_count || 0);
  const [repostsCount, setRepostsCount] = useState(post.reposts_count || 0);
  const [liked, setLiked] = useState(false);
  const [reposted, setReposted] = useState(false);
  const [animating, setAnimating] = useState<string | null>(null);

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!currentUser) {
      alert('Debes iniciar sesión para interactuar.');
      return;
    }
    try {
      const result = await toggleLike(post.id, currentUser.name);
      setLikesCount(result.count);
      setLiked(result.action === 'added');
      setAnimating('like');
      setTimeout(() => setAnimating(null), 200);
    } catch (err) {
      console.error('Error al procesar like:', err);
    }
  };

  const handleRepost = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!currentUser) {
      alert('Debes iniciar sesión para interactuar.');
      return;
    }
    try {
      const result = await toggleRepost(post.id, currentUser.name);
      setRepostsCount(result.count);
      setReposted(result.action === 'added');
      setAnimating('repost');
      setTimeout(() => setAnimating(null), 200);
    } catch (err) {
      console.error('Error al procesar repost:', err);
    }
  };

  return (
    <>
      <button
        className="action-btn vote-btn"
        onClick={handleLike}
        style={{
          color: liked ? 'var(--color-primary, #ffa500)' : undefined,
          transform: animating === 'like' ? 'scale(1.2)' : 'scale(1)',
          transition: 'transform 0.2s',
        }}
      >
        <i className={`bi ${liked ? 'bi-caret-up-fill' : 'bi-caret-up-fill'}`}></i>{' '}
        <span>{likesCount}</span>
      </button>
      <Link
        href={`/post/${post.id}`}
        className="action-btn comment-btn"
        onClick={(e) => e.stopPropagation()}
      >
        <i className="bi bi-chat-left"></i> <span>{post.comments_count || 0}</span>
      </Link>
      <button
        className="action-btn repost-btn"
        onClick={handleRepost}
        style={{
          color: reposted ? '#00ba7c' : undefined,
          transform: animating === 'repost' ? 'scale(1.2)' : 'scale(1)',
          transition: 'transform 0.2s',
        }}
      >
        <i className="bi bi-arrow-left-right"></i> <span>{repostsCount}</span>
      </button>
    </>
  );
}
