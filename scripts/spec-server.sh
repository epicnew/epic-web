#!/usr/bin/env bash
# Idempotent boot of the SPEC SERVER — the localhost server behavior specs and
# verify scenarios run against. Reused by the execute and verify phases: the
# first caller boots it, later callers detect it and exit 0.
#
# Why a dedicated server instead of the port-8080 preview: in a remote sandbox
# the 8080 dev server is configured for the cross-site iframe over the HTTPS
# proxy, so its auth cookies are Secure/SameSite=None/Partitioned and Chromium
# silently drops them over plain-HTTP localhost — sign-in returns 200 but no
# session cookie sticks. This server's NEXT_PUBLIC_BASE_URL is localhost, so
# the auth config issues non-secure cookies and sign-in works.
set -euo pipefail
cd "$(dirname "$0")/.."

# Target URL comes from .env.test's BASE_URL (written by the epic provisioning);
# conventional default is 3001.
BASE_URL_LINE=$(grep -E '^[[:space:]]*BASE_URL=' .env.test 2>/dev/null | tail -1 || true)
URL=$(echo "${BASE_URL_LINE#*=}" | tr -d '"' | tr -d '[:space:]')
URL=${URL:-http://localhost:3001}
PORT=${URL##*:}

# Already serving? Reuse it.
if curl -sf "$URL" >/dev/null 2>&1; then
  echo "spec server already running at $URL"
  exit 0
fi

# Only a localhost URL can be booted here. A non-local BASE_URL means the
# environment intends specs to hit an external server — nothing to do.
case "$URL" in
  http://localhost:* | http://127.0.0.1:*) ;;
  *)
    echo "BASE_URL=$URL is not local — refusing to boot a spec server" >&2
    exit 1
    ;;
esac

# Isolated test DB: schema + seeded users.
DATABASE_URL="file:./db/databases/test.db" bun run db:push
DATABASE_URL="file:./db/databases/test.db" bun run db:seed

# SAFEGUARD: skipping the workflow esbuild bundler (DISABLE_WORKFLOW_BUILD=1) is
# what lets a 2nd `next dev` run without crashing the 8080 server's bundler — but
# skipping it means workflow-backed features wouldn't run. So skip ONLY when the
# app has NO workflow directives; if it uses workflows, run the FULL build so
# specs never silently exercise a half-app.
if grep -rslq -e "use workflow" -e "use step" app lib shared 2>/dev/null; then
  WF_FLAG=""
  echo "NOTE: app uses workflows — spec server runs the FULL workflow build."
else
  WF_FLAG="DISABLE_WORKFLOW_BUILD=1"
fi

# NEXT_DIST_DIR=.next-verify → own build dir so this 2nd `next dev` doesn't
# collide with the port-8080 server on `.next`.
env $WF_FLAG NEXT_DIST_DIR=.next-verify \
  DATABASE_URL="file:./db/databases/test.db" NEXT_PUBLIC_BASE_URL="$URL" \
  nohup bun run preview "$PORT" >/tmp/spec-server.log 2>&1 &

# First compile takes ~30-60s.
for _ in $(seq 1 120); do
  if curl -sf "$URL" >/dev/null 2>&1; then
    echo "spec server ready at $URL"
    exit 0
  fi
  sleep 1
done
echo "spec server did not become ready within 120s — see /tmp/spec-server.log" >&2
exit 1
