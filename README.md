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

<!-- update 2026-07-26T21:07:55 -->

<!-- update 2026-07-26T14:32:41 -->

<!-- update 2026-07-26T11:52:00 -->

<!-- update 2026-07-26T12:45:41 -->

<!-- update 2026-07-27T21:54:22 -->

<!-- update 2026-07-27T20:17:56 -->

<!-- update 2026-07-30T12:45:42 -->

<!-- update 2026-07-30T11:11:25 -->

<!-- update 2026-07-30T15:16:11 -->

<!-- update 2026-08-01T19:06:46 -->

<!-- update 2026-08-02T12:56:24 -->

<!-- update 2026-08-02T10:16:26 -->

<!-- update 2026-08-04T15:30:35 -->

<!-- update 2026-08-04T12:55:45 -->

<!-- update 2026-08-04T10:22:23 -->

<!-- update 2026-08-04T19:02:13 -->

<!-- update 2026-08-04T21:44:48 -->

<!-- update 2026-08-04T19:44:08 -->

<!-- update 2026-08-04T20:11:35 -->

<!-- update 2026-08-04T09:09:38 -->

<!-- update 2026-08-04T14:06:21 -->

<!-- update 2026-08-04T18:45:08 -->

<!-- update 2026-08-08T19:24:44 -->

<!-- update 2026-08-11T16:33:13 -->

<!-- update 2026-08-11T10:04:45 -->

<!-- update 2026-08-11T10:46:41 -->

<!-- update 2026-08-11T09:06:50 -->

<!-- update 2026-08-11T11:18:55 -->

<!-- update 2026-08-11T14:45:22 -->

<!-- update 2026-08-11T10:26:51 -->

<!-- update 2026-08-11T10:46:04 -->

<!-- update 2026-08-11T19:41:12 -->

<!-- update 2026-08-13T19:43:13 -->

<!-- update 2026-08-13T18:57:04 -->

<!-- update 2026-08-13T21:45:55 -->

<!-- update 2026-08-13T10:48:22 -->

<!-- update 2026-08-15T13:35:04 -->

<!-- update 2026-08-15T17:42:58 -->

<!-- update 2026-08-15T09:37:37 -->

<!-- update 2026-08-15T16:27:52 -->

<!-- update 2026-08-15T12:44:53 -->

<!-- update 2026-08-15T17:52:11 -->

<!-- update 2026-08-17T18:31:44 -->

<!-- update 2026-08-17T10:18:32 -->

<!-- update 2026-08-17T16:20:46 -->

<!-- update 2026-08-17T13:15:10 -->

<!-- update 2026-08-17T17:13:45 -->

<!-- update 2026-08-17T14:01:26 -->

<!-- update 2026-08-17T13:20:06 -->

<!-- update 2026-08-17T19:33:13 -->

<!-- update 2026-08-17T20:28:47 -->

<!-- update 2026-08-17T16:06:29 -->

<!-- update 2026-08-18T12:18:55 -->

<!-- update 2026-08-18T18:20:37 -->

<!-- update 2026-08-18T21:50:49 -->

<!-- update 2026-08-18T21:09:49 -->

<!-- update 2026-08-18T14:21:47 -->

<!-- update 2026-08-18T11:49:17 -->

<!-- update 2026-08-18T16:13:38 -->

<!-- update 2026-08-18T21:02:39 -->

<!-- update 2026-08-18T21:13:05 -->

<!-- update 2026-08-20T20:52:09 -->

<!-- update 2026-08-20T12:09:40 -->

<!-- update 2026-08-20T17:25:01 -->

<!-- update 2026-08-20T15:13:37 -->

<!-- update 2026-08-20T11:52:49 -->

<!-- update 2026-08-20T09:23:05 -->

<!-- update 2026-08-20T15:07:04 -->

<!-- update 2026-08-20T09:57:15 -->

<!-- update 2026-08-22T14:06:09 -->

<!-- update 2026-08-22T21:29:47 -->

<!-- update 2026-08-22T20:32:11 -->

<!-- update 2026-08-23T16:46:48 -->

<!-- update 2026-08-24T18:49:39 -->

<!-- update 2026-08-24T13:18:06 -->

<!-- update 2026-08-24T21:03:35 -->

<!-- update 2026-08-24T09:36:02 -->

<!-- update 2026-08-24T16:17:41 -->

<!-- update 2026-08-24T11:17:00 -->

<!-- update 2026-08-24T19:00:57 -->

<!-- update 2026-08-24T16:27:18 -->

<!-- update 2026-08-24T12:37:14 -->

<!-- update 2026-08-24T20:07:37 -->

<!-- update 2026-08-24T13:31:04 -->

<!-- update 2026-08-25T09:17:46 -->

<!-- update 2026-08-25T15:19:03 -->

<!-- update 2026-08-26T16:28:45 -->

<!-- update 2026-08-26T10:21:25 -->

<!-- update 2026-08-26T15:53:12 -->

<!-- update 2026-08-26T11:35:22 -->

<!-- update 2026-08-26T20:20:07 -->

<!-- update 2026-08-26T10:00:15 -->

<!-- update 2026-08-26T19:16:58 -->

<!-- update 2026-08-27T12:49:02 -->

<!-- update 2026-08-27T15:00:33 -->

<!-- update 2026-08-27T20:23:34 -->

<!-- update 2026-08-27T16:53:10 -->

<!-- update 2026-08-27T11:46:13 -->

<!-- update 2026-08-27T13:53:38 -->

