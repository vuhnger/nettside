#!/usr/bin/env bash
#
# Skanner hver skill i .opencode/skills med SkillSpector.
#
# Skills leses inn i agentens kontekst og kjøres med agentens rettigheter, uten
# noen review-runde utover den som skjer i pull requesten. Denne skanningen er
# den runden: den fanger prompt injection, eksfiltrering og andre mønstre som er
# lette å overse i en markdown-fil som ellers ser ut som dokumentasjon.
#
# LLM-trinnet er skrudd av med vilje. Statisk analyse er deterministisk og
# trenger ingen nøkkel, så den kan kjøres av hvem som helst og gir samme svar i
# CI som lokalt.
#
set -euo pipefail

SKILLS_DIR="${SKILLS_DIR:-.opencode/skills}"
BASELINE_FILE="${BASELINE_FILE:-.skillspector-baseline.yaml}"

if ! command -v skillspector >/dev/null 2>&1; then
  echo "skillspector finnes ikke på PATH." >&2
  echo "Installer den med: uv tool install git+https://github.com/NVIDIA/skillspector.git" >&2
  exit 2
fi

scan_args=(--no-llm --format json)
# Baselinen er valgfri. Uten den skannes alt fra scratch; med den rapporteres
# bare nye funn, slik at en akseptert falsk positiv ikke blokkerer hver PR.
if [ -f "$BASELINE_FILE" ]; then
  scan_args+=(--baseline "$BASELINE_FILE")
  echo "Bruker baseline: $BASELINE_FILE"
fi

report_dir="$(mktemp -d)"
trap 'rm -rf "$report_dir"' EXIT

blocked=0
found_any=0

for skill in "$SKILLS_DIR"/*/; do
  [ -d "$skill" ] || continue
  found_any=1
  name="$(basename "$skill")"
  report="$report_dir/$name.json"

  # Skanneren avslutter med 1 når funnene er alvorlige nok til å blokkere. Det
  # er ikke en feil her, så exit-koden fanges og avgjørelsen tas på rapporten.
  set +e
  skillspector scan "$skill" "${scan_args[@]}" --output "$report" >/dev/null
  scan_status=$?
  set -e

  if [ ! -s "$report" ]; then
    echo "FEIL      $name — skanningen produserte ingen rapport (exit $scan_status)"
    blocked=1
    continue
  fi

  verdict="$(
    python3 - "$report" <<'PY'
import json
import sys

with open(sys.argv[1], encoding="utf-8") as handle:
    report = json.load(handle)

risk = report.get("risk_assessment", {})
issues = report.get("issues", [])
print(
    "{}\t{}\t{}\t{}".format(
        risk.get("recommendation", "UKJENT"),
        risk.get("score", "?"),
        risk.get("severity", "?"),
        len(issues),
    )
)
PY
  )"

  IFS=$'\t' read -r recommendation score severity issue_count <<<"$verdict"

  case "$recommendation" in
    SAFE)
      printf 'SAFE      %-28s %s/100 (%s)\n' "$name" "$score" "$severity"
      ;;
    CAUTION)
      printf 'CAUTION   %-28s %s/100 (%s), %s funn\n' "$name" "$score" "$severity" "$issue_count"
      skillspector scan "$skill" --no-llm >&2 || true
      ;;
    *)
      printf 'BLOKKERT  %-28s %s/100 (%s), %s funn\n' "$name" "$score" "$severity" "$issue_count"
      skillspector scan "$skill" --no-llm >&2 || true
      blocked=1
      ;;
  esac
done

if [ "$found_any" -eq 0 ]; then
  # Tom mappe er nesten alltid feil sti, ikke fravær av skills. Å melde grønt
  # her ville gjort gaten stille ubrukelig.
  echo "Fant ingen skills i $SKILLS_DIR." >&2
  exit 2
fi

exit "$blocked"
