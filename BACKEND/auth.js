import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import { doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import { db } from "./db.js"; 

const auth = getAuth();
const provider = new GoogleAuthProvider();
const VALID_DOMAIN = "@gordoncollege.edu.ph";

provider.setCustomParameters({ hd: 'gordoncollege.edu.ph' });

// UI Elements
const googleBtn = document.getElementById('google-login-btn');
const googleRegSection = document.getElementById('google-registration');
const loginSection = document.getElementById('login-section');
const submitRegBtn = document.getElementById('submit-google-reg');

let pendingUser = null; // Store the user temporarily

if (googleBtn) {
    googleBtn.addEventListener('click', async () => {
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            // Security Check
            if (!user.email.endsWith(VALID_DOMAIN)) {
                await signOut(auth);
                alert("Access Denied: Only @gordoncollege.edu.ph accounts are allowed.");
                return;
            }

            // Check if user exists in Firestore
            const userRef = doc(db, "users", user.uid);
            const userSnap = await getDoc(userRef);

            if (!userSnap.exists()) {
                // NEW USER: Stop and show form
                pendingUser = user;
                loginSection.style.display = 'none';
                googleRegSection.style.display = 'block';
            } else {
                // EXISTING USER: Go straight to home
                window.location.href = "../FRONTEND/homepage.html";
            }
        } catch (err) {
            alert("Login failed: " + err.message);
        }
    });
}

// Handle the "Finish Registration" button
if (submitRegBtn) {
    submitRegBtn.addEventListener('click', async () => {
        const course = document.getElementById('google-course-code').value;
        const validCodes = ['123', '456', '321', '654'];

        if (!validCodes.includes(course.toUpperCase())) {
            alert("Invalid CEAS course code!");
            return;
        }

        try {
            // Now we create the account
            await setDoc(doc(db, "users", pendingUser.uid), {
                firstName: pendingUser.displayName ? pendingUser.displayName.split(' ')[0] : "User",
                lastName: pendingUser.displayName ? pendingUser.displayName.split(' ').slice(1).join(' ') : "",
                email: pendingUser.email,
                courseCode: course.toUpperCase(),
            });

            alert("Registration Successful!");
            window.location.href = "../FRONTEND/homepage.html";
        } catch (err) {
            alert("Error saving profile: " + err.message);
        }
    });
}