## Getting Started
----
First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app.js`. The page auto-updates as you edit the file.

# Production & Quality Management System (RMG)

A full-stack **Production & Quality Management** web app for garments factories, built with **Next.js (App Router)** and **MongoDB/Mongoose**.  

It helps track **line-wise production**, **hourly targets vs achievements**, **efficiency**, **style-wise WIP**, and **quality defects** in real time.

---

## ⚙️ Tech Stack

- **Frontend:** Next.js (App Router), React, Tailwind CSS / DaisyUI
- **Backend:** Next.js API Routes (REST style)
- **Database:** MongoDB with Mongoose
- **Auth:** Custom hook (`useAuth` / `useProductionAuth`) with role & building based access
- **Deployment:** (Optional – Vercel / Node server – update this as you use)

---

## 🧵 Domain Overview (Garments Context)

The app is designed for **ready-made garments (RMG) factories**, with:

- Multiple **buildings** (e.g. `B-4`)
- Multiple **lines** per building (e.g. `Line-1` … `Line-15`)
- **Styles** with SMV, buyers, color, size, etc.
- **Supervisors / Production users** posting hourly output
- **Quality users** recording defects & inspection results

---

## ✨ Key Features

### 1. Target Setter (Header)
- Create **Target Headers** per:
  - Building  
  - Line  
  - Date  
  - Buyer / Style / Color  
  - Run day, SMV, manpower, plan efficiency, working hours
- Auto-calculate:
  - **Day Target**
  - **Base Target per Hour** based on:
    ```text
    Base Target / hr = (Manpower Present × 60 × Plan Efficiency% ÷ SMV)
    or
    Base Target / hr = Day Target ÷ Working Hour
    ```

### 2. Hourly Production Board
- Line-wise **daily working board**:
  - Filter by **building, line, date**
  - Show one card per **Target Header** (e.g. 2h + 6h segments for different styles)
- Per hour:
  - Input **achieved quantity (this hour)**
  - See **dynamic target this hour** (base + carried shortfall)
  - See:
    - Hourly efficiency %
    - Avg efficiency preview
    - Δ variation vs dynamic target
    - Net variation vs base target (to date)
- Posted records table:
  - Hour, dynamic target, achieved, Δ variance, net variance, efficiencies
  - **Summary row** with:
    - Total achieved
    - Final net variance vs base
    - Overall AVG efficiency %

### 3. Style Capacity & WIP Tracking
- **Style Capacity**:
  - Save/update capacity per building + line + buyer + style (+ date)
- **WIP Calculation**:
  - See total produced (all days for a style)
  - Live **WIP**:
    ```text
    WIP = Input Qty (from cutting/previous process) - Total Achieved Qty
    ```
  - WIP & Produced update **immediately** after:
    - Posting new hourly production
    - Updating capacity

### 4. Quality / Defect Management (optional module)
- Defect picker:
  - Searchable dropdown (e.g. "301 - OPEN SEAM", "302 - SKIP STITCH", ...)
  - Hour-wise and line-wise defect logging
- Future scope:
  - Defect summary per style/line/day
  - DHU% / PPM dashboards

### 5. Role & Access Control
- Users assigned to:
  - `assigned_building`
  - Role (e.g. `Supervisor`, `Quality`, `Admin`)
- Screens and data filtered using custom hooks:
  - `useAuth`
  - `useProductionAuth`
- Production users can only see/manage their assigned building/lines.

---

## 🧱 Project Structure

> This is a simplified structure. Adjust if your repo differs.

```bash

