# QuackForge — Development Skills & Workflow

> **Status:** Active — enforced across all generated code.
> **Last updated:** 2026-07-25
> **Scope:** Applies to every commit, every PR, every deploy.

---

## ⚡ VERY VERY IMPORTANT — Read This First

This document defines the development workflow, architecture standards, and skill inventory for the QuackForge workspace. Every skill listed here is **installed and enforced** — there is no "optional" mode. Before writing any code, read the relevant skill section below and follow its workflow.

If a skill is missing or incomplete, **stop** and create it via the `skill-creator` skill before proceeding. Do not skip steps.

---

## 1. Development Workflow & Architecture

These skills define *how* we write code, not *what* we write. They are the operating system for every task.

### 1.1 test-driven-development

**Purpose:** Enforces red-green-refactor testing before writing implementation code.

**Workflow:**
1. **Red** — Write a failing test that describes the behavior you want. Run it. Watch it fail for the right reason (not a compile error).
2. **Green** — Write the minimum code to make the test pass. No more, no less. Duplication is OK at this stage.
3. **Refactor** — Improve the code without changing behavior. Tests must stay green. Remove duplication, extract functions, rename variables.

**Rules:**
- Never write implementation code without a failing test first.
- One test = one behavior. If you need to test multiple behaviors, write multiple tests.
- Test names describe behavior: `it('returns 400 when email is missing')`, not `test1`.
- Use `describe` blocks to group related tests.
- Mock external dependencies at the boundary (HTTP, DB, filesystem). Never mock the code under test.
- Commit after each green test. Commit messages: `test: ...` for new tests, `feat: ...` for implementation.

**When to skip TDD:**
- UI scaffolding (no logic to test)
- Config files
- One-off scripts
- Prototypes that will be thrown away

**Frameworks:**
- TypeScript/React: Vitest + Testing Library + Playwright (e2e)
- Kotlin/Android: JUnit5 + MockK + Espresso
- Python: pytest + unittest.mock

**File locations:**
- Unit tests: `src/**/*.test.ts(x)` — co-located with source
- Integration tests: `tests/integration/`
- E2E tests: `tests/e2e/` (Playwright)

---

### 1.2 systematic-debugging

**Purpose:** Executes a rigid four-phase root cause analysis framework. No guessing.

**The Four Phases:**

#### Phase 1 — Investigate
- Reproduce the bug reliably. Write down the exact steps.
- Gather evidence: logs, stack traces, network requests, screenshots.
- Form a hypothesis. Write it down.
- **Do NOT touch code yet.**

#### Phase 2 — Hypothesize
- List 3+ possible root causes. Rank by likelihood.
- For each cause, write the test that would confirm or refute it.
- Pick the most likely cause. Write the test.
- Run the test. If it fails, the cause is wrong — go back to the list.

#### Phase 3 — Fix
- Write the fix. Minimum change possible.
- Run the failing test. It should now pass.
- Run the full test suite. Nothing else should break.
- If something breaks, revert and re-hypothesize.

#### Phase 4 — Verify
- Manually verify the fix in a real environment (browser, device, etc.).
- Add a regression test that would catch this bug if it came back.
- Document the root cause in the commit message: `fix: <what broke> because <why>`.
- Add a guardrail comment at the call site explaining what broke and why this code prevents it.

**Anti-patterns (forbidden):**
- "Let me just try X and see if it works" — that's not debugging, that's guessing.
- Changing multiple things at once — you won't know which one fixed it.
- Fixing the symptom instead of the cause.

---

### 1.3 get-shit-done

**Purpose:** Runs a spec-driven dev loop with strict context management.

**The Loop:**
1. **Spec** — Write a 1-paragraph spec of what you're building. Include acceptance criteria.
2. **Plan** — Break the spec into atomic tasks. Each task should take <30 minutes.
3. **Execute** — Pick the next task. Implement it. Commit. Move to the next.
4. **Review** — After every 3 tasks, review what you built against the spec. Adjust the plan if needed.

**Context management rules:**
- One task at a time. No multitasking.
- Close unrelated browser tabs, editors, terminals.
- If you context-switch, write down where you were in `memory.md` before switching.
- After 2 hours of focused work, take a 10-minute break. No exceptions.

**Definition of done:**
- Spec acceptance criteria met
- All tests pass
- No `console.log` / `print` / `console.debug` left in code
- No `any` types without inline `// FIXME: ...` justification
- README updated if behavior changed
- Commit message follows Conventional Commits

---

### 1.4 subagent-driven-development

**Purpose:** Implements a structured two-stage code review cycle.

**Stage 1 — Implementation (subagent):**
- The main agent writes a spec and dispatches it to a subagent.
- The subagent implements the spec in isolation.
- The subagent returns: code + tests + a self-review document.

**Stage 2 — Review (main agent):**
- The main agent reviews the subagent's output against the spec.
- The main agent runs the tests. If any fail, send back to the subagent with the failure output.
- The main agent checks for: spec compliance, code quality, test coverage, edge cases.
- If approved, the main agent commits. If not, send back with specific feedback.

