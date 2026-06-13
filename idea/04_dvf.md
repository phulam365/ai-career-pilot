# DVF Framework: AI Career Path Copilot

## Desirable (for users)
**Yes.** Early-career tech talent in Vietnam faces a sharp transition problem: they have a CV, some coursework, and maybe a few projects, but do not know which jobs are realistic, whether their CV is ATS-friendly, or how to tailor it safely for one specific JD. Existing job boards surface opportunities, but not trustworthy action plans. Existing learning tools surface courses, but not JD-specific readiness. A product that starts from the user's current CV and provides controlled, review-based personalization solves an immediate and painful need.

## Viable (for businesses)
**Yes, with the strongest path being B2B2C.**
*   **University and Bootcamp Partners:** Career centers, training programs, and bootcamps need stronger employability outcomes and better student placement rates.
*   **Recruitment and Hiring Partners:** Recruiters and employers benefit when candidates arrive with clearer skill signaling and more role-relevant applications.
*   **B2C Premium Layer:** Individual users may pay for premium exports, deeper roadmap tracking, mock interview prep, or higher-frequency job matching, though pure B2C monetization is likely weaker than institutional distribution.
*   **Strategic Value:** The product creates a strong data loop around candidate readiness, skill gaps, job-fit patterns, and roadmap completion.

## Feasible (for engineers)
**Yes.**
*   **Input Data:** The system can start with one uploaded CV as the core source of truth.
*   **ATS Conversion:** Parsing and restructuring CVs into ATS-friendly sections is technically manageable with a combination of parsing rules and LLM assistance, provided there is a required user review step.
*   **Job Matching:** Semantic matching between structured CV data and job descriptions is feasible using embeddings, ranking models, and rule-based safeguards.
*   **Controlled CV Generation:** Generating one JD-specific CV from the approved ATS CV is feasible if every generated claim is tied to existing evidence.
*   **Roadmap Logic:** Gap detection and roadmap generation are feasible when scoped to a small number of target roles and supported by predefined skill frameworks.
*   **Key Constraints:** Reliable job-platform access will likely require official APIs, licensed job feeds, or selected partnerships rather than uncontrolled scraping.
