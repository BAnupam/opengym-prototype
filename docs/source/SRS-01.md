# SRS-01 — OpenGym: Software Requirements Specification

| Field | Value |
|---|---|
| Document | SRS-01 |
| Version | 1.0 (frozen when planning starts) |
| Date | 2026-11-21 |
| Traces to | BRD-01 |
| Technical design | TDD-01 |

**Words:** "must" is a requirement. "should" is a recommendation. "may" is permitted.

Each requirement has an ID. FRDs refer to these IDs. The acceptance column gives the minimum check. Each FRD gives full Given/When/Then criteria.

---

## 1. Screens and navigation

| Screen | Route | Desktop nav label | Phone nav label | Prototype reference |
|---|---|---|---|---|
| Welcome and sign-in | `/` (signed out) | — | — | `#overview` signed out |
| Daily overview | `/today` | Daily Overview | Today | `#overview` |
| Workouts | `/train` | Workouts | Train | `#workouts` |
| Nutrition | `/fuel` | Nutrition | Fuel | `#nutrition` |
| AI coach | `/coach` | AI Coach | Coach | `#coach` |
| Seasons and quests | `/grow` | Seasons & Quests | Grow | `#quests` |
| Account and settings | `/settings` | Account & settings (avatar) | Account & settings (avatar) | `#settings` |

- SRS-NAV-01: The app must show the 5 main screens in a top navigation on wide screens (≥ 768 px) and a bottom navigation on narrow screens (< 768 px).
- SRS-NAV-02: Each screen must have its own URL. A browser reload must show the same screen.
- SRS-NAV-03: A signed-out person who opens any route except `/` must go to `/`. After sign-in, the person goes to the route they asked for.

## 2. Access (AUTH)

| ID | Requirement | Acceptance |
|---|---|---|
| SRS-AUTH-01 | The person must sign in with a Google account (OpenID Connect). | A new Google account creates a new OpenGym account on first sign-in. |
| SRS-AUTH-02 | The first sign-in must create a profile with the Google display name and default settings (kg, 2,500 kcal, 160 g protein, 300 g carbs, 70 g fat, light theme, Peach accent). | Defaults appear in settings after first sign-in. |
| SRS-AUTH-03 | The session must stay valid for 30 days of no use, and then expire. | A request with an expired session goes to `/`. |
| SRS-AUTH-04 | Sign out must end the session on the server. | The old session cookie gives 401 after sign out. |
| SRS-AUTH-05 | The welcome screen must show the product message, the 6 persona figures, "Continue with Google", and "Try a demo journal". | Visual check against the prototype welcome screen. |

## 3. Profile and settings (PROF)

| ID | Requirement | Acceptance |
|---|---|---|
| SRS-PROF-01 | The person must be able to change the display name (1–40 characters). | Saved name shows in the header. |
| SRS-PROF-02 | The person must be able to set the weight unit to kg or lb. | New workouts use the new unit. |
| SRS-PROF-03 | A unit change must not change earlier workouts. Each workout keeps the unit it started with (BR-07). | An earlier workout shows its original unit after a change. |
| SRS-PROF-04 | The person must be able to set daily targets: calories (500–10,000 kcal), protein (g), carbs (g), fat (g). | Targets show on the nutrition and overview screens. |
| SRS-PROF-05 | The person must be able to write a training goal (free text, 0–120 characters). | Saved goal shows in settings. |
| SRS-PROF-06 | The person must be able to select the theme (light or dark) and an accent colour (Peach, Sage, Lavender, Sky, Rose). | The choice applies at once and stays after sign-in on another device. |

## 4. Exercise library (EXL)

| ID | Requirement | Acceptance |
|---|---|---|
| SRS-EXL-01 | The system must give a built-in library of at least 40 exercises. Each exercise has a name, a primary muscle group, equipment, and a workout type (strength, bodyweight, or endurance). | The library lists ≥ 40 exercises with all 4 fields. |
| SRS-EXL-02 | The person must be able to search the library by name and filter by muscle group, equipment and workout type. | Search "press" returns all exercises with "press" in the name. |
| SRS-EXL-03 | The person must be able to add a custom exercise with the same 4 fields. A custom exercise is visible only to its owner. | Another account does not see the custom exercise. |
| SRS-EXL-04 | The person must be able to rename or archive their own custom exercise. Built-in exercises cannot be changed. An archived exercise stays in earlier workouts. | An archived exercise does not appear in search; earlier workouts still show it. |