**Rules:**
- Subagents do not have full conversation context. Pass them everything they need in the task description.
- Subagents cannot commit. Only the main agent commits.
- Subagents must include a self-review document listing what they did, what they're unsure about, and what they skipped.

---

### 1.5 dispatching-parallel-agents

**Purpose:** Handles concurrent subagent execution for speed.

**When to parallelize:**
- Independent tasks (e.g., "write tests for X" + "write tests for Y")
- Research tasks (e.g., "find all uses of deprecated API" + "find all TODO comments")
- Refactoring tasks that don't touch the same files

**When NOT to parallelize:**
- Tasks that touch the same files (merge conflicts)
- Tasks where one depends on another's output
- Tasks that require shared mutable state

**Protocol:**
1. Main agent writes N task descriptions.
2. Main agent dispatches all N in a single message (parallel).
3. Each subagent returns its result.
4. Main agent merges results, resolves conflicts, commits.

**Failure handling:**
- If one subagent fails, the others still complete.
- Main agent retries the failed one with adjusted instructions.

---

### 1.6 using-git-worktrees

**Purpose:** Sets up isolated git branches and verifies clean test baselines.

**Setup:**
```bash
# Create a worktree for a feature
git worktree add ../quackforge-feature-x -b feature/x

# Work in the worktree
cd ../quackforge-feature-x
# ... make changes, commit ...

# Merge back
cd /home/z/my-project
git merge feature/x
git worktree remove ../quackforge-feature-x
git branch -d feature/x
```

**Rules:**
- One worktree per feature branch.
- Never commit to `main` directly. Always use a worktree + branch + PR.
- Before starting work in a worktree, run the full test suite. It must pass on a clean checkout.
- If tests fail on clean checkout, fix that first before starting your feature.

**Verification checklist (before every commit):**
- [ ] `git status` shows only intended changes
- [ ] `bun run lint` passes with no warnings
- [ ] `bun run typecheck` (or `tsc --noEmit`) passes
- [ ] `bun run test` passes
- [ ] No `console.log` / `debugger` / `print` left
- [ ] Commit message follows Conventional Commits

---

### 1.7 Superpowers

**Purpose:** Forces comprehensive planning, testing, and multi-stage self-review.

**The Superpowers Protocol:**

Before writing any non-trivial code (>50 lines or >1 file):

1. **Plan** — Write a plan document that includes:
   - What you're building and why
   - The approach (3-5 bullets)
   - Files that will be touched
   - Tests that will be written
   - Risks and mitigations
   - Rollback plan if it goes wrong

2. **Implement** — Write the code per the plan. No scope creep.

3. **Self-review #1 (immediate)** — Re-read your diff. Look for:
   - Bugs (off-by-one, null deref, race condition)
   - Missing error handling
   - Hardcoded values that should be config
   - Inconsistent naming
   - Dead code

4. **Self-review #2 (after break)** — Step away for 5 minutes. Come back and re-read with fresh eyes. Look for:
   - Does the code actually solve the problem?
   - Are there edge cases you missed?
   - Is the code readable by someone who didn't write it?

5. **Self-review #3 (next day)** — If the change is significant, review it the next day. You'll find issues you couldn't see when you were deep in the code.

6. **Test** — Run the full test suite. All must pass.

7. **Commit** — Only after all self-reviews and tests pass.

---

### 1.8 Grill Me

**Purpose:** Interviews you about technical plans to eliminate hidden edge cases.

**The Grill Protocol:**

Before implementing a plan, answer these questions (out loud or in writing):

1. **What's the happy path?** — Walk through the user's journey step by step.
2. **What can go wrong?** — List every failure mode. Network, auth, input validation, race conditions, resource exhaustion.
3. **What's the worst case?** — If everything fails, what happens? Is it recoverable?
4. **What are the edge cases?** — Empty input, huge input, unicode, timezones, leap seconds, concurrent writes.
5. **What are the security implications?** — Who can access this? What if they're malicious?
6. **What are the performance implications?** — What if 1000 users hit this at once? 10000?
7. **What's the rollback plan?** — If this breaks production, how do we revert?
8. **How will we know if it's broken?** — What metrics, logs, alerts?
9. **What did we miss?** — What question should we be asking that we're not?

**If you can't answer a question, don't write code until you can.**

---

## 2. Code Quality & Verification

### 2.1 code-review

**Purpose:** Scans complete code diffs and repositories for subtle bugs before deployment.

**Review checklist:**

For every diff, check:

- **Logic**
  - [ ] Does the code do what the commit message says?
  - [ ] Are all branches reachable?
  - [ ] Are loops guaranteed to terminate?
  - [ ] Are null/undefined handled?
  - [ ] Are errors caught and reported?

- **Security**
  - [ ] No hardcoded secrets (use env vars)
  - [ ] User input is sanitized (XSS, SQL injection, command injection)
  - [ ] Auth checks on every protected route
  - [ ] No `dangerouslySetInnerHTML` without sanitization
  - [ ] No `eval` / `Function` constructor

