
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