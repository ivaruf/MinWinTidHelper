---
name: new-version
description: Release a new version of MinWinTidHelper from the terminal — check that the local repo and GitHub agree, propose a version bump and a one-sentence "what's new" from the commits since the last release, and on the owner's explicit yes run the "Ny versjon" GitHub Actions workflow with gh, watch it, and report the release. Use when the user says "new version", "ny versjon", "release", "lag en release", "slipp en ny versjon" or "bump the version".
---

# New version → a GitHub release the owl announces

A release is made by the **"Ny versjon"** workflow (`.github/workflows/release.yml`). It bumps the
version in `manifest.json` and line 2 of `content.js`, commits, tags `vX.Y.Z`, builds the
Chrome/Edge and Firefox zips (`tools/build.py`) and publishes a GitHub release. The owl in
minWINTID reads the latest release (`background.js`), so **publishing is what tells every user
there's something new**, and it reads the "what's new" sentence aloud in its speech bubble.

This skill triggers that same workflow from the terminal with `gh`, so there is one release path
whether the owner clicks in GitHub or asks here. Read the workflow file if anything below is unclear.

## What you may and may not do

- **Read-only checks are yours**: `git status`, `git log`, `git rev-parse`, `gh release view`,
  `gh api`, `gh run list/view/watch`.
- **Never `git push`, `git pull`, `git fetch` or tag locally** (global CLAUDE.md). When something
  needs pushing or pulling, hand the owner the command to run with `!`, e.g. `! git push`.
- **Running the workflow is publishing.** Ask for an explicit yes first, with AskUserQuestion,
  naming the new version and saying the owl will announce it to everyone. Invoking the skill, or
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
   - If nothing changed since the last release, say so and stop; an empty release would make the
     owl announce nothing new.

3. **Propose the bump and the sentence.**
   - Bump: `patch` for fixes only, `minor` for new features (the usual), `major` for big changes
     to how it's used. Always bump from the version in `manifest.json`, even if that version
     was never released; a skipped number is harmless.
   - Sentence: one short Norwegian sentence, written for the people who use the owl, not for
     developers, e.g. "Ugla sier nå ifra når det er kommet en ny versjon." It's read aloud in a
     speech bubble, so keep it under ~90 characters and leave out commit-speak.
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
   give the release URL and the two zips. Then tell the owner the workflow pushed a version
   commit and a tag to `master`, so the local repo is now behind: `! git pull --tags`.
   Users see the owl's announcement next time they open minWINTID (it checks at most every
   6 hours; clicking the version line by the birdhouse checks at once).

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
  fix — again only on an explicit yes, since that publishes.
