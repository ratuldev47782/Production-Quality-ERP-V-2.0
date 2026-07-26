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

<!-- update 2026-02-02T17:06:30 -->

<!-- update 2026-02-02T19:03:34 -->

<!-- update 2026-02-02T13:10:10 -->

<!-- update 2026-02-02T16:07:34 -->

<!-- update 2026-02-02T09:21:33 -->

<!-- update 2026-02-02T11:04:04 -->

<!-- update 2026-02-02T18:24:50 -->

<!-- update 2026-02-02T11:15:11 -->

<!-- update 2026-02-03T16:10:08 -->

<!-- update 2026-02-03T15:17:50 -->

<!-- update 2026-02-03T19:20:09 -->

<!-- update 2026-02-05T17:22:54 -->

<!-- update 2026-02-05T13:53:29 -->

<!-- update 2026-02-07T10:42:30 -->

<!-- update 2026-02-07T19:57:52 -->

<!-- update 2026-02-07T09:45:55 -->

<!-- update 2026-02-07T14:22:16 -->

<!-- update 2026-02-07T21:02:08 -->

<!-- update 2026-02-07T14:20:14 -->

<!-- update 2026-02-07T16:21:15 -->

<!-- update 2026-02-07T11:22:35 -->

<!-- update 2026-02-10T15:53:44 -->

<!-- update 2026-02-10T15:24:00 -->

<!-- update 2026-02-10T09:20:29 -->

<!-- update 2026-02-10T12:54:44 -->

<!-- update 2026-02-10T13:24:27 -->

<!-- update 2026-02-10T11:17:07 -->

<!-- update 2026-02-10T13:47:42 -->

<!-- update 2026-02-10T11:46:27 -->

<!-- update 2026-02-14T20:13:00 -->

<!-- update 2026-02-14T15:35:55 -->

<!-- update 2026-02-14T17:03:52 -->

<!-- update 2026-02-14T15:19:38 -->

<!-- update 2026-02-14T16:30:14 -->

<!-- update 2026-02-14T13:03:34 -->

<!-- update 2026-02-14T21:07:34 -->

<!-- update 2026-02-17T19:16:49 -->

<!-- update 2026-02-17T11:05:27 -->

<!-- update 2026-02-17T10:58:39 -->

<!-- update 2026-02-17T19:13:58 -->

<!-- update 2026-02-17T18:30:27 -->

<!-- update 2026-02-17T19:52:06 -->

<!-- update 2026-02-17T12:58:48 -->

<!-- update 2026-02-18T21:46:51 -->

<!-- update 2026-02-18T19:03:36 -->

<!-- update 2026-02-18T09:07:16 -->

<!-- update 2026-02-18T13:57:30 -->

<!-- update 2026-02-18T12:29:09 -->

<!-- update 2026-02-18T15:25:04 -->

<!-- update 2026-02-18T11:29:49 -->

<!-- update 2026-02-18T12:56:15 -->

<!-- update 2026-02-18T11:27:36 -->

<!-- update 2026-02-18T12:27:52 -->

<!-- update 2026-02-18T10:37:55 -->

<!-- update 2026-02-22T09:36:14 -->

<!-- update 2026-02-22T16:35:13 -->

<!-- update 2026-02-22T14:11:31 -->

<!-- update 2026-02-22T17:16:58 -->

<!-- update 2026-02-22T18:29:42 -->

<!-- update 2026-02-22T20:37:27 -->

<!-- update 2026-02-23T14:37:09 -->

<!-- update 2026-02-23T20:48:49 -->

<!-- update 2026-02-23T09:24:24 -->

<!-- update 2026-02-23T15:04:14 -->

<!-- update 2026-02-23T17:44:25 -->

<!-- update 2026-02-23T21:49:02 -->

<!-- update 2026-02-23T16:02:41 -->

<!-- update 2026-02-23T13:09:12 -->

<!-- update 2026-02-25T19:12:52 -->

<!-- update 2026-02-25T19:43:04 -->

<!-- update 2026-02-25T09:46:24 -->

<!-- update 2026-02-25T20:11:23 -->

<!-- update 2026-02-25T16:15:09 -->

<!-- update 2026-02-25T14:00:16 -->

