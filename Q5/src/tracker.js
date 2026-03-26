// ============================================================
//  CYSE 411 – Mid-Term Exam V2  |  Q5 Starter File
//  Incident Tracker Application


//  Application State

const ACCEPTED_SEVERITIES = ["low", "medium", "high", "critical"];
const ACCEPTED_FILTERS    = ["all", "low", "medium", "high", "critical"];

// Current filter selection (set during state load, used on save)
let currentFilter = "all";



//  Q5.C  Dashboard State – Load
//  Reads the last selected filter from localStorage.
//  VULNERABILITY: JSON.parse is called without a try/catch.
//  The stored filter value is used without checking whether
//  it belongs to the accepted list.

// The stored JSON is parsed inside a try/catch. On parse failure, a safe default state object is used instead.
// The filter field from the stored state is validated to be one of the accepted values ('all', 'low', 'medium', 'high', 'critical') before it is applied to the UI. If the stored value is not in this list, the filter defaults to 'all'.
// Before writing to localStorage, the filter value read from the DOM input is validated against the same accepted list. Only accepted values are written; invalid values must not be persisted.
function loadDashboardState() {
    const raw   = localStorage.getItem("dashboardState");
    let state;
    try { // parses, defaults to safe state if it fails
        state = JSON.parse(raw);
    } catch (error) { // 
        console.error("Error parsing dashboard state:", error);
        state = { filter: "all" };
    }
    currentFilter = state.filter in ACCEPTED_FILTERS ? state.filter : "all"; // checks if it belongs in the list, otherwise defaults to all
    applyFilter(currentFilter);
}


//  Q5.C  Dashboard State – Save
//  Writes the selected filter back to localStorage after a fetch.
//  VULNERABILITY: The raw value from the DOM input is written
//  directly to localStorage without validating it against the
//  accepted list.


function saveDashboardState() {
    const filterInput = document.getElementById("filter-select");
    const filter      = filterInput.value;    // Not validated before storing
    localStorage.setItem("dashboardState", JSON.stringify({ filter: filter }));
    currentFilter = filter;
}



//  Q5.A  Fetch Incidents
//  Retrieves open incidents from the REST API.
//  VULNERABILITY 1: fetch() is called but NOT awaited.
//    'res' holds a Promise, not a Response object.
//  VULNERABILITY 2: response.ok is never checked, so
//    HTTP 401 / 500 error bodies are processed as valid data.
//  VULNERABILITY 3: No try/catch – a network failure will
//    crash the function with an unhandled rejection.

try { // try/catch for errors
    async function fetchIncidents() { // uses await now
        const res  = await fetch("/api/incidents");      
        if (!res.ok) { // checks if the response is ok, throws error if not
            throw new Error('HTTP error: ' + res.status);
        }
        const data = await res.json();                   
        return data;
    }
} catch (error) {
    console.error("Error fetching incidents:", error);
    return []; // returns empty array
}


//  Q5.B  Render Incidents
//  Builds the incident list in the dashboard.
//  VULNERABILITY 1: Incident data (title, severity) is inserted
//    via innerHTML – a stored XSS risk if the API returns
//    attacker-controlled content.
//  VULNERABILITY 2: No validation of the incidents array or
//    individual incident fields before rendering.


function renderIncidents(incidents) {
    const container = document.getElementById("incident-list");
    container.textContent = "";                  // Clear previous results

    if (!Array.isArray(incidents)) { // renders safe error message if it's not an array
        const errorMsg = document.createElement("p");
        errorMsg.textContent = "Error: Invalid incident data.";
        container.appendChild(errorMsg);
        console.error("Invalid incidents data:", incidents);
        return;
    }

    // validates for a non-empty string title and valid severity field
    if (incidents.title === undefined || incidents.severity === undefined || typeof incidents.title !== "string" || !ACCEPTED_SEVERITIES.includes(incidents.severity)) {
        console.warn("Skipping invalid incident:", incidents); // console warning
        return;
    }

    incidents.forEach(function (incident) { // no more innerHTML, uses document.createElement
        const item = document.createElement("li");
        item.textContent = incident.title;
        const severitySpan = document.createElement("span");
        severitySpan.className = "severity severity-" + incident.severity;
        severitySpan.textContent = incident.severity;
        item.appendChild(severitySpan);
        container.appendChild(item);
    });    
}



//  Filter Helper (provided – do not modify)
//  Hides/shows rendered items based on selected severity.


function applyFilter(filter) {
    const items = document.querySelectorAll("#incident-list li");
    items.forEach(function (item) {
        const badge = item.querySelector(".severity");
        if (!badge) return;
        const sev = badge.textContent.trim();
        item.style.display = (filter === "all" || sev === filter) ? "" : "none";
    });
    currentFilter = filter;
}



//  Application Bootstrap
//  Runs when the page finishes loading.


document.addEventListener("DOMContentLoaded", async function () {

    // Q5.C – Load saved filter state
    loadDashboardState();

    // Q5.A – Fetch incident data from the API
    const incidents = await fetchIncidents();

    // Q5.B – Render the incidents
    renderIncidents(incidents);

    // Filter select change handler
    document.getElementById("filter-select").addEventListener("change", function () {
        applyFilter(this.value);
        // Q5.C – Save the new filter choice
        saveDashboardState();
    });

});
