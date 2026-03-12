# Test n8n webhook avec format Programme de travail
$message = @"
[Command] = Programme de travail
[Processus] = inventaire de caisse
"@

$body = @{
    question = $message
} | ConvertTo-Json

Write-Host "Testing n8n webhook with Programme de travail format..." -ForegroundColor Yellow
Write-Host "URL: http://localhost:5678/webhook/template" -ForegroundColor Cyan
Write-Host "Message:" -ForegroundColor Cyan
Write-Host $message -ForegroundColor White
Write-Host "`nBody JSON:" -ForegroundColor Cyan
Write-Host $body -ForegroundColor White

try {
    $response = Invoke-WebRequest -Uri "http://localhost:5678/webhook/template" `
        -Method POST `
        -ContentType "application/json" `
        -Body $body `
        -UseBasicParsing `
        -TimeoutSec 600

    Write-Host "`n✅ Success!" -ForegroundColor Green
    Write-Host "Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Content Length: $($response.Content.Length) bytes" -ForegroundColor Green
    Write-Host "`nResponse:" -ForegroundColor Green
    
    # Pretty print JSON if possible
    try {
        $jsonResponse = $response.Content | ConvertFrom-Json
        Write-Host ($jsonResponse | ConvertTo-Json -Depth 10)
    } catch {
        Write-Host $response.Content
    }
} catch {
    Write-Host "`n❌ Error!" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response Body: $responseBody" -ForegroundColor Red
    }
}