<!-- update 2026-02-25T09:43:05 -->

<!-- update 2026-02-25T18:41:21 -->

<!-- update 2026-02-25T18:40:58 -->

<!-- update 2026-02-25T20:14:25 -->

<!-- update 2026-02-28T16:29:06 -->

<!-- update 2026-02-28T09:45:11 -->

<!-- update 2026-02-28T17:15:34 -->

<!-- update 2026-02-28T13:27:32 -->

<!-- update 2026-02-28T16:35:46 -->

<!-- update 2026-02-28T14:03:46 -->

<!-- update 2026-02-28T11:12:48 -->

<!-- update 2026-02-28T19:09:39 -->

<!-- update 2026-02-28T16:27:27 -->

<!-- update 2026-03-02T09:16:51 -->

<!-- update 2026-03-02T18:04:35 -->

<!-- update 2026-03-05T17:41:29 -->

<!-- update 2026-03-05T10:10:46 -->

<!-- update 2026-03-05T09:44:19 -->

<!-- update 2026-03-05T18:16:36 -->

<!-- update 2026-03-05T18:15:01 -->

<!-- update 2026-03-05T18:04:11 -->

<!-- update 2026-03-05T14:47:55 -->

<!-- update 2026-03-05T09:36:30 -->

<!-- update 2026-03-08T16:54:22 -->

<!-- update 2026-03-08T11:01:28 -->

<!-- update 2026-03-08T16:45:15 -->

<!-- update 2026-03-08T10:18:30 -->

<!-- update 2026-03-08T11:49:12 -->

<!-- update 2026-03-08T18:45:13 -->

<!-- update 2026-03-08T21:19:32 -->

<!-- update 2026-03-08T19:35:51 -->

<!-- update 2026-03-08T13:24:21 -->

<!-- update 2026-03-08T11:47:36 -->

<!-- update 2026-03-08T17:15:15 -->

<!-- update 2026-03-09T18:18:23 -->

<!-- update 2026-03-09T14:00:21 -->

<!-- update 2026-03-09T19:37:16 -->

<!-- update 2026-03-09T20:30:07 -->

<!-- update 2026-03-09T14:22:47 -->

<!-- update 2026-03-09T13:33:26 -->

<!-- update 2026-03-09T20:10:08 -->

<!-- update 2026-03-09T14:24:27 -->

<!-- update 2026-03-09T16:44:51 -->

<!-- update 2026-03-09T16:48:16 -->

<!-- update 2026-03-09T11:51:43 -->

<!-- update 2026-03-12T11:23:41 -->

<!-- update 2026-03-12T21:39:49 -->

<!-- update 2026-03-14T20:08:38 -->

<!-- update 2026-03-14T21:39:17 -->

<!-- update 2026-03-14T11:15:10 -->

<!-- update 2026-03-15T11:13:50 -->

<!-- update 2026-03-16T21:00:24 -->

<!-- update 2026-03-16T11:45:46 -->

<!-- update 2026-03-16T17:21:00 -->

<!-- update 2026-03-17T18:53:31 -->

<!-- update 2026-03-17T20:43:38 -->

<!-- update 2026-03-17T12:37:21 -->

<!-- update 2026-03-19T09:36:39 -->

<!-- update 2026-03-19T12:46:06 -->

<!-- update 2026-03-19T15:03:23 -->

<!-- update 2026-03-19T15:11:24 -->

<!-- update 2026-03-19T11:07:41 -->

<!-- update 2026-03-21T19:18:14 -->

<!-- update 2026-03-24T12:12:07 -->

<!-- update 2026-03-24T18:27:41 -->

<!-- update 2026-03-24T21:48:56 -->

<!-- update 2026-03-24T21:12:30 -->

<!-- update 2026-03-24T13:06:07 -->

<!-- update 2026-03-24T16:00:24 -->

<!-- update 2026-03-24T15:33:30 -->

<!-- update 2026-03-24T13:34:18 -->

<!-- update 2026-03-24T13:15:08 -->

<!-- update 2026-03-24T21:56:42 -->

<!-- update 2026-03-25T19:49:20 -->

<!-- update 2026-03-25T09:57:54 -->