<!-- update 2026-08-27T13:39:28 -->

<!-- update 2026-08-27T09:57:42 -->

<!-- update 2026-08-27T12:02:12 -->

<!-- update 2026-08-29T11:13:04 -->

<!-- update 2026-08-29T14:53:47 -->

<!-- update 2026-08-29T17:23:07 -->

<!-- update 2026-08-29T12:36:50 -->

<!-- update 2026-08-29T10:47:55 -->

<!-- update 2026-08-29T14:38:17 -->

<!-- update 2026-08-30T12:35:21 -->

<!-- update 2026-08-30T19:48:57 -->

<!-- update 2026-08-30T16:57:55 -->

<!-- update 2026-08-30T09:44:22 -->

<!-- update 2026-08-30T15:35:50 -->

<!-- update 2026-08-30T12:22:00 -->

<!-- update 2026-08-30T12:51:29 -->

<!-- update 2026-08-30T19:52:39 -->

<!-- update 2026-08-30T12:15:52 -->

<!-- update 2026-08-30T14:25:57 -->

<!-- update 2026-08-31T19:14:11 -->

<!-- update 2026-08-31T16:10:08 -->

<!-- update 2026-09-01T11:37:36 -->

<!-- update 2026-09-01T14:37:35 -->

<!-- update 2026-09-01T09:48:16 -->

<!-- update 2026-09-01T19:43:36 -->

<!-- update 2026-09-01T16:23:30 -->

<!-- update 2026-09-01T17:02:36 -->

<!-- update 2026-09-02T12:40:47 -->

<!-- update 2026-09-02T16:20:31 -->

<!-- update 2026-09-02T10:19:37 -->

<!-- update 2026-09-02T14:02:10 -->

<!-- update 2026-09-02T18:52:43 -->

<!-- update 2026-09-02T11:44:20 -->

<!-- update 2026-09-02T12:49:19 -->

<!-- update 2026-09-02T12:21:44 -->

<!-- update 2026-09-06T21:57:50 -->

<!-- update 2026-09-06T16:36:46 -->

<!-- update 2026-09-06T20:02:20 -->

<!-- update 2026-09-06T13:03:05 -->

<!-- update 2026-09-07T18:55:37 -->

<!-- update 2026-09-07T13:06:57 -->

<!-- update 2026-09-07T12:12:26 -->

<!-- update 2026-09-07T16:09:56 -->

<!-- update 2026-09-07T13:10:17 -->

<!-- update 2026-09-08T17:15:31 -->

<!-- update 2026-09-08T11:08:21 -->

<!-- update 2026-09-08T16:54:18 -->

<!-- update 2026-09-08T16:50:15 -->

<!-- update 2026-09-08T12:43:06 -->

<!-- update 2026-09-10T21:02:19 -->

<!-- update 2026-09-10T13:06:58 -->

<!-- update 2026-09-10T16:01:08 -->

<!-- update 2026-09-10T18:43:02 -->

<!-- update 2026-09-10T15:44:32 -->

<!-- update 2026-09-10T21:02:58 -->

<!-- update 2026-09-10T18:39:34 -->

<!-- update 2026-09-10T18:36:21 -->

<!-- update 2026-09-10T09:49:33 -->

<!-- update 2026-09-10T21:04:58 -->

<!-- update 2026-09-10T18:58:48 -->

<!-- update 2026-09-12T21:13:11 -->

<!-- update 2026-09-12T15:19:39 -->

<!-- update 2026-09-12T21:25:35 -->

<!-- update 2026-09-12T09:21:56 -->

<!-- update 2026-09-12T20:12:38 -->

<!-- update 2026-09-12T19:21:14 -->

<!-- update 2026-09-12T21:14:02 -->

<!-- update 2026-09-12T15:34:41 -->

<!-- update 2026-09-12T12:13:06 -->

<!-- update 2026-01-01T20:54:05 -->

<!-- update 2026-01-01T20:54:24 -->

<!-- update 2026-01-01T19:45:24 -->

<!-- update 2026-01-01T12:00:05 -->

<!-- update 2026-01-01T13:47:41 -->

<!-- update 2026-01-01T20:55:39 -->

<!-- update 2026-01-01T17:10:08 -->

<!-- update 2026-01-01T15:20:22 -->

<!-- update 2026-01-01T15:12:34 -->

<!-- update 2026-01-01T11:16:22 -->

<!-- update 2026-01-01T21:34:04 -->

<!-- update 2026-01-03T09:41:19 -->

<!-- update 2026-01-03T19:19:47 -->

<!-- update 2026-01-03T11:29:51 -->

<!-- update 2026-01-03T09:29:38 -->

<!-- update 2026-01-03T21:01:27 -->

<!-- update 2026-01-03T20:10:35 -->

<!-- update 2026-01-03T17:00:40 -->

<!-- update 2026-01-03T14:34:53 -->

<!-- update 2026-01-03T10:34:09 -->

<!-- update 2026-01-05T21:04:31 -->

<!-- update 2026-01-05T18:06:47 -->

<!-- update 2026-01-05T21:33:47 -->

<!-- update 2026-01-08T11:12:04 -->

<!-- update 2026-01-08T15:29:16 -->

<!-- update 2026-01-08T19:48:08 -->

<!-- update 2026-01-08T17:23:45 -->

<!-- update 2026-01-08T15:15:06 -->

<!-- update 2026-01-10T09:58:56 -->

<!-- update 2026-01-10T12:31:43 -->

