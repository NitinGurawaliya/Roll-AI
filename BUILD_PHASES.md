# Career Compass AI - Build Phases

## Goal

Build the MVP incrementally while keeping the application deployable after every phase.

Do NOT skip phases.

Run build and fix errors after each phase.

---

# Phase 1 - Database Foundation

Objective:
Create the data layer.

Tasks:

- Implement Prisma models:
  - User
  - Resume
  - Session

- Create relationships
- Run migrations
- Verify schema with Prisma Studio

Success Criteria:

- Migration succeeds
- Tables exist
- No Prisma errors

---

# Phase 2 - Authentication

Objective:
Allow users to sign in.

Tasks:

- Setup Google Authentication
- Persist users in database
- Protect application routes
- Create login/logout flow

Pages:

- /login

Success Criteria:

- User can sign in
- User record created
- Protected routes work

---

# Phase 3 - Resume Upload

Objective:
Upload and process resumes.

Tasks:

- Build upload page
- Support PDF uploads
- Extract raw text using pdf2json
- Save raw text in Resume table

Pages:

- /upload

API:

POST /api/resume/upload

Success Criteria:

- User uploads PDF
- Text extracted
- Resume saved

---

# Phase 4 - Resume Analysis

Objective:
Generate personalized insights.

Tasks:

- Generate summary
- Detect persona
- Generate tension statement
- Save results in database

Store:

- summary
- persona
- tension

Success Criteria:

- Resume analysis generated
- Data persisted

---

# Phase 5 - Insight Page

Objective:
Show user their personalized insight.

Page:

- /insight

Display:

- Persona
- Summary
- Career Tension

Success Criteria:

- User sees personalized insight

---

# Phase 6 - Discovery Questions

Objective:
Collect user preferences.

Questions:

1. What energizes you most?
2. What feels draining?
3. What matters most in your next role?

Tasks:

- Build question flow
- Save answers in Session table

Success Criteria:

- Answers stored successfully

---

# Phase 7 - Career Path Generation

Objective:
Generate first recommendation round.

API:

POST /api/career/generate

Input:

- Resume
- Persona
- Tension
- Answers

Output:

- 3 career paths

Each path:

- title
- score
- reason

Success Criteria:

- User receives 3 recommendations

---

# Phase 8 - Recommendation Regeneration

Objective:
Generate alternative recommendations.

Rules:

- Exclude previously shown roles
- Maximum 3 rounds
- Maximum 9 total paths

Store:

- shownRoles
- round
- recommendations

Success Criteria:

- Alternative recommendations generated
- Duplicate roles prevented

---

# Phase 9 - Path Selection

Objective:
User selects preferred career path.

Tasks:

- Store selected path
- Generate detailed analysis

Output:

- Why This Fits
- Existing Strengths
- Skill Gaps

Success Criteria:

- User can choose path
- Analysis generated

---

# Phase 10 - 90 Day Roadmap

Objective:
Generate actionable next steps.

Output:

- First 30 Days
- Days 30-60
- Days 60-90

Success Criteria:

- Personalized roadmap generated

---

# Phase 11 - UI Polish

Objective:
Improve user experience.

Tasks:

- Loading states
- Error states
- Empty states
- Mobile responsiveness
- Accessibility improvements

Success Criteria:

- Smooth user experience

---

# Phase 12 - Final Review

Tasks:

- Run build
- Run lint
- Fix TypeScript errors
- Verify all flows

Checklist:

- Authentication works
- Resume upload works
- Analysis works
- Discovery questions work
- Recommendations work
- Regeneration works
- Final roadmap works

Success Criteria:

- MVP complete
- Ready for deployment