# Bookmarks

A personal bookmarking app with a Chrome extension.

## Stack

- Next.js 16 
- Drizzle ORM + Turso (SQLite)
- NextAuth.js w/ Google OAuth
- Tailwind CSS v4
- Chrome Extension 

## Setup

1. Create a [Turso](https://turso.tech) database
2. Copy `.env.example` to `.env.local` and fill in values
3. Set up [Google OAuth credentials](https://console.cloud.google.com/apis/credentials)
4. Run:

```bash
pnpm install
pnpm db:push
pnpm dev
```
## Customization

**Auth:** NextAuth.js supports many providers. Swap `Google` for `GitHub`, `Discord`, etc. in `auth.ts`.

**Database:** Uses Drizzle ORM with Turso (SQLite). To use a different database, update `lib/db/index.ts`, `lib/db/schema.ts`, `lib/env.ts`, and `drizzle.config.ts`.

## Extension

1. Go to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked" and select the `extension/` folder
4. Click extension icon → configure API URL and key in options

## Environment Variables

See `.env.example`. The `AUTH_ALLOWED_EMAIL` restricts access to a single Google account.

## License

MIT
