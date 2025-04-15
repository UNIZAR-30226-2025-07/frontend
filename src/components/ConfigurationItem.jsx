import React, { useState, useEffect } from "react";

const ConfigurationItem = () => {
  const [gameVolume, setGameVolume] = useState(82);
  const [musicVolume, setMusicVolume] = useState(38);
  const [isColorBlindMode, setIsColorBlindMode] = useState(true);

  // Efecto para sincronizar el volumen de la música con el reproductor global
  useEffect(() => {
    // Si existe el reproductor global, establecemos el volumen inicial
    if (window.bgMusicPlayer && window.bgMusicPlayer.audioPlayer) {
      // Actualizar el estado con el volumen actual del reproductor si existe
      const currentVolume = Math.round(window.bgMusicPlayer.audioPlayer.volume * 100);
      setMusicVolume(currentVolume);
    }
  }, []);

    // Función para actualizar el volumen de la música
    const handleMusicVolumeChange = (e) => {
      const newVolume = e.target.value;
      setMusicVolume(newVolume);
      
      // Actualizar el volumen en el reproductor global
      if (window.bgMusicPlayer && window.bgMusicPlayer.audioPlayer) {
        window.bgMusicPlayer.audioPlayer.volume = newVolume / 100;
        // Opcionalmente, guardar en localStorage para recordar entre sesiones
        localStorage.setItem('musicVolume', newVolume);
      }
    };

  const styles = {
    settingsContainer: {

    },

    button: {
      background: "none",
      border: "none",
      cursor: "pointer",
      padding: "5px",
      display: "flex",
      alignItems: "center",
      transition: "0.3s",
    },
    title: {
      color: "white",
      fontSize: "32px",
      fontWeight: "bold",
      textAlign: "center",
      flexGrow: 1, 
      margginTop: "7px",
    },
    
    panel: {
      background: "#383848",
      padding: "25px",
      borderRadius: "15px",
      width: "800px",
      minHeight: "350px",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-around",
    },
    settingItem: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      width: "100%",
      marginBottom: "15px",
    },
    settingLabel: {
      color: "white",
      fontSize: "16px",
      flexGrow: 1,
    },
    settingValue: {
      color: "white",
      fontSize: "16px",
      fontWeight: "bold",
      paddingRight: "15px",
    },
    slider: {
      width: "400px",
      height: "5px",
      background: "white",
      borderRadius: "5px",
      outline: "none",
      cursor: "pointer",
    },
    toggleButton: {
      width: "50px",
      height: "50px",
      borderRadius: "50%",
      background: "white",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      border: "3px solid red",
      cursor: "pointer",
    },
    toggleButtonActive: {
      border: "3px solid green",
    },
  };

  return (
    <div style={styles.settingsContainer}>

      {/* 🔹 Panel de configuración */}
      <div style={styles.panel}>
        {/* Volumen del juego */}
        <div style={styles.settingItem}>
          <span style={styles.settingLabel}><strong>Volumen del juego</strong></span>
          <span style={styles.settingValue}>{gameVolume}%</span>
          <input 
            type="range" 
            min="0" 
            max="100" 
            value={gameVolume} 
            style={styles.slider}
            onChange={(e) => setGameVolume(e.target.value)} 
          />
        </div>

        {/* Volumen de la música */}
        <div style={styles.settingItem}>
          <span style={styles.settingLabel}><strong>Volumen de la música</strong></span>
          <span style={styles.settingValue}>{musicVolume}%</span>
          <input 
            type="range" 
            min="0" 
            max="100" 
            value={musicVolume} 
            style={styles.slider}
            onChange={handleMusicVolumeChange} 
          />
        </div>

        {/* Modo daltónico */}
        <div style={styles.settingItem}>
          <span style={styles.settingLabel}><strong>Modo daltónico (en desarrollo)</strong></span>
          <button 
            style={{ 
              ...styles.toggleButton, 
              ...(isColorBlindMode ? styles.toggleButtonActive : {}) 
            }} 
            onClick={() => setIsColorBlindMode(!isColorBlindMode)}
          >
            <img 
              src={isColorBlindMode ? "/images/check_on.png" : "/images/check_off.png"} 
              alt="Modo daltónico" 
              style={{ width: "35px" }} 
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfigurationItem;
