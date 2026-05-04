'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../lib/hooks/useAuth';
import '../../styles/log_in.css';

/**
 * Página de Login — migración de login.js.
 * Lógica: envía credenciales al microservicio auth (puerto 5001),
 * guarda sesión en localStorage y redirige al home.
 */
export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name || !password) {
      setError('Por favor, rellena todos los campos.');
      return;
    }

    setLoading(true);
    try {
      const user = await login(name, password);
      alert('¡Bienvenido de nuevo, ' + user.name + '!');
      router.push('/');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al iniciar sesión.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="log_in_container">
      <header>
        <h1>AntHill</h1>
        <p className="subtitulo_lol">INGRESA_LAS_CREDENCIALES</p>
      </header>

      <form className="log_in_form" onSubmit={handleSubmit}>
        <div className="user">
          <label htmlFor="user_name">NOMBRE_USUARIO</label>
          <input
            type="text"
            id="user_name"
            placeholder="matricula@tecmilenio.mx"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="user">
          <label htmlFor="key">CONTRASEÑA</label>
          <div className="password">
            <input
              type={showPassword ? 'text' : 'password'}
              id="key"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              style={{ border: 'none', backgroundColor: 'transparent' }}
              type="button"
              className="show_password"
              onClick={() => setShowPassword(!showPassword)}
            >
              <img src="/assets/general/eye.svg" alt="eye" />
            </button>
          </div>
        </div>

        {error && (
          <p style={{ color: '#ff4444', fontSize: '0.85rem', textAlign: 'center' }}>{error}</p>
        )}

        <button className="log_in_button" type="submit" disabled={loading}>
          {loading ? 'INGRESANDO...' : 'INGRESAR'}
        </button>
      </form>

      <footer>
        <Link href="/register" className="footer_p">
          ¿No tienes una cuenta? Registrate
        </Link>
        <p>Copyright © 2026 AntHill. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}