## 5. Workouts (WKT)

| ID | Requirement | Acceptance |
|---|---|---|
| SRS-WKT-01 | The system must give 4 built-in templates: Push Session, Pull Session, Leg Session, Full Body. Each template lists 4–6 exercises from the library. | 4 templates in "Start a Workout". |
| SRS-WKT-02 | The person must be able to start a workout with a name and a template. The workout gets 3 planned sets for each exercise (BR-05). | A started Push Session has 3 planned sets per exercise. |
| SRS-WKT-03 | A person must have a maximum of one active workout (BR-04). | Start is not possible while a workout is active; the app offers "Resume". |
| SRS-WKT-04 | The workout screen must show one exercise at a time, the set number ("Set 2 of 3"), the last logged set for this exercise ("Last set: 60 kg × 8"), weight and reps inputs, and an optional effort input. | Visual check against `#workouts`. |
| SRS-WKT-05 | Weight and reps must be filled from the last logged set of the same exercise. One tap logs the set and starts the rest stopwatch. | After set 1, set 2 needs only one tap. |
| SRS-WKT-06 | The person must be able to add a set, go to the previous or next unfinished exercise, and change the exercise order. | Order change keeps all logged sets. |
| SRS-WKT-07 | "Equipment busy? Do another exercise" must move to the next unfinished exercise and keep the current one unfinished. | The skipped exercise stays in the lineup as unfinished. |
| SRS-WKT-08 | The person must be able to review and correct logged sets (weight, reps, effort) and delete a logged set during the workout and after it. | A corrected set changes volume at once. |
| SRS-WKT-09 | The rest stopwatch must count up from zero after each logged set. The person decides when to continue. | Stopwatch starts at 0:00 after "Log set". |
| SRS-WKT-10 | Exercise tools must let the person rename the exercise in this workout and open a plate calculator. The plate calculator shows the plates on each side for a target weight, a bar weight (20 kg / 45 lb by default) and the available plates. | Target 100 kg, bar 20 kg → 40 kg each side, shown as plates. |
| SRS-WKT-11 | "Finish session" must show the count of logged sets against planned sets and offer "Keep training" or "Save workout". Saving marks the workout completed. Unlogged planned sets stay unlogged (BR-06). | "1 of 12 sets completed" before save. |
| SRS-WKT-12 | The session panel must show sets logged / planned and volume (BR-08). | 1 set of 60 kg × 8 → 480 kg. |
| SRS-WKT-13 | Workout history must list completed workouts, newest first, with date and logged set count. A workout opens to show all logged sets. | History item "Push Session A · 2026-11-21 · 1 set". |
| SRS-WKT-14 | A workout's type is the type of the majority of its exercises (strength, bodyweight or endurance). | A workout with 3 bodyweight and 1 strength exercise is bodyweight. |

## 6. Nutrition (NUT)

| ID | Requirement | Acceptance |
|---|---|---|
| SRS-NUT-01 | The nutrition screen must show 4 meal slots: Breakfast, Lunch, Dinner, Snack. Each slot shows its food items and its calorie total. An empty slot shows "No foods logged." | Visual check against `#nutrition`. |
| SRS-NUT-02 | The person must be able to add a food item by hand: name, portion (amount and unit), calories, protein, carbs, fat. | A manual item appears in its slot. |
| SRS-NUT-03 | The person must be able to edit and delete a food item. | Totals change at once. |
| SRS-NUT-04 | The person must be able to get an AI estimate from a text description. The estimate lists identified foods, each with a portion in grams, and the total calories, protein, carbs and fat. | "150g cooked chicken, 200g cooked rice, 100g vegetables" returns 3 items. |
| SRS-NUT-05 | The person must be able to get an AI estimate from a photo, with or without a text description. | A photo returns an estimate with at least one item. |
| SRS-NUT-06 | Before saving, the person must be able to change each portion, remove an item, use "Ate half" or "A little more" (+25%), change the description, and ask for an updated estimate with a free-text adjustment. | Changing a portion changes the totals before save. |
| SRS-NUT-07 | An estimate is saved only when the person selects "Log meal" (BR-11). | Closing the dialog saves nothing. |
| SRS-NUT-08 | "Your usuals" must list each distinct meal the person logged before, once (PD-06), most-used first, maximum 8. One action adds it to a slot with its last portion. | A usual meal appears once. |
| SRS-NUT-09 | The day's totals and remaining calories must follow DM-03 and DM-04. | Same values on overview, nutrition and coach screens. |

