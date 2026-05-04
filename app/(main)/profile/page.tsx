'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../lib/hooks/useAuth';
import { usePosts } from '../../../lib/hooks/usePosts';
import PostFeed from '../../../components/posts/PostFeed';
import '../../styles/profile.css';

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { posts, loading, error, cargarPostsUsuario, cargarLikedPosts, cargarRepostedPosts } = usePosts();
  const [activeTab, setActiveTab] = useState<'pub' | 'likes' | 'shared'>('pub');

  useEffect(() => {
    if (!authLoading && !user) {
      alert('Debes iniciar sesión para ver tu perfil.');
      router.push('/login');
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!user) return;
    if (activeTab === 'pub') cargarPostsUsuario(user.name);
    else if (activeTab === 'likes') cargarLikedPosts(user.name);
    else cargarRepostedPosts(user.name);
  }, [activeTab, user, cargarPostsUsuario, cargarLikedPosts, cargarRepostedPosts]);

  if (authLoading || !user) {
    return <div className="center-column w-full"><p style={{ textAlign: 'center', padding: 40, color: '#666' }}>Cargando perfil...</p></div>;
  }

  const getPath = (path?: string) => {
    if (!path) return '/assets/general/pfp.webp';
    if (path.startsWith('http') || path.startsWith('data:')) return path;
    return `/${path}`;
  };

  const handle = `@${user.name.toLowerCase().replace(/\s/g, '')}`;
  const emptyMsg: Record<string, string> = {
    pub: 'Aún no has publicado nada.',
    likes: 'No le has dado like a nada todavía.',
    shared: 'No has reposteado nada todavía.',
  };

  return (
    <div className="center-column w-full">
      <div className="profile-banner"></div>
      <div className="profile-header-wrapper">
        <div className="profile-header">
          <div className="profile-header-top">
            <div><img src={getPath(user.pfp)} alt="Perfil" className="big-avatar" /></div>
            <div className="botones-perfil"><a href="/settings" className="btn btn-secondary">Editar perfil</a></div>
          </div>
          <div className="user-details">
            <div className="name-badge-row"><h1 className="perfilNombre">{user.name}</h1></div>
            <p className="user-handle">{handle}</p>
            {user.bio && <p className="bio-text">{user.bio}</p>}
          </div>
        </div>
        <main className="feed-column">
          <div className="feed-tabs">
            <button className={`feed-tab ${activeTab === 'pub' ? 'active' : ''}`} onClick={() => setActiveTab('pub')}>Publicaciones</button>
            <button className={`feed-tab ${activeTab === 'likes' ? 'active' : ''}`} onClick={() => setActiveTab('likes')}>Me gusta</button>
            <button className={`feed-tab ${activeTab === 'shared' ? 'active' : ''}`} onClick={() => setActiveTab('shared')}>Compartidos</button>
          </div>
          <PostFeed posts={posts} loading={loading} error={error} emptyMessage={emptyMsg[activeTab]} currentUser={user} />
        </main>
      </div>
    </div>
  );
}
