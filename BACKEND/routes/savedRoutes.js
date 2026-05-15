// BACKEND/routes/savedRoutes.js
import express from "express";
import { db } from "../config/firebase.js";  // Admin SDK instance

const router = express.Router();

// ── GET /saved?uid=xxx ───────────────────────────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const { uid } = req.query;
    if (!uid) return res.status(400).send("uid is required.");

    // Admin SDK: db.collection(...).get()  — NOT getDocs(collection(...))
    const snapshot = await db
      .collection("users")
      .doc(uid)
      .collection("savedItems")
      .get();

    const savedIds = snapshot.docs.map((d) => d.id);
    res.status(200).json(savedIds);
  } catch (err) {
    console.error("GET /saved error:", err.message);
    res.status(500).send("Could not fetch saved items.");
  }
});

// ── POST /saved — save an item ───────────────────────────────────────────────
router.post("/", async (req, res) => {
  try {
    const { uid, postId } = req.body;
    if (!uid || !postId) return res.status(400).send("uid and postId are required.");

    await db
      .collection("users")
      .doc(uid)
      .collection("savedItems")
      .doc(postId)
      .set({ savedAt: new Date().toISOString() });

    res.status(200).json({ success: true });
  } catch (err) {
    console.error("POST /saved error:", err.message);
    res.status(500).send("Could not save item.");
  }
});

// ── DELETE /saved/:postId?uid=xxx ────────────────────────────────────────────
router.delete("/:postId", async (req, res) => {
  try {
    const { uid } = req.query;
    const { postId } = req.params;
    if (!uid || !postId) return res.status(400).send("uid and postId are required.");

    await db
      .collection("users")
      .doc(uid)
      .collection("savedItems")
      .doc(postId)
      .delete();

    res.status(200).json({ success: true });
  } catch (err) {
    console.error("DELETE /saved error:", err.message);
    res.status(500).send("Could not unsave item.");
  }
});

export default router;