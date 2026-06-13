# Prototype Plan: AI Career Path Copilot

## User Flow Diagram
**Happy Path:**
1. User lands on the product and sees the promise: upload one CV and find realistic jobs.
2. User uploads a CV in Word or PDF format.
3. System generates an ATS-friendly master CV draft.
4. User reviews and edits the ATS-converted CV.
5. User approves the ATS master CV.
6. System shows a ranked list of matched jobs using evidence from the CV, not rigid years-of-experience or salary filters alone.
7. User opens one selected JD.
8. System auto-generates one JD-specific CV draft from approved evidence only.
9. User reviews the JD-specific CV draft, adds feedback, and can regenerate it based on that feedback.
10. User finalizes the JD-specific CV draft.
11. If gaps exist, user clicks "Generate Roadmap."
12. System shows one job-specific roadmap.
13. User later marks a roadmap item as completed and attaches proof.
14. User clicks to generate an updated JD-specific CV version.

## Frontend (FE) Prototype Focus
The prototype should focus on trust, reviewability, and clear action-taking rather than flashy automation.

*   **Level of Fidelity:** Mid- to high-fidelity clickable prototype, desktop-first with responsive mobile consideration.
*   **Upload Entry Screen:** The upload step should clearly accept Word and PDF files only.
*   **ATS Review Screen:** This is a core trust screen. The prototype should clearly show the uploaded CV on one side and the ATS-friendly structured version on the other, or show an editable structured view with highlighted changes.
*   **Matched Jobs Screen:** Job cards should show fit level, key matching signals, and missing-skill summary. Fit scoring should favor demonstrated CV evidence over strict years-of-experience labels, and salary mismatch alone should not remove a match when the JD says compensation is negotiable. The user should feel guided toward realistic roles, not overwhelmed by a giant job feed.
*   **JD Detail Screen:** Opening one selected JD should automatically produce a first JD-specific CV draft from approved evidence. The prototype should make that auto-generated behavior explicit, not ambiguous.
*   **JD-Specific CV Review Screen:** The prototype should show which parts were emphasized or rewritten, tie them back to evidence already present in the approved CV, and let the user add feedback to regenerate another version.
*   **Roadmap Screen:** The roadmap should feel practical and tied to one JD, with progress states such as not started, in progress, completed, and proof attached.
*   **Faked Backend:** For the prototype, matched jobs, fit scores, roadmap items, and proof states will use mock data. No real job-platform integration or real CV parsing is required at prototype stage.
