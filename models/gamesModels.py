import json
from db.db import SessionLocal, Games
from sqlalchemy import case, func


def get_games(id: int): # Jordan
    """
    Queries the database for a game with the given id.
    Returns None if the game is not found
    """
    db = SessionLocal()
    try:
        selected_game = db.query(Games).filter(Games.id == id).first()
        return selected_game
    finally:
        db.close()

def search_games(title: str): #Kenneth
    """
    Queries the databse for a given game name.
    Returns the top 5 games that are closely to the given search.
    Make sure your front end has a debouncer so we are not fetching the database on every click.
    """
    db = SessionLocal()
    try:
        newTitle = title.lower()
        #if there is an exact match we provide that in the list first
        exactMatch = title.lower()
        #we search the database with both lower case
        #if there is an exact match we put that first
        #we only set a limit to 5 
        searched_games = db.query(Games).filter(func.lower(Games.title).like(f"%{newTitle}%")).order_by(
            case(
                (Games.title == exactMatch,1),
                else_= 0
            ).desc()
        ).limit(8).all()
        searched_games = [game_to_dict(game) for game in searched_games]

        return {"searched":searched_games}
    finally:
        db.close()

def get_lists():
    """Abraham"""
    # Return all available game lists with their names and endpoints
    return {
        "availableLists": [
            {"name": "trending", "endpoint": "/games/lists/trending"},
            {"name": "featured", "endpoint": "/games/lists/featured"},
            {"name": "top", "endpoint": "/games/lists/top"},
            {"name": "staff-picks", "endpoint": "/games/lists/staff-picks"}
        ]
    }

def get_trending_games():
    """Abraham"""
    # Automatically generate trending games based on Metacritic scores and relevance
    import datetime
    
    def calculate_relevance_score(game):
        """Calculate a composite relevance score for trending games"""
        score = 0
        
        # Metacritic Score (40% weight) - normalized to 0-40
        if game.metacriticScore:
            score += (game.metacriticScore / 100) * 40
        
        # Steam Rating (20% weight) - normalized to 0-20
        if game.steamRating:
            score += (game.steamRating / 100) * 20
        
        # Release Year Relevance (25% weight) - recent games get higher scores
        current_year = datetime.datetime.now().year
        if game.releaseYear:
            year_diff = current_year - game.releaseYear
            if year_diff <= 1:  # Games from last year get full points
                score += 25
            elif year_diff <= 3:  # Games from last 3 years get partial points
                score += 25 * (1 - (year_diff - 1) / 2)
            elif year_diff <= 5:  # Games from last 5 years get minimal points
                score += 25 * 0.2
            # Older games get no recency points
        
        # Price Factor (10% weight) - reasonably priced games get slight boost
        if game.price:
            if 10 <= game.price <= 60:  # Sweet spot pricing
                score += 10
            elif game.price < 10:  # Very cheap games get partial points
                score += 7
            elif 60 < game.price <= 80:  # Expensive but reasonable
                score += 5
            # Very expensive games (>$80) get no price points
        
        # Quality Threshold (5% weight) - bonus for high-quality games
        if game.metacriticScore and game.metacriticScore >= 85:
            score += 5
        elif game.steamRating and game.steamRating >= 90:
            score += 3
        
        return score
    
    db = SessionLocal()
    try:
        # Get all games with required data for scoring
        all_games = db.query(Games).filter(
            Games.metacriticScore.isnot(None)
        ).all()
        
        # Calculate relevance scores and sort
        games_with_scores = []
        for game in all_games:
            relevance_score = calculate_relevance_score(game)
            games_with_scores.append((game, relevance_score))
        
        # Sort by relevance score (descending) and take top 10
        games_with_scores.sort(key=lambda x: x[1], reverse=True)
        trending_games = [game for game, score in games_with_scores[:10]]
        
        # Fallback: if we don't have enough games, use metacritic score only
        if len(trending_games) < 10:
            fallback_games = db.query(Games).filter(
                Games.metacriticScore.isnot(None)
            ).order_by(Games.metacriticScore.desc()).limit(10).all()
            trending_games = fallback_games
        
        return {"trendingGames": trending_games}
    finally:
        db.close()

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

def get_staff_picks(): #Kenneth
    """
    Queries the database for the top games that the staff recommends
    Returns the list of games 
    """
    db = SessionLocal()
    game_ids = (311210, 960090,1172470,1091500,3595,271590,578080,730)
    games_list = db.query(Games).filter(Games.id.in_(game_ids)).all()
    games_list = [game_to_dict(game) for game in games_list]

    return {"staffPicks":games_list}

def get_multiple_games(games: list[int]):
    """
    Given a list of game IDs, returns a list of those games.
    Ignores game IDs that are not in the database. 
    """
    data = []
    for id in games:
        game = get_games(id)
        if game is not None:
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