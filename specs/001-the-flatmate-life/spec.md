# Feature Specification: Flatmate Life Tracker

**Feature Branch**: `001-the-flatmate-life`
**Created**: 2025-10-04
**Status**: Draft
**Input**: User description: "The Flatmate Life Tracker is an all-in-one app designed to make shared living easier, fairer, and more organized. It allows flatmates to track expenses by splitting both household bills and casual non-household costs like drinks or takeout, while a balance dashboard keeps everyone clear on who owes what. A shared groceries tracker helps avoid double-buying and ensures everyone's contributions are visible, making food shopping much simpler. The app also includes a cleaning tracker with rotating chores and reminders, so the workload is shared fairly and nothing is forgotten. To support health and accountability, there's a gym tracker where flatmates can log sessions, track progress, and even set collective fitness goals together. Beyond this, the app provides shared notes for things like shopping lists, reminders for important events such as bill due dates, and a lightweight chat board for house communication. Altogether, it creates a fair, transparent, and supportive system for managing both the practical and social sides of living with a flatmate.. Also do not implement user auth for now but can be added later"

## Execution Flow (main)
```
1. Parse user description from Input
   → If empty: ERROR "No feature description provided"
2. Extract key concepts from description
   → Identify: actors, actions, data, constraints
3. For each unclear aspect:
   → Mark with [NEEDS CLARIFICATION: specific question]
4. Fill User Scenarios & Testing section
   → If no clear user flow: ERROR "Cannot determine user scenarios"
5. Generate Functional Requirements
   → Each requirement must be testable
   → Mark ambiguous requirements
6. Identify Key Entities (if data involved)
7. Run Review Checklist
   → If any [NEEDS CLARIFICATION]: WARN "Spec has uncertainties"
   → If implementation details found: ERROR "Remove tech details"
8. Return: SUCCESS (spec ready for planning)
```

---

## ⚡ Quick Guidelines
- ✅ Focus on WHAT users need and WHY
- ❌ Avoid HOW to implement (no tech stack, APIs, code structure)
- 👥 Written for business stakeholders, not developers

### Section Requirements
- **Mandatory sections**: Must be completed for every feature
- **Optional sections**: Include only when relevant to the feature
- When a section doesn't apply, remove it entirely (don't leave as "N/A")

### For AI Generation
When creating this spec from a user prompt:
1. **Mark all ambiguities**: Use [NEEDS CLARIFICATION: specific question] for any assumption you'd need to make
2. **Don't guess**: If the prompt doesn't specify something (e.g., "login system" without auth method), mark it
3. **Think like a tester**: Every vague requirement should fail the "testable and unambiguous" checklist item
4. **Common underspecified areas**:
   - User types and permissions
   - Data retention/deletion policies
   - Performance targets and scale
   - Error handling behaviors
   - Integration requirements
   - Security/compliance needs

---

## Clarifications

### Session 2025-10-04
- Q: How should the system identify individual flatmates without authentication? → A: Unique nickname/ID + simple passcode per flatmate
- Q: How should expense splits be configured when not equal? → A: Both fixed amounts and percentages allowed
- Q: What is the chore rotation algorithm? → A: Sequential round-robin with manual override option
- Q: Can flatmates edit or delete each other's entries? → A: View-only for others with dispute/flag mechanism
- Q: What is the maximum number of flatmates per household? → A: 12 flatmates maximum
- Q: How should reminders notify flatmates? → A: 1 day before due date, in-app + optional external (email/SMS)
- Q: When marking an expense as settled, what happens? → A: Marks as paid, creates offsetting settlement transaction, archives from active calculations but preserves all history
- Q: What expense categories should the system support? → A: Predefined with ability to add custom categories
- Q: How should grocery contributions be tracked? → A: Cost only with breakdown by category/type
- Q: How should duplicate grocery items be handled? → A: Manual review (flagged for flatmates to merge/resolve)
- Q: What gym session metrics should be tracked beyond date/duration? → A: Light tracking: session type (cardio/strength/other) + optional notes
- Q: How far back can users view historical data? → A: Configurable retention period per household
- Q: Are backdated entries allowed for gym sessions? → A: Yes, unlimited backdating allowed
- Q: What depth of inventory management is needed for grocery items? → A: Very simple list
- Q: How should timezone handling work for timestamps? → A: Browser/device local timezone automatically
- Q: What happens when adding a new flatmate mid-session to an existing household? → A: Full historical access + optional retroactive inclusion in past expenses/chores