<!-- update 2026-01-10T21:05:35 -->

<!-- update 2026-01-10T15:33:38 -->

<!-- update 2026-01-10T17:01:10 -->

<!-- update 2026-01-10T17:00:24 -->

<!-- update 2026-01-10T09:00:19 -->

<!-- update 2026-01-11T15:53:23 -->

<!-- update 2026-01-11T10:06:43 -->

<!-- update 2026-01-11T13:49:48 -->

<!-- update 2026-01-11T11:29:50 -->

<!-- update 2026-01-11T21:50:18 -->

<!-- update 2026-01-11T20:21:12 -->

<!-- update 2026-01-11T14:33:10 -->

<!-- update 2026-01-11T19:20:48 -->

<!-- update 2026-01-13T10:37:06 -->

<!-- update 2026-01-13T17:45:31 -->

<!-- update 2026-01-13T17:45:37 -->

<!-- update 2026-01-13T19:10:51 -->

<!-- update 2026-01-13T19:10:09 -->

<!-- update 2026-01-13T10:31:38 -->

<!-- update 2026-01-13T12:35:36 -->

<!-- update 2026-01-13T16:15:35 -->

<!-- update 2026-01-13T21:31:50 -->

<!-- update 2026-01-15T14:30:49 -->

<!-- update 2026-01-17T10:07:19 -->

<!-- update 2026-01-17T21:35:08 -->

<!-- update 2026-01-17T16:05:40 -->

<!-- update 2026-01-17T17:58:46 -->

<!-- update 2026-01-17T19:51:00 -->

<!-- update 2026-01-17T09:30:05 -->

<!-- update 2026-01-17T16:38:31 -->

<!-- update 2026-01-18T13:36:52 -->

<!-- update 2026-01-18T13:49:37 -->

<!-- update 2026-01-18T16:41:20 -->

<!-- update 2026-01-18T18:26:26 -->

<!-- update 2026-01-18T18:04:28 -->

<!-- update 2026-01-18T18:10:06 -->

<!-- update 2026-01-18T17:04:22 -->

<!-- update 2026-01-18T18:27:11 -->

<!-- update 2026-01-20T12:04:35 -->

<!-- update 2026-01-20T09:35:21 -->

<!-- update 2026-01-20T10:02:01 -->

<!-- update 2026-01-21T21:32:32 -->

<!-- update 2026-01-21T16:02:24 -->

<!-- update 2026-01-21T09:44:11 -->

<!-- update 2026-01-21T09:06:34 -->

<!-- update 2026-01-21T19:23:00 -->

<!-- update 2026-01-22T12:41:49 -->

<!-- update 2026-01-22T12:48:11 -->

<!-- update 2026-01-22T10:27:13 -->

<!-- update 2026-01-22T09:48:12 -->

<!-- update 2026-01-24T14:34:49 -->

<!-- update 2026-01-24T18:38:01 -->

<!-- update 2026-01-24T12:33:19 -->

<!-- update 2026-01-24T13:15:43 -->

<!-- update 2026-01-24T19:07:46 -->

<!-- update 2026-01-24T14:53:09 -->

<!-- update 2026-01-24T16:49:30 -->

<!-- update 2026-01-24T19:16:33 -->

<!-- update 2026-01-24T20:57:26 -->

<!-- update 2026-01-25T15:38:18 -->

<!-- update 2026-01-25T20:03:35 -->

<!-- update 2026-01-26T15:33:11 -->

<!-- update 2026-01-26T20:47:48 -->

<!-- update 2026-01-26T17:06:46 -->

<!-- update 2026-01-26T13:32:17 -->

<!-- update 2026-01-26T16:13:03 -->

<!-- update 2026-01-26T17:26:06 -->

<!-- update 2026-01-26T19:40:58 -->

<!-- update 2026-01-26T14:16:42 -->

<!-- update 2026-01-26T14:07:05 -->

<!-- update 2026-01-26T14:01:46 -->

<!-- update 2026-01-26T19:09:33 -->

<!-- update 2026-01-27T09:26:02 -->

<!-- update 2026-01-27T20:54:48 -->

<!-- update 2026-01-28T17:42:43 -->

<!-- update 2026-01-28T11:22:31 -->

<!-- update 2026-01-28T11:46:54 -->

<!-- update 2026-01-28T14:52:18 -->

<!-- update 2026-01-28T14:22:31 -->

<!-- update 2026-01-29T15:36:37 -->

<!-- update 2026-01-29T14:34:14 -->

<!-- update 2026-01-29T13:14:55 -->

<!-- update 2026-01-29T11:19:29 -->

<!-- update 2026-01-29T15:45:18 -->

<!-- update 2026-01-29T10:11:31 -->

<!-- update 2026-01-29T16:33:23 -->

<!-- update 2026-01-29T21:39:32 -->

<!-- update 2026-01-29T11:04:37 -->

<!-- update 2026-01-29T21:07:57 -->

<!-- update 2026-01-31T19:15:21 -->

<!-- update 2026-01-31T11:09:32 -->

<!-- update 2026-01-31T19:06:17 -->

<!-- update 2026-01-31T14:25:36 -->

<!-- update 2026-01-31T18:17:58 -->

<!-- update 2026-01-31T09:43:13 -->

<!-- update 2026-01-31T10:02:29 -->

<!-- update 2026-01-31T21:29:16 -->

<!-- update 2026-01-31T15:47:07 -->

<!-- update 2026-01-31T17:18:16 -->

<!-- update 2026-01-31T14:49:26 -->

