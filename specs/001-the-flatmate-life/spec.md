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

## User Scenarios & Testing *(mandatory)*

### Primary User Story
A group of flatmates living together needs a centralized system to manage their shared household responsibilities and expenses. They want to track who paid for what, ensure chores are distributed fairly, coordinate grocery shopping without duplication, support each other's fitness goals, and communicate about household matters—all in one place. The app should provide transparency and fairness, reducing conflicts over money and chores while fostering a cooperative living environment.

### Acceptance Scenarios
1. **Given** two flatmates share an apartment, **When** one flatmate pays a $120 electricity bill and splits it equally, **Then** the system shows each flatmate owes $60, and the balance dashboard reflects one flatmate owes the other $60.

2. **Given** flatmates have a rotating cleaning schedule, **When** a new week begins, **Then** the system automatically assigns the next person in rotation to each chore and sends reminders.

3. **Given** a flatmate purchases milk and bread at the grocery store, **When** they log these items with the cost, **Then** other flatmates can see what's been bought and the contribution is tracked against that person's account.

4. **Given** flatmates want to collectively go to the gym 20 times this month, **When** each flatmate logs their gym sessions, **Then** the system shows progress toward the collective goal and individual contributions.

5. **Given** a flatmate needs to remember when the internet bill is due, **When** they create a reminder for the bill due date, **Then** all flatmates receive a notification [NEEDS CLARIFICATION: how many days before the due date? Same day? Customizable?]

6. **Given** flatmates are communicating about a house party, **When** they post messages on the chat board, **Then** all flatmates can see the conversation in chronological order.

7. **Given** a flatmate goes out for takeout and another flatmate wants to contribute, **When** they split the $45 cost unevenly (e.g., $30/$15), **Then** the balance dashboard updates to reflect the split amounts owed.

### Edge Cases
- What happens when a flatmate marks a chore as complete but another disputes it? [NEEDS CLARIFICATION: dispute resolution mechanism needed?]
- How does the system handle when someone moves out mid-month with outstanding balances? [NEEDS CLARIFICATION: settlement process not specified]
- What happens if two flatmates simultaneously add the same grocery item? [NEEDS CLARIFICATION: duplicate detection or merging logic?]
- How are expenses handled when splitting isn't equal (e.g., 3-way split where one person pays nothing)? [NEEDS CLARIFICATION: flexible split percentages or fixed amounts?]
- What happens when a flatmate deletes an expense that others have already acknowledged? [NEEDS CLARIFICATION: deletion permissions and impact on balances]
- How far back can users view historical data (old expenses, completed chores, past gym sessions)? [NEEDS CLARIFICATION: data retention/archival policy not specified]
- What happens if someone logs a gym session for a past date? [NEEDS CLARIFICATION: are backdated entries allowed?]
- How are reminders dismissed or marked as complete?
- Can flatmates edit or delete each other's entries (expenses, chores, groceries)?

## Requirements *(mandatory)*

### Functional Requirements

#### Expense Tracking & Balances
- **FR-001**: System MUST allow flatmates to record household bill expenses with description, amount, payer, and date
- **FR-002**: System MUST allow flatmates to record casual non-household expenses (drinks, takeout) with description, amount, payer, and date
- **FR-003**: System MUST support splitting expenses equally among all flatmates
- **FR-004**: System MUST support splitting expenses among a subset of flatmates [NEEDS CLARIFICATION: custom split amounts or percentages?]
- **FR-005**: System MUST maintain a running balance for each flatmate showing total owed/owing
- **FR-006**: System MUST display a balance dashboard showing who owes whom and how much
- **FR-007**: System MUST allow flatmates to mark expenses as settled [NEEDS CLARIFICATION: settlement workflow - does this zero balances or just mark as paid?]
- **FR-008**: System MUST categorize expenses [NEEDS CLARIFICATION: predefined categories or user-defined? Examples?]
- **FR-009**: System MUST allow flatmates to view expense history [NEEDS CLARIFICATION: filtering/sorting capabilities? Date range limits?]

#### Groceries Tracker
- **FR-010**: System MUST allow flatmates to log grocery items purchased with item name, cost, and purchaser
- **FR-011**: System MUST display a shared groceries list showing what's been bought and by whom
- **FR-012**: System MUST track each flatmate's grocery contributions [NEEDS CLARIFICATION: by cost, by item count, or both?]
- **FR-013**: System MUST prevent or flag duplicate grocery purchases [NEEDS CLARIFICATION: automatic prevention, warning, or manual review?]
- **FR-014**: System MUST allow flatmates to mark grocery items as consumed or depleted [NEEDS CLARIFICATION: inventory management depth?]

