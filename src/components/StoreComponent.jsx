import React from "react";

const StoreComponent = () => {
  const styles = {
    container: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      height: "100vh",
      background: "#2c0045",
      color: "white",
      fontFamily: "Arial, sans-serif",
    },
    header: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      width: "100%",
      maxWidth: "700px",
      marginBottom: "20px",
    },
    backButton: {
      background: "none",
      border: "none",
      cursor: "pointer",
      padding: "5px",
      display: "flex",
      alignItems: "center",
    },
    title: {
      fontSize: "36px",
      fontWeight: "bold",
      textAlign: "center",
      flexGrow: 1,
    },
    storeContainer: {
      display: "grid",
      gridTemplateColumns: "3fr 1fr", // Tienda en 3 partes, pase de batalla en 1
      gap: "20px",
      padding: "20px",
      background: "#4b2375",
      borderRadius: "15px",
      width: "90%",
      maxWidth: "900px",
    },
    itemsGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(2, 1fr)",
      gap: "15px",
    },
    item: {
      background: "#9e8cb8",
      padding: "10px",
      borderRadius: "10px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
    },
    image: {
      width: "120px",
      height: "120px",
      borderRadius: "10px",
    },
    priceTag: {
      background: "#32baff",
      padding: "5px 10px",
      borderRadius: "10px",
      fontWeight: "bold",
      marginTop: "5px",
    },
    battlePassContainer: {
      background: "#9e8cb8",
      padding: "15px",
      borderRadius: "10px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
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
  };

  return (
    <div style={styles.container}>
      {/* 🔹 Encabezado con botón de volver */}
      <div style={styles.header}>
        <a href="../" style={styles.backButton}>
          <img src="/images/volver.png" alt="Volver" style={{ width: "35px" }} />
        </a>
        <h1 style={styles.title}>Tienda</h1>
      </div>

      {/* 🔹 Contenedor de la tienda */}
      <div style={styles.storeContainer}>
        {/* 🔹 Tienda de aspectos */}
        <div style={styles.itemsGrid}>
          <div style={styles.item}>
            <img src="/images/aspectos/processed_aspecto1.png" alt="Skin 1" style={styles.image} />
            <div style={styles.priceTag}>4,99 €</div>
          </div>
          <div style={styles.item}>
            <img src="/images/aspectos/processed_aspecto2.png" alt="Skin 2" style={styles.image} />
            <div style={styles.priceTag}>7,99 €</div>
          </div>
          <div style={styles.item}>
            <img src="/images/aspectos/processed_aspecto3.png" alt="Skin 3" style={styles.image} />
            <div style={styles.priceTag}>7,99 €</div>
          </div>
          <div style={styles.item}>
            <img src="/images/aspectos/processed_aspecto4.png" alt="Skin 4" style={styles.image} />
            <div style={styles.priceTag}>4,99 €</div>
          </div>
        </div>

        {/* 🔹 Pase de batalla */}
        <div style={styles.battlePassContainer}>
          <h2>Pase de batalla</h2>
          <div style={styles.priceTag}>19,99 €</div>
          <img src="/images/aspectos/pase_batalla.png" alt="Pase de batalla" style={styles.battlePassImage} />
          <img src="/images/candado_cerrado.png" alt="Bloqueado" style={styles.lockIcon} />
        </div>
      </div>
    </div>
  );
};

export default StoreComponent;
