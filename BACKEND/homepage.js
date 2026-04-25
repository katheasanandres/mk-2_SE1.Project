import { collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import { db } from "./db.js";

export async function getFirebasePosts() {
    try {
        const q = query(collection(db, "items"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        
        const posts = [];
        querySnapshot.forEach((doc) => {
            // Merge the document ID with the data
            posts.push({ id: doc.id, ...doc.data() });
        });
        return posts;
    } catch (err) {
        console.error("Error fetching posts:", err);
        return [];
    }
}