import express from "express";
import { upload } from "../middleware/uploadMiddleware.js";
import {
  claimItem,
  deleteItem,
  getAllItems,
  getElementByID,
  getHistoryItems,
  reportItem,
  updateItem,
} from "../controllers/itemController.js";

const router = express.Router();

router.post("/", upload.single("img_url"), async (req, res) => {
  try {
    const userInput = req.body;
    const userFile = req.file;

    await reportItem(userInput, userFile);

    res.status(200).send("Image and data received successfully");
  } catch (error) {
    res.status(500).send("Something went wrong on our end.");
    console.log(error);
  }
});

router.get("/history", async (req, res) => {
  try {
    const response = await getHistoryItems();
    res.status(200).json(response);
  } catch (error) {
    res.status(500).send("Something went wrong on our end.");
    console.log(error);
  }
});

router.get("/", async (req, res) => {
  try {
    const getItem = await getAllItems();
    res.status(200).json(getItem);
  } catch (error) {
    res.status(500).send("Something went wrong on our end.");
    console.log(error);
  }
});

router.get("/:id", async (req, res) => {
  try {
    const itemID = req.params.id;
    const getById = await getElementByID(itemID);

    if (!getById) {
      res.status(404).send("Item not found.");
      return;
    }
    res.status(200).json(getById);
  } catch (error) {
    res.status(500).send("Something went wrong on our end.");
    console.log(error);
  }
});

router.put("/:id/claim", async (req, res) => {
  try {
    const claimItemId = req.params.id;

    await claimItem(claimItemId);
    res.status(200).send("Status updated successfully.");
  } catch (error) {
    res.status(500).send("Something went wrong on our end.");
    console.log(error);
  }
});

router.put("/:id", upload.single("img_url"), async (req, res) => {
  try {
    const itemId = req.params.id;
    const itemData = req.body;
    const userFile = req.file;

    await updateItem(itemId, itemData, userFile);
    res.status(200).send("Updated Successfully.");
  } catch (error) {
    res.status(500).send("Something went wrong on our end.");
    console.log(error);
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const itemId = req.params.id;
    await deleteItem(itemId);

    res.status(200).send("Successfully Deleted.");
  } catch (error) {
    res.status(500).send("Something went wrong on our end.");
    console.log(error);
  }
});

export default router;
