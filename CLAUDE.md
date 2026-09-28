# Aura

- Docs index: `docs/README.md`. The current design is `docs/design/`; read `overview.md` plus the files your task touches.
- `docs/archive/`, `docs/proposals/`, `docs/backlog.md` and `docs/icebox.md` are not the current design. Don't build from them unless asked.
- Design writing and review rules: `docs/process.md`. Design docs describe the game in the present tense; planned features go to `docs/backlog.md`; parked or rejected ideas go to `docs/icebox.md`.
- Any change to numbers: run `pnpm test` (balance tests) and `pnpm sim`; the simulation is the source of truth.
- Reviews of design or balance go to an independent subagent with fresh context, not the author.
- Every subagent writes its work up in `docs/reports/YYYY-MM-DD-topic.md`: what it was asked, what it did and ran, what it found and what it changed. Put this rule in every subagent's prompt.
- Code rules: `docs/tech.md`.
