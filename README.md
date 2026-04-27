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
