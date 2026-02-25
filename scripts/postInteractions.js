import { likePost, repostPost } from "./posts.js";

const PostInteractions = {
    async interact(id, type, buttonElement) {
        const user = JSON.parse(localStorage.getItem("anthill_user"));
        if (!user) {
            alert("Debes iniciar sesión para interactuar.");
            return;
        }

        let countSpan = buttonElement.querySelector("span");
        if (!countSpan) {
            countSpan = buttonElement.nextElementSibling;
        }

        try {
            buttonElement.disabled = true;
            let newCount;

            if (type === 'vote') {
                const result = await likePost(id);
                if (result) {
                    newCount = result.count;
                    if (result.action === 'added') {
                        buttonElement.style.color = "var(--color-primary, #ffa500)";
                        const icon = buttonElement.querySelector("i");
                        if (icon.classList.contains("bi-heart")) {
                            icon.classList.replace("bi-heart", "bi-heart-fill");
                        } else if (icon.classList.contains("bi-caret-up")) {
                            icon.classList.replace("bi-caret-up", "bi-caret-up-fill");
                        }
                    } else {
                        buttonElement.style.color = "";
                        const icon = buttonElement.querySelector("i");
                        if (icon.classList.contains("bi-heart-fill")) {
                            icon.classList.replace("bi-heart-fill", "bi-heart");
                        } else if (icon.classList.contains("bi-caret-up-fill")) {
                            icon.classList.replace("bi-caret-up-fill", "bi-caret-up");
                        }
                    }
                }
            } else if (type === 'repost') {
                const result = await repostPost(id);
                if (result) {
                    newCount = result.count;
                    if (result.action === 'added') {
                        buttonElement.style.color = "#00ba7c";
                    } else {
                        buttonElement.style.color = "";
                    }
                }
            }

            if (newCount !== undefined && countSpan) {
                countSpan.textContent = newCount;
                buttonElement.style.transform = "scale(1.2)";
                setTimeout(() => buttonElement.style.transform = "scale(1)", 200);
            }

        } catch (error) {
            console.error("Error en interacción:", error);
        } finally {
            buttonElement.disabled = false;
        }
    }
};

window.postInteractions = PostInteractions;
