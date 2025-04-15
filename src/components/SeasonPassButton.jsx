import { useState, useEffect } from 'react';
import { getUserIdFromAccessToken } from '/src/utils/auth.js';

export default function ProgressBarCard() {
  const [userLevel, setUserLevel] = useState(1); // Nivel actual del usuario
  const [userExperience, setUserExperience] = useState(0); // Experiencia actual del usuario
  const [experienceToNextLevel, setExperienceToNextLevel] = useState(100); // Experiencia necesaria para el siguiente nivel

  useEffect(() => {
    const userId = getUserIdFromAccessToken(); // Obtiene el ID del usuario desde el token
    if (userId) {
      // Obtener el nivel del usuario
      fetch(`http://localhost:3000/season-pass/season-pass/getUserLevel/${userId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data && data.level) {
            setUserLevel(data.level); // Actualiza el nivel del usuario
          }
        })
        .catch((err) => console.error("Error al obtener el nivel del usuario:", err));

      // Obtener la experiencia actual del usuario
      fetch(`http://localhost:3000/season-pass/season-pass/getUserExperience/${userId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data && data.experience !== undefined && data.experience !== null) {
            setUserExperience(data.experience); // Actualiza la experiencia actual del usuario
          }
        })
        .catch((err) => console.error("Error al obtener la experiencia del usuario:", err));
    }
  }, []);

  useEffect(() => {
    // Obtener la experiencia necesaria para subir de nivel
    if (userLevel > 0) {
      fetch(`http://localhost:3000/season-pass/season-pass/getExperienceToNextLevel/${userLevel}`)
        .then((res) => res.json())
        .then((data) => {
          if (data && data.experience) {
            setExperienceToNextLevel(data.experience); // Actualiza la experiencia necesaria para el siguiente nivel
          }
        })
        .catch((err) => console.error("Error al obtener la experiencia necesaria para el siguiente nivel:", err));
    }
  }, [userLevel]); // Ejecuta este efecto cuando el nivel del usuario cambie

  const handleClick = () => {
    window.location.href = 'seasonPass'; // Redirige a la página SeasonPass
  };

  // Calcula el porcentaje para el ancho de la barra
  const progressPercentage = (userExperience / (userLevel === 21 ? 4500 : experienceToNextLevel)) * 100;

  return (
    <div 
      className="bg-gradient-to-br from-slate-800 to-slate-900 shadow-xl rounded-xl p-6 w-72 relative cursor-pointer hover:shadow-2xl transition-all duration-300 border border-slate-700"
      onClick={handleClick}
    >
      {/* Título con gradiente */}
      <h3 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-4">Pase de temporada</h3>
      
      {/* Círculo con nivel - con un diseño más moderno */}
      <div className="absolute top-4 right-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold shadow-lg border-2 border-slate-700">
        {userLevel === 21 ? 20 : userLevel}
      </div>
      
      {/* Barra de progreso con formato x/x dentro */}
      <div className="mt-6 mb-3 bg-slate-700 rounded-full h-8 overflow-hidden relative shadow-inner">
        {/* Barra de progreso con gradiente */}
        <div 
          className="bg-gradient-to-r from-blue-500 to-purple-600 h-full rounded-full transition-all duration-500 ease-out flex items-center"
          style={{ width: `${progressPercentage}%` }}
        >
          {/* Efecto de brillo */}
          <div className="absolute top-0 h-1/3 w-full bg-white opacity-10 rounded-full"></div>
        </div>
        
        {/* Texto centrado en la barra completa */}
        <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-white">
          {userExperience}/{userLevel === 21 ? 4500 : experienceToNextLevel}XP
        </div>
      </div>
      
      {/* Indicadores de brillos decorativos */}
      <div className="flex justify-between mt-4">
        <div className="h-1 w-1 rounded-full bg-blue-400"></div>
        <div className="h-1 w-1 rounded-full bg-purple-400"></div>
        <div className="h-1 w-1 rounded-full bg-blue-400"></div>
        <div className="h-1 w-1 rounded-full bg-purple-400"></div>
        <div className="h-1 w-1 rounded-full bg-blue-400"></div>
      </div>
    </div>
  );
}