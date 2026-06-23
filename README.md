# Career Compass AI

An AI-powered career coach that helps professionals and recent graduates gain clarity on their next career move through a guided conversation powered by their resume and preferences.

---

## Problem Statement

Users often struggle to decide their next career move.

- Recent graduates are overwhelmed by too many options.
- Professionals wanting to switch careers lack a framework.
- Experienced professionals know they want growth but cannot identify the gap.

Instead of giving generic career advice, Career Compass AI analyzes a user's resume, identifies their career persona, surfaces a meaningful career tension/opportunity, gathers preference signals through a short conversation, and recommends personalized career paths.

---

# MVP Scope

This is an MVP built specifically for the Leap Career Bot assignment.

The goal is not to build a complete production-ready career platform.

The goal is to demonstrate:

- Product Thinking
- AI Personalization
- Recommendation Quality
- Clean UX
- Full-Stack Engineering

---

# User Journey

## Step 1: Authentication

User signs in using Google Authentication.

Store:

- Name
- Email

Issue a JWT and store it as an HTTP-only cookie.

---

## Step 2: Resume Upload

User uploads a PDF resume.

System:

- Extracts text from PDF
- Generates structured summary
- Detects user persona
- Identifies a career tension/opportunity

Example:

> You've built multiple real-world applications and have stronger practical experience than many graduates, but most hiring processes will still evaluate you as an entry-level candidate.

---

## Step 3: Persona Detection

AI classifies user into one of:

### Recent Graduate

- Less than 1 year experience
- Confused by options
- Needs structured guidance

### Career Pivot

- Wants to move into another function
- Looking for ownership and growth

### Career Growth

- Wants to level up within current field
- Needs help identifying growth gaps

Store persona alongside resume.

---

## Step 4: Discovery Questions

Ask exactly 3 questions.

Question 1

"What type of work energizes you the most?"

Options:

- Building Products
- Solving Technical Problems
- Leading People
- Working With Customers

Question 2

"What kind of work feels repetitive or draining?"

Options:

- Meetings
- Customer Calls
- Repetitive Tasks
- Coding

Question 3

"What matters most in your next role?"

Options:

- Salary
- Learning
- Ownership
- Stability
- Work-Life Balance

Store answers for the current recommendation session.

---

## Step 5: Generate Career Paths

AI uses:

- Resume Text
- Persona
- Career Tension
- User Answers

to generate 3 personalized career paths.

Each path should contain:

- Title
- Match Score
- Why It Fits
- Growth Potential
- Key Strengths Supporting Recommendation

Example:

### Full Stack Engineer

Match Score: 94%

Why:

- Strong React and Node.js experience
- Multiple shipped projects
- Product-building mindset

---

## Step 6: Regenerate Recommendations

If user does not like recommendations:

Generate another set of 3 career paths.

Previously generated roles must be excluded.

Example:

Round 1

- Full Stack Engineer
- Founding Engineer
- Solutions Engineer

Round 2

- Technical Product Manager
- Developer Relations Engineer
- Cloud Engineer

Round 3

- Data Engineer
- AI Applications Engineer
- Technical Consultant

---

## Recommendation Loop Rules

Maximum recommendation rounds:

3

Paths per round:

3

Maximum total paths:

9

After 9 paths stop generating new recommendations.

Reason:

- Prevent decision fatigue
- Maintain recommendation quality
- Encourage action

---

## Closing Message

After the third round:

"We've explored the strongest career directions that align with your experience, interests, and goals.

Rather than generating increasingly weaker recommendations, I recommend selecting one path so we can build a focused action plan around it.

Which path feels most exciting to you right now?"

---

## Step 7: Path Selection

When user selects a path:

Show:

### Why This Path Fits

### Existing Strengths

### Skill Gaps

### Suggested Next Steps

### 90-Day Roadmap

This acts as the final output of the conversation.

---

# Tech Stack

Frontend

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui

Backend

- Next.js Route Handlers
- OpenAI API

Database

- PostgreSQL
- Prisma ORM

Authentication

- Google OAuth
- JWT Cookies

PDF Processing

- pdf2json

Deployment

- Vercel

---

# Database Design

## User

```prisma
model User {
  id        String   @id @default(cuid())
  name      String
  email     String   @unique

  createdAt DateTime @default(now())

  resume    Resume?
  sessions  Session[]
}
```

## Resume

```prisma
model Resume {
  id          String   @id @default(cuid())

  userId      String   @unique

  rawText     String   @db.Text

  persona     String

  summary     String?  @db.Text

  tension     String?  @db.Text

  createdAt   DateTime @default(now())

  user        User @relation(fields: [userId], references: [id])
}
```

## Session

```prisma
model Session {
  id                String   @id @default(cuid())

  userId            String

  answers           Json

  shownRoles        Json

  recommendations   Json

  round             Int      @default(1)

  createdAt         DateTime @default(now())
}
```

---

# API Design

## Upload Resume

POST

```http
/api/resume/upload
```

Responsibilities:

- Upload PDF
- Extract Text
- Generate Summary
- Detect Persona
- Generate Tension Statement
- Save Resume

Response:

```json
{
  "resumeId": "123",
  "persona": "RECENT_GRADUATE",
  "summary": "...",
  "tension": "..."
}
```

---

## Generate Career Paths

POST

```http
/api/career/generate
```

Input:

```json
{
  "resumeId": "123",
  "answers": {
    "likes": "...",
    "dislikes": "...",
    "priority": "..."
  },
  "excludedRoles": []
}
```

Response:

```json
{
  "paths": [
    {
      "title": "Full Stack Engineer",
      "score": 94,
      "reason": "..."
    }
  ]
}
```

For regeneration:

```json
{
  "resumeId": "123",
  "answers": {},
  "excludedRoles": [
    "Full Stack Engineer",
    "Founding Engineer",
    "Solutions Engineer"
  ]
}
```

The same endpoint handles both first-time generation and regeneration.

---

# UI Pages

## Landing Page

- Product Hero
- Resume Upload CTA

---

## Upload Page

- Drag and Drop Upload
- Processing State

---

## Insight Page

Displays:

- Persona
- Summary
- Career Tension

---

## Discovery Page

Displays:

- 3 Questions
- Answer Selection

---

## Recommendation Page

Displays:

- 3 Career Path Cards
- Generate More Button

---

## Final Recommendation Page

Displays:

- Selected Path
- Why It Fits
- Skill Gap Analysis
- 90-Day Roadmap

---

# Out Of Scope

Not building:

- LinkedIn Import
- Resume Builder
- Job Matching
- Course Recommendations
- Real Salary Data
- Multi-user Collaboration
- Email Notifications
- Admin Dashboard
- Analytics Dashboard

These are future enhancements.

---

# Success Criteria

A successful MVP should allow a user to:

1. Upload a resume.
2. Receive a personalized career insight.
3. Answer 3 discovery questions.
4. Receive 3 personalized career paths.
5. Generate up to 2 additional recommendation rounds.
6. Select a career path.
7. Receive a roadmap and next steps.

The focus is recommendation quality, personalization, and clear product thinking rather than feature breadth.