
document.addEventListener("DOMContentLoaded", () => {
    initMemberTaskPage();
});

function initMemberTaskPage() {
    const taskContainer = document.querySelector(".tf-tasks .d-flex.flex-column.gap-4");
    if (!taskContainer) return;

    let activeStatusFilter = "all";
    let activePriorityFilter = "all";
    let activeSort = "due";
    let activeSearchTerm = "";

    // Load persisted task state
    loadPersistedTaskState();

    // 1. Search Box with Clear Button
    const searchBox = document.querySelector(".tf-search-box");
    const searchInput = searchBox ? searchBox.querySelector("input") : null;
    let clearSearchBtn = searchBox ? searchBox.querySelector(".tf-search-clear-btn") : null;

    if (searchBox && !clearSearchBtn) {
        clearSearchBtn = document.createElement("button");
        clearSearchBtn.type = "button";
        clearSearchBtn.className = "tf-search-clear-btn d-none";
        clearSearchBtn.setAttribute("aria-label", "Clear search");
        clearSearchBtn.innerHTML = "<i class='bx bx-x'></i>";
        searchBox.appendChild(clearSearchBtn);
    }

    if (searchInput) {
        searchInput.addEventListener("input", () => {
            activeSearchTerm = searchInput.value.toLowerCase().trim();
            if (activeSearchTerm.length > 0) {
                clearSearchBtn?.classList.remove("d-none");
            } else {
                clearSearchBtn?.classList.add("d-none");
            }
            applyTaskFiltersAndSort();
        });

        clearSearchBtn?.addEventListener("click", () => {
            searchInput.value = "";
            activeSearchTerm = "";
            clearSearchBtn.classList.add("d-none");
            searchInput.focus();
            applyTaskFiltersAndSort();
        });
    }

    // 2. Filter Pills Toolbar
    const toolbar = document.querySelector(".tf-toolbar");
    let filterPills = document.querySelector(".tf-filter-pills");
    if (!filterPills && toolbar) {
        const pillsWrap = document.createElement("div");
        pillsWrap.className = "tf-filter-pills mt-2 mt-md-0";
        pillsWrap.innerHTML = `
            <button type="button" class="tf-filter-btn active" data-filter="all">All (<span id="count-all">2</span>)</button>
            <button type="button" class="tf-filter-btn" data-filter="in-progress">In Progress (<span id="count-prog">1</span>)</button>
            <button type="button" class="tf-filter-btn" data-filter="todo">To Do (<span id="count-todo">1</span>)</button>
            <button type="button" class="tf-filter-btn" data-filter="submitted">Submitted (<span id="count-sub">0</span>)</button>
        `;
        toolbar.insertBefore(pillsWrap, toolbar.children[1] || null);

        pillsWrap.querySelectorAll(".tf-filter-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                pillsWrap.querySelectorAll(".tf-filter-btn").forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                activeStatusFilter = btn.getAttribute("data-filter");
                applyTaskFiltersAndSort();
            });
        });
    }

    // 3. Priority & Sort Dropdowns
    setupPriorityAndSortDropdowns();

    // 4. "Start Working" Action for To Do tasks
    setupStartWorkingButtons();

    // 5. Dynamic Task Submission Modal Wiring
    setupDynamicSubmitWorkModal();

    // 6. Update Task Counters
    updateTaskCounters();

    // 7. Focus on task if URL query contains focus param (e.g. ?focus=task-api)
    handleUrlTaskFocus();

    function applyTaskFiltersAndSort() {
        const cards = Array.from(document.querySelectorAll("article.tf-Review-card"));
        let visibleCount = 0;

        cards.forEach(card => {
            const title = (card.querySelector(".tf-task-title")?.textContent || "").toLowerCase();
            const desc = (card.querySelector(".tf-task-desc")?.textContent || "").toLowerCase();
            const tags = Array.from(card.querySelectorAll(".tf-tech-tag, .tf-tag")).map(t => t.textContent.toLowerCase()).join(" ");
            const priorityBadge = card.querySelector(".tf-priority-badge")?.textContent.toLowerCase() || "";
            const statusChip = card.querySelector(".tf-status-chip")?.textContent.toLowerCase() || "";

            const matchesSearch = !activeSearchTerm || title.includes(activeSearchTerm) || desc.includes(activeSearchTerm) || tags.includes(activeSearchTerm);

            let matchesStatus = true;
            if (activeStatusFilter === "in-progress") {
                matchesStatus = statusChip.includes("in progress");
            } else if (activeStatusFilter === "todo") {
                matchesStatus = statusChip.includes("to do");
            } else if (activeStatusFilter === "submitted") {
                matchesStatus = statusChip.includes("submitted");
            }

            let matchesPriority = true;
            if (activePriorityFilter === "urgent") {
                matchesPriority = priorityBadge.includes("urgent") || priorityBadge.includes("high");
            } else if (activePriorityFilter === "low") {
                matchesPriority = priorityBadge.includes("low") || priorityBadge.includes("medium");
            }

            if (matchesSearch && matchesStatus && matchesPriority) {
                card.style.display = "";
                visibleCount++;
            } else {
                card.style.display = "none";
            }
        });

        // Empty state container
        let emptyState = document.getElementById("tfNoTasksState");
        if (visibleCount === 0) {
            if (!emptyState) {
                emptyState = document.createElement("div");
                emptyState.id = "tfNoTasksState";
                emptyState.className = "tf-empty-state";
                emptyState.innerHTML = `
                    <i class="bx bx-search-alt tf-empty-icon"></i>
                    <h5 class="fw-bold mb-1">No matching tasks found</h5>
                    <p class="text-muted small mb-3">Try adjusting your keywords or clearing selected filters.</p>
                    <button type="button" class="btn btn-sm btn-outline-primary" id="tfResetFiltersBtn">Reset Filters</button>
                `;
                taskContainer.appendChild(emptyState);
                document.getElementById("tfResetFiltersBtn")?.addEventListener("click", () => {
                    if (searchInput) searchInput.value = "";
                    activeSearchTerm = "";
                    clearSearchBtn?.classList.add("d-none");
                    activeStatusFilter = "all";
                    activePriorityFilter = "all";
                    document.querySelectorAll(".tf-filter-btn").forEach(b => b.classList.remove("active"));
                    document.querySelector('.tf-filter-btn[data-filter="all"]')?.classList.add("active");
                    applyTaskFiltersAndSort();
                });
            }
            emptyState.style.display = "block";
        } else if (emptyState) {
            emptyState.style.display = "none";
        }

        updateTaskCounters();
    }

    function updateTaskCounters() {
        const cards = Array.from(document.querySelectorAll("article.tf-Review-card"));
        let countAll = cards.length;
        let countProg = 0;
        let countTodo = 0;
        let countSub = 0;

        cards.forEach(card => {
            const statusChip = (card.querySelector(".tf-status-chip")?.textContent || "").toLowerCase();
            if (statusChip.includes("submitted")) countSub++;
            else if (statusChip.includes("in progress")) countProg++;
            else if (statusChip.includes("to do")) countTodo++;
        });

        const elAll = document.getElementById("count-all");
        const elProg = document.getElementById("count-prog");
        const elTodo = document.getElementById("count-todo");
        const elSub = document.getElementById("count-sub");

        if (elAll) elAll.textContent = countAll;
        if (elProg) elProg.textContent = countProg;
        if (elTodo) elTodo.textContent = countTodo;
        if (elSub) elSub.textContent = countSub;
    }

    function setupPriorityAndSortDropdowns() {
        const buttons = toolbar ? toolbar.querySelectorAll(".d-flex.align-items-center.gap-2 button") : [];
        if (buttons.length >= 2) {
            const filterBtn = buttons[0];
            const sortBtn = buttons[1];

            filterBtn.addEventListener("click", () => {
                if (activePriorityFilter === "all") {
                    activePriorityFilter = "urgent";
                    filterBtn.className = "btn btn-primary btn-sm";
                    filterBtn.innerHTML = "<i class='bx bx-filter-alt me-1'></i> Priority: Urgent";
                } else if (activePriorityFilter === "urgent") {
                    activePriorityFilter = "low";
                    filterBtn.className = "btn btn-secondary btn-sm";
                    filterBtn.innerHTML = "<i class='bx bx-filter-alt me-1'></i> Priority: Low";
                } else {
                    activePriorityFilter = "all";
                    filterBtn.className = "btn btn-light border btn-sm";
                    filterBtn.innerHTML = "<i class='bx bx-filter-alt me-1'></i> Priority: All";
                }
                applyTaskFiltersAndSort();
            });

            sortBtn.addEventListener("click", () => {
                if (activeSort === "due") {
                    activeSort = "title";
                    sortBtn.className = "btn btn-primary btn-sm";
                    sortBtn.innerHTML = "<i class='bx bx-sort-a-z me-1'></i> Title (A-Z)";
                } else {
                    activeSort = "due";
                    sortBtn.className = "btn btn-light border btn-sm";
                    sortBtn.innerHTML = "<i class='bx bx-sort-alt-2 me-1'></i> Due Date";
                }

                const cards = Array.from(taskContainer.querySelectorAll("article.tf-Review-card"));
                cards.sort((a, b) => {
                    if (activeSort === "title") {
                        const tA = (a.querySelector(".tf-task-title")?.textContent || "").trim();
                        const tB = (b.querySelector(".tf-task-title")?.textContent || "").trim();
                        return tA.localeCompare(tB);
                    }
                    return 0;
                });
                cards.forEach(c => taskContainer.appendChild(c));
                showMemberToast("Tasks Sorted", `Ordered by ${activeSort === 'title' ? 'Title (A-Z)' : 'Target Due Date'}.`, "info", 1800);
            });
        }
    }

    function setupStartWorkingButtons() {
        const dbCard = document.getElementById("task-db");
        if (dbCard) {
            const actionWrap = dbCard.querySelector(".d-flex.flex-wrap.gap-2");
            const statusChip = dbCard.querySelector(".tf-status-chip");

            if (actionWrap && !dbCard.querySelector(".tf-start-task-btn") && statusChip && statusChip.textContent.includes("To Do")) {
                const startBtn = document.createElement("button");
                startBtn.type = "button";
                startBtn.className = "btn btn-outline-primary btn-tf-soft tf-start-task-btn";
                startBtn.innerHTML = "<i class='bx bx-play-circle me-1'></i> Start Working";

                startBtn.addEventListener("click", () => {
                    statusChip.className = "tf-status-chip warning";
                    statusChip.style.background = "#e0e7ff";
                    statusChip.style.color = "#4f46e5";
                    statusChip.style.border = "1px solid #c7d2fe";
                    statusChip.innerHTML = "<i class='bx bx-loader-circle bx-spin me-1'></i> In Progress";

                    startBtn.remove();
                    persistTaskState("task-db", "in-progress");
                    updateTaskCounters();
                    showMemberToast("Task Started", "You are now actively working on 'Database schema & relations'.", "success");
                });

                actionWrap.insertBefore(startBtn, actionWrap.firstChild);
            }
        }
    }

    function setupDynamicSubmitWorkModal() {
        const modal = document.getElementById("submitWorkModal");
        if (!modal) return;

        const modalTitle = modal.querySelector(".modal-title");
        const modalBadge = modal.querySelector(".badge");
        const modalScope = modal.querySelector(".p-4.bg-light p");
        const modalPriority = modal.querySelector(".p-4.bg-light .col-md-3:nth-child(1) .badge");
        const modalTech = modal.querySelector(".p-4.bg-light .col-md-3:nth-child(2) .fw-semibold");
        const modalDue = modal.querySelector(".p-4.bg-light .col-md-3:nth-child(4) .fw-bold");

        const uploadArea = modal.querySelector(".tf-upload-area");
        const fileInput = modal.querySelector('input[type="file"]');
        const submitForm = modal.querySelector("form");
        const notesTextarea = modal.querySelector("textarea");

        let currentActiveTaskCard = null;

        let charCounter = modal.querySelector("#taskNotesCharCount");
        if (!charCounter && notesTextarea) {
            charCounter = document.createElement("div");
            charCounter.id = "taskNotesCharCount";
            charCounter.className = "form-text text-end small text-muted mt-1";
            charCounter.textContent = "0 / 500 characters (min 5)";
            notesTextarea.parentNode.appendChild(charCounter);

            notesTextarea.addEventListener("input", () => {
                const len = notesTextarea.value.length;
                charCounter.textContent = `${len} / 500 characters (min 5)`;
                if (notesTextarea.value.trim().length >= 5) {
                    markFieldValid(notesTextarea);
                } else {
                    clearFieldStatus(notesTextarea);
                }
            });
        }

        document.querySelectorAll('a[href="#submitWorkModal"]').forEach(btn => {
            btn.addEventListener("click", () => {
                const card = btn.closest("article.tf-Review-card");
                if (!card) return;
                currentActiveTaskCard = card;

                const title = card.querySelector(".tf-task-title")?.textContent.trim() || "Task Submission";
                const desc = card.querySelector(".tf-task-desc")?.textContent.trim() || "";
                const tags = Array.from(card.querySelectorAll(".tf-tech-tag")).map(t => t.textContent.trim()).join(", ");
                const due = card.querySelector(".tf-deadline-badge strong")?.textContent.trim() || "Oct 6, 2026";
                const isUrgent = card.querySelector(".priority-high");

                if (modalTitle) modalTitle.textContent = title;
                if (modalBadge) modalBadge.textContent = card.id === "task-db" ? "TASK-102" : "TASK-101";
                if (modalScope) modalScope.textContent = desc;
                if (modalTech) modalTech.textContent = tags || "General Stack";
                if (modalDue) modalDue.textContent = due;
                if (modalPriority) {
                    modalPriority.className = isUrgent ? "badge bg-danger bg-opacity-10 text-danger border border-danger-subtle" : "badge bg-warning bg-opacity-10 text-warning border border-warning-subtle";
                    modalPriority.innerHTML = isUrgent ? "<i class='bx bx-up-arrow-alt me-1'></i>Urgent" : "<i class='bx bx-minus me-1'></i>Normal";
                }
            });
        });

        if (uploadArea && fileInput) {
            ["dragenter", "dragover"].forEach(ev => {
                uploadArea.addEventListener(ev, (e) => {
                    e.preventDefault();
                    uploadArea.classList.add("drag-over");
                });
            });

            ["dragleave", "drop"].forEach(ev => {
                uploadArea.addEventListener(ev, (e) => {
                    e.preventDefault();
                    uploadArea.classList.remove("drag-over");
                });
            });

            uploadArea.addEventListener("drop", (e) => {
                if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                    fileInput.files = e.dataTransfer.files;
                    renderFileSelectedBadge(fileInput.files[0], uploadArea);
                }
            });

            fileInput.addEventListener("change", () => {
                if (fileInput.files && fileInput.files.length > 0) {
                    renderFileSelectedBadge(fileInput.files[0], uploadArea);
                }
            });
        }

        if (submitForm) {
            submitForm.setAttribute("novalidate", "true");
            submitForm.addEventListener("submit", (e) => {
                e.preventDefault();
                let isValid = true;

                if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
                    showMemberToast("Archive Required", "Please select or drop a .zip or .rar archive before submitting.", "error");
                    isValid = false;
                } else {
                    const validExts = [".zip", ".rar", ".tar.gz", ".gz", ".pdf"];
                    const fname = fileInput.files[0].name.toLowerCase();
                    if (!validExts.some(ext => fname.endsWith(ext))) {
                        showMemberToast("Invalid Format", "Supported formats: .zip, .rar, .tar.gz, .pdf", "error");
                        isValid = false;
                    }
                }

                const notes = notesTextarea ? notesTextarea.value.trim() : "";
                if (notes.length < 5) {
                    markFieldInvalid(notesTextarea, "Please provide a short summary of work completed (at least 5 characters).");
                    isValid = false;
                } else {
                    markFieldValid(notesTextarea);
                }

                if (!isValid) return;

                const targetCard = currentActiveTaskCard || document.getElementById("task-api");
                if (targetCard) {
                    const statusChip = targetCard.querySelector(".tf-status-chip");
                    if (statusChip) {
                        statusChip.className = "badge bg-success-subtle text-success border border-success-subtle px-3 py-2";
                        statusChip.innerHTML = "<i class='bx bx-check-circle me-1'></i> Submitted for Review";
                    }

                    persistTaskState(targetCard.id, "submitted");

                    const taskTitle = targetCard.querySelector(".tf-task-title")?.textContent.trim() || "Task Deliverable";
                    addSubmissionToHistory(taskTitle, "Submitted for Review", "Aarav (Admin)");

                    showMemberToast("Work Submitted!", `Deliverable for "${taskTitle}" has been sent to your Leader for review.`, "success");
                }

                submitForm.reset();
                const badge = uploadArea?.querySelector(".tf-file-selected-badge");
                if (badge) badge.remove();
                if (notesTextarea) clearFieldStatus(notesTextarea);
                window.location.hash = "#close";
                updateTaskCounters();
            });
        }
    }

    function renderFileSelectedBadge(file, container) {
        const validExts = [".zip", ".rar", ".tar.gz", ".gz", ".pdf"];
        const fname = file.name.toLowerCase();
        const isValid = validExts.some(ext => fname.endsWith(ext));

        let badge = container.querySelector(".tf-file-selected-badge");
        if (!badge) {
            badge = document.createElement("div");
            badge.className = "tf-file-selected-badge";
            container.appendChild(badge);
        }

        if (!isValid) {
            badge.className = "tf-file-selected-badge error";
            badge.innerHTML = `<i class='bx bx-error-circle'></i> Unsupported: ${escapeHtml(file.name)} (Use .zip or .rar)`;
        } else {
            const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
            badge.className = "tf-file-selected-badge";
            badge.innerHTML = `
                <i class='bx bx-check-circle text-success'></i>
                <span>Selected: <strong>${escapeHtml(file.name)}</strong> (${sizeMb} MB)</span>
                <button type="button" class="tf-file-remove-btn" aria-label="Remove file">&times;</button>
            `;
            badge.querySelector(".tf-file-remove-btn")?.addEventListener("click", (e) => {
                e.stopPropagation();
                const input = container.querySelector('input[type="file"]');
                if (input) input.value = "";
                badge.remove();
            });
        }
    }

    function persistTaskState(taskId, status) {
        try {
            const tasks = JSON.parse(localStorage.getItem("tf_member_tasks") || "{}");
            tasks[taskId] = status;
            localStorage.setItem("tf_member_tasks", JSON.stringify(tasks));
        } catch (e) { }
    }

    function loadPersistedTaskState() {
        try {
            const tasks = JSON.parse(localStorage.getItem("tf_member_tasks") || "{}");
            Object.keys(tasks).forEach(taskId => {
                const card = document.getElementById(taskId);
                if (card) {
                    const statusChip = card.querySelector(".tf-status-chip");
                    if (statusChip && tasks[taskId] === "submitted") {
                        statusChip.className = "badge bg-success-subtle text-success border border-success-subtle px-3 py-2";
                        statusChip.innerHTML = "<i class='bx bx-check-circle me-1'></i> Submitted for Review";
                    } else if (statusChip && tasks[taskId] === "in-progress") {
                        statusChip.className = "tf-status-chip warning";
                        statusChip.style.background = "#e0e7ff";
                        statusChip.style.color = "#4f46e5";
                        statusChip.style.border = "1px solid #c7d2fe";
                        statusChip.innerHTML = "<i class='bx bx-loader-circle bx-spin me-1'></i> In Progress";
                    }
                }
            });
        } catch (e) { }
    }

    function handleUrlTaskFocus() {
        const urlParams = new URLSearchParams(window.location.search);
        const focusId = urlParams.get("task") || urlParams.get("focus");
        if (focusId) {
            const target = document.getElementById(focusId);
            if (target) {
                setTimeout(() => {
                    target.scrollIntoView({ behavior: "smooth", block: "center" });
                    target.style.outline = "2px solid #4f46e5";
                    target.style.boxShadow = "0 8px 30px rgba(79, 70, 229, 0.25)";
                    setTimeout(() => {
                        target.style.outline = "none";
                        target.style.boxShadow = "";
                    }, 2800);
                }, 300);
            }
        }
    }
}