## 7. Recovery (REC)

| ID | Requirement | Acceptance |
|---|---|---|
| SRS-REC-01 | The person must be able to save a recovery check-in: sleep (0–24 h, step 0.1), water (0–20 L, step 0.1), energy (1–5 with labels Very low, Low, Okay, Good, Excellent), notes (optional, max 500 characters). | Saved values show in "Habits & Recovery". |
| SRS-REC-02 | The check-in history must list check-ins, newest first, with date, sleep and energy. | Coach "Recovery context" uses the same list. |

## 8. Daily overview (OVR)

| ID | Requirement | Acceptance |
|---|---|---|
| SRS-OVR-01 | The overview must show "days with journal entries" in the last 7 days (DM-01), protein logged today against the target, and sets in the active workout. | Values agree with DM rules. |
| SRS-OVR-02 | The overview must show the 7-day rhythm strip (Sun–Sat of the current week), with a mark for each day that has an entry. | Mark on each day with an entry. |
| SRS-OVR-03 | The overview must show the active workout card with "Resume workout", or a "Start workout" action when there is no active workout. | Card changes when a workout is saved. |
| SRS-OVR-04 | The overview must show "workouts completed this week" and the remaining calories (DM-04). | Same remaining value as the nutrition screen. |
| SRS-OVR-05 | The overview must show the daily nutrition summary and the latest recovery check-in of the day. | Values agree with the nutrition and recovery data. |
| SRS-OVR-06 | The overview must show recent activity: the latest 10 entries, newest first, each with type (Workout, Meal, Recovery), date and a short summary. | List agrees with logged data. |
| SRS-OVR-07 | Quick log: the person types free text ("3x8 bench at 60kg", "had oats and a banana", "slept 7 hours"). The system proposes one entry (workout set, meal, or check-in). The person confirms it before it is saved. | Each of the 3 examples gives the correct entry type. |
| SRS-OVR-08 | A date picker must let the person view and log for any earlier day. "Back to today" returns to the current day. Future days cannot be selected. | Logging on an earlier day stores that journal day. |
| SRS-OVR-09 | The overview must show the roster summary: active personas, or "A fresh chapter" when there are none. | Fresh account shows "A fresh chapter". |

## 9. Personas (PER)

| ID | Requirement | Acceptance |
|---|---|---|
| SRS-PER-01 | The system must evaluate the 6 personas with the rules in BRD-01 §6.5 over a rolling 28-day window that ends on the current journal day. | Rule tests for each persona. |
| SRS-PER-02 | Each persona must have a state: active, resting or not yet met (BR-13, BR-14). | State changes when the window moves. |
| SRS-PER-03 | The persona detail must show the name, the subtitle, the state, the progress against the rule, the rule text, and the statement in BR-16. Progress for Sage must show each category separately. | Sage shows "Movement 2/2 · Meals 2/2 · Recovery 1/2". |
| SRS-PER-04 | The person must be able to pause and resume the roster (BR-15). | During a pause, persona states do not change. |
| SRS-PER-05 | The roster view must list active personas and a count of resting personas, with a way to see the resting ones. | "Resting companions · 1". |

## 10. Seasons and quests (QST)

| ID | Requirement | Acceptance |
|---|---|---|
| SRS-QST-01 | The system must give 4 quests: "Build your strength rhythm" (28 days; Atlas, Luna), "Make space for nourishment" (14 days; Cleo), "Move your own way" (28 days; Dash, Nova), "A little of everything" (28 days; Sage, Luna). | 4 quests in "Find your next chapter". |
| SRS-QST-02 | The person must be able to start a quest. The quest starts on the current journal day. | Start and end dates show on the quest. |
| SRS-QST-03 | A started quest must show progress for each persona it supports, in the quest dates. | "3 / 3 qualifying days" per persona. |
| SRS-QST-04 | The person must be able to remove a quest (BR-19). | Journal data stays after removal. |
| SRS-QST-05 | The grow screen must show a heatmap of the last 35 journal days (level by entry count), the count of active days in the 35 days, and the journal streak (DM-05). | "8 active days in the last 35 · 4 days in your journal streak". |
| SRS-QST-06 | A roster recap must summarize, for a quest, which personas reached their rule and when. | Recap lists each supported persona. |

