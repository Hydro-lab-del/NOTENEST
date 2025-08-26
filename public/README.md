# 📒 NoteNest Frontend

This is the **frontend** of **NoteNest**, a modern note-taking web application built with **HTML, CSS, and JavaScript**.  
It interacts with the backend through a **secure cookie-based authentication flow**.

---

## ✨ Features

### 🔐 Authentication
- User **registration** and **login**  
- Secure session handling with **httpOnly cookies**  
- Automatic redirect to login when unauthorized  

### 📝 Dashboard
- Personalized dashboard after login  
- Fetches and displays user data via API  
- Logout functionality that clears session  

### ⚡ API Integration
- All requests use `fetch` with `credentials: "include"`  
- No manual token handling in the frontend  
- Handles `401 Unauthorized` by redirecting to login  

### 🎨 UI
- Responsive layout with clean design  
- Toast notifications for success/error feedback  

---

## 🛠️ Tech Stack
- **HTML5**  
- **CSS3**  
- **Vanilla JavaScript (ES6+)**  
- **Cookie-based Auth** (httpOnly, Secure, SameSite)  
- Works with backend powered by **Express.js** (separate repo)  

---

## 🚀 Getting Started

### 1. Clone the repo
```bash
git clone https://github.com/Hydro-lab-del/NOTENEST-Frontend
cd notenest-frontend
```

### 2. Serve locally
You can use any local dev server. Example with VS Code:  
- Install the [Live Server extension](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer)  
- Right-click `index.html` → **Open with Live Server**  

Or use:
```bash
npx serve
```

### 3. Backend setup
Make sure your backend is running (default:  
`https://notenest-y8ld.onrender.com` or your local setup).  

### 4. Environment
The frontend fetches from the backend API.  
Update API URLs in `dash.js`, `login.js`, and `register.js` if deploying under a different domain.  

---

## 📂 Project Structure

```
notenest-frontend/
├── index.html        # Landing page
├── login.html        # Login page
├── register.html     # Register page
├── dashboard.html    # User dashboard
├── dash.js           # Dashboard logic
├── login.js          # Login logic
├── register.js       # Register logic
├── style.css         # Global styles
└── README.md         # Project docs
```

---

## 🔑 Authentication Flow
1. User logs in/registers → backend sets **secure httpOnly cookies** (access + refresh tokens).  
2. Frontend makes API calls with:
   ```js
   fetch(url, { credentials: "include" });
   ```
3. If cookie expires → backend auto-refreshes or returns `401`.  
4. Frontend handles `401` by redirecting to login.  

---

## 🌍 Deployment
You can deploy the frontend for free on:  
- **Cloudflare Pages** (recommended for same-domain auth with backend)  
- **Vercel / Netlify** (may require backend proxy configs)  

---

## 📌 Next Steps
- Add **notes CRUD UI** (create, edit, delete notes)  
- Improve **mobile responsiveness**  
- Add **dark mode toggle**  
