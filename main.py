from fastapi import FastAPI, APIRouter
import routes.gamesRoutes as routes

app = FastAPI()
app.include_router(routes.router)

@app.get("/")
async def root():
    return {"message": "Welcome to the Game Catalogue Service!"}

print("Game Catalogue Service is running...")