<!-- update 2026-02-01T16:57:01 -->

<!-- update 2026-02-01T11:30:31 -->

<!-- update 2026-02-01T15:07:07 -->

<!-- update 2026-02-01T10:50:29 -->

<!-- update 2026-02-01T14:49:16 -->

<!-- update 2026-02-01T18:35:34 -->

<!-- update 2026-02-01T11:52:57 -->

<!-- update 2026-02-01T20:06:10 -->

<!-- update 2026-02-01T20:04:03 -->

<!-- update 2026-02-01T14:22:32 -->

<!-- update 2026-02-01T11:30:55 -->

<!-- update 2026-02-02T14:36:21 -->

<!-- update 2026-02-02T14:06:13 -->

<!-- update 2026-02-02T20:27:07 -->

<!-- update 2026-02-02T14:08:30 -->

<!-- update 2026-02-02T17:17:08 -->

<!-- update 2026-02-02T18:07:52 -->

<!-- update 2026-02-02T10:09:27 -->

<!-- update 2026-02-03T17:34:23 -->

<!-- update 2026-02-03T14:17:00 -->

<!-- update 2026-02-03T10:36:14 -->

<!-- update 2026-02-03T20:41:02 -->

<!-- update 2026-02-03T16:05:20 -->

<!-- update 2026-02-03T21:49:38 -->

<!-- update 2026-02-03T21:43:09 -->

<!-- update 2026-02-03T10:36:57 -->

<!-- update 2026-02-04T21:34:46 -->

<!-- update 2026-02-04T10:43:12 -->

<!-- update 2026-02-04T11:31:33 -->

<!-- update 2026-02-04T19:31:36 -->

<!-- update 2026-02-04T09:06:32 -->

<!-- update 2026-02-04T11:47:40 -->

<!-- update 2026-02-04T21:23:22 -->

<!-- update 2026-02-04T14:07:07 -->

<!-- update 2026-02-05T09:17:00 -->

<!-- update 2026-02-05T17:54:21 -->

<!-- update 2026-02-05T09:19:44 -->

<!-- update 2026-02-05T12:38:27 -->

<!-- update 2026-02-05T13:17:10 -->

<!-- update 2026-02-05T13:04:41 -->

<!-- update 2026-02-07T20:36:19 -->

<!-- update 2026-02-07T12:53:27 -->

<!-- update 2026-02-07T14:02:58 -->

<!-- update 2026-02-07T12:47:17 -->

<!-- update 2026-02-07T10:04:07 -->

<!-- update 2026-02-07T19:04:36 -->

<!-- update 2026-02-07T12:56:07 -->

<!-- update 2026-02-07T10:09:20 -->

<!-- update 2026-02-07T10:35:39 -->

<!-- update 2026-02-08T20:18:32 -->

<!-- update 2026-02-08T20:32:24 -->

<!-- update 2026-02-08T09:01:02 -->

<!-- update 2026-02-08T12:48:52 -->

<!-- update 2026-02-08T20:32:25 -->

<!-- update 2026-02-08T20:48:54 -->

<!-- update 2026-02-08T15:04:56 -->

<!-- update 2026-02-08T13:50:44 -->

<!-- update 2026-02-08T20:41:32 -->

<!-- update 2026-02-08T16:48:08 -->

<!-- update 2026-02-09T11:07:40 -->

<!-- update 2026-02-09T20:04:08 -->

<!-- update 2026-02-09T17:10:05 -->

<!-- update 2026-02-09T17:32:14 -->

<!-- update 2026-02-09T17:28:15 -->

<!-- update 2026-02-09T19:50:43 -->

<!-- update 2026-02-09T18:33:05 -->

<!-- update 2026-02-09T11:47:24 -->

<!-- update 2026-02-09T18:20:12 -->

<!-- update 2026-02-09T19:03:16 -->

<!-- update 2026-02-12T14:56:20 -->

<!-- update 2026-02-12T16:05:19 -->

<!-- update 2026-02-12T11:56:06 -->

<!-- update 2026-02-12T15:30:17 -->

<!-- update 2026-02-12T19:06:21 -->

<!-- update 2026-02-12T16:01:19 -->

<!-- update 2026-02-12T16:15:19 -->

<!-- update 2026-02-15T14:55:30 -->

<!-- update 2026-02-15T21:45:20 -->

<!-- update 2026-02-15T14:52:08 -->

<!-- update 2026-02-15T14:39:10 -->

<!-- update 2026-02-15T09:35:32 -->

<!-- update 2026-02-15T15:04:55 -->

<!-- update 2026-02-15T13:08:16 -->

<!-- update 2026-02-16T12:48:39 -->

<!-- update 2026-02-16T15:08:11 -->

<!-- update 2026-02-16T18:08:25 -->

<!-- update 2026-02-18T15:08:29 -->

<!-- update 2026-02-18T16:28:26 -->

<!-- update 2026-02-18T17:09:54 -->

<!-- update 2026-02-18T13:03:03 -->

<!-- update 2026-02-18T09:40:45 -->

<!-- update 2026-02-18T15:06:31 -->

<!-- update 2026-02-18T10:55:56 -->

<!-- update 2026-02-18T13:26:01 -->

<!-- update 2026-02-18T13:05:05 -->

<!-- update 2026-02-24T13:24:50 -->

<!-- update 2026-02-24T16:02:38 -->

<!-- update 2026-02-24T10:26:48 -->

<!-- update 2026-02-24T21:06:43 -->

