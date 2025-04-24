import React, { useState, useEffect } from 'react';
import '../styles/admin.css'; // Asegúrate de tener un archivo CSS para estilos
import { fetchWithToken } from '../utils/fetchWithToken'; 

// Componente principal
function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');

  // Función para cambiar de página
  const navigateTo = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="admin-panel">
      <Header />
      <div className="container">
        <Sidebar currentPage={currentPage} navigateTo={navigateTo} />
        <main className="content">
          {currentPage === 'dashboard' && <Dashboard />}
          {currentPage === 'mensajes' && <MensajesSoporte />}
          {currentPage === 'usuarios' && <DenunciarUsuarios />}
        </main>
      </div>
    </div>
  );
}

// Componente de encabezado con logo
function Header() {
  // Función para borrar cookies
  const deleteCookie = (name) => {
    document.cookie = name + '=; Max-Age=-99999999;';
  };

  // Función para cerrar sesión con cookies
  const logout = () => {
    // Borramos las cookies correspondientes a los tokens y el ID
    deleteCookie('accessToken');
    deleteCookie('refreshToken');

    // Redirigimos a la página de login
    window.location.href = '/'; // Cambia a la ruta que corresponda
  };

  return (
    <header className="header">
      <div className="logo">
        <img src="/images/logo_galaxy.png" alt="Logo del Juego" />
      </div>
      <h1>Panel de Administración</h1>
      <div className="user-info">
        <span>Admin</span>
        <button onClick={logout}>Cerrar Sesión</button>
      </div>
    </header>
  );
}

// Componente de barra lateral
function Sidebar({ currentPage, navigateTo }) {
  return (
    <nav className="sidebar">
      <ul>
        <li>
          <a 
            href="#" 
            className={currentPage === 'dashboard' ? 'active' : ''} 
            onClick={(e) => {
              e.preventDefault();
              navigateTo('dashboard');
            }}
          >
            Dashboard
          </a>
        </li>
        <li>
          <a 
            href="#" 
            className={currentPage === 'mensajes' ? 'active' : ''} 
            onClick={(e) => {
              e.preventDefault();
              navigateTo('mensajes');
            }}
          >
            Mensajes de Soporte
          </a>
        </li>
        <li>
          <a 
            href="#" 
            className={currentPage === 'usuarios' ? 'active' : ''} 
            onClick={(e) => {
              e.preventDefault();
              navigateTo('usuarios');
            }}
          >
            Denunciar Usuarios
          </a>
        </li>
      </ul>
    </nav>
  );
}

// Página principal de Dashboard
function Dashboard() {
  const [mensajesPendientes, setMensajesPendientes] = useState(0);
  const [usuariosRegistrados, setUsuariosRegistrados] = useState(0);

  useEffect(() => {
    const cargarMensajesPendientes = async () => {
      try {
        const response = await fetchWithToken('http://galaxy.t2dc.es:3000/contact-support/all');
        if (!response.ok) {
          throw new Error(`Error al cargar los mensajes: ${response.status}`);
        }
        const data = await response.json();

        // Contar los mensajes no resueltos
        const pendientes = data.filter((mensaje) => !mensaje.resolved).length;
        setMensajesPendientes(pendientes);
      } catch (error) {
        console.error('Error al cargar los mensajes pendientes:', error);
      }
    };

    const cargarUsuariosRegistrados = async () => {
      try {
        const response = await fetchWithToken('http://galaxy.t2dc.es:3000/contact-support/get-num-users/');
        if (!response.ok) {
          throw new Error(`Error al cargar los usuarios: ${response.status}`);
        }
        const data = await response.json();

        // Contar el total de usuarios
        setUsuariosRegistrados(data);
      } catch (error) {
        console.error('Error al cargar los usuarios registrados:', error);
      }
    };

    cargarMensajesPendientes();
    cargarUsuariosRegistrados();
  }, []);

  return (
    <div className="dashboard">
      <h2>Dashboard</h2>
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Mensajes Pendientes</h3>
          <p className="stat">{mensajesPendientes}</p>
        </div>
        <div className="stat-card">
          <h3>Usuarios Registrados</h3>
          <p className="stat">{usuariosRegistrados}</p>
        </div>
      </div>
    </div>
  );
}

