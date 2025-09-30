Set-Location "$PSScriptRoot\..\apps\web"
corepack enable
corepack prepare pnpm@9 --activate
pnpm install
pnpm run dev
