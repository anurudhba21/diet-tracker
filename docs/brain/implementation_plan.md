# Implementation Plan - Simplified Page Architecture

## Overview
Refactor the app into three distinct, focused pages that handle both recording and history within the same view.

## Proposed Changes

### 1. Navigation & Routing (`src/App.jsx`) [MODIFY]
- **Simplify Nav**: Rename tabs to **"Meals"**, **"Workouts"**, and **"Progress"**.
- **Remove** the standalone "History" tab.
- Routes:
  - `/` -> `MealPage`
  - `/workouts` -> `WorkoutPage`
  - `/progress` -> `ProgressPage` (formerly `AnalyticsDashboard`)

### 2. Page 1: Meals (`src/components/MealPage.jsx`) [NEW/RENAME]
- Rename `DailyEntry.jsx` to `MealPage.jsx`.
- **Integrated History**: Keep the date picker at the top to allow users to quickly switch dates and see/edit past food or weight data.
- Ensure all food data (Breakfast, Lunch, Dinner, Snacks) and Weight/Wait/Habits are captured here.

### 3. Page 2: Workouts (`src/components/workouts/WorkoutPage.jsx`) [MODIFY]
- **Flexible Entry**: Allow users to pick an exercise from their routine even if it's not scheduled for the current day.
- **Save Persistence**: Explicit "Save Session" button to persist data for the selected date.
- **Integrated History**: Date picker allows users to scroll back and see/edit previous data.

### 4. Page 3: Progress (`src/components/analytics/ProgressPage.jsx`) [MODIFY]
- **Segmented View**: Replace current 4 tabs with two primary categories: **"Meals & Weight"** and **"Workouts"**.
- **Tab 1: Meals & Weight**:
  - `WeightChart` (7-day and full history).
  - `GoalPieChart`, `PredictionCard`, `BMICard`.
  - `HabitImpactCard` & `HabitStats`.
  - `AchievementsCard` & `ExportButton`.
- **Tab 2: Workouts**:
  - `WorkoutStats` (Training Volume & Performance trends).
  - `StreakCard` (Workout consistency).
  - `CalendarHeatmap` (Activity visualization).
  - AI Advisor specifically for training.

### 5. Workout Session Summary View [NEW]
- Implement a summary view for workout sessions in `WorkoutPage.jsx`, mirroring the nutrition "Day Summary".
- **Features**:
    - Large green checkmark.
    - "Session Summary" title.
    - Stats: Exercises count, Total Sets, Total Volume (Weight × Reps).
    - "Great Workout!" badge.
    - Toggle between summary and edit view.

## UI Polish & Layout Fixes

### GoalPieChart Sizing & Legend
- **Problem**: Chart is too large for its container in the 2-column grid, causing the Legend to overlap the chart area.
- **Fix**: Reduce pie radii and ensure parent container has a defined height.
- **Files**: [GoalPieChart.jsx](file:///c:/Users/anuru/.gemini/antigravity/scratch/diet-tracker-mvp/src/components/analytics/GoalPieChart.jsx), [ProgressPage.jsx](file:///c:/Users/anuru/.gemini/antigravity/scratch/diet-tracker-mvp/src/components/analytics/ProgressPage.jsx)

### BMICard Layout
- **Problem**: Score and Category tag overlap in narrow view.
- **Fix**: Adjust flex layout to ensure readability.
- **Files**: [BMICard.jsx](file:///c:/Users/anuru/.gemini/antigravity/scratch/diet-tracker-mvp/src/components/analytics/BMICard.jsx)

## Verification Plan
- [ ] Toggle between "Meals & Weight" and "Workouts" tabs.
- [ ] Verify that weight-related charts stay in the Meals section.
- [ ] Verify that training volume charts are prominent in the Workouts section.
- [ ] Log a workout for today -> Go back to yesterday's date -> Verify data is different and persistent.
- [ ] Log a meal -> Switch dates -> Verify persistence.
- [ ] Check if the 3-tab navigation works seamlessly.
