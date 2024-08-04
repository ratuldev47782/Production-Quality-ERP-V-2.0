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
<!-- update 2026-03-23T10:00:12 -->

<!-- update 2026-03-23T18:20:29 -->

<!-- update 2026-03-23T15:20:39 -->

<!-- update 2026-03-23T17:27:44 -->

<!-- update 2026-03-23T10:55:10 -->

<!-- update 2026-03-23T17:49:17 -->

<!-- update 2026-03-23T17:20:01 -->

<!-- update 2026-03-23T10:24:41 -->

<!-- update 2026-03-23T15:50:06 -->

<!-- update 2026-03-23T10:16:40 -->

<!-- update 2026-03-24T15:58:55 -->

<!-- update 2026-03-24T12:43:51 -->

<!-- update 2026-03-24T11:19:43 -->

<!-- update 2026-03-24T17:16:38 -->

<!-- update 2026-03-24T19:51:15 -->

<!-- update 2026-03-24T18:57:26 -->

<!-- update 2026-03-24T14:21:55 -->

<!-- update 2026-03-24T19:15:21 -->

<!-- update 2026-03-24T09:51:25 -->

<!-- update 2026-03-24T16:58:00 -->

<!-- update 2026-03-24T20:49:04 -->

<!-- update 2026-03-25T13:25:11 -->

<!-- update 2026-03-25T18:14:50 -->

<!-- update 2026-03-25T20:49:02 -->

<!-- update 2026-03-25T13:07:33 -->

<!-- update 2026-03-25T17:09:44 -->

<!-- update 2026-03-25T17:45:34 -->

<!-- update 2026-03-25T17:21:57 -->

<!-- update 2026-03-25T16:35:09 -->

<!-- update 2026-03-25T18:26:38 -->

<!-- update 2026-03-25T20:40:51 -->

<!-- update 2026-03-25T14:40:33 -->

<!-- update 2026-03-25T16:00:56 -->

<!-- update 2026-03-26T14:02:26 -->

<!-- update 2026-03-26T14:49:29 -->

<!-- update 2026-03-26T20:34:39 -->

<!-- update 2026-03-26T18:26:56 -->

<!-- update 2026-03-26T09:24:56 -->

<!-- update 2026-03-26T17:17:02 -->

<!-- update 2026-03-26T19:09:29 -->

<!-- update 2026-03-26T19:53:30 -->

<!-- update 2026-03-26T15:52:45 -->

<!-- update 2026-03-26T09:34:04 -->

<!-- update 2026-03-27T19:33:39 -->

<!-- update 2026-03-27T17:10:53 -->

<!-- update 2026-03-27T14:44:47 -->

<!-- update 2026-03-27T12:36:23 -->

<!-- update 2026-03-27T20:04:14 -->

<!-- update 2026-03-27T21:58:26 -->

<!-- update 2026-03-27T10:06:09 -->

<!-- update 2026-03-27T19:49:01 -->

<!-- update 2026-03-27T18:44:55 -->

<!-- update 2026-03-27T17:46:03 -->

<!-- update 2026-03-27T14:04:06 -->

<!-- update 2026-03-27T21:24:40 -->

<!-- update 2026-03-27T21:45:52 -->

<!-- update 2026-03-27T10:16:54 -->

<!-- update 2026-03-28T17:11:39 -->

<!-- update 2026-03-28T20:06:35 -->

<!-- update 2026-03-28T18:26:42 -->

<!-- update 2026-03-28T20:51:35 -->

<!-- update 2026-03-28T16:04:18 -->

<!-- update 2026-03-28T16:30:22 -->

<!-- update 2026-03-28T17:30:16 -->

<!-- update 2026-03-28T16:06:15 -->

<!-- update 2026-03-28T13:05:53 -->

<!-- update 2026-03-28T18:06:33 -->

<!-- update 2026-03-28T16:14:11 -->

<!-- update 2026-06-02T14:19:50 -->

<!-- update 2026-06-02T17:20:15 -->

<!-- update 2026-06-02T12:32:04 -->

