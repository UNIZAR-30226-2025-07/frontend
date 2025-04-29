import { useState, useEffect } from 'react';
import { Copy, User, ChevronRight, Crown, Trophy } from 'lucide-react';
import PlayPrivateButton from './PlayPrivateButton'; // Importa el componente PlayButton
import ReadyButton from './ReadyButton'; // Importa el componente ReadyButton
import { fetchWithToken } from '../utils/fetchWithToken';
import { getUserIdFromAccessToken } from '../utils/auth';



export default function GameLobby() {
  const [gameCode, setGameCode] = useState('');
  const [players, setPlayers] = useState([]);
  const [maxPlayers, setMaxPlayers] = useState(0);
  const [leaderId, setLeaderId] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchGameDetails = async () => {
      try {
        // Verificar si estamos en el cliente
        if (typeof document === 'undefined') {
          console.error('Este código solo debe ejecutarse en el cliente.');
          return;
        }
        // Obtener gameId y gamePasswd de las cookies
        const cookies = document.cookie.split('; ');
        let gameId = null;
        let gamePasswd = null;

        for (let cookie of cookies) {
          const [key, value] = cookie.split('=');
          if (key === 'gameId') gameId = value;
          if (key === 'gamePasswd') gamePasswd = value;
        }

        if (!gameId || !gamePasswd) {
          console.error('⚠️ No se encontraron gameId o gamePasswd en las cookies.');
          return;
        }

        // Realizar la solicitud al backend
        const response = await fetchWithToken('http://galaxy.t2dc.es:3000/private/getPrivateGame', {
          method: 'POST',
          body: JSON.stringify({ gameId, passwd: gamePasswd }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ Error al unirse a la partida privada:', errorText);
          return;
        }

        const data = await response.json();
        console.log('✅ Datos de la partida privada obtenidos:', data);

        if (!data || !data.privateGame) {
          document.cookie = 'gameId=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax;';
          document.cookie = 'gamePasswd=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax;';
          window.location.href = '/friends';
        }



        // Actualizar el estado con los datos de la partida
        setGameCode(data.privateGame.unique_code || gameId);
        setMaxPlayers(data.privateGame.maxPlayers || 0);
        setLeaderId(data.privateGame.leader || null);

        // Obtener los jugadores de la partida
        const playersResponse = await fetchWithToken(`http://galaxy.t2dc.es:3000/private/allPlayers/${gameId}`, {
          method: 'GET',
        });

        if (!playersResponse.ok) {
          const errorText = await playersResponse.text();
          console.error('❌ Error al obtener los jugadores de la partida:', errorText);
          return;
        }

        const playersData = await playersResponse.json();
        console.log('✅ Jugadores obtenidos:', playersData);

        // Actualizar el estado con los jugadores
        setPlayers(Array.isArray(playersData.players.players) ? playersData.players.players : []);


      } catch (error) {
        console.error('❌ Error al obtener los detalles de la partida privada:', error);
      }
    };

    fetchGameDetails();

    // Ejecutar fetchGameDetails cada 2 segundos
    const intervalId = setInterval(fetchGameDetails, 2000);

    // Limpiar el intervalo cuando el componente se desmonte
    return () => clearInterval(intervalId);
  }, []);

  // Borrar la partida privada si el lider sale de la lobby o borrar al jugador si sale de la lobby y no es el lider

  useEffect(() => {
    const deletePrivateGame = async () => {
      try {
        const cookies = document.cookie.split('; ');
        let gameId = null;
        let gamePasswd = null;
  
        for (let cookie of cookies) {
          const [key, value] = cookie.split('=');
          if (key === 'gameId') gameId = value;
          if (key === 'gamePasswd') gamePasswd = value;
          if (key === 'salidaControlada') salidaControlada = value;
        }

        if (salidaControlada === "true") {
          // Borrar la cookie de salida controlada
          document.cookie = 'salidaControlada=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax;';
          document.cookie = 'gameId=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax;';
          document.cookie = 'gamePasswd=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax;';
          console.log('✅ Salida controlada, no se eliminará la partida privada o el usuario.');
          return;
        }
  
        if (!gameId || !gamePasswd) {
          console.warn('⚠️ No se encontraron gameId o gamePasswd en las cookies.');
          return;
        }
  
        const userId = getUserIdFromAccessToken();
        if (!userId) {
          console.error('⚠️ No se encontró el ID del usuario en el accessToken.');
          return;
        }
  
        if (leaderId === userId) {
          // Eliminar la partida privada si el usuario es el líder
          const deleteResponse = await fetchWithToken(`http://galaxy.t2dc.es:3000/private/delete/${gameId}`, {
            method: 'DELETE',
          });
  
          if (!deleteResponse.ok) {
            console.error('❌ Error al eliminar la partida privada:', await deleteResponse.text());
            return;
          }
  
          console.log('✅ Partida privada eliminada exitosamente.');
        } else {
          // Eliminar al usuario de la partida privada si no es el líder
          const deleteUserResponse = await fetchWithToken(
            `http://galaxy.t2dc.es:3000/private/deleteUserFromPrivate/${gameId}/${userId}`,
            {
              method: 'DELETE',
            }
          );
  
          if (!deleteUserResponse.ok) {
            console.error('❌ Error al eliminar al usuario de la partida privada:', await deleteUserResponse.text());
            return;
          }
  
          console.log('✅ Usuario eliminado de la partida privada exitosamente.');
        }
  
        // Eliminar las cookies
        document.cookie = 'gameId=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax;';
        document.cookie = 'gamePasswd=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax;';
        console.log('✅ Cookies gameId y gamePasswd eliminadas.');
      } catch (error) {
        console.error('❌ Error al procesar la eliminación de la partida privada o del usuario:', error);
      }
    };
  
    const handleBeforeUnload = (event) => {
      deletePrivateGame(); // Llama a la función para eliminar la partida o al usuario
      //event.preventDefault();
      //event.returnValue = ''; // Requerido para algunos navegadores
    };
  
    // Registrar el evento beforeunload
    window.addEventListener('beforeunload', handleBeforeUnload);
  
    // Limpiar el evento al desmontar el componente
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [leaderId]); // Asegúrate de incluir leaderId como dependencia

  const copyCodeToClipboard = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(gameCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = gameCode;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        if (successful) {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } else {
          console.error('No se pudo copiar el código.');
        }
      }
    } catch (err) {
      console.error('Error al copiar el código:', err);
    }
  };

  return (
    <div style={containerStyle}>
      <div className="w-full rounded-xl overflow-hidden">
        <div className="p-4">
          <div className="flex justify-center items-center space-x-4 mb-4">
            <div className="bg-gray-700 py-2 px-4 rounded-lg flex items-center">
              <span className="text-2xl font-mono tracking-widest text-cyan-400">{gameCode}</span>
              <button
                onClick={copyCodeToClipboard}
                className="ml-3 p-1 rounded-md bg-indigo-600 hover:bg-indigo-700 transition-colors flex items-center"
              >
                <Copy size={14} className="mr-1" />
                <span className="text-sm">{copied ? 'Copiado!' : 'Copiar'}</span>
              </button>
            </div>
            <div className="bg-gray-700 px-3 py-2 rounded-full text-sm">
              <span className="text-cyan-400 font-bold">{players.length}</span>
              <span className="text-cyan-400 font-bold"> / </span>
              <span className="text-cyan-400 font-bold">{maxPlayers}</span>
              <span className="ml-1 text-gray-400">jugadores</span>
            </div>
          </div>
          <div className="mb-4">
            <div className="text-gray-400 font-medium text-base mb-2 text-center">JUGADORES</div>
            <div style={scrollStyle}>
              {players.map((player) => (
                <div key={player.id} style={playerItemStyle}>
                  <div style={playerInfoStyle}>
                    <span style={playerNameStyle}>{player.name}</span>
                    {player.id === leaderId && <Crown size={16} className="text-yellow-400 ml-2" />}
                  </div>
                  <div className={`rounded-full h-3 w-3 ${player.status=== "Ready" ? 'bg-green-500' : 'bg-gray-600'}`}></div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-center items-center space-x-4 mt-4">
          {leaderId === getUserIdFromAccessToken() ? <PlayPrivateButton /> : <ReadyButton />}
          </div>
        </div>
      </div>
      <div className="mt-2 text-xs text-gray-400 text-center">Esperando a que todos los jugadores estén listos...</div>
    </div>
  );
}

  // Estilos inline para los elementos
  const containerStyle = {
    backgroundColor: '#282032',
    maxWidth: '800px',
    width: '100%',
    margin: '0 auto',
    padding: '15px',
    marginTop: '-20px',
  };
  
  const playerItemStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: '#383848',
    padding: '8px 12px',
    borderRadius: '5px',
    marginBottom: '6px',
    width: '600px'
  };
  
  const playerInfoStyle = {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: '12px'
  };
  
  const playerNameStyle = {
    fontFamily: "'Luckiest Guy', cursive",
    fontSize: '24px',
    color: '#53E3E6',
    letterSpacing: '1px'
  };
  
  const scrollStyle = {
    maxHeight: '250px',
    overflowY: 'auto',
    paddingRight: '10px',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '6px'
  };

