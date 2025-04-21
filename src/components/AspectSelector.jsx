import { useEffect, useState } from "react";

const decodeJWT = (token) => {
  try {
    if (!token) return null;
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(base64));
    return payload;
  } catch (error) {
    console.error("Error decodificando el JWT:", error);
    return null;
  }
};

const getUserIdFromAccessToken = () => {
  const cookies = document.cookie.split("; ");
  for (let cookie of cookies) {
    const [key, value] = cookie.split("=");
    if (key === "accessToken") {
      const payload = decodeJWT(value);
      return payload?.id || null;
    }
  }
  return null;
};

const setCookie = (name, value, days) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
};

export default function ImageSelector() {
  const userId = getUserIdFromAccessToken();
  const [images, setImages] = useState([]);
  const [index, setIndex] = useState(0);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const fetchItems = async () => {
      if (!userId) return;

      try {
        const response = await fetch(`http://localhost:3000/items/get-all-items/${userId}`);
        if (!response.ok) {
          throw new Error(`Error HTTP: ${response.status}`);
        }

        const data = await response.json();
        if (data) {
          setImages(data.items.map(item => ({ id: item.id, name: item.name })));
        } else {
          setImages([{ id: 1, name: "Aspecto Básico" }]);
        }
      } catch (error) {
        console.error("Error al obtener items:", error);
        setImages([{ id: 1, name: "Aspecto Básico" }]);
      }
    };

    fetchItems();
  }, [userId]);

  const prevImage = () => {
    const newIndex = (index - 1 + images.length) % images.length;
    setIndex(newIndex);
    setCookie("skin", images[newIndex]?.name + ".png" || "Aspecto Básico.png", 7); // Actualiza la cookie
  };

  const nextImage = () => {
    const newIndex = (index + 1) % images.length;
    setIndex(newIndex);
    setCookie("skin", images[newIndex]?.name + ".png" || "Aspecto Básico.png", 7); // Actualiza la cookie
  };

  const currentImage = images[index] || { name: "Aspecto Básico" };

  const handleLockClick = () => {
    window.location.href = "/login"; // Redirige a /login cuando se hace clic en el candado
  };

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        backgroundColor: "#ddd",
        padding: "20px",
        borderRadius: "10px",
        width: "250px",
        height: "200px",
        position: "relative",
        overflow: "hidden",
        boxSizing: "border-box"
      }}
    >
      {userId === null && hovered && (
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "rgba(0,0,0,0.5)",
          zIndex: 2
        }} onClick={handleLockClick}>
          <img
            src="images/candado_cerrado.png"
            alt="Locked"
            style={{
              width: "75%",
              height: "75%",
              objectFit: "contain"
            }}
          />
        </div>
      )}

      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        position: "relative",
        marginBottom: "10px",
        zIndex: 1,
        flex: 1
      }}>
        <button
          onClick={prevImage}
          style={{
            fontSize: "20px",
            border: "none",
            background: "none",
            cursor: "pointer",
            position: "absolute",
            left: "0",
            zIndex: 3
          }}
        >
          &lt;
        </button>

        <div style={{
          width: "80px",
          height: "80px",
          position: "relative",
          margin: "0 40px"
        }}>
          <img
            src={`/images/aspectos/${currentImage.name}.png`}
            alt={currentImage.name}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              borderRadius: "50%"
            }}
          />
        </div>

        <button
          onClick={nextImage}
          style={{
            fontSize: "20px",
            border: "none",
            background: "none",
            cursor: "pointer",
            position: "absolute",
            right: "0",
            zIndex: 3
          }}
        >
          &gt;
        </button>
      </div>

      <div style={{
        minHeight: "40px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        padding: "5px 10px",
        boxSizing: "border-box"
      }}>
        <p style={{
          fontWeight: "bold",
          textAlign: "center",
          margin: 0,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          maxWidth: "100%"
        }}>
          {currentImage.name}
        </p>
      </div>
    </div>
  );
}

