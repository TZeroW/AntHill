export default function Home() {
  return (
    <>
      <div className="create-post-box">
        <div className="cp-header">
          <img
            id="post-box-pfp"
            src="/assets/general/pfp.webp"
            alt="Profile"
            className="mini-pfp"
          />
          <input type="text" placeholder="¿Que esta pasando en la colonia?" />
        </div>
        <button className="btn-post">Publicar</button>
      </div>

      <div id="feed">
        {/* Aquí irán los posts que estaban en HTML puro, ahora renderizados con React */}
        <p style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
          Cargando Feed...
        </p>
      </div>
    </>
  );
}
