import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to parse CSV line (handles quoted fields with commas)
function parseCSVLine(line) {
  const result = [];
  let current = '';
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

// Generate realistic usernames
const usernameTemplates = [
  "Gamer",
  "Pro",
  "Player",
  "Master",
  "Legend",
  "Epic",
  "Ultimate",
  "Supreme",
  "Alpha",
  "Shadow",
  "Ninja",
  "Dragon",
  "Phoenix",
  "Storm",
  "Blade",
  "Knight",
  "Warrior",
  "Hunter",
  "Ranger",
  "Wizard",
  "Mage",
  "Demon",
  "Angel",
  "Beast",
  "Titan",
  "Ghost",
  "Viper",
  "Falcon",
  "Wolf",
  "Bear",
  "Lion",
  "Tiger",
];

function generateUsername() {
  const template =
    usernameTemplates[Math.floor(Math.random() * usernameTemplates.length)];
  const suffix = Math.floor(Math.random() * 9999);
  return `${template}${suffix}`;
}

// Generate review content
const reviewTitles = [
  "Amazing game!",
  "Highly recommend",
  "Best game ever",
  "Absolutely fantastic",
  "Must play",
  "Incredible experience",
  "Masterpiece",
  "Outstanding",
  "Pretty good",
  "Solid game",
  "Worth playing",
  "Enjoyable",
  "Fun but flawed",
  "Mixed feelings",
  "Disappointing",
  "Could be better",
  "Not bad",
  "Decent game",
  "Great time sink",
  "Addictive gameplay",
];

const reviewContents = [
  "This game exceeded all my expectations. The graphics are stunning and the gameplay is incredibly smooth. I've put over 100 hours into it and still finding new things to discover.",
  "One of the best games I've ever played. The story is engaging, the mechanics are polished, and the replay value is through the roof. Definitely worth the price.",
  "Absolutely love this game! The developers clearly put a lot of thought into every aspect. The community is great too.",
  "This is a masterclass in game design. Every element feels carefully crafted and the experience is unforgettable. Can't recommend it enough.",
  "Really enjoyable experience from start to finish. A few minor bugs here and there but nothing game-breaking. Overall very satisfied with my purchase.",
  "Solid gameplay with some unique mechanics. Takes a while to get into but once you do, it's hard to put down. Worth checking out if you like this genre.",
  "Pretty fun game overall. Has its moments of brilliance but also some frustrating parts. Still recommended for fans of the genre.",
  "Good game but has some issues. The core gameplay is fun but it feels a bit repetitive after a while. Still worth playing though.",
  "Mixed bag. Some parts are amazing while others feel underdeveloped. With some updates, this could be great.",
  "Decent game that does some things well and others not so much. Worth getting on sale.",
  "The best entry in the series yet. Improves on everything from the previous games while adding new features.",
  "An absolute gem that deserves more attention. Indie masterpiece that rivals AAA titles.",
  "Countless hours of entertainment. The progression system keeps you hooked and there's always something new to work towards.",
  "Challenging but fair. Requires skill and strategy which makes victories feel earned.",
  "Great co-op experience. Even better with friends. The multiplayer is where this game really shines.",
  "Surprisingly deep mechanics that reward mastery. Easy to learn but hard to master.",
  "Beautiful art style and soundtrack. The atmosphere is incredible and really draws you in.",
  "Fast-paced action that keeps your adrenaline pumping. Perfect for quick gaming sessions.",
  "Engaging story with memorable characters. Found myself emotionally invested in their journeys.",
  "Innovative gameplay that brings something new to the genre. Refreshing take on familiar concepts.",
];

function generateReview(gameId, index) {
  // Generate rating on 1-10 scale with 0.1 precision, biased towards 6-9
  const rating =
    Math.random() < 0.7
      ? (Math.random() * 4 + 6).toFixed(1) // 6.0-10.0 (70% chance)
      : (Math.random() * 5 + 3).toFixed(1); // 3.0-8.0 (30% chance)
  const title = reviewTitles[Math.floor(Math.random() * reviewTitles.length)];
  const content =
    reviewContents[Math.floor(Math.random() * reviewContents.length)];
  const helpful = Math.floor(Math.random() * 500);

  // Random date within last 2 years
  const daysAgo = Math.floor(Math.random() * 730);
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);

  return {
    id: `review-${gameId}-${index}`,
    gameId: gameId,
    userId: `user-${Math.floor(Math.random() * 10000)}`,
    username: generateUsername(),
    userAvatar: `https://i.pravatar.cc/150?img=${Math.floor(
      Math.random() * 70
    )}`,
    rating: parseFloat(rating),
    title: title,
    content: content,
    helpful: helpful,
    createdAt: date.toISOString(),
  };
}