<!-- update 2026-06-02T12:50:23 -->

<!-- update 2026-06-02T15:40:47 -->

<!-- update 2026-06-02T11:29:11 -->

<!-- update 2026-06-02T16:33:51 -->

<!-- update 2026-06-02T14:10:58 -->

<!-- update 2026-06-02T19:44:25 -->

<!-- update 2026-06-02T10:14:20 -->

<!-- update 2026-06-02T15:18:41 -->

<!-- update 2026-06-02T10:35:27 -->

<!-- update 2026-06-02T10:07:48 -->

<!-- update 2026-06-03T12:26:36 -->

<!-- update 2026-06-03T09:01:50 -->

<!-- update 2026-06-03T16:53:48 -->

<!-- update 2026-06-03T14:52:19 -->

<!-- update 2026-06-03T20:30:52 -->

<!-- update 2026-06-03T14:11:19 -->

<!-- update 2026-06-03T09:52:05 -->

<!-- update 2026-06-03T21:21:07 -->

<!-- update 2026-06-03T18:31:37 -->

<!-- update 2026-06-03T17:21:55 -->

<!-- update 2026-06-04T13:25:06 -->

<!-- update 2026-06-04T13:41:40 -->

<!-- update 2026-06-04T18:55:12 -->

<!-- update 2026-06-04T17:20:14 -->

<!-- update 2026-06-04T12:14:49 -->

<!-- update 2026-06-04T10:23:35 -->

<!-- update 2026-06-04T21:36:00 -->

<!-- update 2026-06-04T12:54:00 -->

<!-- update 2026-06-04T10:22:06 -->

<!-- update 2026-06-04T13:02:12 -->

<!-- update 2026-06-04T09:19:01 -->

<!-- update 2026-06-04T21:35:29 -->

<!-- update 2026-06-04T17:05:13 -->

<!-- update 2026-06-04T11:24:38 -->

<!-- update 2024-08-02T20:38:20 -->

<!-- update 2024-08-02T14:11:50 -->

<!-- update 2024-08-02T17:22:55 -->

<!-- update 2024-08-02T17:27:07 -->

<!-- update 2024-08-02T19:27:04 -->

<!-- update 2024-08-02T13:08:34 -->

<!-- update 2024-08-02T15:00:14 -->

<!-- update 2024-08-02T19:54:03 -->

<!-- update 2024-08-02T17:40:44 -->

<!-- update 2024-08-02T09:02:00 -->

<!-- update 2024-08-02T09:14:27 -->

<!-- update 2024-08-02T14:35:17 -->

<!-- update 2024-08-02T17:45:39 -->

<!-- update 2024-08-02T19:32:42 -->

<!-- update 2024-08-03T19:33:49 -->

<!-- update 2024-08-03T12:24:53 -->

<!-- update 2024-08-03T21:28:34 -->

<!-- update 2024-08-03T21:10:04 -->

<!-- update 2024-08-03T09:02:12 -->

<!-- update 2024-08-03T10:48:18 -->

<!-- update 2024-08-03T20:14:53 -->

<!-- update 2024-08-03T13:33:48 -->

<!-- update 2024-08-03T16:38:13 -->

<!-- update 2024-08-03T10:18:58 -->

<!-- update 2024-08-03T09:11:07 -->

<!-- update 2024-08-03T17:44:21 -->

<!-- update 2024-08-04T21:30:04 -->

<!-- update 2024-08-04T17:51:42 -->

<!-- update 2024-08-04T12:08:49 -->

<!-- update 2024-08-04T18:39:21 -->

<!-- update 2024-08-04T14:22:25 -->

<!-- update 2024-08-04T15:56:40 -->

<!-- update 2024-08-04T14:20:15 -->

<!-- update 2024-08-04T12:26:14 -->

<!-- update 2024-08-04T09:40:53 -->

<!-- update 2024-08-04T14:43:13 -->

<!-- update 2024-08-04T13:36:28 -->

<!-- update 2024-08-04T20:42:52 -->
