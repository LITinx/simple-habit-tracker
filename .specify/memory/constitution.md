<!--
Sync Impact Report
==================
Version change: 0.0.0 → 1.0.0 (initial ratification)
Modified principles: N/A (initial version)
Added sections:
  - Core Principles (3): Simplicity First, Incremental Delivery, Pragmatic Testing
  - Development Workflow
  - Technology Constraints
  - Governance
Removed sections: N/A
Templates requiring updates:
  - .specify/templates/plan-template.md ✅ (Constitution Check section compatible)
  - .specify/templates/spec-template.md ✅ (requirements format compatible)
  - .specify/templates/tasks-template.md ✅ (task structure compatible)
Follow-up TODOs: None
-->

# Habit Tracker Constitution

## Core Principles

### I. Simplicity First

Every decision MUST favor the simplest solution that meets current requirements.

- **YAGNI (You Aren't Gonna Need It)**: Do not implement features, abstractions, or
  configurations for hypothetical future needs. Build only what is explicitly required now.
- **Minimal Dependencies**: Add external packages only when they provide substantial value.
  Prefer standard library and platform APIs over third-party solutions.
- **No Premature Abstraction**: Three similar lines of code are better than a premature helper
  function. Extract abstractions only when a pattern repeats 3+ times with clear benefit.
- **Delete Over Deprecate**: Remove unused code immediately. No backwards-compatibility shims,
  no `_unused` prefixes, no "removed" comments. If it's not needed, it's gone.

**Rationale**: Complexity is the primary source of bugs, maintenance burden, and cognitive
overhead. Simplicity enables faster iteration and easier onboarding.

### II. Incremental Delivery

Features MUST be delivered in small, independently valuable increments.

- **Working Software Over Complete Software**: Each commit should leave the application in a
  working state. Partial features are acceptable if they don't break existing functionality.
- **Vertical Slices**: Implement end-to-end functionality for one user story before expanding
  scope. A single working habit tracker is better than three half-built features.
- **Validate Early**: Get working code in front of users (or yourself) as quickly as possible.
  Real feedback beats hypothetical planning.
- **Small PRs**: Keep pull requests focused on a single concern. Large changes are harder to
  review and more likely to introduce bugs.

**Rationale**: Incremental delivery reduces risk, provides faster feedback loops, and ensures
the project always has demonstrable value.

### III. Pragmatic Testing

Tests MUST provide confidence without becoming a maintenance burden.

- **Test Behavior, Not Implementation**: Write tests that verify what the code does, not how
  it does it. Tests should survive refactoring.
- **Integration Over Unit**: Prefer integration tests that exercise real user flows over unit
  tests of internal implementation details. One integration test often replaces many unit tests.
- **Manual Testing Is Valid**: For UI interactions and visual elements, manual testing may be
  more effective than automated tests. Document what to test manually.
- **No Test Theater**: Do not write tests solely to increase coverage numbers. Every test
  should catch a real class of bugs.

**Rationale**: Testing should increase confidence in changes, not slow down development or
create false security.

## Technology Constraints

- **Language**: TypeScript with strict mode enabled
- **Runtime**: Node.js (server) / Browser (client)
- **Framework**: Choose the simplest option that meets requirements; document choice in plan.md
- **Storage**: Start with file-based or browser storage; migrate to database only when needed
- **Build Tools**: Use standard tooling (npm/pnpm, esbuild/vite); avoid complex configurations

## Development Workflow

- **Branch Strategy**: Feature branches off main; merge via pull request
- **Commit Messages**: Imperative mood, describe what the change does (not what you did)
- **Code Review**: All changes require review before merge; reviewer checks constitution compliance
- **Documentation**: Update docs only when behavior changes; no documentation for documentation's sake

## Governance

This constitution establishes the non-negotiable principles for the Habit Tracker project.

- **Supremacy**: These principles override convenience, personal preference, and "industry
  best practices" unless explicitly amended.
- **Amendment Process**: Changes to this constitution require:
  1. Written proposal with rationale
  2. Review of impact on existing code
  3. Update to this document with version increment
- **Compliance**: Code reviews MUST verify adherence to these principles. Violations require
  explicit justification in the PR description.
- **Versioning**: MAJOR for principle changes, MINOR for new sections, PATCH for clarifications.

**Version**: 1.0.0 | **Ratified**: 2026-01-28 | **Last Amended**: 2026-01-28
