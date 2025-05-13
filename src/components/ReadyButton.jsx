import React, { useState, useEffect } from 'react';
import { fetchWithToken } from '../utils/fetchWithToken';
import { getUserIdFromAccessToken } from '../utils/auth'; // Importar la función para obtener el userId de las cookies
import '../styles/PlayButton.css'; // Importar el archivo CSS

const ReadyButton = ({ userId }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [buttonText, setButtonText] = useState('Jugar'); // Texto inicial que coincide con el servidor
  
  useEffect(() => {
    // Este código se ejecuta solo en el cliente después de la hidratación
    setButtonText('Listo'); // Cambia a 'Listo' después de la hidratación
  }, []);

  // Función para obtener el gameId de las cookies
  const getGameIdFromCookies = () => {
    const cookies = document.cookie.split('; ');
    for (let cookie of cookies) {
      const [key, value] = cookie.split('=');
      if (key === 'gameId') {
        return value;
      }
    }
    return null; // Retorna null si no se encuentra la cookie
  };

  const handleReady = async () => {
    try {
      setIsLoading(true); // Mostrar estado de carga

      const gameId = getGameIdFromCookies(); // Obtener gameId de las cookies
      if (!gameId) {
        alert('No se encontró el ID de la partida en las cookies.');
        setIsLoading(false);
        return;
      }
      const userId = getUserIdFromAccessToken();

      // Primera petición: Ponerse en listo
      const bodyC = {
        gameId,
        userId,
      };

      const responseC = await fetchWithToken('http://galaxy.t2dc.es:3000/private/ready', {
        method: 'POST',
        body: JSON.stringify(bodyC),
      });

      if (!responseC.ok) {
        const errorText = await responseC.text();
        console.error('❌ Error al ponerse en listo:', errorText);
        alert('Hubo un error al ponerse en listo. Intenta nuevamente.');
        setIsLoading(false); // Ocultar estado de carga
        return;
      }

      const dataC = await responseC.json();
      console.log('✅ Se ha puesto en listo correctamente:', dataC);

      // Segunda petición: Obtener el enlace
      const checkLink = async () => {
        try {
          const responseLink = await fetchWithToken(`http://galaxy.t2dc.es:3000/private/link/${gameId}`, {
            method: 'GET',
          });

          if (responseLink.ok) {
            const dataLink = await responseLink.json();
            console.log('✅ Enlace obtenido:', dataLink);

            // Guardar la cookie "salidaControlada" antes de redirigir
            document.cookie = 'salidaControlada=true; path=/; SameSite=Lax;';

            window.location.href = "/game"; // Redirigir al enlace
          } else {
            throw new Error('El enlace aún no está disponible.');
          }
        } catch (error) {
          console.log('⏳ El enlace aún no está disponible. Reintentando...');
          setTimeout(checkLink, 2000); // Reintentar después de 2 segundos
        }
      };

      checkLink(); // Iniciar la comprobación del enlace
    } catch (error) {
      console.error('❌ Error al procesar la acción de listo:', error);
      alert('Hubo un problema al procesar la acción. Intenta nuevamente.');
      setIsLoading(false); // Ocultar estado de carga
    }
  };

  return (
    <button
      onClick={handleReady}
      className={`play-button ${isLoading ? 'disabled' : ''}`} // Aplicar la clase de estilo
      disabled={isLoading} // Deshabilitar el botón mientras está cargando
    >
      <span>{isLoading ? 'Cargando...' : buttonText}</span>
    </button>
  );
};

export default ReadyButton;
