# SOP for Orchestrator (Antigravity 2.0 Native UI Diffs)

**ABSOLUTE RULE FOR THE ORCHESTRATOR:**
1. Subagents (PM, Architect, Engineer) must NOT push changes directly to the main branch if those changes are meant to be reviewed by the User.
2. The Orchestrator MUST manually use the `multi_replace_file_content` (or `replace_file_content` / `write_to_file`) tool IN THE MAIN CHAT to inject the subagent's changes into the main codebase.
3. This is the **ONLY** way to trigger the native Antigravity 2.0 visual "Files Changed" panel (e.g. `1 file changed +4-0`) with the `Review` button.
4. If a subagent bypasses this and syncs code directly, the Orchestrator MUST rollback the file (`git checkout HEAD -- <file>`) and re-apply the changes using the tool in the main chat.

*This rule supersedes all other automation rules. The user's visual diff experience is paramount.*

---

## MANDATORY REVIEW GATES — HARD BLOCK RULES (Added after v8.1.0 incident)

**ИНЦИДЕНТ v8.1.0 (14 августа 2026):** Оркестратор обошёл все три шлюза ревью, приняв комментарии к плану за явный аппрув. Это НАРУШЕНИЕ SOP.

### Gate 1A — PRD Review (блокировка до явного «Approve PRD»)
- После завершения PM-субагента и применения `PRD.md` через main context:
- Оркестратор ОБЯЗАН написать: *«Сергей Николаевич, прошу ознакомиться с PRD.md в Files Changed и подтвердить: `Approve PRD`»*
- **СТОП.** Продолжение ЗАПРЕЩЕНО до получения точной фразы `Approve PRD` от Сергея Николаевича.
- Комментарии к плану, ответы «да», «продолжай», «Continue» — НЕ являются аппрувом Gate 1A.

### Gate 1B — System Design Review (блокировка до явного «Approve Architecture»)
- После завершения Architect-субагента и применения `System_Design.md`:
- Оркестратор ОБЯЗАН написать: *«Никоглай, прошу ознакомиться с System_Design.md в Files Changed и подтвердить: `Approve Architecture`»*
- **СТОП.** Продолжение ЗАПРЕЩЕНО до получения точной фразы `Approve Architecture`.

### Gate 2 — Code Review (блокировка до явного «Approve»)
- После завершения Engineer-субагента и применения diff через main context:
- Оркестратор ОБЯЗАН написать: *«Никоглай, прошу ознакомиться с полным diff в Files Changed и подтвердить: `Approve`»*
- **СТОП.** Продолжение ЗАПРЕЩЕНО до получения явного «Approve» от Никоглая.
- «Continue» от пользователя — НЕ является аппрувом Gate 2.

### КЛЮЧЕВОЕ ПРАВИЛО
> Пользовательский комментарий к `implementation_plan.md` (фаза планирования) ≠ Gate 1A PRD Approve.
> Любой ответ, кроме точной фразы-ключа, не снимает блокировку шлюза.

