
document.addEventListener("DOMContentLoaded", () => {
    initAnalyticsInteractivity();
    initExportButtons();
});

function initAnalyticsInteractivity() {
    // 1. Date Range Filter Controls
    const rangeRadios = document.querySelectorAll('input[name="date-range"]');
    rangeRadios.forEach(radio => {
        radio.addEventListener("change", () => {
            showAdminToast("Report Refreshed", `Metrics re-calculated for "${radio.nextElementSibling?.textContent.trim()}".`, "info", 1800);
        });
    });

    // 2. Metrics Card Hover Insights
    const statCards = document.querySelectorAll(".tf-stat-box, .stat-card");
    statCards.forEach(card => {
        card.style.cursor = "pointer";
        card.addEventListener("click", () => {
            const label = card.querySelector(".text-muted, .tf-sub")?.textContent.trim() || "Metric";
            const val = card.querySelector("h3, .value, b")?.textContent.trim() || "";
            showAdminToast(label, `Aggregated value: ${val}`, "info", 2000);
        });
    });
}

function initExportButtons() {
    const exportBtn = document.getElementById("exportReportBtn") || document.querySelector('.btn-export');
    if (exportBtn) {
        exportBtn.addEventListener("click", () => {
            showAdminToast("Exporting Analytics", "Compiling sprint metrics, velocity reports, and audit logs...", "info", 2000);
            setTimeout(() => {
                const csvData = "Metric,Value,Period\nVelocity,94%,Last 30 Days\nCompleted Tasks,48,Sprint Alpha\nActive Blockers,2,Sprint Alpha\n";
                const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `teamflow_analytics_${new Date().toISOString().split("T")[0]}.csv`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                showAdminToast("Download Ready", "Analytics CSV export downloaded successfully.", "success");
            }, 1000);
        });
    }
}
