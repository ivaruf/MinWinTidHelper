---
name: new-version
description: Release a new version of MinWinTidHelper from the terminal — check that the local repo and GitHub agree, propose a version bump and a one-sentence "what's new" from the commits since the last release, and on the owner's explicit yes run the "Ny versjon" GitHub Actions workflow with gh, watch it, and report the release and the Chrome Web Store submission. Use when the user says "new version", "ny versjon", "release", "lag en release", "slipp en ny versjon" or "bump the version".
---

# New version → a GitHub release and a Chrome Web Store update

A release is made by the **"Ny versjon"** workflow (`.github/workflows/release.yml`). Its `release`
job bumps the version in `manifest.json` and line 2 of `content.js`, commits, tags `vX.Y.Z`, builds
the Chrome/Edge and Firefox zips (`tools/build.py`) and publishes a GitHub release. Its
`chrome-web-store` job then uploads the Chrome zip to the Chrome Web Store and submits it for
review, so **running it is what reaches every user**: Chrome updates them by itself once Google
approves it (hours to days). The "what's new" sentence goes in the release notes.

This skill triggers that same workflow from the terminal with `gh`, so there is one release path
whether the owner clicks in GitHub or asks here. Read the workflow file if anything below is unclear.

## What you may and may not do

- **Read-only checks are yours**: `git status`, `git log`, `git rev-parse`, `gh release view`,
  `gh api`, `gh run list/view/watch`.
- **Never `git push`, `git pull`, `git fetch` or tag locally** (global CLAUDE.md). When something
  needs pushing or pulling, hand the owner the command to run with `!`, e.g. `! git push`.
- **Running the workflow is publishing.** Ask for an explicit yes first, with AskUserQuestion,
  naming the new version and saying it goes to the Chrome Web Store and so to everyone. Invoking the skill, or
  agreeing to an earlier step, is not that yes. Anything but a clear yes: stop, and give the owner
  the `gh workflow run` command to run themselves instead.

## Steps

1. **Is GitHub up to date with the local repo?** The workflow releases what's on GitHub's
   `master`, not the local checkout.
   - `git status --porcelain`: uncommitted changes won't be in the release. Say so; offer to
     commit them if they belong in it.
   - Compare `git rev-parse HEAD` with
     `gh api repos/ivaruf/MinWinTidHelper/commits/master --jq .sha`.
     Local ahead → the owner must push first (`! git push`). Local behind → `! git pull` first, so
     your read of the changes below is right. Don't continue until they match.
   - `gh workflow view release.yml` must find the workflow; if it doesn't, it hasn't been pushed.

2. **What would be released?**
   - Current version: `"version"` in `manifest.json`.
   - Latest release: `gh release view --json tagName,publishedAt` (an error means none yet).
   - Changes since then:
     `gh api repos/ivaruf/MinWinTidHelper/compare/<tag>...master --jq '.commits[].commit.message'`
     (with no release yet, use `git log --oneline` for recent history).
   - If nothing changed since the last release, say so and stop; the store would push an update
     with nothing new to everyone, and each one waits for Google's review.

3. **Propose the bump and the sentence.**
   - Bump: `patch` for fixes only, `minor` for new features (the usual), `major` for big changes
     to how it's used. Always bump from the version in `manifest.json`, even if that version
     was never released; a skipped number is harmless.
   - Sentence: one short Norwegian sentence, written for the people who use the extension, not
     for developers, e.g. "Knappene for dagen skjules når dagen er godkjent." Keep it under ~90
     characters and leave out commit-speak.
   - Ask with AskUserQuestion: the bump (your pick first, marked recommended) and the sentence
     (your draft; the owner can write their own via "Other"). Then ask the explicit yes to
     publish `vX.Y.Z` — that can be the same AskUserQuestion call.

4. **Run the workflow** (only after that yes). Pass the inputs as JSON so quotes in the
   sentence can't break the command:

   ```sh
   jq -n --arg bump "<bump>" --arg notes "<sentence>" '{bump: $bump, notes: $notes}' \
     | gh workflow run release.yml --ref master --json
   ```

   Then find the run (`gh run list --workflow release.yml --limit 1 --json databaseId,status,url`,
   give it a few seconds to appear) and follow it in the foreground with
   `gh run watch <id> --exit-status`.

5. **Report.** `gh release view v<X.Y.Z> --json url,assets --jq '{url, assets: [.assets[].name]}'`:
   give the release URL and the two zips, and say the version is submitted to the Chrome Web
   Store and reaches users when Google has approved it. Then tell the owner the workflow pushed a
   version commit and a tag to `master`, so the local repo is now behind: `! git pull --tags`.

## When the workflow fails

Read the failed step with `gh run view <id> --log-failed`.

- **"vX.Y.Z finnes allerede"**: that version is already released; pick another bump.
- **Push rejected** (`protected branch`, `permission denied`, 403): `master` has branch
  protection that blocks the bot, or Settings → Actions → General → Workflow permissions is
  "Read". The owner fixes that on GitHub, then runs the workflow again with the same bump. The
  push is atomic (commit and tag together), so nothing landed and nothing needs undoing.
- **Failed after the tag was pushed** (build or `gh release create`): the version commit and tag
  exist but there's no release. Don't bump again. Tell the owner, and offer
  `gh release create vX.Y.Z --generate-notes` with the zips from `python3 tools/build.py` as the
  fix — again only on an explicit yes, since that publishes. The store job won't have run; after
  the release exists, rerun the failed jobs (below).
- **The `chrome-web-store` job failed** (the GitHub release is out): don't bump again. Once the
  cause is fixed, `gh run rerun <id> --failed` reruns only that job; ask first, since it submits
  to the store. Common causes: `Log in to Google` failing means the repo variables
  `GCP_WIF_PROVIDER` / `CWS_SERVICE_ACCOUNT` or the Workload Identity setup are wrong (README,
  "Chrome Web Store-oppsett"); a 401/403 from the store means the service account isn't added under
  Account in the developer dashboard, or `CWS_PUBLISHER_ID` is wrong; an upload error about the
  version means the store already has that version, which needs a new bump.
