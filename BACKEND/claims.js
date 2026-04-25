import { collection, addDoc, doc, updateDoc } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import { db } from "./db.js";
import { sendNotification } from "./smtp.js";

export async function submitClaim(itemID, claimantID, proofText, finderEmail) {
    try {
        // 1. Add the claim record
        await addDoc(collection(db, "claims"), {
            itemID: itemID,
            claimantID: claimantID,
            proofDescription: proofText,
            status: "Pending",
            timestamp: new Date().toISOString()
        });

        // 2. Update item status to "Pending"
        const itemRef = doc(db, "items", itemID);
        await updateDoc(itemRef, {
            status: "Pending"
        });

        // 3. Notify the Finder
        await sendNotification(finderEmail, "New claim submitted for your found item!");
        
        return true;
    } catch (err) {
        throw new Error("Claim submission failed: " + err.message);
    }
}