<!-- update 2026-03-25T12:50:07 -->

<!-- update 2026-03-25T13:28:53 -->

<!-- update 2026-03-25T17:31:23 -->

<!-- update 2026-03-25T20:35:18 -->

<!-- update 2026-03-26T20:22:17 -->

<!-- update 2026-03-26T18:28:12 -->

<!-- update 2026-03-26T12:42:42 -->

<!-- update 2026-03-26T10:11:04 -->

<!-- update 2026-03-26T20:00:28 -->

<!-- update 2026-03-28T13:19:23 -->

<!-- update 2026-03-28T16:40:56 -->

<!-- update 2026-03-28T17:05:18 -->

<!-- update 2026-03-28T18:48:00 -->

<!-- update 2026-03-28T20:00:19 -->

<!-- update 2026-03-28T17:26:51 -->

<!-- update 2026-03-28T15:05:37 -->

<!-- update 2026-03-28T18:55:35 -->

<!-- update 2026-03-30T11:47:39 -->

<!-- update 2026-03-30T12:20:04 -->

<!-- update 2026-03-30T18:45:12 -->

<!-- update 2026-03-30T18:28:34 -->

<!-- update 2026-03-30T14:02:17 -->

<!-- update 2026-03-30T20:13:46 -->

<!-- update 2026-03-30T19:41:48 -->

<!-- update 2026-03-30T11:20:32 -->

<!-- update 2026-03-30T09:26:42 -->

<!-- update 2026-03-30T18:28:27 -->

<!-- update 2026-03-31T21:08:51 -->

<!-- update 2026-03-31T10:56:22 -->

<!-- update 2026-04-01T15:40:56 -->

<!-- update 2026-04-01T14:21:58 -->

<!-- update 2026-04-01T09:20:14 -->

<!-- update 2026-04-01T16:07:54 -->

<!-- update 2026-04-01T09:45:43 -->

<!-- update 2026-04-04T12:35:52 -->

<!-- update 2026-04-04T19:50:54 -->

<!-- update 2026-04-06T21:06:44 -->

<!-- update 2026-04-06T12:41:08 -->

<!-- update 2026-04-06T19:11:31 -->

<!-- update 2026-04-06T15:06:24 -->

<!-- update 2026-04-07T17:58:13 -->

<!-- update 2026-04-07T12:19:58 -->

<!-- update 2026-04-07T15:21:25 -->

<!-- update 2026-04-07T17:53:00 -->

<!-- update 2026-04-07T12:30:40 -->

<!-- update 2026-04-08T21:10:43 -->

<!-- update 2026-04-08T14:04:24 -->

<!-- update 2026-04-09T10:55:13 -->

<!-- update 2026-04-09T11:16:23 -->

<!-- update 2026-04-12T10:04:06 -->

<!-- update 2026-04-13T18:56:34 -->

<!-- update 2026-04-13T20:05:04 -->

<!-- update 2026-04-13T09:53:57 -->

<!-- update 2026-04-13T21:06:05 -->

<!-- update 2026-04-13T11:29:25 -->

<!-- update 2026-04-13T12:13:48 -->

<!-- update 2026-04-13T19:47:42 -->

<!-- update 2026-04-13T11:12:41 -->

<!-- update 2026-04-13T17:36:25 -->

<!-- update 2026-04-13T18:04:04 -->

<!-- update 2026-04-14T10:33:40 -->

<!-- update 2026-04-14T09:45:00 -->

<!-- update 2026-04-14T12:26:49 -->

<!-- update 2026-04-14T18:09:13 -->

<!-- update 2026-04-14T18:58:12 -->

<!-- update 2026-04-14T20:07:25 -->

<!-- update 2026-04-14T12:54:08 -->

<!-- update 2026-04-14T14:26:29 -->

<!-- update 2026-04-14T17:31:35 -->

<!-- update 2026-04-14T09:07:33 -->

<!-- update 2026-04-14T16:16:09 -->

<!-- update 2026-04-16T11:49:55 -->

<!-- update 2026-04-16T20:05:29 -->

<!-- update 2026-04-16T20:17:26 -->

<!-- update 2026-04-16T18:53:40 -->

<!-- update 2026-04-16T17:45:45 -->

