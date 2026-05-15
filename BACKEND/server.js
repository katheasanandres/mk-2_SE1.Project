import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import { db } from "./config/firebase.js";
import itemRouter from "./routes/itemRoutes.js";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: ["http://127.0.0.1:5500", "http://localhost:5500"] }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "../FRONTEND")));

app.use("/item", itemRouter);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../FRONTEND/homepage.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