// Main processing
console.log("Reading games.csv...");
const csvPath = path.join(__dirname, "../games.csv");
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

// Transform to our format
const transformedGames = [];
const allReviews = [];

top100.forEach((game, index) => {
  const appId = game["AppID"];
  const genres = parseList(game["Genres"]);
  const categories = parseList(game["Categories"]);
  const tags = parseList(game["Tags"]);
  const screenshots = parseList(game["Screenshots"]);

  // Generate 5-10 reviews for this game
  const numReviews = Math.floor(Math.random() * 6) + 5; // 5-10 reviews
  const gameReviews = [];
  for (let i = 0; i < numReviews; i++) {
    const review = generateReview(appId, i);
    gameReviews.push(review);
    allReviews.push(review);
  }

  // Calculate average rating (already on 1-10 scale)
  const avgRating =
    gameReviews.reduce((sum, r) => sum + r.rating, 0) / gameReviews.length;

  transformedGames.push({
    id: appId,
    title: game["Name"],
    description: game["Description"] || "No description available.",
    genres: genres.length > 0 ? genres : ["Action"],
    rating: parseFloat(avgRating.toFixed(1)),
    releaseYear: getYear(game["Release date"]),
    imageUrl:
      game["Header image"] ||
      "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800",
    screenshots: screenshots.slice(0, 8), // Limit to 8 screenshots
    developer: game["Developers"] || "Unknown",
    publisher: game["Publishers"] || "Unknown",
    platform: getPlatforms(game["Windows"], game["Mac"], game["Linux"]),
    price: parseFloat(game["Price"]) || 0,
    website: game["Website"] || "",
    categories: categories,
    metacriticScore: parseInt(game["Metacritic score"]) || null,
    isFeatured: index < 5, // Top 5 are featured
    tags: tags.slice(0, 10), // Limit to 10 tags
    category: index < 20 ? "trending" : index < 40 ? "action" : "top-rated",
  });
});

console.log(
  `Generated ${transformedGames.length} games and ${allReviews.length} reviews`
);

// Write games file
const gamesFileContent = `import type { Game } from '../types/Game';

export const gamesFromCSV: Game[] = ${JSON.stringify(
  transformedGames,
  null,
  2
)};

// Helper functions
export const getFeaturedGames = (): Game[] => {
  return gamesFromCSV.filter((game) => game.isFeatured === true).slice(0, 5);
};

export const getTrendingGames = (): Game[] => {
  return gamesFromCSV.filter((game) => game.category === 'trending').slice(0, 8);
};

export const getActionGames = (): Game[] => {
  return gamesFromCSV.filter((game) => game.category === 'action').slice(0, 8);
};

export const getTopRatedGames = (): Game[] => {
  return gamesFromCSV.filter((game) => game.category === 'top-rated').slice(0, 8);
};

export const getGameById = (id: string): Game | undefined => {
  return gamesFromCSV.find((game) => game.id === id);
};

export const getAllGenres = (): string[] => {
  const genresSet = new Set<string>();
  gamesFromCSV.forEach((game) => {
    game.genres.forEach((genre) => genresSet.add(genre));
  });
  return Array.from(genresSet).sort();
};
`;

const gamesFilePath = path.join(__dirname, "../gamesFromCSV.ts");
fs.writeFileSync(gamesFilePath, gamesFileContent);
console.log(`✓ Written ${gamesFilePath}`);

// Write reviews file
const reviewsFileContent = `import type { Review } from '../types/Review';

export const mockReviews: Review[] = ${JSON.stringify(allReviews, null, 2)};

export const getReviewsByGameId = (gameId: string): Review[] => {
  return mockReviews.filter((review) => review.gameId === gameId);
};

export const getReviewById = (id: string): Review | undefined => {
  return mockReviews.find((review) => review.id === id);
};
`;

const reviewsFilePath = path.join(__dirname, "../mockReviews.ts");
fs.writeFileSync(reviewsFilePath, reviewsFileContent);
console.log(`✓ Written ${reviewsFilePath}`);

console.log("\n✅ Data generation complete!");
console.log(`   - ${transformedGames.length} games`);
console.log(`   - ${allReviews.length} reviews`);
console.log(
  `   - Average ${(allReviews.length / transformedGames.length).toFixed(
    1
  )} reviews per game`
);