<!-- update 2026-04-16T21:15:04 -->

<!-- update 2026-04-16T17:52:33 -->

<!-- update 2026-04-16T10:26:01 -->

<!-- update 2026-04-16T18:09:15 -->

<!-- update 2026-04-16T18:24:23 -->

<!-- update 2026-04-18T13:10:13 -->

<!-- update 2026-04-18T15:07:46 -->

<!-- update 2026-04-18T17:58:51 -->

<!-- update 2026-04-18T21:52:13 -->

<!-- update 2026-04-18T10:32:55 -->

<!-- update 2026-04-18T19:28:24 -->

<!-- update 2026-04-18T15:15:58 -->

<!-- update 2026-04-18T21:01:13 -->

<!-- update 2026-04-19T12:19:25 -->

<!-- update 2026-04-19T14:28:10 -->

<!-- update 2026-04-19T21:34:56 -->

<!-- update 2026-04-19T16:07:33 -->

<!-- update 2026-04-19T09:23:52 -->

<!-- update 2026-04-19T09:25:46 -->

<!-- update 2026-04-19T17:26:04 -->

<!-- update 2026-04-19T14:09:09 -->

<!-- update 2026-04-19T18:47:43 -->

<!-- update 2026-04-20T19:45:29 -->

<!-- update 2026-04-20T11:49:04 -->

<!-- update 2026-04-20T18:43:21 -->

<!-- update 2026-04-20T10:24:50 -->

<!-- update 2026-04-20T19:24:40 -->

<!-- update 2026-04-20T16:51:44 -->

<!-- update 2026-04-20T13:17:24 -->

<!-- update 2026-04-20T12:28:45 -->

<!-- update 2026-04-21T21:12:36 -->

<!-- update 2026-04-21T20:47:52 -->

<!-- update 2026-04-21T19:35:28 -->

<!-- update 2026-04-21T14:19:30 -->

<!-- update 2026-04-21T20:44:45 -->

<!-- update 2026-04-21T18:21:42 -->

<!-- update 2026-04-21T20:33:47 -->

<!-- update 2026-04-21T19:08:32 -->

<!-- update 2026-04-21T21:54:22 -->

<!-- update 2026-04-21T14:30:23 -->

<!-- update 2026-04-21T19:14:01 -->

<!-- update 2026-04-22T14:28:58 -->

<!-- update 2026-04-22T10:49:53 -->

<!-- update 2026-04-22T09:48:37 -->

<!-- update 2026-04-22T15:52:01 -->

<!-- update 2026-04-25T18:21:02 -->

<!-- update 2026-04-25T11:29:19 -->

<!-- update 2026-04-25T09:40:23 -->

<!-- update 2026-04-27T20:18:08 -->

<!-- update 2026-04-27T18:28:14 -->

<!-- update 2026-04-27T16:46:20 -->

<!-- update 2026-04-27T21:08:15 -->

<!-- update 2026-04-27T14:23:30 -->

<!-- update 2026-04-27T13:17:33 -->

<!-- update 2026-04-28T17:34:05 -->

<!-- update 2026-04-28T09:10:57 -->

<!-- update 2026-04-28T11:09:08 -->

<!-- update 2026-04-28T11:35:07 -->

<!-- update 2026-04-28T11:31:08 -->

<!-- update 2026-04-29T16:33:55 -->

<!-- update 2026-04-29T13:50:53 -->

<!-- update 2026-04-29T11:13:38 -->

<!-- update 2026-04-29T12:50:25 -->

<!-- update 2026-05-02T21:13:18 -->

<!-- update 2026-05-02T17:15:24 -->

<!-- update 2026-05-02T13:28:44 -->

<!-- update 2026-05-02T11:10:29 -->

<!-- update 2026-05-02T21:18:38 -->

<!-- update 2026-05-03T15:22:02 -->

<!-- update 2026-05-05T14:03:08 -->

<!-- update 2026-05-05T15:25:33 -->

<!-- update 2026-05-05T21:26:42 -->

<!-- update 2026-05-05T12:22:17 -->

<!-- update 2026-05-05T21:02:54 -->

<!-- update 2026-05-05T15:50:01 -->

<!-- update 2026-05-05T11:49:57 -->

