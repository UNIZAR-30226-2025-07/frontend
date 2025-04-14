import React from 'react';
import '../styles/PlayButton.css'; // Asegúrate de tener este archivo CSS

export default function PlayButton({ text = "Jugar", href = "/game" }) {
  return (
    <a className="play-button" href={href}>
      {text}
    </a>
  );
}

