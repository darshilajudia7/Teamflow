// TeamFlow - Contact & Support Form Validation

document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector(".contact-form");
    if (!form) return;

    form.setAttribute("novalidate", "true");

    const nameInput = document.getElementById("contact-name");
    const emailInput = document.getElementById("contact-email");
    const topicSelect = document.getElementById("contact-topic");
    const messageInput = document.getElementById("contact-message");
    const resetBtn = form.querySelector(".contact-form-reset");

    // Add character counter below message textarea
    const charCounter = document.createElement("div");
    charCounter.className = "form-text text-end small text-muted mt-1";
    charCounter.id = "message-char-count";
    charCounter.textContent = "0 / 2000 characters";
    if (messageInput && messageInput.parentNode) {
        messageInput.parentNode.appendChild(charCounter);
    }

    // Helper: Mark field invalid
    function markInvalid(input, message) {
        if (!input) return;
        input.classList.add("is-invalid");
        input.classList.remove("is-valid");

        let feedback = input.parentNode.querySelector(".invalid-feedback");
        if (!feedback) {
            feedback = document.createElement("div");
            feedback.className = "invalid-feedback d-block fw-semibold small text-danger mt-1";
            input.parentNode.appendChild(feedback);
        }
        feedback.textContent = message;
        feedback.style.display = "block";
    }

    // Helper: Mark field valid
    function markValid(input) {
        if (!input) return;
        input.classList.remove("is-invalid");
        input.classList.add("is-valid");

        const feedback = input.parentNode.querySelector(".invalid-feedback");
        if (feedback) {
            feedback.style.display = "none";
            feedback.textContent = "";
        }
    }

    // Helper: Clear validation state
    function clearValidation(input) {
        if (!input) return;
        input.classList.remove("is-invalid", "is-valid");
        const feedback = input.parentNode.querySelector(".invalid-feedback");
        if (feedback) {
            feedback.style.display = "none";
            feedback.textContent = "";
        }
    }

    // Email validation regex
    function isValidEmail(email) {
        return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email.trim());
    }

    // Real-time input handling
    if (nameInput) {
        nameInput.addEventListener("input", () => {
            nameInput.value = nameInput.value.replace(/[^a-zA-Z\s'-]/g, "");
            const val = nameInput.value.trim();
            if (val.length >= 2) {
                markValid(nameInput);
            } else if (val.length > 0) {
                clearValidation(nameInput);
            }
        });
    }

    if (emailInput) {
        emailInput.addEventListener("input", () => {
            emailInput.value = emailInput.value.toLowerCase();
            const val = emailInput.value.trim();
            if (isValidEmail(val)) {
                markValid(emailInput);
            } else if (val.length > 0) {
                clearValidation(emailInput);
            }
        });
    }

    if (topicSelect) {
        topicSelect.addEventListener("change", () => {
            if (topicSelect.value && topicSelect.value !== "") {
                markValid(topicSelect);
            }
        });
    }

    if (messageInput) {
        messageInput.addEventListener("input", () => {
            const count = messageInput.value.length;
            charCounter.textContent = `${count} / 2000 characters`;
            if (count > 2000) {
                charCounter.classList.add("text-danger");
                charCounter.classList.remove("text-muted");
            } else {
                charCounter.classList.remove("text-danger");
                charCounter.classList.add("text-muted");
            }

            if (messageInput.value.trim().length >= 10) {
                markValid(messageInput);
            } else if (messageInput.value.trim().length > 0) {
                clearValidation(messageInput);
            }
        });
    }

    // Reset handler
    if (resetBtn) {
        resetBtn.addEventListener("click", () => {
            setTimeout(() => {
                [nameInput, emailInput, topicSelect, messageInput].forEach(clearValidation);
                charCounter.textContent = "0 / 2000 characters";
                charCounter.className = "form-text text-end small text-muted mt-1";
            }, 50);
        });
    }

    // Form Submission
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        let isValid = true;
        let firstInvalidField = null;

        // 1. Name validation
        const nameVal = nameInput ? nameInput.value.trim() : "";
        if (nameVal === "") {
            markInvalid(nameInput, "Please enter your full name.");
            isValid = false;
            if (!firstInvalidField) firstInvalidField = nameInput;
        } else if (nameVal.length < 2) {
            markInvalid(nameInput, "Name must be at least 2 characters.");
            isValid = false;
            if (!firstInvalidField) firstInvalidField = nameInput;
        } else if (!/^[a-zA-Z\s'-]+$/.test(nameVal)) {
            markInvalid(nameInput, "Name can only contain letters, spaces, and hyphens.");
            isValid = false;
            if (!firstInvalidField) firstInvalidField = nameInput;
        } else {
            markValid(nameInput);
        }

        // 2. Email validation
        const emailVal = emailInput ? emailInput.value.trim() : "";
        if (emailVal === "") {
            markInvalid(emailInput, "Please enter your email address.");
            isValid = false;
            if (!firstInvalidField) firstInvalidField = emailInput;
        } else if (!isValidEmail(emailVal)) {
            markInvalid(emailInput, "Please enter a valid email address (e.g. you@example.com).");
            isValid = false;
            if (!firstInvalidField) firstInvalidField = emailInput;
        } else {
            markValid(emailInput);
        }

        // 3. Topic validation
        const topicVal = topicSelect ? topicSelect.value : "";
        if (!topicVal || topicVal === "" || topicSelect.selectedIndex <= 0) {
            markInvalid(topicSelect, "Please select what we can help you with.");
            isValid = false;
            if (!firstInvalidField) firstInvalidField = topicSelect;
        } else {
            markValid(topicSelect);
        }

        // 4. Message validation
        const messageVal = messageInput ? messageInput.value.trim() : "";
        if (messageVal === "") {
            markInvalid(messageInput, "Please enter your message details.");
            isValid = false;
            if (!firstInvalidField) firstInvalidField = messageInput;
        } else if (messageVal.length < 10) {
            markInvalid(messageInput, "Message must be at least 10 characters.");
            isValid = false;
            if (!firstInvalidField) firstInvalidField = messageInput;
        } else if (messageVal.length > 2000) {
            markInvalid(messageInput, "Message cannot exceed 2000 characters.");
            isValid = false;
            if (!firstInvalidField) firstInvalidField = messageInput;
        } else {
            markValid(messageInput);
        }

        if (!isValid) {
            if (firstInvalidField) {
                firstInvalidField.focus();
            }
            return;
        }

        // Success state: show feedback banner
        let successAlert = document.getElementById("contactSuccessAlert");
        if (!successAlert) {
            successAlert = document.createElement("div");
            successAlert.id = "contactSuccessAlert";
            successAlert.className = "alert alert-success d-flex align-items-center gap-2 mt-3 p-3 rounded-3 shadow-sm";
            form.prepend(successAlert);
        }

        successAlert.innerHTML = `
            <i class='bx bx-check-circle fs-4 text-success'></i>
            <div>
                <strong>Thank you, ${escapeHtml(nameVal)}!</strong>
                <div class="small">Your inquiry regarding "${escapeHtml(topicVal)}" has been prepared. Opening your mail client...</div>
            </div>
        `;

        // Open mailto with populated subject and body
        const subject = encodeURIComponent(`[TeamFlow Support] ${topicVal} - from ${nameVal}`);
        const body = encodeURIComponent(`Name: ${nameVal}\nEmail: ${emailVal}\nTopic: ${topicVal}\n\nMessage:\n${messageVal}`);
        window.location.href = `mailto:hello@teamflow.com?subject=${subject}&body=${body}`;

        // Reset form after delay
        setTimeout(() => {
            form.reset();
            [nameInput, emailInput, topicSelect, messageInput].forEach(clearValidation);
            charCounter.textContent = "0 / 2000 characters";
        }, 1500);
    });

    function escapeHtml(str) {
        if (!str) return "";
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
});
