# Product Requirements Document (PRD): AI Career Path Copilot

## Objective
Build a frontend prototype that helps Vietnam-based final-year CS/IT students, fresh graduates, and junior tech workers identify their best-fit entry-level tech role and receive an explainable action plan to become more employable.

## Target Audience
**Primary:** Final-year CS/IT students and fresh graduates in Vietnam who are preparing for internships, fresher jobs, or junior tech roles.

**Secondary:** Junior tech workers with 0 to 2 years of experience who want to switch roles or strengthen their portfolio.

## Value Proposition
AI Career Path Copilot converts scattered career inputs such as CVs, GitHub projects, interests, and target roles into a clear, personalized employability dashboard. It reduces confusion by showing users the role they are closest to, the skill gaps blocking them, and the next 30 days of practical learning and portfolio work.

## User Stories / Requirements
*   **As a student**, I want to upload my CV so that the product can detect my current skills, education, projects, and experience.
*   **As a student**, I want to optionally connect or paste my GitHub profile so that project evidence can improve my role match.
*   **As a student**, I want to choose target roles such as Frontend Developer, Backend Developer, QA Engineer, Data Analyst, or AI Engineer so that recommendations match my interests.
*   **As a student**, I want to see role match scores so that I can understand which entry-level paths are most realistic for me today.
*   **As a student**, I want each recommendation to explain its reasoning so that I can trust the result and identify what evidence supports it.
*   **As a student**, I want to see my top skill gaps so that I know what to learn next instead of taking random courses.
*   **As a student**, I want a 30-day learning plan so that I can make visible progress toward my target role.
*   **As a student**, I want one recommended portfolio project so that I can build proof of ability for recruiters.
*   **As a student**, I want to see realistic internship or junior job examples so that I know whether to apply now or improve first.

## Scope
**In Scope for Hackathon MVP**
*   CV upload or pasted CV text input.
*   Optional GitHub profile input.
*   Target role selection for a small set of entry-level tech roles.
*   Personalized dashboard with role match scores.
*   Explainable skill-gap analysis.
*   30-day learning plan.
*   Recommended portfolio project.
*   Mocked or sample internship/junior job matches.
*   Privacy notice explaining what data is used for recommendations.

**Out of Scope for Hackathon MVP**
*   Real recruiter marketplace.
*   Guaranteed job placement.
*   Full applicant tracking system integration.
*   Production-grade GitHub analytics.
*   Paid subscriptions or payment flow.
*   Multi-language support beyond the primary prototype language.

## Dependencies & Assumptions
*   The prototype can use mocked data or lightweight AI outputs to demonstrate the end-to-end experience.
*   Users are willing to provide a CV if the product explains the value exchange clearly.
*   GitHub connection can be simulated with a pasted profile URL or sample project data for the hackathon demo.
*   Job matches can be represented with curated sample listings instead of live job board integrations.
*   Trust depends on explainability, so every role recommendation must show reasons and gaps rather than only a score.