<!-- update 2026-02-24T16:20:28 -->

<!-- update 2026-02-24T09:08:48 -->

<!-- update 2026-02-24T14:17:25 -->

<!-- update 2026-02-24T11:27:50 -->

<!-- update 2026-02-24T15:46:08 -->

<!-- update 2026-02-24T20:33:32 -->

<!-- update 2026-02-24T12:41:51 -->

<!-- update 2026-02-25T21:21:45 -->

<!-- update 2026-02-25T09:23:39 -->

<!-- update 2026-02-25T21:48:22 -->

<!-- update 2026-02-25T21:03:52 -->

<!-- update 2026-02-25T21:35:58 -->

<!-- update 2026-02-25T19:09:34 -->

<!-- update 2026-02-25T13:05:57 -->

<!-- update 2026-02-25T11:29:04 -->

<!-- update 2026-03-01T19:22:54 -->

<!-- update 2026-03-01T09:35:01 -->

<!-- update 2026-03-01T19:38:21 -->

<!-- update 2026-03-01T14:16:23 -->

<!-- update 2026-03-01T16:36:55 -->

<!-- update 2026-03-01T10:21:31 -->

<!-- update 2026-03-01T09:29:04 -->

<!-- update 2026-03-01T14:51:47 -->

<!-- update 2026-03-01T11:44:20 -->

<!-- update 2026-03-02T12:26:35 -->

<!-- update 2026-03-02T12:19:58 -->

<!-- update 2026-03-02T17:54:18 -->

<!-- update 2026-03-02T21:03:11 -->

<!-- update 2026-03-02T21:18:49 -->

<!-- update 2026-03-02T19:07:25 -->

<!-- update 2026-03-02T17:53:37 -->

<!-- update 2026-03-02T15:24:54 -->

<!-- update 2026-03-02T15:51:49 -->

<!-- update 2026-03-02T10:28:53 -->

<!-- update 2026-03-03T12:43:52 -->

<!-- update 2026-03-03T15:05:23 -->

<!-- update 2026-03-03T12:46:04 -->

<!-- update 2026-03-03T17:36:33 -->

<!-- update 2026-03-03T12:05:20 -->

<!-- update 2026-03-03T13:18:09 -->

<!-- update 2026-03-03T19:19:27 -->

<!-- update 2026-03-03T16:44:52 -->

<!-- update 2026-03-03T13:30:56 -->

<!-- update 2026-03-04T15:32:09 -->

<!-- update 2026-03-04T13:12:53 -->

<!-- update 2026-03-04T19:34:42 -->

<!-- update 2026-03-04T11:48:30 -->

<!-- update 2026-03-04T17:40:31 -->

<!-- update 2026-03-04T12:24:23 -->

<!-- update 2026-03-04T12:47:08 -->

<!-- update 2026-03-04T11:09:43 -->

<!-- update 2026-03-04T09:48:12 -->

<!-- update 2026-03-04T14:12:42 -->

<!-- update 2026-03-05T14:08:51 -->

<!-- update 2026-03-05T11:28:34 -->

<!-- update 2026-03-05T14:00:43 -->

<!-- update 2026-03-05T09:45:10 -->

<!-- update 2026-03-05T14:08:10 -->

<!-- update 2026-03-05T19:43:44 -->

<!-- update 2026-03-05T09:26:45 -->

<!-- update 2026-03-07T21:19:20 -->

<!-- update 2026-03-07T18:14:11 -->

<!-- update 2026-03-07T09:05:07 -->

<!-- update 2026-03-07T19:17:33 -->

<!-- update 2026-03-10T12:44:07 -->

<!-- update 2026-03-10T12:42:38 -->

<!-- update 2026-03-10T12:11:13 -->

<!-- update 2026-03-10T16:01:15 -->

<!-- update 2026-03-10T20:17:12 -->

<!-- update 2026-03-10T17:38:18 -->

<!-- update 2026-03-10T18:13:00 -->

<!-- update 2026-03-10T21:39:38 -->

<!-- update 2026-03-10T12:14:33 -->

<!-- update 2026-03-10T15:35:53 -->

<!-- update 2026-03-14T13:34:21 -->

<!-- update 2026-03-14T14:29:09 -->

<!-- update 2026-03-14T14:02:35 -->

<!-- update 2026-03-14T14:23:33 -->

<!-- update 2026-03-14T21:25:24 -->

<!-- update 2026-03-14T15:07:12 -->

<!-- update 2026-03-14T18:35:02 -->

<!-- update 2026-03-14T10:53:01 -->

<!-- update 2026-03-16T11:55:56 -->

<!-- update 2026-03-16T16:42:04 -->

<!-- update 2026-03-16T09:01:57 -->

<!-- update 2026-03-16T09:14:44 -->

<!-- update 2026-03-16T09:54:23 -->

<!-- update 2026-03-16T17:04:30 -->

<!-- update 2026-03-16T11:46:09 -->

<!-- update 2026-03-19T14:10:43 -->

<!-- update 2026-03-19T13:54:00 -->

<!-- update 2026-03-19T10:51:52 -->

<!-- update 2026-03-19T13:11:57 -->

<!-- update 2026-03-19T12:57:19 -->

<!-- update 2026-03-19T20:53:33 -->

<!-- update 2026-03-19T15:17:51 -->

<!-- update 2026-03-19T10:39:31 -->

<!-- update 2026-03-21T11:31:21 -->

<!-- update 2026-03-21T11:21:45 -->

<!-- update 2026-03-21T19:14:14 -->

