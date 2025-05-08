import { useState, useEffect, useRef } from "react";
import "../../styles/chat.css";
import { fetchWithToken } from "../../utils/fetchWithToken";

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [friendUsername, setFriendUsername] = useState("");
  const [wsConnected, setWsConnected] = useState(false);
  const chatEndRef = useRef(null);
  const wsRef = useRef(null);

  // Obtener parámetros de la URL
  const queryParams = new URLSearchParams(window.location.search);
  const currentUser = queryParams.get("userId");
  const friendId = queryParams.get("friendId");

  // Función para obtener el username del amigo
  const getFriendUsername = async (userId) => {
    const url = `http://galaxy.t2dc.es:3000/main-screen/get-user/${userId}`;
    
    try {
      const response = await fetchWithToken(url);
      if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
      
      const data = await response.json();
      setFriendUsername(data.username || `Usuario ${userId}`);
    } catch (error) {
      console.error("Error obteniendo el nombre del usuario:", error);
      setFriendUsername(`Usuario ${userId}`);
    }
  };

  // Función para cargar mensajes iniciales desde la BD
  const fetchMessages = async () => {
    if (!currentUser || !friendId) return;
    
    setIsLoading(true);
    try {
      const response = await fetchWithToken(
        `http://galaxy.t2dc.es:3000/messages/get_messages/${currentUser}/${friendId}`
      );
      
      if (!response.ok) throw new Error("Error al obtener mensajes");
      
      const data = await response.json();
      
      const sortedMessages = [...data].sort((a, b) => {
        // Si los IDs son fechas en formato string
        return new Date(a.id) - new Date(b.id);
      });
      
      // Actualizamos el estado solo con los datos frescos de la BD
      setMessages(sortedMessages || []);
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Configuración y gestión de WebSocket
  useEffect(() => {
    // Obtener token del localStorage
    const token = localStorage.getItem('token');
    
    if (currentUser && friendId && token) {
      console.log("🔄 Iniciando conexión WebSocket con parámetros:", { currentUser, friendId });
      
      // Crear conexión WebSocket con un identificador único para evitar conflictos
      const wsUrl = `ws://galaxy.t2dc.es:8080/ws/chat?userId=${currentUser}&friendId=${friendId}&token=${token}&clientId=${Date.now()}`;
      console.log("🔌 Conectando a:", wsUrl);
      
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      // Evento de conexión establecida
      ws.onopen = () => {
        console.log("🟢 Conexión WebSocket establecida");
        setWsConnected(true);
        
      };

      // Evento de recepción de mensaje
      ws.onmessage = (event) => {
        try {
          console.log("📩 Datos recibidos:", event.data);
          const data = JSON.parse(event.data);
          
          // Si es un mensaje de ping/pong, solo lo registramos
          if (data.type === "ping" || data.type === "pong") {
            console.log(`Recibido mensaje de control: ${data.type}`);
            return;
          }
          
          // Si es un mensaje de chat normal, lo añadimos a la lista
          // Verificamos que el mensaje no sea duplicado usando id
          setMessages(prevMessages => {
            // Comprobar si ya existe el mensaje con el mismo ID
            const exists = prevMessages.some(msg => msg.id === data.id);
            if (exists) {
              console.log("🔄 Ignorando mensaje duplicado con ID:", data.id);
              return prevMessages;
            }
            console.log("➕ Añadiendo nuevo mensaje:", data);
            return [...prevMessages, data];
          });
        } catch (error) {
          console.error("❌ Error al procesar mensaje WebSocket:", error);
          console.error("Datos recibidos:", event.data);
        }
      };

      // Evento de error
      ws.onerror = (error) => {
        console.error("❌ Error en WebSocket:", error);
        setWsConnected(false);
      };

      // Evento de cierre de conexión
      ws.onclose = (event) => {
        console.log(`🔴 Conexión WebSocket cerrada. Código: ${event.code}, Razón: ${event.reason}`);
        setWsConnected(false);
        
        // Intentar reconectar después de 5 segundos
        setTimeout(() => {
          console.log("🔄 Intentando reconectar WebSocket...");
          if (wsRef.current?.readyState === WebSocket.CLOSED) {
            // Reiniciar efecto para reconectar
            const newWs = new WebSocket(wsUrl);
            wsRef.current = newWs;
            // No configuramos eventos aquí, el efecto se encargará de eso al re-ejecutarse
          }
        }, 5000);
      };

      // Limpiar al desmontar
      return () => {
        console.log("🧹 Limpiando conexión WebSocket");
        clearInterval(heartbeatInterval);
        
        if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
          ws.close(1000, "Componente desmontado");
        }
      };
    }
  }, [currentUser, friendId]);

  // Cargar datos iniciales
  useEffect(() => {
    if (friendId) {
      getFriendUsername(friendId);
      fetchMessages();
    }
  }, [currentUser, friendId]);

  // Scroll al final cuando hay nuevos mensajes
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Enviar mensaje a través de WebSocket y BD
  const sendMessage = async () => {
    if (input.trim() === "") return;
    
    // Crear mensaje con un ID único
    const messageId = Date.now();
    const newMessage = {
      id: messageId,
      id_friend_emisor: currentUser,
      id_friend_receptor: friendId,
      content: input,
      date: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    // 1. Mostrar mensaje localmente de inmediato para mejor UX
    setMessages(prevMessages => [...prevMessages, newMessage]);
    setInput("");

    // 3. Enviar mensaje por WebSocket si está conectado
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      try {
        wsRef.current.send(JSON.stringify(newMessage));
        console.log("📤 Mensaje enviado por WebSocket:", newMessage);
      } catch (wsError) {
        console.error("❌ Error al enviar por WebSocket:", wsError);
      }
    } else {
      console.warn("⚠️ WebSocket no conectado, mensaje guardado solo en BD");
      
      // Si el WebSocket no está conectado, podríamos volver a cargar mensajes
      // después de un breve retraso para asegurar que ambos usuarios están sincronizados
      setTimeout(() => {
        if (wsRef.current?.readyState !== WebSocket.OPEN) {
          console.log("🔄 Recargando mensajes debido a WebSocket desconectado");
          fetchMessages();
        }
      }, 1000);
    }
  };

  if (isLoading) return <div className="loading">Cargando mensajes...</div>;

  return (
    <div className="chat-wrapper">
      <h2 className="chat-title">
        CHAT CON {friendUsername}
        {wsConnected ? 
          <span className="ws-status connected"> 🟢 Conectado</span> : 
          <span className="ws-status disconnected"> 🔴 Reconectando...</span>
        }
      </h2>

      <div className="chat-box friends-scroll">
        {messages.length > 0 ? (
          messages.map(msg => (
            <MessageBubble 
              key={msg.id}
              sender={msg.id_friend_emisor}
              text={msg.content}
              time={msg.date || new Date().toLocaleTimeString()}
              isUser={msg.id_friend_emisor === currentUser}
            />
          ))
        ) : (
          <div className="no-messages">No hay mensajes aún. ¡Inicia la conversación!</div>
        )}
        <div ref={chatEndRef} />
      </div>

      <form className="chat-form" onSubmit={(e) => { e.preventDefault(); sendMessage(); }}>
        <input
          type="text"
          className="chat-input"
          placeholder="Escribe un mensaje..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button 
          type="submit" 
          className="chat-button"
          disabled={!wsConnected && messages.length > 0}
        >
          Enviar
        </button>
      </form>
    </div>
  );
}

