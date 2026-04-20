
    import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
    import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js";
    import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-analytics.js";

    const firebaseConfig = {
        apiKey: "AIzaSyAn1eLL9DqhkLELNAo8vOLNaJXM8E7o0Ek",
        authDomain: "chronio.firebaseapp.com",
        projectId: "chronio",
        storageBucket: "chronio.firebasestorage.app",
        messagingSenderId: "211767945797",
        appId: "1:211767945797:web:c5bf36710019ff314b912c", 
        measurementId: "G-98YFP5FNQ6"
    };

    const app = initializeApp(firebaseConfig);
    const analytics = getAnalytics(app);
    const auth = getAuth(app);

    function setCookie(name, value, days) {
        let expires = "";
        if (days) {
            const date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = "; expires=" + date.toUTCString();
        }
        document.cookie = name + "=" + (value || "") + expires + "; path=/; SameSite=None; Secure";
    }

    setCookie("myCookie", "cookieValue", 7);

    const loginSection = document.getElementById("login-section");
    const signupSection = document.getElementById("signup-section");
    const forgotSection = document.getElementById("forgot-section");
    const modal = document.getElementById("forgot-password-modal");
    const modalOverlay = document.getElementById("modal-overlay");

    function showSection(section) {
      [loginSection, signupSection, forgotSection].forEach((sec) => {
        sec.classList.remove("active");
      });
      section.classList.add("active");
    }

    function showModal() {
      modal.style.display = "block";
      modalOverlay.style.display = "block";
      modal.querySelector("#reset-email").focus();
      modal.setAttribute("aria-hidden", "false");
      modalOverlay.setAttribute("aria-hidden", "false");
    }

    function hideModal() {
      modal.style.display = "none";
      modalOverlay.style.display = "none";
      modal.setAttribute("aria-hidden", "true");
      modalOverlay.setAttribute("aria-hidden", "true");
    }

    function clearErrors(form) {
      const errors = form.querySelectorAll(".error-message");
      errors.forEach((el) => (el.textContent = ""));
    }

    function isValidEmail(email) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    const loginForm = document.getElementById("login-form");
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      clearErrors(loginForm);

      const emailInput = loginForm["login-email"];
      const passwordInput = loginForm["login-password"];
      let valid = true;

      if (!emailInput.value.trim()) {
        document.getElementById("login-email-error").textContent = "Email is required.";
        valid = false;
      } else if (!isValidEmail(emailInput.value.trim())) {
        document.getElementById("login-email-error").textContent = "Please enter a valid email.";
        valid = false;
      }

      if (!passwordInput.value.trim()) {
        document.getElementById("login-password-error").textContent = "Password is required.";
        valid = false;
      }

      if (!valid) return;

      try {
        const userCredential = await signInWithEmailAndPassword(auth, emailInput.value.trim(), passwordInput.value);
        const user = userCredential.user;

        localStorage.setItem("userEmail", user.email);
        localStorage.setItem("userUID", user.uid);

        window.location.href = "/homescreen/chronio.html";

        loginForm.reset();
      } catch (error) {
        let message = "Login failed. Please check your credentials.";
        if (error.code === "auth/user-not-found") {
          message = "No user found with this email.";
        } else if (error.code === "auth/wrong-password") {
          message = "Incorrect password.";
        }
        alert(message);
      }
    });

    const signupForm = document.getElementById("signup-form");
    signupForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      clearErrors(signupForm);

      const fnameInput = signupForm["signup-fname"];
      const lnameInput = signupForm["signup-lname"];
      const emailInput = signupForm["signup-email"];
      const passwordInput = signupForm["signup-password"];
      let valid = true;

      if (!fnameInput.value.trim()) {
        document.getElementById("signup-fname-error").textContent = "First name is required.";
        valid = false;
      }
      if (!lnameInput.value.trim()) {
        document.getElementById("signup-lname-error").textContent = "Last name is required.";
        valid = false;
      }
      if (!emailInput.value.trim()) {
        document.getElementById("signup-email-error").textContent = "Email is required.";
        valid = false;
      } else if (!isValidEmail(emailInput.value.trim())) {
        document.getElementById("signup-email-error").textContent = "Please enter a valid email.";
        valid = false;
      }
      if (!passwordInput.value.trim()) {
        document.getElementById("signup-password-error").textContent = "Password is required.";
        valid = false;
      } else if (passwordInput.value.length < 6) {
        document.getElementById("signup-password-error").textContent = "Password must be at least 6 characters.";
        valid = false;
      }

      if (!valid) return;

      try {
        await createUserWithEmailAndPassword(auth, emailInput.value.trim(), passwordInput.value);
        alert("Account created successfully! You can now log in.");
        signupForm.reset();
        showSection(loginSection);
      } catch (error) {
        let message = "Sign up failed.";
        if (error.code === "auth/email-already-in-use") {
          message = "This email is already in use.";
        }
        alert(message);
      }
    });

    const forgotForm = document.getElementById("forgot-form");
    forgotForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      clearErrors(forgotForm);

      const emailInput = forgotForm["forgot-email"];
      if (!emailInput.value.trim()) {
        document.getElementById("forgot-email-error").textContent = "Email is required.";
        return;
      }
      if (!isValidEmail(emailInput.value.trim())) {
        document.getElementById("forgot-email-error").textContent = "Please enter a valid email.";
        return;
      }

      try {
        await sendPasswordResetEmail(auth, emailInput.value.trim());
        alert("Password reset email sent! Please check your inbox.");
        forgotForm.reset();
        showSection(loginSection);
      } catch (error) {
        alert("Failed to send reset email. Please try again.");
      }
    });

    const resetEmailInput = document.getElementById("reset-email");
    const resetEmailError = document.getElementById("reset-email-error");
    const resetPasswordButton = document.getElementById("reset-password-button");
    const closeModalButton = document.getElementById("close-modal");

    resetPasswordButton.addEventListener("click", async () => {
      resetEmailError.textContent = "";
      const email = resetEmailInput.value.trim();
      if (!email) {
        resetEmailError.textContent = "Email is required.";
        resetEmailInput.focus();
        return;
      }
      if (!isValidEmail(email)) {
        resetEmailError.textContent = "Please enter a valid email.";
        resetEmailInput.focus();
        return;
      }
      try {
        await sendPasswordResetEmail(auth, email);
        alert("Password reset email sent! Please check your inbox.");
        resetEmailInput.value = "";
        hideModal();
        showSection(loginSection);
      } catch {
        alert("Failed to send reset email. Please try again.");
      }
    });

    closeModalButton.addEventListener("click", () => {
      hideModal();
    });

    modalOverlay.addEventListener("click", () => {
      hideModal();
    });

    document.getElementById("show-signup").addEventListener("click", (e) => {
      e.preventDefault();
      showSection(signupSection);
    });

    document.getElementById("show-login").addEventListener("click", (e) => {
      e.preventDefault();
      showSection(loginSection);
    });

    document.getElementById("show-forgot").addEventListener("click", (e) => {
      e.preventDefault();
      showModal();
    });

    document.getElementById("back-to-login").addEventListener("click", (e) => {
      e.preventDefault();
      showSection(loginSection);
    });

    modalOverlay.addEventListener("keydown", trapFocus);
    modal.addEventListener("keydown", trapFocus);

    function trapFocus(e) {
      if (modal.style.display !== "block") return;
      const focusableElements = modal.querySelectorAll(
        'a[href], button:not([disabled]), input, textarea, select, [tabindex]:not([tabindex="-1"])'
      );
      const firstEl = focusableElements[0];
            const lastEl = focusableElements[focusableElements.length - 1];
      if (e.key === "Tab") {
        if (e.shiftKey) {
          if (document.activeElement === firstEl) {
            e.preventDefault();
            lastEl.focus();
          }
        } else {
          if (document.activeElement === lastEl) {
            e.preventDefault();
            firstEl.focus();
          }
        }
      }
      if (e.key === "Escape") {
        hideModal();
      } 
    }
