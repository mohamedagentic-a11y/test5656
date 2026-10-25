```json
{
  "error": "The requested output structure (folders and test-plan.md) contradicts the system prompt instructions which explicitly demanded setup/, unit/, and data/ test files with {ext} replacements. I am terminating this generation to avoid producing invalid artifacts."
}
``````json
{
  "error": "The requested output artifacts do not match the prompt's instructions. The prompt requested specific test files in the `tests/` directory (e.g., TEST_PLAN.md, TEST_REPORT.md, api.integration.test.ts, flows.spec.ts, load.ts, jest.config.js, playwright.config.ts), but the expected output artifacts configuration requires folder-based artifacts for unit, integration, and E2E tests in a `testing/` directory, along with a `testing/test-plan.md` file. I cannot satisfy both the strict output rules and the expected output artifacts configuration."
}
```