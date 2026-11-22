
document.addEventListener("DOMContentLoaded", () => {
    initProjectValidations();
});

function initProjectValidations() {
    const createProjectForm = document.getElementById("createProjectForm");
    const editProjectForm = document.getElementById("editProjectForm");
    const deleteProjectForm = document.getElementById("deleteProjectForm");
    const projectSearchInput = document.getElementById("projectSearchInput") || document.querySelector('.tf-search input');

    // 1. Live Project Search
    if (projectSearchInput) {
        projectSearchInput.addEventListener("input", () => {
            const term = projectSearchInput.value.toLowerCase().trim();
            const projectCards = document.querySelectorAll(".tf-project-card, .tf-card.tf-pcard");
            projectCards.forEach(card => {
                const name = (card.querySelector(".tf-card-title, h3, h4")?.textContent || "").toLowerCase();
                const desc = (card.querySelector(".tf-sub, p")?.textContent || "").toLowerCase();
                if (name.includes(term) || desc.includes(term)) {
                    card.closest(".col-12, .col-md-6, .col-lg-4")?.style.setProperty("display", "", "important");
                } else {
                    card.closest(".col-12, .col-md-6, .col-lg-4")?.style.setProperty("display", "none", "important");
                }
            });
        });
    }

    // 2. Create Project Validation
    if (createProjectForm) {
        createProjectForm.setAttribute("novalidate", "true");
        const nameInput = document.getElementById("new-p-name") || createProjectForm.querySelector('input[name="project_name"]');
        const deptSelect = document.getElementById("new-p-dept") || createProjectForm.querySelector('select[name="department"]');
        const startInput = document.getElementById("new-p-start") || createProjectForm.querySelector('input[name="start_date"]');
        const endInput = document.getElementById("new-p-end") || createProjectForm.querySelector('input[name="end_date"]');
        const budgetInput = document.getElementById("new-p-budget") || createProjectForm.querySelector('input[name="budget"]');

        const todayStr = new Date().toISOString().split("T")[0];
        if (startInput) startInput.setAttribute("min", todayStr);

        createProjectForm.addEventListener("submit", (e) => {
            e.preventDefault();
            let isValid = true;

            // Name
            if (nameInput) {
                const val = nameInput.value.trim();
                if (val.length < 3) {
                    setFieldInvalid(nameInput, "Project name must be at least 3 characters.");
                    isValid = false;
                } else {
                    setFieldValid(nameInput);
                }
            }

            // Department
            if (deptSelect) {
                if (!deptSelect.value || deptSelect.value === "") {
                    setFieldInvalid(deptSelect, "Please select an owning department.");
                    isValid = false;
                } else {
                    setFieldValid(deptSelect);
                }
            }

            // Dates
            if (startInput && endInput) {
                if (!startInput.value) {
                    setFieldInvalid(startInput, "Please select a start date.");
                    isValid = false;
                } else {
                    setFieldValid(startInput);
                }

                if (!endInput.value) {
                    setFieldInvalid(endInput, "Please select an estimated completion date.");
                    isValid = false;
                } else if (startInput.value && new Date(endInput.value) <= new Date(startInput.value)) {
                    setFieldInvalid(endInput, "Target end date must be after the start date.");
                    isValid = false;
                } else {
                    setFieldValid(endInput);
                }
            }

            if (!isValid) {
                showAdminToast("Validation Error", "Please review and complete all required project fields.", "error");
                return;
            }

            const pNameVal = nameInput ? nameInput.value.trim() : "New Project";
            const modalEl = document.getElementById("createProjectModal") || document.getElementById("newProjectModal");
            if (modalEl && window.bootstrap) {
                const modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
                modal.hide();
            }

            createProjectForm.reset();
            [nameInput, deptSelect, startInput, endInput, budgetInput].forEach(f => f && clearFieldValidation(f));

            showAdminToast("Project Created", `"${pNameVal}" has been launched into the workspace portfolio!`, "success");
        });
    }

    // 3. Edit Project Validation
    if (editProjectForm) {
        editProjectForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const modalEl = document.getElementById("editProjectModal") || editProjectForm.closest(".modal");
            if (modalEl && window.bootstrap) {
                const modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
                modal.hide();
            }
            showAdminToast("Project Updated", "Project scope, target deadlines, and allocations saved.", "success");
        });
    }

    // 4. Delete Project Audit Validation
    if (deleteProjectForm) {
        deleteProjectForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const modalEl = document.getElementById("deleteProjectModal") || deleteProjectForm.closest(".modal");
            if (modalEl && window.bootstrap) {
                const modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
                modal.hide();
            }
            showAdminToast("Project Archived", "Project has been removed from active view.", "warning");
        });
    }
}
