from fastapi import APIRouter, Query
from models import gamesModels

router = APIRouter(prefix="/games", tags=["games"])

@router.get("/{game_id}") # Jordan
async def get_games(game_id: int):
    return gamesModels.get_games(game_id)

@router.get("/search/{title}") # Kenneth
async def search_games(title: str):
    return gamesModels.search_games(title)

@router.get("/lists") # Abraham
async def get_lists():
    return

@router.get("/lists/trending") # Abraham
async def get_trending():
    return

@router.get("/lists/featured") # Jordan
async def get_featured():
    return

@router.get("/lists/top") # Will
async def get_top():
    return

@router.get("/lists/staff-picks") # Kenneth
async def get_staff_picks():
    return

@router.get("/genres") # Will
async def get_genres():
    return gamesModels.get_genres()

@router.get("/genres/{genre}") # Will
async def get_games_by_genre(
    genre: str,
    skip: int = Query(0, ge=0, description="Number of items to skip"),
    limit: int = Query(10, ge=1, le=100, description="Number of items to return")
):
    return gamesModels.get_games_by_genre(genre, skip, limit)
