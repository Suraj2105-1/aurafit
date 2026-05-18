$file = "src\App.tsx"
$content = Get-Content $file -Raw

# Replace large rounded corners with sharp game-UI corners
$content = $content -replace 'rounded-\[2\.3rem\]', 'rounded'
$content = $content -replace 'rounded-\[2\.5rem\]', 'rounded'
$content = $content -replace 'rounded-3xl', 'rounded'
$content = $content -replace 'rounded-2xl', 'rounded'
$content = $content -replace 'rounded-xl', 'rounded'
$content = $content -replace 'rounded-t-3xl', 'rounded-t'
$content = $content -replace 'rounded-t-xl', 'rounded-t'
$content = $content -replace 'rounded-b-xl', 'rounded-b'
$content = $content -replace 'rounded-l-xl', 'rounded-l'

# Keep rounded-full only for avatars/badges - replace rest
# Replace rounded-full on buttons/containers but keep on circles
$content = $content -replace 'rounded-full(?=\s)', 'rounded'
$content = $content -replace 'rounded-full(?=")', 'rounded'

# Fix nav which needs to stay pill
$content = $content -replace 'glass-nav p-2 flex items-center justify-around z-50 shadow-2xl rounded', 'glass-nav p-2 flex items-center justify-around z-50 shadow-2xl'

Set-Content $file $content -NoNewline -Encoding UTF8
Write-Host "Done - corners sharpened for Solo Leveling aesthetic"