- **Performance**
  - [ ] No N+1 queries
  - [ ] No unnecessary re-renders (React.memo, useMemo, useCallback where needed)
  - [ ] No synchronous operations on the main thread that could block
  - [ ] Images are optimized (next/image, lazy loading)
  - [ ] Bundle size hasn't grown unexpectedly

- **Maintainability**
  - [ ] Names are descriptive (no `data`, `temp`, `foo`)
  - [ ] Functions do one thing (<50 lines)
  - [ ] No magic numbers (extract to named constants)
  - [ ] Comments explain *why*, not *what*
  - [ ] No commented-out code

- **Tests**
  - [ ] New code has tests
  - [ ] Tests cover happy path + error cases + edge cases
  - [ ] Tests are deterministic (no flaky time-dependent tests)
  - [ ] Test names describe behavior

**Review protocol:**
- Reviews happen before merge, not after.
- Reviewer must be different from author (or, if solo, you must wait 1 hour before self-reviewing).
- Use `git diff main...feature-branch` to see the full change.
- Approve, request changes, or reject. No silent approvals.

---

### 2.2 security-audit

**Purpose:** Analyzes project files for vulnerability patterns and insecure dependencies.

**Audit cadence:**
- Before every deploy
- After adding new dependencies
- After touching auth, payments, or user data
- Monthly (automated)

**What to check:**

1. **Dependencies** — Run `bun audit` / `npm audit` / `pip audit`. Fix all high/critical vulnerabilities.
2. **Secrets** — Scan for hardcoded tokens, keys, passwords. Use `git log -p | grep -E "ghp_|sk_|AKIA|MIIE"` or tools like `trufflehog`, `gitleaks`.
3. **Auth** — Every protected route checks auth. Session tokens expire. Passwords are hashed (bcrypt/argon2).
4. **Input validation** — Every user input is validated (zod, joi, pydantic). No raw SQL with string concatenation.
5. **CORS** — `Access-Control-Allow-Origin` is not `*` in production.
6. **CSP** — Content-Security-Policy header is set. No `unsafe-inline` for scripts.
7. **HTTPS** — All requests are HTTPS. HSTS header is set.
8. **Rate limiting** — Login, signup, password reset, and API endpoints are rate-limited.
9. **File uploads** — Uploaded files are validated (type, size, content). Stored outside web root.
10. **Error messages** — Production errors don't leak stack traces or internal details.

**Tools:**
- `bun audit` — npm dependency audit
- `gitleaks` — secret scanning
- `semgrep` — static analysis
- `playwright audit` — automated browser security checks
- Manual review of auth flows

---

### 2.3 performance-optimization

**Purpose:** Profiling capability targeting code bottlenecks and memory leaks.

**Profiling workflow:**

1. **Measure first** — Don't optimize without data. Use:
   - Chrome DevTools Performance tab (record a user flow)
   - React DevTools Profiler (component render times)
   - Lighthouse (overall page metrics)
   - `bun run build && bun run start` then `ab -n 1000 -c 10 http://localhost:3000/`

2. **Identify the bottleneck** — Look at the flamegraph. The widest bars are your bottleneck.

3. **Optimize** — In order of impact:
   - Database queries (N+1, missing indexes, over-fetching)
   - Bundle size (dynamic imports, tree-shaking)
   - Render performance (memoization, virtualization)
   - Network (caching, CDN, HTTP/2)
   - Computation (algorithmic improvements)

4. **Re-measure** — Did it actually get faster? By how much? Write it down.

**Common React optimizations:**
- `React.memo` for components that re-render often with same props
- `useMemo` for expensive calculations
- `useCallback` for functions passed as props
- `React.lazy` + `Suspense` for code-splitting routes
- Virtualization for long lists (`react-window`, `@tanstack/react-virtual`)
- Image optimization (`next/image` with proper sizes)

**Anti-patterns:**
- Premature optimization — don't optimize without profiling data
- Micro-optimizations that hurt readability
- Optimizing for the wrong metric (e.g., bundle size at the cost of UX)

---

### 2.4 refactoring

**Purpose:** Restructures large component files while maintaining interface contracts.

**When to refactor:**
- A file is >300 lines
- A function is >50 lines
- A component does more than one thing
- You're copying code between files
- Tests are hard to write because of coupling

**Refactoring workflow:**

1. **Verify tests pass** — Before refactoring, the existing tests must pass. If there are no tests, write them first.
2. **Identify the smell** — What's wrong with the current structure? Be specific.
3. **Plan the change** — What will the new structure look like? Draw it on paper if needed.
4. **Make the change in small steps** — One extraction at a time. Run tests after each step.
5. **Verify tests still pass** — After every step. If they break, you changed behavior — revert and try again.
6. **Commit after each successful step** — Small commits are easy to revert.

**Refactoring patterns:**
- **Extract function** — Move a block of code into a named function.
- **Extract component** — Move JSX into a separate component.
- **Extract hook** — Move stateful logic into a custom hook.
- **Move** — Move code to a more appropriate file/module.
- **Rename** — Improve naming without changing behavior.
- **Inline** — Replace a trivial function call with its body (inverse of extract).

