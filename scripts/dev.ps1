# Arranca backend y frontend en dos ventanas
Start-Process powershell -ArgumentList @(
  "-NoExit",
  "-Command",
  "Set-Location `"$PSScriptRoot\..\services\agents-service`"; Remove-Item Env:OPA_URL -ErrorAction SilentlyContinue; uvicorn app.main:app --host 0.0.0.0 --port 8070 --reload"
)
Start-Process powershell -ArgumentList @(
  "-NoExit",
  "-Command",
  "Set-Location `"$PSScriptRoot\..\apps\web`"; corepack enable; corepack prepare pnpm@9 --activate; pnpm install; pnpm run dev"
)
