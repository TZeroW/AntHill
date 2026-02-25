import { crearPost } from "./cajaPost.js";
import { supabase } from "./supabaseClient.js";

// aca seleccionamos la caja donde van a aparecer las publicaciones
const feed = document.getElementById("feed");

function getUsuarioActual() {
  return JSON.parse(localStorage.getItem("anthill_user"));
}

export let listaDePosts = [];

// funcion para mostrar todos los posts en el inicio
export async function cargarPosts() {
  const urlParams = new URLSearchParams(window.location.search);
  const coloniaActual = urlParams.get('colonia');
  if (coloniaActual) {
    return cargarPostsPorColonia(coloniaActual);
  }

  const feed = document.getElementById("feed");
  if (!feed) return;

  feed.innerHTML = "<p style='text-align:center;'>Cargando colonia...</p>";

  try {
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    listaDePosts = data;
    feed.innerHTML = "";

    if (listaDePosts.length === 0) {
      feed.innerHTML = "<p style='text-align:center;'>La colonia está vacía. ¡Sé el primero en publicar!</p>";
      return;
    }

    listaDePosts.forEach((post) => {
      const htmlPost = crearPost(post);
      feed.innerHTML += htmlPost;
    });
  } catch (error) {
    console.error("Error al cargar posts:", error.message);
    feed.innerHTML = `<p style='color: red; text-align: center;'>Error al cargar la colonia: ${error.message}</p>`;
  }
}

// funcion para mostrar posts de una colonia especifica
export async function cargarPostsPorColonia(coloniaName) {
  const feed = document.getElementById("feed");
  if (!feed) return;

  feed.innerHTML = `<p style='text-align:center;'>Entrando a c/${coloniaName}...</p>`;

  try {
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .eq("colonia", coloniaName)
      .order("created_at", { ascending: false });

    if (error) throw error;

    listaDePosts = data;
    feed.innerHTML = "";

    if (listaDePosts.length === 0) {
      feed.innerHTML = `<p style='text-align:center;'>La colonia c/${coloniaName} está vacía. ¡Sé el primero en publicar!</p>`;
      return;
    }

    listaDePosts.forEach((post) => {
      feed.innerHTML += crearPost(post);
    });
  } catch (error) {
    console.error("Error al cargar colonia:", error.message);
    feed.innerHTML = `<p style='color: red; text-align: center;'>Error al cargar c/${coloniaName}: ${error.message}</p>`;
  }
}

// agregar un nuevo post
export async function agregarPost(contenido, imagen = null, colonia = "General") {
  const user = getUsuarioActual();
  if (!user) {
    alert("Debes iniciar sesión para publicar.");
    window.location.href = "sections/login.html";
    return;
  }

  const nuevoPost = {
    autor: user.name,
    fotoperfil: user.pfp || "assets/general/pfp.webp",
    contenido: contenido,
    imagen: imagen,
    colonia: colonia
  };

  try {
    console.log("Intentando crear post:", nuevoPost);
    const { data, error } = await supabase.from("posts").insert([nuevoPost]);
    if (error) throw error;

    console.log("Post creado exitosamente");
    await cargarPosts();
  } catch (error) {
    console.error("Error al crear post:", error.message);
    alert("No se pudo crear el post. Revisa si creaste la tabla 'posts' en Supabase.");
  }
}

// Eliminar un post
export async function eliminarPost(id) {
  try {
    const { error } = await supabase.from("posts").delete().eq("id", id);
    if (error) throw error;

    cargarPosts();
  } catch (error) {
    console.error("Error al eliminar post:", error.message);
  }
}

// Editar un post
export async function editarPost(id, nuevoContenido) {
  try {
    const { error } = await supabase
      .from("posts")
      .update({ contenido: nuevoContenido })
      .eq("id", id);

    if (error) throw error;

    cargarPosts();
  } catch (error) {
    console.error("Error al editar post:", error.message);
  }
}

