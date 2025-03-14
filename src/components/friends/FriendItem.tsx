import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import FriendItem from "./FriendsList.astro";

export default function FriendsList() {
  const { id } = useParams<{ id: string }>(); // 🔹 Obtenemos el ID de la URL
  const [friends, setFriends] = useState<{ id: string; nombre: string }[]>([]);

  useEffect(() => {
    if (id) {
      //fetch(`http://localhost:3000/friend/friends/${id}`, {
        fetch(`http://localhost:3000/friend/friends/1`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((data) => {
          setFriends(data);
        })
        .catch((error) => console.error("Error al obtener amigos:", error));
    }
  }, [id]);

  return (
    <div className="friends-list">
      <h3>Lista de amigos</h3>
      {friends.length > 0 ? (
        friends.map((friend) => (
          <FriendItem key={friend.id} name={friend.nombre} status="En línea" />
        ))
      ) : (
        <p>No tienes amigos aún.</p>
      )}
    </div>
  );
}