<!-- update 2026-05-05T09:54:57 -->

<!-- update 2026-05-05T21:14:22 -->

<!-- update 2026-05-05T21:40:47 -->

<!-- update 2026-05-06T13:11:34 -->

<!-- update 2026-05-06T20:09:08 -->

<!-- update 2026-05-06T10:46:51 -->

<!-- update 2026-05-06T13:43:42 -->

<!-- update 2026-05-06T09:46:33 -->

<!-- update 2026-05-06T09:47:03 -->

<!-- update 2026-05-06T09:03:47 -->

<!-- update 2026-05-06T18:04:37 -->

<!-- update 2026-05-06T17:28:52 -->

<!-- update 2026-05-06T09:03:32 -->

<!-- update 2026-05-07T11:54:24 -->

<!-- update 2026-05-07T15:49:45 -->

<!-- update 2026-05-07T14:43:55 -->

<!-- update 2026-05-07T13:42:43 -->

<!-- update 2026-05-07T20:06:33 -->

<!-- update 2026-05-09T10:06:13 -->

<!-- update 2026-05-09T14:54:55 -->

<!-- update 2026-05-09T10:58:56 -->

<!-- update 2026-05-09T20:12:22 -->

<!-- update 2026-05-09T11:45:49 -->

<!-- update 2026-05-10T14:30:49 -->

<!-- update 2026-05-10T21:43:08 -->

<!-- update 2026-05-10T14:12:44 -->

<!-- update 2026-05-10T12:56:07 -->

<!-- update 2026-05-10T14:02:34 -->

<!-- update 2026-05-10T19:17:53 -->

<!-- update 2026-05-11T12:30:32 -->

<!-- update 2026-05-11T12:42:26 -->

<!-- update 2026-05-11T09:40:15 -->

<!-- update 2026-05-11T21:25:15 -->

<!-- update 2026-05-11T14:16:01 -->

<!-- update 2026-05-11T21:57:48 -->

<!-- update 2026-05-11T13:26:35 -->

<!-- update 2026-05-11T17:36:19 -->

<!-- update 2026-05-11T14:55:35 -->

<!-- update 2026-05-11T19:49:23 -->

<!-- update 2026-05-11T21:52:40 -->

<!-- update 2026-05-12T13:33:16 -->

<!-- update 2026-05-13T12:04:47 -->

<!-- update 2026-05-13T09:55:26 -->

<!-- update 2026-05-13T13:44:23 -->

<!-- update 2026-05-13T13:13:53 -->

<!-- update 2026-05-13T17:00:40 -->

<!-- update 2026-05-13T15:14:13 -->

<!-- update 2026-05-13T16:47:43 -->

<!-- update 2026-05-14T10:48:51 -->

<!-- update 2026-05-14T15:40:09 -->

<!-- update 2026-05-14T14:33:13 -->

<!-- update 2026-05-14T19:03:39 -->

<!-- update 2026-05-14T21:07:42 -->

<!-- update 2026-05-14T18:24:45 -->

<!-- update 2026-05-14T18:40:32 -->

<!-- update 2026-05-14T13:32:26 -->

<!-- update 2026-05-14T18:48:07 -->

<!-- update 2026-05-14T19:13:58 -->

<!-- update 2026-05-14T14:09:13 -->

<!-- update 2026-05-17T13:51:00 -->

<!-- update 2026-05-17T21:46:51 -->

<!-- update 2026-05-17T12:09:07 -->

<!-- update 2026-05-17T20:04:02 -->

<!-- update 2026-05-18T21:28:03 -->

<!-- update 2026-05-18T13:54:36 -->

<!-- update 2026-05-18T15:52:18 -->

<!-- update 2026-05-18T09:04:23 -->

<!-- update 2026-05-18T13:46:48 -->

<!-- update 2026-05-18T17:44:13 -->

<!-- update 2026-05-18T19:05:37 -->

<!-- update 2026-05-18T11:11:46 -->

<!-- update 2026-05-18T14:08:54 -->

<!-- update 2026-05-18T21:50:50 -->

<!-- update 2026-05-18T20:01:04 -->

<!-- update 2026-05-19T16:30:17 -->

