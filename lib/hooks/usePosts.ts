'use client';

import { useState, useCallback } from 'react';
import { postsApi } from '../api';
import type { Post } from '../types';

/**
 * Hook para manejar posts — reemplaza posts.js y postManager.js.
 */
export function usePosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargarPosts = useCallback(async (colonia?: string) => {
    setLoading(true);
    setError(null);
    try {
      const { posts: data } = await postsApi.getPosts(colonia);
      setPosts(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al cargar posts';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const cargarPostsUsuario = useCallback(async (username: string) => {
    setLoading(true);
    setError(null);
    try {
      const { posts: data } = await postsApi.getPostsByUser(username);
      setPosts(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al cargar posts del usuario';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const cargarLikedPosts = useCallback(async (username: string) => {
    setLoading(true);
    setError(null);
    try {
      const { posts: data } = await postsApi.getLikedPosts(username);
      setPosts(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al cargar likes';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const cargarRepostedPosts = useCallback(async (username: string) => {
    setLoading(true);
    setError(null);
    try {
      const { posts: data } = await postsApi.getRepostedPosts(username);
      setPosts(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al cargar compartidos';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const agregarPost = useCallback(async (post: {
    autor: string;
    fotoperfil: string;
    contenido: string;
    imagen?: string | null;
    colonia?: string;
  }) => {
    const { post: newPost } = await postsApi.createPost({
      ...post,
      colonia: post.colonia || 'General',
    });
    setPosts(prev => [newPost, ...prev]);
    return newPost;
  }, []);

  const editarPost = useCallback(async (id: string, contenido: string) => {
    const { post: updated } = await postsApi.updatePost(id, contenido);
    setPosts(prev => prev.map(p => (p.id === id ? { ...p, ...updated } : p)));
  }, []);

  const eliminarPost = useCallback(async (id: string) => {
    await postsApi.deletePost(id);
    setPosts(prev => prev.filter(p => p.id !== id));
  }, []);

  const filtrarPosts = useCallback((query: string) => {
    const q = query.toLowerCase();
    return posts.filter(
      post =>
        post.autor.toLowerCase().includes(q) ||
        post.contenido.toLowerCase().includes(q)
    );
  }, [posts]);

  return {
    posts,
    loading,
    error,
    cargarPosts,
    cargarPostsUsuario,
    cargarLikedPosts,
    cargarRepostedPosts,
    agregarPost,
    editarPost,
    eliminarPost,
    filtrarPosts,
  };
}
