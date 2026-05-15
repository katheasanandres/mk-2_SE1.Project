import { GoogleAuthProvider, signInWithPopup, signOut } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import { doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import { auth, db } from "./db.js";

const provider = new GoogleAuthProvider();
const VALID_DOMAIN = "@gordoncollege.edu.ph";

provider.setCustomParameters({
    hd: "gordoncollege.edu.ph",
    prompt: "select_account",
});

let pendingUser = null;
let isSigningIn = false;

// Called by auth.html's inline script after T&C is accepted
window._ceasSignIn = async function () {
    if (isSigningIn) return;
    isSigningIn = true;

    const googleBtn = document.getElementById("google-login-btn");
    if (googleBtn) { googleBtn.disabled = true; googleBtn.style.opacity = "0.6"; }

    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        if (!user.email.endsWith(VALID_DOMAIN)) {
            await signOut(auth);
            alert("Access Denied: Only @gordoncollege.edu.ph accounts are allowed.");
            return;
        }

        const userSnap = await getDoc(doc(db, "users", user.uid));

        if (!userSnap.exists()) {
            pendingUser = user;
            if (window._openCourseModal) window._openCourseModal();
        } else {
            window.location.href = "homepage.html";
        }
    } catch (err) {
        const code = err.code || "";
        // User closed the popup or a duplicate call was cancelled — not an error worth showing
        if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request") {
            // do nothing
        } else if (code === "auth/popup-blocked") {
            alert("Popup was blocked by your browser. Please allow popups for this site and try again.");
        } else {
            alert("Login failed: " + err.message);
        }
    } finally {
        isSigningIn = false;
        if (googleBtn) { googleBtn.disabled = false; googleBtn.style.opacity = ""; }
    }
};

// Called by auth.html's inline script when the user submits their course code
window._ceasFinishReg = async function (code) {
    if (!pendingUser) {
        alert("Session timeout. Please sign in again.");
        if (window._closeCourseModal) window._closeCourseModal();
        return;
    }

    const inputCode = (code || "").toUpperCase().trim();
    if (!inputCode) {
        alert("Please enter your CEAS course code.");
        return;
    }

    try {
        const configSnap = await getDoc(doc(db, "config", "codes"));

        if (!configSnap.exists()) {
            alert("Database Error: Course codes not configured.");
            return;
        }

        const validCodes = configSnap.data().list;
        if (!validCodes.includes(inputCode)) {
            alert("Invalid CEAS course code. Please try again.");
            return;
        }

        const nameParts = (pendingUser.displayName || "GC Student").split(" ");
        await setDoc(doc(db, "users", pendingUser.uid), {
            displayName: pendingUser.displayName || "GC Student",
            firstName:   nameParts[0] || "GC",
            lastName:    nameParts.slice(1).join(" ") || "Student",
            email:       pendingUser.email,
            courseCode:  inputCode,
            role:        "student",
            createdAt:   new Date(),
        });

        alert("Registration Successful! Welcome to CEAS FIND.");
        window.location.href = "homepage.html";
    } catch (err) {
        console.error(err);
        alert("Registration failed: " + err.message);
    }
};
