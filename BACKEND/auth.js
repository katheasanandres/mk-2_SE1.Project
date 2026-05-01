import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import { doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import { db } from "./db.js"; 

const auth = getAuth();
const provider = new GoogleAuthProvider();
const VALID_DOMAIN = "@gordoncollege.edu.ph";

// picking the damn accounts and domain restriction
provider.setCustomParameters({ 
    hd: 'gordoncollege.edu.ph',
    prompt: 'select_account' // This fixes the "no popup" issue
});

// UI Elements
const googleBtn = document.getElementById('google-login-btn');
const googleRegSection = document.getElementById('google-registration');
const loginSection = document.getElementById('login-section');
const submitRegBtn = document.getElementById('submit-google-reg');

let pendingUser = null; 

// 1. LOGIN LOGIC
if (googleBtn) {
    googleBtn.addEventListener('click', async () => {
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            if (!user.email.endsWith(VALID_DOMAIN)) {
                await signOut(auth);
                alert("Access Denied: Only @gordoncollege.edu.ph accounts are allowed.");
                return;
            }

            const userRef = doc(db, "users", user.uid);
            const userSnap = await getDoc(userRef);

            if (!userSnap.exists()) {
                pendingUser = user; // Hold user info for the next step
                loginSection.style.display = 'none';
                googleRegSection.style.display = 'block';
            } else {
                window.location.href = "../FRONTEND/homepage.html";
            }
        } catch (err) {
            alert("Login failed: " + err.message);
        }
    });
}

// 2. REGISTRATION LOGIC
if (submitRegBtn) {
    submitRegBtn.addEventListener('click', async () => {
        if (!pendingUser) {
            alert("Session timeout. Please click 'Sign in with Google' again.");
            location.reload();
            return;
        }

        const inputCode = document.getElementById('google-course-code').value.toUpperCase();

        try {
            const configRef = doc(db, "config", "codes");
            const configSnap = await getDoc(configRef);

            if (!configSnap.exists()) {
                alert("Database Error: Course codes not found.");
                return;
            }

            const validCodes = configSnap.data().list; 

            if (!validCodes.includes(inputCode)) {
                alert("Invalid CEAS course code!");
                return;
            }

            // creates profile/account
            await setDoc(doc(db, "users", pendingUser.uid), {
                firstName: pendingUser.displayName ? pendingUser.displayName.split(' ')[0] : "User",
                lastName: pendingUser.displayName ? pendingUser.displayName.split(' ').slice(1).join(' ') : "",
                email: pendingUser.email,
                courseCode: inputCode,
                createdAt: new Date()
            });

            alert("Registration Successful!");
            window.location.href = "../FRONTEND/homepage.html";
        } catch (err) {
            console.error(err);
            alert("Permission Denied or Error: " + err.message);
        }
    });
}