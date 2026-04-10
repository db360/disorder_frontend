import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Link } from "react-router-dom";
import L from "leaflet";

// Icono personalizado referenciado desde /public — la ruta es siempre correcta en dev y producción.
// Coloca tu imagen en public/img/map-marker.png (32×32 px) y
// public/img/map-marker@2x.png (64×64 px) para pantallas retina.
const customIcon = new L.Icon({
  iconUrl: "/img/map-marker.png",
  iconRetinaUrl: "/img/map-marker@2x.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],   // punto inferior-centro del icono
  popupAnchor: [0, -34],  // el popup aparece justo encima
  shadowUrl: undefined,
});

type MapProps = {
  height?: number;
};

const shopPosition: [number, number] = [36.4826, -4.99183];

export default function Map({ height = 300 }: MapProps) {
  return (
    <MapContainer
      className="w-full rounded-lg z-40 mx-auto"
      style={{ height: `${height}px` }}
      center={shopPosition}
      zoom={22}
      scrollWheelZoom={false}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={shopPosition} icon={customIcon}>
        <Popup>
          <Link target="_blank" to={"https://share.google/lu1tL1JOt24miwnhi"}>DISORDER UNDERGROUND SHOP❣️</Link>
        </Popup>
      </Marker>
    </MapContainer>
  );
}
