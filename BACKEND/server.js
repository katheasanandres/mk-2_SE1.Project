import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import itemRouter from "./routes/itemRoutes.js";
import savedRouter from "./routes/savedRoutes.js";
import { getNotifications } from "./controllers/itemController.js";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 3000;

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({
  origin: [
    "http://127.0.0.1:5500",
    "http://localhost:5500",
    "http://localhost:3000",
  ],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve the frontend folder statically
app.use(express.static(path.join(__dirname, "../FRONTEND")));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/item", itemRouter);
app.use("/saved", savedRouter);

// ── GET /notifications?uid=xxx ────────────────────────────────────────────────
app.get("/notifications", async (req, res) => {
  try {
    const { uid } = req.query;
    if (!uid) return res.status(400).send("uid is required.");
    const notifs = await getNotifications(uid);
    res.status(200).json(notifs);
  } catch (err) {
    console.error("GET /notifications error:", err.message);
    res.status(500).send("Could not fetch notifications.");
  }
});

// Fallback: serve homepage for any unmatched GET
app.get("*splat", (req, res) => {
  res.sendFile(path.join(__dirname, "../FRONTEND/homepage.html"));
});

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`CEASFind server running on http://localhost:${PORT}`);
});