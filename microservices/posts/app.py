"""
AntHill Posts Microservice — Puerto 5002
=========================================
Servicio de publicaciones, comentarios, likes, reposts y colonias.
Usa SQLite en modo archivo para persistir datos entre reinicios.

Endpoints (deben coincidir con lib/api.ts en el frontend):
  ── Posts ──
  GET    /api/posts                         → Listar posts (opcional ?colonia=X)
  POST   /api/posts                         → Crear post
  GET    /api/posts/<id>                     → Obtener post por ID
  PUT    /api/posts/<id>                     → Actualizar contenido
  DELETE /api/posts/<id>                     → Eliminar post
  GET    /api/posts/user/<username>          → Posts de un usuario

  ── Likes / Reposts ──
  POST   /api/posts/<id>/like               → Toggle like
  POST   /api/posts/<id>/repost             → Toggle repost
  GET    /api/posts/liked/<username>         → Posts que le gustaron a un usuario
  GET    /api/posts/reposted/<username>      → Posts que reposteó un usuario

  ── Comments ──
  GET    /api/posts/<id>/comments            → Listar comentarios
  POST   /api/posts/<id>/comments            → Crear comentario

  ── Colonias ──
  GET    /api/colonias                       → Listar colonias
  POST   /api/colonias                       → Crear colonia
"""

import os
import sqlite3
import uuid
from datetime import datetime, timezone

from flask import Flask, g, jsonify, request
from flask_cors import CORS

# ── App Config ────────────────────────────────────────────────────────────────
app = Flask(__name__)
CORS(app)

DATABASE = os.environ.get("POSTS_DB_PATH", "/app/data/posts.db")


# ── Database helpers ──────────────────────────────────────────────────────────
def get_db() -> sqlite3.Connection:
    """Retorna la conexión a SQLite para el request actual."""
    if "db" not in g:
        os.makedirs(os.path.dirname(DATABASE), exist_ok=True)
        g.db = sqlite3.connect(DATABASE)
        g.db.row_factory = sqlite3.Row
        g.db.execute("PRAGMA journal_mode=WAL;")
        g.db.execute("PRAGMA foreign_keys=ON;")
    return g.db


@app.teardown_appcontext
def close_db(exception):
    db = g.pop("db", None)
    if db is not None:
        db.close()


def init_db():
    """Crea todas las tablas necesarias si no existen."""
    db = get_db()

    db.execute(
        """
        CREATE TABLE IF NOT EXISTS posts (
            id              TEXT PRIMARY KEY,
            autor           TEXT NOT NULL,
            fotoperfil      TEXT DEFAULT 'assets/general/pfp.webp',
            contenido       TEXT NOT NULL,
            imagen          TEXT,
            colonia         TEXT DEFAULT 'General',
            likes_count     INTEGER DEFAULT 0,
            reposts_count   INTEGER DEFAULT 0,
            comments_count  INTEGER DEFAULT 0,
            created_at      TEXT NOT NULL
        )
        """
    )

    db.execute(
        """
        CREATE TABLE IF NOT EXISTS comments (
            id         TEXT PRIMARY KEY,
            post_id    TEXT NOT NULL,
            autor      TEXT NOT NULL,
            fotoperfil TEXT DEFAULT 'assets/general/pfp.webp',
            contenido  TEXT NOT NULL,
            created_at TEXT NOT NULL,
            FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
        )
        """
    )

    db.execute(
        """
        CREATE TABLE IF NOT EXISTS likes (
            id        TEXT PRIMARY KEY,
            post_id   TEXT NOT NULL,
            user_name TEXT NOT NULL,
            UNIQUE(post_id, user_name),
            FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
        )
        """
    )

    db.execute(
        """
        CREATE TABLE IF NOT EXISTS reposts (
            id        TEXT PRIMARY KEY,
            post_id   TEXT NOT NULL,
            user_name TEXT NOT NULL,
            UNIQUE(post_id, user_name),
            FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
        )
        """
    )

    db.execute(
        """
        CREATE TABLE IF NOT EXISTS colonias (
            id          TEXT PRIMARY KEY,
            name        TEXT UNIQUE NOT NULL,
            description TEXT DEFAULT '',
            image       TEXT DEFAULT '',
            created_at  TEXT NOT NULL
        )
        """
    )

    # Crear colonia General por defecto si no existe
    existing = db.execute("SELECT id FROM colonias WHERE name = 'General'").fetchone()
    if not existing:
        db.execute(
            "INSERT INTO colonias (id, name, description, created_at) VALUES (?, ?, ?, ?)",
            (str(uuid.uuid4()), "General", "Colonia predeterminada para todas las publicaciones.", datetime.now(timezone.utc).isoformat()),
        )

    db.commit()


