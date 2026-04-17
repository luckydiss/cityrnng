# CITYRNNG Agent Protocol

This file is the mandatory cross-agent bootstrap for Claude, Codex-style agents, and any other repository agent.

## Scope

These instructions apply to any agent operating in this repository.

The goal is not only to follow product and architecture docs, but also to force the agent to load and obey the local semantic rule-pack before doing work.

## Canonical rule-pack resolution

Agents must resolve the local rule-pack using this exact search order:

1. `./.skills/`
2. `./skills/`

The first existing directory is the active rule-pack for the session.

Current repository state:

- the active rule-pack is expected to be `./.skills/` or `./skills/`, depending on host naming conventions;
- `skills/` is the canonical logical name for the rule-pack.

## Hard requirement before work

Before answering, editing files, planning implementation, reviewing code, debugging, or generating architecture artifacts, the agent must:

1. Read this `AGENTS.md`.
2. Resolve the active rule-pack.
3. Read `rules/rules.md` from that pack.
4. Determine the task mode.
5. Read the mode-specific mandatory rule file.
6. Read any secondary files explicitly required by those rules.

If any required rule file is missing, the agent must stop and report a blocked state instead of proceeding with best-effort behavior.

## Task mode routing

Agents must classify the task before acting.

### `Code`

Use for:

- implementation;
- refactoring;
- code rewrite;
- file edits;
- semantic annotation of legacy code;
- XML graph maintenance.

Mandatory reads:

- `rules/rules.md`
- `rules-code/rules.md`

Read when applicable:

- `rules-code/graph_generation_prompt.md`
- `rules-code/memory_guide.md`
- `rules-architect/data_transformation_guide.md`

### `Debug`

Use for:

- bug investigation;
- incident analysis;
- tracing broken flows;
- logging strategy.

Mandatory reads:

- `rules/rules.md`
- `rules-debug/rules.md`

Read when applicable:

- `rules-debug/dynamic_logging_heuristics.md`

### `Architect`

Use for:

- feature decomposition;
- major design work;
- requirements clarification;
- design documents;
- development plans.

Mandatory reads:

- `rules/rules.md`
- `rules-architect/rules.md`

Read when applicable:

- `rules-architect/document_template.md`
- `rules-architect/dev_plan_template.md`
- `rules-architect/data_transformation_guide.md`

### `Orchestrator`

Use for:

- multi-step management work;
- backlog orchestration;
- memory synchronization;
- high-level delegation planning.

Mandatory reads:

- `rules/rules.md`
- `rules-orchestrator/rules.md`

## Non-negotiable execution rules

Agents must treat the resolved rule-pack as a mandatory local protocol.

This means:

- do not replace the local semantic format with a simpler personal style;
- do not omit `MODULE_CONTRACT`, `MODULE_MAP`, `USE_CASES`, `CONTRACT`, or `START/END` anchors when the active rules require them;
- do not skip `AppGraph.xml` updates when code changes affect architecture;
- do not claim completion if required semantic artifacts are missing;
- do not silently downgrade to "normal coding assistant mode".

## Required behavior for code changes

For any code modification task, the agent must:

1. Read the required rule files for `Code` mode.
2. Read the relevant product and architecture docs.
3. Inspect existing code before editing.
4. Preserve and extend semantic annotations instead of removing them.
5. Update `AppGraph.xml` when module structure or interactions change.
6. Maintain `Knowledgebase.xml` when a local snapshot is part of the repository workflow.
7. Run available validation checks.
8. Report blockers explicitly if environment validation cannot be completed.

## Required behavior for legacy annotation tasks

If the task is to annotate or re-annotate legacy code, the agent must:

- rewrite the source files directly;
- avoid introducing helper generators into the project unless explicitly requested;
- prefer in-place semantic enrichment of existing code;
- verify tag parity and map consistency after changes;
- regenerate XML graph artifacts to match the new annotated state.

## Validation policy

Agents must validate what they can locally.

Minimum validation expectations:

- structural check for `START_*` and `END_*` parity;
- consistency between `MODULE_MAP` and actual annotated entities;
- XML parsing validation for `AppGraph.xml` and related XML artifacts;
- available build, typecheck, or test commands when the environment supports them.

If package manager or dependencies are unavailable, the agent must say so explicitly and mark runtime validation as blocked, not passed.

## Reporting policy

When completing work, the agent must report:

- which rule-pack path was used;
- which mode was applied;
- what artifacts were changed;
- what validation passed;
- what remained blocked.

## Repository context

Core project docs:

- `docs/PRD.md`
- `docs/ARCHITECTURE.md`
- `docs/ERD.md`
- `docs/API-CONTRACTS.md`
- `docs/BACKLOG.md`

Core project constraints:

- modular monolith only;
- `pnpm + Turborepo`;
- `Next.js + TypeScript + Tailwind` for web;
- `NestJS + TypeScript` for API;
- `Prisma + PostgreSQL`;
- `Redis + BullMQ`;
- ledger-based points model;
- idempotent point and redemption flows;
- audited manual adjustments.

## Migration note

The legacy `.kilocode` name has been replaced by `.skills`.

Agents must treat `.skills` and `skills` as the canonical rule-pack naming convention going forward.
