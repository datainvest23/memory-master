# Memory-Master_PRD v1

Below is a **comprehensive Product Requirements Document (PRD)** tailored for a **non-expert developer** using **Cursor** (AI code editor) and deploying to **Vercel**. It emphasizes **practical steps** with an **organized folder structure**, **key integrations**, and **detailed user flows**. You can use this as your roadmap to build a functional MVP.

---

# 1. Product Overview

## 1.1 Product Name (Working Title)

**Tägliche Gedächtnis-Challenge** (Daily Memory Challenge)

## 1.2 Purpose & Summary

A cross-platform (web + mobile-responsive) app aimed at seniors for **daily cognitive training**. The app:

1. **Adapts** question difficulty based on the user's reported mood (sad, neutral, happy).
2. Offers **morning** and **evening** sessions to reinforce memory (e.g., a 3-word prompt in the morning, recall in the evening).
3. Focuses on **accessibility** (large fonts, clear buttons, audio prompts).
4. Stores data and handles user authentication via **Supabase**.
5. Generates **daily reports** with scoring and user activity logs.

## 1.3 Goals & Scope

- **Goal A**: Provide a simple, engaging cognitive workout accessible to seniors.
- **Goal B**: Track user progress (scores, mood, daily exercises) to encourage consistency.
- **Goal C**: Allow family members or caregivers to add **custom questions** (e.g., personal trivia or photos).
- **In Scope**:
    - Mood selection at login.
    - Adaptive question difficulty (3 levels).
    - Multiple categories (Math, Geography, Memory Game, Logic, Vocabulary, Trivia).
    - Morning/evening flow with memory prompt.
    - Authentication, data storage, and daily reporting via Supabase.
    - Basic text-to-speech and potential voice input (browser or platform APIs).
- **Out of Scope (for MVP)**:
    - Advanced gamification (badges, leaderboards).
    - Multi-language support beyond German.
    - Complex analytics dashboards for family members (only basic custom content and progress views).

---

# 2. Technical Stack & Tools

- **Frontend Framework**:
    - **React** or **Next.js** (recommended for easy deployment on Vercel).
    - **React** if you want a classic Single-Page Application approach.
    - **Next.js** if you want server-side rendering (SSR) and simpler Vercel integration.
- **Backend & Database**:
    - **Supabase** for:
        - **User authentication** (email/password).
        - **Database** to store questions, user activity, custom content.
        - **API** for real-time or row-level security (optional advanced usage).
- **Hosting & Deployment**:
    - **Vercel** for quick and efficient deployments of React or Next.js apps.
- **AI Code Editor**:
    - **Cursor** to assist in code generation and refactoring.
- **Audio Integration** (Optional for MVP—can be phased in):
    - **Text-to-Speech (TTS)**: Use the browser's native TTS API or a third-party library.
    - **Voice Input**: Explore the browser's Speech Recognition API, or a service like Azure, Google, or a ChatGPT plugin if available.
    - **ChatGPT**: Potential future expansion for generating new quiz content or more advanced voice interactions.

---

# 3. High-Level User Flows

Below are the **primary flows**. For each, we'll indicate which pages/components you may need.

1. **User Registration & Login**
    1. User visits the **Login/Register** page.
    2. Enters email/password.
    3. Data is sent to **Supabase** for authentication.
    4. On success, user is redirected to **Mood Selection**.
2. **Mood Selection (Morning)**
    1. User selects their mood: **Sad**, **Neutral**, or **Happy**.
    2. App adjusts question difficulty and quantity accordingly.
    3. Data (mood, timestamp) is stored in **Supabase**.
3. **Category Selection & Exercises**
    1. User chooses categories (Math, Geography, Memory Game, etc.).
    2. **App retrieves questions** from Supabase based on difficulty, category, or custom tags.
    3. User completes exercises (multiple-choice, memory flip game, or input-based).
    4. **Score & answers** are logged in Supabase.
4. **Memory Prompt (Morning → Evening)**
    1. Morning: User inputs a short phrase (e.g., 3 words).
    2. Stored in Supabase under "daily memory prompt."
    3. Evening: App prompts user to recall.
    4. Correctness is logged (pass/fail or partial score).
5. **Evening Session & Daily Report**
    1. User logs in again or clicks on "Evening Session."
    2. Asked to recall morning's prompt.
    3. Optional additional short quizzes.
    4. App displays a **Daily Report**:
        - Questions answered correctly/incorrectly.
        - Mood.
        - Any custom messages/encouragement.