**Rules:**
- Refactoring = behavior-preserving. If behavior changes, it's not refactoring.
- One refactoring per commit. Commit message: `refactor: <what changed>`.
- Don't mix refactoring with feature work. Separate PRs.

---

### 2.5 API-design

**Purpose:** Validates REST and GraphQL schemas against modern specification rules.

**REST conventions:**

- URLs are nouns, not verbs: `/users`, `/orders`, not `/getUsers`, `/createOrder`.
- HTTP methods are the verbs:
  - `GET /users` — list
  - `GET /users/:id` — get one
  - `POST /users` — create
  - `PUT /users/:id` — replace (full update)
  - `PATCH /users/:id` — update (partial)
  - `DELETE /users/:id` — delete
- Status codes are meaningful:
  - 200 — success
  - 201 — created
  - 204 — no content (successful delete)
  - 400 — bad request (client error)
  - 401 — unauthorized (not logged in)
  - 403 — forbidden (logged in but not allowed)
  - 404 — not found
  - 409 — conflict (duplicate)
  - 422 — unprocessable entity (validation error)
  - 429 — too many requests (rate limited)
  - 500 — server error
- Pagination: `?page=1&limit=20` or cursor-based for large datasets.
- Filtering: `?status=active&role=admin`.
- Sorting: `?sort=-created_at` (minus = descending).
- Versioning: `/v1/users` or via `Accept` header.
- Errors use a consistent format:
  ```json
  { "error": { "code": "VALIDATION_FAILED", "message": "...", "details": [...] } }
  ```

**GraphQL conventions:**
- Schema-first design. Write the schema before resolvers.
- Use input types for mutations.
- Paginate lists with `Connection` types (Relay spec).
- Deprecate fields with `@deprecated(reason: "...")`.
- Use custom scalars for typed values (DateTime, URL, Email).

---

### 2.6 database-schema

**Purpose:** Guides migrations, indexing strategies, and query optimizations.

**Schema design rules:**

1. **Primary keys** — Always have a primary key. UUID or auto-increment integer.
2. **Foreign keys** — Always declare them. Use `ON DELETE` constraints.
3. **Indexes** — Index every column used in `WHERE`, `JOIN`, `ORDER BY`.
4. **Composite indexes** — Order matters. `(user_id, created_at)` is different from `(created_at, user_id)`.
5. **Constraints** — `NOT NULL`, `UNIQUE`, `CHECK` where appropriate.
6. **Enums** — Use enum types or lookup tables, not magic strings.
7. **Timestamps** — `created_at` and `updated_at` on every table.
8. **Soft delete** — Consider `deleted_at` for audit. Don't use for actual deletion (use a separate archive table).
9. **Naming** — `snake_case` for tables and columns. Plural table names (`users`, `orders`).
10. **Money** — Never use float. Use `DECIMAL(10,2)` or store cents as integer.

**Migration workflow:**
1. Write the migration: `bun run db:migrate -- --name add_users_table`
2. Review the generated SQL.
3. Test on a copy of production data.
4. Deploy during low-traffic window.
5. Have a rollback migration ready.

**Query optimization:**
- Use `EXPLAIN ANALYZE` to understand query plans.
- Avoid `SELECT *` — only fetch what you need.
- Batch queries instead of N+1.
- Use transactions for multi-step writes.
- Cache expensive queries (Redis, in-memory).

---

## 3. Frontend & Ecosystem Specialization

### 3.1 frontend-design

**Purpose:** Encodes modern spacing, typography, and layout rules to prevent generic outputs.

**Spacing system (Tailwind):**
- Use the 4px grid: `1 = 4px`, `2 = 8px`, `3 = 12px`, `4 = 16px`, `6 = 24px`, `8 = 32px`, `12 = 48px`, `16 = 64px`, `20 = 80px`, `24 = 96px`.
- Section padding: `py-16 sm:py-20 lg:py-24`.
- Container: `max-w-7xl mx-auto px-5 sm:px-8`.
- Card padding: `p-4 sm:p-5 lg:p-6`.
- Element gaps: `gap-3` (tight), `gap-4` (default), `gap-6` (loose).

**Typography scale:**
- Display: `text-5xl sm:text-6xl lg:text-7xl font-semibold tracking-tight`
- H1: `text-4xl sm:text-5xl font-semibold tracking-tight`
- H2: `text-3xl sm:text-4xl font-semibold tracking-tight`
- H3: `text-xl sm:text-2xl font-semibold tracking-tight`
- Body: `text-base sm:text-lg leading-relaxed`
- Small: `text-sm text-muted-foreground`
- Caption: `text-xs text-muted-foreground font-mono`

**Anti-"AI-slop" rules (forbidden):**
- No card grids of equal-height feature boxes with outline icons.
- No gradient hero backgrounds (purple-to-blue, indigo-to-pink).
- No rocket/sparkles/lightning emojis as feature icons.
- No `text-4xl font-bold tracking-tight` centered headlines above two CTA buttons.
- No three-column Features/Pricing/FAQ footer stack unless explicitly requested.

