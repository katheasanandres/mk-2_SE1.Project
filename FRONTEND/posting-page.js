import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-storage.js";
import { db, auth, storage } from "./db.js";

export async function uploadPost() {
    console.log("Function 'uploadPost' triggered!");

    const lostItem = document.getElementById('lostItemInput').value;
    const foundItem = document.getElementById('foundItemInput').value;
    const category = document.getElementById('categorySelect').value;
    const description = document.getElementById('descTextarea').value;
    const fileInput = document.getElementById('imageInput');
    const file = fileInput.files[0];

    if ((!lostItem && !foundItem) || !category || !file) {
        alert("Please fill in the item names, category, and select an image!");
        return;
    }

    try {
        console.log("Starting Storage Upload...");
        const storageRef = ref(storage, 'items/' + Date.now() + '_' + file.name);
        const snapshot = await uploadBytes(storageRef, file);

        console.log("Upload successful, getting URL...");
        const imageUrl = await getDownloadURL(snapshot.ref);

        console.log("Saving to Firestore...");
        await addDoc(collection(db, "items"), {
            reporterName: auth.currentUser ? auth.currentUser.displayName : "Anonymous",
            reporterEmail: auth.currentUser ? auth.currentUser.email : "",
            lostItem: lostItem,
            foundItem: foundItem,
            category: category,
            description: description,
            status: "Unclaimed",
            img_url: imageUrl,
            createdAt: serverTimestamp()
        });

        alert("Item shared successfully!");
        window.location.href = "homepage.html";
    } catch (err) {
        console.error("CRITICAL ERROR:", err);
        alert("Failed to post: " + err.message);
    }
}