<!-- update 2026-03-21T11:44:40 -->

<!-- update 2026-03-21T12:13:17 -->

<!-- update 2026-03-21T14:44:22 -->

<!-- update 2026-03-21T15:04:16 -->

<!-- update 2026-03-23T09:31:14 -->

<!-- update 2026-03-23T13:04:42 -->

<!-- update 2026-03-23T19:38:26 -->

<!-- update 2026-03-23T14:24:45 -->

<!-- update 2026-03-23T09:53:10 -->

<!-- update 2026-03-23T10:13:46 -->

<!-- update 2026-03-24T10:50:27 -->

<!-- update 2026-03-24T09:29:49 -->

<!-- update 2026-03-24T20:21:40 -->

<!-- update 2026-03-24T21:48:00 -->

<!-- update 2026-03-24T19:39:41 -->

<!-- update 2026-03-24T20:19:20 -->

<!-- update 2026-03-24T17:49:11 -->

<!-- update 2026-03-24T14:37:20 -->

<!-- update 2026-03-24T10:42:22 -->

<!-- update 2026-03-24T13:00:30 -->

<!-- update 2026-03-31T20:44:16 -->

<!-- update 2026-03-31T14:25:25 -->

<!-- update 2026-03-31T10:00:35 -->

<!-- update 2026-03-31T14:43:33 -->

<!-- update 2026-03-31T20:25:44 -->

<!-- update 2026-03-31T11:02:37 -->

<!-- update 2026-03-31T18:02:18 -->

<!-- update 2026-03-31T16:27:53 -->

<!-- update 2026-03-31T14:33:51 -->

<!-- update 2026-03-31T11:50:13 -->

<!-- update 2026-04-02T09:08:31 -->

<!-- update 2026-04-02T20:11:36 -->

<!-- update 2026-04-02T15:29:47 -->

<!-- update 2026-04-02T11:16:29 -->

<!-- update 2026-04-02T20:54:16 -->

<!-- update 2026-04-02T13:26:35 -->

<!-- update 2026-04-02T09:37:40 -->

<!-- update 2026-04-02T14:05:04 -->

<!-- update 2026-04-02T09:57:32 -->

<!-- update 2026-04-02T19:17:35 -->

<!-- update 2026-04-02T12:21:16 -->

<!-- update 2026-04-05T20:28:38 -->

<!-- update 2026-04-05T11:46:20 -->

<!-- update 2026-04-05T20:03:45 -->

<!-- update 2026-04-05T19:42:38 -->

<!-- update 2026-04-05T15:54:52 -->

<!-- update 2026-04-05T18:11:38 -->

<!-- update 2026-04-05T17:33:58 -->

<!-- update 2026-04-05T16:07:21 -->

<!-- update 2026-04-05T12:02:04 -->

<!-- update 2026-04-05T14:55:12 -->

<!-- update 2026-04-05T13:53:33 -->

<!-- update 2026-04-06T16:15:21 -->

<!-- update 2026-04-06T13:58:02 -->

<!-- update 2026-04-06T11:21:51 -->

<!-- update 2026-04-06T20:34:00 -->

<!-- update 2026-04-06T16:20:18 -->

<!-- update 2026-04-08T18:11:17 -->

<!-- update 2026-04-08T13:49:35 -->

<!-- update 2026-04-08T14:26:37 -->

<!-- update 2026-04-09T15:35:40 -->

<!-- update 2026-04-09T14:16:08 -->

<!-- update 2026-04-09T14:15:17 -->

<!-- update 2026-04-12T15:05:53 -->

<!-- update 2026-04-12T15:09:41 -->

<!-- update 2026-04-12T14:10:31 -->

<!-- update 2026-04-12T12:37:36 -->

<!-- update 2026-04-12T21:56:33 -->

<!-- update 2026-04-12T20:52:13 -->

<!-- update 2026-04-12T17:52:06 -->

<!-- update 2026-04-12T09:07:44 -->

<!-- update 2026-04-12T09:37:25 -->

<!-- update 2026-04-12T17:53:01 -->

<!-- update 2026-04-15T11:50:07 -->

<!-- update 2026-04-15T18:48:06 -->

<!-- update 2026-04-15T14:35:26 -->

<!-- update 2026-04-15T09:39:15 -->

<!-- update 2026-04-15T17:27:27 -->

<!-- update 2026-04-15T20:41:37 -->

<!-- update 2026-04-18T10:47:25 -->

<!-- update 2026-04-18T16:56:27 -->

<!-- update 2026-04-18T18:13:47 -->

<!-- update 2026-04-18T11:11:52 -->

<!-- update 2026-04-18T14:49:05 -->

<!-- update 2026-04-18T13:10:04 -->

<!-- update 2026-04-18T13:31:40 -->

<!-- update 2026-04-19T14:02:17 -->

<!-- update 2026-04-19T14:48:05 -->

<!-- update 2026-04-19T12:53:08 -->

<!-- update 2026-04-19T17:16:32 -->

<!-- update 2026-04-21T21:36:03 -->

<!-- update 2026-04-21T10:28:34 -->

<!-- update 2026-04-21T16:36:43 -->

<!-- update 2026-04-21T10:09:47 -->

<!-- update 2026-04-21T16:56:18 -->

<!-- update 2026-04-21T19:24:17 -->

<!-- update 2026-04-21T18:36:27 -->

<!-- update 2026-04-21T21:11:14 -->

<!-- update 2026-04-21T17:08:26 -->

