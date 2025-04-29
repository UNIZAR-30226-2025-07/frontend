import { useState, useEffect } from 'react';
import { Search, X, Play, ChevronRight, Clock } from 'lucide-react';
import { fetchWithToken } from '../utils/fetchWithToken';
import { getUserIdFromAccessToken } from '../utils/auth';

export default function JoinGameScreen() {
  const [gameCode, setGameCode] = useState('');
  const [savedGames, setSavedGames] = useState([]);
  const [notification, setNotification] = useState({ message: '', type: '', visible: false });
  
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type, visible: true });

    // Ocultar la notificación después de 3 segundos
    setTimeout(() => {
      setNotification({ message: '', type: '', visible: false });
    }, 3000);
  };

  // Estilos inline para los elementos
  const containerStyle = {
    backgroundColor: '#282032',
    maxWidth: '800px',
    width: '100%',
    margin: '0 auto',
    padding: '15px',
    marginTop: '-20px',
  };
  
  const gameItemStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: '#383848',
    padding: '8px 12px',
    borderRadius: '5px',
    marginBottom: '6px',
    width: '600px'
  };
  
  const gameInfoStyle = {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: '12px'
  };
  
  const gameNameStyle = {
    fontFamily: "'Luckiest Guy', cursive",
    fontSize: '24px',
    color: '#53E3E6',
    letterSpacing: '1px'
  };
  
  const scrollStyle = {
    maxHeight: '310px',
    overflowY: 'auto',
    paddingRight: '10px',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '6px'
  };

  const resumeBtnStyle = {
    backgroundColor: 'transparent',
    border: '2px solid #00cc00',
    borderRadius: '50%',
    padding: '8px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease, transform 0.2s ease'
  };

  const removeBtnStyle = {
    backgroundColor: 'transparent',
    border: '2px solid red',
    borderRadius: '50%',
    padding: '8px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease, transform 0.2s ease'
  };

  const codeInputContainerStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%'
  };

  const codeInputStyle = {
    width: '300px',
    padding: '12px',
    backgroundColor: '#383848',
    borderRadius: '5px',
    color: 'white',
    fontFamily: 'monospace',
    fontSize: '18px',
    letterSpacing: '2px',
    textAlign: 'center',
    border: 'none',
    outline: 'none'
  };

  // Obtener las partidas privadas del usuario
  useEffect(() => {
    const fetchSavedGames = async () => {
      try {
        const userId = getUserIdFromAccessToken(); // Obtener el ID del usuario
        if (!userId) {
          console.error('No se pudo obtener el ID del usuario.');
          return;
        }
    
        console.log(`📡 Obteniendo partidas privadas para el usuario: ${userId}`);
        const response = await fetchWithToken(`http://galaxy.t2dc.es:3000/private/unfinished/${userId}`, {
          method: 'GET',
        });
    
        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ Error al obtener las partidas privadas:', errorText);
          if (errorText !== '{"message":"No se han encontrado partidas privadas"}') {
            showNotification('Hubo un problema al obtener las partidas privadas.');
          }
          return;
        }
    
        const data = await response.json();
        console.log('✅ Partidas privadas obtenidas:', data);
    
        // Actualizar el estado con las partidas obtenidas
        setSavedGames(data || []); // Asegúrate de que `data` sea un array
      } catch (error) {
        console.error('❌ Error al procesar la solicitud para obtener las partidas privadas:', error);
        showNotification('Hubo un problema al obtener las partidas privadas.');
      }
    };

    fetchSavedGames();
  }, []);

  const handleMouseOver = (e, color) => {
    e.currentTarget.style.backgroundColor = color;
    e.currentTarget.style.transform = 'scale(1.1)';
  };

  const handleMouseOut = (e) => {
    e.currentTarget.style.backgroundColor = 'transparent';
    e.currentTarget.style.transform = '';
  };

  const handleRemoveGame = async (game) => {
    const userId = getUserIdFromAccessToken();
    if (!userId) {
      console.error('⚠️ No se encontró el ID del usuario en el accessToken.');
      return;
    }
  
    try {
      if (game.leader === userId) {
        // Eliminar la partida privada si el usuario es el líder
        const deleteResponse = await fetchWithToken(`http://galaxy.t2dc.es:3000/private/delete/${game.id}`, {
          method: 'DELETE',
        });
  
        if (!deleteResponse.ok) {
          const errorText = await deleteResponse.text();
          console.error('❌ Error al eliminar la partida privada:', errorText);
          return;
        }
  
        console.log('✅ Partida privada eliminada exitosamente.');
      } else {
        // Eliminar al usuario de la partida privada si no es el líder
        const deleteUserResponse = await fetchWithToken(
          `http://galaxy.t2dc.es:3000/private/deleteUserFromPrivate/${game.id}/${userId}`,
          {
            method: 'DELETE',
          }
        );
  
        if (!deleteUserResponse.ok) {
          const errorText = await deleteUserResponse.text();
          console.error('❌ Error al eliminar al usuario de la partida privada:', errorText);
          return;
        }
  
        console.log('✅ Usuario eliminado de la partida privada exitosamente.');
      }
  
      // Actualizar la lista de partidas guardadas eliminando la partida actual
      setSavedGames((prevGames) => prevGames.filter((g) => g.id !== game.id));
    } catch (error) {
      console.error('❌ Error al procesar la eliminación de la partida privada o del usuario:', error);
    }
  };

  const handlePlayGame = (game) => {
    try {
      // Guardar gameId y gamePasswd en las cookies
      document.cookie = `gameId=${game.id}; path=/; SameSite=Lax;`;
      document.cookie = `gamePasswd=${game.passwd}; path=/; SameSite=Lax;`;
  
      console.log('✅ Cookies guardadas:', { gameId: game.id, gamePasswd: game.passwd });
  
      // Redirigir al usuario a /createPG
      window.location.href = '/createPG';
    } catch (error) {
      console.error('❌ Error al intentar iniciar la partida:', error);
      showNotification('Hubo un problema al intentar iniciar la partida.');
    }
  };

  const handleJoinGame = async () => {
    if (!gameCode) {
      showNotification('Por favor, introduce un código válido.');
      return;
    }

    try {
      console.log(`📡 Buscando partida con código: ${gameCode}`);
      // Realizar la solicitud para obtener la partida privada
      const response = await fetchWithToken(`http://galaxy.t2dc.es:3000/private/getGameWithCode/${gameCode}`, {
        method: 'GET',
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error al buscar la partida privada:', errorText);
        showNotification('No se encontró ninguna partida con ese código. Intenta nuevamente.');
        return;
      }

      const data = await response.json();
      console.log('✅ Partida encontrada:', data);

      const game = data.game;
      if (!game) {
        console.error('❌ No se encontraron datos de la partida en la respuesta.');
        showNotification('Hubo un problema al obtener los datos de la partida. Intenta nuevamente.');
        return;
      }

      // Obtener el ID del usuario desde el token
      const userId = getUserIdFromAccessToken();
      if (!userId) {
        console.error('No se pudo obtener el ID del usuario.');
        return;
      }

      // Parámetros para unirse a la partida
      const bodyB = {
        gameId: game.id,
        passwd: game.passwd, // Contraseña de la partida obtenida del backend
        idUser: userId,
      };

      console.log('📡 Intentando unirse a la partida con los siguientes datos:', bodyB);

      // Realizar la solicitud para unirse a la partida privada
      const responseB = await fetchWithToken('http://galaxy.t2dc.es:3000/private/join', {
        method: 'POST',
        body: JSON.stringify(bodyB),
      });

      if (!responseB.ok) {
        const errorText = await responseB.text();
        console.error('❌ Error al unirse a la partida:', errorText);
        showNotification('Hubo un error al unirse a la partida. Intenta nuevamente.');
        return;
      }

      const dataB = await responseB.json();
      console.log('✅ Se ha unido exitosamente a la partida:', dataB);

      // Guardar el gameId en las cookies
      document.cookie = `gameId=${game.id}; path=/; SameSite=Lax;`;
      document.cookie = `gamePasswd=${game.passwd}; path=/; SameSite=Lax;`;

      // Redirigir al usuario a la página de la partida
      window.location.href = '/createPG';
    } catch (error) {
      console.error('❌ Error al procesar la solicitud para unirse a la partida:', error);
      showNotification('Hubo un problema al unirse a la partida. Intenta nuevamente.');
    }
  };

  return (
    <div className="flex flex-col min-h-0 text-white" style={containerStyle}>
     {notification.visible && (
        <div
          style={{
            position: 'fixed',
            top: '215px',
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '15px 30px',
            borderRadius: '10px',
            color: 'white',
            fontSize: '16px',
            zIndex: 1000,
            maxWidth: '300px',
            textAlign: 'center',
            opacity: 1,
            transition: 'opacity 1s ease-out',
            backgroundColor: 'red ',
          }}
        >
          {notification.message}
        </div>
      )}
      <div className="w-full rounded-xl  overflow-hidden">
        <div className="p-4">
          {/* Input para código de partida */}
          <div className="mb-6">
          <div style={codeInputContainerStyle}>
            <div className="flex items-center gap-4"> 
                <input
                type="text"
                value={gameCode}
                onChange={(e) => setGameCode(e.target.value.toUpperCase())}
                placeholder="CÓDIGO"
                maxLength={6}
                style={{...codeInputStyle,
                    marginRight: '10px',
                }}
                />
                <button
                onClick={handleJoinGame}
                className="px-5 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 transition-colors flex items-center justify-center text-base font-bold"
                style={{ minWidth: '100px' }} // Aumenta el tamaño mínimo del botón
                >
                Unirse
                </button>
            </div>
            </div>
          </div>
          
          {/* Partidas guardadas */}
          <div className="mb-4">
            <div className="text-gray-400 font-medium text-base mb-2 text-center">
              PARTIDAS GUARDADAS
            </div>
            <div style={{ width: '100%' }}>
              <style
                dangerouslySetInnerHTML={{
                  __html: `
                    .friends-scroll::-webkit-scrollbar {
                      width: 8px;
                    }
                    .friends-scroll::-webkit-scrollbar-thumb {
                      background-color: #888;
                      border-radius: 10px;
                    }
                    .friends-scroll::-webkit-scrollbar-track {
                      background: transparent;
                    }
                  `,
                }}
              />
              <div className="friends-scroll" style={scrollStyle}>
                {savedGames.length === 0 ? (
                  <div
                    style={{
                      textAlign: 'center',
                      fontSize: '18px',
                      color: '#ccc',
                      fontWeight: 'bold',
                      padding: '20px',
                      border: '2px dashed #774a9b',
                      borderRadius: '10px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '10px',
                      maxWidth: '400px',
                      margin: '20px auto',
                    }}
                  >
                    <p>No tienes partidas guardadas todavía.</p>
                  </div>
                ) : (
                  savedGames.map((game) => (
                    <div key={game.id} style={gameItemStyle}>
                      <div style={gameInfoStyle}>
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center">
                          <Search size={16} />
                        </div>
                        <div>
                          <div style={gameNameStyle}>{game.name}</div>
                          <div className="text-xs text-gray-400 flex items-center mt-1">
                            <Clock size={12} className="mr-1" /> Última actualización:{' '}
                            {new Date(game.updatedAt).toLocaleString()} • {game.currentPlayers}/{game.maxPlayers} jugadores • Código: {game.unique_code}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <button
                          style={{ ...resumeBtnStyle, marginRight: '1px' }}
                          onMouseOver={(e) => handleMouseOver(e, 'rgba(0, 204, 0, 0.2)')}
                          onMouseOut={handleMouseOut}
                          onClick={() => handlePlayGame(game)}
                        >
                          <Play size={20} className="text-green-500" />
                        </button>
                        <button
                          style={removeBtnStyle}
                          onClick={() => handleRemoveGame(game)}
                          onMouseOver={(e) => handleMouseOver(e, 'rgba(255, 0, 0, 0.2)')}
                          onMouseOut={handleMouseOut}
                        >
                          <X size={20} className="text-red-500" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="mt-2 text-xs text-gray-400 text-center">
        Introduce un código o selecciona una partida guardada
      </div>
    </div>
  );
}