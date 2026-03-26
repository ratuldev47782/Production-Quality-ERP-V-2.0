$year = 2026
$days = @(26, 27, 28)

foreach ($day in $days) {
    $commitsToday = Get-Random -Minimum 10 -Maximum 15

    for ($i = 1; $i -le $commitsToday; $i++) {
        $hour = Get-Random -Minimum 9 -Maximum 22
        $minute = Get-Random -Minimum 0 -Maximum 59
        $second = Get-Random -Minimum 0 -Maximum 59

        $dateStr = "{0}-03-{1:D2}T{2:D2}:{3:D2}:{4:D2}" -f $year, $day, $hour, $minute, $second

        Add-Content -Path "README.md" -Value "`n<!-- update $dateStr -->"
        git add .

        $env:GIT_AUTHOR_DATE = $dateStr
        $env:GIT_COMMITTER_DATE = $dateStr
        git commit -m "Update" | Out-Null
    }
    Write-Host "March $day, $year - $commitsToday commits done"
}

Remove-Item Env:\GIT_AUTHOR_DATE
Remove-Item Env:\GIT_COMMITTER_DATE

git push