// Componente para mensajes de soporte
function MensajesSoporte() {
  const [mensajes, setMensajes] = useState([]);
  const [respuesta, setRespuesta] = useState('');
  const [mensajeSeleccionado, setMensajeSeleccionado] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false); // Estado para controlar la animación de carga

  useEffect(() => {
    // Cargar mensajes desde la base de datos
    cargarMensajes();
  }, []);

  const cargarMensajes = async () => {
    try {
      const response = await fetchWithToken('http://galaxy.t2dc.es:3000/contact-support/all');
      if (!response.ok) {
        throw new Error(`Error al cargar los mensajes: ${response.status}`);
      }
      const data = await response.json();

      // Ordenar los mensajes: primero los no respondidos (resolved: false)
      const mensajesOrdenados = data.sort((a, b) => {
        if (a.resolved === b.resolved) return 0; // Si ambos tienen el mismo estado, no cambiar el orden
        return a.resolved ? 1 : -1; // Los no respondidos (resolved: false) van primero
      });

      setMensajes(mensajesOrdenados); // Asignar los mensajes ordenados al estado
      setIsLoading(false); // Marcar como cargado
    } catch (error) {
      console.error('Error al cargar los mensajes:', error);
      setIsLoading(false); // Marcar como cargado incluso si hay un error
    }
  };

  const handleSeleccionarMensaje = (mensaje) => {
    setMensajeSeleccionado(mensaje);
    setRespuesta('');
  };

  const handleEnviarRespuesta = async () => {
    if (!respuesta.trim()) return;
    setIsSending(true); // Activar animación de carga
    try {
      const response = await fetchWithToken(`http://galaxy.t2dc.es:3000/contact-support/response/${mensajeSeleccionado.id}`, {
        method: 'POST',
        body: JSON.stringify({ response: respuesta }), // Enviar la respuesta en el body
      });
  
      if (!response.ok) {
        throw new Error(`Error al enviar la respuesta: ${response.status}`);
      }
  
      alert('Respuesta enviada correctamente');
  
      // Actualizar el estado para reflejar el mensaje como respondido
      cargarMensajes(); // Recargar mensajes para reflejar el cambio

      setRespuesta(''); // Limpiar el campo de respuesta
      setMensajeSeleccionado(null); // Limpiar la selección
    } catch (error) {
      console.error('Error al enviar la respuesta:', error);
      alert('Hubo un error al enviar la respuesta. Intenta nuevamente.');
    } finally {
      setIsSending(false); // Desactivar animación de carga
    }
  };

  if (isLoading) {
    return <div>Cargando mensajes...</div>;
  }

  return (
    <div className="mensajes-soporte">
      <h2>Mensajes de Soporte</h2>
      
      <div className="mensajes-container">
        <div className="lista-mensajes">
          <h3>Mensajes Recibidos</h3>
          {mensajes.length === 0 ? (
            <p>No hay mensajes disponibles</p>
          ) : (
            <ul>
              {mensajes.map(mensaje => (
                <li 
                  key={mensaje.id} 
                  className={`mensaje-item ${mensaje.resolved ? 'respondido' : ''} ${mensajeSeleccionado?.id === mensaje.id ? 'seleccionado' : ''}`}
                  onClick={() => handleSeleccionarMensaje(mensaje)}
                >
                  <h4>{mensaje.title}</h4>
                  <p>De: {mensaje.name} ({mensaje.email})</p>
                  <span className="tipo-mensaje">{mensaje.type}</span>
                  {mensaje.resolved && <span className="badge-respondido">Respondido</span>}
                </li>
              ))}
            </ul>
          )}
        </div>
        
        <div className="detalle-mensaje">
          {mensajeSeleccionado ? (
            <>
              <div className="cabecera-mensaje">
                <h3>{mensajeSeleccionado.title}</h3>
                <div className="info-mensaje">
                  <p><strong>De:</strong> {mensajeSeleccionado.name} ({mensajeSeleccionado.email})</p>
                  <p><strong>Tipo:</strong> {mensajeSeleccionado.type}</p>
                </div>
              </div>
              
              <div className="cuerpo-mensaje">
                <p>{mensajeSeleccionado.description}</p>
              </div>
              
              <div className="respuesta-mensaje">
                <h4>Responder al mensaje</h4>
                <textarea 
                  value={respuesta}
                  onChange={(e) => setRespuesta(e.target.value)}
                  placeholder="Escribe tu respuesta aquí..."
                  rows={5}
                ></textarea>
                <button onClick={handleEnviarRespuesta} disabled={!respuesta.trim() || isSending}>
                  {isSending ? (
                    <span className="spinner"></span> // Mostrar animación
                  ) : (
                    'Enviar Respuesta'
                  )}
                </button>
              </div>
            </>
          ) : (
            <p className="seleccionar-mensaje">Selecciona un mensaje para ver los detalles</p>
          )}
        </div>
      </div>
    </div>
  );
}

