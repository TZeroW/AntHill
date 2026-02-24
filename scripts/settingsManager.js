import { supabase } from "./supabaseClient.js";

async function initSettings() {
    const user = JSON.parse(localStorage.getItem("anthill_user"));
    if (!user) {
        window.location.href = "login.html";
        return;
    }

    // Actualizar UI Header
    const headerName = document.getElementById("header-user-name");
    const headerPfp = document.getElementById("header-user-pfp");
    if (headerName) headerName.textContent = user.name;
    if (headerPfp) headerPfp.src = "../" + (user.pfp || "assets/general/pfp.webp");

    // Elementos del formulario
    const usernameInput = document.getElementById("username-input");
    const pfpInput = document.getElementById("pfp-url-input");
    const pfpPreview = document.getElementById("pfp-preview");
    const btnSave = document.getElementById("btn-save-settings");
    const message = document.getElementById("settings-message");

    // Cargar datos actuales
    if (user.name) usernameInput.value = user.name;
    if (user.pfp) {
        pfpInput.value = user.pfp;
        pfpPreview.src = user.pfp;
    }

    // Vista previa en tiempo real
    pfpInput.addEventListener("input", () => {
        pfpPreview.src = pfpInput.value || "../assets/general/pfp.webp";
    });

    btnSave.addEventListener("click", async () => {
        const newName = usernameInput.value.trim();
        const newPfp = pfpInput.value.trim();

        if (!newName) {
            showMessage("El nombre no puede estar vacío.", "error");
            return;
        }

        try {
            btnSave.disabled = true;
            btnSave.textContent = "Guardando...";

            const { error } = await supabase
                .from("users")
                .update({
                    name: newName,
                    pfp: newPfp
                })
                .eq("id", user.id);

            if (error) throw error;

            // Actualizar sesión local
            user.name = newName;
            user.pfp = newPfp;
            localStorage.setItem("anthill_user", JSON.stringify(user));

            // Actualizar UI Header
            if (headerName) headerName.textContent = newName;
            if (headerPfp) headerPfp.src = newPfp || "../assets/general/pfp.webp";

            showMessage("¡Perfil actualizado con éxito!", "success");
        } catch (error) {
            console.error("Error al actualizar perfil:", error.message);
            showMessage("Error al guardar: " + error.message, "error");
        } finally {
            btnSave.disabled = false;
            btnSave.textContent = "Guardar Cambios";
        }
    });

    function showMessage(text, type) {
        message.textContent = text;
        message.className = type;
        message.style.display = "block";
        setTimeout(() => {
            message.style.display = "none";
        }, 3000);
    }
}

document.addEventListener("DOMContentLoaded", initSettings);