## User Scenarios & Testing *(mandatory)*

### Primary User Story
A group of flatmates living together needs a centralized system to manage their shared household responsibilities and expenses. They want to track who paid for what, ensure chores are distributed fairly, coordinate grocery shopping without duplication, support each other's fitness goals, and communicate about household matters—all in one place. The app should provide transparency and fairness, reducing conflicts over money and chores while fostering a cooperative living environment.

### Acceptance Scenarios
1. **Given** two flatmates share an apartment, **When** one flatmate pays a $120 electricity bill and splits it equally, **Then** the system shows each flatmate owes $60, and the balance dashboard reflects one flatmate owes the other $60.

2. **Given** flatmates have a rotating cleaning schedule, **When** a new week begins, **Then** the system automatically assigns the next person in rotation to each chore and sends reminders.

3. **Given** a flatmate purchases milk and bread at the grocery store, **When** they log these items with the cost, **Then** other flatmates can see what's been bought and the contribution is tracked against that person's account.

4. **Given** flatmates want to collectively go to the gym 20 times this month, **When** each flatmate logs their gym sessions, **Then** the system shows progress toward the collective goal and individual contributions.

5. **Given** a flatmate needs to remember when the internet bill is due, **When** they create a reminder for the bill due date, **Then** all flatmates receive an in-app notification 1 day before the due date, with optional email/SMS notifications if configured.

6. **Given** flatmates are communicating about a house party, **When** they post messages on the chat board, **Then** all flatmates can see the conversation in chronological order.

7. **Given** a flatmate goes out for takeout and another flatmate wants to contribute, **When** they split the $45 cost unevenly (e.g., $30/$15), **Then** the balance dashboard updates to reflect the split amounts owed.

### Edge Cases
- What happens when a flatmate marks a chore as complete but another disputes it? Flatmates can flag/dispute entries created by others; flagged items are marked for review but remain visible until the creator modifies or confirms.
- How does the system handle when someone moves out mid-month with outstanding balances? Flatmates must settle all outstanding balances before removal; settlement creates offsetting transactions and archives the balances while preserving history.
- What happens if two flatmates simultaneously add the same grocery item? System flags potential duplicates (same or similar item names) for manual review; flatmates can merge the entries or confirm as separate purchases.
- How are expenses handled when splitting isn't equal (e.g., 3-way split where one person pays nothing)? System supports both custom fixed amounts and custom percentages; the payer can specify exact amounts or percentages for each participant.
- What happens when a flatmate deletes an expense that others have already acknowledged? Only the creator can delete their own entries; other flatmates have view-only access and can flag entries for dispute.
- How far back can users view historical data (old expenses, completed chores, past gym sessions)? Households can configure retention period (6 months, 12 months, unlimited); default is 12 months active view with older data archived but accessible.
- What happens if someone logs a gym session for a past date? Backdating is allowed without restriction; flatmates can log sessions for any past date.
- How are reminders dismissed or marked as complete?
- Can flatmates edit or delete each other's entries (expenses, chores, groceries)? No; each flatmate can only edit/delete their own entries, but can flag others' entries for dispute.

## Requirements *(mandatory)*

### Functional Requirements

