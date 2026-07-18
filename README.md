
CampusOS: Faculty Administration & Student Analytics Dashboard
CampusOS is a clean, bright, and professional academic administration portal designed for university department heads, professors, and academic advisors. The system replaces fragmented spreadsheets and flat PDF rosters with a unified full-stack application supporting student directories, grading registers, notice boards, interactive 2D geospatial campus maps, and Gemini-based performance analytics.

🚀 Key Features
Faculty-Centric User Interface: Overhauled with a bright, high-contrast visual design (slate-50 background, white glassmorphic panels, and deep indigo accents) styled in the premium Plus Jakarta Sans typography.
Automated Roster Ingestion: An intelligent parsing and seeding script (seed_from_pdf.py) utilizing pypdf to automatically ingest class student PDF lists, compile academic profiles, and seed the database.
Interactive 2D Floor blueprint Map: A layered layout viewer supporting 5 floor blueprints (Ground Floor to 4th Floor). Users can select floors, hover/click rooms to view spatial metadata, and auto-load coordinates into administrative forms.
Integrated Grades & Faculty Directories: Dedicated registry portals for recording student academic marks (GPA/grades) and managing department advisor files.
AI Academic Advisor: Integrates with the Google AI model gemma-4-26b-a4b-it using RAG (Retrieval-Augmented Generation) to analyze database student statistics (attendance warnings, GPA levels, tuition statuses) and answer questions in natural language.
🛠️ Technology Stack
Frontend: React 19 (TypeScript), Vite, Tailwind CSS, Axios, Google Fonts.
Backend: FastAPI (Python), Uvicorn, SQLAlchemy ORM, Pydantic, psycopg2.
Database: PostgreSQL Relational Database.
AI Engine: Gemini (gemma-4-26b-a4b-it model via Google GenAI SDK).
PDF Processing: pypdf.
📂 Project Directory Structure
campusos-workspace/
├── backend/                  # FastAPI Python Backend
│   ├── database.py           # PostgreSQL database connection setup
│   ├── models.py             # SQLAlchemy DB schemas (Student, Grade, Faculty, etc.)
│   ├── main.py               # API endpoints, CORS, Pydantic validators, AI integrations
│   ├── seed_from_pdf.py      # PDF parsing and DB seeding script
│   └── requirements.txt      # Python dependencies
│
├── frontend/                 # React Vite Frontend
│   ├── src/
│   │   ├── App.tsx           # Monolithic UI rendering and state controllers
│   │   ├── main.tsx          # React application entrypoint
│   │   └── index.css         # Tailwind directives
│   ├── package.json          # npm scripts and package configurations
│   ├── vite.config.ts        # Vite compiler configurations
│   └── index.html            # Loads fonts and page root container
│
└── campusos-workspace/
    └── Files/                # Data storage directory
        ├── S2 G 2025.pdf     # Student class list
        └── cec_spatial_map_and_directory.pdf # Floor map schemas
        💻 Local Development Setup
1. Prerequisites
Ensure you have the following installed locally:

Python 3.10+
Node.js 18+
PostgreSQL Database
2. Database Setup
Create a local database named campusos_db in PostgreSQL.
Ensure you have the database username and password ready. The default connection URL is configured in backend/database.py:
DATABASE_URL = "postgresql://postgres:27062006@localhost:5432/campusos_db"
3. Backend Setup
Open your terminal and navigate to the backend/ director
cd backend
Create and activate a Python virtual environmen
python -m venv venv
.\venv\Scripts\Activate.ps1
Install the required Python packages:
pip install -r requirements.txt
Set your Google Gemini API key as an environment variable:
# Windows PowerShell
$env:GEMINI_API_KEY="your-gemini-api-key-here"
Run the database seeder to parse the roster PDF and populate the tables
python seed_from_pdf.py
Start the FastAPI development server:
uvicorn main:app --reload --port 8000
The backend will be running at http://127.0.0.1:8000.
4. Frontend Setup
Open a new terminal window and navigate to the frontend/ directory:
cd frontend
Install npm dependencies
npm install
Launch the Vite development server
npm run dev
Access the dashboard in your browser at http://localhost:5173.



🌐 Production Cloud Deployment Guide
To deploy the entire full-stack application online:

1. Host the Database and Backend on Render.com
PostgreSQL: Create a new PostgreSQL database on Render and copy the External Database URL.
FastAPI Service: Create a new Web Service, connect your GitHub repository, and configure:
Root Directory: backend
Build Command: pip install -r requirements.txt
Start Command: uvicorn main:app --host 0.0.0.0 --port $PORT
Environment Variables:
DATABASE_URL = (Your Render database connection URL)
GEMINI_API_KEY = (Your Gemini API Key)
2. Host the React Frontend on Vercel
Open your local frontend/src/App.tsx and change the API connection URLs from http://127.0.0.1:8000 to your live Render backend URL.
Commit and push the changes to GitHub.
Go to Vercel.com, connect your repository, and set the Root Directory to frontend. Click Deploy!