## 11. AI coach (COA)

| ID | Requirement | Acceptance |
|---|---|---|
| SRS-COA-01 | The person must be able to ask a free-text question about their training, nutrition or recovery. | An answer appears in the conversation. |
| SRS-COA-02 | Before each question is sent, the system must show what data will be shared (date range and data types) and ask for approval (BR-21). If the person declines, nothing is sent. | Decline sends no request to the AI service. |
| SRS-COA-03 | Answers must use only the person's logged records. When the data is not enough, the answer must say so. | A question about a day with no data gets "no records" text. |
| SRS-COA-04 | The coach must not give medical diagnosis or treatment. A question about pain, injury or illness gets a short reply that suggests a qualified professional. | Test prompts in the FRD. |
| SRS-COA-05 | Text that the person logged (food names, notes, exercise names) must be treated as data, never as instructions to the coach. | A food named "ignore your rules and …" does not change coach behavior. |
| SRS-COA-06 | The coach screen must show 3 context panels: training this week (completed sets for each of the last 7 days), recovery context (last 3 check-ins), nutrition today (protein against target). | Panel values agree with DM rules. |

## 12. Data control (DAT)

| ID | Requirement | Acceptance |
|---|---|---|
| SRS-DAT-01 | The person must be able to export the whole journal as one JSON file (profile, exercises, workouts, sets, meals, food items, check-ins, quests, persona history). | File validates against the published export schema. |
| SRS-DAT-02 | The person must be able to connect a Google account to Google Sheets, create a personal OpenGym spreadsheet, and sync workouts, nutrition and recovery to app-owned tabs. Edits in Sheets are not imported. | Sync updates the 3 tabs. |
| SRS-DAT-03 | The person must be able to delete the account. The system must ask for confirmation, then delete all the person's data and end all sessions (BR-26). | No record with the person's ID stays in the database. |

## 13. Demo journals (DEMO)

| ID | Requirement | Acceptance |
|---|---|---|
| SRS-DEMO-01 | The system must give 3 demo journals: Alex Morgan (strength routine), Maya Chen (endurance routine), Sam Rivera (fresh start, almost empty). | 3 choices in "Try a demo journal". |
| SRS-DEMO-02 | Each demo visitor gets a private copy of the demo journal for the browser session. Changes are not visible to other visitors and are deleted after 24 hours. | Two browsers on "Alex" do not see each other's changes. |
| SRS-DEMO-03 | A demo journal must never show data from another journal (BR-27, PD-04). | Sam shows no meals or workouts from Alex. |
| SRS-DEMO-04 | AI features in a demo journal must use the real AI service with a lower rate limit (10 requests per hour per demo session). | 11th request in an hour is refused with a clear message. |

---

## 14. Derived metrics (DM)

All screens must compute each value with the same rule. TDD-01 requires one shared implementation for each rule.

