// BACKEND/controllers/itemController.js
import { db } from "../config/firebase.js";
import { FieldValue } from "firebase-admin/firestore";
import nodemailer from "nodemailer";

export async function reportItem(inputOne, inputTwo) {
  try {
    const fileToString = inputTwo.buffer.toString("base64");
    const prefix = `data:${inputTwo.mimetype};base64,`;

    const docRef = await db.collection("items").add({
      ...inputOne,
      img_url: prefix + fileToString,
      createdAt: FieldValue.serverTimestamp(),
      status: "unclaimed",
    });

    return docRef;
  } catch (error) {
    console.error("Database Error:", error.message);
    throw error;
  }
}

export async function getAllItems() {
  try {
    const snapshot = await db.collection("items").get();
    const items = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return items;
  } catch (error) {
    console.error("Cannot Get:", error.message);
    throw error;
  }
}

export async function getElementByID(id) {
  try {
    const docSnap = await db.collection("items").doc(id).get();

    if (!docSnap.exists) {
      throw new Error("Item not found.");
    }

    return {
      id: docSnap.id,
      ...docSnap.data(),
    };
  } catch (error) {
    console.error("Cannot Get by ID:", error.message);
    throw error;
  }
}

export async function updateItem(id, newData, file) {
  try {
    const updateData = {
      ...newData,
      updatedAt: FieldValue.serverTimestamp(),
    };

    if (file) {
      const fileToString = file.buffer.toString("base64");
      const prefix = `data:${file.mimetype};base64,`;
      updateData.img_url = prefix + fileToString;
    }

    await db.collection("items").doc(id).update(updateData);
    return updateData;
  } catch (error) {
    console.error("Cannot Update:", error.message);
    throw error;
  }
}

export async function deleteItem(id, requesterEmail, requesterUid) {
  try {
    const itemSnap = await db.collection("items").doc(id).get();
    if (!itemSnap.exists) throw new Error("Item not found.");
    const item = itemSnap.data();

    // Admin check (hardcoded via .env)
    const adminEmails = (process.env.ADMIN_EMAILS || "")
      .split(",")
      .map(e => e.trim().toLowerCase());
    const isAdmin = adminEmails.includes((requesterEmail || "").toLowerCase());

    // Owner check
    const isOwner = requesterEmail && item.reporterEmail === requesterEmail;

    if (!isOwner && !isAdmin) {
      const err = new Error("Forbidden");
      err.status = 403;
      throw err;
    }

    await db.collection("items").doc(id).delete();
  } catch (error) {
    console.error("Cannot Delete:", error.message);
    throw error;
  }
}

export async function claimItem(id) {
  try {
    await db.collection("items").doc(id).update({
      status: "claimed",
      claimedAt: FieldValue.serverTimestamp(),
    });
  } catch (error) {
    console.error("Cannot Claim:", error.message);
    throw error;
  }
}

export async function getHistoryItems(userEmail) {
  try {
    const snapshot = await db.collection("items").get();
    const filteredRes = [];

    for (const doc of snapshot.docs) {
      const data = doc.data();
      if (!userEmail || data.reporterEmail === userEmail) {
        filteredRes.push({ id: doc.id, ...data });
      }
    }

    return filteredRes;
  } catch (error) {
    console.error("Cannot Get History:", error.message);
    throw error;
  }
}

export async function sendClaimRequest(postId, { claimantName, claimantEmail, claimantContact, secretDetail }) {
  try {
    const docSnap = await db.collection("items").doc(postId).get();
    if (!docSnap.exists) throw new Error("Item not found.");

    const item          = docSnap.data();
    const reporterEmail = item.reporterEmail;
    const reporterUid   = item.reporterUid;   // saved at post creation time
    const itemName      = item.itemName || "an item";

    // 1. Send email to reporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from:    `"CEASFind" <${process.env.SMTP_USER}>`,
      to:      reporterEmail,
      subject: `Someone wants to claim: ${itemName}`,
      html: `
        <h2>Claim Request for "${itemName}"</h2>
        <p><strong>Claimant Name:</strong> ${claimantName}</p>
        <p><strong>Claimant Email:</strong> ${claimantEmail}</p>
        <p><strong>Contact:</strong> ${claimantContact || "Not provided"}</p>
        <hr />
        <p><strong>Secret Detail they provided:</strong></p>
        <blockquote>${secretDetail}</blockquote>
        <p>If this detail matches what you know about the item, please contact the claimant to arrange retrieval.</p>
      `,
    });

    // 2. Save notification to Firestore for the reporter
    if (reporterUid) {
      await db.collection("users").doc(reporterUid).collection("notifications").add({
        type:            "claim_request",
        postId,
        itemName,
        claimantName,
        claimantEmail,
        claimantContact: claimantContact || null,
        secretDetail,
        read:            false,
        createdAt:       FieldValue.serverTimestamp(),
      });
    }
  } catch (error) {
    console.error("sendClaimRequest error:", error.message);
    throw error;
  }
}

// ── Get notifications for a user ─────────────────────────────────────────────
export async function getNotifications(uid) {
  try {
    const snapshot = await db
      .collection("users")
      .doc(uid)
      .collection("notifications")
      .orderBy("createdAt", "desc")
      .limit(20)
      .get();

    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Cannot Get Notifications:", error.message);
    throw error;
  }
}

export async function submitClaim(postId, { claimantName, claimantEmail, claimantContact, secretDetail }) {
  try {
    const docSnap = await db.collection("items").doc(postId).get();
    if (!docSnap.exists) throw new Error("Item not found.");

    const item = docSnap.data();

    // 1. Write to claims collection
    await db.collection("claims").add({
      itemID:          postId,
      itemName:        item.itemName || "",
      claimantName:    claimantName || "",
      claimantEmail:   claimantEmail || "",
      claimantContact: claimantContact || null,
      proofDescription: secretDetail,
      status:          "pending",
      timestamp:       FieldValue.serverTimestamp(),
    });

    // 2. Update item status to pending
    await db.collection("items").doc(postId).update({
      status: "pending",
    });

    // 3. Send email to reporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from:    `"CEASFind" <${process.env.SMTP_USER}>`,
      to:      item.reporterEmail,
      subject: `Claim Request: ${item.itemName}`,
      html: `
        <h2>Someone wants to claim "${item.itemName}"</h2>
        <p><strong>Name:</strong> ${claimantName}</p>
        <p><strong>Email:</strong> ${claimantEmail}</p>
        <p><strong>Contact:</strong> ${claimantContact || "Not provided"}</p>
        <hr/>
        <p><strong>Proof/Secret Detail:</strong></p>
        <blockquote>${secretDetail}</blockquote>
        <p>Go to your <strong>Review</strong> page on CEASFind to approve or ignore this claim.</p>
      `,
    });

    // 4. Save notification to reporter
    if (item.reporterUid) {
      await db.collection("users").doc(item.reporterUid).collection("notifications").add({
        type:            "claim_request",
        postId,
        itemName:        item.itemName || "",
        claimantName,
        claimantEmail,
        claimantContact: claimantContact || null,
        secretDetail,
        read:            false,
        createdAt:       FieldValue.serverTimestamp(),
      });
    }
  } catch (error) {
    console.error("submitClaim error:", error.message);
    throw error;
  }
}