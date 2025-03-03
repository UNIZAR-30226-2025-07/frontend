import { useState } from "react";

const images = [
  { src: "/images/aspectos/processed_aspecto1.png", label: "Espagna" },
  { src: "/images/aspectos/processed_aspecto2.png", label: "Donut" },
  { src: "/images/aspectos/processed_aspecto3.png", label: "Rosquilla" },
  { src: "/images/aspectos/processed_aspecto4.png", label: "Futbol" },
];

export default function ImageSelector() {
  const [index, setIndex] = useState(0);

  const prevImage = () => setIndex((index - 1 + images.length) % images.length);
  const nextImage = () => setIndex((index + 1) % images.length);

  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center", 
      backgroundColor: "#ddd", padding: "20px", borderRadius: "10px",
      width: "200px", // Ajusta según sea necesario
      position: "relative"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <button 
          onClick={prevImage} 
          style={{ fontSize: "20px", border: "none", background: "none", cursor: "pointer" }}>
          &lt;
        </button>
        <div style={{ textAlign: "center" }}>
          <img 
            src={images[index].src} 
            alt={images[index].label} 
            width="80" 
            height="80" 
            style={{ objectFit: "cover", aspectRatio: "1/1", borderRadius: "50%" }}
          />
          <p style={{ marginTop: "5px", fontWeight: "bold" }}>{images[index].label}</p>
        </div>
        <button 
          onClick={nextImage} 
          style={{ fontSize: "20px", border: "none", background: "none", cursor: "pointer" }}>
          &gt;
        </button>
      </div>
    </div>
  );
}




