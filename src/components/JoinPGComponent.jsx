import { useState } from 'react';
import { Search, X, Play, ChevronRight, Clock } from 'lucide-react';

export default function JoinGameScreen() {
  const [gameCode, setGameCode] = useState('');
  const [savedGames, setSavedGames] = useState([
    { id: 1, code: 'X4RT9Z', gameName: 'Batalla Épica', lastPlayed: '12 abr 2025', players: 6 },
    { id: 2, code: 'L7M3P8', gameName: 'Torneo Final', lastPlayed: '10 abr 2025', players: 4 },
    { id: 3, code: 'K9D2F5', gameName: 'Liga Profesional', lastPlayed: '5 abr 2025', players: 8 },
    { id: 4, code: 'H2J7R1', gameName: 'Partida Casual', lastPlayed: '1 abr 2025', players: 3 },
  ]);

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

  const handleMouseOver = (e, color) => {
    e.currentTarget.style.backgroundColor = color;
    e.currentTarget.style.transform = 'scale(1.1)';
  };

  const handleMouseOut = (e) => {
    e.currentTarget.style.backgroundColor = 'transparent';
    e.currentTarget.style.transform = '';
  };

  const handleRemoveGame = (id) => {
    setSavedGames(savedGames.filter(game => game.id !== id));
  };

  return (
    <div className="flex flex-col min-h-0 text-white" style={containerStyle}>
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
                {savedGames.map(game => (
                  <div key={game.id} style={gameItemStyle}>
                    <div style={gameInfoStyle}>
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center">
                        <Search size={16} />
                      </div>
                      <div>
                        <div style={gameNameStyle}>
                          {game.gameName}
                        </div>
                        <div className="text-xs text-gray-400 flex items-center mt-1">
                          <Clock size={12} className="mr-1" /> {game.lastPlayed} • {game.players} jugadores • Código: {game.code}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button 
                        style={{...resumeBtnStyle,
                            marginRight: '1px',
                            }} 
                        onMouseOver={(e) => handleMouseOver(e, 'rgba(0, 204, 0, 0.2)')}
                        onMouseOut={handleMouseOut}
                      >
                        <Play size={20} className="text-green-500" />
                      </button>
                      <button 
                        style={removeBtnStyle} 
                        onClick={() => handleRemoveGame(game.id)}
                        onMouseOver={(e) => handleMouseOver(e, 'rgba(255, 0, 0, 0.2)')}
                        onMouseOut={handleMouseOut}
                      >
                        <X size={20} className="text-red-500" />
                      </button>
                    </div>
                  </div>
                ))}
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