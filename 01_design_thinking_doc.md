# Design Thinking Document: AI Career Path Copilot

## Empathize
**Users:** Final-year Computer Science and IT students, fresh graduates, and junior tech workers with 0 to 2 years of experience in Vietnam.

**Context & Feelings:** They are under pressure to become employable quickly, but the path is unclear. They are surrounded by conflicting advice from universities, bootcamps, recruiters, social media, and peers. Many feel anxious because they do not know whether they are actually qualified for roles like Frontend Developer, Backend Developer, QA Engineer, Data Analyst, or AI Engineer. They worry that they are learning the wrong things, building the wrong projects, or falling behind peers in a crowded market.

**Challenges:** They struggle to connect their current skills, coursework, certificates, GitHub activity, and interests to real job outcomes. University curricula are often too broad or too theoretical, while job descriptions are inconsistent and filled with jargon. Existing job boards only show openings, and learning platforms only show courses. Neither tells the user what role fits them best, what skill gaps are blocking them, or what they should do next in a practical, personalized order.

## Define
**Core Problem:** Vietnam's early-career tech talent lacks personalized, outcome-oriented guidance that connects current skills and learning progress to realistic job opportunities. As a result, students and junior workers waste time on generic learning paths, build weak portfolios, and struggle to transition efficiently from education into their first meaningful tech role.

## Ideate
*   *Idea 1:* A smarter Vietnam tech job board with AI semantic matching between CVs and job descriptions.
*   *Idea 2:* A personalized learning planner that recommends courses, projects, and certifications based on a target role.
*   *Idea 3:* An integrated AI copilot that combines skill assessment, learning-path planning, portfolio guidance, and internship/job matching into one experience. **(Selected Idea)**

## Prototype
**"AI Career Path Copilot"**

We will build a frontend prototype that demonstrates the end-to-end transition from learning to employability. The prototype will show the core flow:
1. User uploads a CV and optionally connects GitHub.
2. User selects target roles such as Frontend Developer, Backend Developer, QA Engineer, Data Analyst, or AI Engineer.
3. The system generates a personalized skill profile and role match scores.
4. The user sees an explainable skill-gap analysis with clear reasons for each recommendation.
5. The system presents a 30-day learning plan, one recommended portfolio project, and a shortlist of realistic internships or junior jobs.

The prototype should make the AI feel useful, not magical. The key screen is a personalized dashboard that answers:
*   What role am I closest to today?
*   What am I missing?
*   What should I learn next?
*   What project should I build next?
*   Which roles can I realistically apply for now?

## Test
We will run usability and concept tests with 12 to 15 users across two groups: final-year CS/IT students and junior developers in Ho Chi Minh City and Hanoi.

**Feedback sought:**
1. Do users believe the recommended roles match their actual strengths and interests?
2. Does the skill-gap explanation feel specific and trustworthy, or generic and unhelpful?
3. Does the learning plan feel actionable enough that the user would follow it over the next 30 days?
4. Does showing "realistic jobs you can apply to now" increase motivation and clarity?
5. Are users comfortable sharing CV, GitHub, and learning-history data in exchange for better recommendations?

**Success indicators:**
*   Users can understand their top recommended role within 60 seconds.
*   Most testers can clearly explain one concrete next step after using the prototype.
*   Users report that the product reduces confusion and gives them more confidence in their career direction.
