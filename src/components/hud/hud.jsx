import React, { useState, useEffect, useRef } from 'react';
import "../styles/global.css"; // Asegúrate de que global.css no sobrescriba estos estilos

// Datos de votación (fijos)
const voteResults = { yes: 66, no: 33 };

// Array de jugadores vacío por defecto para que se muestren 5 posiciones con "---"
const defaultPlayers = [];

const Hud = () => {
  // Estado para los mensajes del chat (inicia con un mensaje de ejemplo del usuario "Tú")
  const [messages, setMessages] = useState([
    { user: "Tu", text: "Hola, me acabo de unir al chat" }
  ]);
  
  // Estado para el ranking (vacío por defecto)
  const [players, setPlayers] = useState(defaultPlayers);
  
  // Referencia para enfocar el input del chat
  const inputRef = useRef(null);

  // useEffect para escuchar globalmente la tecla "T" y enfocar el input
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key.toLowerCase() === 't') {
        if (inputRef.current && document.activeElement !== inputRef.current) {
          inputRef.current.focus();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Función para enviar un mensaje al presionar Enter
  const sendMessage = (event) => {
    if (event.key === 'Enter' && event.target.value.trim() !== "") {
      setMessages(prev => [...prev, { user: "Tú", text: event.target.value }]);
      event.target.value = "";
    }
  };

  return (
    <React.Fragment>
      {/*
        Bloque de Chat - ubicado en la esquina superior izquierda.
      */}
      <div className="hud-box absolute top-4 left-4 w-80">
        <h3 className="text-lg font-bold mb-2">Chat</h3>
        <div className="h-40 overflow-y-auto">
          {messages.map((msg, index) => (
            <p key={index}><b>{msg.user}:</b> {msg.text}</p>
          ))}
        </div>
        <input
          ref={inputRef}
          type="text"
          placeholder="Pulsa T para escribir..."
          className="w-full p-2 mt-2 bg-gray-800 text-white rounded"
          onKeyDown={sendMessage}
        />
      </div>

      {/*
        Bloque de Notificación de Salida - centrado en la parte superior.
      */}
      <div className="hud-box absolute top-4 left-1/2 transform -translate-x-1/2 border border-gray-400">
        <p>
          <b>
            El jugador <span className="text-blue-300">Quinto</span> quiere abandonar la partida!
          </b>
        </p>
        <p>
          Pulsa <span className="text-red-500 font-bold">Y</span> para <span className="text-red-500">abandonar</span> {voteResults.yes}%
        </p>
        <p>
          Pulsa <span className="text-green-500 font-bold">N</span> para <span className="text-green-500">seguir</span> {voteResults.no}%
        </p>
      </div>

      {/*
        Bloque de Ranking - alineado a la derecha con el mismo margen (right-4).
        Se muestran 5 posiciones dinámicas; si no hay jugador se muestra " ---"
      */}
      <div className="hud-box absolute top-4 right-4 w-60">
        <h3 className="text-xl font-bold text-blue-400">RANKING</h3>
        {[0, 1, 2, 3, 4].map(i => {
          const player = players[i];
          return (
            <p key={i} className="mt-1">
              {i + 1}. {player && player.name ? `${player.name} - ${player.points} pts` : '---'}
            </p>
          );
        })}
      </div>
    </React.Fragment>
  );
};

export default Hud;
