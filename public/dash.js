// --- Elements
const profileWrap = document.getElementById('profileWrap');
const avatarBtn = document.getElementById('avatarBtn');
const dropdown = document.getElementById('dropdown');
const avatarImg = document.getElementById('avatarImg');
const largeImg = document.getElementById('largeImg');
const fileInput = document.getElementById('fileInput');
const logoutBtn = document.getElementById('logoutBtn');
const updateInfoBtn = document.getElementById('updateInfoBtn');
const toastEl = document.getElementById('toast');

// --- Small toast
function toast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.add('show');
  setTimeout(() => toastEl.classList.remove('show'), 1800);
}

// --- Dropdown toggle
function openDropdown() {
  dropdown.classList.add('show');
  avatarBtn.setAttribute('aria-expanded', 'true');
}
function closeDropdown() {
  dropdown.classList.remove('show');
  avatarBtn.setAttribute('aria-expanded', 'false');
}
function toggleDropdown() {
  dropdown.classList.contains('show') ? closeDropdown() : openDropdown();
}

avatarBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  toggleDropdown();
});

dropdown.addEventListener('click', (e) => e.stopPropagation());
document.querySelector('.edit-overlay').addEventListener('click', (e) => e.stopPropagation());

window.addEventListener('click', (e) => {
  if (!profileWrap.contains(e.target)) {
    closeDropdown();
  }
});

// --- Image preview
fileInput.addEventListener('change', async () => {
  const f = fileInput.files?.[0];
  if (!f) return;

  // --- Local Preview
  const url = URL.createObjectURL(f);
  avatarImg.src = url;
  largeImg.src = url;
  toast('Preview updated');

  // --- Upload to Server
  const formData = new FormData();
  formData.append("profilePic", f);

  try {
    const response = await apiFetch("/api/v1/users/upload-profile-pic", {
      method: "POST",
      credentials: "include", // important for cookies
      body: formData
    });

    const result = await response.json();

    if (response.ok) {
      toast("Profile picture uploaded successfully");
      console.log("Updated user:", result.data);
    } else {
      toast(result.message || "Upload failed");
    }
  } catch (error) {
    console.error("Upload error:", error);
    toast("Something went wrong during upload");
  }
});

// --- Logout
logoutBtn.addEventListener("click", async () => {
  try {
    const response = await apiFetch("/api/v1/users/logout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    if (response.ok) {
      toast('Logged out');
      setTimeout(() => { window.location.href = '/'; }, 700);
    } else {
      toast("Logout failed. Please try again.");
    }
  } catch (error) {
    toast("Something went wrong.");
  }
});

// --- Add note
const addBtn = document.querySelector(".add-btn");
const noteForm = document.getElementById("noteForm");

function toggleForm() {
  noteForm.classList.toggle("show");
}
addBtn.addEventListener("click", toggleForm);

// --- API wrapper with refresh handling
async function apiFetch(url, options = {}, retry = true) {
  const res = await fetch(url, {
    ...options,
    credentials: "include"
  });

  if (res.status === 401 && retry) {
    console.warn("Access token expired, trying refresh...");
    const refreshRes = await fetch("/api/v1/users/refresh-token", {
      method: "POST",
      credentials: "include"
    });

    if (refreshRes.ok) {
      return apiFetch(url, options, false);
    } else {
      console.warn("Refresh failed, redirecting to login...");
      window.location.href = "/index.html";
      return;
    }
  }
  return res;
}

// --- Create Note
noteForm.addEventListener("submit", async function (e) {
  e.preventDefault();
  const title = e.target.title.value.trim();
  const content = e.target.content.value.trim();

  if (!title || !content) {
    toast("Both title and content are required.");
    return;
  }

  try {
    const response = await apiFetch("/api/v1/notes/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content }),
    });

    if (response.ok) {
      e.target.reset();
      toggleForm();
      toast("Note created successfully!");
      loadNotes();
    } else {
      toast("Failed to create note.");
    }
  } catch (error) {
    console.error(error);
    toast("Error creating note.");
  }
});

// --- Load Notes
async function loadNotes() {
  try {
    const response = await apiFetch("/api/v1/notes", { method: "GET" });
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
        </div>`;
      notesContainer.appendChild(noteElement);
    });
    attachNoteActions();
  } catch (error) {
    console.error("Error loading notes:", error);
    toast("Could not load notes. Please try again.");
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
          const res = await apiFetch(`/api/v1/notes/${noteId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title: updatedTitle, content: updatedContent })
          });

          if (!res.ok) throw new Error("Failed to update note");

          toast("Note updated!");
          loadNotes();
        } catch (err) {
          console.error(err);
          toast("Error updating note.");
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
        const res = await apiFetch(`/api/v1/notes/${noteId}`, {
          method: "DELETE",
        });

        if (!res.ok) throw new Error("Failed to delete note");

        note.remove();
        toast("Note deleted!");
      } catch (err) {
        console.error(err);
        toast("Error deleting note.");
      }
    });
  });

  document.querySelectorAll(".pin-icon").forEach(icon => {
    icon.addEventListener("click", async () => {
      const note = icon.closest(".note");
      const noteId = note.dataset.id;

      try {
        const res = await apiFetch(`/api/v1/notes/${noteId}/pin`, {
          method: "PUT",
        });

        if (!res.ok) throw new Error("Failed to toggle pin");

        loadNotes();
      } catch (err) {
        console.error(err);
        toast("Error pinning/unpinning note.");
      }
    });
  });
}

// --- Update Info Form
const overlay = document.getElementById("updateFormOverlay");
const cancelBtn = document.getElementById("cancelBtn");
const updateForm = document.getElementById("updateForm");

updateInfoBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  closeDropdown();
  overlay.classList.remove("hidden");
});

cancelBtn.addEventListener("click", () => {
  overlay.classList.add("hidden");
});

updateForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const username = document.getElementById("username").value.trim();
  const email = document.getElementById("email").value.trim();

  try {
    const res = await apiFetch("/api/v1/users/update-account", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email })
    });

    if (!res.ok) throw new Error("Failed to update account");
    toast("Updated!");
    overlay.classList.add("hidden");
    updateForm.reset();
  } catch (err) {
    console.error(err);
    toast("Error updating account.");
  }
});

// --- Populate user info
(async () => {
  try {
    const res = await apiFetch("/api/v1/users/current-user", {
      method: "GET"
    });
    if (res.ok) {
      const result = await res.json();
      const data = result.data; // your ApiResponse wraps it
      document.getElementById('userName').textContent = data.username || 'User';
      document.getElementById('userEmail').textContent = data.email || '';
    }
  } catch (error) {
    console.error('Failed to fetch user data:', error);
  }
})();

// --- Init
window.addEventListener("DOMContentLoaded", () => {
  loadNotes();
});
