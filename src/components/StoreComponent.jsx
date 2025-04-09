import React, { useEffect, useState } from "react";
import { getUserIdFromAccessToken } from '/src/utils/auth.js';
import { showNotification } from "../utils/notification";

const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;

const StoreComponent = () => {
  const [items, setItems] = useState([]);
  const [userSkins, setUserSkins] = useState([]);  // Estado para almacenar las skins adquiridas
  const [countdown, setCountdown] = useState(0);
  const [showModal, setShowModal] = useState(false); // Estado para mostrar la ventana emergente
  const [selectedItem, setSelectedItem] = useState(null); // Estado para almacenar el item seleccionado
  const [hasBattlePass, setHasBattlePass] = useState(false); // Estado para indicar si el usuario tiene el pase de temporada

  useEffect(() => {
    const calculateTimeUntilMidnight = () => {
      const now = new Date();
      const tomorrow = new Date();
      tomorrow.setDate(now.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0); // Establecer las 00:00 del día siguiente
      return tomorrow - now; // Diferencia en milisegundos
    };
  
    const updateShopId = () => {
      const now = new Date();
      const shopId = now.getDate(); // Usar el día del mes como id de la tienda
      localStorage.setItem("shopId", shopId.toString());
      localStorage.setItem("lastShopUpdate", now.toISOString());
      return shopId;
    };
    
    const shopId = updateShopId(); // Actualizamos o recuperamos el id de la tienda
    console.log("shopId:", shopId);
  
    fetch(`http://localhost:3000/shop/getItems/${shopId}`)
      .then((res) => res.json())
      .then((data) => setItems(data))
      .catch((err) => console.error("Error al cargar tienda:", err));
  
    const userId = getUserIdFromAccessToken(); // Obtener el ID del usuario logueado
    console.log("userId:", userId);
  
    // Obtener las skins adquiridas por el usuario
    fetch(`http://localhost:3000/items/get-all-items/${userId}`)
      .then((res) => res.json())
      .then((data) => {
        const userItems = data && data.items ? data.items : [];
        setUserSkins(userItems);
      })
      .catch((err) => console.error("Error al obtener skins adquiridas:", err));
  
    // Comprobar si el usuario ya tiene el pase de temporada
    fetch(`http://localhost:3000/shop/hasSP/${userId}`)
      .then((res) => res.json())
      .then((data) => {
        setHasBattlePass(data.hasSeasonPass || false);
      })
      .catch((err) => console.error("Error al comprobar el pase de temporada:", err));
  
    const updateCountdown = () => {
      setCountdown(calculateTimeUntilMidnight());
    };
  
    updateCountdown(); // Calcular inicialmente
  
    const interval = setInterval(() => {
      updateCountdown();
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

  const handleItemClick = (item, isAcquired) => {
    // Si el item ya está adquirido, no hacemos nada
    if (isAcquired) return;
    
    setSelectedItem(item);
    setShowModal(true); // Muestra el modal cuando se hace clic en un item no adquirido
  };

  const handleBattlePassClick = () => {
    setSelectedItem({
      name_item: "Pase de temporada",
      item_price: 20,
      image_url: "/images/aspectos/Pase de temporada.png",
    });
    setShowModal(true); // Muestra el modal para el pase de batalla
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedItem(null); // Resetea el item seleccionado al cerrar el modal
  };

  const handleCancel = () => {
    setShowModal(false); // Cierra el modal sin hacer nada
  };

  const handlePay = () => {
    // Parámetros de la petición de pago
    const paymentData = {
      amount: selectedItem.item_price * 100,
      currency: "EUR", // Puedes cambiarlo a la moneda que necesites
      paymentMethodId: "pm_card_visa", // Aquí deberías tomar el ID del método de pago seleccionado
    };
    const userId = getUserIdFromAccessToken(); // Obtiene el ID del usuario logueado    

    // Realizamos la petición para procesar el pago
    fetch("http://localhost:3000/payment/pay", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(paymentData),
    })
      .then((response) => response.json())
      .then(async (data) => {
        if (data.success) {
          // Si el pago se realiza con éxito, realizamos la segunda petición para asignar el item
          const assignItemData = {
            itemId: selectedItem.id_item, // Asegúrate de tener el id del item en selectedItem
            userId: userId, // Aquí deberías obtener el ID del usuario logueado
          };

          const response = await fetch("http://localhost:3000/items/assign-item", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(assignItemData),
          });
          
          if (!response.ok) throw new Error('Error asignar el item');

          const result = await response.json();
          
          // Actualizar el estado local para reflejar la compra sin necesidad de recargar
          setUserSkins([...userSkins, { id: selectedItem.id_item }]);
          
          showNotification("Pago realizado correctamente.", "success");
          setShowModal(false);
        } else {
          showNotification("El pago no fue procesado con éxito. Intenta nuevamente.", "error");
        }
      })
      .catch((error) => {
        console.error("Error al procesar el pago:", error);
        showNotification("Hubo un error al procesar el pago.", "error");
      });
  };

  const handlePaySP = () => {
    const paymentData = {
      amount: 20 * 100,
      currency: "EUR",
      paymentMethodId: "pm_card_visa",
    };
    const userId = getUserIdFromAccessToken();

    fetch("http://localhost:3000/payment/pay", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(paymentData),
    })
      .then((response) => response.json())
      .then(async (data) => {
        if (data.success) {
          // Registrar la compra del pase de temporada en la base de datos
          const assignBattlePassData = { user_id: userId };

          const response = await fetch("http://localhost:3000/shop/purchasedSP", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(assignBattlePassData),
          });

          if (!response.ok) throw new Error("Error al asignar el pase de temporada");

          const result = await response.json();

          setHasBattlePass(true); // Actualizar el estado local
          showNotification("Pase de temporada adquirido correctamente.", "success");
          setShowModal(false);
        } else {
          showNotification("El pago no fue procesado con éxito. Intenta nuevamente.", "error");
        }
      })
      .catch((error) => {
        console.error("Error al procesar el pago:", error);
        showNotification("Hubo un error al procesar el pago.", "error");
      });
  };

  const styles = {
    storeContainer: {
      display: "grid",
      gridTemplateColumns: "3fr 1fr",
      padding: "20px",
      background: "#383848",
      borderRadius: "15px",
      width: "100%",
      maxWidth: "800px",
      gap: "20px",
      placeItems: "center", // Centra los elementos en ambas direcciones
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
      cursor: "pointer", // Cambia el cursor al pasar sobre los items
    },
    acquiredItem: {
      background: "#57257a",
      padding: "10px",
      borderRadius: "10px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      width: "220px",
      cursor: "default", // Cursor normal para items ya adquiridos
      position: "relative", // Para posicionar el mensaje de "Ya adquirido"
      opacity: 0.8, // Ligera opacidad para indicar que no está disponible
    },
    priceTag: {
      background: "#32baff",
      padding: "5px 10px",
      borderRadius: "10px",
      fontWeight: "bold",
      marginTop: "5px",
    },
    acquiredTag: {
      background: "#38c172", // Verde para mostrar que ya está adquirido
      padding: "5px 10px",
      borderRadius: "10px",
      fontWeight: "bold",
      marginTop: "5px",
      color: "white",
    },
    acquiredOverlay: {
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      background: "rgba(56, 193, 114, 0.8)", // Verde semi-transparente
      color: "white",
      fontWeight: "bold",
      padding: "10px 15px",
      borderRadius: "10px",
      zIndex: 2,
    },
    battlePassContainer: {
      gridTemplateColumns: "1fr",
      padding: "15px",
      borderRadius: "10px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      width: "220px",
      marginLeft: "15px",
      cursor: "pointer", // Cambia el cursor al pasar sobre el pase de batalla
      marginRight: "15px",
      marginTop: "-15px",
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
      fontSize: "20px",
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
      width: "240px",
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
    },
    modalBackground: {
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      background: "rgba(0, 0, 0, 0.5)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    },
    modalContainer: {
      background: "#383848",
      padding: "30px",
      borderRadius: "15px",
      width: "80%",
      maxWidth: "500px",
      textAlign: "center",
    },
    modalTitle: {
      fontWeight: "bold",
      color: "white",
      marginBottom: "20px",
      fontSize: "24px",
    },
    modalPrice: {
      background: "#32baff",
      padding: "10px",
      borderRadius: "10px",
      fontWeight: "bold",
      fontSize: "18px",
      marginBottom: "20px",
    },
    modalButton: {
      padding: "10px 20px",
      borderRadius: "10px",
      fontWeight: "bold",
      fontSize: "16px",
      margin: "10px",
      cursor: "pointer",
    },
    payButton: {
      background: "#38c172", // verde
      color: "white",
    },
    cancelButton: {
      background: "#e74c3c", // rojo
      color: "white",
    },
  };

  return (
    <div>
      <div style={styles.storeContainer}>
        {/* Tienda de ítems */}
        <div style={styles.itemsGrid}>
          {items.map((item, index) => {
            // Verificar si el usuario ya tiene el item
            const isAcquired = userSkins.some((skin) => skin.id === item.id_item);
            
            return (
              <div
                key={index}
                style={isAcquired ? styles.acquiredItem : styles.item}
                onClick={() => handleItemClick(item, isAcquired)} // Solo permitimos el click si no está adquirido
              >
                <img
                  src={`/images/aspectos/${item.name_item}.png`}
                  alt={item.name_item}
                  style={{ 
                    width: "120px", 
                    height: "120px", 
                    borderRadius: "10px",
                    filter: isAcquired ? "grayscale(30%)" : "none" // Aplicamos un filtro gris suave para items adquiridos
                  }}
                />
                <div style={styles.nameText}>{item.name_item}</div>
                
                {isAcquired ? (
                  <>
                    <div style={styles.acquiredTag}>Ya adquirido</div>
                    
                  </>
                ) : (
                  <div style={styles.priceTag}>{item.item_price.toFixed(2)} €</div>
                )}
              </div>
            );
          })}
        </div>

       {/* Pase de temporada */}
       <div
        style={{
          ...styles.battlePassContainer,
        }}
        onClick={!hasBattlePass ? handleBattlePassClick : undefined} // Deshabilitar el click si ya está adquirido
      >
        <div     
          style={{
              ...styles.countdownBox,
              opacity: 1, // Aseguramos que la opacidad de "Nueva tienda en" no cambie
            }}
        >
          Nueva tienda en: {formatCountdown(countdown)}
        </div>

        <div style={{
          ...styles.pruebaBox,
          cursor: hasBattlePass ? "default" : "pointer", // Cambiar el cursor si ya está adquirido
          opacity: hasBattlePass ? 0.8 : 1, // Reducir opacidad si ya está adquirido
        }}>
          <div style={styles.nameText2}>Pase de temporada</div>
          <img
            src="/images/aspectos/Pase de temporada.png"
            alt="Pase de temporada"
            style={{
              ...styles.battlePassImage,
              filter: hasBattlePass ? "grayscale(30%)" : "none", // Aplicar filtro gris si ya está adquirido
            }}
          />
          {hasBattlePass ? (
            <div style={styles.acquiredTag}>Ya adquirido</div>
          ) : (
            <div style={styles.priceTag}>20.00€</div>
          )}
        </div>
      </div>
      </div>

      {/* Modal de compra */}
      {showModal && (
        <div style={styles.modalBackground}>
          <div style={styles.modalContainer}>
            <div style={styles.modalTitle}>{selectedItem.name_item}</div>
            <img
              src={`/images/aspectos/${selectedItem.name_item}.png` || "/images/aspectos/default.png"}
              alt={selectedItem.name_item}
              style={{
                display: "block", // Hace que la imagen sea un elemento de bloque
                margin: "0 auto", // Centra la imagen horizontalmente
                width: "120px",
                height: "120px",
                borderRadius: "10px",
                marginBottom: "20px",
              }}
            />
            <div style={styles.modalPrice}>{selectedItem.item_price.toFixed(2)} €</div>
            <button
              style={{ ...styles.modalButton, ...styles.payButton }}
              onClick={selectedItem.name_item == "Pase de temporada" ? handlePaySP : handlePay}
            >
              Pagar
            </button>
            <button
              style={{ ...styles.modalButton, ...styles.cancelButton }}
              onClick={handleCancel}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
      <div id="notification" className="notification"></div>
    </div>
  );
};

export default StoreComponent;

