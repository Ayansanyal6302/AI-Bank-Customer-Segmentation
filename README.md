# AI Bank Customer Segmentation

A modern full-stack web application designed for banking customer segmentation using **K-Means clustering**. The project utilizes a **FastAPI** backend for machine learning processing and data storage, and a responsive **React (Vite + Tailwind CSS)** dashboard for data visualization and interaction.

## Features

- 📁 **CSV Upload & Dataset Preview**: Upload any banking customer dataset (CSV format) and view a preview of the data.
- 📈 **Elbow Method (Optimal K) Chart**: Automatically computes and plots Within-Cluster Sum of Squares (WCSS) to guide selection of the optimal number of clusters ($k$).
- 🎛️ **Interactive Clustering Control**: Adjust $k$ from 2 to 10 dynamically and see the results update instantly.
- 📊 **Segment & Scatter Visualizations**: Visualize segment distribution (bar chart) and view a sampled scatter plot of clusters.
- 💡 **AI Business Insights & Segment Persona**: Automatically analyzes the segments and generates descriptions (e.g. *Premium Customers*, *Saver Customers*, *Careless Spenders*, *Budget Customers*) alongside average metrics.
- 📥 **CSV Export**: Export the clustered dataset containing the assigned cluster labels back to CSV.
- 💾 **SQLite & MySQL Database Support**: Saves sessions locally, with an automatic fallback to SQLite (`fallback.db`) if MySQL is not running.

---

## Project Structure

```
AI-Bank-Customer-Segmentation/
├── backend/
│   ├── main.py              # FastAPI application server & routes
│   ├── database.py          # SQLAlchemy session setup & SQLite/MySQL fallback
│   ├── models.py            # Database schemas for AnalysisSessions
│   ├── schemas.py           # Pydantic validation schemas
│   └── ml_utils.py          # Preprocessing, WCSS, and K-Means clustering logic
├── frontend/
│   ├── src/
│   │   ├── components/      # UI components (UploadSection, DashboardSection)
│   │   ├── App.jsx          # Main application component & layout
│   │   ├── index.css        # Tailwind CSS imports & theme overrides
│   │   └── main.jsx         # React application entrypoint
│   └── package.json         # Node dependencies & scripts
├── requirements.txt         # Python dependencies
├── generate_sample_data.py  # Script to generate a dummy dataset for testing
└── sample_bank_customers.csv# Generated test customer dataset
```

---

## Quick Start (How to Run)

Follow these steps to run both the backend API and the frontend client locally.

### Prerequisites
Make sure you have the following installed:
- **Python** (version 3.9 or higher)
- **Node.js** (version 18 or higher)
- (Optional) **MySQL** server. If MySQL is not running or credentials are not configured, the app will automatically fall back to a local SQLite database (`fallback.db`).

---

### Step 1: Set up and Run the Backend API

1. Navigate to the root directory (or `backend/` directory) and install the Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Start the backend development server using Uvicorn:
   ```bash
   cd backend
   python -m uvicorn main:app --reload --port 8000
   ```
   *The server will start at `http://127.0.0.1:8000`.*

---

### Step 2: Set up and Run the Frontend Dashboard

1. Open a new terminal window, navigate to the `frontend/` directory, and install the npm packages:
   ```bash
   cd frontend
   npm install
   ```

2. Start the Vite React development server:
   ```bash
   npm run dev
   ```
   *The client will start at `http://localhost:5173/`.*

---

### Step 3: Test with the Sample Dataset

To verify the setup:
1. Open your browser and navigate to `http://localhost:5173/`.
2. Locate the generated [sample_bank_customers.csv](sample_bank_customers.csv) in the root of the project (if you don't have it, run `python generate_sample_data.py` to regenerate it).
3. Upload `sample_bank_customers.csv` on the frontend upload page.
4. Click **Analyze Data**. The dashboard will display the Elbow chart.
5. Click **Run Clustering** to see customer segments, scatter plots, and the AI-generated business insights.
