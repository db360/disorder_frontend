import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Link } from "react-router-dom";
import L from "leaflet";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";

// Forzar la ruta de los iconos de Leaflet usando imports estáticos (compatibles con Vite build)
L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
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
      <Marker position={shopPosition}>
        <Popup>
          <Link target="_blank" to={"https://share.google/lu1tL1JOt24miwnhi"}>DISORDER UNDERGROUND SHOP❣️</Link>
        </Popup>
      </Marker>
    </MapContainer>
  );
}
