// ==========================================
// DOM Elements Selection
// ==========================================
const form = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const togglePassword = document.getElementById("togglePassword");
const groupNameInput = document.getElementById("groupName");
const groupIdInput = document.getElementById("groupId");

// Error Display Elements
const emailError = document.getElementById("email-error");
const passwordError = document.getElementById("password-error");
const groupNameError = document.getElementById("groupName-error");
const groupIdError = document.getElementById("groupId-error");
const formError = document.getElementById("form-error");

// Dialog Alert Elements
const alertDialog = document.getElementById("formAlert");
const alertMessage = document.getElementById("formAlertMessage");
const alertCloseBtn = document.getElementById("formAlertClose");

// ==========================================
// Toggle Password Visibility
// ==========================================
togglePassword.addEventListener("click", () => {
    const isPassword = passwordInput.type === "password";
    passwordInput.type = isPassword ? "text" : "password";

    togglePassword.setAttribute("aria-label", isPassword ? "Hide password" : "Show password");
    togglePassword.setAttribute("aria-pressed", String(isPassword));

    const icon = togglePassword.querySelector("i");
    icon.classList.toggle("bx-show", !isPassword);
    icon.classList.toggle("bx-hide", isPassword);
});

// ==========================================
// Real-time Input Handling & Error Clearing
// ==========================================
emailInput.addEventListener("input", () => {
    emailInput.value = emailInput.value.toLowerCase();
    if (emailInput.value.trim().length > 0) {
        emailError.textContent = "";
    }
});

passwordInput.addEventListener("input", () => {
    if (passwordInput.value.length > 0) {
        passwordError.textContent = "";
    }
});

groupNameInput.addEventListener("input", () => {
    if (groupNameInput.value.trim().length > 0) {
        groupNameError.textContent = "";
    }
});

groupIdInput.addEventListener("input", () => {
    if (groupIdInput.value.trim().length > 0) {
        groupIdError.textContent = "";
    }
});

// ==========================================
// Form Submission & Validation
// ==========================================
form.addEventListener("submit", (event) => {
    event.preventDefault();

    let isValid = true;

    // 1. Email Validation
    const emailVal = emailInput.value.trim();
    const emailPattern = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
    if (emailVal === "") {
        emailError.textContent = "Please enter your email address.";
        isValid = false;
    } else if (!emailPattern.test(emailVal)) {
        emailError.textContent = "Please enter a valid email address.";
        isValid = false;
    } else {
        emailError.textContent = "";
    }

    // 2. Password Validation
    const passwordVal = passwordInput.value;
    if (passwordVal === "") {
        passwordError.textContent = "Please enter your password.";
        isValid = false;
    } else {
        passwordError.textContent = "";
    }

    // 3. Group Name Validation
    const groupNameVal = groupNameInput.value.trim();
    if (groupNameVal === "") {
        groupNameError.textContent = "Please enter your group name.";
        isValid = false;
    } else {
        groupNameError.textContent = "";
    }

    // 4. Group ID Validation
    const groupIdVal = groupIdInput.value.trim();
    if (groupIdVal === "") {
        groupIdError.textContent = "Please enter your group ID.";
        isValid = false;
    } else {
        groupIdError.textContent = "";
    }

    // ------------------------------------------
    // If Error: STAY on the same page
    // ------------------------------------------
    if (!isValid) {
        formError.textContent = "Please correct the highlighted fields above.";
        formError.classList.remove("d-none");

        alertMessage.textContent = "Please check your login details and try again.";
        alertDialog.showModal();

        alertCloseBtn.onclick = () => {
            alertDialog.close();
        };
        return; // Prevents navigation; stays on login.html
    }

    // ------------------------------------------
    // If Successful: Fetch role through Email ID & Group details
    // ------------------------------------------
    let userRole = null;
    try {
        const stored = localStorage.getItem("teamflow_users");
        if (stored) {
            const users = JSON.parse(stored);
            const matchedUser = users.find((u) =>
                u.email.toLowerCase() === emailVal.toLowerCase()
            );

            if (matchedUser && matchedUser.role) {
                userRole = matchedUser.role; // "leader" or "member"
            }
        }
    } catch (e) {
        userRole = null;
    }

    // Fallback if not registered in current browser session
    if (!userRole) {
        const idLower = groupIdVal.toLowerCase();
        const nameLower = groupNameVal.toLowerCase();
        const emailLower = emailVal.toLowerCase();

        if (
            idLower.includes("lead") || idLower.includes("admin") ||
            nameLower.includes("lead") || nameLower.includes("admin") ||
            emailLower.includes("lead") || emailLower.includes("admin")
        ) {
            userRole = "leader";
        } else {
            userRole = "member";
        }
    }

    const targetUrl = userRole === "leader"
        ? "Leader/dashboard.html"
        : "Member/dashboard.html";

    formError.textContent = "";
    formError.classList.add("d-none");

    alertMessage.textContent = "Login successful! Proceeding to your workspace...";
    alertDialog.showModal();

    alertCloseBtn.onclick = () => {
        alertDialog.close();
        window.location.href = targetUrl;
    };

    setTimeout(() => {
        window.location.href = targetUrl;
    }, 1500);
});
