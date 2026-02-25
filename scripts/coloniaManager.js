import { supabase } from "./supabaseClient.js";

async function initColonias() {
    const container = document.querySelector(".colonias-container");
    if (!container) return;

    // función para manejar rutas locales vs externas (estamos en /sections/)
    const fixPath = (path) => {
        if (!path) return "../assets/general/pfp.webp";
        if (path.startsWith("http") || path.startsWith("data:")) return path;
        return "../" + path;
    };

    // actualizar header
    const user = JSON.parse(localStorage.getItem("anthill_user"));
    if (user) {
        const headerName = document.getElementById("header-user-name");
        const headerPfp = document.getElementById("header-user-pfp");
        if (headerName) headerName.textContent = user.name;
        if (headerPfp) headerPfp.src = fixPath(user.pfp);
    }

    container.innerHTML = "<h2>Explorar Colonias</h2><div class='colonias-header' id='colonias-list'>Cargando colonias...</div>";

    try {
        const { data: colonias, error } = await supabase
            .from("colonias")
            .select("*");

        if (error) throw error;

        const list = document.getElementById("colonias-list");
        list.innerHTML = "";

        if (colonias.length === 0) {
            list.innerHTML = "<p>No hay colonias fundadas todavía. ¡Crea una!</p>";
            return;
        }

        colonias.forEach(col => {
            list.innerHTML += `
                <div class="colonia-card" onclick="window.location.href='../index.html?colonia=${col.name}'">
                    <div class="card-image">
                        <img src="${fixPath(col.image)}" alt="${col.name}" />
                    </div>
                    <div class="card-content">
                        <h2>c/${col.name}</h2>
                        <p class="description">${col.description || 'Una comunidad de hormigas.'}</p>
                        <button class="btn-join">Visitar</button>
                    </div>
                </div>
            `;
        });

    } catch (error) {
        console.error("Error al cargar colonias:", error.message);
        document.getElementById("colonias-list").innerHTML = "<p>Error al cargar las colonias. Asegúrate de crear la tabla 'colonias' en Supabase.</p>";
    }
    // --- Lógica de Creación de Colonias ---
    const btnCrearColonia = document.querySelector(".btn-create");
    const modal = document.getElementById("modal-crear-colonia");
    const btnConfirm = document.getElementById("btn-confirm-colonia");
    const btnCancel = document.getElementById("btn-cancel-colonia");
    const errorMsg = document.getElementById("colonia-error-msg");

    if (btnCrearColonia && modal) {
        btnCrearColonia.addEventListener("click", () => {
            modal.style.display = "flex";
        });
    }

    if (btnCancel && modal) {
        btnCancel.addEventListener("click", () => {
            modal.style.display = "none";
            errorMsg.style.display = "none";
        });
    }

    if (btnConfirm) {
        btnConfirm.addEventListener("click", async () => {
            const name = document.getElementById("new-colonia-name").value.trim();
            const description = document.getElementById("new-colonia-desc").value.trim();
            const image = document.getElementById("new-colonia-img").value.trim();

            if (!name) {
                errorMsg.textContent = "La colonia necesita un nombre.";
                errorMsg.style.display = "block";
                return;
            }

            try {
                btnConfirm.disabled = true;
                btnConfirm.textContent = "Fundando...";

                const { error } = await supabase
                    .from("colonias")
                    .insert([{ name, description, image: image || null }]);

                if (error) throw error;

                // Éxito: recargar y cerrar
                modal.style.display = "none";
                document.getElementById("new-colonia-name").value = "";
                document.getElementById("new-colonia-desc").value = "";
                document.getElementById("new-colonia-img").value = "";
                initColonias(); // Recargar lista
            } catch (err) {
                console.error("Error al fundar colonia:", err.message);
                errorMsg.textContent = "Error: " + err.message;
                errorMsg.style.display = "block";
            } finally {
                btnConfirm.disabled = false;
                btnConfirm.textContent = "Fundar";
            }
        });
    }
}

document.addEventListener("DOMContentLoaded", initColonias);
