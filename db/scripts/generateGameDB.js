import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sqlite3 from "sqlite3";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to parse CSV line
function parseCSVLine(line) {
  const result = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim());

  return result;
}

// Parse release date to get year
function getYear(dateStr) {
  if (!dateStr) return new Date().getFullYear();
  const match = dateStr.match(/\d{4}/);
  return match ? parseInt(match[0]) : new Date().getFullYear();
}

// Aggregate platforms
function getPlatforms(windows, mac, linux) {
  const platforms = [];
  if (windows === "True") platforms.push("Windows");
  if (mac === "True") platforms.push("Mac");
  if (linux === "True") platforms.push("Linux");
  return platforms.length > 0 ? platforms : ["Windows"];
}

// Parse comma-separated list
function parseList(str) {
  if (!str || str === "") return [];
  return str
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s);
}

// Main processing
console.log("Reading games.csv...");
const csvPath = path.join(__dirname, "games.csv");
const csvContent = fs.readFileSync(csvPath, "utf-8");
const lines = csvContent.split("\n");
const headers = parseCSVLine(lines[0]);

console.log(`Found ${lines.length - 1} games`);
console.log("Headers:", headers.slice(0, 10).join(", "));

// Parse all games
const allGames = [];
for (let i = 1; i < lines.length; i++) {
  if (!lines[i].trim()) continue;

  const values = parseCSVLine(lines[i]);
  const game = {};
  headers.forEach((header, index) => {
    game[header] = values[index] || "";
  });

  // Calculate total reviews
  const positive = parseInt(game["Positive"]) || 0;
  const negative = parseInt(game["Negative"]) || 0;
  game.totalReviews = positive + negative;

  if (game.totalReviews > 0) {
    allGames.push(game);
  }
}

// Sort by review count and take top 100
allGames.sort((a, b) => b.totalReviews - a.totalReviews);
const top100 = allGames.slice(0, 100);

console.log(`Processing top 100 games...`);
console.log(`#1: ${top100[0].Name} (${top100[0].totalReviews} reviews)`);
console.log(`#100: ${top100[99].Name} (${top100[99].totalReviews} reviews)`);

// Transform to our format (without category and categories fields)
const transformedGames = [];

top100.forEach((game, index) => {
  const appId = game["AppID"];
  const genres = parseList(game["Genres"]);
  // HERE WE REMOVE CATEGORIES PARSING
  const tags = parseList(game["Tags"]);
  const screenshots = parseList(game["Screenshots"]);

  // Calculate rating from positive/negative reviews
  const positive = parseInt(game["Positive"]) || 0;
  const negative = parseInt(game["Negative"]) || 0;
  const totalReviews = positive + negative;
  const rating =
    totalReviews > 0
      ? parseFloat(((positive / totalReviews) * 10).toFixed(1))
      : 5.0;

  transformedGames.push({
    id: appId,
    title: game["Name"],
    description: game["Description"] || "No description available.",
    releaseYear: getYear(game["Release date"]),
    imageUrl:
      game["Header image"] ||
      "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800",
    developer: game["Developers"] || "Unknown",
    publisher: game["Publishers"] || "Unknown",
    platform: getPlatforms(game["Windows"], game["Mac"], game["Linux"]),
    price: parseFloat(game["Price"]) || 0,
    website: game["Website"] || "",
    tags: tags.slice(0, 10), // Limit to 10 tags
    genres: genres.length > 0 ? genres : ["Action"],
    screenshots: screenshots.slice(0, 8), // Limit to 8 screenshots
    metacriticScore: parseInt(game["Metacritic score"]) || null,
    rating: rating,
  });
});

console.log(`Transformed ${transformedGames.length} games`);

// Create SQLite database
const dbPath = path.join(__dirname, "../gamesdb.db");

// Delete existing database if it exists
if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
  console.log("Deleted existing database");
}

console.log("\nCreating SQLite database...");

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Error creating database:", err);
    process.exit(1);
  }
  console.log("Database connection established");
});

// Create table
const createTableSQL = `
CREATE TABLE games (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  releaseYear INTEGER,
  imageUrl TEXT,
  developer TEXT,
  publisher TEXT,
  platform TEXT,
  price REAL,
  website TEXT,
  genres TEXT,
  tags TEXT,
  screenshots TEXT,
  metacriticScore INTEGER,
  steamRating REAL
)
`;

db.run(createTableSQL, (err) => {
  if (err) {
    console.error("Error creating table:", err);
    process.exit(1);
  }
  console.log("Created games table");

  // Insert all games
  const insertSQL = `
  INSERT INTO games (
    id, title, description, releaseYear, imageUrl,
    developer, publisher, platform, price, website, genres, tags,
    screenshots, metacriticScore, steamRating
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const stmt = db.prepare(insertSQL);

  transformedGames.forEach((game) => {
    stmt.run(
      game.id,
      game.title,
      game.description,
      game.releaseYear,
      game.imageUrl,
      game.developer,
      game.publisher,
      JSON.stringify(game.platform),
      game.price,
      game.website,
      JSON.stringify(game.genres),
      JSON.stringify(game.tags),
      JSON.stringify(game.screenshots),
      game.metacriticScore,
      game.rating
    );
  });

  stmt.finalize((err) => {
    if (err) {
      console.error("Error inserting games:", err);
      process.exit(1);
    }

    console.log(`✓ Inserted ${transformedGames.length} games`);

    // Close database
    db.close((err) => {
      if (err) {
        console.error("Error closing database:", err);
        process.exit(1);
      }

      console.log("\nDatabase generation complete!");
    });
  });
});
