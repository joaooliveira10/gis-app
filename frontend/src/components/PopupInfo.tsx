import { useEffect, useRef } from "react";
import Map from "ol/Map";
import Overlay from "ol/Overlay";
import "../styles/popup.css";

interface FeatureProperties {
  nome?: string;
  codigo_ibge?: string;
  prefeito?: string;
  populacao?: number;
  populacao_estimada?: number;
  area_territorial?: number;
  densidade_demografica?: number;
  pib_per_capita?: number;
  receitas_brutas?: number;
  despesas_brutas?: number;
}

interface Feature {
  properties: FeatureProperties;
}

interface PopupInfoProps {
  info: {
    coordinate: number[];
    feature: Feature;
  };
  map: Map | null;
  onClose: () => void;
}

const PopupInfo = ({ info, map, onClose }: PopupInfoProps) => {
  const popupRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<Overlay | null>(null);

  useEffect(() => {
    if (!map || !popupRef.current || !info) return;

    // Criar overlay para o popup se ainda não existir
    if (!overlayRef.current) {
      overlayRef.current = new Overlay({
        element: popupRef.current,
        autoPan: true,
        // autoPanAnimation: {
        //   duration: 250,
        // },
      });
      map.addOverlay(overlayRef.current);
    }

    // Posicionar o popup
    overlayRef.current.setPosition(info.coordinate);

    // Não remova o overlay no cleanup do useEffect
  }, [info, map]);

  useEffect(() => {
    return () => {
      try {
        if (map && overlayRef.current) {
          overlayRef.current.setPosition(undefined);
          // Garantir que o overlay existe antes de tentar remover
          const overlayId = overlayRef.current.getId();
          if (overlayId !== undefined && map.getOverlayById(overlayId)) {
            map.removeOverlay(overlayRef.current);
          }
          overlayRef.current = null;
        }
      } catch (e) {
        console.error("Erro ao limpar overlay:", e);
      }
    };
  }, [map]);

  if (!info?.feature) return null;

  const properties = info.feature.properties;

  // Formatar números para o padrão brasileiro
  const formatNumber = (value: number | null | undefined): string => {
    if (value === null || value === undefined) return "N/A";
    return Number(value).toLocaleString("pt-BR");
  };

  const formatCurrency = (value: number | null | undefined): string => {
    if (value === null || value === undefined) return "N/A";
    return Number(value).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
    });
  };

  return (
    <div ref={popupRef} className="popup">
      <div className="popup-content">
        <button className="popup-closer" onClick={onClose}>
          &times;
        </button>
        <h3>{properties.nome || "Município"}</h3>
        <table>
          <tbody>
            <tr>
              <th>Código IBGE:</th>
              <td>{properties.codigo_ibge || "N/A"}</td>
            </tr>
            <tr>
              <th>Prefeito:</th>
              <td>{properties.prefeito || "Não informado"}</td>
            </tr>
            <tr>
              <th>População:</th>
              <td>{formatNumber(properties.populacao)} hab.</td>
            </tr>
            <tr>
              <th>População estimada:</th>
              <td>{formatNumber(properties.populacao_estimada)} hab.</td>
            </tr>
            <tr>
              <th>Área:</th>
              <td>
                {properties.area_territorial
                  ? Number(properties.area_territorial).toFixed(2)
                  : "N/A"}{" "}
                km²
              </td>
            </tr>
            <tr>
              <th>Densidade:</th>
              <td>
                {properties.densidade_demografica
                  ? Number(properties.densidade_demografica).toFixed(2)
                  : "N/A"}{" "}
                hab/km²
              </td>
            </tr>
            <tr>
              <th>PIB per capita:</th>
              <td>{formatCurrency(properties.pib_per_capita)}</td>
            </tr>
            <tr>
              <th>Receitas:</th>
              <td>{formatCurrency(properties.receitas_brutas)}</td>
            </tr>
            <tr>
              <th>Despesas:</th>
              <td>{formatCurrency(properties.despesas_brutas)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PopupInfo;
