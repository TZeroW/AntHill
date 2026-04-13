import React from 'react';
import Link from 'next/link';
import '../../../styles/postView.css';

export default function PostViewPage() {
  return (
    <main className="post-container">
      {/* Botón para volver */}
      <div className="back-button">
        <Link href="/">
          <i className="bi bi-arrow-left"></i> Volver
        </Link>
      </div>

      {/* El Post Principal */}
      <article className="post-card" id="main-post-container">
        <p style={{ textAlign: 'center', padding: '20px' }}>Cargando post...</p>
        {/* Se llenará dinámicamente con React */}
      </article>

      {/* Sección de Comentarios */}
      <section className="comments-section" style={{ display: 'none' }}>
        <div className="comment-input-box">
          <img
            id="comment-pfp"
            src="/assets/general/pfp.webp"
            alt="Your PFP"
            className="mini-pfp"
          />
          <div className="input-wrapper">
            <textarea
              id="comment-textarea"
              placeholder="Escribe tu comentario..."
            ></textarea>
            <div className="input-actions">
              <button className="btn-comment-submit" id="btn-submit-comment">
                Responder
              </button>
            </div>
          </div>
        </div>

        <div className="comments-list" id="comments-list">
          {/* Los comentarios aparecerán aquí */}
        </div>
      </section>
    </main>
  );
}
