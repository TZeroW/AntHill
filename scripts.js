import { crearPost } from './assets/principal/cajaPost.js';

// aca seleccionamos la caja donde van a aparecer las publicaciones
const feed = document.getElementById('feed');

// estos son los datos falsos para probar simulando una base de datos, no son importantes
export const listaDePosts = [

    {
        titulo: "AntHill",
        fotoPerfil: "../assets/general/pfp-lol.jpg",
        autor: "TZeroW",
        fecha: "hace 10 minutos",
        contenido: "Bienvenido a AntHill, la red social para hormigas como tu y yo, los siguientes posts son de prueba no les hagan caso",
        imagen: "../assets/general/AntHill.png"
    },
    {
        titulo: "Salamin con pan",
        fotoPerfil: "../assets/general/pfp.webp",
        autor: "Salmule",
        fecha: "2h ago",
        contenido: "Salamin con pan",
        imagen: "../assets/general/Gato.jpg" //pa probar si andan las imagenes ponemos algo q no existe, igual deberia andar
    },
    {
        titulo: "sapo",
        fotoPerfil: "../assets/general/pfp.webp",
        autor: "Salmule",
        fecha: "5h ago",
        contenido: "Este es un post de prueba para ver si funciona el agregar mas de un post sin necesidad de que en el html este el componente desde un inicion porque estos se van creando a medida que se necesita con el js"
    },
    {
        titulo: "ReProbando la materia, claro que si",
        fotoPerfil: "../assets/general/pfp.webp",
        autor: "Salmule",
        fecha: "hace 2 minutos",
        contenido: "Esto es un post de prueba tambien"
    },
    {
        titulo: "Probando",
        fotoPerfil: "../assets/general/pfp.webp",
        autor: "Salmule",
        fecha: "hace 5 minutos",
        contenido: "Me estoy quedando sin cosas para escribir en los posts de prueba"
    },
    {
        titulo: "Gersi",
        fotoPerfil: "../assets/general/pfp-lol.jpg",
        autor: "TZeroW",
        fecha: "hace 10 minutos",
        contenido: "Y ahora vamos a decir que gerson esta bien guapo, apoco no?"
    },
];

// funcion para mostrar todos los posts en el inicio
export function cargarPosts() {
    const feed = document.getElementById('feed');
    if (!feed) return; // si no encuentra el feed no hace nada

    // limpiamos lo que habia antes
    feed.innerHTML = '';

    // recorremos la lista de posts y los agregamos uno por uno
    listaDePosts.forEach(post => {
        // creamos el HTML del post usando la funcion importada
        const htmlPost = crearPost(post.titulo, post.contenido, post.autor, post.fotoPerfil, post.fecha, post.imagen);

        // lo metemos en la pagina
        feed.innerHTML += htmlPost;
    });
}

// funcion para filtrar general
export function filtrar() {
    const feed = document.getElementById('feed');

    // agarramos lo que escribio el usuario en los inputs
    const autorInput = document.getElementById('autor');
    const contenidoInput = document.getElementById('contenido');
    const tituloInput = document.getElementById('titulo');

    // si los inputs existen tomamos su valor
    const autor = autorInput ? autorInput.value : '';
    const contenido = contenidoInput ? contenidoInput.value : '';
    const titulo = tituloInput ? tituloInput.value : '';

    // filtramos la lista
    const postsFiltrados = listaDePosts.filter(post => {
        return post.autor.toLowerCase().includes(autor.toLowerCase()) &&
            post.contenido.toLowerCase().includes(contenido.toLowerCase()) &&
            post.titulo.toLowerCase().includes(titulo.toLowerCase());
    });

    // mostramos los resultados
    if (feed) {
        feed.innerHTML = ''; // limpiamos
        postsFiltrados.forEach(post => {
            const htmlPost = crearPost(post.titulo, post.contenido, post.autor, post.fotoPerfil, post.fecha, post.imagen);
            feed.innerHTML += htmlPost;
        });
    }
}


// funcion para mostrar solo los posts de un usuario especifico (Perfil)
export function filtrarPorUsuario(nombreUsuario) {
    const feed = document.getElementById('feed');

    // filtramos buscaando coincidencia exacta de nombre
    const postsDelUsuario = listaDePosts.filter(post => {
        return post.autor.toLowerCase() === nombreUsuario.toLowerCase();
    });

    if (feed) {
        feed.innerHTML = ''; // limpiamos

        if (postsDelUsuario.length === 0) {
            // mensaje si no tiene posts
            feed.innerHTML = '<p style="color: var(--color-textos); text-align: center; font-size: 1.5rem; margin-top: 20px; font-family: \'VT323\', monospace;">Este usuario no ha publicado nada</p>';
        } else {
            // mostrar sus posts
            postsDelUsuario.forEach(post => {
                const htmlPost = crearPost(post.titulo, post.contenido, post.autor, post.fotoPerfil, post.fecha, post.imagen);
                feed.innerHTML += htmlPost;
            });
        }
    }
}