**Required instead:**
- Hierarchical visual anchors — one element dominates (size, weight, or position).
- Editorial typography — pair serif display with sans body, or go all-mono.
- Asymmetric layouts — 7/5 or 2/3 splits beat centered columns.
- Real numbers and real nouns — "47ms p95" beats "blazing fast".
- Restrained color — two neutrals + one accent. The accent earns its presence.

**Color tokens (QuackForge):**
- Background: `#0A1830` (navy base)
- Foreground: `#E6FBFF` (off-white cyan tint)
- Card: `#0F2147` (slightly lighter navy)
- Primary: `#22D3EE` (brand cyan)
- Muted: `#94A3B8` (slate gray)
- Border: `rgba(255,255,255,0.08)` (subtle white)

---

### 3.2 shadcn/ui

**Purpose:** Injects pattern enforcement and context for shadcn component integration.

**Installed components (in `src/components/ui/`):**
accordion, alert-dialog, alert, aspect-ratio, avatar, badge, breadcrumb, button, calendar, card, carousel, chart, checkbox, collapsible, command, context-menu, dialog, drawer, dropdown-menu, form, hover-card, input-otp, input, label, menubar, navigation-menu, pagination, popover, progress, radio-group, scroll-area, select, separator, sheet, sidebar, skeleton, slider, sonner, spinner, switch, table, tabs, textarea, toast, toaster, toggle-group, toggle, tooltip, use-toast.

**Usage rules:**
- Always import from `@/components/ui/<name>`, never copy the source into business components.
- Compose primitives — don't reinvent what shadcn already provides.
- Use `cn()` from `@/lib/utils` for conditional classes.
- Variants are defined via `cva` in the component file. Extend, don't override.
- Dark mode is the default. Light mode must work but is secondary.

**Customization:**
- Theme tokens are in `src/app/globals.css` under `:root` and `.dark`.
- Brand colors: `--brand-cyan`, `--brand-blue` and their bright/deep/glow variants.
- Radius: `--radius: 0.5rem` (8px). Use `rounded-lg` (default), `rounded-xl` (12px) for cards.
- Fonts: Geist Sans (body), Geist Mono (mono), Instrument Serif (display).

---

### 3.3 Skill Creator

**Purpose:** Teaches Claude how to draft, package, and test custom workflow skills.

**When to create a skill:**
- You repeat the same workflow 3+ times.
- A multi-step process has a non-obvious correct order.
- You want to enforce a standard (e.g., "always write tests first").

**Skill structure:**
```
skills/<skill-name>/
├── SKILL.md          # Main documentation
├── scripts/          # Helper scripts
│   ├── setup.sh
│   └── validate.sh
├── templates/        # File templates
│   └── example.tsx
└── tests/            # Skill self-tests
    └── test.spec.ts
```

**SKILL.md must include:**
- **Purpose** — one sentence.
- **When to use** — 3-5 bullet points.
- **Workflow** — numbered steps with code examples.
- **Anti-patterns** — what NOT to do.
- **Examples** — at least 2 complete worked examples.
- **Validation** — how to verify the skill was applied correctly.

**Testing a skill:**
- Run the skill on a sample task.
- Verify the output matches the skill's contract.
- Run the validation script.
- If validation fails, iterate on the skill until it passes.

---

### 3.4 Memory

**Purpose:** Persists context and architectural decisions across independent sessions.

**Memory file:** `/home/z/my-project/memory.md` (gitignored — never committed).

**Update protocol:**
- Update memory.md **every turn** with:
  1. The user's latest message (verbatim or paraphrased).
  2. Your previous response (summary of what you did).
  3. Any decisions made or context learned.
- Before starting work on a new turn, read memory.md to restore context.
- If memory.md doesn't exist, create it. Don't silently lose context.

**What to persist:**
- Project context (stack, deploy targets, credentials locations — NOT the credentials themselves).
- Active task list with status.
- Conversation log (most recent at top).
- Architectural decisions and their rationale.
- Recurring issues and their fixes.

**What NOT to persist:**
- Actual secrets (those go in `/home/z/my-project/download/credentials.md`, gitignored).
- Verbatim large code blocks (link to the file instead).
- Personal information about users.

---

### 3.5 MCP Client

**Purpose:** Links external Model Context Protocol servers for live data and tool interaction.

**Available MCP servers (configured in environment):**
- `playwright` — browser automation (headless Chromium)
- `filesystem` — read/write local files
- `github` — GitHub API (repos, issues, PRs)
- `firebase` — Firebase Admin (Firestore, Auth, Hosting)
- `vercel` — Vercel deployments

**Usage:**
- MCP tools are invoked via the standard tool-call interface.
- Always prefer MCP over raw HTTP when an MCP server is available.
- If an MCP server is missing, fall back to `urllib.request` (Python) or `fetch` (Node).

**Adding a new MCP server:**
1. Install the server: `npm install -g @modelcontextprotocol/server-<name>`
2. Add to config: `~/.config/mcp/servers.json`
3. Restart the session.
4. Verify with a test call.

