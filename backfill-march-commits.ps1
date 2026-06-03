# ===== CONFIG =====
$startYear = 2025
$endYear   = 2026
$skipDayChance = 30
# ===================

for ($year = $startYear; $year -le $endYear; $year++) {
    for ($month = 1; $month -le 12; $month++) {
        $daysInMonth = [DateTime]::DaysInMonth($year, $month)

        for ($day = 1; $day -le $daysInMonth; $day++) {

            $currentDate = Get-Date -Year $year -Month $month -Day $day
            if ($currentDate -gt (Get-Date)) { continue }

            if ($currentDate.DayOfWeek -eq "Friday") { continue }

            if ((Get-Random -Minimum 1 -Maximum 100) -le $skipDayChance) { continue }

            $commitsToday = Get-Random -Minimum 0 -Maximum 12

            for ($i = 1; $i -le $commitsToday; $i++) {
                $hour   = Get-Random -Minimum 9  -Maximum 22
                $minute = Get-Random -Minimum 0  -Maximum 59
                $second = Get-Random -Minimum 0  -Maximum 59

                $dateStr = "{0}-{1:D2}-{2:D2}T{3:D2}:{4:D2}:{5:D2}" -f $year, $month, $day, $hour, $minute, $second

                Add-Content -Path "README.md" -Value "`n<!-- update $dateStr -->"
                git add .

                $env:GIT_AUTHOR_DATE = $dateStr
                $env:GIT_COMMITTER_DATE = $dateStr
                git commit -m "Update" | Out-Null
            }

            if ($commitsToday -gt 0) {
                Write-Host "$year-$month-$day - $commitsToday commits done"
            }
        }
    }
}

Remove-Item Env:\GIT_AUTHOR_DATE -ErrorAction