'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../lib/hooks/useAuth';
import '../../styles/register.css';

/**
 * Página de Register — migración de register.js.
 * Envía datos al microservicio auth y redirige al login.
 */
export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [gender, setGender] = useState('none');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !password || gender === 'none') {
      setError('Por favor, rellena todos los campos.');
      return;
    }

    setLoading(true);
    try {
      await register(name, email, password, gender);
      alert('Registro exitoso. Ahora puedes iniciar sesión.');
      router.push('/login');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al registrar.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="log_in_container">
      <header>
        <h1>AntHill</h1>
        <p className="subtitulo_lol">REGISTRA_TUS_CREDENCIALES</p>
      </header>

      <form className="log_in_form" onSubmit={handleSubmit}>
        <div className="user">
          <label htmlFor="user_name">NOMBRE_USUARIO</label>
          <input
            type="text"
            id="user_name"
            placeholder="AntyHilly12"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="user">
          <label htmlFor="email">EMAIL</label>
          <input
            type="text"
            id="email"
            placeholder="Ant@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
        <div className="gender">
          <label htmlFor="gender_select">GENERO</label>
          <select
            name="gender"
            id="gender_select"
            className="gender_select"
            value={gender}
            onChange={(e) => setGender(e.target.value)}
          >
            <option value="none" disabled>
              Selecciona tu genero
            </option>
            <option value="male">Masculino</option>
            <option value="female">Femenino</option>
            <option value="Preferir no decir">Preferir no decir</option>
          </select>
        </div>

        {error && (
          <p style={{ color: '#ff4444', fontSize: '0.85rem', textAlign: 'center' }}>{error}</p>
        )}

        <button className="log_in_button" type="submit" disabled={loading}>
          {loading ? 'REGISTRANDO...' : 'REGISTRAR'}
        </button>
      </form>

      <footer>
        <Link href="/login" className="footer_p">
          ¿Ya tienes una cuenta? Inicia sesión
        </Link>
        <p>Copyright © 2026 AntHill. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}
