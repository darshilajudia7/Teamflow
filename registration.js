// ==========================================
// DOM Elements Selection
// ==========================================
const form = document.getElementById("registrationForm");
const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const togglePassword = document.getElementById("togglePassword");
const leaderRadio = document.getElementById("leader");
const memberRadio = document.getElementById("member");
const groupFields = document.getElementById("groupFields");
const groupHeading = document.getElementById("groupHeading");
const groupNameLabel = document.getElementById("groupNameLabel");
const groupNameInput = document.getElementById("groupName");
const groupIdLabel = document.getElementById("groupIdLabel");
const groupIdInput = document.getElementById("groupId");

// Error Display Elements
const nameError = document.getElementById("name-error");
const emailError = document.getElementById("email-error");
const passwordError = document.getElementById("password-error");
const genderError = document.getElementById("gender-error");
const roleError = document.getElementById("role-error");
const groupNameError = document.getElementById("groupName-error");
const groupIdError = document.getElementById("groupId-error");
const formError = document.getElementById("form-error");

// Dialog Alert Elements
const alertDialog = document.getElementById("formAlert");
const alertMessage = document.getElementById("formAlertMessage");
const alertCloseBtn = document.getElementById("formAlertClose");

// ==========================================
// Alert Dialog Close
// ==========================================
alertCloseBtn.addEventListener("click", () => {
    alertDialog.close();
});

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
// Dynamic Role Selection (Leader vs Member)
// ==========================================
leaderRadio.addEventListener("change", () => {
    groupFields.classList.remove("d-none");
    groupHeading.textContent = "Create your group";
    groupNameLabel.textContent = "Create group name";
    groupNameInput.placeholder = "Choose a group name";
    groupIdLabel.textContent = "Create group ID";
    groupIdInput.placeholder = "Create a group ID";
    roleError.textContent = "";
});

memberRadio.addEventListener("change", () => {
    groupFields.classList.remove("d-none");
    groupHeading.textContent = "Join a group";
    groupNameLabel.textContent = "Enter group name";
    groupNameInput.placeholder = "Enter your group name";
    groupIdLabel.textContent = "Enter group ID";
    groupIdInput.placeholder = "Enter your group ID";
    roleError.textContent = "";
});

// ==========================================
// Real-time Input Handling & Error Clearing
// ==========================================
nameInput.addEventListener("input", () => {
    nameInput.value = nameInput.value.replace(/[^a-zA-Z\s]/g, "");
    if (nameInput.value.trim().length > 0) {
        nameError.textContent = "";
    }
});

emailInput.addEventListener("input", () => {
    emailInput.value = emailInput.value.toLowerCase();
    if (emailInput.value.trim().length > 0) {
        emailError.textContent = "";
    }
});

passwordInput.addEventListener("input", () => {
    if (passwordInput.value.length >= 8) {
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

document.querySelectorAll('input[name="gender"]').forEach((radio) => {
    radio.addEventListener("change", () => {
        genderError.textContent = "";
    });
});

// ==========================================
// Form Submission & Validation
// ==========================================
form.addEventListener("submit", (event) => {
    event.preventDefault();

    let isValid = true;

    // 1. Full Name Validation
    const nameVal = nameInput.value.trim();
    if (nameVal === "") {
        nameError.textContent = "Please enter your full name.";
        isValid = false;
    } else if (!/^[a-zA-Z\s]+$/.test(nameVal)) {
        nameError.textContent = "Name must contain letters and spaces only.";
        isValid = false;
    } else {
        nameError.textContent = "";
    }

    // 2. Email Validation
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

    // 3. Password Validation (min 8 chars, uppercase, lowercase, digit, special character)
    const passwordVal = passwordInput.value;
    const hasUpper = /[A-Z]/.test(passwordVal);
    const hasLower = /[a-z]/.test(passwordVal);
    const hasNumber = /[0-9]/.test(passwordVal);
    const hasSpecial = /[^A-Za-z0-9\s]/.test(passwordVal);

    if (passwordVal === "") {
        passwordError.textContent = "Please enter a password.";
        isValid = false;
    } else if (passwordVal.length < 8) {
        passwordError.textContent = "Password must be at least 8 characters.";
        isValid = false;
    } else if (!hasUpper || !hasLower || !hasNumber || !hasSpecial) {
        passwordError.textContent = "Include uppercase, lowercase, number, and special character.";
        isValid = false;
    } else {
        passwordError.textContent = "";
    }

    // 4. Gender Validation
    const selectedGender = document.querySelector('input[name="gender"]:checked');
    if (!selectedGender) {
        genderError.textContent = "Please select a gender.";
        isValid = false;
    } else {
        genderError.textContent = "";
    }

    // 5. Role & Group Validation
    if (!leaderRadio.checked && !memberRadio.checked) {
        roleError.textContent = "Please select a role.";
        isValid = false;
    } else {
        roleError.textContent = "";

        if (groupNameInput.value.trim() === "") {
            groupNameError.textContent = "Please enter a group name.";
            isValid = false;
        } else {
            groupNameError.textContent = "";
        }

        if (groupIdInput.value.trim() === "") {
            groupIdError.textContent = "Please enter a group ID.";
            isValid = false;
        } else {
            groupIdError.textContent = "";
        }
    }

    // ------------------------------------------
    // If Error: STAY on the same page
    // ------------------------------------------
    if (!isValid) {
        formError.textContent = "Please correct the highlighted fields above.";
        formError.classList.remove("d-none");

        alertMessage.textContent = "Please check the highlighted fields and try again.";
        alertDialog.showModal();

        alertCloseBtn.onclick = () => {
            alertDialog.close();
        };
        return; // Prevents navigation; stays on registration.html
    }

    // ------------------------------------------
    // If Successful: GO to login page
    // ------------------------------------------
    // Store registered user details so login can fetch role by email
    const newUser = {
        name: nameVal,
        email: emailVal.toLowerCase(),
        password: passwordVal,
        gender: selectedGender ? selectedGender.value : "",
        role: leaderRadio.checked ? "leader" : "member",
        groupName: groupNameInput.value.trim(),
        groupId: groupIdInput.value.trim()
    };

    try {
        const storedUsers = JSON.parse(localStorage.getItem("teamflow_users") || "[]");
        const existingIdx = storedUsers.findIndex((u) => u.email === newUser.email);
        if (existingIdx >= 0) {
            storedUsers[existingIdx] = newUser;
        } else {
            storedUsers.push(newUser);
        }
        localStorage.setItem("teamflow_users", JSON.stringify(storedUsers));
    } catch (e) {
        // Fallback if localStorage is restricted
    }

    formError.textContent = "";
    formError.classList.add("d-none");

    alertMessage.textContent = "Registration successful! Proceeding to Login...";
    alertDialog.showModal();

    alertCloseBtn.onclick = () => {
        alertDialog.close();
        window.location.href = "login.html";
    };

    setTimeout(() => {
        window.location.href = "login.html";
    }, 1500);
});
