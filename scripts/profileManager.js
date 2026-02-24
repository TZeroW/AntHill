import { supabase } from "./supabaseClient.js";
import { crearPost } from "./cajaPost.js";

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

    if (profileName) profileName.textContent = user.name;
    if (profileHandle) profileHandle.textContent = `@${user.name.toLowerCase().replace(/\s/g, '')}`;
    if (profilePfp) profilePfp.src = fixPath(user.pfp);

    // cargar posts del usuario
    await cargarPostsUsuario(user.name);
}

async function cargarPostsUsuario(username) {
    const feed = document.getElementById("feed");
    if (!feed) return;

    feed.innerHTML = "<p style='text-align:center;'>Buscando tus huellas...</p>";

    try {
        const { data, error } = await supabase
            .from("posts")
            .select("*")
            .eq("autor", username)
            .order("created_at", { ascending: false });

        if (error) throw error;

        feed.innerHTML = "";

        if (data.length === 0) {
            feed.innerHTML = "<p style='text-align:center; margin-top: 20px;'>Aún no has publicado nada. ¡Ve al Home y comparte algo!</p>";
            return;
        }

        data.forEach(post => {
            const htmlPost = crearPost(post);
            feed.innerHTML += htmlPost;
        });
    } catch (error) {
        console.error("Error al cargar perfil:", error.message);
        feed.innerHTML = "<p style='text-align:center; color: red;'>Error al cargar tus posts.</p>";
    }
}

// Inicializar
document.addEventListener("DOMContentLoaded", initProfile);
