import { db } from "../config/firebase.js";
import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  updateDoc,
  getDocs,
  deleteDoc,
  getDoc,
} from "firebase/firestore";

export async function reportItem(inputOne, inputTwo) {
  try {
    const fileToString = inputTwo.buffer.toString("base64");
    const prefix = `data:${inputTwo.mimetype};base64,`;

    const uploadItems = await addDoc(collection(db, "items"), {
      ...inputOne,
      img_url: prefix + fileToString,
      createdAt: serverTimestamp(),
      status: "unclaimed",
    });
    return uploadItems;
  } catch (error) {
    console.error("Database Error:", error.message);
    throw error;
  }
}

export async function getAllItems() {
  try {
    const snapshot = await getDocs(collection(db, "items"));
    const items = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return items;
  } catch (error) {
    console.log("Cannot Get: ", error.message);
    throw error;
  }
}

export async function getElementByID(id) {
  try {
    const docRef = doc(db, "items", id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      throw new Error("Item not found.");
    }

    return {
      id: docSnap.id,
      ...docSnap.data(),
    };
  } catch (error) {
    console.log("Cannot Get by ID: ", error.message);
    throw error;
  }
}

export async function updateItem(id, newData, file) {
  try {
    const docRef = doc(db, "items", id);
    const updateData = {
      ...newData,
      updatedAt: serverTimestamp(),
    };
    if (file) {
      const fileToString = file.buffer.toString("base64");
      const prefix = `data:${file.mimetype};base64,`;
      const newFileName = prefix + fileToString;
      updateData.img_url = newFileName;
    }

    await updateDoc(docRef, updateData);
    return updateData;
  } catch (error) {
    console.log("Cannot Update: ", error.message);
    throw error;
  }
}

export async function deleteItem(id, requesterEmail, requesterUid) {
  try {
    const itemRef  = doc(db, "items", id);
    const itemSnap = await getDoc(itemRef);
    if (!itemSnap.exists()) throw new Error("Item not found.");
    const item = itemSnap.data();

    // Owner check
    if (requesterEmail && item.reporterEmail === requesterEmail) {
      await deleteDoc(itemRef);
      return;
    }

    // Admin check — read the requester's user document
    if (requesterUid) {
      const userSnap = await getDoc(doc(db, "users", requesterUid));
      if (userSnap.exists() && userSnap.data().role === "admin") {
        await deleteDoc(itemRef);
        return;
      }
    }

    const err = new Error("Forbidden");
    err.status = 403;
    throw err;
  } catch (error) {
    console.log("Cannot delete: ", error.message);
    throw error;
  }
}

export async function claimItem(id) {
  try {
    const docRef = doc(db, "items", id);
    const updateStatus = {
      status: "claimed",
      claimedAt: serverTimestamp(),
    };
    await updateDoc(docRef, updateStatus);
  } catch (error) {
    console.log("Cannot Update: ", error.message);
    throw error;
  }
}

export async function getHistoryItems(userEmail) {
  try {
    const snapshot = await getDocs(collection(db, "items"));
    const filteredRes = [];
    for (const doc of snapshot.docs) {
      const data = doc.data();
      if (!userEmail || data.reporterEmail === userEmail) {
        filteredRes.push({ id: doc.id, ...data });
      }
    }
    return filteredRes;
  } catch (error) {
    console.log("Cannot Get Result: ", error.message);
    throw error;
  }
}