// Componente para buscar y denunciar usuarios
function DenunciarUsuarios() {
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const [resultados, setResultados] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [motivoDenuncia, setMotivoDenuncia] = useState('');
  const [isSending, setIsSending] = useState(false); // Estado para controlar la animación de carga

  const buscarUsuarios = async () => {
    if (!terminoBusqueda.trim()) return;
    
    setIsSearching(true); // Mostrar estado de búsqueda
    try {
      const response = await fetchWithToken(`http://galaxy.t2dc.es:3000/contact-support/get-users/${terminoBusqueda}`);
      if (!response.ok) {
        throw new Error(`Error al buscar usuarios: ${response.status}`);
      }
      const data = await response.json();
      setResultados(data); // Asignar los resultados al estado
    } catch (error) {
      console.error('Error al buscar usuarios:', error);
      alert('Hubo un error al buscar usuarios. Intenta nuevamente.');
    } finally {
      setIsSearching(false); // Finalizar estado de búsqueda
    }
  };

  const handleSeleccionarUsuario = (usuario) => {
    setUsuarioSeleccionado(usuario);
    setMotivoDenuncia('');
  };

  const handleDenunciarUsuario = async () => {
    if (!motivoDenuncia.trim()) return;

    setIsSending(true); // Activar animación de carga
    try {
      const response = await fetchWithToken(`http://galaxy.t2dc.es:3000/contact-support/delete-user/${usuarioSeleccionado.id}`, {
        method: 'POST',
        body: JSON.stringify({ motive: motivoDenuncia, email: usuarioSeleccionado.email }), // Enviar el motivo en el body
      });
  
      if (!response.ok) {
        throw new Error(`Error al denunciar al usuario: ${response.status}`);
      }
  
      alert(`Usuario ${usuarioSeleccionado.username} denunciado correctamente`);
  
      // Limpiar el estado después de la denuncia
      setMotivoDenuncia('');
      setUsuarioSeleccionado(null);
      setResultados([]); // Opcional: limpiar los resultados de búsqueda
    } catch (error) {
      console.error('Error al denunciar al usuario:', error);
      alert('Hubo un error al denunciar al usuario. Intenta nuevamente.');
    } finally {
      setIsSending(false); // Desactivar animación de carga
    }
  };

  return (
    <div className="denunciar-usuarios">
      <h2>Denunciar Usuarios</h2>
      
      <div className="search-box">
        <input
          type="text"
          value={terminoBusqueda}
          onChange={(e) => setTerminoBusqueda(e.target.value)}
          placeholder="Nombre de usuario o correo electrónico"
        />
        <button onClick={buscarUsuarios} disabled={!terminoBusqueda.trim() || isSearching}>
          {isSearching ? 'Buscando...' : 'Buscar'}
        </button>
      </div>
      
      <div className="resultados-container">
        <div className="lista-resultados">
          <h3>Resultados de la búsqueda</h3>
          {isSearching ? (
            <p>Buscando usuarios...</p>
          ) : resultados.length === 0 ? (
            <p>No se encontraron usuarios</p>
          ) : (
            <ul>
              {resultados.map(usuario => (
                <li 
                  key={usuario.id}
                  className={`usuario-item ${usuarioSeleccionado?.id === usuario.id ? 'seleccionado' : ''}`}
                  onClick={() => handleSeleccionarUsuario(usuario)}
                >
                  <h4>{usuario.username}</h4>
                  <p>{usuario.email}</p>
                  <div className="usuario-meta">
                    <span>Experiencia: {usuario.experience}XP</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        
        <div className="detalle-usuario">
          {usuarioSeleccionado ? (
            <>
              <div className="info-usuario">
                <h3>Información del Usuario</h3>
                <p><strong>Username:</strong> {usuarioSeleccionado.username}</p>
                <p><strong>Email:</strong> {usuarioSeleccionado.email}</p>
                <p><strong>Experiencia:</strong> {usuarioSeleccionado.experience}XP</p>
                <p><strong>Última conexión:</strong> {usuarioSeleccionado.lastConnection}</p>
              </div>
              
              <div className="denuncia-usuario">
                <h4>Denunciar Usuario</h4>
                <textarea
                  value={motivoDenuncia}
                  onChange={(e) => setMotivoDenuncia(e.target.value)}
                  placeholder="Motivo de la denuncia..."
                  rows={4}
                ></textarea>
              <button onClick={handleDenunciarUsuario} disabled={!motivoDenuncia.trim() || isSending}>
                {isSending ? (
                  <span className="spinner"></span> // Mostrar animación
                ) : (
                  'Enviar Denuncia'
                )}
              </button>
              </div>
            </>
          ) : (
            <p className="seleccionar-usuario">Selecciona un usuario para ver los detalles</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;