<!-- update 2026-05-19T21:27:55 -->

<!-- update 2026-05-19T17:06:02 -->

<!-- update 2026-05-19T11:09:34 -->

<!-- update 2026-05-19T11:51:58 -->

<!-- update 2026-05-19T15:50:39 -->

<!-- update 2026-05-19T20:34:49 -->

<!-- update 2026-05-19T17:44:19 -->

<!-- update 2026-05-20T12:53:30 -->

<!-- update 2026-05-20T16:50:45 -->

<!-- update 2026-05-21T11:41:24 -->

<!-- update 2026-05-21T11:06:01 -->

<!-- update 2026-05-21T17:39:17 -->

<!-- update 2026-05-21T12:32:07 -->

<!-- update 2026-05-21T18:17:26 -->

<!-- update 2026-05-21T11:29:12 -->

<!-- update 2026-05-23T10:39:54 -->

<!-- update 2026-05-23T15:36:05 -->

<!-- update 2026-05-23T19:19:11 -->

<!-- update 2026-05-23T12:37:44 -->

<!-- update 2026-05-23T13:13:35 -->

<!-- update 2026-05-23T12:06:42 -->

<!-- update 2026-05-23T17:28:49 -->

<!-- update 2026-05-23T09:48:32 -->

<!-- update 2026-05-23T12:12:39 -->

<!-- update 2026-05-24T12:40:52 -->

<!-- update 2026-05-24T17:40:25 -->

<!-- update 2026-05-24T14:17:40 -->

<!-- update 2026-05-24T17:20:15 -->

<!-- update 2026-05-24T09:36:29 -->

<!-- update 2026-05-26T18:41:48 -->

<!-- update 2026-05-26T12:39:32 -->

<!-- update 2026-05-30T13:05:50 -->

<!-- update 2026-05-30T10:39:57 -->

<!-- update 2026-05-30T13:40:29 -->

<!-- update 2026-05-30T13:21:52 -->

<!-- update 2026-05-30T17:19:01 -->

<!-- update 2026-05-30T16:53:50 -->

<!-- update 2026-05-30T09:01:25 -->

<!-- update 2026-05-30T18:30:11 -->

<!-- update 2026-05-31T15:49:17 -->

<!-- update 2026-05-31T11:56:04 -->

<!-- update 2026-06-01T11:20:49 -->

<!-- update 2026-06-01T13:20:01 -->

<!-- update 2026-06-01T13:48:47 -->

<!-- update 2026-06-01T13:40:25 -->

<!-- update 2026-06-01T12:33:08 -->

<!-- update 2026-06-01T16:05:35 -->

<!-- update 2026-06-01T18:48:37 -->

<!-- update 2026-06-01T10:40:15 -->

<!-- update 2026-06-01T21:37:21 -->

<!-- update 2026-06-02T13:24:17 -->

<!-- update 2026-06-02T18:44:23 -->

<!-- update 2026-06-02T20:02:28 -->

<!-- update 2026-06-06T11:19:05 -->

<!-- update 2026-06-06T10:56:36 -->

<!-- update 2026-06-06T15:46:39 -->

<!-- update 2026-06-07T16:00:46 -->

<!-- update 2026-06-07T15:02:10 -->

<!-- update 2026-06-09T19:27:19 -->

<!-- update 2026-06-09T15:10:12 -->

<!-- update 2026-06-09T15:32:21 -->

<!-- update 2026-06-09T09:38:10 -->

<!-- update 2026-06-09T16:36:54 -->

<!-- update 2026-06-09T09:39:44 -->

<!-- update 2026-06-09T16:23:46 -->

<!-- update 2026-06-09T11:45:13 -->

<!-- update 2026-06-09T13:34:25 -->

<!-- update 2026-06-09T11:03:04 -->

<!-- update 2026-06-10T20:04:55 -->

<!-- update 2026-06-10T11:23:43 -->

<!-- update 2026-06-10T11:22:53 -->

<!-- update 2026-06-11T09:39:29 -->

<!-- update 2026-06-11T11:38:28 -->

<!-- update 2026-06-11T16:50:23 -->

<!-- update 2026-06-11T13:23:04 -->

<!-- update 2026-06-11T14:54:48 -->

