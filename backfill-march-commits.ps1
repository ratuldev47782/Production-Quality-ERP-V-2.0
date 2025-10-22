# ===== EDIT EI 3 TA LINE SHUDHU =====
$year  = 2025
$month = 10              # 6 = June, 3 = March, etc.
$days  = @(22, 23)     # jekono din gulo array e likho
# =====================================

foreach ($day in $days) {
    $commitsToday = Get-Random -Minimum 1 -Maximum 3

    for ($i = 1; $i -le $commitsToday; $i++) {
        $hour = Get-Random -Minimum 9 -Maximum 22
        $minute = Get-Random -Minimum 0 -Maximum 59
        $second = Get-Random -Minimum 0 -Maximum 59

        $dateStr = "{0}-{1:D2}-{2:D2}T{3:D2}:{4:D2}:{5:D2}" -f $year, $month, $day, $hour, $minute, $second

        Add-Content -Path "README.md" -Value "`n<!-- update $dateStr -->"
        git add .

        $env:GIT_AUTHOR_DATE = $dateStr
        $env:GIT_COMMITTER_DATE = $dateStr
        git commit -m "Update" | Out-Null
    }
    Write-Host "$year-$month-$day - $commitsToday commits done"
}

Remove-Item Env:\GIT_AUTHOR_DATE
Remove-Item Env:\GIT_COMMITTER_DATE

git push