from fastapi import APIRouter

router = APIRouter(prefix="/games", tags=["games"])

@router.get("/{game_id}") # Jordan
async def get_games(game_id: int):
    return {"game_id": game_id}

@router.get("/search/{title}") # Kenneth
async def search_games(title: str):
    return

@router.get("/lists") # Abraham
async def get_lists():
    return

@router.get("/trending") # Kenneth
async def get_trending():
    return

@router.get("/featured") # Jordan
async def get_featured():
    return

@router.get("/top") # Will
async def get_top():
    return

@router.get("/staff-picks") # Kenneth
async def get_staff_picks():
    return
