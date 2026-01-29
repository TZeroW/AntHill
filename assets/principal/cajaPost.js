// Este es el molde de tus posts. 
// Usamos "export" para que otros archivos puedan usar esta función.
export function crearPost(titulo, contenido, autor, profilePicture, fecha) {
    return `
        <div class="post-card">
            <div class="post-header">
                <img class="post-pfp" src=${profilePicture} alt="fotoDePerfil">
                <span class="post-author">u/${autor}</span>
                <span class="post-time">${fecha}</span>
            </div>
            <h2 class="post-title">${titulo}</h2>
            <div class="post-body">
                <p>${contenido}</p>
            </div>
            <div class="post-footer">
                <button class="vote-btn">▲</button>
                <span class="vote-count">0</span>
                <button class="vote-btn">▼</button>
            </div>
        </div>
    `;
}