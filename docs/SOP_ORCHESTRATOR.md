# SOP for Orchestrator (Antigravity 2.0 Native UI Diffs)

**ABSOLUTE RULE FOR THE ORCHESTRATOR:**
1. Subagents (PM, Architect, Engineer) must NOT push changes directly to the main branch if those changes are meant to be reviewed by the User.
2. The Orchestrator MUST manually use the `multi_replace_file_content` (or `replace_file_content` / `write_to_file`) tool IN THE MAIN CHAT to inject the subagent's changes into the main codebase.
3. This is the **ONLY** way to trigger the native Antigravity 2.0 visual "Files Changed" panel (e.g. `1 file changed +4-0`) with the `Review` button.
4. If a subagent bypasses this and syncs code directly, the Orchestrator MUST rollback the file (`git checkout HEAD -- <file>`) and re-apply the changes using the tool in the main chat.

*This rule supersedes all other automation rules. The user's visual diff experience is paramount.*

---

## MANDATORY REVIEW GATES — HARD BLOCK RULES & UNIFIED FILES CHANGED FORMAT
 
ИНЦИДЕНТ v9.0.0 (18 августа 2026): Оркестратор не зарегистрировал все созданные субагентом файлы в основном диалоге, из-за чего виджет Files Changed содержал неполный список.
 
### ЕДИНЫЙ СТАНДАРТ ДЛЯ ВСЕХ 4 ФАЗ КОНВЕЙЕРА:

1. **Фаза 1 / Gate 1A — PRD Review (блокировка до явного подтверждения):**
   - Оркестратор ОБЯЗАН вызвать `write_to_file` / `replace_file_content` для `PRD.md` в основном диалоге;
   - Загорается виджет `Files Changed (1)`;
   - Запрос аппрува у Сергея Николаевича: `«Сергей Николаевич, прошу ознакомиться с PRD.md в Files Changed и подтвердить»`.

2. **Фаза 2 / Gate 1B — System Design Review (блокировка до явного подтверждения):**
   - Оркестратор ОБЯЗАН вызвать `write_to_file` / `replace_file_content` для `System_Design.md` в основном диалоге;
   - Загорается виджет `Files Changed (1)`;
   - Запрос аппрува у Никоглая: `«Никоглай, прошу ознакомиться с System_Design.md в Files Changed и подтвердить: Approve Architecture»`.

3. **Фаза 3 / Gate 2 — Code Review (блокировка до явного подтверждения):**
   - Оркестратор ОБЯЗАН вызвать `write_to_file` / `replace_file_content` в основном диалоге для **КАЖДОГО** файла из дельты кода (`src/js/*.js`, `src/index.html`, `src/style.css`, `Dockerfile`, `nginx.conf.template`, `.dockerignore`, `tests/*.js` и др.);
   - Загорается виджет `Files Changed (N)` со 100% файлов релиза;
   - Запрос аппрува у Никоглая: `«Никоглай, прошу ознакомиться с полным diff в Files Changed и подтвердить: Approve»`.

4. **Фаза 4 / Gate 3 — QA & Release (блокировка до прохождения тестов):**
   - Оркестратор ОБЯЗАН вызвать `write_to_file` / `replace_file_content` для `Test_Report.md` в основном диалоге;
   - Прогон unit-тестов и E2E Marionette в Firefox;
   - Запуск и проверка локального сервера на `http://localhost:3000`;
   - Фиксация коммита, git push и релизный тег.

