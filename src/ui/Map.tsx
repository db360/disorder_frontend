
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Link } from "react-router-dom";
import L from "leaflet";

// Forzar la ruta de los iconos de Leaflet usando rutas absolutas desde public/
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "/marker-icon-2x.png",
  iconUrl: "/marker-icon.png",
  shadowUrl: "/marker-shadow.png",
});

type MapProps = {
  height?: number;
};

export default function Map({ height = 300 }: MapProps) {
  return (
    <MapContainer
      className="w-[45%] lg:w-[45%] rounded-lg z-40 mx-auto"
      style={{ height: `${height}px` }}
      center={[36.4826, -4.99183]}

      zoom={22}
      scrollWheelZoom={false}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[36.4826, -4.99183]}>
        <Popup>
          <Link target="_blank" to={"https://share.google/lu1tL1JOt24miwnhi"}>DISORDER UNDERGROUND SHOP❣️</Link>
        </Popup>
      </Marker>
    </MapContainer>
  );
}