// Dar like (Upvote) - Toggle
export async function likePost(id) {
  const user = getUsuarioActual();
  if (!user) return null;

  try {
    const { data: existingLike } = await supabase
      .from("post_likes")
      .select("*")
      .eq("post_id", id)
      .eq("user_name", user.name)
      .maybeSingle();

    const { data: post } = await supabase
      .from("posts")
      .select("likes_count")
      .eq("id", id)
      .single();

    let newCount = post.likes_count || 0;
    let action = "";

    if (existingLike) {
      // Quitar like
      await supabase.from("post_likes").delete().eq("id", existingLike.id);
      newCount = Math.max(0, newCount - 1);
      action = "removed";
    } else {
      // Dar like
      await supabase.from("post_likes").insert([{ post_id: id, user_name: user.name }]);
      newCount += 1;
      action = "added";
    }

    await supabase.from("posts").update({ likes_count: newCount }).eq("id", id);

    return { count: newCount, action };
  } catch (error) {
    console.error("Error al procesar like:", error.message);
    return null;
  }
}

// Repostear - Toggle
export async function repostPost(id) {
  const user = getUsuarioActual();
  if (!user) return null;

  try {
    const { data: existingRepost } = await supabase
      .from("post_reposts")
      .select("*")
      .eq("post_id", id)
      .eq("user_name", user.name)
      .maybeSingle();

    const { data: post } = await supabase
      .from("posts")
      .select("reposts_count")
      .eq("id", id)
      .single();

    let newCount = post.reposts_count || 0;
    let action = "";

    if (existingRepost) {
      // Quitar repost
      await supabase.from("post_reposts").delete().eq("id", existingRepost.id);
      newCount = Math.max(0, newCount - 1);
      action = "removed";
    } else {
      // Dar repost
      await supabase.from("post_reposts").insert([{ post_id: id, user_name: user.name }]);
      newCount += 1;
      action = "added";
    }

    await supabase.from("posts").update({ reposts_count: newCount }).eq("id", id);

    return { count: newCount, action };
  } catch (error) {
    console.error("Error al procesar repost:", error.message);
    return null;
  }
}

// Incrementar contador de comentarios
export async function incrementCommentCount(postId) {
  try {
    const { data: post, error: fetchError } = await supabase
      .from("posts")
      .select("comments_count")
      .eq("id", postId)
      .single();

    if (fetchError) throw fetchError;

    const newCount = (post.comments_count || 0) + 1;

    await supabase
      .from("posts")
      .update({ comments_count: newCount })
      .eq("id", postId);

    return newCount;
  } catch (error) {
    console.error("Error al actualizar contador de comentarios:", error.message);
    return null;
  }
}

// funcion para filtrar general
export function filtrar() {
  const feed = document.getElementById("feed");
  const autorInput = document.getElementById("autor");
  const contenidoInput = document.getElementById("contenido");

  const autor = autorInput ? autorInput.value : "";
  const contenido = contenidoInput ? contenidoInput.value : "";

  const postsFiltrados = listaDePosts.filter((post) => {
    return (
      post.autor.toLowerCase().includes(autor.toLowerCase()) &&
      post.contenido.toLowerCase().includes(contenido.toLowerCase())
    );
  });

  if (feed) {
    feed.innerHTML = "";
    postsFiltrados.forEach((post) => {
      const htmlPost = crearPost(post);
      feed.innerHTML += htmlPost;
    });
  }
}

// funcion para mostrar solo los posts de un usuario especifico
export function filtrarPorUsuario(nombreUsuario) {
  const feed = document.getElementById("feed");

  const postsDelUsuario = listaDePosts.filter((post) => {
    return post.autor.toLowerCase() === nombreUsuario.toLowerCase();
  });

  if (feed) {
    feed.innerHTML = "";

    if (postsDelUsuario.length === 0) {
      feed.innerHTML =
        "<p style=\"color: var(--color-textos); text-align: center; font-size: 1.5rem; margin-top: 20px; font-family: 'VT323', monospace;\">Este usuario no ha publicado nada</p>";
    } else {
      postsDelUsuario.forEach((post) => {
        const htmlPost = crearPost(post);
        feed.innerHTML += htmlPost;
      });
    }
  }
}

