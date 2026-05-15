import express from "express";
import { db } from "../config/firebase.js";

const router = express.Router();

// GET /claims — fetch all claims
router.get("/", async (req, res) => {
  try {
    const snapshot = await db.collection("claims").get();
    const claims = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(claims);
  } catch (err) {
    console.error("GET /claims error:", err.message);
    res.status(500).send("Could not fetch claims.");
  }
});

export default router;