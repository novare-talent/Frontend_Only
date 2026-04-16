import { driver, DriveStep, Config } from "driver.js";
import "driver.js/dist/driver.css";
import "@/app/tour-styles.css";

const baseConfig: Config = {
  showProgress: true,
  showButtons: ["next", "previous", "close"],
  progressText: "{{current}} of {{total}}",
  nextBtnText: "Next",
  prevBtnText: "Previous",
  doneBtnText: "Done",
};

export const sessionsGuide: DriveStep[] = [
  {
    popover: {
      title: "Job Ranking Sessions",
      description: "This is your sessions dashboard where you can manage all your candidate ranking sessions.",
    },
  },
  {
    element: "[data-tour='new-session-btn']",
    popover: {
      title: "Create New Session",
      description: "Click here to start a new ranking session for a job position.",
      side: "bottom",
    },
  },
  {
    element: "[data-tour='session-card']",
    popover: {
      title: "Session Cards",
      description: "Each card shows job name, status, candidates count, and workflow progress. Click on any card to continue where you left off.",
      side: "top",
    },
  },
];

export const uploadsGuide: DriveStep[] = [
  {
    popover: {
      title: "Welcome to Uploads",
      description: "Here you'll upload job descriptions and candidate information to start the ranking process.",
    },
  },
  {
    element: "[data-tour='job-upload']",
    popover: {
      title: "Job Description",
      description: "Write or upload your job description. You can paste text directly or upload a PDF/DOC file.",
      side: "right",
    },
  },
  {
    element: "[data-tour='resume-upload']",
    popover: {
      title: "Candidates Data",
      description: "Paste CSV data or upload a CSV file with candidate information (name, email, resume_url, etc.).",
      side: "left",
    },
  },
];

export const rankingsGuide: DriveStep[] = [
  {
    popover: {
      title: "Rankings Dashboard",
      description: "View AI-powered candidate rankings based on job requirements and custom queries.",
    },
  },
  {
    element: "[data-tour='rankings-list']",
    popover: {
      title: "Candidate Rankings",
      description: "Candidates are ranked by match score. Select candidates to send assignments, or click to view detailed analysis.",
      side: "top",
    },
  },
  {
    element: "[data-tour='ranking-bot']",
    popover: {
      title: "Ranking Bot",
      description: "Ask questions about candidates or request custom rankings using natural language. The bot will analyze and re-rank candidates based on your queries.",
      side: "left",
    },
  },
];

export const assignmentsGuide: DriveStep[] = [
  {
    popover: {
      title: "Assignments",
      description: "Create and send technical assignments to your selected candidates.",
    },
  },
];

export const evaluationsGuide: DriveStep[] = [
  {
    popover: {
      title: "Evaluations Dashboard",
      description: "Review and evaluate candidate assignment submissions with AI-powered analysis.",
    },
  },
];

export const insightsGuide: DriveStep[] = [
  {
    popover: {
      title: "Insights & Analytics",
      description: "Advanced analytics and insights are coming soon. Track your hiring performance with comprehensive metrics.",
    },
  },
];

export const homeGuide: DriveStep[] = [
  {
    popover: {
      title: "Welcome to SigHyre",
      description: "Your AI-powered hiring assistant. Let's explore the navigation and key features.",
    },
  },
  {
    element: "[data-tour='nav-home']",
    popover: {
      title: "Home",
      description: "Return to the main landing page with product overview and features.",
      side: "bottom",
    },
  },
  {
    element: "[data-tour='nav-sessions']",
    popover: {
      title: "Sessions",
      description: "View and manage all your job ranking sessions. Each session tracks a complete hiring workflow from upload to evaluation.",
      side: "bottom",
    },
  },
  {
    element: "[data-tour='nav-insights']",
    popover: {
      title: "Insights",
      description: "Access analytics and insights about your hiring performance (coming soon).",
      side: "bottom",
    },
  },
  {
    element: "[data-tour='start-hiring-btn']",
    popover: {
      title: "Start Hiring",
      description: "Click here to create a new session and begin the AI-powered candidate ranking process.",
      side: "left",
    },
  },
];

export function createDriver(steps: DriveStep[]) {
  return driver({
    ...baseConfig,
    steps,
  });
}
