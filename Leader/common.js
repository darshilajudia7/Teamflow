
document.addEventListener("DOMContentLoaded", () => {
    initToastContainer();
    initLeaderSession();
});

// 1. GLOBAL TOAST NOTIFICATION SYSTEM

function initToastContainer() {
    if (!document.getElementById("tfToastContainer")) {
        const container = document.createElement("div");
        container.id = "tfToastContainer";
        container.className = "tf-toast-container";
        container.setAttribute("aria-live", "polite");
        container.setAttribute("aria-atomic", "true");
        document.body.appendChild(container);
    }
}

function showAdminToast(title, message, type = "success", duration = 3800) {
    initToastContainer();
    const container = document.getElementById("tfToastContainer");

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

// 2. REUSABLE VALIDATION HELPERS

function setFieldInvalid(field, message) {
    if (!field) return;
    field.classList.add("is-invalid");
    field.classList.remove("is-valid");

    let feedback = field.parentNode.querySelector(".invalid-feedback");
    if (!feedback) {
        feedback = document.createElement("div");
        feedback.className = "invalid-feedback";
        field.parentNode.appendChild(feedback);
    }
    feedback.textContent = message;
    feedback.classList.add("tf-feedback-show");
}

function setFieldValid(field) {
    if (!field) return;
    field.classList.remove("is-invalid");
    field.classList.add("is-valid");

    const feedback = field.parentNode.querySelector(".invalid-feedback");
    if (feedback) {
        feedback.classList.remove("tf-feedback-show");
        feedback.textContent = "";
    }
}

function clearFieldValidation(field) {
    if (!field) return;
    field.classList.remove("is-invalid", "is-valid");
    const feedback = field.parentNode.querySelector(".invalid-feedback");
    if (feedback) {
        feedback.classList.remove("tf-feedback-show");
        feedback.textContent = "";
    }
}

function isValidEmail(email) {
    return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email.trim());
}

function isValidUrl(str) {
    try {
        new URL(str);
        return true;
    } catch (_) {
        return false;
    }
}

function isTodayOrFutureDate(dateStr) {
    if (!dateStr) return false;
    const selected = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return selected >= today;
}

// 3. LEADER SESSION & NAVBAR USER SYNCHRONIZATION
function initLeaderSession() {
    let userName = "Aarav Sharma";
    let userEmail = "admin@gmail.com";

    try {
        const sessionUser = localStorage.getItem("teamflow_current_user");
        if (sessionUser) {
            const s = JSON.parse(sessionUser);
            if (s.name) userName = s.name;
            if (s.email) userEmail = s.email;
        }
    } catch (e) { }

    const initials = userName
        .split(" ")
        .map(n => n.charAt(0))
        .join("")
        .toUpperCase()
        .slice(0, 2) || "A";

    document.querySelectorAll(".tf-avatar").forEach(av => {
        av.textContent = initials;
    });

    const menuName = document.querySelector(".tf-menu-name");
    if (menuName) menuName.textContent = userName;

    const menuMail = document.querySelector(".tf-menu-mail");
    if (menuMail) menuMail.textContent = userEmail;

    // Logout handling
    document.querySelectorAll(".dropdown-item.logout, .tf-menu-item.logout").forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            showAdminToast("Logging out", "Signing out of Leader workspace...", "info", 1200);
            setTimeout(() => {
                window.location.href = "../login.html";
            }, 800);
        });
    });
}
