# Content Editor — installation and administrator access

This site is **not** a hosted admin account until the steps below are completed. GitHub Pages cannot securely process GitHub OAuth credentials or write repository files alone. The editor needs a small Cloudflare Worker, a GitHub App, and a Cloudflare KV namespace.

## 1. Create a GitHub App

In GitHub, go to **Settings → Developer settings → GitHub Apps → New GitHub App**.

* Name: `Circumpolar Ethnobotanical Content Editor` (or another available name).
* Homepage URL: `https://ksheifer.github.io/circumpolar-ethnobotanical-database/`.
* **User authorization callback URL**: `https://YOUR-WORKER.workers.dev/auth/callback` (use the actual Worker URL once deployed).
* Under Repository permissions, grant **Contents: Read and write** and **Metadata: Read** (automatic). No organization permissions.
* Enable **Request user authorization (OAuth) during installation** if available.
* Install this App **only** on `ksheifer/circumpolar-ethnobotanical-database`, not on all repositories.
* Copy the GitHub App **Client ID** and generate a **Client secret**. The secret belongs only in Cloudflare Worker secrets; never in the repository.

An administrator signs in using the existing GitHub account `ksheifer` (or another account explicitly configured as `ADMIN_GITHUB_LOGIN`). No additional password or public admin account is created.

## 2. Deploy Cloudflare Worker

From `worker/`:

```bash
npm install -g wrangler
wrangler login
wrangler kv namespace create SESSIONS
cp wrangler.toml.example wrangler.toml
```

Replace `REPLACE_WITH_KV_ID`, `REPLACE_WITH_YOUR_WORKER`, and `REPLACE_WITH_GITHUB_APP_CLIENT_ID` in `wrangler.toml`. Configure the real HTTPS Worker URL as `API_BASE_URL`, the desired repository `GITHUB_OWNER` and `GITHUB_REPO`, and your exact GitHub account name as `ADMIN_GITHUB_LOGIN`. Set the application origin to `https://ksheifer.github.io` (note: **origin only, no project path**).

Store your GitHub App client secret securely:

```bash
wrangler secret put GITHUB_CLIENT_SECRET
wrangler deploy
```

Set your GitHub App authorization callback URL to the deployed Worker's `/auth/callback` URL. The GitHub App's permissions and installation must both allow writing to the repo. If the branch is protected, the direct-save mode may be rejected by GitHub; change branch policies or adapt the backend to publish via pull requests.

For production, use a Cloudflare Worker custom domain when possible. KV stores temporary OAuth state and short-lived user sessions; tokens are never stored in website JSON or JavaScript.

## 3. Connect the editor page

In the repository's `admin/config.js`, set:

```js
window.CEDB_EDITOR_API = 'https://YOUR-WORKER.workers.dev';
```

This URL is public configuration, **not a secret**. Deploy the full repository to GitHub Pages. Then visit:

`https://ksheifer.github.io/circumpolar-ethnobotanical-database/admin/`

Click **Sign in with GitHub**, authorize as the configured administrator, find a plant, make changes, and choose **Save profile to GitHub**. Each Save updates one record within its language JSON file and creates a GitHub commit. The site rebuild may take a short time to reflect the commit.

## Technical details

* The backend reads the **latest** language JSON file and requires its Git SHA (`expectedSha`). On mismatch it returns HTTP **409** instead of overwriting anyone else's work.
* Records are matched by stable `phytonym_id` and `language_id`. Other records in the same file remain intact.
* Only allowed content keys can change. Reference IDs and profile structure are not editable through this UI. The backend verifies dialect and locality IDs exist.
* The content editor supports: name, one primary variety (`dialect_id`), other-variety forms, morphology, related forms, Russian/English glosses, ecological data and its English translations, Indigenous Knowledge and its English translations, reference locality, and per-attestation locality, dialect IDs and source pages.
* **Not yet included**: adding new phytonym records, creating new source/taxon/dialect/locality records, editing global bibliographic/taxonomic datasets, adding/removing attestations or editing field-level citations (`field_sources`). These would require additional content-editor controls, but no structure-editor access.
* The OAuth popup issues a random session identifier kept in `sessionStorage`, and the Worker stores the GitHub user token in a short-lived private KV record. The Worker checks the GitHub login on OAuth callback; the client cannot self-assign administrator status.
* The Worker requires `EDITOR_ORIGIN` for CORS and validates GitHub identity + bearer session for each data write.
* Source JSON is UTF-8, formatted with two spaces. If the existing GitHub App/Worker is disabled, the public database remains readable.

**Never commit `worker/wrangler.toml`, `.env`, GitHub secrets, OAuth access tokens, or API tokens.**

## Delete a phytonym profile

Open a profile with the pencil, sign in as the configured editor and click the trash-can **Delete profile** button at the bottom. The browser warns and requires the **exact current phytonym name**. The Worker then authenticates the request, checks the exact `phytonym_id` and `language_id`, checks the file SHA against the version opened by the editor, verifies the confirmation text, and commits the JSON file with only that record removed. No other phytonyms are modified. Deleted records can be restored using Git history.

**After updating the website files, redeploy the updated `worker/index.js` to the existing Cloudflare Worker.** Without that step, the new Delete button will receive 404 from the old backend. Keep the same KV binding, credentials and Worker URL; no new credentials or database upload is required.