#### Cleaning Tracker
- **FR-015**: System MUST allow creation of recurring chores with name, frequency, and assigned flatmate
- **FR-016**: System MUST support rotating chore assignments automatically based on schedule
- **FR-017**: System MUST send reminders to assigned flatmates for upcoming or due chores [NEEDS CLARIFICATION: timing of reminders - same day, day before, customizable?]
- **FR-018**: System MUST allow flatmates to mark chores as complete
- **FR-019**: System MUST track chore completion history showing who completed what and when
- **FR-020**: System MUST display current chore assignments for all flatmates
- **FR-021**: System MUST ensure fair distribution of chore workload [NEEDS CLARIFICATION: algorithm for rotation - sequential, random, workload-balanced?]

#### Gym Tracker
- **FR-022**: System MUST allow flatmates to log gym sessions with date and duration [NEEDS CLARIFICATION: other metrics like exercises, weights, calories?]
- **FR-023**: System MUST track individual gym session history and progress over time
- **FR-024**: System MUST support setting collective fitness goals (e.g., total gym sessions per month)
- **FR-025**: System MUST display progress toward collective fitness goals showing individual contributions
- **FR-026**: System MUST display individual gym statistics [NEEDS CLARIFICATION: what metrics - total sessions, frequency, streaks?]
- **FR-027**: System MUST allow editing or deletion of gym session entries [NEEDS CLARIFICATION: time limits or permissions on edits?]

#### Shared Notes & Reminders
- **FR-028**: System MUST allow flatmates to create shared notes with title and content
- **FR-029**: System MUST support different note types including shopping lists and general reminders
- **FR-030**: System MUST allow flatmates to create event reminders with description and due date
- **FR-031**: System MUST send notifications for upcoming reminders [NEEDS CLARIFICATION: notification timing and delivery method?]
- **FR-032**: System MUST allow flatmates to edit and delete shared notes [NEEDS CLARIFICATION: edit permissions - creator only or all flatmates?]
- **FR-033**: System MUST support collaborative editing of shopping lists (adding/removing items)

#### Communication Board
- **FR-034**: System MUST provide a chat board for flatmates to post messages
- **FR-035**: System MUST display messages in chronological order
- **FR-036**: System MUST show message author and timestamp
- **FR-037**: System MUST allow flatmates to read all chat history [NEEDS CLARIFICATION: message retention policy - unlimited history?]
- **FR-038**: System MUST allow flatmates to delete their own messages [NEEDS CLARIFICATION: edit capabilities? Time limits?]

#### General System Requirements
- **FR-039**: System MUST support multiple flatmates in a single household [NEEDS CLARIFICATION: maximum number of flatmates supported?]
- **FR-040**: System MUST identify flatmates by name [NEEDS CLARIFICATION: since no auth, how are flatmates distinguished - simple name selection, unique IDs?]
- **FR-041**: System MUST persist all data across sessions
- **FR-042**: System MUST allow adding new flatmates to the household [NEEDS CLARIFICATION: mid-session addition process and impact on existing data]
- **FR-043**: System MUST allow removing flatmates from the household [NEEDS CLARIFICATION: data cleanup, balance settlement requirements?]
- **FR-044**: System MUST display timestamps for all user-generated content [NEEDS CLARIFICATION: timezone handling?]

### Key Entities

- **Flatmate**: Represents an individual living in the shared household with a name and tracked balances; participates in all household activities including expenses, chores, groceries, gym sessions, and communications.

- **Expense**: Represents a financial transaction with description, amount, payer, date, category, split participants, and individual split amounts; can be household bills or casual non-household costs.

- **Balance**: Represents the financial relationship between two flatmates showing amount owed from one to another; derived from expense splits and settlements.

- **Grocery Item**: Represents a purchased grocery item with name, cost, purchaser, purchase date, and consumption status; contributes to the shared groceries visibility and individual contribution tracking.

- **Chore**: Represents a recurring household task with name, frequency, rotation sequence, current assignee, and completion history; automatically rotates among flatmates.

- **Chore Assignment**: Represents a specific instance of a chore assigned to a flatmate with due date, completion status, and completion timestamp.

- **Gym Session**: Represents a workout session logged by a flatmate with date, duration, and associated flatmate; contributes to individual and collective fitness tracking.

- **Fitness Goal**: Represents a collective fitness target for all flatmates with description, target metric, target value, time period, and current progress.

- **Note**: Represents a shared piece of information with title, content, type (shopping list, general reminder, etc.), creator, creation date, and modification history.

- **Reminder**: Represents a time-based alert with description, due date, creator, notification status, and associated flatmates.

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
- [ ] No [NEEDS CLARIFICATION] markers remain
- [ ] Requirements are testable and unambiguous
- [ ] Success criteria are measurable
- [x] Scope is clearly bounded
- [ ] Dependencies and assumptions identified

---

## Execution Status
*Updated by main() during processing*

- [x] User description parsed
- [x] Key concepts extracted
- [x] Ambiguities marked
- [x] User scenarios defined
- [x] Requirements generated
- [x] Entities identified
- [ ] Review checklist passed (WARN: Spec has uncertainties - 23 [NEEDS CLARIFICATION] markers)

---
