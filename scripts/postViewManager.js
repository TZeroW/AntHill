import { supabase } from "./supabaseClient.js";
import { incrementCommentCount } from "./posts.js";

async function initPostView() {
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('id');

    if (!postId) {
        window.location.href = "../index.html";
        return;
    }

    // cargar Usuario
    const user = JSON.parse(localStorage.getItem("anthill_user"));

    // helper para rutas
    const fixPath = (path) => {
        if (!path) return "../assets/general/pfp.webp";
        if (path.startsWith("http") || path.startsWith("data:")) return path;
        return "../" + path;
    };

    if (user) {
        const headerName = document.getElementById("header-user-name");
        const headerPfp = document.getElementById("header-user-pfp");
        const commentPfp = document.getElementById("comment-pfp");

        if (headerName) headerName.textContent = user.name;
        if (headerPfp) headerPfp.src = fixPath(user.pfp);
        if (commentPfp) commentPfp.src = fixPath(user.pfp);
    }

    console.log("Cargando post ID:", postId);
    await cargarDetallesPost(postId);
}

async function cargarDetallesPost(id) {
    try {
        const { data: post, error } = await supabase
            .from("posts")
            .select("*")
            .eq("id", id)
            .single();

        if (error) throw error;

        renderizarPost(post);
        // Mostrar sección de comentarios
        const commentsSection = document.querySelector(".comments-section");
        if (commentsSection) commentsSection.style.display = "block";

        // Cargar comentarios
        await cargarComentarios(id);

        // Configurar botón de comentar
        const btnSubmit = document.getElementById("btn-submit-comment");
        const textarea = document.getElementById("comment-textarea");

        if (btnSubmit && textarea) {
            btnSubmit.addEventListener("click", async () => {
                const contenido = textarea.value.trim();
                if (!contenido) return;

                const user = JSON.parse(localStorage.getItem("anthill_user"));
                if (!user) {
                    alert("Debes iniciar sesión para comentar.");
                    return;
                }

                try {
                    btnSubmit.disabled = true;
                    btnSubmit.textContent = "...";

                    const { error } = await supabase
                        .from("comments")
                        .insert([{
                            post_id: id,
                            autor: user.name,
                            fotoperfil: user.pfp || "assets/general/pfp.webp",
                            contenido: contenido
                        }]);

                    if (error) throw error;

                    textarea.value = "";
                    await cargarComentarios(id);
                    // actualizar el contador dinamicamente
                    const newCount = await incrementCommentCount(id);
                    if (newCount !== null) {
                        const countSpan = document.getElementById("post-comment-count");
                        if (countSpan) countSpan.textContent = newCount;
                    }
                } catch (err) {
                    console.error("Error al comentar:", err.message);
                    alert("Error al enviar comentario. ¿Ya creaste la tabla 'comments'?");
                } finally {
                    btnSubmit.disabled = false;
                    btnSubmit.textContent = "Responder";
                }
            });
        }
    } catch (error) {
        console.error("Error al cargar el post:", error.message);
        document.getElementById("main-post-container").innerHTML = `
            <div style="text-align: center; padding: 40px;">
                <h2 style="color: #666;">Post no encontrado</h2>
                <a href="../index.html">Volver al inicio</a>
            </div>`;
    }
}

