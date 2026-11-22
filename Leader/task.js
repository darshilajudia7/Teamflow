document.addEventListener('DOMContentLoaded', () => {
    initTaskValidations();
});
function initTaskValidations() {
    const createTaskForm = document.getElementById("createTaskForm");
    const taskTagBox = document.getElementById("taskTagBox");
    const techTagsFeedback = document.getElementById("tech-tags-feedback");
    const customTagInput = document.getElementById("customTagInput");
    const addCustomTagBtn = document.getElementById("addCustomTagBtn");
    const addTagMenu = document.getElementById("addTagMenu");
    const pickerBox = document.querySelector(".tf-picker");
    const memberGroupError = document.getElementById("new-member-error");

    // Enforce min date as today for date inputs
    const todayStr = new Date().toISOString().split("T")[0];
    const taskDeadline = document.getElementById("task-deadline");
    if (taskDeadline) {
        taskDeadline.setAttribute("min", todayStr);
    }
    const t1Due = document.getElementById("t1-edit-due");
    if (t1Due) {
        t1Due.setAttribute("min", todayStr);
    }

    // Required Tech Tags & Dynamic Skill Matching Engine

    // Helper: Returns array of lowercase required tech tags, e.g. ["react", "node"]
    function getRequiredSkills() {
        if (!taskTagBox) return [];
        const tags = taskTagBox.querySelectorAll(".tf-tag-item");
        return Array.from(tags).map(t => (t.getAttribute("data-tag") || t.textContent.trim()).toLowerCase().trim()).filter(Boolean);
    }

    // Live skill matching update across all member cards
    function updateMemberSkillMatching() {
        const requiredSkills = getRequiredSkills();
        const members = document.querySelectorAll(".tf-members .tf-member");
        const selectedRadio = document.querySelector('input[name="new-member"]:checked');

        // Toggle tag box feedback state
        if (requiredSkills.length === 0) {
            if (techTagsFeedback) techTagsFeedback.classList.add("tf-feedback-show");
            if (taskTagBox) taskTagBox.classList.add("tf-group-invalid");
        } else {
            if (techTagsFeedback) techTagsFeedback.classList.remove("tf-feedback-show");
            if (taskTagBox) taskTagBox.classList.remove("tf-group-invalid");
        }

        members.forEach(member => {
            const memberSkillsStr = (member.getAttribute("data-skills") || "").toLowerCase();
            const memberSkills = memberSkillsStr.split(/\s+/).filter(Boolean);
            const badge = member.querySelector(".tf-match-badge") || member.querySelector(".tf-match, .tf-mismatch");
            const card = member.querySelector(".tf-member-card");

            if (requiredSkills.length === 0) {
                if (badge) {
                    badge.className = "tf-match tf-match-badge";
                    badge.innerHTML = '<i class="bi bi-dash-circle"></i> No tags set';
                }
                if (card) {
                    card.classList.remove("is-mismatch", "is-matched");
                }
                return;
            }

            // Calculate missing skills
            const missingSkills = requiredSkills.filter(req => !memberSkills.includes(req));

            if (missingSkills.length === 0) {
                // Perfect Match: member has all required tech skills
                if (badge) {
                    badge.className = "tf-match tf-match-badge";
                    badge.innerHTML = '<i class="bi bi-check2-circle"></i> Skill match';
                }
                if (card) {
                    card.classList.remove("is-mismatch");
                    card.classList.add("is-matched");
                }
            } else {
                // Mismatch: member lacks one or more required tech skills
                const missingLabels = missingSkills.map(s => {
                    if (s === "uiux") return "UI/UX";
                    if (s === "node") return "Node.js";
                    if (s === "postgresql") return "PostgreSQL";
                    return s.charAt(0).toUpperCase() + s.slice(1);
                }).join(", ");

                if (badge) {
                    badge.className = "tf-mismatch tf-match-badge";
                    badge.innerHTML = `<i class="bi bi-x-circle"></i> Missing: ${escapeHtml(missingLabels)}`;
                }
                if (card) {
                    card.classList.remove("is-matched");
                    card.classList.add("is-mismatch");
                }
            }
        });

        // Update selected member validation state and banner
        if (selectedRadio) {
            const memberEl = selectedRadio.closest(".tf-member");
            const memberSkillsStr = memberEl ? (memberEl.getAttribute("data-skills") || "").toLowerCase() : "";
            const memberSkills = memberSkillsStr.split(/\s+/).filter(Boolean);
            const memberName = memberEl ? (memberEl.querySelector(".tf-member-name")?.textContent.trim() || "Member") : "Member";
            const missingSkills = requiredSkills.filter(req => !memberSkills.includes(req));

            if (requiredSkills.length > 0 && missingSkills.length > 0) {
                const missingLabels = missingSkills.map(s => {
                    if (s === "uiux") return "UI/UX";
                    if (s === "node") return "Node.js";
                    if (s === "postgresql") return "PostgreSQL";
                    return s.charAt(0).toUpperCase() + s.slice(1);
                }).join(", ");

                if (pickerBox) pickerBox.classList.add("tf-group-invalid");
                if (memberGroupError) {
                    memberGroupError.innerHTML = `
                        <div class="tf-skill-alert bg-danger-subtle text-danger border border-danger-subtle">
                            <i class="bi bi-shield-x fs-6 mt-0"></i>
                            <div>
                                <strong>Skill Mismatch:</strong> ${escapeHtml(memberName)} does not meet the requirements. Missing: <strong>${escapeHtml(missingLabels)}</strong>.
                                <div class="small mt-1 text-danger-emphasis">Assignment will be rejected until a matching member is selected.</div>
                            </div>
                        </div>
                    `;
                }
            } else if (requiredSkills.length > 0) {
                if (pickerBox) pickerBox.classList.remove("tf-group-invalid");
                if (memberGroupError) {
                    memberGroupError.innerHTML = `
                        <div class="tf-skill-alert bg-success-subtle text-success border border-success-subtle">
                            <i class="bi bi-patch-check-fill fs-6 mt-0"></i>
                            <div>
                                <strong>Skill Match Verified:</strong> ${escapeHtml(memberName)} meets all required technical competencies for this task.
                            </div>
                        </div>
                    `;
                }
            }
        }
    }

    // Helper: Add tag to box
    function addTechTag(tagKey, tagLabel) {
        if (!taskTagBox) return;
        const normalizedKey = tagKey.toLowerCase().trim();
        if (!normalizedKey) return;

        // Check if duplicate tag already exists
        const existing = taskTagBox.querySelectorAll(".tf-tag-item");
        for (let item of existing) {
            if ((item.getAttribute("data-tag") || "").toLowerCase() === normalizedKey) {
                showAdminToast("Tag Exists", `Tech tag "${tagLabel}" is already added.`, "info", 2000);
                return;
            }
        }

        const tagSpan = document.createElement("span");
        tagSpan.className = "tf-tag tf-tag-item";
        tagSpan.setAttribute("data-tag", normalizedKey);
        tagSpan.innerHTML = `${escapeHtml(tagLabel)} <i class="bi bi-x-circle-fill tf-tag-remove" role="button" title="Remove ${escapeHtml(tagLabel)}"></i>`;

        // Insert before dropdown container
        const dropdownContainer = taskTagBox.querySelector(".dropdown");
        if (dropdownContainer) {
            taskTagBox.insertBefore(tagSpan, dropdownContainer);
        } else {
            taskTagBox.appendChild(tagSpan);
        }

        updateMemberSkillMatching();
        showAdminToast("Skill Tag Added", `Added required skill: "${tagLabel}".`, "info", 1800);
    }

    // Event Delegation: Remove tag on clicking (x)
    if (taskTagBox) {
        taskTagBox.addEventListener("click", (e) => {
            const removeBtn = e.target.closest(".tf-tag-remove");
            if (removeBtn) {
                const tagItem = removeBtn.closest(".tf-tag-item");
                if (tagItem) {
                    const tagLabel = tagItem.textContent.trim();
                    tagItem.remove();
                    updateMemberSkillMatching();
                    showAdminToast("Tag Removed", `Removed "${tagLabel}" from required skills.`, "info", 1800);
                }
            }
        });
    }

    // Event Listeners: Add Preset Tag from Dropdown
    if (addTagMenu) {
        addTagMenu.querySelectorAll("button[data-add-tag]").forEach(btn => {
            btn.addEventListener("click", () => {
                const tagKey = btn.getAttribute("data-add-tag");
                const tagLabel = btn.textContent.trim();
                addTechTag(tagKey, tagLabel);
            });
        });
    }

    // Event Listeners: Add Custom Tag
    if (addCustomTagBtn && customTagInput) {
        const handleCustomTagSubmit = () => {
            const val = customTagInput.value.trim();
            if (val.length < 2) {
                showAdminToast("Invalid Tag", "Custom skill tag must be at least 2 characters.", "error", 2500);
                return;
            }
            addTechTag(val.toLowerCase().replace(/[^a-z0-9_-]/g, ""), val);
            customTagInput.value = "";
        };

        addCustomTagBtn.addEventListener("click", handleCustomTagSubmit);
        customTagInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                handleCustomTagSubmit();
            }
        });
    }

    // Member picker filtering by skill chips in Create Task Section
    const skillChips = document.querySelectorAll('input[name="new-skill"]');
    const memberItems = document.querySelectorAll(".tf-members .tf-member");

    skillChips.forEach((chip) => {
        chip.addEventListener("change", () => {
            const selectedSkill = chip.value.toLowerCase();
            memberItems.forEach((member) => {
                const memberSkills = (member.getAttribute("data-skills") || "").toLowerCase();
                if (selectedSkill === "all" || memberSkills.includes(selectedSkill)) {
                    member.style.display = "";
                } else {
                    member.style.display = "none";
                }
            });
        });
    });

    // Realtime clearing and matching for Create Task Form
    if (createTaskForm) {
        const titleInput = document.getElementById("task-title");
        const descInput = document.getElementById("task-desc");
        const priorityInput = document.getElementById("task-priority");
        const memberRadios = document.querySelectorAll('input[name="new-member"]');

        if (titleInput) {
            titleInput.addEventListener("input", () => {
                if (titleInput.value.trim().length >= 3) setFieldValid(titleInput);
                else clearFieldValidation(titleInput);
            });
        }

        if (descInput) {
            descInput.addEventListener("input", () => {
                if (descInput.value.trim().length >= 8) setFieldValid(descInput);
                else clearFieldValidation(descInput);
            });
        }

        if (taskDeadline) {
            taskDeadline.addEventListener("change", () => {
                if (isTodayOrFutureDate(taskDeadline.value)) setFieldValid(taskDeadline);
                else setFieldInvalid(taskDeadline, "Deadline cannot be in the past.");
            });
        }

        memberRadios.forEach((radio) => {
            radio.addEventListener("change", () => {
                updateMemberSkillMatching();
                const memberEl = radio.closest(".tf-member");
                const memberSkillsStr = memberEl ? (memberEl.getAttribute("data-skills") || "").toLowerCase() : "";
                const memberSkills = memberSkillsStr.split(/\s+/).filter(Boolean);
                const reqs = getRequiredSkills();
                const missing = reqs.filter(r => !memberSkills.includes(r));
                const name = memberEl?.querySelector(".tf-member-name")?.textContent.trim() || "Member";

                if (missing.length > 0) {
                    showAdminToast("Skill Mismatch Alert", `${name} lacks required skills for this task.`, "warning", 3500);
                } else if (reqs.length > 0) {
                    showAdminToast("Skill Match Confirmed", `${name} meets all required technical tags!`, "success", 2000);
                }
            });
        });

        // Create Task Submit
        createTaskForm.addEventListener("submit", (e) => {
            e.preventDefault();
            let isValid = true;

            // 1. Title Validation
            const titleVal = titleInput ? titleInput.value.trim() : "";
            if (titleVal === "") {
                setFieldInvalid(titleInput, "Task title is required.");
                isValid = false;
            } else if (titleVal.length < 3) {
                setFieldInvalid(titleInput, "Task title must be at least 3 characters.");
                isValid = false;
            } else {
                setFieldValid(titleInput);
            }

            // 2. Description Validation
            const descVal = descInput ? descInput.value.trim() : "";
            if (descVal === "") {
                setFieldInvalid(descInput, "Task description is required.");
                isValid = false;
            } else if (descVal.length < 8) {
                setFieldInvalid(descInput, "Please provide more details (at least 8 characters).");
                isValid = false;
            } else {
                setFieldValid(descInput);
            }

            // 3. Deadline Validation
            const deadlineVal = taskDeadline ? taskDeadline.value : "";
            if (!deadlineVal) {
                setFieldInvalid(taskDeadline, "Please select a target deadline.");
                isValid = false;
            } else if (!isTodayOrFutureDate(deadlineVal)) {
                setFieldInvalid(taskDeadline, "Deadline cannot be in the past.");
                isValid = false;
            } else {
                setFieldValid(taskDeadline);
            }

            // 4. Required Tech Tags Validation
            const requiredSkills = getRequiredSkills();
            if (requiredSkills.length === 0) {
                isValid = false;
                if (taskTagBox) taskTagBox.classList.add("tf-group-invalid");
                if (techTagsFeedback) techTagsFeedback.classList.add("tf-feedback-show");
                showAdminToast("Skill Tags Required", "Please specify at least one required tech tag before assigning.", "error");
                return;
            } else {
                if (taskTagBox) taskTagBox.classList.remove("tf-group-invalid");
                if (techTagsFeedback) techTagsFeedback.classList.remove("tf-feedback-show");
            }

            // 5. Member Assignment Validation
            const selectedMember = document.querySelector('input[name="new-member"]:checked');
            if (!selectedMember) {
                isValid = false;
                if (pickerBox) pickerBox.classList.add("tf-group-invalid");
                if (memberGroupError) {
                    memberGroupError.innerHTML = `
                        <div class="tf-skill-alert bg-danger-subtle text-danger border border-danger-subtle">
                            <i class="bi bi-exclamation-triangle-fill"></i>
                            <div>Please select a qualified team member for this task.</div>
                        </div>
                    `;
                }
                showAdminToast("Member Required", "Please select a team member to assign this task to.", "error");
                return;
            }

            // 6. STRICT SKILL MATCH ENFORCEMENT
            const memberEl = selectedMember.closest(".tf-member");
            const memberSkillsStr = memberEl ? (memberEl.getAttribute("data-skills") || "").toLowerCase() : "";
            const memberSkills = memberSkillsStr.split(/\s+/).filter(Boolean);
            let assignedName = "Team Member";
            const nameSpan = memberEl ? memberEl.querySelector(".tf-member-name") : null;
            if (nameSpan) assignedName = nameSpan.textContent.trim();

            const missingSkills = requiredSkills.filter(req => !memberSkills.includes(req));

            if (missingSkills.length > 0) {
                isValid = false;
                if (pickerBox) pickerBox.classList.add("tf-group-invalid");
                const missingLabels = missingSkills.map(s => {
                    if (s === "uiux") return "UI/UX";
                    if (s === "node") return "Node.js";
                    if (s === "postgresql") return "PostgreSQL";
                    return s.charAt(0).toUpperCase() + s.slice(1);
                }).join(", ");

                if (memberGroupError) {
                    memberGroupError.innerHTML = `
                        <div class="tf-skill-alert bg-danger-subtle text-danger border border-danger-subtle">
                            <i class="bi bi-shield-x fs-6"></i>
                            <div>
                                <strong>Assignment Blocked:</strong> Cannot assign task to <strong>${escapeHtml(assignedName)}</strong>.<br>
                                Required Tech Tags: <strong>${escapeHtml(requiredSkills.join(", "))}</strong>.<br>
                                ${escapeHtml(assignedName)} lacks required skills: <span class="badge bg-danger text-white">${escapeHtml(missingLabels)}</span>.
                            </div>
                        </div>
                    `;
                }

                showAdminToast(
                    "Assignment Blocked",
                    `Cannot assign: ${assignedName} lacks required skills (${missingLabels}). Task can only be assigned to members with matching skills.`,
                    "error",
                    6000
                );
                return;
            }

            if (!isValid) {
                showAdminToast("Incomplete Task", "Please review and complete the highlighted task fields.", "error");
                return;
            }

            // Dynamically add to task table
            addTaskToTable({
                title: titleVal,
                desc: descVal,
                priority: priorityInput ? priorityInput.value : "High",
                deadline: deadlineVal,
                assignee: assignedName,
                skills: requiredSkills
            });

            // Reset and show success
            createTaskForm.reset();
            [titleInput, descInput, taskDeadline].forEach(clearFieldValidation);
            if (pickerBox) pickerBox.classList.remove("tf-group-invalid");
            if (memberGroupError) memberGroupError.innerHTML = "";
            updateMemberSkillMatching();

            showAdminToast("Task Created & Assigned", `"${titleVal}" has been assigned to ${assignedName}.`, "success");
        });
    }

    // Helper: Add newly created task into the task table dynamically
    function addTaskToTable(task) {
        const tableBody = document.querySelector(".tf-table tbody");
        if (!tableBody) return;

        const newRow = document.createElement("tr");
        const taskId = "TASK-" + (104 + Math.floor(Math.random() * 800));

        const priorityBadge = task.priority.toLowerCase() === "high"
            ? '<span class="badge bg-danger-subtle text-danger border border-danger-subtle">High</span>'
            : task.priority.toLowerCase() === "medium"
                ? '<span class="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle">Medium</span>'
                : '<span class="badge bg-info-subtle text-info-emphasis border border-info-subtle">Low</span>';

        const skillTagsHtml = (task.skills && task.skills.length > 0)
            ? task.skills.map(s => `<span class="tf-tag">${escapeHtml(s.toUpperCase())}</span>`).join(" ")
            : '<span class="tf-tag">General Stack</span>';

        newRow.innerHTML = `
            <td>
                <div class="fw-bold text-dark">${escapeHtml(task.title)}</div>
                <div class="tf-sub text-muted small">${taskId} &bull; Just created</div>
            </td>
            <td>
                <div class="tf-tech-stack-cell">
                    <span class="tf-domain-badge tf-domain-backend"><i class="bi bi-layers"></i> Assigned Stack</span>
                    <div class="tf-subskills mt-1">
                        ${skillTagsHtml}
                    </div>
                </div>
            </td>
            <td>${priorityBadge}</td>
            <td>
                <div class="small fw-semibold text-dark">${escapeHtml(task.deadline)}</div>
                <div class="text-muted small">Assigned now</div>
            </td>
            <td><span class="badge bg-primary-subtle text-primary border border-primary-subtle">Assigned</span></td>
            <td>
                <div class="d-flex align-items-center gap-2">
                    <span class="tf-avatar tf-avatar-sm" style="background:#4f46e5;color:#fff;">${escapeHtml(task.assignee.slice(0, 2).toUpperCase())}</span>
                    <span class="small fw-medium">${escapeHtml(task.assignee)}</span>
                </div>
            </td>
            <td class="text-end">
                <span class="badge bg-success-subtle text-success">New</span>
            </td>
        `;
        tableBody.prepend(newRow);
    }

    // Initial check on load
    updateMemberSkillMatching();

    // Modal: Task 1 Edit (Build API Endpoints)
    const t1EditForm = document.getElementById("t1EditForm");
    const t1SaveBtn = document.getElementById("t1SaveBtn");
    if (t1SaveBtn) {
        t1SaveBtn.addEventListener("click", () => {
            const reasonCat = document.getElementById("t1-edit-reason-category");
            const reasonContext = document.getElementById("t1-edit-reason-text");
            const titleField = document.getElementById("t1-edit-title-field");
            const dueField = document.getElementById("t1-edit-due");

            let isValid = true;
            if (!reasonCat || !reasonCat.value) {
                setFieldInvalid(reasonCat, "Please select an audit modification reason.");
                isValid = false;
            } else setFieldValid(reasonCat);

            if (!reasonContext || reasonContext.value.trim().length < 5) {
                setFieldInvalid(reasonContext, "Context note must be at least 5 characters.");
                isValid = false;
            } else setFieldValid(reasonContext);

            if (!titleField || titleField.value.trim().length < 3) {
                setFieldInvalid(titleField, "Title must be at least 3 characters.");
                isValid = false;
            } else setFieldValid(titleField);

            if (!dueField || !dueField.value) {
                setFieldInvalid(dueField, "Please select a due date.");
                isValid = false;
            } else setFieldValid(dueField);

            if (!isValid) {
                showAdminToast("Validation Error", "Please provide required modification details.", "error");
                return;
            }

            const modalEl = document.getElementById("t1-edit");
            if (modalEl && window.bootstrap) {
                const modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
                modal.hide();
            }
            showAdminToast("Task Updated", "TASK-101 (Build API Endpoints) updated successfully.", "success");
        });
    }

    // Modal: Task 1 Delete
    const t1DeleteBtn = document.getElementById("t1DeleteBtn");
    if (t1DeleteBtn) {
        t1DeleteBtn.addEventListener("click", () => {
            const reasonSel = document.getElementById("t1-del-reason");
            const reasonDesc = document.getElementById("t1-del-desc");

            let isValid = true;
            if (!reasonSel || !reasonSel.value) {
                setFieldInvalid(reasonSel, "Please select a deletion reason.");
                isValid = false;
            } else setFieldValid(reasonSel);

            if (!reasonDesc || reasonDesc.value.trim().length < 5) {
                setFieldInvalid(reasonDesc, "Please document the deletion reason (min 5 characters).");
                isValid = false;
            } else setFieldValid(reasonDesc);

            if (!isValid) {
                showAdminToast("Audit Required", "Deletion requires a category and documented reason.", "error");
                return;
            }

            const modalEl = document.getElementById("t1-delete");
            if (modalEl && window.bootstrap) {
                const modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
                modal.hide();
            }
            showAdminToast("Task Deleted", "TASK-101 has been removed from the sprint.", "warning");
        });
    }

    // Modal: Task 2 Assign (Design Checkout Flow)
    const t2AssignBtn = document.getElementById("t2AssignBtn");
    if (t2AssignBtn) {
        t2AssignBtn.addEventListener("click", () => {
            const milestone = document.getElementById("assignMilestone");
            const hours = document.getElementById("assignHours");
            const figmaLink = document.getElementById("assignFigmaLink");

            let isValid = true;
            if (!milestone || !milestone.value) {
                setFieldInvalid(milestone, "Please select a sprint milestone phase.");
                isValid = false;
            } else setFieldValid(milestone);

            const hoursVal = hours ? parseFloat(hours.value) : 0;
            if (isNaN(hoursVal) || hoursVal < 1 || hoursVal > 160) {
                setFieldInvalid(hours, "Effort must be between 1 and 160 hours.");
                isValid = false;
            } else setFieldValid(hours);

            if (figmaLink && figmaLink.value.trim() && !isValidUrl(figmaLink.value.trim())) {
                setFieldInvalid(figmaLink, "Please enter a valid URL / Figma link.");
                isValid = false;
            } else if (figmaLink) {
                setFieldValid(figmaLink);
            }

            if (!isValid) {
                showAdminToast("Validation Error", "Please check assignment details before confirming.", "error");
                return;
            }

            const modalEl = document.getElementById("t2-assign");
            if (modalEl && window.bootstrap) {
                const modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
                modal.hide();
            }
            showAdminToast("Assignment Confirmed", "TASK-102 assigned to Saanvi Rao with briefing notification.", "success");
        });
    }

    // Modal: Task 3 Edit (Database Schema Migration)
    const t3SaveBtn = document.getElementById("t3SaveBtn");
    if (t3SaveBtn) {
        t3SaveBtn.addEventListener("click", () => {
            const reasonCat = document.getElementById("t3-edit-reason-category");
            const reasonText = document.getElementById("t3-edit-reason-text");
            const titleField = document.getElementById("t3-title-input");

            let isValid = true;
            if (!reasonCat || !reasonCat.value) {
                setFieldInvalid(reasonCat, "Select a reason for schema alteration.");
                isValid = false;
            } else setFieldValid(reasonCat);

            if (!reasonText || reasonText.value.trim().length < 5) {
                setFieldInvalid(reasonText, "Explanation must be at least 5 characters.");
                isValid = false;
            } else setFieldValid(reasonText);

            if (!titleField || titleField.value.trim().length < 3) {
                setFieldInvalid(titleField, "Title must be at least 3 characters.");
                isValid = false;
            } else setFieldValid(titleField);

            if (!isValid) {
                showAdminToast("Validation Error", "Please provide all required audit fields.", "error");
                return;
            }

            const modalEl = document.getElementById("t3-edit");
            if (modalEl && window.bootstrap) {
                const modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
                modal.hide();
            }
            showAdminToast("Task Updated", "TASK-103 (Database Schema Migration) updated successfully.", "success");
        });
    }

    // Modal: Task 3 Delete
    const t3DeleteBtn = document.getElementById("t3DeleteBtn");
    if (t3DeleteBtn) {
        t3DeleteBtn.addEventListener("click", () => {
            const reasonSel = document.getElementById("t3-del-reason");
            const reasonDesc = document.getElementById("t3-del-desc");

            let isValid = true;
            if (!reasonSel || !reasonSel.value) {
                setFieldInvalid(reasonSel, "Please select a deletion reason.");
                isValid = false;
            } else setFieldValid(reasonSel);

            if (!reasonDesc || reasonDesc.value.trim().length < 5) {
                setFieldInvalid(reasonDesc, "Please document reason details (min 5 characters).");
                isValid = false;
            } else setFieldValid(reasonDesc);

            if (!isValid) {
                showAdminToast("Audit Required", "Deletion requires category and documented details.", "error");
                return;
            }

            const modalEl = document.getElementById("t3-delete");
            if (modalEl && window.bootstrap) {
                const modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
                modal.hide();
            }
            showAdminToast("Task Deleted", "TASK-103 has been deleted from sprint backlog.", "warning");
        });
    }
}