---

### 3.6 Agent Browser

**Purpose:** Automates headless browser testing and live web verification loops.

**Usage patterns:**

1. **Screenshot verification** — After a code change, take a screenshot and visually verify:
   ```python
   async with async_playwright() as p:
       browser = await p.chromium.launch(headless=True)
       page = await browser.new_page()
       await page.goto("http://localhost:3000/")
       await page.screenshot(path="screenshot.png", full_page=True)
       await browser.close()
   ```

2. **Interaction testing** — Click buttons, fill forms, navigate:
   ```python
   await page.click("button:has-text('Submit')")
   await page.fill("input[name='email']", "test@example.com")
   await page.wait_for_selector(".success")
   ```

3. **Console error capture** — Catch runtime errors:
   ```python
   page.on("pageerror", lambda err: print(f"ERROR: {err}"))
   page.on("console", lambda msg: print(f"[{msg.type}] {msg.text}") if msg.type == "error" else None)
   ```

4. **Network monitoring** — Catch failed requests:
   ```python
   page.on("requestfailed", lambda req: print(f"FAILED: {req.url}"))
   ```

5. **Multi-viewport testing** — Test mobile + desktop:
   ```python
   for width in [390, 768, 1024, 1280, 1920]:
       ctx = await browser.new_context(viewport={"width": width, "height": 800})
       # ... test ...
   ```

**Verification loop:**
1. Make a code change.
2. Run the dev server.
3. Take a screenshot at desktop + mobile widths.
4. Capture console errors.
5. If errors or visual issues, fix and repeat.
6. If clean, commit.

**File location:** Browser automation scripts go in `/home/z/my-project/scripts/<name>.py`.

---

## 4. Additional Specialized Skills

### 4.1 UI/UX Pro

**Purpose:** Advanced UI/UX patterns and component architecture.

**Design principles:**

1. **Visual hierarchy** — One element per section dominates. Use size, weight, color, or position to create a clear focal point.
2. **Progressive disclosure** — Show essentials first. Reveal details on demand (hover, click, expand).
3. **Feedback** — Every user action gets immediate visual feedback (hover states, loading spinners, success toasts).
4. **Affordance** — Interactive elements look interactive. Buttons look clickable. Links look linkable.
5. **Consistency** — Same patterns everywhere. All CTAs look the same. All cards look the same.
6. **Spacing rhythm** — Consistent vertical rhythm. Don't crowd. Don't waste space.
7. **Color restraint** — Two neutrals + one accent. The accent earns its presence.

**Component architecture:**

- **Atoms** — Buttons, inputs, labels, badges. No business logic.
- **Molecules** — Form fields, card headers, list items. Combine atoms.
- **Organisms** — Sections (hero, pricing, FAQ). Combine molecules.
- **Templates** — Page layouts. Combine organisms.
- **Pages** — Specific instances with real data.

**Animation principles:**

- **Easing** — Use `cubic-bezier(0.4, 0, 0.2, 1)` for most transitions. Avoid linear.
- **Duration** — 150ms for micro-interactions, 300ms for state changes, 500ms+ for scene transitions.
- **Stagger** — When animating lists, stagger by 50-100ms.
- **Respect `prefers-reduced-motion`** — Disable animations for users who request it.
- **Don't animate everything** — Animations should guide attention, not distract.

**Accessibility (a11y):**

- Semantic HTML (`<button>`, `<nav>`, `<main>`, `<section>`, not `<div onClick>`).
- ARIA labels where needed (`aria-label`, `aria-expanded`, `aria-live`).
- Keyboard navigation (Tab, Enter, Escape, Arrow keys).
- Focus visible (`:focus-visible` styles).
- Color contrast ≥ 4.5:1 for body text, ≥ 3:1 for large text.
- Alt text on all images.
- `prefers-reduced-motion` respected.

---

### 4.2 Remotion

**Purpose:** Programmatic video generation using React components.

**Use cases for QuackForge:**
- Hero background animations (replacing the current "Placeholder for Live scroll animation vid")
- Demo videos for the portfolio
- Animated feature explanations
- Social media promo clips

**Setup:**
```bash
bun add remotion @remotion/cli @remotion/player
```

**Basic structure:**
```tsx
// src/remotion/ compositions/HeroScroll.tsx
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";

export const HeroScroll: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 30], [0, 1], { extrapolateRight: "clamp" });
  const y = interpolate(frame, [0, 30], [20, 0], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ backgroundColor: "#0A1830", opacity, transform: `translateY(${y}px)` }}>
      {/* Animated content */}
    </AbsoluteFill>
  );
};
```

**Render to video:**
```bash
bunx remotion render HeroScroll out/hero-scroll.mp4
```

**Embed in Next.js:**
```tsx
import { Player } from "@remotion/player";

<Player
  component={HeroScroll}
  durationInFrames={150}
  fps={30}
  compositionWidth={1920}
  compositionHeight={1080}
  style={{ width: "100%" }}
  loop
  autoPlay
  muted
/>
```

