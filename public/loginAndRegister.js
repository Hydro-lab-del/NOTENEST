
const registerContainer = document.querySelector('.register-container');
const loginContainer = document.querySelector('.login-container');

const showLogin = document.getElementById('show-login');
const showRegister = document.getElementById('show-register');



if (showLogin && showRegister) {
    showLogin.addEventListener('click', () => {
        registerContainer.style.display = 'none';
        loginContainer.style.display = 'flex';

        loginContainer.classList.add('login-themed');

        // Inject heading only if it doesn't already exist
        if (!loginContainer.querySelector('.heading')) {
            const heading = document.createElement('h2');
            heading.innerHTML = 'Welcome to <span class="light-blue">NoteNest</span>';
            heading.className = 'heading';
            loginContainer.prepend(heading);
        }
    });
    showRegister.addEventListener('click', () => {
        registerContainer.style.display = 'flex';
        loginContainer.style.display = 'none';

        // Clean up styling and heading when switching back
        loginContainer.classList.remove('login-themed');
        const heading = loginContainer.querySelector('.welcome-heading');
        if (heading) loginContainer.removeChild(heading);
    });

}



const toggleLoginMsg = () => {
    const loginMsg = document.querySelectorAll('.login-msg');

    if (window.innerWidth > 700) {
        loginMsg.forEach(element => element.classList.add('hide'));
    } else {
        loginMsg.forEach(element => element.classList.remove('hide'));
    }
    if (window.innerWidth <= 700) {
        registerContainer.classList.remove('hide');
        loginContainer.classList.add('hide');
    } else {
        registerContainer.classList.remove('hide');
        loginContainer.classList.remove('hide');


    }
};

window.addEventListener('DOMContentLoaded', toggleLoginMsg);
window.addEventListener('resize', toggleLoginMsg);



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
            window.location.href = "/index.html";
            return;
        }
    }
    return res;
}

// Register
document.getElementById("registerForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const form = e.target;
    const username = form.username.value.trim();
    const email = form.email.value.trim();
    const password = form.password.value.trim();

    const res = await fetch("https://notenest-odgc.onrender.com/api/v1/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, email, password })
    });

    if (res.ok) {
        // Auto-login after register
        window.location.href = "/dashboard.html";
    } else {
        const data = await res.json();
        alert(data.message || "Registration failed!");
    }
});

// Login
document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const form = e.target;
    const email = form.email.value.trim();
    const password = form.password.value.trim();

    const res = await fetch("https://notenest-odgc.onrender.com/api/v1/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password })
    });

    if (res.ok) {
        window.location.href = "/dashboard.html";
    } else {
        alert("Login failed!");
    }
});

// Example dashboard call with auto-refresh
async function loadNotes() {
    const res = await apiFetch("https://notenest-odgc.onrender.com/api/v1/notes");
    if (res && res.ok) {
        const notes = await res.json();
        console.log(notes);
    }
}

// Call loadNotes on dashboard load
if (window.location.pathname.includes("dashboard.html")) {
    loadNotes();
}
