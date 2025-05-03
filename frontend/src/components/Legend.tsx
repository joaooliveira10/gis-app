import { useState, useEffect } from "react";
import "../styles/legend.css";

interface LegendProps {
  thematicView: string;
}

const Legend = ({ thematicView }: LegendProps) => {
  const [items, setItems] = useState<{ color: string; label: string }[]>([]);
  const [title, setTitle] = useState<string>("");

  useEffect(() => {
    switch (thematicView) {
      case "populacao":
        setTitle("População");
        setItems([
          { color: "#A6CEE3", label: "Até 10.000 hab." },
          { color: "#FDB462", label: "10.001 - 50.000 hab." },
          { color: "#B2182B", label: "Acima de 50.000 hab." },
        ]);
        break;
      case "pib_per_capita":
        setTitle("PIB per capita");
        setItems([
          { color: "#D1E5F0", label: "Até R$ 30.000" },
          { color: "#92C5DE", label: "R$ 30.001 - R$ 100.000" },
          { color: "#2166AC", label: "Acima de R$ 100.000" },
        ]);
        break;
      case "densidade_demografica":
        setTitle("Densidade Demográfica");
        setItems([
          { color: "#FFFFCC", label: "Até 5 hab/km²" },
          { color: "#A1DAB4", label: "5,1 - 20 hab/km²" },
          { color: "#225EA8", label: "Acima de 20 hab/km²" },
        ]);
        break;
      default:
        setTitle("");
        setItems([]);
    }
  }, [thematicView]);

  if (items.length === 0) return null;

  return (
    <div className="map-legend">
      <h4>Legenda - {title}</h4>
      {items.map((item, index) => (
        <div key={index} className="legend-item">
          <span
            className="color-box"
            style={{ backgroundColor: item.color }}
          ></span>
          <span className="legend-label">{item.label}</span>
        </div>
      ))}
    </div>
  );
};

export default Legend;
