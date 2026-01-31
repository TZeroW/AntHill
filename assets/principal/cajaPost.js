// Este es el molde de tus posts. 
// Usamos "export" para que otros archivos puedan usar esta funcion.
export function crearPost(titulo, contenido, autor, fotoPerfil, fecha, imagen = null) {
    let htmlImagen = '';

    // si mandan una imagen la ponemos
    if (imagen) {
        // esto es por si queremos simular una imagen vacia con un placeholder
        if (imagen === 'placeholder') {
            htmlImagen = `<div class="mock-media" style="width: 100%; height: 200px; background: linear-gradient(135deg, #161616 0%, #0d0d0d 100%); border-radius: 8px; margin-top: 10px; border: 1px solid #222;"></div>`;
        } else {
            // si es una imagen real creamos la etiqueta img
            htmlImagen = `<div class="media-container" style="margin-top: 10px;"><img src="${imagen}" alt="Imagen del Post" style="width: 100%; border-radius: 8px; border: 1px solid #222;"></div>`;
        }
    }

    // mandamos el codigo HTML del post
    return `
    <article class="post-item">
        <div class="post-pfp-col">
            <img src="${fotoPerfil}" alt="${autor}" class="post-pfp-img">
        </div>
        <div class="post-main-col">
            <div class="post-hdr">
                <span class="post-author">${autor}</span>
                <span class="post-date">· ${fecha}</span>
                <button class="more-options"><i class="fa-solid fa-ellipsis"></i></button>
            </div>
            <div class="post-body">
                <p style="font-weight: 700; margin-bottom: 5px; color: white;">${titulo}</p>
                <p>${contenido}</p>
                ${htmlImagen}
            </div>
            <div class="post-footer">
                <button class="action-btn"><i class="fa-solid fa-arrow-up"></i> 0</button>
                <button class="action-btn"><i class="fa-regular fa-comment"></i> 0</button>
                <button class="action-btn"><i class="fa-solid fa-retweet"></i> 0</button>
                <button class="action-btn"><i class="fa-solid fa-share-nodes"></i></button>
            </div>
        </div>
    </article>
    `;
}