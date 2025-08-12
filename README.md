# ALTOR - Your Personal AI Learning Companion

![ALTOR Main Dashboard](https://github.com/salmanhussain25/Altor/blob/main/MainDashBoard.jpg) <!-- It's a good practice to add a real screenshot here -->
![ALTOR Course 3D Dashboard](https://github.com/salmanhussain25/Altor/blob/main/Altor4.8Dashboard.jpg) <!-- It's a good practice to add a real screenshot here -->
![ALTOR Course 2D Dashboard](https://github.com/salmanhussain25/Altor/blob/main/SkillsectionDashboard.jpg) <!-- It's a good practice to add a real screenshot here -->
**ALTOR** is an advanced, AI-powered web application designed to be a personal and interactive learning companion. It leverages the Google Gemini API to create dynamic, multilingual educational experiences tailored to your needs. Whether you want to learn a new programming language, prepare for a job interview, or get instant help with a coding problem, ALTOR provides the tools to guide you.

---

## ✨ Core Features

-   **🤖 Personalized Course Creation:** Instantly generate custom-tailored courses on any subject. Just type what you want to learn, and ALTOR's AI will create a structured curriculum with topics, descriptions, and points.
-   **🎓 Interactive Micro-Lessons:** Learn through bite-sized, engaging steps that include clear explanations, multiple-choice questions to test understanding, and hands-on coding tasks.
-   **✨ Dynamic & Interactive AI Animations:** To make complex topics easier to understand, ALTOR's AI generates live, interactive animations on the whiteboard. These p5.js-powered visual aids are created on-the-fly and may include interactivity (like responding to your mouse movements) and **synthesized sound effects** to provide a more immersive and accurate representation of the concept being taught.
-   **💡 Instant Doubt Solver:** Stuck on a programming problem? Paste your code, write your question, or even upload a screenshot. ALTOR will provide a step-by-step explanation and the correct code solution.
-   **👔 Realistic Interview Preparation:** Simulate a multi-round job interview for any role and company. The AI acts as different interviewers (technical, behavioral, HR), asking relevant questions based on your CV and the job description.
-   **📚 AI-Powered Research Library:** Enter any topic, and ALTOR will use Google Search to find high-quality sources, synthesize the information, and build a complete presentation with summaries, slides, and source links.
-   **🌐 Community Hub:** Share the courses you create with the community and discover courses made by other users. Rate content and learn together.
-   **🕹️ Gamified Progress Tracking:** Stay motivated with a points system, daily streaks, achievement badges, and downloadable certificates of completion for every course you finish.
-   **🗣️ Multilingual & Voice-Enabled:** Interact with the application in multiple languages. Use your voice to answer questions and chat with your AI tutor, with support for both speech-to-text and text-to-speech.

---

## 🚀 Getting Started

Using ALTOR is simple and intuitive. Here’s how you can begin your learning journey:

### 1. Sign Up
-   On the welcome screen, choose **Sign Up**.
-   Enter your **name** and a **4-digit PIN**. This PIN will be used to log in and to confirm important actions, like deleting a course.

### 2. The Dashboard
After logging in, you'll see the main dashboard. It's your central hub for accessing all of ALTOR's features.

The dashboard has four main tabs:
-   **My Courses:** Create new learning experiences or continue your existing courses.
-   **Hub:** Explore and add courses created by other members of the ALTOR community.
-   **My Progress:** View your stats, including points, streaks, earned badges, and certificates.
-   **Friends:** Manage AI friends and track "Quests" (requests for new courses).

### 3. Choosing a Learning Mode

From the **My Courses** tab, you can start a new session in one of four powerful modes:

#### 🎓 Learn a New Skill (Tutor Mode)
This is the core learning mode for guided lessons.
1.  Click **"Learn a New Skill"**.
2.  In the input field, type what you want to learn (e.g., "JavaScript for beginners", "Advanced CSS Flexbox").
3.  Adjust the **Course Complexity** (Beginner, Intermediate, Advanced) and **Course Length**.
4.  Click **"Ask ALTOR"** to have the AI instantly generate a course outline.
5.  Review the topics. If you're happy with it, click **"Create Course & Start"**.
6.  Your new course will appear on the dashboard. Click it to begin your first lesson!

#### 📚 Research a Topic (Library Mode)
Use the AI to research a topic and build a course from its findings.
1.  Click **"Library"**.
2.  Enter the topic you want to research (e.g., "The history of quantum computing").
3.  Click **"Build Course"**. The AI will search the web, read sources, and generate a course with summaries, presentation slides, and a list of all sources used.

#### 👔 Prepare for an Interview
Simulate a realistic, multi-round job interview.
1.  Click **"Interview Prep"**.
2.  Fill in the **Role**, **Company** (optional), and your **Experience Level**.
3.  **Paste your CV text or upload a file** (PDF, DOCX, TXT). Providing your CV allows the AI to ask highly relevant questions about your experience.
4.  Click **"Start Interview"**. The AI will create a complete interview plan with multiple rounds (e.g., Behavioral, Coding Challenge, System Design) and different interviewers.

#### 💡 Solve a Doubt
Get immediate help with a specific programming problem.
1.  Click **"Solve a Doubt"**.
2.  You'll be taken to the Doubt Solver interface.
3.  **Type or paste** your problem statement and code into the text area, or switch to the **upload tab** to provide a screenshot.
4.  Click **"Solve It"**. The AI will analyze your problem and provide a detailed explanation, solution code, and an interactive animation on the whiteboard.

---

## 🔧 Technology Stack

-   **Frontend:** React, TypeScript, Tailwind CSS
-   **AI Engine:** Google Gemini API (`@google/genai`)
-   **Code Editor:** CodeMirror
-   **Animations:** p5.js (AI-generated sketches) with p5.sound.js
-   **Speech APIs:** Web Speech API (SpeechRecognition and SpeechSynthesis)
-   **State Management:** React Hooks (`useState`, `useEffect`, `useContext`) and `useLocalStorage` for persistence.
-   **Build Tool:** Vite