function MessageBubble({ sender, text, time, isUser }) {
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} gap-2.5 mb-3`}>
      {/* 🔹 Avatar solo para mensajes recibidos */}
      {!isUser && <img className="w-8 h-8 rounded-full" src="/images/icono_usuario.png" alt={`${sender} image`} />}
      
      {/* 🔹 Contenedor del mensaje con mejor control del texto */}
      <div className={`flex flex-col w-full max-w-[250px] p-2 border-gray-200 
          ${isUser ? "bg-green-500 text-white rounded-s-xl rounded-ee-xl" : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-e-xl rounded-es-xl"} relative`}>
        
        {/* 🔹 Mensaje con corrección para evitar desbordamiento */}
        <p className="text-sm font-normal py-2 flex-1 break-words">
          {text}
        </p>

        {/* 🔹 Fecha/hora alineada a la derecha */}
        <div className="w-full flex justify-end mt-1">
          <span className="text-xs font-normal text-gray-200 dark:text-gray-300">{time || "12:30 PM"}</span>
        </div>
      </div>
    </div>
  );
}

// Estilos adicionales para el estado de WebSocket
// Añade estos estilos a tu archivo chat.css
/*
.ws-status {
  font-size: 0.8rem;
  margin-left: 10px;
  font-weight: normal;
}

.ws-status.connected {
  color: #4CAF50;
}

.ws-status.disconnected {
  color: #F44336;
}
*/

