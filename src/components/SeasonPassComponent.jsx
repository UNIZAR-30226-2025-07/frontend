import React, { useState, useEffect } from 'react';
import { getUserIdFromAccessToken } from '/src/utils/auth.js';
import { showNotification } from "../utils/notification";

function BattlePass() {
  const [currentPage, setCurrentPage] = useState(0);
  const [userLevel, setUserLevel] = useState(1); // Estado para almacenar el nivel del usuario
  const [userExperience, setUserExperience] = useState(0); // Estado para almacenar el nivel del usuario
  const [experienceToNextLevel, setExperienceToNextLevel] = useState(0); // Estado para almacenar el nivel del usuario
  const [premiumItems, setPremiumItems] = useState([]); // Estado para almacenar los ítems del pase de batalla de pago
  const [freeItems, setFreeItems] = useState([]); // Estado para almacenar las recompensas gratuitas
  const [hasBattlePass, setHasBattlePass] = useState(false); // Estado para almacenar si el usuario tiene el pase de batalla de pago
  const levelsPerPage = 5;
  const totalLevels = 20;
  
  // Simulate level data
  const levelData = Array.from({ length: totalLevels }, (_, i) => ({
    level: i + 1,
    freeReward: `Free ${i + 1}`,
    premiumReward: `Premium ${i + 1}`
  }));

  const nextPage = () => {
    if ((currentPage + 1) * levelsPerPage < totalLevels) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Fetch user level
  useEffect(() => {
    const userId = getUserIdFromAccessToken(); // Obtiene el ID del usuario logueado
    // Obtener el nivel del usuario
    fetch(`http://localhost:3000/season-pass/season-pass/getUserLevel/${userId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.level) {
          setUserLevel(data.level); // Actualiza el nivel del usuario
        }
      })
      .catch((err) => console.error("Error al obtener el nivel del usuario:", err));

    //Obtener la experiencia del usuario
    fetch(`http://localhost:3000/season-pass/season-pass/getUserExperience/${userId}`)
    .then((res) => res.json())
    .then((data) => {
      if (data && data.experience !== undefined && data.experience !== null) {
        setUserExperience(data.experience); // Actualiza el nivel del usuario
      }
    })
    .catch((err) => console.error("Error al obtener la experiencia del usuario:", err));

    // Obtener la experiencia necesaria para subir de nivel
    console.log("userLevel", userLevel);
    fetch(`http://localhost:3000/season-pass/season-pass/getExperienceToNextLevel/${userLevel}`)
    .then((res) => res.json())
    .then((data) => {
      console.log("Experiencia necesaria para el siguiente nivel:", data);
      if (data && data.experience) {
        setExperienceToNextLevel(data.experience); // Actualiza el nivel del usuario
      }
    })
    .catch((err) => console.error("Error al obtener la experiencia necesaria para el siguiente nivel:", err));

    // Obtener los ítems del pase de batalla de pago
    fetch(`http://localhost:3000/season-pass/season-pass/getItemsFromSeasonPass/${userId}/1`)
    .then((res) => {
      if (!res.ok) {
        throw new Error(`Error en la respuesta del servidor: ${res.status}`);
      }
      return res.json();
    })
    .then((data) => {
      console.log("Ítems del pase de batalla de pago:", data);
      if (Array.isArray(data)) {
        setPremiumItems(data); // Actualiza el estado con los ítems obtenidos
      } else {
        console.error("La respuesta de la API no es un array:", data);
      }
    })
    .catch((err) => console.error("Error al obtener los ítems del pase de batalla de pago:", err));
    
    // Obtener las recompensas gratuitas del pase de batalla
    fetch(`http://localhost:3000/season-pass/season-pass/getItemsFromLevels/${userId}`)
    .then((res) => res.json())
    .then((data) => {
      console.log("Recompensas gratuitas:", data);
      if (Array.isArray(data)) {
        setFreeItems(data); // Actualiza el estado con las recompensas gratuitas
      } else {
        console.error("La respuesta de la API no es un array:", data);
      }
    })
    .catch((err) => console.error("Error al obtener las recompensas gratuitas:", err));

    // Obtener si el usuario tiene desbloqueado el pase de batalla de pago
    fetch(`http://localhost:3000/season-pass/season-pass/hasUserSP/${userId}/1`)
    .then((res) => res.json())
    .then((data) => {
      if (data && data.unlocked !== undefined) {
        console.log("Usuario tiene pase de batalla:", data.unlocked);
        setHasBattlePass(data.unlocked); // Actualiza el estado con el resultado
      } else {
        console.error("La respuesta de la API no contiene el campo esperado:", data);
      }
    })
    .catch((err) =>  console.error("Error al obtener el estado del pase de batalla:", err));
  }, [userLevel]);
  

  // Get current page data
  const start = currentPage * levelsPerPage;
  const end = start + levelsPerPage;
  const pageLevels = levelData.slice(start, end);

  // Función para determinar el estilo de fondo del ítem según su estado
  const getItemBackgroundStyle = (item) => {
    if (!item) return "transparent";
    
    if (item.unlocked && !item.reclaimed) {
      return "#ffcc00"; // Amarillo para indicar que puede reclamarse
    } else if (item.unlocked && item.reclaimed) {
      return "#4e8ef8"; // Azul para indicar que ya está reclamado
    } else {
      return "transparent"; // Color original para ítems no desbloqueados
    }
  };

  return (
    <div className="container">
      <div className="header">
        <div className="level-box">
          <div className="level-text">NIVEL</div>
          <div className="level-number">{userLevel}</div>
        </div>
        
        <div>
          <div className="stars">
            <span className="star-icon">★</span> {userExperience}/{experienceToNextLevel}
            <div className="progress-bar">
            <div
              className="progress"
              style={{
                width: experienceToNextLevel > 0
                  ? `${(userExperience / experienceToNextLevel) * 100}%`
                  : "0%", // Maneja el caso donde experienceToNextLevel es 0
              }}
            ></div>
            </div>
          </div>
        </div>
        
        <div className="title">TEMPORADA 1</div>
      </div>

      <div className="rewards-container">
        <div className="nav-wrapper">
          <div className="navigation-arrow arrow-left" onClick={prevPage}>&#9664;</div>
          <div className="navigation-arrow arrow-right" onClick={nextPage}>&#9654;</div>
          
          <div className="level-numbers">
            {pageLevels.map((lvl) => {
              // Determina el color de fondo según el nivel
              const backgroundColor =
                lvl.level < userLevel
                  ? "yellow" // Niveles completados
                  : lvl.level === userLevel
                  ? "green" // Nivel actual
                  : "transparent"; // Niveles no alcanzados

              return (
                <div
                  key={`level-${lvl.level}`}
                  style={{
                    backgroundColor,
                    color: "white",
                    padding: "5px",
                    borderRadius: "5px",
                    textAlign: "center",
                  }}
                >
                  {lvl.level}
                </div>
              );
            })}
          </div>
  
          <div className="rewards-row">
            {pageLevels.map((lvl) => {
              // Para mostrar los items del pase de temporada gratuito
              // Busca el ítem que corresponde al nivel actual
              const item = freeItems.find((item) => item.id_level === lvl.level);
              
              // Determina el estilo de fondo según el estado del ítem
              const backgroundStyle = getItemBackgroundStyle(item);

              // Función para manejar el clic en el ítem
              const handleItemClick = async () => {
                if (item && item.unlocked && !item.reclaimed && lvl.level <= userLevel) {
                  try {
                    const userId = getUserIdFromAccessToken(); // Obtiene el ID del usuario logueado
                    // Realiza el fetch para reclamar el ítem
                    const response = await fetch("http://localhost:3000/items/assign-item", {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({ itemId: item.id, userId: userId }), // Asegúrate de enviar el ID correcto
                    });
              
                    if (!response.ok) {
                      throw new Error(`Error en la respuesta del servidor: ${response.status}`);
                    }
              
                    console.log(`Ítem con ID ${item.id} reclamado con éxito.`);
              
                    // Recargar los datos de los ítems desde el backend
                    const res = await fetch(
                      `http://localhost:3000/season-pass/season-pass/getItemsFromLevels/${getUserIdFromAccessToken()}`
                    );
              
                    if (!res.ok) {
                      throw new Error(`Error al recargar los ítems: ${res.status}`);
                    }
              
                    const data = await res.json();
              
                    if (Array.isArray(data)) {
                      setFreeItems(data); // Actualiza el estado con los datos más recientes
                    } else {
                      console.error("La respuesta de la API no es un array:", data);
                    }
                  } catch (err) {
                    console.error("Error al reclamar el ítem o recargar los datos:", err);
                  }
                }
              };

              return (
                <div className={`reward-cell  ${lvl.level > userLevel ? "locked" :""}`} key={`free-${lvl.level}`} onClick={lvl.level <= userLevel ? handleItemClick : null}>
                  <div className="reward-item" style={{ background: backgroundStyle }}>
                    {item && item.name ? (
                      <img
                        src={`/images/aspectos/${item.name}.png`}
                        alt={`Free Reward ${lvl.level}`}
                        style={{ width: "50px", height: "50px", objectFit: "cover" }}
                      />
                    ) : (
                      <div
                        style={{
                          background: "trasnparent",
                          width: "50px",
                          height: "50px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "white",
                          border: "1px dashed #ffffff33",
                        }}
                      >
                        {/* Caja vacía */}
                      </div>
                    )}
                  </div>
                  {item && item.unlocked && item.reclaimed && (
                      <div className="claim-badge">&#10004;</div> // Muestra un check para indicar que puede reclamarse
                    )}
                </div>
              );
            })}
          </div>
          
          <div className="rewards-row">
            {pageLevels.map((lvl, index) => {
              // Para mostrar los items del pase de temporada de pago
              // Calcula el índice correcto del ítem basado en la página actual
              const itemIndex = currentPage * levelsPerPage + index;
              const currentItem = premiumItems[itemIndex];
              
              // Determina el estilo de fondo según el estado del ítem
              const backgroundStyle = getItemBackgroundStyle(currentItem);

              // Función para manejar el clic en el ítem
              const handleItemClick = async () => {
                if (currentItem && currentItem.unlocked && !currentItem.reclaimed) {
                  try {
                    const userId = getUserIdFromAccessToken(); // Obtiene el ID del usuario logueado
                    // Realiza el fetch para reclamar el ítem
                    const response = await fetch("http://localhost:3000/items/assign-item", {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({ itemId: currentItem.id, userId: userId }), // Asegúrate de enviar el ID correcto
                    });
              
                    if (!response.ok) {
                      throw new Error(`Error en la respuesta del servidor: ${response.status}`);
                    }
              
                    console.log(`Ítem con ID ${currentItem.id} reclamado con éxito.`);
              
                    // Recargar los datos de los ítems desde el backend
                    const res = await fetch(
                      `http://localhost:3000/season-pass/season-pass/getItemsFromSeasonPass/${getUserIdFromAccessToken()}/1`
                    );
              
                    if (!res.ok) {
                      throw new Error(`Error al recargar los ítems: ${res.status}`);
                    }
              
                    const data = await res.json();
              
                    if (Array.isArray(data)) {
                      setPremiumItems(data); // Actualiza el estado con los datos más recientes
                    } else {
                      console.error("La respuesta de la API no es un array:", data);
                    }
                  } catch (err) {
                    console.error("Error al reclamar el ítem o recargar los datos:", err);
                  }
                }
              };
              
              return (
                <div
                  className={`reward-cell premium-reward ${
                    hasBattlePass ? "hover-enabled" : "hover-disabled"
                  }`}
                  key={`premium-${lvl.level}`}
                  onClick={handleItemClick}
                >
                  <div className="reward-item" style={{ background: backgroundStyle }}>
                    {currentItem && currentItem.name ? (
                      <img
                        src={`/images/aspectos/${currentItem.name}.png`}
                        alt={`Premium Reward ${lvl.level}`}
                        style={{ width: "50px", height: "50px", objectFit: "cover" }}
                      />
                    ) : (
                      <div
                        style={{
                          background: backgroundStyle,
                          width: "50px",
                          height: "50px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "white",
                        }}
                      >
                        {lvl.premiumReward}
                      </div>
                    )}
                    {!hasBattlePass && (
                      <div className="premium-badge">&#x1F512;</div> // Muestra el candado si no tiene el pase
                    )}
                    {currentItem && currentItem.unlocked && currentItem.reclaimed && (
                      <div className="claim-badge">&#10004;</div> // Muestra un check para indicar que puede reclamarse
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      <div id="page-info">
        PÁGINA {currentPage + 1} / {Math.ceil(totalLevels / levelsPerPage)}
      </div>
      
      <div className="legend">
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: "#ffcc00" }}></div>
          <div className="legend-text">Disponible para reclamar</div>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: "#4e8ef8" }}></div>
          <div className="legend-text">Ya reclamado</div>
        </div>
      </div>
      
      <style>{`
        .container {
          width: 100%;
          max-width: 700px;
          margin: 0 auto;
          position: relative;
        }
        
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 20px;
        }
        
        .title {
          color: white;
          font-size: 36px;
          font-weight: bold;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
        }
        
        .subtitle {
          color: #eaeaea;
          font-size: 14px;
        }
        
        .page-info {
          color: white;
          font-size: 16px;
        }
        
        .level-box {
          background-color: #3a4559;
          border: 2px solid #545f73;
          padding: 5px 15px;
          color: white;
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 80px;
        }
        
        .level-text {
          font-size: 12px;
          margin-bottom: 5px;
        }
        
        .level-number {
          font-size: 32px;
          font-weight: bold;
        }
        
        .stars {
          display: flex;
          align-items: center;
          color: #f8d64e;
          font-size: 14px;
          margin-top: 5px;
        }
        
        .star-icon {
          color: #f8d64e;
          font-size: 16px;
          margin-right: 5px;
        }
        
        .progress-bar {
          background-color: #222;
          height: 10px;
          width: 150px;
          border-radius: 5px;
          position: relative;
          overflow: hidden;
          margin-left: 10px;
        }

        .progress {
          background-color: #f8d64e;
          height: 100%;
          border-radius: 5px;
          transition: width 0.3s ease; 
        }
        
        .battle-pass-grid {
          display: grid;
          grid-template-columns: repeat(8, 1fr);
          gap: 5px;
          margin-top: 20px;
        }
        
        .level-numbers {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          background-color: #3a4559;
          color: white;
          text-align: center;
          padding: 5px 0;
          border-bottom: 1px solid #ffffff22;
        }
        
        .rewards-row {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          height: 100px;
          gap: 5px;
          border-bottom: 1px solid #ffffff11;
        }
        
        .reward-cell {
          border: 2px solid #ffffff33;
          border-radius: 8px;
          background: linear-gradient(145deg, #3a4559, #2f374a);
          display: flex;
          justify-content: center;
          align-items: center;
          position: relative;
          transition: transform 0.2s ease;
        }
        
        .reward-cell:hover {
          transform: scale(1.05);
          z-index: 2;
        }
        
        .reward-item {
          width: 80%;
          height: 80%;
          display: flex;
          justify-content: center;
          align-items: center;
          position: relative;
          border-radius: 6px;
          overflow: hidden;
          box-shadow: inset 0 0 10px rgba(255, 255, 255, 0.1);
        }
        
        .premium-badge {
          position: absolute;
          top: 5px;
          right: 5px;
          background-color: white;
          border-radius: 50%;
          width: 15px;
          height: 15px;
          display: flex;
          justify-content: center;
          align-items: center;
          font-size: 10px;
        }
        
        .claim-badge {
          position: absolute;
          bottom: 5px;
          right: 5px;
          background-color: white;
          border-radius: 50%;
          width: 15px;
          height: 15px;
          display: flex;
          justify-content: center;
          align-items: center;
          font-size: 10px;
          color: green;
        }
        
        .premium-reward {
          background-color: #866118;
        }
        
        .rewards-container {
          position: relative;
          margin-top: 20px;
          border: 2px solid #ffffff33;
          border-radius: 12px;
          overflow: visible;
          box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
          padding: 10px;
          background-color: #2f3a4d;
        }
        
        .navigation-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          font-size: 30px;
          color: white;
          background-color: rgba(58, 69, 89, 0.8);
          width: 50px;
          height: 50px;
          display: flex;
          justify-content: center;
          align-items: center;
          border-radius: 50%;
          cursor: pointer;
          z-index: 10;
          transition: background-color 0.2s ease;
        }
        
        .navigation-arrow:hover {
          background-color: rgba(255, 255, 255, 0.2);
        }
        
        .arrow-left {
          left: -100px;
        }
        
        .arrow-right {
          right: -100px;
        }
        
        .nav-wrapper {
          position: relative;
        }

        /* Estilo para los ítems con hover habilitado */
        .hover-enabled {
          transition: transform 0.2s ease;
        }

        .hover-enabled:hover {
          transform: scale(1.05);
          z-index: 2;
        }

        /* Estilo para los ítems con hover deshabilitado */
        .hover-disabled {
          pointer-events: none; /* Deshabilita interacciones con el mouse */
          opacity: 0.6; /* Reduce la opacidad para indicar que está bloqueado */
        }
        
        #page-info {
          text-align: center;
          color: white;
          margin-top: 10px;
          font-weight: bold;
          font-size: 18px;
        }

        .legend {
          display: flex;
          justify-content: center;
          margin-top: 20px;
          gap: 20px;
        }

        .legend-item {
          display: flex;
          align-items: center;
        }

        .legend-color {
          width: 20px;
          height: 20px;
          margin-right: 8px;
          border-radius: 4px;
        }

        .legend-text {
          color: white;
          font-size: 14px;
        }
      `}</style>
      
      <style>{`
        body {
          margin: 0;
          padding: 0;
          font-family: 'Arial', sans-serif;
        }
      `}</style>
    </div>
  );
}

export default BattlePass;