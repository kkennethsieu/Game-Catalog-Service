import json
from db.db import SessionLocal, Games

def get_games(id: int):
    """Jordan"""
    return "swagger"

def search_games(title: str):
    """Kenneth"""
    return {"title": title}

def get_lists():
    """Kenneth"""
    game_dict = {}
    return

def get_trending_games():
    """Abraham"""
    games = [ids] # Currate this ***
    data = get_multiple_games(games)
    return data

def get_featured_games():
    """Jordan"""
    games = [ids] # Currate this ***
    data = get_multiple_games(games)
    return data

def get_top_games():
    """Will"""
    games = [ids] # Currate this ***
    data = get_multiple_games(games)
    return  data

def get_staff_picks():
    """Kenneth"""
    games = [ids] # Currate this ***
    data = get_multiple_games(games)
    return {"staffPicks": data}

def get_multiple_games(games: list[int]):
    data = []
    for id in games:
        game = get_games(id)
        data.append(game)
    return data

def get_genres():
    """Will"""
    db = SessionLocal()
    try:
        # Get all games from database
        all_games = db.query(Games).all()
        
        # Collect all unique genres
        genres_set = set()
        for game in all_games:
            if game.genres:
                # Parse JSON array stored as text
                game_genres = json.loads(game.genres)
                for genre in game_genres:
                    genres_set.add(genre)

        # Return sorted list of unique genres
        genres_list = sorted(list(genres_set))
        return {"genres": genres_list}
    finally:
        db.close()

def get_games_by_genre(genre: str, skip: int = 0, limit: int = 10):
    """This function retrieves games by genre with pagination."""
    def game_to_dict(game: Games) -> dict:
        """Helper to convert Games model to dict with parsed JSON fields"""
        return {
            "id": game.id,
            "title": game.title,
            "description": game.description,
            "releaseYear": game.releaseYear,
            "imageUrl": game.imageUrl,
            "developer": game.developer,
            "publisher": game.publisher,
            "platform": json.loads(game.platform) if game.platform else [],
            "price": game.price,
            "website": game.website,
            "genres": json.loads(game.genres) if game.genres else [],
            "tags": json.loads(game.tags) if game.tags else [],
            "screenshots": json.loads(game.screenshots) if game.screenshots else [],
            "metacriticScore": game.metacriticScore,
            "steamRating": game.steamRating
        }

    db = SessionLocal()
    try:
        # Get all games from database
        all_games = db.query(Games).all()

        # Filter games that have the specified genre
        matching_games = []
        for game in all_games:
            if game.genres:
                # Parse JSON array stored as text
                game_genres = json.loads(game.genres)
                if genre in game_genres:
                    matching_games.append(game)

        # Apply pagination
        total = len(matching_games)
        paginated_games = matching_games[skip:skip + limit]

        # Convert Games models to dicts
        games_data = [game_to_dict(game) for game in paginated_games]

        return {
            "genre": genre,
            "games": games_data,
            "total": total,
            "skip": skip,
            "limit": limit
        }
    finally:
        db.close()