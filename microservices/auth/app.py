"""
AntHill Auth Microservice — Puerto 5001
========================================
Servicio de autenticación: registro, login y gestión de perfil de usuarios.
Usa SQLite en modo archivo para persistir datos entre reinicios del contenedor.

Endpoints (deben coincidir con lib/api.ts en el frontend):
  POST   /api/auth/register         → Registrar usuario
  POST   /api/auth/login            → Iniciar sesión
  GET    /api/auth/users/<user_id>  → Obtener perfil
  PUT    /api/auth/users/<user_id>  → Actualizar perfil
"""

import os
import sqlite3
import uuid
from datetime import datetime, timezone

from flask import Flask, g, jsonify, request
from flask_cors import CORS
from werkzeug.security import check_password_hash, generate_password_hash

# ── App Config ────────────────────────────────────────────────────────────────
app = Flask(__name__)
CORS(app)

DATABASE = os.environ.get("AUTH_DB_PATH", "/app/data/auth.db")


# ── Database helpers ──────────────────────────────────────────────────────────
def get_db() -> sqlite3.Connection:
    """Retorna la conexión a SQLite para el request actual."""
    if "db" not in g:
        os.makedirs(os.path.dirname(DATABASE), exist_ok=True)
        g.db = sqlite3.connect(DATABASE)
        g.db.row_factory = sqlite3.Row
        g.db.execute("PRAGMA journal_mode=WAL;")
    return g.db


@app.teardown_appcontext
def close_db(exception):
    db = g.pop("db", None)
    if db is not None:
        db.close()


def init_db():
    """Crea la tabla users si no existe."""
    db = get_db()
    db.execute(
        """
        CREATE TABLE IF NOT EXISTS users (
            id         TEXT PRIMARY KEY,
            name       TEXT UNIQUE NOT NULL,
            email      TEXT UNIQUE NOT NULL,
            password   TEXT NOT NULL,
            pfp        TEXT DEFAULT 'assets/general/pfp.webp',
            bio        TEXT DEFAULT '',
            location   TEXT DEFAULT '',
            birthdate  TEXT DEFAULT '',
            gender     TEXT DEFAULT '',
            created_at TEXT NOT NULL
        )
        """
    )
    db.commit()


def user_to_dict(row: sqlite3.Row) -> dict:
    """Convierte una fila de SQLite a dict, omitiendo el password."""
    return {
        "id": row["id"],
        "name": row["name"],
        "email": row["email"],
        "pfp": row["pfp"],
        "bio": row["bio"],
        "location": row["location"],
        "birthdate": row["birthdate"],
        "gender": row["gender"],
        "created_at": row["created_at"],
    }


# ── Health check ──────────────────────────────────────────────────────────────
@app.route("/", methods=["GET"])
def health():
    return jsonify({"status": "ok", "service": "auth", "port": 5001})


# ── POST /api/auth/register ──────────────────────────────────────────────────
@app.route("/api/auth/register", methods=["POST"])
def register():
    data = request.get_json(silent=True) or {}
    name = data.get("name", "").strip()
    email = data.get("email", "").strip()
    password = data.get("password", "")
    gender = data.get("gender", "")

    if not name or not email or not password:
        return jsonify({"message": "Faltan campos obligatorios."}), 400

    db = get_db()

    # Verificar si nombre o email ya existen
    existing = db.execute(
        "SELECT id FROM users WHERE name = ? OR email = ?", (name, email)
    ).fetchone()
    if existing:
        return jsonify({"message": "El nombre de usuario o email ya están registrados."}), 409

    user_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    hashed_pw = generate_password_hash(password)

    db.execute(
        """
        INSERT INTO users (id, name, email, password, gender, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
        """,
        (user_id, name, email, hashed_pw, gender, now),
    )
    db.commit()

    return jsonify({"message": "Registro exitoso."}), 201


# ── POST /api/auth/login ─────────────────────────────────────────────────────
@app.route("/api/auth/login", methods=["POST"])
def login():
    data = request.get_json(silent=True) or {}
    name = data.get("name", "").strip()
    password = data.get("password", "")

    if not name or not password:
        return jsonify({"message": "Faltan credenciales."}), 400

    db = get_db()
    row = db.execute("SELECT * FROM users WHERE name = ?", (name,)).fetchone()
    if not row:
        return jsonify({"message": "Usuario no encontrado."}), 404

    if not check_password_hash(row["password"], password):
        return jsonify({"message": "Contraseña incorrecta."}), 401

    return jsonify({"user": user_to_dict(row)}), 200


# ── GET /api/auth/users/<user_id> ────────────────────────────────────────────
@app.route("/api/auth/users/<user_id>", methods=["GET"])
def get_user(user_id: str):
    db = get_db()
    row = db.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
    if not row:
        return jsonify({"message": "Usuario no encontrado."}), 404

    return jsonify({"user": user_to_dict(row)}), 200


# ── PUT /api/auth/users/<user_id> ────────────────────────────────────────────
@app.route("/api/auth/users/<user_id>", methods=["PUT"])
def update_user(user_id: str):
    db = get_db()
    row = db.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
    if not row:
        return jsonify({"message": "Usuario no encontrado."}), 404

    data = request.get_json(silent=True) or {}

    # Campos actualizables
    updatable = ["name", "email", "pfp", "bio", "location", "birthdate", "gender"]
    sets = []
    values = []
    for field in updatable:
        if field in data:
            sets.append(f"{field} = ?")
            values.append(data[field])

    if not sets:
        return jsonify({"message": "No se proporcionaron campos para actualizar."}), 400

    values.append(user_id)
    db.execute(f"UPDATE users SET {', '.join(sets)} WHERE id = ?", values)
    db.commit()

    updated = db.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
    return jsonify({"user": user_to_dict(updated)}), 200


# ── Inicialización ────────────────────────────────────────────────────────────
with app.app_context():
    init_db()


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5001))
    app.run(host="0.0.0.0", port=port, debug=os.environ.get("APP_ENV") == "development")
