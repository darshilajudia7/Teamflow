
document.addEventListener("DOMContentLoaded", () => {
    initReviewValidations();
});

function initReviewValidations() {
    // 1. Request Changes Modals
    const changeModals = [
        { modalId: "changes-maya", fbId: "fb-maya", memberName: "Maya Nair" },
        { modalId: "changes-daniel", fbId: "fb-daniel", memberName: "Karan Mehta" },
        { modalId: "changes-sofia", fbId: "fb-sofia", memberName: "Saanvi Rao" }
    ];

    changeModals.forEach(({ modalId, fbId, memberName }) => {
        const modalEl = document.getElementById(modalId);
        if (!modalEl) return;

        const form = modalEl.querySelector("form");
        const textarea = document.getElementById(fbId);

        if (textarea) {
            textarea.addEventListener("input", () => {
                if (textarea.value.trim().length >= 10) setFieldValid(textarea);
                else clearFieldValidation(textarea);
            });
        }

        if (form) {
            form.addEventListener("submit", (e) => {
                e.preventDefault();
                const feedbackVal = textarea ? textarea.value.trim() : "";

                if (feedbackVal === "") {
                    setFieldInvalid(textarea, "Feedback notes are required when requesting changes.");
                    showAdminToast("Feedback Required", "Please describe what updates or fixes are needed.", "error");
                    return;
                }

                if (feedbackVal.length < 10) {
                    setFieldInvalid(textarea, "Please provide actionable feedback (at least 10 characters).");
                    showAdminToast("More Details Needed", "Feedback note must be at least 10 characters.", "error");
                    return;
                }

                if (window.bootstrap) {
                    const modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
                    modal.hide();
                }

                const card = modalEl.closest(".tf-rcard") || document.querySelector(`[data-member="${memberName}"]`) || modalEl.parentElement;
                if (card) {
                    const chip = card.querySelector(".tf-pill-status, .badge");
                    if (chip) {
                        chip.className = "badge bg-warning text-dark";
                        chip.textContent = "Changes Requested";
                    }
                }

                form.reset();
                if (textarea) clearFieldValidation(textarea);

                showAdminToast("Feedback Dispatched", `Revision request sent to ${memberName}.`, "warning");
            });
        }
    });

    // 2. Direct Approval Buttons
    document.querySelectorAll('[data-bs-target^="#approve-"], .btn-approve-review').forEach(btn => {
        btn.addEventListener("click", () => {
            const card = btn.closest(".tf-rcard, .card, article");
            const memberName = card?.querySelector(".tf-avatar-name, h5, .fw-bold")?.textContent.trim() || "Member";
            const deliverable = card?.querySelector(".tf-rcard-title, h4")?.textContent.trim() || "Deliverable";

            showAdminToast("Deliverable Approved!", `Signed off "${deliverable}" by ${memberName}. Ready for merge.`, "success");

            const statusBadge = card?.querySelector(".tf-pill-status, .badge");
            if (statusBadge) {
                statusBadge.className = "badge bg-success-subtle text-success border border-success-subtle";
                statusBadge.innerHTML = "<i class='bx bx-check-double me-1'></i> Approved";
            }
        });
    });

    // 3. Review Filter Chips
    const filterRadios = document.querySelectorAll('input[name="rev-filter"]');
    filterRadios.forEach(radio => {
        radio.addEventListener("change", () => {
            const val = radio.value.toLowerCase();
            const cards = document.querySelectorAll(".tf-rcard");
            cards.forEach(card => {
                if (val === "all") {
                    card.style.display = "";
                } else if (val === "pending") {
                    const isPending = card.textContent.toLowerCase().includes("pending") || card.textContent.toLowerCase().includes("ready");
                    card.style.display = isPending ? "" : "none";
                } else if (val === "changes") {
                    const isChanges = card.textContent.toLowerCase().includes("changes");
                    card.style.display = isChanges ? "" : "none";
                }
            });
        });
    });
}
