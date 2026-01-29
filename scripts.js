import { crearPost } from './assets/principal/cajaPost.js';

// Seleccionamos el lugar donde queremos meter los posts
const feed = document.getElementById('feed');

// Esto simula la base de datos
const postsData = [
    {
        titulo: "Bienvenidos a AntHill",
        profilePicture: "assets/general/pfp.webp",
        autor: "Salmule",
        fecha: "hace 5 minutos",
        contenido: "Este es el primer post de la plataforma, esta es una plataforma para que todos podamos estar conectados entre tecmilenios"
    },
    {
        titulo: "Bienvenidos a AntHill",
        profilePicture: "assets/general/pfp.webp",
        autor: "David",
        fecha: "hace 10 minutos",
        contenido: "Este es el segundo post de la plataforma, esta es una plataforma para que todos podamos estar conectados entre tecmilenios"
    },
];

// Funcion para cargar los posts
export function cargarFeed() {
    const feed = document.getElementById('feed');
    if (!feed) return;

    // Limpiamos primero por si acaso
    feed.innerHTML = '';

    postsData.forEach(post => {
        // Generamos el html usando el molde
        const htmlDelPost = crearPost(post.titulo, post.contenido, post.autor, post.profilePicture, post.fecha);

        // Lo agregamos al feed sin borrar lo anterior
        feed.innerHTML += htmlDelPost;
    });
}

// Funcion para filtrar los posts
export function filtrar() {
    const feed = document.getElementById('feed');
    // Obtenemos los valores de los inputs
    const autorInput = document.getElementById('autor');
    const contenidoInput = document.getElementById('contenido');
    const tituloInput = document.getElementById('titulo');

    const autor = autorInput ? autorInput.value : '';
    const contenido = contenidoInput ? contenidoInput.value : '';
    const titulo = tituloInput ? tituloInput.value : '';

    // Filtramos los posts
    const postsFiltrados = postsData.filter(post => {
        return post.autor.toLowerCase().includes(autor.toLowerCase()) &&
            post.contenido.toLowerCase().includes(contenido.toLowerCase()) &&
            post.titulo.toLowerCase().includes(titulo.toLowerCase());
    });

    // Limpiamos el feed
    if (feed) {
        feed.innerHTML = '';
        // Agregamos los posts filtrados
        postsFiltrados.forEach(post => {
            const htmlDelPost = crearPost(post.titulo, post.contenido, post.autor, post.profilePicture, post.fecha);
            feed.innerHTML += htmlDelPost;
        });
    }
}


// Filtrar los posts por autor especifico (para perfil)
export function filtrarPorAutor(nombreAutor) {
    const feed = document.getElementById('feed');

    // Filtramos los posts
    const postsFiltrados = postsData.filter(post => {
        return post.autor.toLowerCase() === nombreAutor.toLowerCase();
    });

    // Limpiamos el feed
    if (feed) {
        feed.innerHTML = '';

        if (postsFiltrados.length === 0) {
            feed.innerHTML = '<p style="color: var(--color-textos); text-align: center; font-size: 1.5rem; margin-top: 20px; font-family: \'VT323\', monospace;">Este usuario no ha publicado nada</p>';
        } else {
            // Agregamos los posts filtrados
            postsFiltrados.forEach(post => {
                const htmlDelPost = crearPost(post.titulo, post.contenido, post.autor, post.profilePicture, post.fecha);
                feed.innerHTML += htmlDelPost;
            });
        }
    }
}