import { collection, addDoc } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-storage.js";
import { db, auth, storage } from "./db.js"; 

export async function uploadPost() {
    console.log("Function 'uploadPost' triggered!"); //test 1

    const lostItem = document.getElementById('lostItemInput').value;
    const foundItem = document.getElementById('foundItemInput').value;
    const category = document.getElementById('categorySelect').value;
    const description = document.getElementById('descTextarea').value;
    const fileInput = document.getElementById('imageInput');
    const file = fileInput.files[0];

    console.log("Inputs gathered:", { lostItem, foundItem, category, file }); //test2
    if (!lostItem || !foundItem || !category || !file) {
        alert("Please fill in all fields and select an image!");
        return;
    }

    try {
        console.log("Starting Storage Upload..."); // test 3
        const storageRef = ref(storage, 'items/' + Date.now() + '_' + file.name);
        const snapshot = await uploadBytes(storageRef, file);
        
        console.log("Upload successful, getting URL..."); // test 4
        const imageUrl = await getDownloadURL(snapshot.ref);

        console.log("Saving to Firestore..."); // test 5
        await addDoc(collection(db, "items"), {
            user: auth.currentUser ? auth.currentUser.email : "Anonymous",
            lostItem: lostItem,
            foundItem: foundItem,
            category: category,
            description: description,
            status: "Unclaimed",
            image: imageUrl,
            createdAt: new Date().toISOString()
        });

        alert("Missing Item shared successfully!");
        window.location.href = "homepage.html";
    } catch (err) {
        console.error("CRITICAL ERROR:", err); // #6 This will tell us the exact error
        alert("Failed to post: " + err.message);
    }
}