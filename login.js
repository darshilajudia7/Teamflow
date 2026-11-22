// DOM Elements Selection
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

// Toggle Password Visibility
togglePassword.addEventListener("click", () => {
    const isPassword = passwordInput.type === "password";
    passwordInput.type = isPassword ? "text" : "password";

    togglePassword.setAttribute("aria-label", isPassword ? "Hide password" : "Show password");
    togglePassword.setAttribute("aria-pressed", String(isPassword));

    const icon = togglePassword.querySelector("i");
    icon.classList.toggle("bx-show", !isPassword);
    icon.classList.toggle("bx-hide", isPassword);
});

// Real-time Input Handling & Error Clearing
emailInput.addEventListener("input", () => {
    emailInput.value = emailInput.value.toLowerCase();
    if (emailInput.value.trim().length > 0) {
        emailError.textContent = "";
    }
    formError.textContent = "";
    formError.classList.add("d-none");
});

passwordInput.addEventListener("input", () => {
    if (passwordInput.value.length > 0) {
        passwordError.textContent = "";
    }
    formError.textContent = "";
    formError.classList.add("d-none");
});

groupNameInput.addEventListener("input", () => {
    if (groupNameInput.value.trim().length > 0) {
        groupNameError.textContent = "";
    }
    formError.textContent = "";
    formError.classList.add("d-none");
});

groupIdInput.addEventListener("input", () => {
    if (groupIdInput.value.trim().length > 0) {
        groupIdError.textContent = "";
    }
    formError.textContent = "";
    formError.classList.add("d-none");
});

// Form Submission & Validation
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

    if (!isValid) {
        formError.textContent = "Please correct the highlighted fields above.";
        formError.classList.remove("d-none");

        alertMessage.textContent = "Please check your login details and try again.";
        alertDialog.showModal();

        alertCloseBtn.onclick = () => {
            alertDialog.close();
        };
        return;
    }

    let userRole = null;
    try {
        const stored = localStorage.getItem("teamflow_users");
        if (stored) {
            const users = JSON.parse(stored);
            const matchedUser = users.find((u) =>
                u.email && u.email.toLowerCase() === emailVal.toLowerCase() &&
                u.password === passwordVal &&
                (!u.groupName || u.groupName.trim().toLowerCase() === groupNameVal.toLowerCase()) &&
                (!u.groupId || u.groupId.trim().toLowerCase() === groupIdVal.toLowerCase())
            );

            if (matchedUser && matchedUser.role) {
                userRole = matchedUser.role;
            }
        }
    } catch (e) {
        userRole = null;
    }

    // Fallback demo credentials if not registered in localStorage
    if (!userRole) {
        const id = groupIdVal.trim();
        const name = groupNameVal.trim();
        const email = emailVal.trim();
        const password = passwordVal;

        if (
            email.toLowerCase() === "admin@gmail.com" &&
            password === "Admin@123" &&
            name.toLowerCase() === "innovators tech team" &&
            id.toUpperCase() === "INNO2026"
        ) {
            userRole = "leader";
        } else if (
            email.toLowerCase() === "user@gmail.com" &&
            password === "User@123" &&
            name.toLowerCase() === "innovators tech team" &&
            id.toUpperCase() === "INNO2026"
        ) {
            userRole = "member";
        }
    }

    // If credentials do not match, show error pop-up and stop
    if (!userRole) {
        formError.textContent = "Invalid credentials. Please check your details and try again.";
        formError.classList.remove("d-none");

        alertMessage.textContent = "Invalid email, password, group name, or group ID. Please check your credentials and try again.";
        alertDialog.showModal();

        alertCloseBtn.onclick = () => {
            alertDialog.close();
        };
        return;
    }

    const targetUrl = userRole === "leader"
        ? "Leader/dashboard.html"
        : "Member/dashboard.html";

    // Persist current session for seamless user greeting across Leader & Member workspace
    try {
        const currentUserData = {
            name: (userRole === "leader") ? "Aarav Sharma" : "Mehul Patel",
            email: emailVal,
            role: userRole,
            groupName: groupNameVal,
            groupId: groupIdVal
        };

        const stored = localStorage.getItem("teamflow_users");
        if (stored) {
            const users = JSON.parse(stored);
            const matched = users.find((u) => u.email && u.email.toLowerCase() === emailVal.toLowerCase());
            if (matched && matched.name) {
                currentUserData.name = matched.name;
            }
        }
        localStorage.setItem("teamflow_current_user", JSON.stringify(currentUserData));
    } catch (e) {}

    formError.textContent = "";
    formError.classList.add("d-none");

    alertMessage.textContent = "Login successful! Proceeding to your workspace...";
    alertDialog.showModal();

    const redirectTimer = setTimeout(() => {
        window.location.href = targetUrl;
    }, 1500);

    alertCloseBtn.onclick = () => {
        clearTimeout(redirectTimer);
        alertDialog.close();
        window.location.href = targetUrl;
    };
});
