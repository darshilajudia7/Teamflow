
document.addEventListener("DOMContentLoaded", () => {
    initMemberHistoryPage();
});

function initMemberHistoryPage() {
    const historyTable = document.querySelector(".tf-table tbody");
    if (!historyTable) return;

    loadPersistedHistorySubmissions();

    // 1. Search Bar & Export for History
    const historyHeader = document.querySelector(".tf-card .mb-4");
    if (historyHeader && !document.getElementById("historySearchWrap")) {
        const searchWrap = document.createElement("div");
        searchWrap.id = "historySearchWrap";
        searchWrap.className = "d-flex flex-wrap align-items-center justify-content-between gap-3 mt-3 pt-3 border-top";
        searchWrap.innerHTML = `
            <div class="tf-search-box flex-grow-1" style="max-width: 320px;">
                <i class="bx bx-search"></i>
                <input type="text" id="historySearchInput" placeholder="Filter submissions by name, reviewer..." aria-label="Search history" style="border:none; outline:none; background:transparent;">
            </div>
            <button type="button" class="btn btn-sm btn-outline-primary" id="exportHistoryBtn">
                <i class="bx bx-download me-1"></i> Export History (CSV)
            </button>
        `;
        historyHeader.appendChild(searchWrap);

        const searchInput = document.getElementById("historySearchInput");
        if (searchInput) {
            searchInput.addEventListener("input", () => {
                const term = searchInput.value.toLowerCase().trim();
                const rows = historyTable.querySelectorAll("tr");
                rows.forEach(row => {
                    const text = row.textContent.toLowerCase();
                    row.style.display = text.includes(term) ? "" : "none";
                });
            });
        }

        const exportBtn = document.getElementById("exportHistoryBtn");
        if (exportBtn) {
            exportBtn.addEventListener("click", exportHistoryToCSV);
        }
    }

    // 2. Interactive Row Clicking to Highlight Remark in Sidebar
    const rows = historyTable.querySelectorAll("tr");
    rows.forEach(row => {
        row.style.cursor = "pointer";
        row.addEventListener("click", () => {
            const deliverableTitle = row.querySelector(".fw-semibold")?.textContent.trim() || "";
            highlightMatchingRemark(deliverableTitle);
        });
    });

    function highlightMatchingRemark(title) {
        const remarks = document.querySelectorAll(".tf-remark");
        let matched = false;

        remarks.forEach(r => {
            const chip = r.querySelector(".tf-chip")?.textContent.trim() || "";
            if (chip.toLowerCase().includes(title.toLowerCase()) || title.toLowerCase().includes(chip.toLowerCase())) {
                r.classList.add("tf-remark-highlighted");
                r.scrollIntoView({ behavior: "smooth", block: "center" });
                matched = true;
                setTimeout(() => r.classList.remove("tf-remark-highlighted"), 3000);
            } else {
                r.classList.remove("tf-remark-highlighted");
            }
        });

        if (matched) {
            showMemberToast("Remark Found", `Jumped to Leader feedback for "${title}".`, "info", 2000);
        }
    }

    function exportHistoryToCSV() {
        const rows = Array.from(historyTable.querySelectorAll("tr"));
        let csvContent = "data:text/csv;charset=utf-8,Deliverable,Status,Approved/Submitted At,Reviewed By\n";

        rows.forEach(row => {
            const cols = row.querySelectorAll("td");
            if (cols.length >= 4) {
                const deliverable = `"${cols[0].querySelector('.fw-semibold')?.textContent.trim() || ''}"`;
                const status = `"${cols[1].textContent.trim().replace(/\s+/g, ' ')}"`;
                const date = `"${cols[2].textContent.trim().replace(/\s+/g, ' ')}"`;
                const reviewer = `"${cols[3].querySelector('.fw-semibold')?.textContent.trim() || cols[3].textContent.trim()}"`;
                csvContent += `${deliverable},${status},${date},${reviewer}\n`;
            }
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `teamflow_history_${new Date().toISOString().split("T")[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();

        showMemberToast("History Exported", "Submission history log downloaded as CSV.", "success");
    }

    function loadPersistedHistorySubmissions() {
        try {
            const submissions = JSON.parse(localStorage.getItem("tf_member_history") || "[]");
            submissions.forEach(sub => {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td>
                        <div class="d-flex align-items-center gap-3">
                            <span class="tf-item-icon i-teal"><i class="bx bx-check-circle"></i></span>
                            <div>
                                <div class="fw-semibold text-dark">${escapeHtml(sub.title)}</div>
                                <div class="tf-sub">Submitted deliverable</div>
                            </div>
                        </div>
                    </td>
                    <td>
                        <span class="badge bg-success-subtle text-success border border-success-subtle px-2 py-1">
                            <i class="bx bx-check-double me-1"></i>${escapeHtml(sub.status)}
                        </span>
                    </td>
                    <td>
                        <div class="fw-semibold text-dark">${escapeHtml(sub.date)}</div>
                        <div class="tf-sub">${escapeHtml(sub.time)}</div>
                    </td>
                    <td>
                        <div class="d-flex align-items-center gap-2">
                            <span class="tf-mini-avatar">${escapeHtml(sub.reviewer.slice(0, 2).toUpperCase())}</span>
                            <span class="fw-semibold small text-dark">${escapeHtml(sub.reviewer)}</span>
                        </div>
                    </td>
                `;
                tr.style.cursor = "pointer";
                tr.addEventListener("click", () => {
                    highlightMatchingRemark(sub.title);
                });
                historyTable.insertBefore(tr, historyTable.firstChild);
            });
        } catch (e) { }
    }
}
