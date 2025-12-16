# Global Fitness AI

Your personalized, AI-powered fitness companion.

## Setup Instructions

### 1. API Keys
This application relies on Google Gemini (for AI features) and Firebase (for database/auth). 

**Do not commit your API keys to GitHub.**

Create a file named `.env` in the root directory and add your keys:

```env
# Google Gemini API
API_KEY=your_gemini_key_here

# Firebase Configuration
FIREBASE_API_KEY=your_firebase_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id
```

### 2. Run the App
Install dependencies and run the development server (depending on your build tool, e.g., Vite, Parcel, or CRA).

```bash
npm install
npm run dev
```