#### Expense Tracking & Balances
- **FR-001**: System MUST allow flatmates to record household bill expenses with description, amount, payer, and date
- **FR-002**: System MUST allow flatmates to record casual non-household expenses (drinks, takeout) with description, amount, payer, and date
- **FR-003**: System MUST support splitting expenses equally among all flatmates
- **FR-004**: System MUST support splitting expenses among a subset of flatmates using either custom fixed amounts (e.g., $30/$15) or custom percentages (e.g., 70/30)
- **FR-005**: System MUST maintain a running balance for each flatmate showing total owed/owing
- **FR-006**: System MUST display a balance dashboard showing who owes whom and how much
- **FR-007**: System MUST allow flatmates to mark expenses as settled; settlement creates an offsetting transaction that zeros the active balance while preserving complete historical records; settled expenses are archived from active balance calculations
- **FR-008**: System MUST categorize expenses using predefined categories (Bills, Groceries, Takeout, Entertainment, Other) and allow flatmates to create custom categories for household use
- **FR-009**: System MUST allow flatmates to view expense history with filtering and sorting capabilities; historical data retention period is configurable per household (default: 12 months active view)
- **FR-009a**: System MUST allow only the creator to edit or delete their own expense entries
- **FR-009b**: System MUST allow flatmates to flag/dispute expense entries created by others; flagged items remain visible and marked for review

#### Groceries Tracker
- **FR-010**: System MUST allow flatmates to log grocery items purchased with item name, cost, category/type, and purchaser
- **FR-011**: System MUST display a shared groceries list showing what's been bought and by whom
- **FR-012**: System MUST track each flatmate's grocery contributions by total cost with breakdown by item category/type
- **FR-013**: System MUST flag potential duplicate grocery purchases (same or similar item name) for manual review; flatmates can merge duplicates or confirm as separate entries
- **FR-014**: System MUST allow flatmates to remove items from the groceries list; no inventory tracking (quantity, expiration, location) required—simple list view only
- **FR-014a**: System MUST allow only the creator to edit or delete their own grocery entries
- **FR-014b**: System MUST allow flatmates to flag/dispute grocery entries created by others

#### Cleaning Tracker
- **FR-015**: System MUST allow creation of recurring chores with name, frequency, and assigned flatmate
- **FR-016**: System MUST support rotating chore assignments automatically using sequential round-robin algorithm (Person A → Person B → Person C → Person A...)
- **FR-016a**: System MUST allow manual override to assign next rotation to a specific flatmate outside the automatic sequence
- **FR-017**: System MUST send in-app reminders to assigned flatmates 1 day before chore due date, with optional email/SMS notifications
- **FR-018**: System MUST allow flatmates to mark chores as complete
- **FR-019**: System MUST track chore completion history showing who completed what and when
- **FR-020**: System MUST display current chore assignments for all flatmates

#### Gym Tracker
- **FR-022**: System MUST allow flatmates to log gym sessions with date (past, present, or future), duration, session type (cardio, strength, other), and optional notes; backdating is allowed without time restriction
- **FR-023**: System MUST track individual gym session history and progress over time
- **FR-024**: System MUST support setting collective fitness goals (e.g., total gym sessions per month)
- **FR-025**: System MUST display progress toward collective fitness goals showing individual contributions
- **FR-026**: System MUST display individual gym statistics including total sessions, frequency, streaks, and breakdown by session type
- **FR-027**: System MUST allow only the creator to edit or delete their own gym session entries
- **FR-027a**: System MUST allow flatmates to flag/dispute gym session entries created by others

#### Shared Notes & Reminders
- **FR-028**: System MUST allow flatmates to create shared notes with title and content
- **FR-029**: System MUST support different note types including shopping lists and general reminders
- **FR-030**: System MUST allow flatmates to create event reminders with description and due date
- **FR-031**: System MUST send in-app notifications 1 day before reminder due date, with optional email/SMS notifications if flatmate has configured external notifications
- **FR-032**: System MUST allow only the creator to edit and delete their own shared notes
- **FR-032a**: System MUST allow flatmates to flag/dispute notes created by others
- **FR-033**: System MUST support collaborative editing of shopping lists (adding/removing items) with all flatmates able to contribute

