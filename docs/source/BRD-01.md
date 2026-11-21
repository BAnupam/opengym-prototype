# BRD-01 — OpenGym: Business Requirements

| Field | Value |
|---|---|
| Document | BRD-01 |
| Product | OpenGym — a personal training journal |
| Version | 1.0 (frozen when planning starts) |
| Date | 2026-11-21 |
| Owner | Product Owner (PO) |
| Related | SRS-01 (functional and non-functional requirements), TDD-01 (technical design) |
| Visual reference | Interactive prototype: https://banupam.github.io/opengym-prototype/ |

This BRD is frozen when the PO starts planning. Later changes come as a new BRD (BRD-02 and up). They do not come as a new version of this document.

---

## 1. Purpose

OpenGym is a web application. A person uses it to keep a journal of three habits:

- **Movement** — strength workouts, logged one set at a time.
- **Nourishment** — meals, with calories and macronutrients.
- **Recovery** — sleep, water and energy check-ins.

OpenGym shows the person their own rhythm over time. It does not judge the person. It gives a light game layer: **personas** that reflect the habits a person keeps, and **quests** that are short chapters with a goal.

An **AI coach** answers questions about the person's progress. It uses only the data that the person logged.

## 2. Business goals

| ID | Goal | Measure of success |
|---|---|---|
| BG-01 | Make logging fast enough to do during a workout. | A user logs one set in 1 tap after the first set of an exercise. |
| BG-02 | Make the person come back by choice, not by pressure. | 40% of users who log on day 1 log again in days 2–7 (product metric, after launch). |
| BG-03 | Give a correct picture of the person's habits. | Every number on every screen agrees with the logged data and with every other screen. |
| BG-04 | Keep the person's data private and under their control. | The person can export all their data and delete their account. No data goes to an AI service without the person's approval. |
| BG-05 | Give useful AI help that does not invent facts. | Coach answers refer only to logged records. Meal estimates are shown for the person to check before they are saved. |

## 3. Users

| User | Description |
|---|---|
| Journal user | An adult who trains in a gym or at home. Signs in with a Google account. Uses a phone during workouts and a phone or laptop at other times. |
| Demo visitor | A person who wants to try OpenGym before they sign in. Uses one of 3 sample journals. |

There are no administrator users in this release. There is no social or sharing feature.

## 4. Tone and principles

These principles apply to all text and all behavior in the product:

1. **No judgement.** OpenGym never says a person failed. Missed days are normal. Rest is part of training.
2. **Only logged data.** Every statement comes from what the person logged. OpenGym does not guess about a person's health or identity.
3. **No complete set.** Personas are not a collection to finish. A person is not expected to earn every persona.
4. **The person decides.** The person can change the plan during a workout, pause the persona evaluation, and correct any entry.

## 5. Scope

### 5.1 In scope

| Area | Business capability |
|---|---|
| Access | Sign in with Google. Sign out. Try OpenGym with a demo journal. |
| Profile | Display name, weight unit (kg or lb), daily nutrition targets, training goal, appearance (theme and accent colour). |
| Workouts | Start a workout from a template. Log sets one at a time (weight, reps, optional effort). Rest stopwatch. Change exercise order. Swap an exercise when equipment is busy. Correct logged sets. Plate calculator. Finish and save a workout. Workout history. |
| Exercise library | A list of exercises to use in workouts. The person can add their own exercises. |
| Nutrition | Log meals in 4 slots (breakfast, lunch, dinner, snack). Enter food by hand, or get an AI estimate from a description or a photo. Repeat "usual" meals. See the day's totals against the targets. |
| Recovery | Daily check-in: sleep hours, water litres, energy (1–5), optional notes. Check-in history. |
| Daily overview | The day's summary: days with entries, protein, active workout, nutrition, recovery, the 7-day rhythm, recent activity, and a free-text quick log. A date picker shows any earlier day. |
| Personas | 6 personas. Each persona reflects one habit pattern in a rolling 28-day window. A persona is active, resting, or not yet met. The person can pause the evaluation. |
| Seasons and quests | Quests are 14-day or 28-day chapters. Each quest supports one or more personas. A 35-day activity heatmap and a journal streak. |
| AI coach | Questions and answers about the person's training, nutrition and recovery. The person approves the data share each time they ask. Side panels show the context the coach uses. |
| Data control | Export the journal as JSON. Export to a personal Google Sheet. Delete the account and all data. |

### 5.2 Out of scope

- Native mobile apps. (The web application must work well on a phone browser.)
- Wearable devices and health platform imports.
- Social features, sharing, leaderboards, friends.
- Payments and subscriptions.
- Medical advice. The coach must not give a diagnosis or a treatment.
- Languages other than English.
- Import from Google Sheets. (Export only. Edits in the sheet are not read back.)

## 6. Business rules

These rules define the product. SRS-01 gives the full detail.

### 6.1 Journal and days

