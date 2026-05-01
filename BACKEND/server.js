import dotenv from "dotenv";
dotenv.config();
import express from "express";
import { db } from "./config/firebase.js";
import itemRouter from "./routes/itemRoutes.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use("/item", itemRouter);

if (db) {
  console.log("Im working");
}

app.get("/", (req, res) => {
  res.send("Im running");
});

app.listen(PORT, () => {
  console.log("Im good");
});
