
// Tab & form switching
const loginTab = document.getElementById("loginTab");
const registerTab = document.getElementById("registerTab");
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const switchToRegister = document.getElementById("switchToRegister");
const switchToLogin = document.getElementById("switchToLogin");

function showLogin() {
    loginTab.classList.add("active");
    registerTab.classList.remove("active");
    loginForm.classList.add("active");
    registerForm.classList.remove("active");
}
function showRegister() {
    registerTab.classList.add("active");
    loginTab.classList.remove("active");
    registerForm.classList.add("active");
    loginForm.classList.remove("active");
}

loginTab.addEventListener("click", showLogin);
registerTab.addEventListener("click", showRegister);
switchToRegister.addEventListener("click", showRegister);
switchToLogin.addEventListener("click", showLogin);

// API helpers
async function apiFetch(url, options = {}, retry = true) {
    const res = await fetch(url,
        {
            ...options,
            credentials: "include"
        });
    // If unauthorized (token expired) and retry allowed
    if (res.status === 401 && retry) {
        const refreshRes = await fetch("/api/v1/users/refresh-token",
            {
                method: "POST",
                credentials: "include"
            });
        if (refreshRes.ok) return apiFetch(url, options, false);
        else { window.location.href = "/index.html"; return; }
    }
    return res;
}

// Register
registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const form = e.target;
    const username = form.username.value.trim();
    const email = form.email.value.trim();
    const password = form.password.value.trim();

    const res = await fetch("/api/v1/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, email, password })
    });
    if (res.ok) window.location.href = "/dashboard.html";

    else alert("Registration failed!");
});

// Login
loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
     const form = e.target;
    const email = form.email.value.trim();
    const password = form.password.value.trim();
    
    const res = await fetch("/api/v1/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password })
    });
    if (res.ok) window.location.href = "/dashboard.html";
    else alert("Login failed!");
});
