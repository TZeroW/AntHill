import { crearPost } from './assets/principal/cajaPost.js';

// Seleccionamos el lugar donde queremos meter los posts
const feed = document.getElementById('feed');

// Esto simula la base de datos
const postsData = [
    {
        titulo: "Bienvenidos a AntHill",
        autor: "Salmule",
        contenido: "Este es el primer post de la plataforma, esta es una plataforma para que todos podamos estar conectados entre tecmilenios"
    },
];

// Funcion para cargar los posts
function cargarFeed() {
    postsData.forEach(post => {
        // Generamos el html usando el molde
        const htmlDelPost = crearPost(post.titulo, post.contenido, post.autor);

        // Lo agregamos al feed sin borrar lo anterior
        feed.innerHTML += htmlDelPost;
    });
}

// Ejecutamos la carga
cargarFeed();