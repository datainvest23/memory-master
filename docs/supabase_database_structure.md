# Memory Master Database Schema

# Memory Master Database Schema (v2)

This document describes the **public** schema tables used in the Memory Master project, alongside their relationships to Supabase’s **`auth.users`** table. The schema supports user profiles, memory prompts, quiz activity, and questions.

---

## Overview of Relationships

- **Supabase Auth** (`auth.users`):
  - Stores user authentication credentials (email, password, etc.).
  - Each user has a unique UUID as `id`.
- **Profiles** (`public.profiles`):
  - 1:1 with `auth.users(id)`.
  - Holds additional user data (name, birthdate, etc.).
  - `profiles.user_id` is the **primary key**, referencing `auth.users(id)`.
- **Memory Prompts** (`public.memory_prompts`):
  - Stores short phrases the user enters in the morning and recalls in the evening.
  - References `profiles.user_id`, thereby chaining back to `auth.users`.
- **User Activity** (`public.user_activity`):
  - Logs quiz or daily activity for each user.
  - References `profiles.user_id`.
- **Questions** (`public.questions`):
  - Contains the question bank (category, difficulty, etc.).
  - Optionally referenced by `user_activity.question_id` (if the user answered a specific question).

Below is a detailed breakdown of each table and its columns.

---

## 1. Table: `auth.users`

> **Schema**: `auth` (managed by Supabase)

| Column           | Type         | Description                                      |
|------------------|-------------|--------------------------------------------------|
| **id**           | `uuid`       | **Primary Key** for each authenticated user.    |
| **email**        | `text`       | User’s email address.                           |
| **encrypted_password** | `text` | Internally stored password hash (not visible).  |
| ... (other columns)    | *varies*| Supabase-managed fields (e.g., created_at, etc.). |

**Purpose**:  
- Central auth system for user logins.  
- Not directly in `public` schema, but referenced by `profiles.user_id`.

---

## 2. Table: `profiles` (Public)

> **Schema**: `public`

| Column        | Type         | Description                                                                                   |
|---------------|-------------|-----------------------------------------------------------------------------------------------|
| **user_id**   | `uuid`       | **Primary Key**, references `auth.users (id)` via `profiles_user_id_fkey`.                   |
| **email**     | `text`       | Optional if you want to mirror the user’s email here (not strictly needed).                  |
| **created_at**| `timestamptz`| Timestamp for when the profile was created.                                                  |
| **first_name**| `text`       | User’s given name.                                                                           |
| **last_name** | `text`       | User’s family name.                                                                          |
| **date_of_birth** | `date`   | User’s DOB if needed.                                                                        |

**Purpose**:  
- **Stores additional user information** that isn’t part of `auth.users`.  
- Each row corresponds 1:1 with a user in Supabase Auth.

---

## 3. Table: `memory_prompts`

> **Schema**: `public`

| Column         | Type         | Description                                                                                                  |
|----------------|-------------|--------------------------------------------------------------------------------------------------------------|
| **id**         | `serial`     | **Primary Key** (auto-increment).                                                                           |
| **user_id**    | `uuid`       | References `profiles(user_id)` with `ON DELETE CASCADE`.                                                   |
| **prompt_text**| `text`       | The 3 words (or short phrase) entered in the morning.                                                       |
| **created_at** | `timestamptz`| Timestamp for when the prompt was created (defaults to `now()`).                                            |
| **recalled_text**| `text`     | The user’s evening attempt at recall.                                                                       |
| **recall_score**| `int4`      | 0 = incorrect, 1 = correct (or any scoring logic).                                                          |
| **checked_at** | `timestamptz`| When the recall test was performed (evening).                                                               |

**Purpose**:  
- Records the **morning memory prompt** and the **evening recall**.  
- The `user_id` chain goes: `memory_prompts.user_id` → `profiles.user_id` → `auth.users.id`.

---

## 4. Table: `user_activity`

> **Schema**: `public`

| Column        | Type         | Description                                                                                         |
|---------------|-------------|-----------------------------------------------------------------------------------------------------|
| **id**        | `serial`     | **Primary Key** (auto-increment).                                                                  |
| **user_id**   | `uuid`       | References `profiles(user_id)` with `ON DELETE CASCADE`.                                           |
| **question_id**| `int4`      | (Optional) references `questions.id` (if you want to track which question was answered).            |
| **mood**      | `text`       | e.g., `"sad"`, `"neutral"`, `"happy"`.                                                             |
| **score**     | `int4`       | 0 = incorrect, 1 = correct, or numeric points.                                                     |
| **timestamp** | `timestamptz`| Timestamp for when the user answered.                                                              |
| **session_type**| `text`     | e.g., `"morning"`, `"evening"`, `"quiz"`.                                                          |

**Purpose**:  
- Logs user activity, such as quiz answers, daily check-ins, or mood selection.  
- `user_id` references `profiles`, which references `auth.users`.

---

## 5. Table: `questions`

> **Schema**: `public`

| Column               | Type         | Description                                                                                   |
|----------------------|-------------|-----------------------------------------------------------------------------------------------|
| **id**               | `serial`     | **Primary Key** (auto-increment).                                                            |
| **kategorie**        | `text`       | Category (e.g., `"Mathe"`, `"Geografie"`).                                                   |
| **frage**            | `text`       | The question prompt in German.                                                               |
| **antwortoptionen**  | `text[]`     | Array of multiple-choice answers (Postgres `text[]`).                                        |
| **korrekte_antwort** | `text`       | The correct answer.                                                                          |
| **schwierigkeitsgrad**| `int4`      | Difficulty level (1 = leicht, 2 = mittel, 3 = schwer).                                       |
| **tag**              | `text`       | Optional label for advanced filtering (e.g., `"Europa"`, `"Rechtschreibung"`).               |
| **erklaerung**       | `text`       | Additional explanation or hint (optional).                                                   |

**Purpose**:  
- **Stores a question bank** for quizzes and memory training.  
- Optionally linked to `user_activity` (`question_id`), so you can track which question a user answered.

---

## 6. Relationship Diagram
auth.users ↓ (id) public.profiles ↑ (user_id PK) public.questions ↓ (user_id) ↑ public.user_activity ----------- (question_id) ↑ (user_id)
public.memory_prompts ↑ (user_id)

- **`profiles(user_id)`** references **`auth.users(id)`** (1:1).  
- **`memory_prompts.user_id`** and **`user_activity.user_id`** reference **`profiles(user_id)`**.  
- **`user_activity.question_id`** references **`questions.id`** if you choose to store which question was answered.

---

## Usage Flow

1. **User Registration**  
   - Done via Supabase Auth → new row in `auth.users`.  
   - You create a matching row in `profiles` with `user_id = auth.users.id`.

2. **Daily Activity**  
   - The user logs in.  
   - `user_activity` entries are created with the user’s `user_id` from `profiles`.  
   - Memory prompts (morning and evening recall) go into `memory_prompts`, referencing the same `user_id`.

3. **Quiz Questions**  
   - `questions` provides the quiz data.  
   - When the user answers, `user_activity` can record the `question_id` and the `score`.

4. **Data Cleanup**  
   - If a user is deleted in `auth.users`, the **cascade** to `profiles` occurs, which also cascades to `memory_prompts` and `user_activity`.

---

**Last Updated**: (Date of your final update)


---

*Last Updated: *(Add Date Here)*