def post_to_dict(row: sqlite3.Row) -> dict:
    return {
        "id": row["id"],
        "autor": row["autor"],
        "fotoperfil": row["fotoperfil"],
        "contenido": row["contenido"],
        "imagen": row["imagen"],
        "colonia": row["colonia"],
        "likes_count": row["likes_count"],
        "reposts_count": row["reposts_count"],
        "comments_count": row["comments_count"],
        "created_at": row["created_at"],
    }


def comment_to_dict(row: sqlite3.Row) -> dict:
    return {
        "id": row["id"],
        "post_id": row["post_id"],
        "autor": row["autor"],
        "fotoperfil": row["fotoperfil"],
        "contenido": row["contenido"],
        "created_at": row["created_at"],
    }


def colonia_to_dict(row: sqlite3.Row) -> dict:
    return {
        "id": row["id"],
        "name": row["name"],
        "description": row["description"],
        "image": row["image"],
        "created_at": row["created_at"],
    }


# ── Health check ──────────────────────────────────────────────────────────────
@app.route("/", methods=["GET"])
def health():
    return jsonify({"status": "ok", "service": "posts", "port": 5002})


# ═══════════════════════════════════════════════════════════════════════════════
#   POSTS
# ═══════════════════════════════════════════════════════════════════════════════

# ── GET /api/posts ────────────────────────────────────────────────────────────
@app.route("/api/posts", methods=["GET"])
def get_posts():
    db = get_db()
    colonia = request.args.get("colonia")

    if colonia:
        rows = db.execute(
            "SELECT * FROM posts WHERE colonia = ? ORDER BY created_at DESC", (colonia,)
        ).fetchall()
    else:
        rows = db.execute("SELECT * FROM posts ORDER BY created_at DESC").fetchall()

    return jsonify({"posts": [post_to_dict(r) for r in rows]}), 200


# ── POST /api/posts ───────────────────────────────────────────────────────────
@app.route("/api/posts", methods=["POST"])
def create_post():
    data = request.get_json(silent=True) or {}
    autor = data.get("autor", "").strip()
    contenido = data.get("contenido", "").strip()

    if not autor or not contenido:
        return jsonify({"message": "Autor y contenido son obligatorios."}), 400

    post_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()

    db = get_db()
    db.execute(
        """
        INSERT INTO posts (id, autor, fotoperfil, contenido, imagen, colonia, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """,
        (
            post_id,
            autor,
            data.get("fotoperfil", "assets/general/pfp.webp"),
            contenido,
            data.get("imagen"),
            data.get("colonia", "General"),
            now,
        ),
    )
    db.commit()

    row = db.execute("SELECT * FROM posts WHERE id = ?", (post_id,)).fetchone()
    return jsonify({"post": post_to_dict(row)}), 201


# ── GET /api/posts/<id> ──────────────────────────────────────────────────────
@app.route("/api/posts/<post_id>", methods=["GET"])
def get_post(post_id: str):
    db = get_db()
    row = db.execute("SELECT * FROM posts WHERE id = ?", (post_id,)).fetchone()
    if not row:
        return jsonify({"message": "Post no encontrado."}), 404
    return jsonify({"post": post_to_dict(row)}), 200


# ── PUT /api/posts/<id> ──────────────────────────────────────────────────────
@app.route("/api/posts/<post_id>", methods=["PUT"])
def update_post(post_id: str):
    db = get_db()
    row = db.execute("SELECT * FROM posts WHERE id = ?", (post_id,)).fetchone()
    if not row:
        return jsonify({"message": "Post no encontrado."}), 404

    data = request.get_json(silent=True) or {}
    contenido = data.get("contenido", "").strip()
    if not contenido:
        return jsonify({"message": "El contenido no puede estar vacío."}), 400

    db.execute("UPDATE posts SET contenido = ? WHERE id = ?", (contenido, post_id))
    db.commit()

    updated = db.execute("SELECT * FROM posts WHERE id = ?", (post_id,)).fetchone()
    return jsonify({"post": post_to_dict(updated)}), 200


