import Link from 'next/link';
import '../../styles/register.css';

export default function RegisterPage() {
  return (
    <div className="log_in_container">
      <header>
        <h1>AntHill</h1>
        <p className="subtitulo_lol">REGISTRA_TUS_CREDENCIALES</p>
      </header>

      <form className="log_in_form">
        <div className="user">
          <label htmlFor="user_name">NOMBRE_USUARIO</label>
          <input type="text" id="user_name" placeholder="AntyHilly12" />
        </div>
        <div className="user">
          <label htmlFor="email">EMAIL</label>
          <input type="text" id="email" placeholder="Ant@gmail.com" />
        </div>
        <div className="user">
          <label htmlFor="key">CONTRASEÑA</label>
          <div className="password">
            <input type="password" id="key" />
            <button
              style={{ border: 'none', backgroundColor: 'transparent' }}
              type="button"
              className="show_password"
            >
              <img src="/assets/general/eye.svg" alt="eye" />
            </button>
          </div>
        </div>
        <div className="gender">
          <label htmlFor="gender_select">GENERO</label>
          <select name="gender" id="gender_select" className="gender_select" defaultValue="none">
            <option value="none" disabled>
              Selecciona tu genero
            </option>
            <option value="male">Masculino</option>
            <option value="female">Femenino</option>
            <option value="Preferir no decir">Preferir no decir</option>
          </select>
        </div>
        <button className="log_in_button" type="submit">
          REGISTRAR
        </button>
      </form>

      <footer>
        <Link href="/login" className="footer_p">
          ¿Ya tienes una cuenta? Inicia sesión
        </Link>
        <p>Copyright © 2026 AntHill. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}
