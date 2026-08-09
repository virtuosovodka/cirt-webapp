// This function was debugged using AI to resolve asynchronous route handling issues.
// The specific use case was to get the user experience of the arrows to toggle the intersection tables, that was implemented with Claude.

function toggleIncidentDetails(row) {
    // Get the details row (next row in the table)
    const detailsRow = row.nextElementSibling;
    const expandIcon = row.querySelector('.expand-icon');
    
    if (detailsRow) {
        detailsRow.classList.toggle('show');
    }
    if (expandIcon) {
        expandIcon.classList.toggle('expanded');
    }
    row.classList.toggle('expanded');
}