# NutriHealth AI

## AI-Powered Nutrition Intelligence System for Health Assessment and Personalized Diet Recommendations

NutriHealth AI is a web-based application that helps users manage their health profiles, track daily food intake, assess nutritional deficiency risks, and receive personalized diet recommendations using machine learning.

## Features

- User Registration and Login
- Health Profile Management
- Food Diary and Meal Tracking
- Nutritional Information Analysis
- Nutritional Deficiency Risk Assessment
- Machine Learning-Based Predictions
- Personalized Diet Recommendations

## Technologies Used

**Frontend**
- React
- TypeScript
- Vite
- HTML
- CSS

**Machine Learning and API**
- Python
- FastAPI
- Scikit-learn
- Joblib

**Database and Authentication**
- Supabase

## Machine Learning Model

The project includes a Multi-Label Random Forest model designed to assess nutritional deficiency risks using health-related and nutritional data.

## Project Structure

- `src/` – Frontend application
- `ml-service/src/` – Machine learning service and API
- `ml-service/models/` – Trained machine learning models
- `ml-service/data/processed/` – Processed datasets and analysis results

## **Installation and Setup**

### **1. Clone the Repository**

```bash
git clone https://github.com/Kavya-mukthapuram/NutriHealth-AI.git
cd NutriHealth-AI
```

### **2. Install Frontend Dependencies**

Install the required Node.js packages:

```bash
npm install
```

### **3. Start the Frontend**

Run the development server:

```bash
npm run dev
```

Open the local URL displayed in your terminal to access the application.

### **4. Install Machine Learning Service Dependencies**

Navigate to the ML service directory:

```bash
cd ml-service
```

Create a Python virtual environment:

```bash
py -m venv venv
```

Activate the virtual environment on Windows:

```powershell
.\venv\Scripts\Activate
```

Install the required Python packages:

```bash
pip install -r requirements.txt
```

### **5. Run the Machine Learning API**

Start the FastAPI service:

```bash
uvicorn src.api:app --reload
```

**API URL:**

```text
http://127.0.0.1:8000
```

**Interactive API Documentation:**

```text
http://127.0.0.1:8000/docs
```

## **Author**

**M. Kavya**

## **Disclaimer**

This project is intended for educational and informational purposes only. Its results should not replace professional medical advice, diagnosis, or treatment.
