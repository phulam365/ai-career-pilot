# Product Requirements Document (PRD): AI Career Path Copilot

## Objective
Provide early-career tech talent in Vietnam with a trustworthy workflow that starts from one uploaded CV, converts it into an ATS-friendly master version, finds suitable jobs from job platforms, and helps the user manually generate one truthful, job-specific CV for one selected JD. When there is a skill gap, the product should generate one JD-specific roadmap and later allow evidence-based CV updates after the user completes roadmap items.

## Target Audience
**Primary:** Final-year Computer Science and IT students in Vietnam.  
**Secondary:** Fresh graduates and junior tech workers with 0 to 2 years of experience.

## Value Proposition
Replace blind job applications and generic course recommendations with a controlled, personalized workflow that tells the user:
*   which jobs fit their current CV
*   how to convert their CV into ATS-friendly structure
*   how to tailor one CV for one selected JD without fabricating skills
*   what to learn next when there is a gap

## User Stories / Requirements
*   **As a user,** I want to upload my current CV as a Word or PDF file so that the system can use my real background as the source of truth.
*   **As a user,** I want the system to convert my uploaded CV into an ATS-friendly master CV draft so that I can improve structure and keyword readability.
*   **As a user,** I want to review and edit the ATS-converted CV before approving it so that the system does not silently change or misrepresent my background.
*   **As a user,** I want the system to search job platforms and show matching JDs ranked by fit so that I know which jobs are realistic now, even when a JD's years-of-experience or salary fields do not match perfectly but the real evidence in my CV still looks strong.
*   **As a user,** I want the system to auto-generate a first JD-specific CV draft after I open one selected JD so that I can immediately see a tailored version based on my approved CV evidence.
*   **As a user,** I want the generated JD-specific CV to be based only on approved ATS content and supported evidence from my existing CV so that it stays truthful.
*   **As a user,** I want to review the generated JD-specific CV before exporting or using it so that I stay in control of the final application document.
*   **As a user,** I want to add feedback and regenerate the JD-specific CV so that the next version better reflects my target emphasis without inventing new claims.
*   **As a user,** I want the system to explain where my CV matches or misses the JD so that I understand the recommendation logic.
*   **As a user,** I want one roadmap for one selected JD when I am not yet a full match so that my learning plan is tied to a real target role.
*   **As a user,** I want to mark roadmap items as completed and attach supporting proof so that later CV updates can reflect real progress.
*   **As a user,** I want to manually trigger an updated JD-specific CV after roadmap progress so that the system does not add new claims automatically.

## Scope
*   **In Scope:**
    *   Uploading one CV in Word or PDF format and parsing it into structured sections.
    *   ATS-friendly master CV generation.
    *   Mandatory user review and approval of ATS conversion.
    *   Matching the approved CV against job descriptions from supported job sources.
    *   Evidence-based JD matching that can still surface roles when years-of-experience labels are imperfect or the salary field is negotiable.
    *   One selected JD producing one auto-generated tailored CV draft.
    *   Feedback-based regeneration of the JD-specific CV draft.
    *   Mandatory user review of the JD-specific CV draft.
    *   One selected JD producing one gap roadmap when needed.
    *   Evidence-based CV update flow after roadmap completion.
*   **Out of Scope:**
    *   Auto-applying to jobs.
    *   Adding unsupported skills, fake work experience, or inflated proficiency claims.
    *   Broad course marketplace functionality.
    *   Full recruiter CRM or employer ATS functionality.

## Dependencies & Assumptions
*   **Technical Dependency:** Requires reliable access to job descriptions through official APIs, licensed feeds, or approved integrations with job platforms.
*   **Technical Dependency:** Requires a CV parsing and structured data extraction layer robust enough for common resume formats in English and Vietnamese.
*   **Product Assumption:** Users are willing to review ATS conversion output before job matching and CV generation.
*   **Product Assumption:** Users prefer manual control and truthful output over fully automatic rewriting.
*   **Business Assumption:** Universities, bootcamps, or training partners value measurable employability improvements enough to become early distribution partners.