function renderizarPost(post) {
    const container = document.getElementById("main-post-container");
    const user = JSON.parse(localStorage.getItem("anthill_user"));
    const isOwner = user && user.name === post.autor;

    const getPath = (path) => {
        if (!path) return "../assets/general/pfp.webp";
        if (path.startsWith("http") || path.startsWith("data:")) return path;
        return "../" + path;
    };

    const fecha = post.created_at ? new Date(post.created_at).toLocaleString() : "Recién";
    const handle = `@${post.autor.toLowerCase().replace(/\s/g, '')}`;

    container.innerHTML = `
        <header class="post-header-full">
            <img src="${getPath(post.fotoperfil)}" alt="${post.autor}" class="author-pfp" />
            <div class="author-info">
                <div class="name-row">
                    <span class="author-name">${post.autor}</span>
                    <span class="user-handle">${handle}</span>
                    <span class="post-time">• ${fecha}</span>
                </div>
                <span class="colony-origin">
                    en <a href="../index.html?colonia=${post.colonia || 'General'}">c/${post.colonia || 'General'}</a>
                </span>
            </div>
            
            ${isOwner ? `
                <div class="post-options">
                    <button class="options-btn" onclick="this.nextElementSibling.classList.toggle('show')">
                        <i class="bi bi-three-dots"></i>
                    </button>
                    <div class="kebab-menu">
                        <button class="menu-item" onclick="event.stopPropagation(); window.postManager.prepararEdicionFromView(${post.id})">
                            <i class="bi bi-pencil-square"></i> Editar
                        </button>
                        <button class="menu-item delete" onclick="event.stopPropagation(); window.postManager.eliminarFromView(${post.id})">
                            <i class="bi bi-trash"></i> Eliminar
                        </button>
                    </div>
                </div>
            ` : ''}
        </header>

        <div class="post-body">
            <p class="post-text">${post.contenido}</p>
            ${post.imagen ? `
                <div class="post-media">
                    <img src="${getPath(post.imagen)}" alt="Post Content" />
                </div>
            ` : ''}
        </div>

        <footer class="post-actions-full">
            <div class="action-item like">
                <button onclick="window.postInteractions.interact(${post.id}, 'vote', this)">
                    <i class="bi bi-heart"></i>
                </button>
                <span>${post.likes_count || 0}</span>
            </div>
            <div class="action-item repost">
                <button onclick="window.postInteractions.interact(${post.id}, 'repost', this)">
                    <i class="bi bi-repeat"></i>
                </button>
                <span>${post.reposts_count || 0}</span>
            </div>
            <div class="action-item comment">
                <button>
                    <i class="bi bi-chat"></i>
                </button>
                <span id="post-comment-count">${post.comments_count || 0}</span>
            </div>
        </footer>
    `;
}

async function cargarComentarios(postId) {
    const list = document.getElementById("comments-list");
    if (!list) return;

    try {
        const { data: comments, error } = await supabase
            .from("comments")
            .select("*")
            .eq("post_id", postId)
            .order("created_at", { ascending: true });

        if (error) throw error;

        renderizarComentarios(comments);

    } catch (err) {
        console.error("Error al cargar comentarios:", err.message);
        list.innerHTML = `<p style="color: #666; font-size: 0.9rem;">No se pudieron cargar los comentarios.</p>`;
    }
}

function renderizarComentarios(comments) {
    const list = document.getElementById("comments-list");
    if (comments.length === 0) {
        list.innerHTML = `<p style="color: #666; font-size: 0.9rem; text-align: center; margin-top: 20px;">Sé el primero en comentar esta hormigada.</p>`;
        return;
    }

    const getPath = (path) => {
        if (!path) return "../assets/general/pfp.webp";
        if (path.startsWith("http") || path.startsWith("data:")) return path;
        return "../" + path;
    };

    list.innerHTML = comments.map(c => `
        <div class="comment-item" style="display: flex; gap: 12px; padding: 15px 0; border-bottom: 1px solid #222;">
            <img src="${getPath(c.fotoperfil)}" alt="${c.autor}" class="mini-pfp" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover;" />
            <div class="comment-content" style="flex: 1;">
                <div class="comment-header" style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                    <span class="comment-name" style="font-weight: bold; color: white; font-size: 0.9rem;">${c.autor}</span>
                    <span class="comment-time" style="color: #666; font-size: 0.8rem;">• ${new Date(c.created_at).toLocaleDateString()}</span>
                </div>
                <p class="comment-text" style="color: #e1e1e1; font-size: 0.95rem; line-height: 1.4;">${c.contenido}</p>
            </div>
        </div>
    `).join('');
}

document.addEventListener("DOMContentLoaded", initPostView);
