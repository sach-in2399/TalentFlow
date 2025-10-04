# 🚀 TalentFlow: Modern Hiring Platform

TalentFlow is a comprehensive **Single-Page Application (SPA)** designed to streamline the hiring pipeline, allowing users to manage job postings, track candidates, and oversee assessments from a single dashboard.

---

## ✨ Live Application

You can access the live deployed application here:

👉 **[https://talentflow-mtzw.onrender.com/](https://talentflow-mtzw.onrender.com/)**

---

## 📸 Project Screenshots

A quick look at TalentFlow in action:

### Dashboard Overview
<img width="1833" height="983" alt="Screenshot 2025-10-04 154002" src="https://github.com/user-attachments/assets/0e7a35a2-91a6-45f7-867b-b3a2d509ee54" />




### Jobs Management
<img width="1830" height="982" alt="Screenshot 2025-10-04 154016" src="https://github.com/user-attachments/assets/ae53b28e-fbf5-437f-96ce-5ba5677ab470" />




### Candidates Tracking
<img width="1814" height="972" alt="Screenshot 2025-10-04 154028" src="https://github.com/user-attachments/assets/e44be877-2de8-4001-8010-2bf9cf3c56dc" />



---

## ✨ Key Features

* **Job Management:** Create, archive, and view details for all job postings.
* **Candidate Pipeline:** Track candidates through different stages of the hiring process.
* **Assessments:** Link and manage technical assessments per job opening.
* **Client-Side Persistence (Dexie):** All data is stored locally in the browser's IndexedDB, providing a fast, persistent experience without a dedicated backend.
* **Mock API (MSW):** Uses **Mock Service Worker** for development and simulation of network requests.
* **Export to Sheets:** Functionality to export data (via an assumed feature).

---

## 🛠️ Technology Stack

| Technology | Purpose |
| :--- | :--- |
| **Frontend** | React with TypeScript and Vite |
| **Styling** | Tailwind CSS with Shadcn UI components |
| **Database** | Dexie.js (IndexedDB wrapper) for local data persistence |
| **Routing** | React Router DOM |
| **State/Data Fetching** | TanStack Query (`react-query`) |
| **Mocking** | Mock Service Worker (MSW) for API simulation |

---

## 🖥️ Local Development Setup

Follow these steps to get your local development environment running.

### Prerequisites

* Node.js (v18+)
* npm or yarn

### Installation

1.  **Clone the repository:**
    ```bash
    git clone [Your-Repo-URL]
    cd flowstate-talent
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    # or
    # yarn install
    ```
3.  **Start the development server:**
    ```bash
    npm run dev
    # or
    # yarn dev
    ```
    The application will typically be available at `http://localhost:8080` (as configured in your `vite.config.ts`).

### Database Seeding

The application automatically seeds the local IndexedDB using **Dexie.js** and **MSW** upon initial load via `src/main.tsx`, so you will have dummy data available immediately.

---

## 📦 Deployment

This project is configured for deployment as a static site on **Render**.

### Build Command

To create a production-ready build:

```bash
npm run build
# This command generates the optimized static files in the `/dist` directory.