**Rules:**
- Videos are rendered at build time, not runtime. Cache the output.
- Use `@remotion/player` for inline playback. Don't ship raw `<video>` tags if you can use the Player.
- Keep compositions short (5-10 seconds). Loop for longer effect.
- Optimize: 30fps is enough. 60fps doubles file size for marginal visual gain.
- Always provide a `poster` image as fallback for slow connections.

---

## 5. Enforcement

This skill document is enforced by:

1. **Pre-commit hooks** — Run lint, typecheck, and tests before every commit.
2. **Code review** — No PR merges without explicit approval against the checklists above.
3. **CI pipeline** — GitHub Actions runs the full test suite on every push.
4. **Memory file** — `memory.md` tracks whether each skill was applied in the current session.
5. **This document** — Re-read before every non-trivial task. Don't work from memory.

If you find yourself violating a skill, stop. Re-read the relevant section. Adjust your approach. Then continue.

---

## 6. Skill Inventory (quick reference)

| # | Skill | Category | Status |
|---|---|---|---|
| 1 | test-driven-development | Workflow | ✅ Active |
| 2 | systematic-debugging | Workflow | ✅ Active |
| 3 | get-shit-done | Workflow | ✅ Active |
| 4 | subagent-driven-development | Workflow | ✅ Active |
| 5 | dispatching-parallel-agents | Workflow | ✅ Active |
| 6 | using-git-worktrees | Workflow | ✅ Active |
| 7 | Superpowers | Workflow | ✅ Active |
| 8 | Grill Me | Workflow | ✅ Active |
| 9 | code-review | Quality | ✅ Active |
| 10 | security-audit | Quality | ✅ Active |
| 11 | performance-optimization | Quality | ✅ Active |
| 12 | refactoring | Quality | ✅ Active |
| 13 | API-design | Quality | ✅ Active |
| 14 | database-schema | Quality | ✅ Active |
| 15 | frontend-design | Frontend | ✅ Active |
| 16 | shadcn/ui | Frontend | ✅ Active |
| 17 | Skill Creator | Frontend | ✅ Active |
| 18 | Memory | Frontend | ✅ Active |
| 19 | MCP Client | Frontend | ✅ Active |
| 20 | Agent Browser | Frontend | ✅ Active |
| 21 | UI/UX Pro | Specialized | ✅ Active |
| 22 | Remotion | Specialized | ✅ Active |
| 23 | 21st.dev | Frontend | ✅ Active |
| 24 | Framer Motion | Specialized | ✅ Active |

---

## 7. Changelog

- **2026-07-25** — Initial installation of all 22 skills. Document created, enforced from this commit forward.
- **2026-07-25 (turn 18)** — Added skill #23 (21st.dev) and #24 (Framer Motion).

---

## 8. Additional Specialized Skills

### 8.1 21st.dev

**Purpose:** Curated library of high-quality, copy-paste React components built with Tailwind CSS and Framer Motion. The "magic components" registry for modern SaaS UIs.

**Source:** https://21st.dev — browse, copy, paste. No npm install needed for individual components.

**When to use:**
- You need a polished hero section, pricing table, or feature grid fast.
- You want production-quality animations without writing them from scratch.
- You're prototyping and want to skip the design phase.
- You want to study modern SaaS UI patterns.

**Component categories:**
- **Heroes** — full-screen, split, centered, with video/animation
- **Features** — bento grids, card stacks, hover effects
- **Pricing** — tier cards, comparison tables, toggles
- **Testimonials** — carousels, masonry, grid
- **CTAs** — buttons, banners, sticky bars
- **Footers** — minimal, expanded, with newsletter
- **Navbars** — sticky, transparent, mega-menu
- **Loaders** — skeletons, spinners, progress bars
- **Backgrounds** — gradients, particles, grid patterns
- **Text** — reveals, gradients, typewriter, counter

**Usage workflow:**
1. Browse https://21st.dev for the component you need.
2. Click "Copy code" on the component.
3. Paste into `src/components/<name>.tsx`.
4. Install any missing dependencies (the component page lists them).
5. Customize colors, copy, and props to match QuackForge's brand.
6. Verify in the browser via Playwright screenshot.

