import { useEffect, useRef, useState } from "react";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import ImageLayer from "ol/layer/Image";
import OSM from "ol/source/OSM";
import ImageWMS from "ol/source/ImageWMS";
import { fromLonLat } from "ol/proj";
import "../styles/map.css";
import PopupInfo from "./PopupInfo";
import Legend from "./Legend";

// Configurações do servidor - melhor usar variáveis de ambiente
const GEOSERVER_URL = "http://localhost:8085/geoserver/mato_grosso/wms";

// Interface para tipar o popupInfo
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
  [key: string]: string | number | undefined;
}

interface PopupData {
  coordinate: number[];
  feature: {
    properties: FeatureProperties;
    geometry: {
      type: string;
      coordinates: number[][];
    };
    type: string;
    id: string;
  };
}

const MapComponent = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<Map | null>(null);
  const [popupInfo, setPopupInfo] = useState<PopupData | null>(null);
  const [activeTheme, setActiveTheme] = useState<string>("basic");
  const [error, setError] = useState<string | null>(null);

  // Inicializar o mapa
  useEffect(() => {
    if (!mapRef.current) return;

    // Centro aproximado de Mato Grosso
    const mtCenter = fromLonLat([-56.0, -13.0]);

    // Camada base OSM
    const osmLayer = new TileLayer({
      source: new OSM(),
    });

    // Camada WMS para municípios
    const municipiosLayer = new ImageLayer({
      source: new ImageWMS({
        url: GEOSERVER_URL,
        params: {
          LAYERS: "mato_grosso:municipios_completo",
          STYLES: "municipios_basic",
          FORMAT: "image/png",
          TRANSPARENT: true,
        },
        ratio: 1,
        serverType: "geoserver",
      }),
    });

    // Criar mapa
    const mapInstance = new Map({
      target: mapRef.current,
      layers: [osmLayer, municipiosLayer],
      view: new View({
        center: mtCenter,
        zoom: 7,
      }),
    });

    // Configurar clique para mostrar informações
    mapInstance.on("singleclick", async (evt) => {
      setError(null);
      const viewResolution = mapInstance.getView().getResolution() || 0;
      const wmsSource = municipiosLayer.getSource() as ImageWMS;

      const url = wmsSource.getFeatureInfoUrl(
        evt.coordinate,
        viewResolution,
        "EPSG:3857",
        { INFO_FORMAT: "application/json" }
      );

      if (url) {
        try {
          const response = await fetch(url);

          if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
          }

          const data = await response.json();
          console.log("Dados do município:", data);
          if (data.features && data.features.length > 0) {
            setPopupInfo({
              coordinate: evt.coordinate,
              feature: data.features[0],
            });
          } else {
            setPopupInfo(null);
          }
        } catch (error) {
          console.error("Erro ao buscar informações do município:", error);
          setError("Falha ao carregar informações. Tente novamente.");
          setPopupInfo(null);
        }
      }
    });

    setMap(mapInstance);

    return () => {
      mapInstance.setTarget(undefined);
    };
  }, []);

  // Alternar entre visualizações temáticas
  const changeThematicMap = (theme: string) => {
    if (!map) return;

    setActiveTheme(theme);

    // Busca mais segura pela camada WMS
    let wmsLayer: ImageLayer<ImageWMS> | undefined;

    map.getLayers().forEach((layer) => {
      if (layer instanceof ImageLayer) {
        const source = layer.getSource();
        if (source instanceof ImageWMS) {
          wmsLayer = layer as ImageLayer<ImageWMS>;
        }
      }
    });

    if (wmsLayer) {
      const wmsSource = wmsLayer.getSource() as ImageWMS;
      const params = wmsSource.getParams();

      switch (theme) {
        case "populacao":
          params.STYLES = "municipios_populacao";
          break;
        case "pib_per_capita":
          params.STYLES = "municipios_pib";
          break;
        case "densidade_demografica":
          params.STYLES = "municipios_densidade";
          break;
        default:
          params.STYLES = "municipios_basic";
      }

      wmsSource.updateParams(params);
    }
  };

  return (
    <div className="map-container">
      <div ref={mapRef} className="map"></div>

      {error && <div className="error-message">{error}</div>}

      {popupInfo && (
        <PopupInfo
          info={popupInfo}
          map={map}
          onClose={() => setPopupInfo(null)}
        />
      )}

      <div className="map-controls">
        <h4>Visualizações Temáticas</h4>
        <div className="theme-buttons">
          <button
            onClick={() => changeThematicMap("basic")}
            className={`theme-button ${
              activeTheme === "basic" ? "active" : ""
            }`}
          >
            Básico
          </button>
          <button
            onClick={() => changeThematicMap("populacao")}
            className={`theme-button ${
              activeTheme === "populacao" ? "active" : ""
            }`}
          >
            População
          </button>
          <button
            onClick={() => changeThematicMap("pib_per_capita")}
            className={`theme-button ${
              activeTheme === "pib_per_capita" ? "active" : ""
            }`}
          >
            PIB per Capita
          </button>
          <button
            onClick={() => changeThematicMap("densidade_demografica")}
            className={`theme-button ${
              activeTheme === "densidade_demografica" ? "active" : ""
            }`}
          >
            Densidade Demográfica
          </button>
        </div>
      </div>

      {activeTheme !== "basic" && <Legend thematicView={activeTheme} />}
    </div>
  );
};

export default MapComponent;
