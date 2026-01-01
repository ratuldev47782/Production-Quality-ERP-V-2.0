# ===== CONFIG =====
$startYear = 2026
$endYear   = 2026
$skipDayChance = 30   # % chance ekta din completely skip hoye jabe (kono commit hobe na)
# ===================

for ($year = $startYear; $year -le $endYear; $year++) {
    for ($month = 1; $month -le 12; $month++) {
        $daysInMonth = [DateTime]::DaysInMonth($year, $month)

        for ($day = 1; $day -le $daysInMonth; $day++) {

            $currentDate = Get-Date -Year $year -Month $month -Day $day
            if ($currentDate -gt (Get-Date)) { continue }  # future date skip

            # Friday skip
            if ($currentDate.DayOfWeek -eq "Friday") { continue }

            # random overall day skip (majhe majhe gap thakbe)
            if ((Get-Random -Minimum 1 -Maximum 100) -le $skipDayChance) { continue }

            $commitsToday = Get-Random -Minimum 0 -Maximum 12  # 0 mane sheidin kichu na thakleo hobe

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

Remove-Item Env:\GIT_AUTHOR_DATE -ErrorAction SilentlyContinue
Remove-Item Env:\GIT_COMMITTER_DATE -ErrorAction SilentlyContinue

git push