6. **Family/Custom Content (Optional MVP Feature)**
    1. Family member logs in with appropriate permissions.
    2. Creates or edits **custom trivia** or personal questions (e.g., "Which family member is in this photo?").
    3. These appear in the user's daily set the next day or on demand.

---

# 4. Database Schema (Supabase)

A simplified schema with essential tables:

### 4.1 `users`

| Column | Type | Description |
| --- | --- | --- |
| `id` | UUID (PK) | Unique user identifier (managed by Supabase). |
| `email` | text | User email (authentication). |
| `password` | text | Stored securely by Supabase (hashed). |
| `created_at` | timestamp | Account creation date. |
| `role` | text | e.g., "user" or "family_admin". |

### 4.2 `questions`

| Column | Type | Description |
| --- | --- | --- |
| `id` | serial (PK) | Auto-increment question ID. |
| `category` | text | e.g., "Math", "Geography", "Memory", etc. |
| `question_text` | text | The question prompt. |
| `options` | text[] | Array of possible answers (if multiple choice). |
| `correct_answer` | text | The correct answer (if multiple choice). |
| `difficulty` | integer | 1 = easy, 2 = medium, 3 = hard. |
| `tag` | text | Optional for advanced filtering. |
| `explanation` | text | (Optional) Extra info or hints. |
| `created_by` | UUID | Links to `users.id` if custom question. |

### 4.3 `user_activity`

| Column | Type | Description |
| --- | --- | --- |
| `id` | serial PK | Auto-increment record ID. |
| `user_id` | UUID | Links to `users.id`. |
| `question_id` | integer | Links to `questions.id` if relevant. |
| `mood` | text | (Optional) "sad", "neutral", "happy" at time of answering. |
| `score` | integer | e.g., 0 or 1 for correct/incorrect, or points for more detail. |
| `timestamp` | timestamp | Time the user answered the question. |
| `session_type` | text | e.g., "morning" or "evening". |

### 4.4 `memory_prompts`

| Column | Type | Description |
| --- | --- | --- |
| `id` | serial PK | Auto-increment record ID. |
| `user_id` | UUID | Links to `users.id`. |
| `prompt_text` | text | The 3 words (or short sentence). |
| `created_at` | timestamp | Timestamp (morning). |
| `recalled_text` | text | The user's evening attempt at recall. |
| `recall_score` | integer | Score (e.g., 0 = incorrect, 1 = correct). |
| `checked_at` | timestamp | Timestamp (evening). |

---

# 5. Detailed Features & Components

## 5.1 Mood-Based Adaptive Difficulty

- **Frontend**:
    - **MoodSelection** component: Three large buttons (sad, neutral, happy).
    - On selection, store mood in a global state (e.g., Redux or React Context) and in Supabase.
- **Backend Logic**:
    - If `mood` = "sad", fetch fewer or simpler questions (`difficulty`=1).
    - If `mood` = "neutral", fetch moderate difficulty (`difficulty`=2).
    - If `mood` = "happy", fetch more/harder questions (`difficulty`=3).

## 5.2 Category Selection & Quiz

- **Frontend**:
    - **CategorySelector**: 
        - Large, high-contrast buttons with icons for each category
        - Maximum of 4 categories visible at once to avoid overwhelming users
        - Optional voice prompts reading category names
    - **QuizPage**: 
        - One question displayed at a time
        - Progress indicator (e.g., "Question 2 of 5")
        - Clear "Next" and "Previous" navigation buttons
        - Optional hint system for difficult questions
        - Built-in breaks every 3-4 questions
    - Automatic scoring and activity logging
- **Backend Query**:
    - Query `questions` where:
        - `category IN [selectedCategories]`
        - `difficulty = moodDifficultyLevel`
        - `created_at >= CURRENT_DATE - INTERVAL '7 days'` (to avoid repetition)
    - Limit questions per category (2-3 for sad mood, 3-4 for neutral, 4-5 for happy)
    - Randomize selection within constraints

## 5.3 Memory Prompt (Morning/Evening)

- **Frontend**:
    - **MorningPrompt**: Text input for the user's 3 words. Save to `memory_prompts`.
    - **EveningRecall**: Input field prompting user to recall. Compare with stored text.
- **Logic**:
    - A simple string comparison or partial match.
    - Save result (`recall_score`) to `memory_prompts`.

## 5.4 Reporting & Scoring

- **Daily Report**:
    - Summarize total questions answered, correct answers, memory recall success.
    - Display mood logs and any custom content completed.
