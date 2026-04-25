import dotenv from "dotenv";
dotenv.config();
import express from "express";
import admin from "firebase-admin";
import serviceAccount from "./serviceAccountKey.json" with { type: "json" };

const app = express();
app.use(express.json());
const port = 3000;

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FirebaseProjectId,
    clientEmail: process.env.ClientEmail,
    privateKey: process.env.PrivateKey.replace(/\\n/g, "\n"),
  }),
});

const db = admin.firestore();

//crud for lost items
app.get("/items", async (req, res) => {
  const files = await db.collection("items").get();
  const documents = [];
  files.forEach((doc) => {
    documents.push({ id: doc.id, ...doc.data() });
  });
  res.send(documents);
});

app.post("/items", async (req, res) => {
  const { category, description, img_url, location_found, status, title } =
    req.body;
  const item = db.collection("items").doc();
  await item.set({
    category,
    description,
    img_url,
    location_found,
    status,
    title,
  });
  res.send({ message: "item added" });
});

app.put("/items/:itemId", async (req, res) => {
  const { itemId } = req.params;
  const { category, description, img_url, location_found, status, title } =
    req.body;
  const updateItem = db.collection("items").doc(itemId);
  await updateItem.update({
    category,
    description,
    img_url,
    location_found,
    status,
    title,
  });
  res.send({ message: "item updated" });
});

app.delete("/items/:itemId", async (req, res) => {
  const { itemId } = req.params;
  const deleteItem = await db.collection("items").doc(itemId).delete();
  if (deleteItem) {
    res.send({ message: "Successfully deleted" });
  } else {
    res.send({ message: "Something went wrong" });
  }
});

//crud for claims
app.get("/claims", async (req, res) => {
  const files = await db.collection("claims").get();
  const documents = [];
  files.forEach((doc) => {
    documents.push({ id: doc.id, ...doc.data() });
  });
  res.send(documents);
});

app.post("/claims", async (req, res) => {
  const {
    claim_status,
    claimant_name,
    item_id,
    proof_description,
    student_number,
  } = req.body;
  const claim = db.collection("claims").doc();
  await claim.set({
    claim_status,
    claimant_name,
    item_id,
    proof_description,
    student_number,
  });
  res.send({ message: "claim added" });
});

app.put("/claims/:claimId", async (req, res) => {
  const { claimId } = req.params;
  const {
    claim_status,
    claimant_name,
    item_id,
    proof_description,
    student_number,
  } = req.body;
  const updateClaim = db.collection("claims").doc(claimId);
  await updateClaim.update({
    claim_status,
    claimant_name,
    item_id,
    proof_description,
    student_number,
  });
  res.send({ message: "claims updated" });
});

app.delete("/claims/:claimId", async (req, res) => {
  const { claimId } = req.params;
  const deleteClaim = await db.collection("claims").doc(claimId).delete();
  if (deleteClaim) {
    res.send({ message: "Successfully deleted" });
  } else {
    res.send({ message: "Something went wrong" });
  }
});

app.listen(port, () => {
  console.log("Hiiiiiiiiiiiiiiiii!");
});