<!-- update 2026-04-22T14:04:47 -->

<!-- update 2026-04-23T17:04:04 -->

<!-- update 2026-04-23T15:53:57 -->

<!-- update 2026-04-23T13:25:42 -->

<!-- update 2026-04-29T19:00:30 -->

<!-- update 2026-04-29T09:41:44 -->

<!-- update 2026-04-29T19:14:53 -->

<!-- update 2026-04-29T10:16:41 -->

<!-- update 2026-04-29T12:06:11 -->

<!-- update 2026-04-29T14:33:32 -->

<!-- update 2026-04-29T19:08:56 -->

<!-- update 2026-04-29T10:20:02 -->

<!-- update 2026-04-29T15:21:24 -->

<!-- update 2026-04-29T13:13:43 -->

<!-- update 2026-04-30T19:19:40 -->

<!-- update 2026-04-30T19:00:02 -->

<!-- update 2026-04-30T21:06:02 -->

<!-- update 2026-04-30T16:12:09 -->

<!-- update 2026-04-30T16:36:29 -->

<!-- update 2026-04-30T16:21:19 -->

<!-- update 2026-04-30T17:21:13 -->

<!-- update 2026-04-30T09:35:52 -->

<!-- update 2026-04-30T11:24:09 -->

<!-- update 2026-05-02T11:23:38 -->

<!-- update 2026-05-02T17:04:11 -->

<!-- update 2026-05-02T09:15:16 -->

<!-- update 2026-05-02T21:31:11 -->

<!-- update 2026-05-02T16:51:16 -->

<!-- update 2026-05-02T11:51:13 -->

<!-- update 2026-05-02T18:35:17 -->

<!-- update 2026-05-02T15:25:34 -->

<!-- update 2026-05-02T19:05:26 -->

<!-- update 2026-05-02T21:08:54 -->

<!-- update 2026-05-02T15:28:21 -->

<!-- update 2026-05-03T16:37:17 -->

<!-- update 2026-05-05T13:26:30 -->

<!-- update 2026-05-05T19:20:03 -->

<!-- update 2026-05-05T10:37:44 -->

<!-- update 2026-05-05T12:42:39 -->

<!-- update 2026-05-09T18:00:45 -->

<!-- update 2026-05-09T12:26:47 -->

<!-- update 2026-05-09T18:56:17 -->

<!-- update 2026-05-10T10:18:43 -->

<!-- update 2026-05-10T17:50:39 -->

<!-- update 2026-05-10T11:30:22 -->

<!-- update 2026-05-10T21:00:10 -->

<!-- update 2026-05-10T14:20:15 -->

<!-- update 2026-05-10T16:45:20 -->

<!-- update 2026-05-10T21:41:07 -->

<!-- update 2026-05-10T09:09:57 -->

<!-- update 2026-05-13T16:02:45 -->

<!-- update 2026-05-13T15:46:15 -->

<!-- update 2026-05-13T21:46:25 -->

<!-- update 2026-05-13T21:21:21 -->

<!-- update 2026-05-13T18:38:05 -->

<!-- update 2026-05-14T20:13:54 -->

<!-- update 2026-05-14T10:47:26 -->

<!-- update 2026-05-14T21:23:23 -->

<!-- update 2026-05-14T16:33:54 -->

<!-- update 2026-05-14T21:06:18 -->

<!-- update 2026-05-14T14:44:08 -->

<!-- update 2026-05-14T19:58:21 -->

<!-- update 2026-05-14T14:06:49 -->

<!-- update 2026-05-16T19:31:07 -->

<!-- update 2026-05-16T18:06:00 -->

<!-- update 2026-05-16T09:29:17 -->

<!-- update 2026-05-16T09:31:15 -->

<!-- update 2026-05-16T15:35:24 -->

<!-- update 2026-05-16T15:02:24 -->

<!-- update 2026-05-16T10:42:19 -->

<!-- update 2026-05-17T16:28:49 -->

<!-- update 2026-05-17T18:56:09 -->

<!-- update 2026-05-17T19:35:38 -->

<!-- update 2026-05-17T20:02:51 -->

<!-- update 2026-05-18T13:17:47 -->

<!-- update 2026-05-18T15:04:53 -->

<!-- update 2026-05-18T13:19:39 -->

<!-- update 2026-05-18T11:19:31 -->

<!-- update 2026-05-18T11:41:29 -->

<!-- update 2026-05-18T14:23:06 -->

<!-- update 2026-05-20T20:02:54 -->

<!-- update 2026-05-20T19:13:29 -->

<!-- update 2026-05-20T18:10:51 -->

<!-- update 2026-05-20T21:21:17 -->

<!-- update 2026-05-20T16:51:41 -->

<!-- update 2026-05-20T17:29:25 -->

<!-- update 2026-05-20T18:51:11 -->

<!-- update 2026-05-20T15:19:34 -->

<!-- update 2026-05-20T10:32:56 -->

<!-- update 2026-05-23T14:09:22 -->

<!-- update 2026-05-23T16:45:42 -->

<!-- update 2026-05-23T20:26:06 -->

<!-- update 2026-05-23T13:00:56 -->

<!-- update 2026-05-23T09:05:12 -->

<!-- update 2026-05-23T17:20:41 -->

<!-- update 2026-05-23T18:54:41 -->

<!-- update 2026-05-23T14:31:33 -->

<!-- update 2026-05-23T10:47:54 -->

<!-- update 2026-05-23T16:38:20 -->

<!-- update 2026-05-24T19:51:45 -->