<!-- update 2026-06-11T09:27:21 -->

<!-- update 2026-06-13T09:26:36 -->

<!-- update 2026-06-13T12:04:46 -->

<!-- update 2026-06-13T20:51:02 -->

<!-- update 2026-06-13T15:10:39 -->

<!-- update 2026-06-18T17:46:52 -->

<!-- update 2026-06-18T17:09:44 -->

<!-- update 2026-06-20T18:30:08 -->

<!-- update 2026-06-20T15:56:19 -->

<!-- update 2026-06-20T19:28:07 -->

<!-- update 2026-06-20T13:02:30 -->

<!-- update 2026-06-20T15:46:45 -->

<!-- update 2026-06-20T17:40:09 -->

<!-- update 2026-06-24T17:36:57 -->

<!-- update 2026-06-27T11:10:31 -->

<!-- update 2026-06-27T18:15:57 -->

<!-- update 2026-06-27T10:27:23 -->

<!-- update 2026-06-27T21:45:39 -->

<!-- update 2026-06-27T13:52:09 -->

<!-- update 2026-06-27T16:00:43 -->

<!-- update 2026-06-27T15:12:26 -->

<!-- update 2026-06-27T11:26:56 -->

<!-- update 2026-06-27T09:25:36 -->

<!-- update 2026-06-29T20:10:06 -->

<!-- update 2026-06-29T09:43:50 -->

<!-- update 2026-06-29T18:42:34 -->

<!-- update 2026-06-29T14:34:16 -->

<!-- update 2026-06-29T16:55:55 -->

<!-- update 2026-06-29T11:02:49 -->

<!-- update 2026-06-29T16:41:19 -->

<!-- update 2026-06-29T16:08:47 -->

<!-- update 2026-06-29T13:01:52 -->

<!-- update 2026-06-29T11:02:11 -->

<!-- update 2026-06-29T13:53:43 -->

<!-- update 2026-06-30T20:22:04 -->

<!-- update 2026-06-30T18:55:27 -->

<!-- update 2026-06-30T21:12:49 -->

<!-- update 2026-06-30T17:53:51 -->

<!-- update 2026-07-01T11:18:46 -->

<!-- update 2026-07-01T20:19:22 -->

<!-- update 2026-07-01T20:00:20 -->

<!-- update 2026-07-01T15:29:35 -->

<!-- update 2026-07-01T13:06:53 -->

<!-- update 2026-07-01T18:18:30 -->

<!-- update 2026-07-01T14:12:22 -->

<!-- update 2026-07-01T12:51:18 -->

<!-- update 2026-07-01T12:52:58 -->

<!-- update 2026-07-01T19:50:18 -->

<!-- update 2026-07-01T18:13:15 -->

<!-- update 2026-07-05T19:24:43 -->

<!-- update 2026-07-05T20:42:33 -->

<!-- update 2026-07-05T17:26:58 -->

<!-- update 2026-07-05T12:56:32 -->

<!-- update 2026-07-05T21:26:32 -->

<!-- update 2026-07-05T19:31:45 -->

<!-- update 2026-07-05T13:44:54 -->

<!-- update 2026-07-05T11:54:07 -->

<!-- update 2026-07-06T18:03:21 -->

<!-- update 2026-07-06T16:07:46 -->

<!-- update 2026-07-06T17:20:11 -->

<!-- update 2026-07-06T14:30:10 -->

<!-- update 2026-07-06T17:47:37 -->

<!-- update 2026-07-07T21:33:19 -->

<!-- update 2026-07-07T16:37:44 -->

<!-- update 2026-07-07T18:58:31 -->

<!-- update 2026-07-07T20:53:54 -->

<!-- update 2026-07-07T13:47:25 -->

<!-- update 2026-07-08T15:36:56 -->

<!-- update 2026-07-08T21:08:20 -->

<!-- update 2026-07-08T16:28:57 -->

<!-- update 2026-07-08T12:04:20 -->

<!-- update 2026-07-08T12:50:55 -->

<!-- update 2026-07-08T16:33:19 -->

<!-- update 2026-07-09T13:22:18 -->

<!-- update 2026-07-09T11:00:19 -->

