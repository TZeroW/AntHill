import { supabase } from "./supabaseClient.js";

async function initColonias() {
    const container = document.querySelector(".colonias-container");
    if (!container) return;

    // Actualizar Header (Igual que en Home/Perfil)
    const user = JSON.parse(localStorage.getItem("anthill_user"));
    if (user) {
        const headerName = document.getElementById("header-user-name");
        const headerPfp = document.getElementById("header-user-pfp");
        if (headerName) headerName.textContent = user.name;
        if (headerPfp) headerPfp.src = "../" + (user.pfp || "assets/general/pfp.webp");
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
            // Aquí se podría añadir un botón para crear colonia si el usuario quiere
            return;
        }

        colonias.forEach(col => {
            list.innerHTML += `
                <div class="colonia-card" onclick="window.location.href='../index.html?colonia=${col.name}'">
                    <div class="card-image">
                        <img src="../${col.image || 'assets/general/pfp.webp'}" alt="${col.name}" />
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
}

document.addEventListener("DOMContentLoaded", initColonias);
