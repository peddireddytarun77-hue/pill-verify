# Deploy script for peddireddytarun77-hue/pill-verify
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "🚀 PharmaVerify GitHub Deployment Assistant" -ForegroundColor Green
Write-Host "Account: peddireddytarun77-hue" -ForegroundColor Yellow
Write-Host "Repository: pill-verify" -ForegroundColor Yellow
Write-Host "========================================================" -ForegroundColor Cyan

# Ensure branch is main
git branch -M main

# Ensure remote origin is set
$remote = git remote get-url origin 2>$null
if (-not $remote) {
    git remote add origin https://github.com/peddireddytarun77-hue/pill-verify.git
} else {
    git remote set-url origin https://github.com/peddireddytarun77-hue/pill-verify.git
}

Write-Host "Testing GitHub repository connection..." -ForegroundColor Cyan
$testResult = git ls-remote origin 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "⚠️  The repository 'pill-verify' does not exist on your GitHub account yet!" -ForegroundColor Red
    Write-Host "👉 Follow these 2 simple steps:" -ForegroundColor Yellow
    Write-Host "   1. Open: https://github.com/new in your browser" -ForegroundColor White
    Write-Host "   2. Enter Repository name: pill-verify" -ForegroundColor White
    Write-Host "   3. Set to PUBLIC" -ForegroundColor White
    Write-Host "   4. Do NOT check 'Add a README' (keep it empty)" -ForegroundColor White
    Write-Host "   5. Click 'Create repository'" -ForegroundColor Green
    Write-Host ""
    
    $confirm = Read-Host "Once you have created the repository on GitHub, press [Enter] to push, or 'q' to quit"
    if ($confirm -eq 'q') {
        exit
    }
}

Write-Host "Pushing code to https://github.com/peddireddytarun77-hue/pill-verify.git (branch: main)..." -ForegroundColor Cyan
git add .
git commit -m "feat: compact 5mm micro-QR and primary key routing for 3 pills" 2>$null
git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ PUSH SUCCESSFUL!" -ForegroundColor Green
    Write-Host "To enable GitHub Pages:" -ForegroundColor Cyan
    Write-Host "1. Go to: https://github.com/peddireddytarun77-hue/pill-verify/settings/pages" -ForegroundColor White
    Write-Host "2. Under 'Build and deployment' -> 'Branch', select 'main' and root '/'" -ForegroundColor White
    Write-Host "3. Click Save." -ForegroundColor Green
    Write-Host ""
    Write-Host "🌐 Your Public URLs will be:" -ForegroundColor Yellow
    Write-Host "👉 Web 1 (Admin Studio): https://peddireddytarun77-hue.github.io/pill-verify/" -ForegroundColor White
    Write-Host "👉 Web 2 (Consumer Pill 1): https://peddireddytarun77-hue.github.io/pill-verify/verify.html?id=1" -ForegroundColor White
    Write-Host "👉 Web 2 (Consumer Pill 2): https://peddireddytarun77-hue.github.io/pill-verify/verify.html?id=2" -ForegroundColor White
    Write-Host "👉 Web 2 (Consumer Pill 3): https://peddireddytarun77-hue.github.io/pill-verify/verify.html?id=3" -ForegroundColor White
} else {
    Write-Host "❌ Push encountered an error. If prompted for credentials, use a GitHub Personal Access Token (PAT) with 'repo' scope." -ForegroundColor Red
}
