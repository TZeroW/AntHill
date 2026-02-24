import { agregarPost, eliminarPost, editarPost, listaDePosts } from "./posts.js";

class PostManager {
    constructor() {
        this.inputPost = document.querySelector(".create-post-box input");
        this.btnPublicar = document.querySelector(".btn-post");
        this.btnSidebarCreate = document.querySelector(".btn-create");
        this.editingId = null;

        this.init();
    }

    init() {
        if (this.btnPublicar) {
            this.btnPublicar.addEventListener("click", () => this.handlePublicar());
        }

        if (this.inputPost) {
            this.inputPost.addEventListener("keydown", (e) => {
                if (e.key === "Enter") {
                    this.handlePublicar();
                }
            });
        }

        if (this.btnSidebarCreate) {
            this.btnSidebarCreate.addEventListener("click", () => {
                if (this.inputPost) {
                    this.inputPost.focus();
                    this.inputPost.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            });
        }
    }

    async handlePublicar() {
        const contenido = this.inputPost.value.trim();
        if (!contenido) return;

        if (this.editingId) {
            await editarPost(this.editingId, contenido);
            this.editingId = null;
            this.btnPublicar.textContent = "Publicar";
        } else {
            await agregarPost(contenido, null, window.coloniaActual || "General");
        }

        this.inputPost.value = "";
    }

    async eliminar(id) {
        const post = listaDePosts.find(p => p.id === id);
        const user = JSON.parse(localStorage.getItem("anthill_user"));

        if (!post || !user || post.autor !== user.name) {
            alert("No tienes permiso para eliminar este post.");
            return;
        }

        if (confirm("¿Estás seguro de que quieres eliminar este post?")) {
            await eliminarPost(id);
        }
    }

    prepararEdicion(id) {
        const post = listaDePosts.find(p => p.id === id);
        const user = JSON.parse(localStorage.getItem("anthill_user"));

        if (!post || !user || post.autor !== user.name) {
            alert("No tienes permiso para editar este post.");
            return;
        }

        if (post) {
            this.inputPost.value = post.contenido;
            this.editingId = id;
            this.btnPublicar.textContent = "Guardar";
            this.inputPost.focus();
        }
    }
}

// lo exponemos globalmente para que los onclick del HTML funcionen
window.postManager = new PostManager();
