
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