<!-- update 2026-07-09T19:22:42 -->

<!-- update 2026-07-09T19:42:40 -->

<!-- update 2026-07-09T17:33:01 -->

<!-- update 2026-07-11T09:32:43 -->

<!-- update 2026-07-11T20:09:24 -->

<!-- update 2026-07-11T13:10:49 -->

<!-- update 2026-07-11T19:03:15 -->

<!-- update 2026-07-11T15:48:01 -->

<!-- update 2026-07-11T17:40:43 -->

<!-- update 2026-07-11T09:27:47 -->

<!-- update 2026-07-11T21:29:29 -->

<!-- update 2026-07-11T13:11:55 -->

<!-- update 2026-07-11T12:19:23 -->

<!-- update 2026-07-11T11:43:49 -->

<!-- update 2026-07-12T18:55:16 -->

<!-- update 2026-07-12T13:28:52 -->

<!-- update 2026-07-12T11:39:30 -->

<!-- update 2026-07-12T18:09:43 -->

<!-- update 2026-07-12T14:53:46 -->

<!-- update 2026-07-12T14:54:32 -->

<!-- update 2026-07-12T09:51:03 -->

<!-- update 2026-07-12T10:43:50 -->

<!-- update 2026-07-12T20:53:37 -->

<!-- update 2026-07-13T11:27:06 -->

<!-- update 2026-07-13T12:34:46 -->

<!-- update 2026-07-13T15:09:47 -->

<!-- update 2026-07-13T15:11:26 -->

<!-- update 2026-07-13T17:19:41 -->

<!-- update 2026-07-13T15:38:40 -->

<!-- update 2026-07-13T17:25:56 -->

<!-- update 2026-07-13T20:27:56 -->

<!-- update 2026-07-14T20:29:17 -->

<!-- update 2026-07-16T16:22:45 -->

<!-- update 2026-07-19T17:43:11 -->

<!-- update 2026-07-19T14:21:38 -->

<!-- update 2026-07-19T12:58:49 -->

<!-- update 2026-07-19T16:05:18 -->

<!-- update 2026-07-19T15:01:12 -->

<!-- update 2026-07-19T14:36:25 -->

<!-- update 2026-07-19T10:19:18 -->

<!-- update 2026-07-19T16:16:35 -->

<!-- update 2026-07-19T09:07:17 -->

<!-- update 2026-07-19T14:45:01 -->

<!-- update 2026-07-20T11:10:23 -->

<!-- update 2026-07-20T20:52:04 -->

<!-- update 2026-07-20T14:35:45 -->

<!-- update 2026-07-20T11:02:39 -->

<!-- update 2026-07-20T14:14:56 -->

<!-- update 2026-07-20T10:42:55 -->

<!-- update 2026-07-20T19:10:08 -->

<!-- update 2026-07-20T18:52:16 -->

<!-- update 2026-07-20T19:20:54 -->

<!-- update 2026-07-20T14:32:04 -->

<!-- update 2026-07-20T11:12:16 -->

<!-- update 2026-07-21T13:30:41 -->

<!-- update 2026-07-21T21:35:41 -->

<!-- update 2026-07-21T12:58:28 -->

<!-- update 2026-07-21T11:12:21 -->

<!-- update 2026-07-21T15:33:41 -->

<!-- update 2026-07-21T17:50:21 -->

<!-- update 2026-07-21T17:47:56 -->

<!-- update 2026-07-21T21:52:52 -->

<!-- update 2026-07-21T10:28:48 -->

<!-- update 2026-07-21T12:18:33 -->

<!-- update 2026-07-22T16:45:48 -->

<!-- update 2026-07-25T20:10:56 -->

<!-- update 2026-07-25T09:32:15 -->

<!-- update 2026-07-25T14:31:06 -->

<!-- update 2026-07-25T09:18:31 -->

<!-- update 2026-07-25T20:14:01 -->

<!-- update 2026-07-25T16:46:03 -->

<!-- update 2026-07-25T18:11:17 -->

<!-- update 2026-07-25T18:36:25 -->

<!-- update 2026-07-25T14:10:02 -->

<!-- update 2026-07-25T16:05:28 -->

<!-- update 2026-07-26T19:37:24 -->