- BR-01: A **journal day** is a calendar day in the person's own time zone.
- BR-02: A day **has a journal entry** when the person logged at least one of: a completed workout, a food item, or a recovery check-in. Several entries on one day count as one day.
- BR-03: An entry belongs to the journal day on which it happened, not the day on which it was saved. The person can log for an earlier day from the date picker.

### 6.2 Workouts

- BR-04: A person has a maximum of one active workout at a time.
- BR-05: A template creates a workout with three planned sets for each exercise.
- BR-06: A set is logged only when the person logs it. Planned sets that are not logged when the workout is saved stay unlogged. They do not count in totals.
- BR-07: Each workout keeps the weight unit that was set when it started. A later change of the unit setting does not change earlier workouts.
- BR-08: Volume = the sum of (weight × reps) for all logged sets.

### 6.3 Nutrition

- BR-09: The day's totals are the sum of all food items logged for that journal day. All screens use the same totals.
- BR-10: Remaining calories = daily calorie target − calories logged for that day.
- BR-11: An AI estimate is a proposal. It is saved only when the person accepts it. The person can change portions and items before they accept it.

### 6.4 Recovery

- BR-12: A recovery check-in records sleep (hours), water (litres) and energy (1 Very low – 5 Excellent). Notes are optional.

### 6.5 Personas

| Persona | Habit it reflects | Qualifying rule in the rolling 28-day window |
|---|---|---|
| Sage — The All-Rounder | A balanced rhythm | 2 days with movement, 2 days with meals and 2 days with recovery. Each category needs 2 days. |
| Atlas | Steady strength | 3 days with a completed strength workout. |
| Nova | Bodyweight practice | 3 days with a completed bodyweight workout. |
| Dash | Endurance practice | 3 days with a completed endurance workout. |
| Cleo | Nourishment awareness | 5 days with at least one meal logged. |
| Luna | Making room for rest | 5 days with a recovery check-in. |

- BR-13: A persona is **active** when its qualifying rule is met in the current window.
- BR-14: A persona is **resting** when it was active before and its rule is not met in the current window.
- BR-15: When the person pauses the roster, the window stops moving. Logging continues. Persona states do not change until the person resumes.
- BR-16: Persona text must state that it reflects only logged activity. It is not a judgement of health or identity.

### 6.6 Quests

- BR-17: A quest has a name, a length (14 or 28 days), a start date, an end date, and the personas it supports.
- BR-18: A quest shows progress for each persona it supports.
- BR-19: The person can remove a quest. Removing a quest does not delete any journal data.

### 6.7 AI features

- BR-20: The AI coach uses only the person's own logged records.
- BR-21: Before each coach question is sent, the person approves the journal data share.
- BR-22: The coach does not give medical advice.
- BR-23: A meal photo is sent to the AI service only for the estimate. OpenGym does not keep the photo.

### 6.8 Privacy and data

- BR-24: A person can see and change only their own data.
- BR-25: A person can export all their data.
- BR-26: When a person deletes their account, OpenGym deletes all their data.
- BR-27: Demo journals are separate from real accounts. A demo visitor never sees a real person's data, and one demo journal never shows another demo journal's data.

## 7. Known defects in the prototype

The prototype is a visual reference only. These defects must **not** be copied:

| # | Defect in the prototype | Correct behavior |
|---|---|---|
| PD-01 | The overview shows 1,200 kcal. The nutrition screen shows 508 kcal for the same day. | BR-09: one total, the same on all screens. |
| PD-02 | "Remaining kcal" shows 1,300 in one place and 552 in another. | BR-10. |
| PD-03 | The coach shows 27 g protein. The overview shows 80 g protein for the same day. | BR-09. |
| PD-04 | The "fresh start" demo journal (Sam) shows the meals and the active workout of another demo journal (Alex). | BR-27. |
| PD-05 | A persona shows "3 / 2 qualifying days" for Sage. The rule needs 2 days in each of 3 categories. | The progress display must agree with the rule (BR-13). |
| PD-06 | "Your usuals" shows the same meal three times. | A usual meal appears once. |

## 8. Assumptions and constraints

- Users have a Google account.
- An AI service is available for the coach and the meal estimate. TDD-01 names the service.
- The product is delivered by the IRIS delivery pipeline, as a set of FRDs. Each FRD is one IRIS run.
- The environment ladder is DEV → SIT → UAT.

## 9. Glossary

| Term | Meaning |
|---|---|
| Journal day | A calendar day in the person's time zone. |
| Entry | A completed workout, a food item, or a recovery check-in. |
| Template | A named list of exercises used to start a workout (Push, Pull, Leg, Full Body). |
| Set | One group of repetitions of an exercise, with a weight and a rep count. |
| Effort | An optional rating of how hard a set felt. |
| Usual | A meal the person logged before and can log again with one action. |
| Persona | A character that reflects one habit pattern. |
| Window | The rolling 28-day period used to evaluate personas. |
| Quest | A 14-day or 28-day chapter that supports one or more personas. |
| Roster | The personas that are active or resting for the person. |
