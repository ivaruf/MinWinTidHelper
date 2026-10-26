#!/usr/bin/env bash
# One-time setup so the "Ny versjon" workflow can publish to the Chrome Web Store without keys:
# GitHub Actions logs in as the service account cws-publisher through Workload Identity
# Federation, and only from this repo's master branch. Safe to run again; it skips what exists.
#
# Run it in Google Cloud Shell, logged in as the account that owns the Chrome Web Store listing:
#   curl -fsSL https://raw.githubusercontent.com/ivaruf/MinWinTidHelper/master/tools/setup-chrome-web-store.sh | bash -s <project-id>
set -euo pipefail

PROJECT=${1:?Bruk: setup-chrome-web-store.sh <prosjekt-id>}
REPO=ivaruf/MinWinTidHelper
SA=cws-publisher@$PROJECT.iam.gserviceaccount.com

gcloud config set project "$PROJECT"
PROJECT_NUMBER=$(gcloud projects describe "$PROJECT" --format='value(projectNumber)')

echo "→ Skrur på API-ene (kan ta et minutt)"
gcloud services enable chromewebstore.googleapis.com iamcredentials.googleapis.com sts.googleapis.com

echo "→ Tjenestekontoen $SA"
gcloud iam service-accounts describe "$SA" > /dev/null 2>&1 ||
    gcloud iam service-accounts create cws-publisher --display-name="Chrome Web Store publisher"

echo "→ Workload identity pool for GitHub"
gcloud iam workload-identity-pools describe github --location=global > /dev/null 2>&1 ||
    gcloud iam workload-identity-pools create github --location=global --display-name=GitHub

echo "→ GitHub som innloggingsleverandør, bare for $REPO på master"
gcloud iam workload-identity-pools providers describe minwintidhelper \
    --location=global --workload-identity-pool=github > /dev/null 2>&1 ||
    gcloud iam workload-identity-pools providers create-oidc minwintidhelper \
        --location=global --workload-identity-pool=github \
        --issuer-uri=https://token.actions.githubusercontent.com \
        --attribute-mapping=google.subject=assertion.sub,attribute.repository=assertion.repository,attribute.ref=assertion.ref \
        --attribute-condition="assertion.repository=='$REPO' && assertion.ref=='refs/heads/master'"

echo "→ Lar $REPO opptre som tjenestekontoen"
gcloud iam service-accounts add-iam-policy-binding "$SA" \
    --role=roles/iam.workloadIdentityUser \
    --member="principalSet://iam.googleapis.com/projects/$PROJECT_NUMBER/locations/global/workloadIdentityPools/github/attribute.repository/$REPO" \
    > /dev/null

cat <<EOF

Ferdig! To ting gjenstår:

1. Legg til denne under Account i Chrome Web Store sitt utviklerdashbord:
   $SA

2. Sett variablene i GitHub-repoet (fra Mac-en, i mappen til repoet):
   gh variable set CWS_SERVICE_ACCOUNT --body $SA
   gh variable set GCP_WIF_PROVIDER --body projects/$PROJECT_NUMBER/locations/global/workloadIdentityPools/github/providers/minwintidhelper
   gh variable set CWS_PUBLISHER_ID --body <publisher-id fra Account i dashbordet>
EOF
