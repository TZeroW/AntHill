export function crearPost(post) {
    const { id, contenido, autor, fotoperfil, fecha, imagen } = post;

    // helper para corregir rutas dinámicamente según dónde estemos
    const getPath = (path) => {
        if (!path) return "assets/general/pfp.webp";
        if (path.startsWith("http") || path.startsWith("data:")) return path;

        // detectamos si estamos en una subcarpeta (sections/)
        const isSubfolder = window.location.pathname.includes("/sections/");
        return isSubfolder ? `../${path}` : path;
    };

    let htmlImagen = '';

    if (imagen) {
        if (imagen === 'placeholder') {
            htmlImagen = `<div class="mock-media" style="width: 100%; height: 200px; background: linear-gradient(135deg, #161616 0%, #0d0d0d 100%); border-radius: 8px; margin-top: 10px; border: 1px solid #222;"></div>`;
        } else {
            htmlImagen = `<div class="media-container" style="margin-top: 10px;"><img src="${getPath(imagen)}" alt="Imagen del Post" style="width: 100%; border-radius: 8px; border: 1px solid #222;"></div>`;
        }
    }

    return `
    <article class="post-item" data-id="${id}" onclick="if(!event.target.closest('button') && !event.target.closest('a')) { window.location.href = '${getPath('sections/postView.html?id=' + id)}' }">
        <div class="post-pfp-col">
            <img src="${getPath(fotoperfil)}" alt="${autor}" class="post-pfp-img">
        </div>
        <div class="post-main-col">
            <div class="post-hdr">
                <span class="post-author">${autor}</span>
                <span class="post-date">· ${fecha || (post.created_at ? new Date(post.created_at).toLocaleDateString() : (post.Created_at ? new Date(post.Created_at).toLocaleDateString() : 'Recién'))}</span>
                
                ${(function () {
            const user = JSON.parse(localStorage.getItem("anthill_user"));
            if (user && user.name === autor) {
                return `
                        <div class="post-options">
                            <button class="kebab-btn" onclick="this.nextElementSibling.classList.toggle('show')">
                                <i class="bi bi-three-dots-vertical"></i>
                            </button>
                            <div class="kebab-menu">
                                <button class="menu-item" onclick="window.postManager.prepararEdicion(${id}); this.parentElement.classList.remove('show')">
                                    <i class="bi bi-pencil-square"></i> Editar
                                </button>
                                <button class="menu-item delete" onclick="window.postManager.eliminar(${id}); this.parentElement.classList.remove('show')">
                                    <i class="bi bi-trash3"></i> Eliminar
                                </button>
                            </div>
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
                <button class="action-btn comment-btn" onclick="event.stopPropagation(); window.location.href='${getPath('sections/postView.html?id=' + id)}'">
                    <i class="bi bi-chat-left"></i> <span>${post.comments_count || 0}</span>
                </button>
                <button class="action-btn repost-btn" onclick="event.stopPropagation(); window.postInteractions.interact(${id}, 'repost', this)">
                    <i class="bi bi-arrow-left-right"></i> <span>${post.reposts_count || 0}</span>
                </button>
            </div>
        </div>
    </article>
    `;
}
