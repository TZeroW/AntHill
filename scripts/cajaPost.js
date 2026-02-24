export function crearPost(post) {
    const { id, contenido, autor, fotoperfil, fecha, imagen } = post;
    let htmlImagen = '';

    if (imagen) {
        if (imagen === 'placeholder') {
            htmlImagen = `<div class="mock-media" style="width: 100%; height: 200px; background: linear-gradient(135deg, #161616 0%, #0d0d0d 100%); border-radius: 8px; margin-top: 10px; border: 1px solid #222;"></div>`;
        } else {
            htmlImagen = `<div class="media-container" style="margin-top: 10px;"><img src="${imagen}" alt="Imagen del Post" style="width: 100%; border-radius: 8px; border: 1px solid #222;"></div>`;
        }
    }

    return `
    <article class="post-item" data-id="${id}">
        <div class="post-pfp-col">
            <img src="${fotoperfil || 'assets/general/pfp.webp'}" alt="${autor}" class="post-pfp-img">
        </div>
        <div class="post-main-col">
            <div class="post-hdr">
                <span class="post-author">${autor}</span>
                <span class="post-date">· ${fecha || (post.created_at ? new Date(post.created_at).toLocaleDateString() : (post.Created_at ? new Date(post.Created_at).toLocaleDateString() : 'Recién'))}</span>
                
                ${(function () {
            const user = JSON.parse(localStorage.getItem("anthill_user"));
            if (user && user.name === autor) {
                return `
                        <div class="post-actions-menu">
                            <button class="btn-edit" onclick="window.postManager.prepararEdicion(${id})"><i class="bi bi-pencil"></i></button>
                            <button class="btn-delete" onclick="window.postManager.eliminar(${id})"><i class="bi bi-trash"></i></button>
                        </div>`;
            }
            return '';
        })()}
            </div>
            <div class="post-body">
                <p class="post-text">${contenido}</p>
                ${htmlImagen}
            </div>
            <div class="post-footer">
                <button class="action-btn"><i class="bi bi-caret-up-fill"></i> 0</button>
                <button class="action-btn"><i class="bi bi-chat-left"></i> 0</button>
                <button class="action-btn"><i class="bi bi-arrow-left-right"></i> 0</button>
                <button class="action-btn"><i class="bi bi-share"></i></button>
            </div>
        </div>
    </article>
    `;
}
