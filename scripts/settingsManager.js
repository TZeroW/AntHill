import { supabase } from "./supabaseClient.js";

async function initSettings() {
    const user = JSON.parse(localStorage.getItem("anthill_user"));
    if (!user) {
        window.location.href = "login.html";
        return;
    }

    const fixPath = (path) => {
        if (!path) return "../assets/general/pfp.webp";
        if (path.startsWith("http") || path.startsWith("data:")) return path;
        return "../" + path;
    };

    // actualizar ui header
    const headerName = document.getElementById("header-user-name");
    const headerPfp = document.getElementById("header-user-pfp");
    if (headerName) headerName.textContent = user.name;
    if (headerPfp) headerPfp.src = fixPath(user.pfp);

    // elementos del formulario
    const usernameInput = document.getElementById("username-input");
    const pfpInput = document.getElementById("pfp-url-input");
    const pfpPreview = document.getElementById("pfp-preview");
    const bioInput = document.getElementById("bio-input");
    const locationInput = document.getElementById("location-input");
    const birthdateInput = document.getElementById("birthdate-input");
    const btnSave = document.getElementById("btn-save-settings");
    const message = document.getElementById("settings-message");

    // cargar datos actuales
    if (user.name) usernameInput.value = user.name;
    if (user.pfp) {
        pfpInput.value = user.pfp;
        pfpPreview.src = user.pfp;
    }
    if (user.bio) bioInput.value = user.bio;
    if (user.location) locationInput.value = user.location;
    if (user.birthdate) birthdateInput.value = user.birthdate;

    // vista previa en tiempo real
    pfpInput.addEventListener("input", () => {
        pfpPreview.src = fixPath(pfpInput.value);
    });

    btnSave.addEventListener("click", async () => {
        const newName = usernameInput.value.trim();
        const newPfp = pfpInput.value.trim();
        const newBio = bioInput.value.trim();
        const newLocation = locationInput.value.trim();
        const newBirthdate = birthdateInput.value;

        if (!newName) {
            showMessage("El nombre no puede estar vacío.", "error");
            return;
        }

        try {
            btnSave.disabled = true;
            btnSave.textContent = "Guardando...";

            const oldName = user.name;
            console.log("Intentando actualizar en Supabase:", { oldName, newName, newPfp });

            // actualizar tabla de usuarios
            const { error: userError } = await supabase
                .from("users")
                .update({
                    name: newName,
                    pfp: newPfp,
                    bio: newBio,
                    location: newLocation,
                    birthdate: newBirthdate
                })
                .eq("id", user.id);

            if (userError) throw userError;
            console.log("Tabla 'users' actualizada.");

            const { error: postsError } = await supabase
                .from("posts")
                .update({
                    autor: newName,
                    fotoperfil: newPfp
                })
                .eq("autor", oldName);

            if (postsError) {
                console.warn("No se pudieron actualizar los posts antiguos:", postsError.message);
            } else {
                console.log("Tabla 'posts' actualizada.");
            }

            // actualizar sesion local
            user.name = newName;
            user.pfp = newPfp;
            user.bio = newBio;
            user.location = newLocation;
            user.birthdate = newBirthdate;
            localStorage.setItem("anthill_user", JSON.stringify(user));

            // actualizar ui header y preview
            if (headerName) headerName.textContent = newName;
            if (headerPfp) headerPfp.src = fixPath(newPfp);
            pfpPreview.src = fixPath(newPfp);

            showMessage("¡Perfil y publicaciones actualizados en la base de datos!", "success");
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
