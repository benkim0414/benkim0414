# Triage Labels

The skills speak in terms of five canonical triage roles. This file maps those roles to the actual label strings used in this repo's Hermes Kanban / agent tracker vocabulary (see `docs/agents/issue-tracker.md`).

| Label in mattpocock/skills | Label in our tracker | Meaning |
| -------------------------- | -------------------- | ------- |
| `needs-triage`             | `needs-triage`       | Backlog/Scheduled; needs `triage` inspection |
| `needs-info`               | `needs-info`         | Blocked; waiting for user/reporter clarification |
| `ready-for-agent`          | `ready-for-agent`    | Ready; can be assigned to `implement` or `code-review` |
| `ready-for-human`          | `ready-for-human`    | Awaiting handoff/user approval; do not auto-push/deploy |
| `wontfix`                  | `wontfix`            | Cancelled/closed with reason |

When a skill mentions a role (e.g. "apply the AFK-ready triage label"), use the corresponding label string from this table.

Category labels used alongside triage roles in this repo:

| Category | Meaning |
| -------- | ------- |
| `bug` | Bug/fix task category |
| `enhancement` | Feature/improvement task category |
