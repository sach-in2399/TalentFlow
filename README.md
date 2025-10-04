# 🚀 TalentFlow: Modern Hiring Platform

TalentFlow is a comprehensive **Single-Page Application (SPA)** designed to streamline the hiring pipeline, allowing users to manage job postings, track candidates, and oversee assessments from a single dashboard.

---

## ✨ Live Application

You can access the live deployed application here:

👉 **[https://talentflow-mtzw.onrender.com/](https://talentflow-mtzw.onrender.com/)**

---


## ✨ Key Features

* **Job Management:** Create, archive, and view details for all job postings.
* **Candidate Pipeline:** Track candidates through different stages of the hiring process.
* **Assessments:** Link and manage technical assessments per job opening.
* **Client-Side Persistence (Dexie):** All data is stored locally in the browser's IndexedDB, providing a fast, persistent experience without a dedicated backend.
* **Mock API (MSW):** Uses **Mock Service Worker** for development and simulation of network requests.
* **Export to Sheets:** Functionality to export data (implicitly added from your request).

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
* npm

### Installation

1.  **Clone the repository:**
    ```bash
    git clone [Your-Repo-URL]
    cd flowstate-talent
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Start the development server:**
    ```bash
    npm run dev
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
