import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import { doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import { db } from "./db.js"; 

const auth = getAuth();
const provider = new GoogleAuthProvider();
const VALID_DOMAIN = "@gordoncollege.edu.ph";

// tells Google to ONLY show accounts with this domain
provider.setCustomParameters({
    hd: 'gordoncollege.edu.ph'
});

// --- GOOGLE AUTH LOGIC ---
const googleBtn = document.getElementById('google-login-btn');
if (googleBtn) {
    googleBtn.addEventListener('click', async () => {
        try {
            // 1. Trigger Google Sign-In popup
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            // 2. Double Security Check: Verify domain
            if (!user.email.endsWith(VALID_DOMAIN)) {
                await signOut(auth); // Sign them out immediately
                alert("Access Denied: Only @gordoncollege.edu.ph accounts are allowed.");
                return;
            }

            // 3. Save user info to Firestore if it's their first time then we check
            // if user actually exists in Firestore, if not we create a new account for them
            const userRef = doc(db, "users", user.uid);
            const userSnap = await getDoc(userRef);

            if (!userSnap.exists()) {
                await setDoc(userRef, {
                    firstName: user.displayName ? user.displayName.split(' ')[0] : "User",
                    lastName: user.displayName ? user.displayName.split(' ').slice(1).join(' ') : "",
                    email: user.email,
                    courseCode: "PENDING", // You can update this later
                });
            }

            // 4. Redirect to homepage
            window.location.href = "../FRONTEND/homepage.html";

        } catch (err) {
            console.error("Auth Error:", err);
            alert("Login failed: " + err.message);
        }
    });
}