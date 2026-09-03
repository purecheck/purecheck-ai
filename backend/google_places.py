import os
import httpx
from typing import List, Dict, Any, Optional

GOOGLE_PLACES_API_KEY = os.getenv("GOOGLE_PLACES_API_KEY", "").strip()

NEARBY_SEARCH_URL = "https://maps.googleapis.com/maps/api/place/nearbysearch/json"
PLACE_DETAILS_URL = "https://maps.googleapis.com/maps/api/place/details/json"

def get_category_from_types(types: List[str], name: str) -> str:
    """Categorize place into fish, produce, or general market based on Google place types & name."""
    name_lower = name.lower()
    if any(k in name_lower for k in ["fish", "seafood", "meen", "harbour", "harbor", "catch"]):
        return "fish"
    if any(k in name_lower for k in ["vegetable", "fruit", "produce", "farm", "pacha", "green"]):
        return "produce"
    if "seafood" in types:
        return "fish"
    if "grocery_or_supermarket" in types or "supermarket" in types:
        return "produce"
    return "general"

async def fetch_google_places_markets(
    lat: float,
    lng: float,
    radius: int = 15000,
    keyword: Optional[str] = None
) -> List[Dict[str, Any]]:
    """
    Fetch live markets (fish & produce) around lat/lng directly using Google Places Nearby Search API.
    """
    api_key = os.getenv("GOOGLE_PLACES_API_KEY", "").strip() or GOOGLE_PLACES_API_KEY
    if not api_key:
        return []

    search_keywords = ["market", "fish market", "vegetable market", "bazaar"]
    if keyword:
        search_keywords = [keyword]

    results_map: Dict[str, Dict[str, Any]] = {}

    async with httpx.AsyncClient(timeout=10.0) as client:
        for kw in search_keywords[:2]:
            params = {
                "location": f"{lat},{lng}",
                "radius": radius,
                "keyword": kw,
                "key": api_key,
            }
            try:
                resp = await client.get(NEARBY_SEARCH_URL, params=params)
                if resp.status_code == 200:
                    data = resp.json()
                    for item in data.get("results", []):
                        place_id = item.get("place_id")
                        if not place_id or place_id in results_map:
                            continue

                        loc = item.get("geometry", {}).get("location", {})
                        item_lat = loc.get("lat")
                        item_lng = loc.get("lng")
                        if not item_lat or not item_lng:
                            continue

                        rating = item.get("rating", 4.2)
                        user_ratings_total = item.get("user_ratings_total", 0)
                        # Compute active trust score (scale 0-100 from Google rating out of 5.0)
                        score = int(round(rating * 20))

                        name = item.get("name", "Local Market")
                        types = item.get("types", [])
                        category = get_category_from_types(types, name)

                        photo_url = None
                        photos = item.get("photos", [])
                        if photos and len(photos) > 0:
                            photo_ref = photos[0].get("photo_reference")
                            if photo_ref:
                                photo_url = f"https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference={photo_ref}&key={api_key}"

                        google_maps_url = f"https://www.google.com/maps/search/?api=1&query={item_lat},{item_lng}&query_place_id={place_id}"

                        is_open_now = item.get("opening_hours", {}).get("open_now")

                        results_map[place_id] = {
                            "id": abs(hash(place_id)) % 100000,
                            "name": name,
                            "score": score,
                            "lat": float(item_lat),
                            "lng": float(item_lng),
                            "vendors": max(5, int(user_ratings_total / 8) + 3),
                            "category": category,
                            "address": item.get("vicinity") or item.get("formatted_address") or "Alappuzha Region",
                            "google_rating": float(rating),
                            "google_reviews_count": int(user_ratings_total),
                            "google_place_id": place_id,
                            "google_maps_url": google_maps_url,
                            "photo_url": photo_url,
                            "is_open_now": is_open_now,
                            "source": "google_places",
                        }
            except Exception as e:
                print(f"[GooglePlaces] Error fetching for '{kw}':", e)

    return list(results_map.values())
