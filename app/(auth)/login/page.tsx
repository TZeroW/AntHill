import Link from 'next/link';
import '../../styles/log_in.css';

export default function LoginPage() {
  return (
    <div className="log_in_container">
      <header>
        <h1>AntHill</h1>
        <p className="subtitulo_lol">INGRESA_LAS_CREDENCIALES</p>
      </header>

      <form className="log_in_form">
        <div className="user">
          <label htmlFor="user_name">NOMBRE_USUARIO</label>
          <input type="text" id="user_name" placeholder="matricula@tecmilenio.mx" />
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
        <button className="log_in_button" type="submit">
          INGRESAR
        </button>
      </form>

      <footer>
        <Link href="/register" className="footer_p">
          ¿No tienes una cuenta? Registrate
        </Link>
        <p>Copyright © 2026 AntHill. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}
