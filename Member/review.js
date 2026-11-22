
document.addEventListener("DOMContentLoaded", () => {
    initMemberReviewPage();
});

function initMemberReviewPage() {
    const reviewCards = document.querySelectorAll("article.tf-Review-card");
    if (reviewCards.length === 0) return;

    loadPersistedReviewStates();
    updateReviewPillBadge();

    // 1. File dropzones on review cards
    document.querySelectorAll(".tf-upload-area").forEach(area => {
        const fileInput = area.querySelector('input[type="file"]');
        if (!fileInput) return;

        ["dragenter", "dragover"].forEach(ev => {
            area.addEventListener(ev, (e) => {
                e.preventDefault();
                area.classList.add("drag-over");
            });
        });

        ["dragleave", "drop"].forEach(ev => {
            area.addEventListener(ev, (e) => {
                e.preventDefault();
                area.classList.remove("drag-over");
            });
        });

        area.addEventListener("drop", (e) => {
            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                fileInput.files = e.dataTransfer.files;
                renderReviewFileBadge(fileInput.files[0], area);
            }
        });

        fileInput.addEventListener("change", () => {
            if (fileInput.files && fileInput.files.length > 0) {
                renderReviewFileBadge(fileInput.files[0], area);
            }
        });
    });

    function renderReviewFileBadge(file, area) {
        const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
        let badge = area.querySelector(".tf-file-selected-badge");
        if (!badge) {
            badge = document.createElement("div");
            badge.className = "tf-file-selected-badge";
            area.appendChild(badge);
        }
        badge.innerHTML = `
            <i class='bx bx-check-circle text-success'></i>
            <span>Package Ready: <strong>${escapeHtml(file.name)}</strong> (${sizeMb} MB)</span>
            <button type="button" class="tf-file-remove-btn" aria-label="Remove file">&times;</button>
        `;
        badge.querySelector(".tf-file-remove-btn")?.addEventListener("click", (e) => {
            e.stopPropagation();
            const input = area.querySelector('input[type="file"]');
            if (input) input.value = "";
            badge.remove();
        });
    }

    // 2. Submit v2 Modal Forms
    const submitModalConfigs = [
        { modalId: "submitModal1", cardId: "Review-checkout", taskName: "Checkout Flow", reviewer: "Priya Nair" },
        { modalId: "submitModal2", cardId: "Review-api", taskName: "API Endpoints", reviewer: "Nikhil Sharma" }
    ];

    submitModalConfigs.forEach(({ modalId, cardId, taskName, reviewer }) => {
        const modal = document.getElementById(modalId);
        if (!modal) return;
        const form = modal.querySelector("form");
        const textarea = form ? form.querySelector("textarea") : null;

        if (textarea) {
            let charCounter = textarea.parentNode.querySelector(".form-text");
            if (!charCounter) {
                charCounter = document.createElement("div");
                charCounter.className = "form-text text-end small text-muted mt-1";
                charCounter.textContent = "0 / 300 characters (min 10)";
                textarea.parentNode.appendChild(charCounter);
            }

            textarea.addEventListener("input", () => {
                const len = textarea.value.length;
                charCounter.textContent = `${len} / 300 characters (min 10)`;
                if (textarea.value.trim().length >= 10) markFieldValid(textarea);
                else clearFieldStatus(textarea);
            });
        }

        if (form) {
            form.setAttribute("novalidate", "true");
            form.addEventListener("submit", (e) => {
                e.preventDefault();
                const changelog = textarea ? textarea.value.trim() : "";

                if (changelog === "") {
                    markFieldInvalid(textarea, "Please describe how you resolved the requested changes.");
                    showMemberToast("Changelog Required", "Please provide a changelog before finalizing submission.", "error");
                    return;
                }

                if (changelog.length < 10) {
                    markFieldInvalid(textarea, "Please provide more details (at least 10 characters).");
                    showMemberToast("More Details Needed", "Changelog must be at least 10 characters.", "error");
                    return;
                }

                const card = document.getElementById(cardId);
                if (card) {
                    const chip = card.querySelector(".tf-status-chip");
                    if (chip) {
                        chip.className = "badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-2";
                        chip.innerHTML = "<i class='bx bx-loader-circle bx-spin me-1'></i> v2 Submitted · Under Review";
                    }

                    persistReviewState(cardId, "v2-submitted");
                    addSubmissionToHistory(`${taskName} (v2)`, "Submitted for Review", reviewer);
                }

                form.reset();
                if (textarea) clearFieldStatus(textarea);
                window.location.hash = "#close";
                updateReviewPillBadge();

                showMemberToast("v2 Resubmitted!", `Revision for "${taskName}" has been submitted for Leader verification.`, "success");
            });
        }
    });

    // 3. Details Modal: "Proceed to Resubmit" smoothly triggers the corresponding submit modal
    document.querySelectorAll('#viewDetailsModal1 a[href="#close"]').forEach(btn => {
        if (btn.textContent.includes("Proceed to Resubmit")) {
            btn.setAttribute("href", "#submitModal1");
        }
    });
    document.querySelectorAll('#viewDetailsModal2 a[href="#close"]').forEach(btn => {
        if (btn.textContent.includes("Proceed to Resubmit")) {
            btn.setAttribute("href", "#submitModal2");
        }
    });

    function updateReviewPillBadge() {
        const pill = document.querySelector(".tf-section-pill");
        if (!pill) return;

        let needsChanges = 0;
        document.querySelectorAll("article.tf-Review-card").forEach(c => {
            const chip = c.querySelector(".tf-status-chip")?.textContent || "";
            if (chip.includes("Changes requested")) needsChanges++;
        });

        if (needsChanges === 0) {
            pill.className = "tf-section-pill bg-success-subtle text-success border border-success-subtle";
            pill.innerHTML = "<i class='bx bx-check-circle me-1'></i>All revisions submitted · Under review";
        } else {
            pill.className = "tf-section-pill";
            pill.innerHTML = `<i class='bx bx-error-circle me-1'></i>${needsChanges} task${needsChanges > 1 ? 's' : ''} need changes`;
        }
    }

    function persistReviewState(cardId, status) {
        try {
            const reviews = JSON.parse(localStorage.getItem("tf_member_reviews") || "{}");
            reviews[cardId] = status;
            localStorage.setItem("tf_member_reviews", JSON.stringify(reviews));
        } catch (e) { }
    }

    function loadPersistedReviewStates() {
        try {
            const reviews = JSON.parse(localStorage.getItem("tf_member_reviews") || "{}");
            Object.keys(reviews).forEach(cardId => {
                const card = document.getElementById(cardId);
                if (card && reviews[cardId] === "v2-submitted") {
                    const chip = card.querySelector(".tf-status-chip");
                    if (chip) {
                        chip.className = "badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-2";
                        chip.innerHTML = "<i class='bx bx-loader-circle bx-spin me-1'></i> v2 Submitted · Under Review";
                    }
                }
            });
        } catch (e) { }
    }
}
