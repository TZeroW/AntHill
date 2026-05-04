'use client';

import { useCallback } from 'react';
import { postsApi } from '../api';

/**
 * Hook para interacciones con posts — reemplaza postInteractions.js.
 */
export function usePostInteractions() {
  const toggleLike = useCallback(async (postId: string, userName: string) => {
    return postsApi.toggleLike(postId, userName);
  }, []);

  const toggleRepost = useCallback(async (postId: string, userName: string) => {
    return postsApi.toggleRepost(postId, userName);
  }, []);

  return { toggleLike, toggleRepost };
}
