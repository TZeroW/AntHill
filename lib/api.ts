/**
 * API Client - Centraliza las llamadas HTTP a los microservicios.
 * 
 * Auth Service:  puerto 5001
 * Posts Service:  puerto 5002
 */

const AUTH_BASE = process.env.NEXT_PUBLIC_AUTH_API || 'http://localhost:5001';
const POSTS_BASE = process.env.NEXT_PUBLIC_POSTS_API || 'http://localhost:5002';

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: unknown;
  headers?: Record<string, string>;
}

async function request<T>(baseUrl: string, endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, headers = {} } = options;

  const config: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  const res = await fetch(`${baseUrl}${endpoint}`, config);

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(errorData.message || `Error ${res.status}`);
  }

  // Si la respuesta es 204 No Content, retornar vacío
  if (res.status === 204) {
    return {} as T;
  }

  return res.json();
}

// ─── Auth Service (puerto 5001) ──────────────────────────────────────
export const authApi = {
  login: (name: string, password: string) =>
    request<{ user: import('./types').User }>(AUTH_BASE, '/api/auth/login', {
      method: 'POST',
      body: { name, password },
    }),

  register: (name: string, email: string, password: string, gender: string) =>
    request<{ message: string }>(AUTH_BASE, '/api/auth/register', {
      method: 'POST',
      body: { name, email, password, gender },
    }),

  updateProfile: (userId: string, updates: Partial<import('./types').User>) =>
    request<{ user: import('./types').User }>(AUTH_BASE, `/api/auth/users/${userId}`, {
      method: 'PUT',
      body: updates,
    }),

  getUser: (userId: string) =>
    request<{ user: import('./types').User }>(AUTH_BASE, `/api/auth/users/${userId}`),
};

// ─── Posts Service (puerto 5002) ─────────────────────────────────────
export const postsApi = {
  // Posts
  getPosts: (colonia?: string) => {
    const query = colonia ? `?colonia=${encodeURIComponent(colonia)}` : '';
    return request<{ posts: import('./types').Post[] }>(POSTS_BASE, `/api/posts${query}`);
  },

  getPostById: (id: string) =>
    request<{ post: import('./types').Post }>(POSTS_BASE, `/api/posts/${id}`),

  getPostsByUser: (username: string) =>
    request<{ posts: import('./types').Post[] }>(POSTS_BASE, `/api/posts/user/${encodeURIComponent(username)}`),

  createPost: (post: { autor: string; fotoperfil: string; contenido: string; imagen?: string | null; colonia?: string }) =>
    request<{ post: import('./types').Post }>(POSTS_BASE, '/api/posts', {
      method: 'POST',
      body: post,
    }),

  updatePost: (id: string, contenido: string) =>
    request<{ post: import('./types').Post }>(POSTS_BASE, `/api/posts/${id}`, {
      method: 'PUT',
      body: { contenido },
    }),

  deletePost: (id: string) =>
    request<void>(POSTS_BASE, `/api/posts/${id}`, { method: 'DELETE' }),

  // Likes
  toggleLike: (postId: string, userName: string) =>
    request<{ count: number; action: 'added' | 'removed' }>(POSTS_BASE, `/api/posts/${postId}/like`, {
      method: 'POST',
      body: { user_name: userName },
    }),

  // Reposts
  toggleRepost: (postId: string, userName: string) =>
    request<{ count: number; action: 'added' | 'removed' }>(POSTS_BASE, `/api/posts/${postId}/repost`, {
      method: 'POST',
      body: { user_name: userName },
    }),

  // Comments
  getComments: (postId: string) =>
    request<{ comments: import('./types').Comment[] }>(POSTS_BASE, `/api/posts/${postId}/comments`),

  createComment: (postId: string, comment: { autor: string; fotoperfil: string; contenido: string }) =>
    request<{ comment: import('./types').Comment; comments_count: number }>(POSTS_BASE, `/api/posts/${postId}/comments`, {
      method: 'POST',
      body: comment,
    }),

  // Colonias
  getColonias: () =>
    request<{ colonias: import('./types').Colonia[] }>(POSTS_BASE, '/api/colonias'),

  createColonia: (colonia: { name: string; description?: string; image?: string }) =>
    request<{ colonia: import('./types').Colonia }>(POSTS_BASE, '/api/colonias', {
      method: 'POST',
      body: colonia,
    }),

  // User-specific feeds
  getLikedPosts: (userName: string) =>
    request<{ posts: import('./types').Post[] }>(POSTS_BASE, `/api/posts/liked/${encodeURIComponent(userName)}`),

  getRepostedPosts: (userName: string) =>
    request<{ posts: import('./types').Post[] }>(POSTS_BASE, `/api/posts/reposted/${encodeURIComponent(userName)}`),
};
