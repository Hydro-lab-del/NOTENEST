
function showToast(type, message) {
    const container = document.getElementById("toastContainer");
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    let iconClass = '';

    if (type === 'success') iconClass = "✅";
    if (type === 'error') iconClass = "❌";
    if (type === 'warning') iconClass = "⚠️";

    toast.innerHTML = `<span class="icon">${iconClass}</span>
        <span class="message">${message}</span> 
        <div class="progress-bar"></div>`;
    container.appendChild(toast);

    setTimeout(() => toast.classList.add("show"), 10);
    setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => toast.remove(), 400);
    }, 5000);
}

function toggleDropdown() {
    const dropdown = document.getElementById("profileDropdown");
    dropdown.style.display = dropdown.style.display === "flex" ? "none" : "flex";
}

window.addEventListener("click", function (e) {
    const avatar = document.querySelector(".avatar");
    const dropdown = document.getElementById("profileDropdown");
    if (!avatar.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.style.display = "none";
    }
});
// logout
document.getElementById("logoutBtn").addEventListener("click", async () => {
    try {
        const response = await apiFetch("https://notenest-odgc.onrender.com/api/v1/users/logout", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
        });
        if (response.ok) {
            window.location.href = "/";
        } else {
            const errorData = await response.json();
            console.error("Logout failed:", errorData.message);
            showToast("error", "Logout failed. Please try again.");
        }
    } catch (error) {
        showToast("error", "Something went wrong.");
    }
});

const addBtn = document.querySelector(".add-btn");
const noteForm = document.getElementById("noteForm");

function toggleForm() {
    noteForm.classList.toggle("show");
}

addBtn.addEventListener("click", toggleForm);



//  api calls

async function apiFetch(url, options = {}, retry = true) {
    const res = await fetch(url, {
        ...options,
        credentials: "include" // send cookies
    });

    // If unauthorized (token expired) and retry allowed
    if (res.status === 401 && retry) {
        console.warn("Access token expired, trying refresh...");

        const refreshRes = await fetch("https://notenest-odgc.onrender.com/api/v1/users/refresh-token", {
            method: "POST",
            credentials: "include"
        });

        if (refreshRes.ok) {
            // Retry original request once
            return apiFetch(url, options, false);
        } else {
            console.warn("Refresh failed, redirecting to login...");
            // window.location.href = "/login.html";
            return;
        }
    }
    return res;
}


noteForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    const title = e.target.title.value.trim();
    const content = e.target.content.value.trim();

    if (!title || !content) {
        showToast("warning", "Both title and content are required.");
        return;
    }

    try {
        const response = await apiFetch("https://notenest-odgc.onrender.com/api/v1/notes/create", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title, content }),
        });

        if (response.ok) {
            e.target.reset();
            toggleForm();
            showToast("success", "Note created successfully!");
            loadNotes();
        } else {
            showToast("error", "Failed to create note.");
        }
    } catch (error) {
        console.error(error);
        showToast("error", "Error creating note.");
    }
});

async function loadNotes() {
    try {
        const response = await apiFetch("https://notenest-odgc.onrender.com/api/v1/notes", {
            method: "GET",
        });

        const result = await response.json();
        if (!response.ok) throw new Error(result.message || "Failed to load notes");

        const notesContainer = document.querySelector(".container");
        notesContainer.innerHTML = "";

        result.data.forEach(note => {
            const noteElement = document.createElement("div");
            noteElement.classList.add("note");
            noteElement.dataset.id = note._id;
            if (note.pinned) noteElement.classList.add("pinned");

            noteElement.innerHTML = `
            <div class="note-header">
              <h2>${note.title}</h2>
              <svg class="icon pin-icon" title="Pin/Unpin Note" xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px">
                <path d="M480-120 360-240h80v-400H360l120-120 120 120h-80v400h80L480-120Z"/>
              </svg>
            </div>
            <p class="note-text">${note.content}</p>
            <div class="actions">
              <span>${new Date(note.createdAt).toLocaleDateString()}</span>
              <div class="icons">
                <svg class="icon edit-icon" title="Edit Note" xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px">
                  <path d="M200-200h57l391-391-57-57-391 391v57Z"/>
                </svg>
                                <svg class="delete" title="Delete Note" xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px">
                  <path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Z"/>
                </svg>
              </div>
            </div>
          `;
            notesContainer.appendChild(noteElement);
        });

        attachNoteActions();
    } catch (error) {
        console.error("Error loading notes:", error);
        showToast("error", "Could not load notes. Please try again.");
    }
}

