import { supabase } from "./supabaseClient.js";

const loginForm = document.querySelector(".log_in_form");

if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const name = document.getElementById("user_name").value;
        const password = document.getElementById("key").value;

        if (!name || !password) {
            alert("Por favor, rellena todos los campos.");
            return;
        }

        try {
            const { data, error } = await supabase
                .from("users")
                .select("*")
                .eq("name", name)
                .eq("password", password)
                .single();

            if (error || !data) {
                alert("Usuario o contraseña incorrectos.");
                return;
            }

            // Guardamos la sesión del usuario
            localStorage.setItem("anthill_user", JSON.stringify(data));

            alert("¡Bienvenido de nuevo, " + data.name + "!");
            window.location.href = "../index.html";
        } catch (error) {
            console.error("Error al iniciar sesión:", error.message);
            alert("Error al iniciar sesión.");
        }
    });
}