# ── DELETE /api/posts/<id> ────────────────────────────────────────────────────
@app.route("/api/posts/<post_id>", methods=["DELETE"])
def delete_post(post_id: str):
    db = get_db()
    row = db.execute("SELECT * FROM posts WHERE id = ?", (post_id,)).fetchone()
    if not row:
        return jsonify({"message": "Post no encontrado."}), 404

    db.execute("DELETE FROM posts WHERE id = ?", (post_id,))
    db.commit()
    return "", 204


# ── GET /api/posts/user/<username> ────────────────────────────────────────────
@app.route("/api/posts/user/<username>", methods=["GET"])
def get_posts_by_user(username: str):
    db = get_db()
    rows = db.execute(
        "SELECT * FROM posts WHERE autor = ? ORDER BY created_at DESC", (username,)
    ).fetchall()
    return jsonify({"posts": [post_to_dict(r) for r in rows]}), 200


# ═══════════════════════════════════════════════════════════════════════════════
#   LIKES
# ═══════════════════════════════════════════════════════════════════════════════

@app.route("/api/posts/<post_id>/like", methods=["POST"])
def toggle_like(post_id: str):
    data = request.get_json(silent=True) or {}
    user_name = data.get("user_name", "").strip()
    if not user_name:
        return jsonify({"message": "user_name es obligatorio."}), 400

    db = get_db()

    # Verificar que el post existe
    post = db.execute("SELECT id FROM posts WHERE id = ?", (post_id,)).fetchone()
    if not post:
        return jsonify({"message": "Post no encontrado."}), 404

    existing = db.execute(
        "SELECT id FROM likes WHERE post_id = ? AND user_name = ?",
        (post_id, user_name),
    ).fetchone()

    if existing:
        # Quitar like
        db.execute("DELETE FROM likes WHERE id = ?", (existing["id"],))
        db.execute("UPDATE posts SET likes_count = MAX(0, likes_count - 1) WHERE id = ?", (post_id,))
        action = "removed"
    else:
        # Agregar like
        db.execute(
            "INSERT INTO likes (id, post_id, user_name) VALUES (?, ?, ?)",
            (str(uuid.uuid4()), post_id, user_name),
        )
        db.execute("UPDATE posts SET likes_count = likes_count + 1 WHERE id = ?", (post_id,))
        action = "added"

    db.commit()
    count = db.execute("SELECT likes_count FROM posts WHERE id = ?", (post_id,)).fetchone()["likes_count"]
    return jsonify({"count": count, "action": action}), 200


# ── GET /api/posts/liked/<username> ───────────────────────────────────────────
@app.route("/api/posts/liked/<username>", methods=["GET"])
def get_liked_posts(username: str):
    db = get_db()
    rows = db.execute(
        """
        SELECT p.* FROM posts p
        INNER JOIN likes l ON l.post_id = p.id
        WHERE l.user_name = ?
        ORDER BY p.created_at DESC
        """,
        (username,),
    ).fetchall()
    return jsonify({"posts": [post_to_dict(r) for r in rows]}), 200


# ═══════════════════════════════════════════════════════════════════════════════
#   REPOSTS
# ═══════════════════════════════════════════════════════════════════════════════

@app.route("/api/posts/<post_id>/repost", methods=["POST"])
def toggle_repost(post_id: str):
    data = request.get_json(silent=True) or {}
    user_name = data.get("user_name", "").strip()
    if not user_name:
        return jsonify({"message": "user_name es obligatorio."}), 400

    db = get_db()

    post = db.execute("SELECT id FROM posts WHERE id = ?", (post_id,)).fetchone()
    if not post:
        return jsonify({"message": "Post no encontrado."}), 404

    existing = db.execute(
        "SELECT id FROM reposts WHERE post_id = ? AND user_name = ?",
        (post_id, user_name),
    ).fetchone()

    if existing:
        db.execute("DELETE FROM reposts WHERE id = ?", (existing["id"],))
        db.execute("UPDATE posts SET reposts_count = MAX(0, reposts_count - 1) WHERE id = ?", (post_id,))
        action = "removed"
    else:
        db.execute(
            "INSERT INTO reposts (id, post_id, user_name) VALUES (?, ?, ?)",
            (str(uuid.uuid4()), post_id, user_name),
        )
        db.execute("UPDATE posts SET reposts_count = reposts_count + 1 WHERE id = ?", (post_id,))
        action = "added"

    db.commit()
    count = db.execute("SELECT reposts_count FROM posts WHERE id = ?", (post_id,)).fetchone()["reposts_count"]
    return jsonify({"count": count, "action": action}), 200


