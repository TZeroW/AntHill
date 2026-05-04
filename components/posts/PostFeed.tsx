'use client';

import React from 'react';
import PostCard from './PostCard';
import type { Post } from '../../lib/types';

/**
 * PostFeed — renderiza una lista de posts.
 * Reemplaza la función renderizarPosts() de posts.js.
 */

interface PostFeedProps {
  posts: Post[];
  loading?: boolean;
  error?: string | null;
  emptyMessage?: string;
  currentUser?: { name: string } | null;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export default function PostFeed({
  posts,
  loading,
  error,
  emptyMessage = 'No se encontraron resultados.',
  currentUser,
  onEdit,
  onDelete,
}: PostFeedProps) {
  if (loading) {
    return (
      <div id="feed">
        <p style={{ textAlign: 'center', padding: 20, color: '#666' }}>
          Cargando colonia...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div id="feed">
        <p style={{ color: 'red', textAlign: 'center', padding: 20 }}>
          {error}
        </p>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div id="feed">
        <p style={{ textAlign: 'center', padding: 20, color: '#666' }}>
          {emptyMessage}
        </p>
      </div>
    );
  }

  return (
    <div id="feed">
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          currentUser={currentUser}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
