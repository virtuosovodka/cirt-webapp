// This function was debugged using AI to resolve asynchronous route handling issues.
// The specific use case was to get the user experience of the arrows to toggle the intersection tables, that was implemented with Claude.
/*
CITATIONS & CREDITS
  1. Citation Scope: script.js to enable toggling, all of it was explained by Claude
  2. Date: August 2026
  3. Originality: Adapted with AI debugging assistance.
  4. Source: AI Assistant (Gemini) used to troubleshoot any issues in the CSS and app.js along with here. 
*/

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