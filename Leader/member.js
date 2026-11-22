document.addEventListener('DOMContentLoaded', () => {
    initMemberValidations();
});
function initMemberValidations() {
    const addMemberForm = document.getElementById("addMemberForm");
    const bulkRoleForm = document.getElementById("bulkRoleForm");
    const membersForm = document.getElementById("membersForm");
    const searchInput = document.querySelector('.tf-search input[name="q"]');

    // 1. Live Member Search
    if (searchInput) {
        searchInput.closest("form").addEventListener("submit", (e) => e.preventDefault());
        searchInput.addEventListener("input", () => {
            const term = searchInput.value.toLowerCase().trim();
            const memberRows = document.querySelectorAll(".tf-table tbody tr.tf-mrow");

            memberRows.forEach((row) => {
                const name = (row.querySelector(".fw-semibold")?.textContent || "").toLowerCase();
                const email = (row.querySelector(".tf-sub")?.textContent || "").toLowerCase();
                if (name.includes(term) || email.includes(term)) {
                    row.style.display = "";
                } else {
                    row.style.display = "none";
                }
            });
        });
    }

    // 2. Skill Radio Filter Chips
    const skillRadioFilters = document.querySelectorAll('.tf-filters input[name="skill"], .tf-filters input[name="skill-filter"]');
    if (skillRadioFilters.length > 0) {
        skillRadioFilters.forEach((radio) => {
            radio.addEventListener("change", () => {
                const selectedSkill = radio.value.toLowerCase();
                const memberRows = document.querySelectorAll(".tf-table tbody tr.tf-mrow");

                memberRows.forEach((row) => {
                    const rowSkills = (row.getAttribute("data-skills") || "").toLowerCase();
                    if (selectedSkill === "all" || rowSkills.includes(selectedSkill)) {
                        row.style.display = "";
                    } else {
                        row.style.display = "none";
                    }
                });
            });
        });
    }

    // 3. Add Member Form Validation
    if (addMemberForm) {
        const nameInput = document.getElementById("nm-name");
        const mailInput = document.getElementById("nm-mail");
        const roleSelect = document.getElementById("nm-role");
        const termSelect = document.getElementById("nm-term");
        const skillCheckboxes = addMemberForm.querySelectorAll('input[name="skills"]');
        const skillsContainer = addMemberForm.querySelector(".tf-filters");
        const skillsFeedback = document.getElementById("nm-skills-error");

        // Realtime validation
        if (nameInput) {
            nameInput.addEventListener("input", () => {
                // Remove numbers & disallowed special chars
                nameInput.value = nameInput.value.replace(/[^a-zA-Z\s'-]/g, "");
                if (nameInput.value.trim().length >= 2) setFieldValid(nameInput);
                else clearFieldValidation(nameInput);
            });
        }

        if (mailInput) {
            mailInput.addEventListener("input", () => {
                if (isValidEmail(mailInput.value)) setFieldValid(mailInput);
                else clearFieldValidation(mailInput);
            });
        }

        skillCheckboxes.forEach((cb) => {
            cb.addEventListener("change", () => {
                const anyChecked = Array.from(skillCheckboxes).some(c => c.checked);
                if (anyChecked) {
                    if (skillsContainer) skillsContainer.classList.remove("tf-group-invalid");
                    if (skillsFeedback) {
                        skillsFeedback.textContent = "";
                        skillsFeedback.classList.remove("tf-group-invalid-feedback");
                    }
                }
            });
        });

        addMemberForm.addEventListener("submit", (e) => {
            e.preventDefault();
            let isValid = true;

            // Name validation
            const nameVal = nameInput ? nameInput.value.trim() : "";
            if (nameVal === "") {
                setFieldInvalid(nameInput, "Full name is required.");
                isValid = false;
            } else if (nameVal.length < 2) {
                setFieldInvalid(nameInput, "Name must be at least 2 characters.");
                isValid = false;
            } else if (!/^[a-zA-Z\s'-]+$/.test(nameVal)) {
                setFieldInvalid(nameInput, "Name can only contain letters and spaces.");
                isValid = false;
            } else {
                setFieldValid(nameInput);
            }

            // Email validation
            const mailVal = mailInput ? mailInput.value.trim() : "";
            if (mailVal === "") {
                setFieldInvalid(mailInput, "Email address is required.");
                isValid = false;
            } else if (!isValidEmail(mailVal)) {
                setFieldInvalid(mailInput, "Please enter a valid email address (e.g. user@domain.com).");
                isValid = false;
            } else {
                setFieldValid(mailInput);
            }

            // Skills validation
            const checkedSkills = Array.from(skillCheckboxes).filter(c => c.checked).map(c => c.value);
            if (checkedSkills.length === 0) {
                isValid = false;
                if (skillsContainer) skillsContainer.classList.add("tf-group-invalid");
                if (skillsFeedback) {
                    skillsFeedback.textContent = "Please select at least one core skill.";
                    skillsFeedback.classList.add("tf-group-invalid-feedback");
                }
            } else {
                if (skillsContainer) skillsContainer.classList.remove("tf-group-invalid");
                if (skillsFeedback) {
                    skillsFeedback.textContent = "";
                    skillsFeedback.classList.remove("tf-group-invalid-feedback");
                }
            }

            if (!isValid) {
                showAdminToast("Validation Error", "Please fill in all member details correctly.", "error");
                return;
            }

            // Add new member row to table
            const tableBody = document.querySelector(".tf-table tbody");
            if (tableBody) {
                const initials = nameVal.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
                const skillTags = checkedSkills.map(s => `<span class="tf-skill">${escapeHtml(s)}</span>`).join(" ");
                const row = document.createElement("tr");
                row.className = "tf-mrow";
                row.setAttribute("data-skills", checkedSkills.join(" ").toLowerCase());
                row.innerHTML = `
                    <td>
                        <div class="d-flex align-items-center gap-3">
                            <span class="tf-avwrap">
                                <span class="tf-mavatar" style="--c:#059669;--s:#ecfdf5">${escapeHtml(initials)}</span>
                            </span>
                            <div>
                                <div class="fw-semibold">${escapeHtml(nameVal)}</div>
                                <div class="tf-sub">${escapeHtml(mailVal)}</div>
                            </div>
                        </div>
                    </td>
                    <td>
                        <div class="d-flex flex-wrap gap-2">${skillTags}</div>
                    </td>
                    <td>
                        <select class="form-select tf-pillsel role-sel" aria-label="Role for ${escapeHtml(nameVal)}">
                            <option value="member" selected>Member</option>
                            <option value="senior-member">Senior Member</option>
                            <option value="guest">Guest / Viewer</option>
                        </select>
                        <div class="term-wrap">
                            <span class="term-tag"><i class="bx bx-timer"></i>Duration</span>
                            <select class="form-select tf-termsel">
                                <option value="permanent" selected>Permanent</option>
                                <option value="1w">1 week</option>
                                <option value="1m">1 month</option>
                            </select>
                        </div>
                    </td>
                    <td>
                        <select class="form-select tf-pillsel status-sel">
                            <option value="Active" selected>Active</option>
                            <option value="Idle">Idle</option>
                            <option value="On leave">On leave</option>
                        </select>
                    </td>
                `;
                tableBody.prepend(row);
            }

            const modalEl = document.getElementById("addMember");
            if (modalEl && window.bootstrap) {
                const modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
                modal.hide();
            }

            addMemberForm.reset();
            [nameInput, mailInput].forEach(clearFieldValidation);

            showAdminToast("Member Added", `${nameVal} has been added to the team!`, "success");
        });
    }

    // 4. Bulk Role Update
    if (bulkRoleForm) {
        bulkRoleForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const roleSelect = document.getElementById("bk-role");
            const termSelect = document.getElementById("bk-term");
            const targetSelect = document.getElementById("bk-for");

            if (!roleSelect || !termSelect || !targetSelect) return;

            const modalEl = document.getElementById("bulkRole");
            if (modalEl && window.bootstrap) {
                const modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
                modal.hide();
            }

            showAdminToast("Bulk Update Applied", `Updated role permissions for "${targetSelect.value}".`, "success");
        });
    }

    // 5. Save Changes for Members Form
    if (membersForm) {
        membersForm.addEventListener("submit", (e) => {
            e.preventDefault();
            showAdminToast("Changes Saved", "Member roles, access hierarchy, and tenure durations updated.", "success");
        });
    }
}
