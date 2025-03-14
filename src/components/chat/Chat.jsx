import { useState, useEffect, useRef } from "react";
import "../../styles/chat.css"; // Asegúrate de que la ruta sea correcta

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const chatEndRef = useRef(null); // 🔹 Referencia al final del chat

  const currentUser = "user1"; // 🔹 Simulación del usuario actual

  useEffect(() => {
    if (typeof window === "undefined") return;

    const stored = localStorage.getItem("chat-messages");
    if (stored) {
      setMessages(JSON.parse(stored));
    } else {
      const dummy = [
        { id: 1, sender: "user2", text: "Hola, ¿cómo estás?", time: "11:45" },
        { id: 2, sender: "user1", text: "Muy bien, ¿y tú?", time: "11:46" }
      ];
      setMessages(dummy);
      localStorage.setItem("chat-messages", JSON.stringify(dummy));
    }
  }, []);

  // 🔹 Hacer scroll automático al último mensaje cuando se cargue o se agregue uno nuevo
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (input.trim() !== "") {
      const newMessage = {
        id: Date.now(),
        sender: currentUser,
        text: input,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };
      const updated = [...messages, newMessage];
      setMessages(updated);
      localStorage.setItem("chat-messages", JSON.stringify(updated));
      setInput("");
    }
  };

  return (
    <div className="chat-wrapper">
      <h2 className="chat-title">Chat con ...</h2>

      {/* 🔹 Caja de mensajes con scroll */}
      <div className="chat-box overflow-y-auto h-80">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} sender={msg.sender} text={msg.text} time={msg.time} isUser={msg.sender === currentUser} />
        ))}
        <div ref={chatEndRef} /> {/* 🔹 Este elemento "fantasma" ayuda a hacer scroll */}
      </div>

      <form className="chat-form" onSubmit={(e) => e.preventDefault()}>
        <input
          type="text"
          className="chat-input"
          placeholder="Escribe un mensaje..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              sendMessage();
            }
          }}
        />
        <button type="button" className="chat-button" onClick={sendMessage}>
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