- **Implementation**:
    - Query `user_activity` and `memory_prompts` for the current day.
    - Present the data in a simple, large-font layout on the final screen or a dedicated "Report" page.

## 5.5 Accessibility (Audio I/O)

- **Text-to-Speech**:
    - Use the **Web Speech API** (`speechSynthesis`) to read out the question or instructions.
- **Speech-to-Text**:
    - Use the **Web Speech API** (`webkitSpeechRecognition`) for browsers that support it.
    - Provide a fallback if the browser or device doesn't support speech recognition.

**Note**: This feature can be labeled "Beta" for MVP, since it may be device/browser dependent.

## 5.6 Custom Content (Family Portal)

- **Optional MVP Feature**: If implemented, you'll have:
    1. **FamilyMemberLogin**: A separate role in `users.role`.
    2. **CustomQuestionEditor**: A page allowing them to create new questions or memory prompts.
    3. The newly created questions are tagged with `created_by` = family member's `user_id`.

---

# 6. Folder Structure (Recommended)

Assuming a **Next.js** project (adapt similarly for Create React App). The structure may look like this:

MEMORY-MASTER/
 ├─ docs/
 │   └─ Memory-Master_PRD v1.md    # Your documentation / project requirements
 ├─ public/
 │   ├─ file.svg
 │   ├─ globe.svg
 │   ├─ next.svg
 │   ├─ vercel.svg
 │   ├─ window.svg
 │   └─ # (Add any images for Memory Game or custom icons here)
 └─ src/
     ├─ app/
     │   ├─ (routes)
     │   │   ├─ login/
     │   │   │   └─ page.tsx      # Login form page
     │   │   ├─ mood-selection/
     │   │   │   └─ page.tsx      # Mood selection flow
     │   │   ├─ category-selection/
     │   │   │   └─ page.tsx      # Choose categories
     │   │   ├─ quiz/
     │   │   │   └─ page.tsx      # Main quiz interface
     │   │   ├─ memory-prompt/
     │   │   │   └─ page.tsx      # Morning memory prompt
     │   │   ├─ evening-recall/
     │   │   │   └─ page.tsx      # Evening recall prompt
     │   │   └─ report/
     │   │       └─ page.tsx      # Daily report page
     │   ├─ layout.tsx
     │   ├─ page.tsx              # Landing/home page
     │   ├─ globals.css           # Global styles
     │   └─ favicon.ico
     ├─ components/
     │   ├─ QuizItem.tsx          # Renders an individual quiz question
     │   ├─ TTSButton.tsx         # (Optional) For text-to-speech
     │   ├─ VoiceInput.tsx        # (Optional) For speech-to-text
     │   └─ # (Add any shared UI components here)
     ├─ lib/
     │   └─ supabaseClient.ts     # Supabase initialization
     ├─ utils/
     │   └─ apiHelpers.ts         # Helper functions for DB queries or fetches
     ├─ .gitignore
     ├─ eslint.config.mjs
     ├─ next-env.d.ts
     ├─ next.config.ts
     ├─ package.json
     ├─ postcss.config.mjs
     ├─ README.md
     └─ tsconfig.json
```

**Key Points**:

- **pages/** directory for Next.js routing.
- **components/** directory for reusable UI elements (e.g., question rendering, mood selection).
- **lib/** for Supabase client setup and helper functions.
- **public/** for static assets.
- **styles/** for global or modular CSS.

---

# 7. Implementation Steps (Actionable)

1. **Initialize Project**
    - Create a new Next.js app (`npx create-next-app`) or a React app.
    - Install dependencies (e.g., `@supabase/supabase-js`, any UI libraries, etc.).
2. **Configure Supabase**
    - Sign up at [Supabase.io](https://supabase.io/).
    - Create a new project, get your **API keys** and **project URL**.
    - In `lib/supabaseClient.ts`, initialize Supabase:
        
        ```jsx
        ts
        CopyEdit
        import { createClient } from '@supabase/supabase-js';
        
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
        
        export const supabase = createClient(supabaseUrl, supabaseKey);
        
        ```
        
    - Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local`.
