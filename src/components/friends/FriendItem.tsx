import { useState, useEffect } from "react";
import FriendItem from "./FriendsList.astro";
import "../../styles/friendItem.css";

export default function FriendsList({ userId }: { userId: string }) {
  const [friends, setFriends] = useState<{ id: string; nombre: string }[]>([]);

  useEffect(() => {
    if (userId) {
      fetch(`http://localhost:3000/friend/friends/${userId}`, {
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
  }, [userId]);

  return (
    <div className="friends-list">
      {friends.length > 0 && <h3>Lista de amigos</h3>}
      {friends.length > 0 ? (
        friends.map((friend) => (
          <FriendItem key={friend.id} name={friend.nombre} status="En línea" />
        ))
      ) : (
        <div className="no-friends">
          <p>No tienes amigos aún.</p>
        </div>
      )}
    </div>
  );
}