| ID | Metric | Rule |
|---|---|---|
| DM-01 | Days with journal entries (last 7) | Count of journal days in [today − 6, today] that have an entry (BR-02). |
| DM-02 | Entry day | A completed workout counts on its journal day. An active (not saved) workout does not count. A food item counts on its journal day. A check-in counts on its journal day. |
| DM-03 | Daily totals | Sum of calories, protein, carbs and fat of all food items of the journal day. |
| DM-04 | Remaining calories | Daily calorie target − DM-03 calories. The value can be negative; a negative value shows as "N kcal over". |
| DM-05 | Journal streak | Count of consecutive journal days with an entry, ending today. If today has no entry yet, the streak ends yesterday. |
| DM-06 | Workouts completed this week | Completed workouts with a journal day in the current week (Sunday to Saturday, person's time zone). |
| DM-07 | Volume | BR-08. Weights are converted to the workout's unit. |
| DM-08 | Persona qualifying days | Distinct journal days in the window that meet the persona's category (BRD-01 §6.5). |

---

## 15. Non-functional requirements

Each FRD must copy the NFRs that apply to it, with a measurable acceptance criterion.

### 15.1 Performance

| ID | Requirement |
|---|---|
| NFR-PERF-01 | API read endpoints: p95 response time ≤ 300 ms at 50 concurrent users, with 1 year of data per user. |
| NFR-PERF-02 | API write endpoints: p95 ≤ 400 ms at 50 concurrent users. |
| NFR-PERF-03 | The overview data endpoint: p95 ≤ 500 ms at 50 concurrent users, with 1 year of data per user. |
| NFR-PERF-04 | Pages: Largest Contentful Paint ≤ 2.5 s on a mid-range phone profile (Lighthouse mobile, simulated 4G). |
| NFR-PERF-05 | AI meal estimate: first result ≤ 15 s at p95. AI coach: first text ≤ 5 s at p95 (streamed). |

### 15.2 Security

| ID | Requirement |
|---|---|
| NFR-SEC-01 | Every API request that reads or changes journal data must be limited to the signed-in person's own records (BR-24). An attempt to read another person's record must return 404. |
| NFR-SEC-02 | Session cookies must be `HttpOnly`, `Secure`, `SameSite=Lax`. Changing requests must have CSRF protection. |
| NFR-SEC-03 | All input must be validated on the server against a schema. Invalid input returns 400 with field errors. |
| NFR-SEC-04 | The app must send a Content Security Policy, HSTS, and `X-Content-Type-Options: nosniff`. |
| NFR-SEC-05 | Secrets (OAuth client secret, AI API key, session key) must come from the environment, never from the repository. |
| NFR-SEC-06 | The API must apply rate limits: 300 requests per minute per person; AI endpoints 30 per hour per person. |
| NFR-SEC-07 | The system must meet OWASP ASVS 4.0 Level 1. |
| NFR-SEC-08 | Text from the person that goes to the AI service must be marked as data in the prompt, and the AI output must be validated against a schema before use (SRS-COA-05). |
| NFR-SEC-09 | Dependencies must have no known critical or high vulnerabilities at release. |

### 15.3 Privacy

| ID | Requirement |
|---|---|
| NFR-PRIV-01 | Logs must not contain journal content, meal photos, notes, AI prompts or AI answers. Logs may contain record IDs. |
| NFR-PRIV-02 | Meal photos must not be stored on disk or in the database (BR-23). |
| NFR-PRIV-03 | Only the data the person approved may go to the AI service (BR-21). |

### 15.4 Accessibility and usability

| ID | Requirement |
|---|---|
| NFR-A11Y-01 | All screens must meet WCAG 2.2 Level AA. Automated check: zero axe-core violations of level A or AA. |
| NFR-A11Y-02 | All actions must work with a keyboard only. Dialogs must hold focus and return it on close. |
| NFR-A11Y-03 | Touch targets on phones must be at least 44 × 44 CSS px. |
| NFR-UX-01 | Layout must work from 360 px to 1440 px wide with no horizontal scroll. |
| NFR-UX-02 | Supported browsers: the latest 2 versions of Chrome, Edge, Firefox and Safari (desktop and mobile). |
| NFR-UX-03 | Light and dark themes must both meet the contrast rules in NFR-A11Y-01. |

### 15.5 Reliability and operations

| ID | Requirement |
|---|---|
| NFR-REL-01 | A logged set, food item or check-in must not be lost when the network fails after the person selects save. The app must show the failure and keep the input for a retry. |
| NFR-REL-02 | When the AI service is not available, the app must show a clear message, and manual entry must still work. |
| NFR-OPS-01 | The API must give `/health` (process alive) and `/ready` (database reachable) endpoints. |
| NFR-OPS-02 | Logs must be structured JSON with a request ID on each line. |
| NFR-OPS-03 | Database changes must be made only with versioned migrations. |

### 15.6 Data

| ID | Requirement |
|---|---|
| NFR-DATA-01 | Timestamps are stored in UTC. Each entry also stores its journal day (date in the person's time zone at the time of the entry). |
| NFR-DATA-02 | Weights are stored with the unit they were entered in. |