# ── GET /api/posts/reposted/<username> ────────────────────────────────────────
@app.route("/api/posts/reposted/<username>", methods=["GET"])
def get_reposted_posts(username: str):
    db = get_db()
    rows = db.execute(
        """
        SELECT p.* FROM posts p
        INNER JOIN reposts r ON r.post_id = p.id
        WHERE r.user_name = ?
        ORDER BY p.created_at DESC
        """,
        (username,),
    ).fetchall()
    return jsonify({"posts": [post_to_dict(r) for r in rows]}), 200


# ═══════════════════════════════════════════════════════════════════════════════
#   COMMENTS
# ═══════════════════════════════════════════════════════════════════════════════

@app.route("/api/posts/<post_id>/comments", methods=["GET"])
def get_comments(post_id: str):
    db = get_db()
    rows = db.execute(
        "SELECT * FROM comments WHERE post_id = ? ORDER BY created_at ASC",
        (post_id,),
    ).fetchall()
    return jsonify({"comments": [comment_to_dict(r) for r in rows]}), 200


@app.route("/api/posts/<post_id>/comments", methods=["POST"])
def create_comment(post_id: str):
    db = get_db()

    post = db.execute("SELECT id FROM posts WHERE id = ?", (post_id,)).fetchone()
    if not post:
        return jsonify({"message": "Post no encontrado."}), 404

    data = request.get_json(silent=True) or {}
    autor = data.get("autor", "").strip()
    contenido = data.get("contenido", "").strip()

    if not autor or not contenido:
        return jsonify({"message": "Autor y contenido son obligatorios."}), 400

    comment_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()

    db.execute(
        """
        INSERT INTO comments (id, post_id, autor, fotoperfil, contenido, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
        """,
        (
            comment_id,
            post_id,
            autor,
            data.get("fotoperfil", "assets/general/pfp.webp"),
            contenido,
            now,
        ),
    )
    db.execute("UPDATE posts SET comments_count = comments_count + 1 WHERE id = ?", (post_id,))
    db.commit()

    comment_row = db.execute("SELECT * FROM comments WHERE id = ?", (comment_id,)).fetchone()
    count = db.execute("SELECT comments_count FROM posts WHERE id = ?", (post_id,)).fetchone()["comments_count"]

    return jsonify({"comment": comment_to_dict(comment_row), "comments_count": count}), 201


# ═══════════════════════════════════════════════════════════════════════════════
#   COLONIAS
# ═══════════════════════════════════════════════════════════════════════════════

@app.route("/api/colonias", methods=["GET"])
def get_colonias():
    db = get_db()
    rows = db.execute("SELECT * FROM colonias ORDER BY name ASC").fetchall()
    return jsonify({"colonias": [colonia_to_dict(r) for r in rows]}), 200


@app.route("/api/colonias", methods=["POST"])
def create_colonia():
    data = request.get_json(silent=True) or {}
    name = data.get("name", "").strip()

    if not name:
        return jsonify({"message": "El nombre de la colonia es obligatorio."}), 400

    db = get_db()

    existing = db.execute("SELECT id FROM colonias WHERE name = ?", (name,)).fetchone()
    if existing:
        return jsonify({"message": "Ya existe una colonia con ese nombre."}), 409

    colonia_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()

    db.execute(
        "INSERT INTO colonias (id, name, description, image, created_at) VALUES (?, ?, ?, ?, ?)",
        (colonia_id, name, data.get("description", ""), data.get("image", ""), now),
    )
    db.commit()

    row = db.execute("SELECT * FROM colonias WHERE id = ?", (colonia_id,)).fetchone()
    return jsonify({"colonia": colonia_to_dict(row)}), 201


# ── Inicialización ────────────────────────────────────────────────────────────
with app.app_context():
    init_db()


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5002))
    app.run(host="0.0.0.0", port=port, debug=os.environ.get("APP_ENV") == "development")
