// ============================================================
//  CYSE 411 Q4 Starter Code
//  Employee Directory Application


function loadSession() {
    const raw = sessionStorage.getItem("session");
    const session = JSON.parse(raw);          // No try/catch
    return session;                            // No field validation
}


//  Q4.A  Status Message Rendering
//  Displays an employee's status message on their profile card.
//  VULNERABILITY: The message is inserted via innerHTML,
//  allowing any HTML or script tags in the message to
//  execute in the viewer's browser (stored XSS).


function renderStatusMessage(containerElement, message) {
    containerElement.textContent = message;
}



//  Q4.B  Search Query Sanitization
//  Builds a display label from the user's search input.
//  VULNERABILITY: The raw input is used directly with no
//  character filtering, no length limit, and no trimming.


function sanitizeSearchQuery(input) {
    // TODO: Implement sanitization.
    // Requirements:
    //   - Allow only letters, digits, spaces, hyphens, underscores
    //   - Trim leading/trailing whitespace before processing
    //   - Max 40 characters
    //   - Return null if the result is empty after sanitization
    
    input = input.trim();
    if (!input) { 
        return null;
    }
    // removes disallowed characters, limits length, returns null if it's empty
    input = input.replace(/[^a-zA-Z0-9\s\-_]/g, ''); 
    if (input.length > 40) {
        input = input.substring(0, 40);
    }
    return input || null;
}

function performSearch(query) {
    const sanitized = sanitizeSearchQuery(query);
    const label = document.getElementById("search-label");
    label.textContent = "Showing results for: " + sanitized;
}



//  Application Bootstrap
//  Runs when the page finishes loading.


document.addEventListener("DOMContentLoaded", function () {

    // Load session
    try {
        const session = loadSession();
        if (session && typeof session.displayName === "string" && session.displayName.trim() !== "") { // checks for non-empty string name
            document.getElementById("welcome-msg").textContent =
                "Welcome, " + session.displayName;
        }
    } catch (error) {
        console.error("Error loading session:", error); 
    }

    // Simulate receiving a profile card with a status message
    // In production this would come from an API response.
    const simulatedProfiles = [
        {
            name: "Alice Johnson",
            department: "Engineering",
            status: "Working from home today"
        },
        {
            name: "Bob Martinez",
            department: "Security",
            // Attacker-controlled payload – should NOT execute
            status: "<img src=x onerror=\"alert('XSS: session stolen')\">"
        },
        {
            name: "Carol Lee",
            department: "HR",
            status: "Out of office until Friday"
        }
    ];

    const directory = document.getElementById("directory");

    simulatedProfiles.forEach(function (profile) {
        const card = document.createElement("div");
        card.className = "profile-card";

        const nameEl = document.createElement("h3");
        nameEl.textContent = profile.name;

        const deptEl = document.createElement("p");
        deptEl.textContent = "Department: " + profile.department;

        const statusContainer = document.createElement("div");
        statusContainer.className = "status";

        // Q4.A – fix this call
        renderStatusMessage(statusContainer, profile.status);

        card.appendChild(nameEl);
        card.appendChild(deptEl);
        card.appendChild(statusContainer);
        directory.appendChild(card);
    });

    // Search button handler
    document.getElementById("search-btn").addEventListener("click", function () {
        const query = document.getElementById("search-input").value;
        performSearch(query);
    });

});
