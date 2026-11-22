document.addEventListener("DOMContentLoaded", () => {
    initMemberDashboard();
});

function initMemberDashboard() {
    // 1. Chart Columns Interactive Tooltips
    const chartCols = document.querySelectorAll(".tf-chart .tf-col");
    const weekStats = [
        { week: "Week 1", done: 40, pend: 20, todo: 10 },
        { week: "Week 2", done: 55, pend: 15, todo: 5 },
        { week: "Week 3", done: 45, pend: 25, todo: 15 },
        { week: "Week 4", done: 70, pend: 10, todo: 5 },
        { week: "Week 5", done: 60, pend: 20, todo: 10 },
        { week: "This week", done: 35, pend: 30, todo: 20 }
    ];

    chartCols.forEach((col, idx) => {
        const stat = weekStats[idx] || { week: `Wk ${idx + 1}`, done: 50, pend: 20, todo: 10 };
        let tooltip = col.querySelector(".tf-chart-tooltip");
        if (!tooltip) {
            tooltip = document.createElement("div");
            tooltip.className = "tf-chart-tooltip";
            col.appendChild(tooltip);
        }
        tooltip.innerHTML = `<strong>${stat.week}</strong><br>Completed: ${stat.done}%<br>In Review: ${stat.pend}%<br>To Do: ${stat.todo}%`;

        col.addEventListener("click", () => {
            chartCols.forEach(c => c.style.outline = "none");
            col.style.outline = "2px solid #4f46e5";
            showMemberToast(stat.week, `Progress: ${stat.done}% completed, ${stat.pend}% in review, ${stat.todo}% to do`, "info", 2500);
        });
    });

    // 2. Dynamic Status Row Clickability
    const statusRows = document.querySelectorAll(".tf-status-row");
    statusRows.forEach(row => {
        row.style.cursor = "pointer";
        row.setAttribute("title", "Click to view these tasks");
        row.addEventListener("click", () => {
            window.location.href = "task.html";
        });
    });
}