└── 📁my-app
    └── 📁app
        └── 📁actions
            ├── index.js
        └── 📁api
            └── 📁floor-compare
                ├── route.js
            └── 📁floor-dashboard
                ├── route.js
            └── 📁floor-summary
                ├── route.js
            └── 📁hourly-inspections
                ├── route.js
            └── 📁hourly-productions
                └── 📁[id]
                    ├── route.js
                ├── route.js
            └── 📁line-info-register
                ├── route.js
            └── 📁seed-demo
                ├── route.js
            └── 📁style-capacities
                └── 📁[id]
                    ├── route.js
                ├── route.js
            └── 📁style-media
                ├── route.js
            └── 📁style-wip
                ├── route.js
            └── 📁target-setter-header
                └── 📁[id]
                    ├── route.js
                ├── route.js
        └── 📁AuthComponents
            ├── LoginForm.jsx
            ├── RegistrationForm.jsx
            ├── SignInOut.jsx
        └── 📁contexts
            ├── index.js
        └── 📁floor-compare
            ├── page.js
        └── 📁floor-dashboard
            └── 📁full
                ├── page.js
            ├── page.js
        └── 📁floor-summary
            ├── page.js
        └── 📁FloorDashBoardComponents
            ├── FloorDashBoardFullView.jsx
            ├── floorDashboardShared.js
            ├── FloorDashBoardTvView.jsx
        └── 📁HomePageComponents
            ├── HomePage.jsx
        └── 📁hooks
            ├── useAuth.js
        └── 📁line-info-register
            ├── page.js
        └── 📁LineInfoRegisterComponents
            ├── ImageVideoLink.jsx
            ├── LineInfo.jsx
        └── 📁login
            ├── page.js
        └── 📁ProductionComponents
            ├── LineDailyWorkingBoard.jsx
            ├── ProductionInputForm.jsx
        └── 📁ProductionInput
            ├── page.js
        └── 📁providers
            ├── AuthProvider.js
        └── 📁QualityComponents
            ├── DefectEntyForm.jsx
            ├── QualityTable.jsx
        └── 📁QualityInput
            ├── page.js
        └── 📁QualitySummaryTable
            ├── page.js
        └── 📁register
            ├── page.js
        └── 📁SideNavBarComponent
            ├── SideNavbar.jsx
        └── 📁style-media-register
            ├── page.js
        └── 📁user-manual
            ├── page.js
        ├── favicon.ico
        ├── globals.css
        ├── layout.js
        ├── page.js
    └── 📁db
        ├── queries.js
    └── 📁floor-dashboard-Test
        ├── page.js
    └── 📁lib
        ├── generateDummyData.js
    └── 📁media-links
        ├── route.js
    └── 📁models
        ├── hourly-inspections.js
        ├── HourlyProduction-model.js
        ├── line-info-register-model.js
        ├── style-media-model.js
        ├── StyleCapacity-model.js
        ├── TargetSetterHeader.js
        ├── user-model.js
    └── 📁public
        ├── Charts-bro.svg
        ├── Computer login-amico.svg
        ├── Development focus-bro.svg
        ├── HKD_LOGO.png
        ├── Performance overview-bro.svg
        ├── Progress overview-bro.svg
        ├── Sign up-rafiki.svg
        ├── undraw_business-plan_wv9q.svg
        ├── undraw_factory_4d61.svg
        ├── undraw_financial-data_lbci.svg
        ├── undraw_investing_uzcu.svg
        ├── undraw_presentation_4ik4.svg
        ├── vercel.svg
    └── 📁services
        ├── mongo.js
    └── 📁utils
        ├── data-util.js
    ├── .env
    ├── .gitignore
    ├── DefectsEntryForm.jsx
    ├── eslint.config.mjs
    ├── floor-dashboardPrevious.jsx
    ├── floor-summaryBestLineTest.jsx
    ├── floorSummay-route.js
    ├── jsconfig.json
    ├── next.config.mjs
    ├── package-lock.json
    ├── package.json
    ├── postcss.config.mjs
    ├── README.md
    ├── tailwind.config.js
    └── targetSetterPage.jsx


## 🧱 Last Updated

>  Last Updared -- 16 June 2026

<!-- update 2025-10-22T21:24:50 -->

