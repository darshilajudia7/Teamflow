
document.addEventListener("DOMContentLoaded", () => {
    initLeaderDashboard();
});

function initLeaderDashboard() {
    // Quick Stat Cards Hover & Click
    const statCards = document.querySelectorAll(".tf-stat");
    statCards.forEach((card) => {
        card.style.cursor = "pointer";
        card.addEventListener("click", () => {
            const label = card.querySelector(".tf-sub")?.textContent.trim() || "Stats";
            const val = card.querySelector(".tf-stat-value")?.textContent.trim() || "";
            showAdminToast(label, `Current metric: ${val}. View detailed analytics for more.`, "info", 2200);
        });
    });

    // Activity row click feedback
    const activityItems = document.querySelectorAll(".tf-activity-item, .tf-item");
    activityItems.forEach((item) => {
        item.style.cursor = "pointer";
        item.addEventListener("click", () => {
            const heading = item.querySelector(".fw-semibold")?.textContent.trim() || "Activity";
            showAdminToast("Recent Event", heading, "info", 2000);
        });
    });
}