function attachNoteActions() {
    document.querySelectorAll(".edit-icon").forEach(icon => {
        icon.addEventListener("click", async () => {
            const note = icon.closest(".note");
            const noteId = note.dataset.id;
            const contentEl = note.querySelector(".note-text");
            const titleEl = note.querySelector("h2");

            if (!contentEl.isContentEditable) {
                contentEl.contentEditable = true;
                titleEl.contentEditable = true;
                contentEl.focus();
                icon.setAttribute("title", "Click again to save");
            } else {
                contentEl.contentEditable = false;
                titleEl.contentEditable = false;
                icon.setAttribute("title", "Edit Note");

                const updatedContent = contentEl.textContent.trim();
                const updatedTitle = titleEl.textContent.trim();

                try {
                    const res = await apiFetch(`https://notenest-odgc.onrender.com/api/v1/notes/${noteId}`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ title: updatedTitle, content: updatedContent })
                    });

                    if (!res.ok) throw new Error("Failed to update note");

                    showToast("success", "Note updated!");
                    loadNotes();
                } catch (err) {
                    console.error(err);
                    showToast("error", "Error updating note.");
                }
            }
        });
    });

    document.querySelectorAll(".delete").forEach(icon => {
        icon.addEventListener("click", async () => {
            const note = icon.closest(".note");
            const noteId = note.dataset.id;

            if (!confirm("Are you sure you want to delete this note?")) return;

            try {
                const res = await apiFetch(`https://notenest-odgc.onrender.com/api/v1/notes/${noteId}`, {
                    method: "DELETE",
                });

                if (!res.ok) throw new Error("Failed to delete note");

                note.remove();
                showToast("success", "Note deleted!");
            } catch (err) {
                console.error(err);
                showToast("error", "Error deleting note.");
            }
        });
    });

    document.querySelectorAll(".pin-icon").forEach(icon => {
        icon.addEventListener("click", async () => {
            const note = icon.closest(".note");
            const noteId = note.dataset.id;

            try {
                const res = await apiFetch(`https://notenest-odgc.onrender.com/api/v1/notes/${noteId}/pin`, {
                    method: "PUT",
                });

                if (!res.ok) throw new Error("Failed to toggle pin");

                loadNotes();
            } catch (err) {
                console.error(err);
                showToast("error", "Error pinning/unpinning note.");
            }
        });
    });
}

function getInitials(name) {
    return name
        .split(" ")
        .map(part => part[0].toUpperCase())
        .join("")
        .slice(0, 2);
}

async function loadUserProfile() {
    try {
        const res = await apiFetch("https://notenest-odgc.onrender.com/api/v1/users/current-user", {
            method: "GET",
        });

        if (!res.ok) throw new Error("Failed to fetch user");

        const data = await res.json();
        const fullName = data.name || "User";

        // Update avatar and dropdown
        document.getElementById("avatar").textContent = getInitials(fullName);
        document.getElementById("profileName").textContent = fullName;
    } catch (err) {
        console.error("Error loading user profile:", err);
        document.getElementById("avatar").textContent = "U";
        document.getElementById("profileName").textContent = "User";
    }
}

window.addEventListener("DOMContentLoaded", () => {
    loadUserProfile(); // loads the name and initials
    loadNotes();
});
