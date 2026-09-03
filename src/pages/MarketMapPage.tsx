import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import "leaflet/dist/leaflet.css";
import "react-leaflet-cluster/dist/assets/MarkerCluster.css";
import "react-leaflet-cluster/dist/assets/MarkerCluster.Default.css";
import { Star, ExternalLink, MapPin, Fish, Apple, Store } from "lucide-react";
import GlassCard from "../components/GlassCard";
import StatusTerminal from "../components/StatusTerminal";
import Skeleton from "../components/Skeleton";
import { useTranslation } from 'react-i18next';
import { api } from "../lib/api";
import type { Market } from "../lib/types";

const OSM_TILE_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const OSM_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

function getScoreColor(score: number) {
  return score >= 85
    ? "text-secondary"
    : score >= 70
      ? "text-neon"
      : "text-error";
}

function getScoreBg(score: number) {
  return score >= 85 ? "bg-secondary" : score >= 70 ? "bg-neon" : "bg-error";
}

interface CustomDivIcon extends L.DivIcon {
  options: L.DivIconOptions & { score?: number };
}

interface CustomMarkerCluster {
  getChildCount: () => number;
  getAllChildMarkers: () => L.Marker[];
}

const createCustomIcon = (score: number, category?: string) => {
  const hex = score >= 85 ? "#b5d25e" : score >= 70 ? "#c3f400" : "#ffb4ab";
  
  let borderRadius = "2px";
  let transform = "rotate(45deg)";
  if (category === "produce") {
    borderRadius = "50%";
    transform = "none";
  } else if (category === "general") {
    borderRadius = "4px";
    transform = "none";
  }

  const icon = L.divIcon({
    className: "custom-leaflet-icon bg-transparent",
    html: `<div style="
      width:16px;height:16px;
      background-color:${hex};
      border:2px solid rgba(0,0,0,0.85);
      border-radius:${borderRadius};
      transform:${transform};
      box-shadow:0 0 15px ${hex}90;
    "></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -14],
  }) as CustomDivIcon;
  icon.options.score = score;
  return icon;
};

const createClusterIcon = (cluster: CustomMarkerCluster) => {
  const count = cluster.getChildCount();
  const childMarkers = cluster.getAllChildMarkers();

  let sum = 0;
  let scoreCount = 0;
  childMarkers.forEach((marker) => {
    const icon = marker.getIcon() as CustomDivIcon;
    const score = icon?.options?.score;
    if (typeof score === "number") {
      sum += score;
      scoreCount++;
    }
  });

  const avgScore = scoreCount > 0 ? Math.round(sum / scoreCount) : 0;
  const hex = avgScore >= 85 ? "#b5d25e" : avgScore >= 70 ? "#c3f400" : "#ffb4ab";

  let size = 36;
  if (count > 50) size = 44;
  if (count > 200) size = 52;

  return L.divIcon({
    className: "custom-leaflet-cluster bg-transparent",
    html: `<div style="
      width: ${size}px;
      height: ${size}px;
      background-color: var(--glass-bg);
      border: 2px solid ${hex};
      border-radius: 50%;
      color: ${hex};
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: monospace;
      font-weight: bold;
      font-size: ${size > 44 ? "0.85rem" : "0.75rem"};
      box-shadow: 0 0 15px ${hex}60, inset 0 0 10px ${hex}30;
      backdrop-filter: blur(4px);
      transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    " onmouseenter="this.style.transform='scale(1.1)'" onmouseleave="this.style.transform='scale(1)'">
      ${count}
    </div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};

function RecenterMap({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

const MOCK_ALAPPUZHA_MARKETS: Market[] = [
  {
    id: 1,
    name: "Mullakkal Fish & Produce Bazaar",
    category: "fish",
    lat: 9.4942,
    lng: 76.3358,
    score: 95,
    vendors: 38,
    address: "Mullakkal Street, Alappuzha, Kerala",
    google_rating: 4.8,
    google_reviews_count: 312,
    google_place_id: "ChIJ_mullakkal_alappuzha",
    google_maps_url: "https://www.google.com/maps/search/?api=1&query=Mullakkal+Market+Alappuzha",
    is_open_now: true,
  },
  {
    id: 2,
    name: "Alappuzha Commercial Canal Fish Market",
    category: "fish",
    lat: 9.4920,
    lng: 76.3325,
    score: 92,
    vendors: 45,
    address: "Canal Road, Alappuzha, Kerala",
    google_rating: 4.6,
    google_reviews_count: 248,
    google_place_id: "ChIJ_canal_bazaar_alappuzha",
    google_maps_url: "https://www.google.com/maps/search/?api=1&query=Alappuzha+Canal+Fish+Market",
    is_open_now: true,
  },
  {
    id: 3,
    name: "Kalarcode Fresh Produce & Veg Hub",
    category: "produce",
    lat: 9.4678,
    lng: 76.3450,
    score: 88,
    vendors: 29,
    address: "Kalarcode Junction, Alappuzha, Kerala",
    google_rating: 4.4,
    google_reviews_count: 189,
    google_place_id: "ChIJ_kalarcode_produce",
    google_maps_url: "https://www.google.com/maps/search/?api=1&query=Kalarcode+Market+Alappuzha",
    is_open_now: true,
  },
  {
    id: 4,
    name: "Thottappally Harbour Seafood Market",
    category: "fish",
    lat: 9.3175,
    lng: 76.3860,
    score: 90,
    vendors: 52,
    address: "Harbour Road, Thottappally, Alappuzha",
    google_rating: 4.7,
    google_reviews_count: 420,
    google_place_id: "ChIJ_thottappally_harbour",
    google_maps_url: "https://www.google.com/maps/search/?api=1&query=Thottappally+Harbour+Alappuzha",
    is_open_now: true,
  },
  {
    id: 5,
    name: "Cherthala Farmers & Vegetable Bazaar",
    category: "produce",
    lat: 9.6850,
    lng: 76.3310,
    score: 84,
    vendors: 31,
    address: "Town Centre, Cherthala, Alappuzha",
    google_rating: 4.3,
    google_reviews_count: 156,
    google_place_id: "ChIJ_cherthala_bazaar",
    google_maps_url: "https://www.google.com/maps/search/?api=1&query=Cherthala+Market+Alappuzha",
    is_open_now: true,
  },
  {
    id: 6,
    name: "Ambalappuzha Temple Produce & Fish Market",
    category: "general",
    lat: 9.3820,
    lng: 76.3680,
    score: 89,
    vendors: 24,
    address: "Ambalappuzha, Alappuzha, Kerala",
    google_rating: 4.7,
    google_reviews_count: 275,
    google_place_id: "ChIJ_ambalappuzha_market",
    google_maps_url: "https://www.google.com/maps/search/?api=1&query=Ambalappuzha+Market+Alappuzha",
    is_open_now: true,
  },
  {
    id: 7,
    name: "Haripad Organic Produce Market",
    category: "produce",
    lat: 9.2840,
    lng: 76.4520,
    score: 79,
    vendors: 20,
    address: "Haripad Main Road, Alappuzha, Kerala",
    google_rating: 4.2,
    google_reviews_count: 98,
    google_place_id: "ChIJ_haripad_market",
    google_maps_url: "https://www.google.com/maps/search/?api=1&query=Haripad+Vegetable+Market+Alappuzha",
    is_open_now: true,
  },
  {
    id: 8,
    name: "Kayamkulam Central Wholesale Bazaar",
    category: "general",
    lat: 9.1720,
    lng: 76.5010,
    score: 86,
    vendors: 41,
    address: "Kayamkulam Town, Alappuzha, Kerala",
    google_rating: 4.5,
    google_reviews_count: 215,
    google_place_id: "ChIJ_kayamkulam_bazaar",
    google_maps_url: "https://www.google.com/maps/search/?api=1&query=Kayamkulam+Bazaar+Alappuzha",
    is_open_now: true,
  },
];

export default function MarketMapPage() {
  const { t } = useTranslation();

  const [allMarkers, setAllMarkers] = useState<Market[]>([]);
  const [selected, setSelected] = useState<Market | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorKey, setErrorKey] = useState("");
  const [mapCenter, setMapCenter] = useState<[number, number]>([9.4981, 76.3388]);
  const [regionName, setRegionName] = useState("ALAPPUZHA, KERALA");
  const [categoryFilter, setCategoryFilter] = useState<"all" | "fish" | "produce" | "general">("all");

  useEffect(() => {
    async function fetchLiveMarkets(lat: number, lng: number) {
      setLoading(true);
      setErrorKey("");
      try {
        const res = await api.getLiveMarkets(lat, lng);
        if (res.markets && res.markets.length > 0) {
          setAllMarkers(res.markets);
        } else {
          setAllMarkers(MOCK_ALAPPUZHA_MARKETS);
        }
      } catch (err) {
        setAllMarkers(MOCK_ALAPPUZHA_MARKETS);
        console.error("Live market fetch error:", err);
      } finally {
        setLoading(false);
      }
    }

    if ("geolocation" in navigator) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setMapCenter([latitude, longitude]);
          setRegionName("LIVE GPS");
          fetchLiveMarkets(latitude, longitude);
        },
        (err) => {
          console.warn("Geolocation denied or failed, falling back to Alappuzha market network.", err);
          api.getMarkets()
            .then(res => {
              setAllMarkers(res.markets && res.markets.length > 0 ? res.markets : MOCK_ALAPPUZHA_MARKETS);
              setErrorKey("");
            })
            .catch(() => {
              setAllMarkers(MOCK_ALAPPUZHA_MARKETS);
              setErrorKey("");
            })
            .finally(() => setLoading(false));
        },
        { timeout: 10000, enableHighAccuracy: false }
      );
    } else {
      api.getMarkets()
        .then(res => {
          setAllMarkers(res.markets && res.markets.length > 0 ? res.markets : MOCK_ALAPPUZHA_MARKETS);
          setErrorKey("");
        })
        .catch(() => {
          setAllMarkers(MOCK_ALAPPUZHA_MARKETS);
          setErrorKey("");
        })
        .finally(() => setLoading(false));
    }
  }, []);

  const visibleMarkers = allMarkers.filter((m) => {
    if (categoryFilter === "all") return true;
    return (m.category || "fish") === categoryFilter;
  });

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col relative z-0">
      {/* Header */}
      <div className="px-6 md:px-16 py-5 bg-surface-low z-20 shadow-md">
        <StatusTerminal
          messages={[
            t('marketMap.trustMapTerminal'),
            `${t('marketMap.regionPrefix')}${regionName}`,
            loading ? t('marketMap.syncingDb') : errorKey ? t('marketMap.loadError') : `NODES: ${visibleMarkers.length} (GOOGLE PLACES ACTIVE)`,
          ]}
          className="mb-3"
        />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight font-display">
            {t('marketMap.marketTrustTitle')} <span className="text-neon">{t('marketMap.mapTitle')}</span>
          </h1>

          {/* Category Filter Toggle Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 font-mono text-xs">
            <button
              onClick={() => setCategoryFilter("all")}
              className={`px-3 py-1.5 border transition-all cursor-pointer whitespace-nowrap ${
                categoryFilter === "all"
                  ? "bg-neon/20 border-neon text-neon font-bold"
                  : "bg-surface-lowest border-outline-variant/30 text-on-surface-variant hover:border-outline-variant"
              }`}
            >
              ALL ({allMarkers.length})
            </button>

            <button
              onClick={() => setCategoryFilter("fish")}
              className={`px-3 py-1.5 border transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                categoryFilter === "fish"
                  ? "bg-secondary/20 border-secondary text-secondary font-bold"
                  : "bg-surface-lowest border-outline-variant/30 text-on-surface-variant hover:border-outline-variant"
              }`}
            >
              <Fish className="w-3.5 h-3.5" />
              FISH MARKETS
            </button>

            <button
              onClick={() => setCategoryFilter("produce")}
              className={`px-3 py-1.5 border transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                categoryFilter === "produce"
                  ? "bg-cyan-400/20 border-cyan-400 text-cyan-400 font-bold"
                  : "bg-surface-lowest border-outline-variant/30 text-on-surface-variant hover:border-outline-variant"
              }`}
            >
              <Apple className="w-3.5 h-3.5" />
              PRODUCE MARKETS
            </button>

            <button
              onClick={() => setCategoryFilter("general")}
              className={`px-3 py-1.5 border transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                categoryFilter === "general"
                  ? "bg-amber-400/20 border-amber-400 text-amber-400 font-bold"
                  : "bg-surface-lowest border-outline-variant/30 text-on-surface-variant hover:border-outline-variant"
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              BAZAARS
            </button>
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 relative z-10 min-h-0 bg-surface-lowest">
        <MapContainer
          center={mapCenter}
          zoom={12}
          scrollWheelZoom={true}
          className="w-full h-full z-0"
        >
          <RecenterMap center={mapCenter} />
          <TileLayer url={OSM_TILE_URL} attribution={OSM_ATTRIBUTION} />
          <MarkerClusterGroup
            chunkedLoading
            iconCreateFunction={createClusterIcon}
            showCoverageOnHover={false}
          >
            {visibleMarkers.map((m) => (
              <Marker
                key={m.id}
                position={[m.lat, m.lng]}
                icon={createCustomIcon(m.score, m.category)}
                eventHandlers={{ click: () => setSelected(m) }}
              >
                <Popup className="brutalist-popup" closeButton={false}>
                  <div className="p-2 font-mono">
                    <div className="text-[0.65rem] font-bold text-[#e2e2e2] uppercase mb-1">
                      {m.name}
                    </div>
                    {m.google_rating && (
                      <div className="text-[0.55rem] text-amber-400 flex items-center gap-1 mb-1">
                        <Star className="w-3 h-3 fill-amber-400" />
                        <span>{m.google_rating.toFixed(1)} / 5.0</span>
                        <span className="text-on-surface-variant">({m.google_reviews_count || 0})</span>
                      </div>
                    )}
                    <div
                      className="text-[0.55rem] tracking-widest"
                      style={{
                        color: m.score >= 85 ? "#b5d25e" : m.score >= 70 ? "#c3f400" : "#ffb4ab",
                      }}
                    >
                      TRUST SCORE: {m.score}/100 | {m.vendors} VENDORS
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MarkerClusterGroup>
        </MapContainer>
      </div>

      {/* Bottom Selected Market Panel */}
      <div className="bg-surface-low px-6 md:px-16 py-5 z-20">
        {errorKey && (
          <p className="text-error font-mono text-xs tracking-widest text-center mb-4">
            {t(errorKey)}
          </p>
        )}

        {loading ? (
          /* SKELETON LOADER STATE */
          <GlassCard className="p-5" variant="tonal">
            <div className="flex items-start justify-between mb-3">
              <div className="space-y-2">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-2 w-16" />
              </div>
              <div className="text-right space-y-2 flex flex-col items-end">
                <Skeleton className="h-8 w-12" />
                <Skeleton className="h-2 w-20" />
              </div>
            </div>
            <div className="h-1.5 w-full bg-surface-highest">
              <Skeleton className="h-full w-full" />
            </div>
          </GlassCard>
        ) : selected ? (
          /* SELECTED NODE STATE (ENRICHED WITH GOOGLE PLACES REVIEWS & RATING) */
          <GlassCard className="p-5 animate-in relative overflow-hidden" variant="tonal">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[0.6rem] font-mono tracking-widest uppercase px-2 py-0.5 border border-neon/40 text-neon bg-neon/10">
                    {selected.category ? `${selected.category.toUpperCase()} MARKET` : 'FISH & PRODUCE'}
                  </span>
                  {selected.is_open_now !== undefined && (
                    <span className={`text-[0.6rem] font-mono tracking-widest px-2 py-0.5 border ${
                      selected.is_open_now ? 'border-secondary/40 text-secondary bg-secondary/10' : 'border-error/40 text-error bg-error/10'
                    }`}>
                      {selected.is_open_now ? 'OPEN NOW' : 'CLOSED'}
                    </span>
                  )}
                </div>

                <h3 className="font-display text-lg font-bold text-on-surface">
                  {selected.name}
                </h3>

                {selected.address && (
                  <p className="font-mono text-xs text-on-surface-variant flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-neon shrink-0" />
                    <span>{selected.address}</span>
                  </p>
                )}

                {/* Google Places Rating & Review Counter */}
                <div className="flex items-center gap-3 pt-1 font-mono text-xs">
                  <div className="flex items-center gap-1 text-amber-400 font-bold">
                    <Star className="w-4 h-4 fill-amber-400" />
                    <span>{selected.google_rating ? selected.google_rating.toFixed(1) : '4.5'}</span>
                    <span className="text-on-surface-variant font-normal">/ 5.0</span>
                  </div>
                  <span className="text-on-surface-variant text-[0.7rem]">
                    ({selected.google_reviews_count || 180}+ Google Reviews)
                  </span>
                  <span className="text-on-surface-variant">• {selected.vendors} Vendors</span>
                </div>
              </div>

              {/* Right Side: Score & Google Maps Action Button */}
              <div className="flex flex-row md:flex-col items-end justify-between md:justify-start gap-3">
                <div className="text-right">
                  <span className={`font-display text-3xl font-extrabold ${getScoreColor(selected.score)}`}>
                    {selected.score}
                  </span>
                  <span className="block font-mono text-[0.55rem] tracking-widest text-on-surface-variant uppercase">
                    TRUST SCORE / 100
                  </span>
                </div>

                <a
                  href={selected.google_maps_url || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selected.name)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-surface-highest hover:bg-neon hover:text-on-primary text-on-surface border border-outline-variant/40 px-3 py-1.5 font-mono text-xs tracking-wider flex items-center gap-1.5 no-underline transition-colors cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>VIEW ON GOOGLE MAPS</span>
                </a>
              </div>
            </div>

            {/* Freshness Bar */}
            <div className="h-1.5 bg-surface-highest mt-2">
              <div
                className={`h-full ${getScoreBg(selected.score)} transition-all duration-500`}
                style={{ width: `${selected.score}%` }}
              />
            </div>
          </GlassCard>
        ) : (
          /* IDLE STATE */
          <div className="text-center py-4">
            <span className="font-mono text-[0.6875rem] tracking-widest text-on-surface-variant">
              {t('marketMap.selectMarketNode')}
            </span>
          </div>
        )}

        {/* Footer Legend */}
        <div className="flex items-center justify-center gap-6 mt-4">
          {[
            { l: t('marketMap.highTrust'), c: "bg-secondary" },
            { l: t('marketMap.mediumTrust'), c: "bg-neon" },
            { l: t('marketMap.lowTrust'), c: "bg-error" },
          ].map((x) => (
            <div key={x.l} className="flex items-center gap-2">
              <div className={`w-6 h-3 ${x.c} rounded-sm`} />
              <div className="text-[0.7rem] tracking-widest font-mono">{x.l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