<!-- update 2026-05-24T10:23:34 -->

<!-- update 2026-05-24T19:27:31 -->

<!-- update 2026-05-24T21:26:09 -->

<!-- update 2026-05-24T17:35:36 -->

<!-- update 2026-05-24T12:32:54 -->

<!-- update 2026-05-27T14:39:24 -->

<!-- update 2026-05-27T10:52:10 -->

<!-- update 2026-05-27T20:33:21 -->

<!-- update 2026-05-27T18:14:50 -->

<!-- update 2026-05-27T19:41:56 -->

<!-- update 2026-05-27T15:36:11 -->

<!-- update 2026-05-27T09:54:36 -->

<!-- update 2026-05-27T19:26:53 -->

<!-- update 2026-05-27T15:18:21 -->

<!-- update 2026-05-27T19:26:18 -->

<!-- update 2026-05-28T18:24:35 -->

<!-- update 2026-05-28T10:46:38 -->

<!-- update 2026-05-28T19:49:14 -->

<!-- update 2026-05-28T11:47:00 -->

<!-- update 2026-05-28T12:09:39 -->

<!-- update 2026-05-28T18:09:38 -->

<!-- update 2026-05-28T18:56:53 -->

<!-- update 2026-05-28T10:52:35 -->

<!-- update 2026-05-28T10:12:42 -->

<!-- update 2026-05-28T20:26:15 -->

<!-- update 2026-05-30T19:01:18 -->

<!-- update 2026-05-30T20:38:25 -->

<!-- update 2026-05-30T10:36:08 -->

<!-- update 2026-05-31T12:45:10 -->

<!-- update 2026-05-31T20:03:24 -->

<!-- update 2026-05-31T10:51:22 -->

<!-- update 2026-06-02T20:04:37 -->

<!-- update 2026-06-02T17:30:02 -->

<!-- update 2026-06-02T15:45:52 -->

<!-- update 2026-06-02T11:49:07 -->

<!-- update 2026-06-02T17:00:34 -->

<!-- update 2026-06-02T15:01:53 -->

<!-- update 2026-06-02T10:37:10 -->

<!-- update 2026-06-02T16:07:45 -->

<!-- update 2026-06-02T14:00:58 -->

<!-- update 2026-06-02T17:06:50 -->

<!-- update 2026-06-02T12:24:04 -->

<!-- update 2026-06-03T10:47:22 -->

<!-- update 2026-06-03T19:45:07 -->

<!-- update 2026-06-03T20:18:56 -->

<!-- update 2026-06-03T18:14:53 -->

<!-- update 2026-06-03T19:46:22 -->

<!-- update 2026-06-03T19:11:14 -->

<!-- update 2026-06-03T21:47:21 -->

<!-- update 2026-06-03T19:12:46 -->

<!-- update 2026-06-03T16:36:53 -->

<!-- update 2026-06-03T21:52:54 -->

<!-- update 2026-06-04T12:49:17 -->

<!-- update 2026-06-04T12:16:07 -->

<!-- update 2026-06-04T09:44:43 -->

<!-- update 2026-06-04T10:58:26 -->

<!-- update 2026-06-04T09:47:05 -->

<!-- update 2026-06-06T14:18:19 -->

<!-- update 2026-06-06T11:26:12 -->

<!-- update 2026-06-06T10:58:54 -->

<!-- update 2026-06-06T10:35:55 -->

<!-- update 2026-06-06T12:48:33 -->

<!-- update 2026-06-06T13:57:19 -->

<!-- update 2026-06-06T16:10:38 -->

<!-- update 2026-06-06T18:53:23 -->

<!-- update 2026-06-06T14:42:38 -->

<!-- update 2026-06-06T11:26:09 -->

<!-- update 2026-06-06T09:56:43 -->

<!-- update 2026-06-07T12:37:11 -->

<!-- update 2026-06-07T10:15:20 -->

<!-- update 2026-06-07T16:30:33 -->

<!-- update 2026-06-07T13:05:51 -->

<!-- update 2026-06-07T17:39:27 -->

<!-- update 2026-06-07T16:47:04 -->

<!-- update 2026-06-07T13:41:52 -->

<!-- update 2026-06-07T14:33:11 -->

<!-- update 2026-06-09T21:53:12 -->

<!-- update 2026-06-09T12:56:47 -->

<!-- update 2026-06-09T20:05:41 -->

<!-- update 2026-06-09T15:22:24 -->

<!-- update 2026-06-09T17:28:21 -->

<!-- update 2026-06-09T17:08:25 -->

<!-- update 2026-06-09T16:48:19 -->

<!-- update 2026-06-09T15:14:31 -->

<!-- update 2026-06-09T12:29:35 -->

<!-- update 2026-06-09T12:53:26 -->

<!-- update 2026-06-10T12:40:55 -->

<!-- update 2026-06-10T14:52:35 -->

<!-- update 2026-06-10T18:20:19 -->

<!-- update 2026-06-10T16:08:02 -->

<!-- update 2026-06-10T16:39:11 -->

<!-- update 2026-06-13T21:01:57 -->

<!-- update 2026-06-13T11:58:07 -->

<!-- update 2026-06-13T12:48:28 -->

<!-- update 2026-06-14T18:55:18 -->

<!-- update 2026-06-14T11:13:09 -->

<!-- update 2026-06-14T16:57:08 -->

<!-- update 2026-06-14T17:33:34 -->

<!-- update 2026-06-14T14:23:32 -->
