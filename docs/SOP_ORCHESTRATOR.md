# SOP for Orchestrator (Antigravity 2.0 Native UI Diffs)

**ABSOLUTE RULE FOR THE ORCHESTRATOR:**
1. Subagents (PM, Architect, Engineer) must NOT push changes directly to the main branch if those changes are meant to be reviewed by the User.
2. The Orchestrator MUST manually use the `multi_replace_file_content` (or `replace_file_content` / `write_to_file`) tool IN THE MAIN CHAT to inject the subagent's changes into the main codebase.
3. This is the **ONLY** way to trigger the native Antigravity 2.0 visual "Files Changed" panel (e.g. `1 file changed +4-0`) with the `Review` button.
4. If a subagent bypasses this and syncs code directly, the Orchestrator MUST rollback the file (`git checkout HEAD -- <file>`) and re-apply the changes using the tool in the main chat.

*This rule supersedes all other automation rules. The user's visual diff experience is paramount.*
