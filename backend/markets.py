"""
Real-world fish & produce market locations via Google Places API & OpenStreetMap Overpass API.
Endpoint: GET /api/v1/maps/markets/live?lat=...&lng=...&radius=15000
"""
import os
import httpx
import math
from fastapi import APIRouter, Query
from google_places import fetch_google_places_markets, get_category_from_types

router = APIRouter(prefix="/api/v1/maps/markets", tags=["markets"])

OVERPASS_URL = "https://overpass-api.de/api/interpreter"

OVERPASS_QUERY_TEMPLATE = """
[out:json][timeout:25];
(
  node["shop"="seafood"]({south},{west},{north},{east});
  node["shop"="fish"]({south},{west},{north},{east});
  node["shop"="greengrocer"]({south},{west},{north},{east});
  node["shop"="farm"]({south},{west},{north},{east});
  node["shop"="supermarket"]({south},{west},{north},{east});
  node["amenity"="marketplace"]({south},{west},{north},{east});
  node["landuse"="retail"]["name"~"market|bazaar|fish|produce|vegetable|fruit",i]({south},{west},{north},{east});
);
out body;
"""


def _lat_lng_to_bbox(lat: float, lng: float, radius_m: float):
    """Convert center + radius to bounding box (south, west, north, east)."""
    delta_lat = radius_m / 111320
    delta_lng = radius_m / (111320 * abs(math.cos(math.radians(lat))) + 1e-9)
    return {
        "south": lat - delta_lat,
        "west": lng - delta_lng,
        "north": lat + delta_lat,
        "east": lng + delta_lng,
    }


def _parse_overpass(elements: list, fallback_score: int = 85) -> list:
    """Normalize Overpass API elements into the MarketMapPage format with fish vs produce categorization."""
    markets = []
    for i, el in enumerate(elements):
        tags = el.get("tags", {})
        name = (
            tags.get("name")
            or tags.get("name:en")
            or tags.get("shop")
            or "Local Bazaar"
        )
        lat = el.get("lat")
        lon = el.get("lon")
        if lat is None or lon is None:
            continue

        shop_type = tags.get("shop", "")
        category = get_category_from_types([shop_type], name)

        markets.append({
            "id": el.get("id", i + 1000),
            "name": name,
            "score": fallback_score,
            "lat": float(lat),
            "lng": float(lon),
            "vendors": 12,
            "category": category,
            "source": "openstreetmap",
            "address": tags.get("addr:full") or tags.get("addr:street") or "Alappuzha Region",
        })
    return markets


@router.get("/live")
async def get_live_markets(
    lat: float = Query(..., description="Latitude of user location"),
    lng: float = Query(..., description="Longitude of user location"),
    radius: int = Query(default=15000, ge=500, le=50000, description="Search radius in meters"),
):
    """
    Fetch real-world fish and produce markets near a location using Google Places API
    (or falling back to OpenStreetMap Overpass API).
    """
    google_places = []
    if os.getenv("GOOGLE_PLACES_API_KEY"):
        try:
            google_places = await fetch_google_places_markets(lat, lng, radius)
        except Exception as e:
            print("[Markets] Google Places API fetch warning:", e)

    if google_places and len(google_places) > 0:
        return {
            "success": True,
            "source": "google_places",
            "count": len(google_places),
            "lat": lat,
            "lng": lng,
            "radius_m": radius,
            "markets": google_places,
        }

    # Fallback to Overpass API if Google Places API returns empty or key is not set
    bbox = _lat_lng_to_bbox(lat, lng, radius)
    query = OVERPASS_QUERY_TEMPLATE.format(**bbox)
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            response = await client.post(
                OVERPASS_URL,
                data={"data": query},
                headers={
                    "Content-Type": "application/x-www-form-urlencoded",
                    "User-Agent": "PureCheckAI/1.0",
                },
            )
            response.raise_for_status()
            data = response.json()
            elements = data.get("elements", [])
            markets = _parse_overpass(elements)
            return {
                "success": True,
                "source": "openstreetmap",
                "count": len(markets),
                "lat": lat,
                "lng": lng,
                "radius_m": radius,
                "markets": markets,
            }
    except Exception as exc:
        return {
            "success": False,
            "source": "fallback",
            "error": str(exc),
            "markets": [],
        }
