# Build and Deploy Script for Phonebook Application
# This script builds the frontend and copies it to the backend for deployment

Write-Host "Building frontend..." -ForegroundColor Green
cd puhelinluettelo_front
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed!" -ForegroundColor Red
    exit 1
}

Write-Host "Copying built files to backend..." -ForegroundColor Green
cd ..
Remove-Item -Path "puhelinluettelo/dist/*" -Recurse -Force -ErrorAction SilentlyContinue
xcopy "puhelinluettelo_front\dist" "puhelinluettelo\dist" /E /I /Y

Write-Host "Build and copy completed successfully!" -ForegroundColor Green
Write-Host "Now you can commit and push to deploy:" -ForegroundColor Yellow
Write-Host "  git add ." -ForegroundColor Cyan
Write-Host "  git commit -m 'Your commit message'" -ForegroundColor Cyan
Write-Host "  git push" -ForegroundColor Cyan 