**Integration with QuackForge:**
- Brand colors: replace any hardcoded colors with `var(--primary)` (#22D3EE) and `var(--background)` (#0A1830).
- Fonts: components use Inter by default — swap to Geist Sans (`var(--font-geist-sans)`) for consistency.
- Animations: most use Framer Motion — keep the animations but adjust easing to `cubic-bezier(0.4, 0, 0.2, 1)` (QuackForge's `--ease-brand`).
- Dark mode: most 21st.dev components are dark-first, matching QuackForge's aesthetic.

**Anti-patterns:**
- Don't copy-paste without customizing — generic components look generic.
- Don't install every component — only what you actually use.
- Don't ignore accessibility — verify keyboard nav and screen reader support.
- Don't skip the dependency check — missing packages cause runtime errors.

**File location:** Downloaded components go in `src/components/sections/` (for page sections) or `src/components/ui/` (for primitives).

---

### 8.2 Framer Motion

**Purpose:** Production-ready motion library for React. The animation engine powering QuackForge's hero, pricing cards, FAQ accordion, and all micro-interactions.

**Already installed:** `"framer-motion": "^12.23.2"` in `package.json`.

**Core APIs (cheat sheet):**

```tsx
import { motion, AnimatePresence, useScroll, useTransform, useSpring, useInView } from "framer-motion";

// 1. Basic animation — fade up on mount
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
>
  Content
</motion.div>

// 2. Scroll-triggered animation — animate when in viewport
<motion.div
  initial={{ opacity: 0, y: 20 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, margin: "-60px" }}
  transition={{ duration: 0.6, delay: 0.1 }}
>
  Content
</motion.div>

// 3. Stagger children
<motion.div
  initial="hidden"
  whileInView="visible"
  viewport={{ once: true }}
  variants={{
    hidden: {},
    visible: { transition: { staggerChildren: 0.1 } },
  }}
>
  <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
    Child 1
  </motion.div>
  <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
    Child 2
  </motion.div>
</motion.div>

// 4. Hover / tap interactions
<motion.button
  whileHover={{ scale: 1.05, y: -2 }}
  whileTap={{ scale: 0.95 }}
  transition={{ type: "spring", stiffness: 300, damping: 15 }}
>
  Click me
</motion.button>

// 5. AnimatePresence — mount/unmount animations
<AnimatePresence>
  {isVisible && (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
    >
      Content
    </motion.div>
  )}
</AnimatePresence>

// 6. Scroll-linked progress bar
const { scrollYProgress } = useScroll();
const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
<motion.div style={{ scaleX }} className="fixed top-0 left-0 right-0 h-1 bg-primary" />

// 7. Spring physics
const x = useSpring(0, { stiffness: 200, damping: 20 });
<motion.div drag="x" style={{ x }} />

// 8. Layout animations
<motion.div layout>Content that animates when layout changes</motion.div>
```

**QuackForge motion primitives** (`src/components/motion-primitives.tsx`):
- `StaggerGroup` — container that staggers children
- `FadeUp` — fade + translate Y on scroll-in
- `FadeScale` — fade + scale on scroll-in
- `Magnetic` — element follows cursor slightly
- `TiltCard` — 3D tilt on hover
- `TextReveal` — word-by-word text reveal
- `Counter` — animated number counter
- `Marquee` — infinite scrolling row
- `Floating` — gentle up/down float
- `ScrollProgress` — top progress bar
- `CustomCursor` — custom cursor with ring

**Easing tokens:**
- `--ease-brand: cubic-bezier(0.4, 0, 0.2, 1)` — QuackForge's default ease
- `[0.22, 1, 0.36, 1]` — ease-out-quint (use for entrances)
- `[0.4, 0, 0.2, 1]` — ease-in-out (use for state changes)
- `type: "spring", stiffness: 280, damping: 28` — spring (use for interactions)

**Duration tokens:**
- `0.15s` — micro-interactions (hover, focus)
- `0.3s` — state changes (modal open, accordion expand)
- `0.6s` — entrance animations (fade up on scroll)
- `0.8s+` — hero / scene transitions

**Performance rules:**
- Use `transform` and `opacity` only — never animate `width`, `height`, `top`, `left` (causes layout thrash).
- Add `will-change: transform` on animated elements that move a lot.
- Use `viewport={{ once: true }}` on scroll animations — don't re-animate on every scroll.
- Limit concurrent animations to ~20 — more causes jank on low-end devices.
- Respect `prefers-reduced-motion` — wrap motion in a check:
  ```tsx
  const prefersReducedMotion = useReducedMotion();
  <motion.div animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }} />
  ```

**Common patterns at QuackForge:**
- **Card hover lift**: `whileHover={{ y: -4, scale: 1.02 }}` + `transition={{ type: "spring", stiffness: 300, damping: 20 }}`
- **Button press**: `whileTap={{ scale: 0.95 }}`
- **Section entrance**: `initial={{ opacity: 0, y: 20 }}` + `whileInView={{ opacity: 1, y: 0 }}` + `viewport={{ once: true, margin: "-60px" }}`
- **Accordion**: `AnimatePresence` + `animate={{ height: "auto", opacity: 1 }}` + `exit={{ height: 0, opacity: 0 }}`
- **Playing card stack**: `position: absolute` + computed `transform`/`opacity`/`zIndex` + `transition={{ type: "spring", stiffness: 280, damping: 28 }}`

**Debugging:**
- If an animation doesn't run, check `whileInView` has `viewport={{ once: true }}` — without it, animations can fire before the element is visible.
- If a layout animation jumps, add `layout` prop to the parent and `layoutId` to children.
- If springs feel "bouncy", increase `damping` (e.g., 28 → 40).
- If springs feel "sluggish", increase `stiffness` (e.g., 200 → 400).

**File location:** Motion primitives live in `src/components/motion-primitives.tsx`. Page-specific animations stay in the section component (e.g., `hero.tsx`, `pricing.tsx`).
