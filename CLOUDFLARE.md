# Cloudflare deployment

## Environments

| Environment | Worker | D1 database | Purpose |
| --- | --- | --- | --- |
| Preview | `tanoshitest-portal-demo-showcase-preview` | `portal-demo-showcase-preview-db` | Test changes before release |
| Production | `tanoshitest-portal-demo-showcase` | `portal-demo-showcase-db` | Live data |

Preview URL:

`https://tanoshitest-portal-demo-showcase-preview.tanomorivietnam.workers.dev`

The two environments use separate databases. Preview edits never overwrite production data.

## Commands

```powershell
# Run the preview Worker at the existing localhost origin. This imports legacy
# browser data from http://localhost:8080 into preview D1 after Admin login.
npm run cloud:dev

# Build and deploy preview while developing
npm run cloud:deploy:preview

# Apply a new migration to preview
npm run cloud:migrate:preview

# Build and deploy production after approval
npm run cloud:deploy

# Apply a new migration to production before deploying code that needs it
npm run cloud:migrate:production
```

Run `npm run build` before a release. Do not force-push or rewrite published Git history because this repository is connected to Lovable.

## Data model

- D1 stores users, hashed passwords, sessions, application data, public contact/order submissions, and audit logs.
- The browser keeps a working cache for fast UI updates. Pending writes are retried before cloud data is pulled, so a short network interruption or refresh does not overwrite unsynced edits.
- Admin-only catalog data is protected by the Worker API. Admin and Sale operational data is shared through D1.
- Sessions use an `HttpOnly`, `SameSite=Lax`, secure cookie and are not restored from `localStorage`.
- Existing browser data is uploaded to D1 after the first successful Admin login.

Legacy browser data is scoped to `http://localhost:8080`. Run `npm run cloud:dev`, open that exact URL, and log in as Admin once to migrate it. Do not clear browser storage until the data is visible on the preview URL.

## Release checklist

1. Test the change on the preview Worker.
2. Confirm `npm run build` succeeds.
3. Apply production migrations, if any.
4. Set a private production Admin password before exposing the production Worker.
5. Deploy production.
6. Verify login, one edit, refresh, and logout on the live domain.

## Files and R2

Structured document metadata is stored in D1. Large uploaded document bodies require an R2 bucket. R2 is not enabled for this account yet, so large files are marked as pending instead of being inserted into D1.
