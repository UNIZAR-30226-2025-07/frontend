import React, { useEffect, useState } from "react";

const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;

const StoreComponent = () => {
  const [items, setItems] = useState([]);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    const lastRefresh = localStorage.getItem("lastStoreRefresh");
    const now = Date.now();

    let shouldRefresh = true;
    if (lastRefresh && now - parseInt(lastRefresh) < THREE_DAYS_MS) {
      shouldRefresh = false;
    }

    if (shouldRefresh) {
      const newShopId = Math.floor(Math.random() * 3) + 1;
      localStorage.setItem("shopId", newShopId.toString());
      localStorage.setItem("lastStoreRefresh", now.toString());
    }

    const shopId = localStorage.getItem("shopId");

    fetch(`http:///localhost:3000/shop/shop/getItems/${shopId}`)
      .then((res) => res.json())
      .then((data) => setItems(data))
      .catch((err) => console.error("Error al cargar tienda:", err));

    const interval = setInterval(() => {
      const last = parseInt(localStorage.getItem("lastStoreRefresh") || "0");
      setCountdown(THREE_DAYS_MS - (Date.now() - last));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatCountdown = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h.toString().padStart(2, "0")}:${m
      .toString()
      .padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const styles = {
    storeContainer: {
      display: "grid",
      gridTemplateColumns: "3fr 1fr",
      //gap: "20px",
      padding: "20px",
      background: "#383848",
      borderRadius: "15px",
      width: "90%",
      maxWidth: "800px",
    },
    itemsGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(2, 1fr)",
      gap: "15px",
    },
    item: {
      background: "#57257a",
      padding: "10px",
      borderRadius: "10px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      width: "220px",
    },
    priceTag: {
      background: "#32baff",
      padding: "5px 10px",
      borderRadius: "10px",
      fontWeight: "bold",
      marginTop: "5px",
    },
    battlePassContainer: {
      //background: "#9e8cb8",
      padding: "15px",
      borderRadius: "10px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      width: "240px",
    },
    battlePassImage: {
      width: "200px",
      height: "200px",
      borderRadius: "20px",
      marginTop: "10px",
    },
    lockIcon: {
      width: "80px",
      marginTop: "20px",
    },
    nameText: {
      fontWeight: "bold",
      color: "white",
      marginTop: "10px",
      textAlign: "center",
    },

    nameText2: {
      fontWeight: "bold",
      color: "white",
      marginTop: "10px",
      textAlign: "center",
      fontSize: "20px"
    },
    
    countdownBox: {
      background: "#38c172", // verde
      color: "white",
      padding: "8px 12px",
      borderRadius: "10px",
      fontWeight: "bold",
      fontSize: "14px",
      marginBottom: "10px",
      textAlign: "center",
      width: "240px"
    },

    pruebaBox: {
      background: "#57257a",
      width: "240px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      borderRadius: "10px",
      gap: "20px",
      padding: "20px 20px",
    }
  };

  return (
  <div style={styles.storeContainer}>
  {/* Tienda de ítems */}
    <div style={styles.itemsGrid}>
      {items.map((item, index) => (
        <div key={index} style={styles.item}>
          <img
            src={`/images/aspectos/processed_aspecto${index + 1}.png`}
            alt={item.name_item}
            style={{ width: "120px", height: "120px", borderRadius: "10px" }}
          />
          <div style={styles.nameText}>{item.name_item}</div>
          <div style={styles.priceTag}>{item.item_price.toFixed(2)} €</div>
        </div>
      ))}
    </div>

    {/* Pase de batalla */}
    <div style={styles.battlePassContainer}>
      {/* 🔹 NUEVA TIENDA EN */}
      <div style={styles.countdownBox}>
        Nueva tienda en: {formatCountdown(countdown)}
      </div>

      <div style={styles.pruebaBox}>
      <div style={styles.nameText2}>Pase de batalla</div>
      <img
        src="/images/aspectos/pase_batalla.png"
        alt="Pase de batalla"
        style={styles.battlePassImage}
      />
      <div style={styles.priceTag}>19,99 €</div>
      </div>
    </div>
  </div>
  );
};

export default StoreComponent;
