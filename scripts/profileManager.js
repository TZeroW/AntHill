import { supabase } from "./supabaseClient.js";
import { crearPost } from "./cajaPost.js";
import { filtrarPosts } from "./posts.js";

let currentProfilePosts = []; // Para búsqueda en el perfil

async function initProfile() {
    const user = JSON.parse(localStorage.getItem("anthill_user"));
    if (!user) {
        alert("Debes iniciar sesión para ver tu perfil.");
        window.location.href = "login.html";
        return;
    }

    // función para manejar rutas locales vs externas
    const fixPath = (path) => {
        if (!path) return "../assets/general/pfp.webp";
        if (path.startsWith("http") || path.startsWith("data:")) return path;
        return "../" + path;
    };

    // actualizar header
    const headerName = document.getElementById("header-user-name");
    const headerPfp = document.getElementById("header-user-pfp");
    if (headerName) headerName.textContent = user.name;
    if (headerPfp) headerPfp.src = fixPath(user.pfp);

    // actualizar informacion del perfil
    const profileName = document.querySelector(".perfilNombre");
    const profileHandle = document.querySelector(".user-handle");
    const profilePfp = document.querySelector(".big-avatar");
    const profileBio = document.querySelector(".bio-text");
    const profileLocation = document.getElementById("profile-location");
    const profileBirthdate = document.getElementById("profile-birthdate");

    if (profileName) profileName.textContent = user.name;
    if (profileHandle) profileHandle.textContent = `@${user.name.toLowerCase().replace(/\s/g, '')}`;
    if (profilePfp) profilePfp.src = fixPath(user.pfp);
    if (profileBio) profileBio.textContent = user.bio || "No hay";
    if (profileLocation) profileLocation.textContent = user.location || "En el hormiguero";
    if (profileBirthdate) profileBirthdate.textContent = user.birthdate ? new Date(user.birthdate).toLocaleDateString() : "Desde siempre";

    // cargar posts del usuario
    await cargarPostsUsuario(user.name);

    // Configurar Tabs
    const tabs = document.querySelectorAll(".feed-tab");
    tabs.forEach(tab => {
        tab.addEventListener("click", async () => {
            // Cambiar clase activa
            tabs.forEach(t => t.classList.remove("active"));
            tab.classList.add("active");

            const tabText = tab.textContent.trim();
            if (tabText === "Publicaciones") {
                await cargarPostsUsuario(user.name);
            } else if (tabText === "Me gusta") {
                await cargarPostsLikes(user.name);
            } else if (tabText === "Compartidos") {
                await cargarPostsReposts(user.name);
            }
        });
    });

    // Buscador Global
    const searchBar = document.getElementById("global-search");
    if (searchBar) {
        searchBar.addEventListener("input", (e) => {
            const q = e.target.value.toLowerCase();
            const filtered = currentProfilePosts.filter(post =>
                post.autor.toLowerCase().includes(q) ||
                post.contenido.toLowerCase().includes(q)
            );
            renderFeed(filtered);
        });
    }
}

async function cargarPostsUsuario(username) {
    const feed = document.getElementById("feed");
    if (!feed) return;

    feed.innerHTML = "<p style='text-align:center; padding: 20px;'>Buscando tus huellas...</p>";

    try {
        const { data, error } = await supabase
            .from("posts")
            .select("*")
            .eq("autor", username)
            .order("created_at", { ascending: false });

        if (error) throw error;
        currentProfilePosts = data;
        renderFeed(data, "Aún no has publicado nada. ¡Ve al Home y comparte algo!");
    } catch (error) {
        console.error("Error al cargar perfil:", error.message);
        feed.innerHTML = "<p style='text-align:center; color: red;'>Error al cargar tus posts.</p>";
    }
}

async function cargarPostsLikes(username) {
    const feed = document.getElementById("feed");
    feed.innerHTML = "<p style='text-align:center; padding: 20px;'>Buscando lo que te gustó...</p>";

    try {
        // obtener ids de posts con like
        const { data: likes, error: likesError } = await supabase
            .from("post_likes")
            .select("post_id")
            .eq("user_name", username);

        if (likesError) throw likesError;

        if (likes.length === 0) {
            feed.innerHTML = "<p style='text-align:center; margin-top: 20px;'>No le has dado like a nada todavia</p>";
            return;
        }

        const ids = likes.map(l => l.post_id);

        // obtener los posts reales
        const { data: posts, error: postsError } = await supabase
            .from("posts")
            .select("*")
            .in("id", ids)
            .order("created_at", { ascending: false });

        if (postsError) throw postsError;
        currentProfilePosts = posts;
        renderFeed(posts);
    } catch (error) {
        console.error("Error likes:", error);
        feed.innerHTML = "<p style='text-align:center; color: red;'>Error al cargar likes.</p>";
    }
}

async function cargarPostsReposts(username) {
    const feed = document.getElementById("feed");
    feed.innerHTML = "<p style='text-align:center; padding: 20px;'>Buscando tus compartidos...</p>";

    try {
        const { data: reposts, error: repostsError } = await supabase
            .from("post_reposts")
            .select("post_id")
            .eq("user_name", username);

        if (repostsError) throw repostsError;

        if (reposts.length === 0) {
            feed.innerHTML = "<p style='text-align:center; margin-top: 20px;'>No has reposteado nada todavia</p>";
            return;
        }

        const ids = reposts.map(r => r.post_id);

        const { data: posts, error: postsError } = await supabase
            .from("posts")
            .select("*")
            .in("id", ids)
            .order("created_at", { ascending: false });

        if (postsError) throw postsError;
        currentProfilePosts = posts;
        renderFeed(posts);
    } catch (error) {
        console.error("Error reposts:", error);
        feed.innerHTML = "<p style='text-align:center; color: red;'>Error al cargar compartidos.</p>";
    }
}

function renderFeed(posts, emptyMessage = "No hay nada aquí.") {
    const feed = document.getElementById("feed");
    feed.innerHTML = "";

    if (posts.length === 0) {
        feed.innerHTML = `<p style='text-align:center; margin-top: 20px;'>${emptyMessage}</p>`;
        return;
    }

    posts.forEach(post => {
        feed.innerHTML += crearPost(post);
    });
}

// Inicializar
document.addEventListener("DOMContentLoaded", initProfile);
