import { supabase } from "./supabaseClient.js";

const registerForm = document.querySelector(".log_in_form");

if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const name = document.getElementById("user_name").value;
        const email = document.getElementById("email").value;
        const password = document.getElementById("key").value;
        const gender = document.getElementById("gender_select").value;

        if (!name || !email || !password || gender === "none") {
            alert("Por favor, rellena todos los campos.");
            return;
        }

        try {
            const { data, error } = await supabase
                .from("users")
                .insert([
                    { name, email, password }
                ]);

            if (error) throw error;

            alert("Registro exitoso. Ahora puedes iniciar sesión.");
            window.location.href = "login.html";
        } catch (error) {
            console.error("Error al registrar:", error.message);
            alert("Error al registrar: " + error.message);
        }
    });
}
const showPasswordBtn = document.querySelector(".show_password");
if (showPasswordBtn) {
    showPasswordBtn.addEventListener("click", () => {
        const passwordInput = document.getElementById("key");
        if (passwordInput.type === "password") {
            passwordInput.type = "text";
        } else {
            passwordInput.type = "password";
        }
    });
}
