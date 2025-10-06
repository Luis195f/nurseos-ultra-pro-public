param([string]$Root=".")
$checks = @(
  "Flags: apps/web/src/config/flags.ts",
  "Bundles: apps/web/src/fhir/builders.ts",
  "BCMA: apps/web/src/pages/BCMAPro.tsx",
  "EConsent: apps/web/src/pages/EConsent.tsx",
  "PWA SW: apps/web/public/sw.js",
  "Priority: apps/web/src/handover/priority.ts",
  "OPA rego: opa/policies/fhir.rego",
  "Compose: docker-compose.yml",
  "CI: .github/workflows/ci.yml"
)
$md = @("# NurseOS MVP Audit","")
foreach($c in $checks){ $ok = Test-Path $c; $icon = $ok ? "✅" : "❌"; $md += "- $icon $c" }
$md -join "`n" | Set-Content -Encoding UTF8 "audit_report.md"
Write-Host "Generado audit_report.md"
