# Repository Guidelines

## Project Structure & Module Organization
- `src/` contains the extension source code.
- `src/entrypoints/` defines extension entrypoints (background, content, popup, etc.).
- `src/core/` holds affiliate detection and URL restoration logic; tests live alongside as `.spec.ts`.
- `src/components/` contains React UI pieces; `src/services/` hosts shared service logic.
- `src/assets/` and `public/` store static assets.
- Build output lands in `dist/`; coverage reports in `coverage/`.

## Build, Test, and Development Commands
- `pnpm install` installs dependencies and runs `wxt prepare`.
- `pnpm run dev` starts the WXT dev server for Chrome.
- `pnpm run dev:firefox` runs the dev server for Firefox.
- `pnpm run build` / `pnpm run build:firefox` produce production builds in `dist/`.
- `pnpm run zip` / `pnpm run zip:firefox` create release archives.
- `pnpm run compile` runs a TypeScript type check.
- `pnpm run test` runs Vitest once with coverage; `pnpm run test:watch` watches.
- `pnpm run format` formats with Prettier.

## Coding Style & Naming Conventions
- TypeScript + React with ESM (`"type": "module"`).
- Use 2-space indentation and double quotes; let Prettier enforce formatting.
- Functions and variables use `camelCase`.
- Provider modules follow `src/core/<provider>/is<Provider>.ts` and `get<Provider>Original.ts`.
- Test files end with `.spec.ts` and mirror the module name.

## Testing Guidelines
- Framework: Vitest with the `jsdom` environment.
- Co-locate tests with their logic in `src/core/**`.
- Add tests for new providers or URL edge cases; run `pnpm run test` before PRs.

## Commit & Pull Request Guidelines
- Commit messages use Conventional Commits (e.g., `feat:`, `fix:`, `docs:`, `test:`, `chore:`, `style:`).
- PRs should include a clear summary, tests run, and screenshots for UI changes.
- Link related issues when applicable.

## Security & Configuration Tips
- Extension settings live in `wxt.config.ts`; keep permissions minimal.
- Keep URL parsing in `src/core/` pure and side-effect free for easier review.
