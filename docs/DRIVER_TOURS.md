# Driver.js Guided Tours - SIG Hire

This document explains the implementation of interactive guided tours across all SIG Hire pages using Driver.js.

## Overview

Driver.js provides step-by-step guided tours to help users understand and navigate the SIG Hire application. Each page has its own customized tour that highlights key features and functionality.

## Files Structure

```
/lib/driver-config.ts          # Tour configurations for all pages
/hooks/useDriverGuide.ts       # Custom React hook for managing tours
/components/ui/guide-button.tsx # Reusable guide button component
/app/globals.css               # Custom Driver.js styling
```

## Implementation

### 1. Tour Configuration (`/lib/driver-config.ts`)

Defines tour steps for each page:
- `sessionsGuide` - Job ranking sessions overview
- `uploadsGuide` - File upload process
- `rankingsGuide` - Candidate rankings and bot
- `assignmentsGuide` - Assignment creation
- `evaluationsGuide` - Submission evaluation
- `insightsGuide` - Analytics dashboard

### 2. Custom Hook (`/hooks/useDriverGuide.ts`)

```typescript
const { startTour, resetTour, hasShown } = useDriverGuide(
  "pageName",      // Unique identifier for the page
  tourSteps,       // Array of DriveStep objects
  autoStart        // Optional: auto-start on first visit
);
```

Features:
- Automatic tour on first visit (if `autoStart = true`)
- LocalStorage persistence (won't show again after completion)
- Manual trigger via `startTour()`
- Reset capability via `resetTour()`

### 3. Usage in Components

#### Basic Implementation:

```tsx
import { useDriverGuide } from "@/hooks/useDriverGuide";
import { sessionsGuide } from "@/lib/driver-config";

function MyComponent() {
  const { startTour } = useDriverGuide("sessions", sessionsGuide, true);
  
  return (
    <div>
      <button onClick={startTour}>Start Guide</button>
      <div data-tour="step-1">Content</div>
    </div>
  );
}
```

## Pages with Guides

### ✅ Sessions Page (`/sig-hire/sessions`)
- Overview of sessions dashboard
- New session creation
- Session card details

### ✅ Uploads Page (`/sig-hire/uploads`)
- Job description upload
- Resume upload process

### ✅ Rankings Page (`/sig-hire/rankings`)
- Candidate rankings list
- Ranking bot interaction

### ✅ Assignments Page (`/sig-hire/assignments`)
- Assignment form
- Candidate selection

### ✅ Evaluations Page (`/sig-hire/evaluations`)
- Evaluation dashboard overview

### ✅ Insights Page (`/sig-hire/insights`)
- Analytics metrics

## Customization

### Adding New Tours

1. Define tour steps in `/lib/driver-config.ts`
2. Use the hook in your component
3. Add data-tour attributes to elements

## LocalStorage Keys

Tours use the pattern: `driver-tour-{pageName}`

## Resetting Tours

```typescript
const { resetTour } = useDriverGuide("pageName", steps);
resetTour();
```
