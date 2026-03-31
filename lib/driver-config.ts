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
    element: "h1",
    popover: {
      title: "Job Ranking Sessions",
      description: "This is your sessions dashboard where you can manage all your candidate ranking sessions.",
      side: "bottom",
      align: "start",
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
      description: "Each card represents a ranking session with job details, candidate count, and status.",
      side: "top",
    },
  },
];

export const uploadsGuide: DriveStep[] = [
  {
    popover: {
      title: "Welcome to Uploads",
      description: "Here you'll upload job descriptions and candidate resumes to start the ranking process.",
    },
  },
  {
    element: "[data-tour='job-upload']",
    popover: {
      title: "Upload Job Description",
      description: "Start by uploading the job description. This helps our AI understand the requirements.",
      side: "right",
    },
  },
  {
    element: "[data-tour='resume-upload']",
    popover: {
      title: "Upload Resumes",
      description: "Upload candidate resumes in PDF format. You can upload multiple files at once.",
      side: "left",
    },
  },
];

export const rankingsGuide: DriveStep[] = [
  {
    popover: {
      title: "Rankings Dashboard",
      description: "View AI-powered candidate rankings based on job requirements and resume analysis.",
    },
  },
  {
    element: "[data-tour='rankings-list']",
    popover: {
      title: "Candidate Rankings",
      description: "Candidates are ranked by match score. Click on any candidate to view detailed analysis.",
      side: "right",
    },
  },
  {
    element: "[data-tour='ranking-bot']",
    popover: {
      title: "Ranking Bot",
      description: "Ask questions about candidates or request custom rankings using natural language.",
      side: "left",
    },
  },
];

export const assignmentsGuide: DriveStep[] = [
  {
    popover: {
      title: "Assignments",
      description: "Create and manage technical assignments for your candidates.",
    },
  },
  {
    element: "[data-tour='assignment-form']",
    popover: {
      title: "Assignment Details",
      description: "Fill in the assignment details including title, description, and deadline.",
      side: "top",
    },
  },
  {
    element: "[data-tour='candidate-select']",
    popover: {
      title: "Select Candidates",
      description: "Choose which candidates should receive this assignment.",
      side: "bottom",
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
      description: "Track your hiring performance with comprehensive analytics and metrics.",
    },
  },
  {
    element: "[data-tour='stats-grid']",
    popover: {
      title: "Key Metrics",
      description: "Monitor important hiring metrics like total candidates, success rate, and average scores.",
      side: "bottom",
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
      description: "View and manage all your job ranking sessions in one place.",
      side: "bottom",
    },
  },
  {
    element: "[data-tour='nav-uploads']",
    popover: {
      title: "Uploads",
      description: "Upload job descriptions and candidate resumes to start the AI ranking process.",
      side: "bottom",
    },
  },
  {
    element: "[data-tour='nav-rankings']",
    popover: {
      title: "Rankings",
      description: "View AI-powered candidate rankings with detailed match scores and analysis.",
      side: "bottom",
    },
  },
  {
    element: "[data-tour='nav-assignments']",
    popover: {
      title: "Assignments",
      description: "Create and send technical assignments to shortlisted candidates.",
      side: "bottom",
    },
  },
  {
    element: "[data-tour='nav-evaluations']",
    popover: {
      title: "Evaluations",
      description: "Review and evaluate candidate assignment submissions with AI assistance.",
      side: "bottom",
    },
  },
  {
    element: "[data-tour='nav-insights']",
    popover: {
      title: "Insights",
      description: "Access analytics and insights about your hiring performance and trends.",
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