<!-- update 2025-10-22T15:43:15 -->

<!-- update 2025-10-23T19:15:00 -->

<!-- update 2026-07-24T21:42:35 -->

<!-- update 2026-07-25T13:32:19 -->

<!-- update 2026-07-25T18:02:40 -->

<!-- update 2026-07-26T12:08:52 -->

<!-- update 2026-07-24T12:56:35 -->

<!-- update 2026-07-24T19:50:07 -->

<!-- update 2026-07-25T10:40:33 -->

<!-- update 2026-07-26T13:39:37 -->

<!-- update 2026-07-24T10:56:51 -->

<!-- update 2026-07-24T20:27:41 -->

<!-- update 2026-07-24T12:20:42 -->

<!-- update 2026-07-24T12:14:27 -->

<!-- update 2026-07-24T11:24:43 -->

<!-- update 2026-07-24T09:28:04 -->

<!-- update 2026-07-24T19:14:03 -->

<!-- update 2026-07-24T16:27:23 -->

<!-- update 2026-07-24T10:53:27 -->

<!-- update 2026-07-24T09:06:55 -->

<!-- update 2026-07-24T21:31:09 -->

<!-- update 2026-07-24T09:22:20 -->

<!-- update 2026-07-24T13:18:07 -->

<!-- update 2026-07-24T13:25:50 -->

<!-- update 2026-07-25T20:36:07 -->

<!-- update 2026-07-25T09:35:46 -->

<!-- update 2026-07-25T19:14:46 -->

<!-- update 2026-07-25T09:29:09 -->

<!-- update 2026-07-25T11:13:16 -->

<!-- update 2026-07-25T10:16:39 -->

<!-- update 2026-07-25T12:31:30 -->

<!-- update 2026-07-25T21:07:29 -->

<!-- update 2026-07-25T21:54:54 -->

<!-- update 2026-07-25T09:56:22 -->

<!-- update 2026-07-25T09:14:55 -->

<!-- update 2026-07-25T13:34:55 -->

<!-- update 2026-07-25T21:57:36 -->

<!-- update 2026-07-25T21:50:06 -->

<!-- update 2026-07-25T19:56:28 -->

<!-- update 2026-07-25T12:40:22 -->

<!-- update 2026-07-26T17:01:35 -->

<!-- update 2026-07-26T14:40:01 -->

<!-- update 2026-07-26T19:47:47 -->

<!-- update 2026-07-26T16:18:50 -->

<!-- update 2026-07-26T15:40:29 -->

<!-- update 2026-07-26T12:55:06 -->

<!-- update 2026-01-01T13:58:43 -->

<!-- update 2026-01-01T17:22:15 -->

<!-- update 2026-01-01T14:32:47 -->

<!-- update 2026-01-01T11:09:12 -->

<!-- update 2026-01-01T15:37:39 -->

<!-- update 2026-01-01T09:36:33 -->

<!-- update 2026-01-01T17:44:32 -->

<!-- update 2026-01-03T15:30:39 -->

<!-- update 2026-01-03T19:45:08 -->

<!-- update 2026-01-03T19:26:01 -->

<!-- update 2026-01-03T13:34:15 -->

<!-- update 2026-01-07T20:02:10 -->

<!-- update 2026-01-08T18:00:45 -->

<!-- update 2026-01-08T12:09:55 -->

<!-- update 2026-01-08T21:04:46 -->

<!-- update 2026-01-08T12:15:07 -->

<!-- update 2026-01-08T09:31:19 -->

<!-- update 2026-01-08T18:40:38 -->

<!-- update 2026-01-08T17:02:49 -->

<!-- update 2026-01-10T21:41:47 -->

<!-- update 2026-01-10T18:00:13 -->

<!-- update 2026-01-10T11:34:36 -->

<!-- update 2026-01-10T17:34:00 -->

<!-- update 2026-01-10T12:11:56 -->

