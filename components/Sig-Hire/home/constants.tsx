import { Brain, CheckCircle, AlertTriangle, Shield, BarChart3, FileText, Zap, TrendingUp, Users, Clock, Upload } from "lucide-react";

export const MOCK_CANDIDATES = [
  { name: "Arjun M.", score: 94, tag: "Strong fit", color: "#22c55e" },
  { name: "Priya S.", score: 87, tag: "Good fit",   color: "#a78bfa" },
  { name: "Rohan D.", score: 71, tag: "Review",      color: "#f59e0b" },
];

export const STATS = [
  { value: "10x",   label: "Faster Shortlisting",   icon: <Zap className="w-4 h-4" /> },
  { value: "94%",   label: "Accuracy Rate",          icon: <TrendingUp className="w-4 h-4" /> },
  { value: "500+",  label: "Teams Trust Sighyre",    icon: <Users className="w-4 h-4" /> },
  { value: "3 min", label: "Average Analysis Time",  icon: <Clock className="w-4 h-4" /> },
];

export const FEATURES = [
  {
    icon: <Brain className="w-6 h-6" />,
    title: "AI Ranking Engine",
    desc: "Automatically rank every candidate on skills, experience depth, and role alignment — with transparent scoring breakdowns.",
    gradient: "from-violet-500/20 to-purple-600/10",
    border: "rgba(139,92,246,0.3)",
    glow: "rgba(139,92,246,0.15)",
  },
  {
    icon: <CheckCircle className="w-6 h-6" />,
    title: "Skill Fit Analysis",
    desc: "Granular breakdowns of what each candidate brings vs. what your role demands — no more resume guesswork.",
    gradient: "from-indigo-500/20 to-blue-600/10",
    border: "rgba(99,102,241,0.3)",
    glow: "rgba(99,102,241,0.15)",
  },
  {
    icon: <AlertTriangle className="w-6 h-6" />,
    title: "Risk Detection",
    desc: "Surface employment gaps, inconsistencies, and red flags before they become expensive hiring mistakes.",
    gradient: "from-amber-500/20 to-orange-600/10",
    border: "rgba(245,158,11,0.3)",
    glow: "rgba(245,158,11,0.15)",
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: "Bias Reduction",
    desc: "Standardized, criteria-based evaluation that removes unconscious bias from your first-pass screening.",
    gradient: "from-emerald-500/20 to-teal-600/10",
    border: "rgba(16,185,129,0.3)",
    glow: "rgba(16,185,129,0.15)",
  },
  {
    icon: <BarChart3 className="w-6 h-6" />,
    title: "Comparative Insights",
    desc: "Side-by-side candidate comparisons with detailed score rationale so your team is always aligned.",
    gradient: "from-pink-500/20 to-rose-600/10",
    border: "rgba(236,72,153,0.3)",
    glow: "rgba(236,72,153,0.15)",
  },
  {
    icon: <FileText className="w-6 h-6" />,
    title: "Shareable Reports",
    desc: "Export clean, professional reports for every session — easy to share with hiring managers or stakeholders.",
    gradient: "from-sky-500/20 to-cyan-600/10",
    border: "rgba(14,165,233,0.3)",
    glow: "rgba(14,165,233,0.15)",
  },
];

export const STEPS = [
  {
    number: "01",
    icon: <Upload className="w-5 h-5" />,
    title: "Upload Resumes",
    desc: "Drag and drop PDF or Word resumes. Batch upload up to 100 candidates at once.",
  },
  {
    number: "02",
    icon: <Brain className="w-5 h-5" />,
    title: "AI Analysis",
    desc: "Our engine parses, understands, and cross-references each resume against your job criteria.",
  },
  {
    number: "03",
    icon: <BarChart3 className="w-5 h-5" />,
    title: "Ranked Results",
    desc: "Receive a scored, ranked shortlist with full transparency on why each candidate placed where they did.",
  },
  {
    number: "04",
    icon: <CheckCircle className="w-5 h-5" />,
    title: "Hire Confidently",
    desc: "Make data-backed decisions. Share findings with your team and move quickly on top talent.",
  },
];

export const TESTIMONIALS = [
  {
    quote: "We cut first-round screening from 3 days to 45 minutes. The risk flags alone saved us from two bad hires.",
    author: "Meera K.",
    role: "Head of Talent, FinTech Startup",
    rating: 5,
  },
  {
    quote: "The skill fit breakdown is incredibly precise. Our hiring managers actually trust the AI output now.",
    author: "Vikram S.",
    role: "VP Engineering, SaaS Scale-up",
    rating: 5,
  },
  {
    quote: "Finally, a tool that explains its reasoning. We know exactly why a candidate scored 91 vs 73.",
    author: "Ananya R.",
    role: "Recruitment Lead, E-commerce",
    rating: 5,
  },
];
