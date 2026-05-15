import express from "express";
import { upload } from "../middleware/uploadMiddleware.js";
import {
  claimItem,
  deleteItem,
  getAllItems,
  getElementByID,
  getHistoryItems,
  getNotifications,
  reportItem,
  sendClaimRequest,
  updateItem,
} from "../controllers/itemController.js";

const router = express.Router();

// ── POST /item  — Create a new lost/found post ──────────────────────────────
router.post("/", upload.single("img_url"), async (req, res) => {
  try {
    const newId = await reportItem(req.body, req.file);
    res.status(201).json({ success: true, id: newId });
  } catch (error) {
    console.error(error);
    res.status(500).send("Something went wrong on our end.");
  }
});

// ── GET /item/history?userEmail=... ─────────────────────────────────────────
router.get("/history", async (req, res) => {
  try {
    const { userEmail } = req.query;
    const response = await getHistoryItems(userEmail);
    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(500).send("Something went wrong on our end.");
  }
});

// ── GET /item  — Fetch all items ─────────────────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const items = await getAllItems();
    res.status(200).json(items);
  } catch (error) {
    console.error(error);
    res.status(500).send("Something went wrong on our end.");
  }
});

// ── GET /item/:id ────────────────────────────────────────────────────────────
router.get("/:id", async (req, res) => {
  try {
    const item = await getElementByID(req.params.id);
    res.status(200).json(item);
  } catch (error) {
    if (error.message === "Item not found.") return res.status(404).send("Item not found.");
    console.error(error);
    res.status(500).send("Something went wrong on our end.");
  }
});

// ── POST /item/:id/claim-request  — Send claim email to reporter ─────────────
router.post("/:id/claim-request", async (req, res) => {
  try {
    const { claimantName, claimantEmail, claimantContact, secretDetail } = req.body;

    if (!claimantName || !claimantEmail || !secretDetail) {
      return res.status(400).json({
        error: "claimantName, claimantEmail, and secretDetail are required.",
      });
    }

    await sendClaimRequest(req.params.id, {
      claimantName,
      claimantEmail,
      claimantContact,
      secretDetail,
    });

    res.status(200).json({ success: true, message: "Claim request sent to reporter." });
  } catch (error) {
    if (error.message === "Item not found.") return res.status(404).send("Item not found.");
    console.error(error);
    res.status(500).send("Something went wrong sending the claim request.");
  }
});

// ── PUT /item/:id/claim  — Mark item as Claimed ───────────────────────────────
router.put("/:id/claim", async (req, res) => {
  try {
    await claimItem(req.params.id);
    res.status(200).send("Status updated successfully.");
  } catch (error) {
    console.error(error);
    res.status(500).send("Something went wrong on our end.");
  }
});

// ── PUT /item/:id  — Edit an existing item ────────────────────────────────────
router.put("/:id", upload.single("img_url"), async (req, res) => {
  try {
    await updateItem(req.params.id, req.body, req.file);
    res.status(200).send("Updated successfully.");
  } catch (error) {
    console.error(error);
    res.status(500).send("Something went wrong on our end.");
  }
});

// ── DELETE /item/:id ──────────────────────────────────────────────────────────
router.delete("/:id", async (req, res) => {
  try {
    const { requesterEmail, requesterUid } = req.query;
    await deleteItem(req.params.id, requesterEmail, requesterUid);
    res.status(200).send("Successfully deleted.");
  } catch (error) {
    if (error.message === "Forbidden") {
      return res.status(403).send("You do not have permission to delete this post.");
    }
    if (error.message === "Item not found.") return res.status(404).send("Item not found.");
    console.error(error);
    res.status(500).send("Something went wrong on our end.");
  }
});

export default router;