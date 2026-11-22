document.addEventListener("DOMContentLoaded", () => {
    initMemberToastContainer();
    initMemberSession();
});

// 1. GLOBAL TOAST NOTIFICATIONS

function initMemberToastContainer() {
    if (!document.getElementById("tfMemberToastContainer")) {
        const container = document.createElement("div");
        container.id = "tfMemberToastContainer";
        container.className = "tf-toast-container";
        container.setAttribute("aria-live", "polite");
        container.setAttribute("aria-atomic", "true");
        document.body.appendChild(container);
    }
}

function showMemberToast(title, message, type = "success", duration = 3800) {
    initMemberToastContainer();
    const container = document.getElementById("tfMemberToastContainer");

    const toast = document.createElement("div");
    toast.className = `tf-toast tf-toast-${type}`;

    let iconClass = "bx bx-check";
    if (type === "error") iconClass = "bx bx-error-circle";
    else if (type === "warning") iconClass = "bx bx-info-circle";
    else if (type === "info") iconClass = "bx bx-bell";

    toast.innerHTML = `
        <div class="tf-toast-icon">
            <i class="${iconClass}"></i>
        </div>
        <div class="tf-toast-content">
            <div class="tf-toast-title">${escapeHtml(title)}</div>
            <p class="tf-toast-msg">${escapeHtml(message)}</p>
        </div>
        <button type="button" class="tf-toast-close" aria-label="Close notification">
            <i class="bx bx-x"></i>
        </button>
    `;

    const closeBtn = toast.querySelector(".tf-toast-close");
    const removeToast = () => {
        toast.classList.add("tf-toast-hiding");
        setTimeout(() => toast.remove(), 250);
    };

    closeBtn.addEventListener("click", removeToast);
    container.appendChild(toast);

    if (duration > 0) {
        setTimeout(removeToast, duration);
    }
}

function escapeHtml(str) {
    if (!str) return "";
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// 2. REUSABLE FIELD VALIDATORS

function markFieldInvalid(field, message) {
    if (!field) return;
    field.classList.add("is-invalid");
    field.classList.remove("is-valid");

    let feedback = field.parentNode.querySelector(".invalid-feedback");
    if (!feedback) {
        feedback = document.createElement("div");
        feedback.className = "invalid-feedback d-block fw-semibold text-danger small mt-1";
        field.parentNode.appendChild(feedback);
    }
    feedback.textContent = message;
    feedback.style.display = "block";
}

function markFieldValid(field) {
    if (!field) return;
    field.classList.remove("is-invalid");
    field.classList.add("is-valid");

    const feedback = field.parentNode.querySelector(".invalid-feedback");
    if (feedback) {
        feedback.style.display = "none";
        feedback.textContent = "";
    }
}

function clearFieldStatus(field) {
    if (!field) return;
    field.classList.remove("is-invalid", "is-valid");
    const feedback = field.parentNode.querySelector(".invalid-feedback");
    if (feedback) {
        feedback.style.display = "none";
        feedback.textContent = "";
    }
}

function isValidEmail(email) {
    return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email.trim());
}

// 3. SESSION & NAVBAR PROFILE SYNCHRONIZATION
function initMemberSession() {
    let userName = "Mehul Patel";
    let userEmail = "mehul.patel@Aarav.team";
    let userRole = "Member";

    try {
        const storedProfile = localStorage.getItem("tf_member_profile");
        if (storedProfile) {
            const data = JSON.parse(storedProfile);
            if (data.name) userName = data.name;
            if (data.email) userEmail = data.email;
            if (data.role) userRole = data.role;
        } else {
            const sessionUser = localStorage.getItem("teamflow_current_user");
            if (sessionUser) {
                const s = JSON.parse(sessionUser);
                if (s.name) userName = s.name;
                if (s.email) userEmail = s.email;
            }
        }
    } catch (e) { }

    const initials = userName
        .split(" ")
        .map(n => n.charAt(0))
        .join("")
        .toUpperCase()
        .slice(0, 2) || "M";

    // Update navbar avatar buttons & dropdown items
    document.querySelectorAll(".tf-avatar").forEach(av => {
        av.textContent = initials;
    });

    const menuName = document.querySelector(".tf-menu-name");
    if (menuName) menuName.textContent = userName;

    const menuMail = document.querySelector(".tf-menu-mail");
    if (menuMail) menuMail.textContent = userEmail;

    // Update dashboard welcome greeting if on dashboard
    const greeting = document.getElementById("memberWelcomeHeading");
    if (greeting) {
        const firstName = userName.split(" ")[0];
        greeting.textContent = `Welcome, ${firstName}!`;
    }

    // Logout handling
    document.querySelectorAll(".dropdown-item.logout, .tf-menu-item.logout").forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            showMemberToast("Logging out", "Signing out of your workspace...", "info", 1200);
            setTimeout(() => {
                window.location.href = "../login.html";
            }, 800);
        });
    });
}

function addSubmissionToHistory(title, status, reviewer = "Aarav (Admin)") {
    try {
        const now = new Date();
        const dateStr = now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
        const timeStr = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

        const history = JSON.parse(localStorage.getItem("tf_member_history") || "[]");
        history.unshift({
            title,
            status,
            date: dateStr,
            time: timeStr,
            reviewer
        });
        localStorage.setItem("tf_member_history", JSON.stringify(history.slice(0, 15)));
    } catch (e) { }
}
