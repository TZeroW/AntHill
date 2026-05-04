/**
 * Tipos centrales del proyecto AntHill.
 * Corresponden a las tablas originales de la base de datos.
 */

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string; // Nunca se expone al frontend normalmente
  pfp?: string;
  bio?: string;
  location?: string;
  birthdate?: string;
  gender?: string;
  created_at?: string;
}

export interface Post {
  id: string;
  autor: string;
  fotoperfil: string;
  contenido: string;
  imagen?: string | null;
  colonia: string;
  likes_count: number;
  reposts_count: number;
  comments_count: number;
  created_at: string;
}

export interface Comment {
  id: string;
  post_id: string;
  autor: string;
  fotoperfil: string;
  contenido: string;
  created_at: string;
}

export interface Colonia {
  id: string;
  name: string;
  description?: string;
  image?: string;
  created_at?: string;
}