<!-- update 2026-01-12T19:41:46 -->

<!-- update 2026-01-12T13:07:05 -->

<!-- update 2026-01-12T15:23:18 -->

<!-- update 2026-01-12T12:36:44 -->

<!-- update 2026-01-12T10:11:47 -->

<!-- update 2026-01-12T19:27:19 -->

<!-- update 2026-01-12T10:35:49 -->

<!-- update 2026-01-12T13:06:45 -->

<!-- update 2026-01-12T13:00:22 -->

<!-- update 2026-01-13T18:25:23 -->

<!-- update 2026-01-13T18:08:41 -->

<!-- update 2026-01-13T11:13:01 -->

<!-- update 2026-01-13T21:10:50 -->

<!-- update 2026-01-13T10:33:00 -->

<!-- update 2026-01-15T12:06:48 -->

<!-- update 2026-01-15T13:01:20 -->

<!-- update 2026-01-15T19:39:56 -->

<!-- update 2026-01-15T09:37:35 -->

<!-- update 2026-01-15T09:26:21 -->

<!-- update 2026-01-15T10:41:16 -->

<!-- update 2026-01-15T16:04:21 -->

<!-- update 2026-01-17T18:16:21 -->

<!-- update 2026-01-17T19:19:21 -->

<!-- update 2026-01-18T10:46:49 -->

<!-- update 2026-01-18T12:20:37 -->

<!-- update 2026-01-18T17:39:15 -->

<!-- update 2026-01-20T10:03:25 -->

<!-- update 2026-01-20T17:33:44 -->

<!-- update 2026-01-20T10:38:06 -->

<!-- update 2026-01-20T15:27:23 -->

<!-- update 2026-01-20T19:24:34 -->

<!-- update 2026-01-20T17:55:06 -->

<!-- update 2026-01-20T20:26:19 -->

<!-- update 2026-01-20T21:01:42 -->

<!-- update 2026-01-20T18:44:38 -->

<!-- update 2026-01-20T14:50:37 -->

<!-- update 2026-01-21T21:36:35 -->

<!-- update 2026-01-21T14:15:40 -->

<!-- update 2026-01-21T19:00:43 -->

<!-- update 2026-01-21T12:16:01 -->

<!-- update 2026-01-21T10:20:23 -->

<!-- update 2026-01-21T19:04:08 -->

<!-- update 2026-01-21T19:53:17 -->

<!-- update 2026-01-21T15:38:34 -->

<!-- update 2026-01-21T09:27:11 -->

<!-- update 2026-01-21T10:23:46 -->

<!-- update 2026-01-21T10:20:30 -->

<!-- update 2026-01-24T11:07:27 -->

<!-- update 2026-01-24T18:24:52 -->

<!-- update 2026-01-24T12:09:10 -->

<!-- update 2026-01-24T11:35:58 -->

<!-- update 2026-01-24T19:50:43 -->

<!-- update 2026-01-24T16:35:21 -->

<!-- update 2026-01-24T19:45:57 -->

<!-- update 2026-01-24T14:13:53 -->

<!-- update 2026-01-24T09:12:42 -->

<!-- update 2026-01-24T11:20:09 -->

<!-- update 2026-01-24T16:46:08 -->

<!-- update 2026-01-25T21:53:33 -->

<!-- update 2026-01-25T14:26:03 -->

<!-- update 2026-01-25T18:06:42 -->

<!-- update 2026-01-25T13:52:07 -->

<!-- update 2026-01-25T11:21:55 -->

<!-- update 2026-01-28T18:11:35 -->

<!-- update 2026-01-28T17:16:35 -->

<!-- update 2026-01-28T19:19:19 -->

<!-- update 2026-01-28T16:51:20 -->

<!-- update 2026-01-28T20:42:21 -->

<!-- update 2026-02-02T10:56:24 -->

<!-- update 2026-02-02T11:21:14 -->
