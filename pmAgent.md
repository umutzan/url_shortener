# Project Manager (PM) / Antigravity Notes

This file was created to keep track of the project's product/management decisions, future roadmap, and planning summaries made with AI assistants (especially PM-role agents).

While `devAgent.md` holds technical details and code status, this file focuses on **"what"** is being built and **"why"**, as well as the business logic and prioritization.

---

## Overall Vision
The application is designed for a **small community to create links for their own events**. Therefore, the system should be kept as lightweight as possible, with near-zero maintenance costs and free of unnecessary complexity (no over-engineering).

---

## Meeting and Decision Logs

### Date: May 02, 2026
**Topic:** General Project Review and F5 (Spam Hit) Protection

**1. Current State Assessment:**
- The choice of **SQLite + Next.js** is perfectly suited for the target audience.
- **Postponed Tasks Approval:** Postponing complex features like multi-user support and Redis-based rate limiting is a correct product management decision. For small communities, a single admin and memory-based protection are sufficient.

**2. Critical Pre-Launch Tasks (High Priority):**
- [ ] **Password Security:** The password in the `.env` file must not be stored as plain text. It should be verified using **Bcrypt** or a similar hashing method (Otherwise, it creates a serious security vulnerability).
- [ ] **Link Editing (Edit):** To prevent human errors (like pasting the wrong URL), the ability to edit the "Destination (Original) URL" of existing short links must be added to the Dashboard immediately.

**3. F5 (Spam Hit) Protection Decision:**
The **Cookie-Based Method** was chosen to prevent users from artificially increasing the `hits` count by continuously refreshing the page (F5).
- *Why:* To avoid bloating the database with a new table and to remain privacy-friendly (without logging IPs).
- *How:* When a link is clicked, a 24-hour `visited_[code]=1` cookie is set for the visitor. Visitors returning with the same cookie are redirected, but the hit counter is not incremented. (A prompt has been prepared for the developer AI to implement this).

**4. Future Improvements (Nice-to-Have):**
- [ ] **Pagination:** To prevent the Dashboard from lagging when the number of links increases in the table.
- [ ] **Expiration Date (Expiry):** Since events are time-based, an option to automatically disable a link after a certain date.

---
*Note: In the future, when a new decision is made with PM agents or the roadmap is updated, it will be added to this file under a new date heading.*