3. **Set Up Database Schema**
    - Create tables using this SQL:
    ```sql
    -- Create users table (handled by Supabase Auth)
    
    -- Create questions table
    CREATE TABLE questions (
        id SERIAL PRIMARY KEY,
        category TEXT NOT NULL,
        question_text TEXT NOT NULL,
        options TEXT[] DEFAULT NULL,
        correct_answer TEXT NOT NULL,
        difficulty INTEGER CHECK (difficulty BETWEEN 1 AND 3),
        tag TEXT,
        explanation TEXT,
        created_by UUID REFERENCES auth.users(id),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
    );

    -- Create user_activity table
    CREATE TABLE user_activity (
        id SERIAL PRIMARY KEY,
        user_id UUID REFERENCES auth.users(id),
        question_id INTEGER REFERENCES questions(id),
        mood TEXT CHECK (mood IN ('sad', 'neutral', 'happy')),
        score INTEGER,
        timestamp TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
        session_type TEXT CHECK (session_type IN ('morning', 'evening'))
    );

    -- Create memory_prompts table
    CREATE TABLE memory_prompts (
        id SERIAL PRIMARY KEY,
        user_id UUID REFERENCES auth.users(id),
        prompt_text TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
        recalled_text TEXT,
        recall_score INTEGER CHECK (recall_score BETWEEN 0 AND 100),
        checked_at TIMESTAMP WITH TIME ZONE
    );
    ```
4. **Implement Authentication**
    - In `login.tsx`, use `supabase.auth.signInWithPassword({ email, password })`.
    - Store user session in a React Context or Next.js SSR session (advanced).
    - If new user, `supabase.auth.signUp({ email, password })`.
5. **Build Mood Selection Flow**
    - Create `mood-selection.tsx`.
    - On user choice, store mood in local state or database (`user_activity` or a dedicated table).
    - Redirect to category selection or quiz page.
6. **Category Selection & Quiz Retrieval**
    - `category-selection.tsx`: Provide checkboxes for categories.
    - On submission, fetch questions from Supabase.
    - Store them in state, then route user to `quiz.tsx`.
7. **Quiz Page**
    - Display each question in a `QuizItem` component.
    - If multiple-choice, show 4 options as buttons.
    - On click, record correct/incorrect in `user_activity`.
    - Optionally, provide TTS button or voice input for answering.
8. **Memory Prompt (Morning & Evening)**
    - `memory-prompt.tsx`:
        - Store the 3 words in `memory_prompts` with the user's ID and timestamp.
    - `evening-recall.tsx`:
        - Fetch the same day's prompt, compare user's input.
        - Save the result in `memory_prompts`.
9. **Daily Report**
    - `report.tsx`: Summarize data from `user_activity` and `memory_prompts`.
    - Display correct answers, mood, etc.
    - Provide a simple UI for daily stats.
10. **Deploy to Vercel**
    - Push your repo to GitHub (or GitLab/Bitbucket).
    - Connect the repo to Vercel.
    - Set environment variables in Vercel for your Supabase credentials.
    - Once deployed, test the app end to end.
11. **(Optional) Audio Enhancements**
    - Implement **Text-to-Speech** using the Web Speech API in each quiz question.
    - Implement **Speech-to-Text** for open-ended questions if desired.
12. **(Optional) Family/Custom Content**
    - Create an interface to insert new questions into `questions` with `created_by = user_id`.
    - Provide a "Custom Questions" section in the app for easy management.

---

# 8. Accessibility Considerations

1. **Large Fonts & High Contrast**
    - Use a base font size of **18–20px** or more for body text.
    - Ensure color contrast meets WCAG 2.1 AA standards.
2. **Clear Navigation**
    - Keep the flow linear to reduce confusion.
    - Use large, clearly labeled buttons.
3. **Audio Prompts**
    - Provide optional TTS for instructions or question content.
    - A toggle to enable/disable speech features to respect user preferences.
4. **Testing with Actual Users**
    - Ideally test with seniors to gather feedback on clarity, font sizes, and overall usability.

---

# 9. Potential Future Enhancements

- **Multi-Language Support**
    - Extend the database to store localized question text.
- **Gamification**
    - Add badges, achievement milestones, or streak tracking.
- **Advanced Analytics**
    - Display progress charts, trending scores, mood patterns over time.
- **Push Notifications**
    - For mobile devices (via PWA or native wrappers) to remind user of daily challenges.

---

## Conclusion

This **detailed PRD** outlines a clear, step-by-step plan to build your **Daily Memory Challenge** MVP. With **Supabase** managing authentication and data, a **React/Next.js** front-end (assisted by **Cursor**), and deployment on **Vercel**, you have all the necessary components to create an accessible, mood-adaptive cognitive training application.

**Next Steps**:

1. **Set up your repository** and **initialize the project** (React/Next.js).
2. **Configure Supabase** and build your database.
3. Implement each **user flow** in the order given (login → mood → quiz → memory prompt → evening recall → report).
4. Continuously test and refine, focusing on **accessibility** and **simplicity**.