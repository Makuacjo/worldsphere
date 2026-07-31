import { useEffect, useMemo } from 'react';
import { ExternalLink, LocateFixed, Map as MapIcon, Navigation } from 'lucide-react';
import L, { type LatLngExpression } from 'leaflet';
import {
  MapContainer, Marker, Polyline, Popup, TileLayer, ZoomControl, useMap,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './KenyaTourMap.css';

export interface MapDestination {
  name: string;
  county: string;
  category: string;
  note: string;
  months: string;
  duration: string;
  fee: string;
  lat: number;
  lng: number;
}

interface Props {
  destinations: MapDestination[];
  selected: MapDestination;
  onSelect: (destination: MapDestination) => void;
}

const NAIROBI: LatLngExpression = [-1.286389, 36.817223];
const TILE_URL =
  import.meta.env.VITE_MAP_TILE_URL ??
  'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
const TILE_ATTRIBUTION =
  import.meta.env.VITE_MAP_ATTRIBUTION ??
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

const markerIcon = (active: boolean) => L.divIcon({
  className: 'kenya-map-marker-shell',
  html: `<span class="kenya-map-marker${active ? ' is-active' : ''}"><i></i></span>`,
  iconSize: active ? [38, 46] : [30, 38],
  iconAnchor: active ? [19, 44] : [15, 36],
  popupAnchor: [0, -36],
});

const MapFocus = ({ selected }: { selected: MapDestination }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo([selected.lat, selected.lng], Math.max(map.getZoom(), 7), {
      animate: true,
      duration: 1.1,
    });
  }, [map, selected]);
  return null;
};

const KenyaTourMap = ({ destinations, selected, onSelect }: Props) => {
  const route = useMemo<LatLngExpression[]>(
    () => [NAIROBI, [selected.lat, selected.lng]],
    [selected],
  );
  const directionsUrl =
    `https://www.google.com/maps/dir/?api=1&destination=${selected.lat},${selected.lng}`;
  const osmUrl =
    `https://www.openstreetmap.org/?mlat=${selected.lat}&mlon=${selected.lng}#map=10/${selected.lat}/${selected.lng}`;

  return (
    <div className="kenya-real-map">
      <MapContainer
        center={[-0.4, 37.6]}
        zoom={6}
        minZoom={5}
        maxZoom={18}
        zoomControl={false}
        scrollWheelZoom
        className="kenya-real-map__canvas"
      >
        <TileLayer
          url={TILE_URL}
          attribution={TILE_ATTRIBUTION}
          maxZoom={19}
        />
        <ZoomControl position="bottomright" />
        <MapFocus selected={selected} />
        <Marker position={NAIROBI} icon={markerIcon(false)}>
          <Popup><strong>Nairobi</strong><br />Primary arrival and route hub</Popup>
        </Marker>
        <Polyline
          positions={route}
          pathOptions={{ color: '#212529', weight: 2.5, opacity: 0.72, dashArray: '7 7' }}
        />
        {destinations.map((destination) => (
          <Marker
            key={destination.name}
            position={[destination.lat, destination.lng]}
            icon={markerIcon(destination.name === selected.name)}
            eventHandlers={{ click: () => onSelect(destination) }}
          >
            <Popup minWidth={230}>
              <div className="kenya-map-popup">
                <span>{destination.category} · {destination.county} County</span>
                <strong>{destination.name}</strong>
                <p>{destination.note}</p>
                <dl>
                  <div><dt>Best</dt><dd>{destination.months}</dd></div>
                  <div><dt>Stay</dt><dd>{destination.duration}</dd></div>
                  <div><dt>Entry</dt><dd>{destination.fee}</dd></div>
                </dl>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      <div className="kenya-real-map__top">
        <span><LocateFixed size={16} /> Exploring {selected.name}</span>
      </div>
      <div className="kenya-real-map__actions">
        <a href={directionsUrl} target="_blank" rel="noreferrer">
          <Navigation size={18} /> Directions
        </a>
        <a href={osmUrl} target="_blank" rel="noreferrer">
          <MapIcon size={18} /> Open in OSM <ExternalLink size={13} />
        </a>
      </div>
    </div>
  );
};

export default KenyaTourMap;
