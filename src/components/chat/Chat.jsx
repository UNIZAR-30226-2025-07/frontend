import { useState, useEffect, useRef } from "react";
import "../../styles/chat.css";

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [friendUsername, setFriendUsername] = useState("");
  const chatEndRef = useRef(null);

  // Obtener parámetros de la URL
  const queryParams = new URLSearchParams(window.location.search);
  const currentUser = queryParams.get("userId");
  const friendId = queryParams.get("friendId");

  // Función para obtener el username del amigo
  const getFriendUsername = async (userId) => {
    const url = `http://localhost:3000/main-screen/get-user/${userId}`;
    
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
      
      const data = await response.json();
      setFriendUsername(data.username || `Usuario ${userId}`);
    } catch (error) {
      console.error("Error obteniendo el nombre del usuario:", error);
      setFriendUsername(`Usuario ${userId}`);
    }
  };

  // Función para cargar mensajes directamente desde la BD
  const fetchMessages = async () => {
    if (!currentUser || !friendId) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(
        `http://localhost:3000/messages/get_messages/${currentUser}/${friendId}`
      );
      
      if (!response.ok) throw new Error("Error al obtener mensajes");
      
      const data = await response.json();
      
      // Actualizamos el estado solo con los datos frescos de la BD
      setMessages(data || []);
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar mensajes al inicio y cada cierto tiempo
  useEffect(() => {
    if (friendId) {
      getFriendUsername(friendId);
      fetchMessages();
    }
    
    // Opcional: Recargar mensajes periódicamente
    //const interval = setInterval(fetchMessages, 5000); // Cada 5 segundos
    
    //return () => clearInterval(interval);
  }, [currentUser, friendId]);

  // Scroll al final cuando hay nuevos mensajes
  useEffect(() => {
    chatEndRef.current?.scrollIntoView();
  }, [messages]);

  // Enviar mensaje (guardar en BD y luego recargar)
  const sendMessage = async () => {
    if (input.trim() !== "") {
      const newMessage = {
        id: Date.now(),  // Usamos el timestamp como ID único
        id_friend_emisor: currentUser,
        id_friend_receptor: friendId,
        content: input,
        date: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };

      // Enviar el mensaje a la base de datos
      try {
        const response = await fetch(`http://localhost:3000/messages/add_message/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newMessage),
        });

        const result = await response.json();
        if (result.message === "Mensaje enviado correctamente.") {
          // Si el mensaje se envió correctamente, actualizar los mensajes
          await fetchMessages();
          setInput("");
        } else {
          console.error("❌ Error al enviar el mensaje:", result.message);
        }
      } catch (error) {
        console.error("❌ Error al enviar el mensaje:", error);
      }
    }
  };

  if (isLoading) return <div className="loading">Cargando mensajes...</div>;

  return (
    <div className="chat-wrapper">
      <h2 className="chat-title">CHAT CON {friendUsername}</h2>

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
          <div className="no-messages"></div>
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
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button type="submit" className="chat-button">
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