#### Communication Board
- **FR-034**: System MUST provide a chat board for flatmates to post messages
- **FR-035**: System MUST display messages in chronological order
- **FR-036**: System MUST show message author and timestamp
- **FR-037**: System MUST allow flatmates to read chat history; retention period is configurable per household (default: 12 months active view)
- **FR-038**: System MUST allow flatmates to delete only their own messages
- **FR-038a**: System MUST allow flatmates to flag/dispute messages created by others

#### General System Requirements
- **FR-039**: System MUST support multiple flatmates in a single household with a maximum limit of 12 flatmates
- **FR-040**: System MUST identify flatmates by unique nickname/ID and require a simple passcode (4-digit code) for access; each flatmate creates their ID and passcode during initial setup
- **FR-041**: System MUST persist all data across sessions
- **FR-042**: System MUST allow adding new flatmates to the household; new flatmates receive full access to historical data and can be optionally included retroactively in specific past expenses or chore rotations if needed
- **FR-043**: System MUST allow removing flatmates from the household; flatmates with outstanding balances must settle all debts before removal; removal preserves all historical data for records
- **FR-044**: System MUST display timestamps for all user-generated content using browser/device local timezone automatically
- **FR-045**: System MUST allow households to configure historical data retention period (e.g., 6 months, 12 months, unlimited); default is 12 months active view with older data archived but accessible

### Key Entities

- **Flatmate**: Represents an individual living in the shared household with a unique nickname/ID, 4-digit passcode, and tracked balances; participates in all household activities including expenses, chores, groceries, gym sessions, and communications.

- **Expense**: Represents a financial transaction with description, amount, payer, date, category (predefined: Bills, Groceries, Takeout, Entertainment, Other; or custom user-created), split participants, and individual split amounts; can be household bills or casual non-household costs.

- **Balance**: Represents the financial relationship between two flatmates showing amount owed from one to another; derived from expense splits and settlements; includes both active (unsettled) and archived (settled) states with complete historical transaction record.

- **Grocery Item**: Represents a purchased grocery item with name, cost, category/type, purchaser, and purchase date; simple list view with no inventory tracking (no quantity, expiration, or location management); contributes to shared groceries visibility and individual contribution tracking by cost with category breakdown.

- **Chore**: Represents a recurring household task with name, frequency, sequential round-robin rotation sequence, current assignee, and completion history; automatically rotates among flatmates with optional manual override.

- **Chore Assignment**: Represents a specific instance of a chore assigned to a flatmate with due date, completion status, and completion timestamp.

- **Gym Session**: Represents a workout session logged by a flatmate with date, duration, session type (cardio, strength, other), optional notes, and associated flatmate; contributes to individual and collective fitness tracking with metrics breakdown by session type.

- **Fitness Goal**: Represents a collective fitness target for all flatmates with description, target metric, target value, time period, and current progress.

- **Note**: Represents a shared piece of information with title, content, type (shopping list, general reminder, etc.), creator, creation date, and modification history.

- **Reminder**: Represents a time-based alert with description, due date, creator, notification status (in-app, email, SMS), and associated flatmates; triggers notifications 1 day before due date.

- **Chat Message**: Represents a communication on the house board with content, author, timestamp, and edit/deletion history.

---

## Review & Acceptance Checklist
*GATE: Automated checks run during main() execution*

### Content Quality
- [x] No implementation details (languages, frameworks, APIs)
- [x] Focused on user value and business needs
- [x] Written for non-technical stakeholders
- [x] All mandatory sections completed

### Requirement Completeness
- [x] No [NEEDS CLARIFICATION] markers remain
- [x] Requirements are testable and unambiguous
- [x] Success criteria are measurable
- [x] Scope is clearly bounded
- [x] Dependencies and assumptions identified

---

## Execution Status
*Updated by main() during processing*

- [x] User description parsed
- [x] Key concepts extracted
- [x] Ambiguities marked and resolved via clarification workflow
- [x] User scenarios defined
- [x] Requirements generated
- [x] Entities identified
- [x] Review checklist passed (SUCCESS: All ambiguities resolved through 16 clarification questions)

- 
---
