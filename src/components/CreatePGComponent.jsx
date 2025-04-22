import { useState, useEffect } from 'react';
import { Copy, User, ChevronRight, Crown, Trophy } from 'lucide-react';
import PlayButton from './PlayButton'; // Importa el componente PlayButton

export default function GameLobby() {
  const [gameCode, setGameCode] = useState('X4RT9Z');
  const [players, setPlayers] = useState([
    { id: 1, name: 'DarkWarrior', isHost: true, isReady: true },
    { id: 2, name: 'CyberNinja', isHost: false, isReady: true },
    { id: 3, name: 'StormRider', isHost: false, isReady: false },
    { id: 4, name: 'PhoenixFlame', isHost: false, isReady: true },
    { id: 5, name: 'ShadowBlade', isHost: false, isReady: false },
  ]);
  const [maxPlayers, setMaxPlayers] = useState(8);
  const [copied, setCopied] = useState(false);

  const copyCodeToClipboard = async () => {
    try {
      // Intenta usar la API moderna del portapapeles
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(gameCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } else {
        // Fallback para contextos no seguros (no HTTPS o navegadores antiguos)
        const textArea = document.createElement('textarea');
        textArea.value = gameCode;
        textArea.style.position = 'fixed';  // Evita scroll
        textArea.style.opacity = '0';       // Invisible
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        // Intenta copiar con el método obsoleto, pero aún funcional
        const successful = document.execCommand('copy');
        
        document.body.removeChild(textArea);
        
        if (successful) {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } else {
          console.error("No se pudo copiar con el método fallback");
        }
      }
    } catch (err) {
      console.error("Error al copiar el código:", err);
    }
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

  return (
    <div className="flex flex-col min-h-0 text-white" style={containerStyle}>
      <div className="w-full rounded-xl overflow-hidden">
        {/* Game code section */}
        <div className="p-4 ">
          <div className="flex justify-center items-center space-x-4 mb-4">
            {/* Code display */}
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
            
            {/* Player count */}
            <div className="bg-gray-700 px-3 py-2 rounded-full text-sm">
              <span className="text-cyan-400 font-bold">{players.length}</span>
              <span className="mx-1">/</span>
              <span>{maxPlayers}</span>
              <span className="ml-1 text-gray-400">jugadores</span>
            </div>
          </div>
          
          {/* Players list */}
          <div className="mb-4">
            <div className="text-gray-400 font-medium text-base mb-2 text-center">
              JUGADORES
            </div>
            <div style={{width: '100%'}}>
              <style dangerouslySetInnerHTML={{__html: `
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
              `}} />
              <div className="friends-scroll" style={scrollStyle}>
                {players.map(player => (
                  <div key={player.id} style={playerItemStyle}>
                    <div style={playerInfoStyle}>
                      {/*<div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center">
                        <User size={16} /> 
                      </div> */}
                      <div style={playerNameStyle}>
                        {player.name}
                      </div>
                      {player.isHost && <Crown size={20} className="text-yellow-400" />}
                    </div>
                    <div className={`rounded-full h-3 w-3 ${player.isReady ? 'bg-green-500' : 'bg-gray-600'}`}></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Action buttons */}
          <div className="flex justify-center items-center space-x-4 mt-4">
            {/*}
            <button className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors text-sm">
              Salir
            </button> 
            <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 transition-colors flex items-center text-sm">
              Iniciar Partida
              <ChevronRight size={16} className="ml-1" />
            </button>
            */}
            <PlayButton />
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="mt-2 text-xs text-gray-400 text-center">
        Esperando a que todos los jugadores estén listos...
      </div>
      
    </div>
  );
}