// Import the Firebase
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import { db } from "./db.js"; 

const auth = getAuth();
const VALID_DOMAIN = "@gordoncollege.edu.ph";

// --- LOGIN LOGIC ---
const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const pass = document.getElementById('login-pass').value;

        // Restriction Check
        if (!email.endsWith(VALID_DOMAIN)) {
            alert("Access Denied: Please use your official Gordon College domain account.");
            return;
        }

        try {
            await signInWithEmailAndPassword(auth, email, pass);
            window.location.href = "../frontend/homepage.html";
        } catch (err) {
            alert("Login failed: " + err.message);
        }
    });
}

// --- SIGNUP LOGIC ---
const signupForm = document.getElementById('signup-form');
if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const first = document.getElementById('reg-first').value;
        const last = document.getElementById('reg-last').value;
        const email = document.getElementById('reg-email').value;
        const pass = document.getElementById('reg-pass').value;
        const course = document.getElementById('reg-course').value;

        // Email Restriction
        if (!email.endsWith(VALID_DOMAIN)) {
            alert("Registration Denied: Only @gordoncollege.edu.ph emails are allowed.");
            return;
        }

        // Course Code Validation
        const validCodes = ['123', '456', '321', '654'];
        if (!validCodes.includes(course.toUpperCase())) {
            alert("Enter a valid CEAS course code to sign up."); 
            return;
        }

        try {
            const cred = await createUserWithEmailAndPassword(auth, email, pass);
            
            await setDoc(doc(db, "users", cred.user.uid), {
                firstName: first,
                lastName: last,
                email: email,
                courseCode: course.toUpperCase(),
            });

            alert("Registration Successful!");
            window.location.reload();
        } catch (err) {
            alert("Registration error: " + err.message);
        }
    });
}