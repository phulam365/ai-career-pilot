# Design Thinking Document: AI Career Path Copilot

## Empathize
**Users:** Final-year Computer Science and IT students, fresh graduates, and junior tech workers with 0 to 2 years of experience in Vietnam.

**Context & Feelings:** They are under pressure to become employable quickly, but the path is unclear. They are surrounded by conflicting advice from universities, bootcamps, recruiters, social media, and peers. Many feel anxious because they do not know whether they are actually qualified for roles like Frontend Developer, Backend Developer, QA Engineer, Data Analyst, or AI Engineer. They worry that they are learning the wrong things, building the wrong projects, or falling behind peers in a crowded market.

**Challenges:** They struggle to connect their current CV to real job opportunities and do not know which openings they can realistically target right now. Job descriptions are inconsistent and filled with jargon, while many users do not know how to rewrite their CV into ATS-friendly language without exaggerating or inventing skills. Existing job boards only show openings, and learning platforms only show courses. Neither tells the user which jobs fit their current CV, how to safely tailor the CV for one specific JD, or what they should learn next when there is a gap.

## Define
**Core Problem:** Vietnam's early-career tech talent lacks a trustworthy, personalized workflow that starts from their existing CV, finds realistic job opportunities, converts their CV into an ATS-friendly structure, and helps them tailor that CV to a specific job description without fabricating experience. When gaps exist, they also lack clear, job-specific roadmaps that show what to learn next and how new learning can later be reflected in the CV.

## Ideate
*   *Idea 1:* A smarter Vietnam tech job board that matches uploaded CVs to relevant job descriptions and ranks fit.
*   *Idea 2:* A CV rewriting assistant that converts a user's uploaded CV into ATS format and tailors it to one specific JD only when the user requests it.
*   *Idea 3:* An integrated AI copilot that starts from one uploaded CV, finds suitable jobs, lets the user review an ATS-converted master CV, and then generates one tailored CV plus one roadmap per selected JD. **(Selected Idea)**

## Prototype
**"AI Career Path Copilot"**

We will build a frontend prototype that demonstrates a CV-first, human-in-the-loop workflow from uploaded resume to job targeting. The prototype will show the core flow:
1. User uploads a CV in Word or PDF format.
2. The system converts the CV into a structured ATS-friendly master CV draft.
3. The user reviews and edits the ATS conversion before approving it.
4. The system searches job platforms and returns a ranked list of suitable JDs. Matching should not be blocked only because a JD lists different years of experience or a salary range that does not perfectly line up. If the user's CV shows strong relevant experience, the JD can still rank as a match, and salary can still be treated as a match when the posting says it is open to negotiate.
5. The user opens one selected JD, and the system auto-generates a first JD-specific CV draft based only on the approved ATS CV and proven information already present in the user's CV.
6. The user reviews the generated JD-specific CV, adds feedback, and can regenerate another JD-specific version based on that feedback.
7. The user finalizes the JD-specific CV before using it.
8. If the CV does not fully match the JD, the system generates one roadmap for that JD.
9. After the user completes roadmap items, the system can generate an updated JD-specific CV version, again only when the user clicks and reviews it.

The prototype should make the AI feel useful, controlled, and trustworthy rather than magical. The key screens are:
*   ATS CV review screen after upload
*   matched jobs list ranked by fit
*   auto-generated JD-specific CV draft screen
*   user review and feedback screen for generated CV output
*   roadmap screen for missing skills on one selected JD

The core dashboard should answer:
*   Which jobs can I realistically apply for now based on my CV?
*   Where does my CV already align with this JD?
*   What is missing for this specific job?
*   What should I learn next if I want to target this job later?

## Test
We will run usability and concept tests with 12 to 15 users across two groups: final-year CS/IT students and junior developers in Ho Chi Minh City and Hanoi.

**Feedback sought:**
1. Do users trust the ATS-converted CV draft, and do they feel they had enough control to review and correct it?
2. Do users understand that a first JD-specific CV draft is auto-generated after they open one selected JD, and that they can improve it by giving feedback and regenerating it?
3. Does the JD-specific CV feel better aligned to the target job without inventing skills or overstating experience?
4. Does the roadmap feel specific enough to help the user close the gap for that exact JD?
5. After completing roadmap items, do users understand how a new CV version would be generated and reviewed?

**Success indicators:**
*   Users can review and approve the ATS conversion without confusion.
*   Users understand the rule: one selected JD can produce one auto-generated tailored CV draft, feedback-based regenerations, and one roadmap when needed.
*   Most testers can clearly explain one concrete next step for a matched job after using the prototype.
*   Users report that the product feels trustworthy because it does not auto-apply, auto-rewrite, or auto-claim unsupported skills.
