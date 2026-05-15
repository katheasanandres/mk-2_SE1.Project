import { collection, addDoc, doc, updateDoc } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import { db } from "./db.js";

export async function submitClaim(itemID, claimantID, claimantName, claimantEmail, proofText) {
    try {
        await addDoc(collection(db, "claims"), {
            itemID,
            claimantID,
            claimantName: claimantName || "",
            claimantEmail: claimantEmail || "",
            proofDescription: proofText,
            status: "Pending",
            timestamp: new Date().toISOString()
        });

        const itemRef = doc(db, "items", itemID);
        await updateDoc(itemRef, { status: "Pending" });

        return true;
    } catch (err) {
        throw new Error("Claim submission failed: " + err.message);
    }
}
