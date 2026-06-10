const SB_BASE = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/training`;
const sbPdf = (file: string) => `${SB_BASE}/pdfs/${encodeURIComponent(file)}`;
const sbImg = (file: string) => `${SB_BASE}/images/${encodeURIComponent(file)}`;

export type BlogPost = {
  id: string;
  title: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  imageUrl: string;
  pdfUrl: string | null;
  readTime: string;
  summary: string;
  whatYouLearn: string[];
  sections: { heading: string; body: string }[];
  keyTools: string[];
};

export const allBlogs: BlogPost[] = [
  {
    id: "AI_ML_Engineer",
    title: "AI ML Engineer",
    level: "Beginner",
    imageUrl: "/Training/Images/AI ML Engineer.png",
    pdfUrl: "/Training/AI_ML_ENGINEER.pdf",
    readTime: "10 min read",
    summary:
      "Artificial Intelligence and Machine Learning engineering is one of the fastest-growing disciplines in tech. From building recommendation engines to training large language models, AI/ML Engineers are shaping every industry on the planet.",
    whatYouLearn: [
      "Core concepts of supervised, unsupervised, and reinforcement learning",
      "How to design and train neural networks using Python frameworks",
      "Model evaluation, hyperparameter tuning, and avoiding overfitting",
      "Deploying ML models into production APIs",
      "Responsible AI practices and bias mitigation",
      "Career paths from junior ML engineer to research scientist",
    ],
    sections: [
      {
        heading: "What is an AI/ML Engineer?",
        body: "An AI/ML Engineer sits at the intersection of software engineering and data science. Unlike a pure data scientist who focuses on analysis and insight, an AI/ML engineer is responsible for taking models from prototype to production — writing clean, scalable code that powers real products used by millions.\n\nThey build the data pipelines that feed training jobs, architect the models themselves, and then deploy those models as reliable microservices. Think of the autocomplete suggestions in your email, the fraud detection on your credit card, or the voice assistant on your phone — all of these are powered by the work of AI/ML engineers.",
      },
      {
        heading: "Key Responsibilities",
        body: "Day-to-day, you might be collecting and cleaning large datasets, writing training scripts in PyTorch or TensorFlow, running experiments tracked in MLflow or Weights & Biases, and collaborating with product managers to align model performance with business goals.\n\nYou will also spend significant time on model evaluation — not just looking at accuracy, but measuring precision, recall, F1 scores, and business-specific metrics. Once a model is ready, you will package it into a Docker container, expose it via a REST or gRPC API, and monitor it in production for data drift and performance degradation.",
      },
      {
        heading: "Essential Skills to Build",
        body: "The foundation is strong Python programming and a solid grasp of linear algebra, calculus, probability, and statistics. On top of that, you need hands-on experience with at least one major ML framework (PyTorch is currently dominant in research; TensorFlow/Keras is common in production). SQL is a must for data wrangling, and cloud platforms like AWS SageMaker or Google Vertex AI are increasingly the deployment target of choice.\n\nBeyond the technical stack, communication is critical. You need to explain model tradeoffs and limitations to non-technical stakeholders and write clear experiment reports that other engineers can reproduce.",
      },
      {
        heading: "Career Outlook",
        body: "AI/ML Engineering roles are among the highest-compensated positions in the tech industry globally. In India, entry-level roles at product companies start at ₹12–18 LPA, while experienced engineers at unicorns or MNCs can command ₹40–80 LPA.\n\nCareer progression typically looks like: Junior ML Engineer → ML Engineer → Senior ML Engineer → Staff / Principal ML Engineer → ML Manager or Applied Research Scientist. Specializations include NLP, Computer Vision, Reinforcement Learning, and Recommendation Systems.",
      },
      {
        heading: "How to Get Started",
        body: "Start with Andrew Ng's Machine Learning Specialization on Coursera to build a solid theoretical base. Then move to the fast.ai Practical Deep Learning course for hands-on intuition. Build at least two end-to-end projects — a classification or regression task and something more creative like an image generator or a chatbot — and host them on GitHub with clear READMEs.\n\nEnter Kaggle competitions to benchmark your skills against peers, and contribute to open-source ML libraries to build a public profile. The PDF resource below covers all of this in structured detail.",
      },
    ],
    keyTools: ["Python", "PyTorch", "TensorFlow", "scikit-learn", "MLflow", "Docker", "AWS SageMaker", "SQL"],
  },

  {
    id: "Chief_of_Staff_Resources",
    title: "Chief of Staff",
    level: "Beginner",
    imageUrl: "/Training/Images/Chief of staff.png",
    pdfUrl: "/Training/Chief_of_Staff_Resources.pdf",
    readTime: "9 min read",
    summary:
      "The Chief of Staff (CoS) is one of the most strategic and demanding roles in a modern organization. Acting as the right hand of a CEO or C-suite executive, the CoS operates across every function of the business, driving alignment, execution, and cross-functional strategy.",
    whatYouLearn: [
      "The scope and mandate of a Chief of Staff across startup and enterprise contexts",
      "How to run leadership meetings, OKRs, and executive communications",
      "Managing strategic projects from inception to completion",
      "Building operating cadences and information flows",
      "How to influence without authority across departments",
      "Transitioning from a CoS role into a senior line role",
    ],
    sections: [
      {
        heading: "The Chief of Staff Role Explained",
        body: "The Chief of Staff is a force multiplier for the executive they support. In a startup, that typically means the founder or CEO. In a large enterprise, it may be a divisional president or the CTO. The CoS does not manage a specific product, team, or P&L by default — instead, they manage the most important priorities that cut across all of them.\n\nThis could mean facilitating board prep, leading a strategic initiative into a new market, resolving a cross-functional deadlock, or drafting internal communications for sensitive organizational changes. The role is defined less by a job description and more by whatever the executive most needs in this moment.",
      },
      {
        heading: "Core Responsibilities",
        body: "A Chief of Staff typically owns the internal operating system: weekly leadership syncs, quarterly business reviews, OKR processes, and strategic planning cycles. They ensure the CEO's time is allocated to the highest-leverage activities and that key decisions don't get stuck in organizational limbo.\n\nBeyond process, the CoS is often a trusted thought partner for the executive — helping them stress-test ideas, synthesize information from across the org, write investor updates, prepare board decks, and communicate major decisions internally. In early-stage startups, they may also be directly hands-on in recruiting, fundraising operations, or product strategy.",
      },
      {
        heading: "What Makes a Great Chief of Staff?",
        body: "The best Chiefs of Staff combine sharp analytical ability with exceptional interpersonal skills. They can build a financial model in the morning, facilitate a tense leadership discussion at noon, and draft a company all-hands deck by evening. They are structured thinkers who also know when to cut through process and move fast.\n\nIntegrity and discretion are non-negotiable — the CoS is often privy to the most sensitive information in the company. They must be trusted completely. Intellectual humility is equally important: the job is to make the executive and the company succeed, not to own the spotlight.",
      },
      {
        heading: "Career Path and Trajectory",
        body: "The CoS role is intentionally transitional. Most people spend 18–36 months in the role before moving into a line leadership position: Head of Strategy, VP of Operations, or even a CEO role at a subsidiary. The experience is extraordinarily compressing — you see how an entire company operates from the most senior vantage point.\n\nIn the Indian startup ecosystem, CoS roles are in high demand at Series A and B companies. They typically pay ₹10–20 LPA for early-career professionals, with significant equity upside if the company grows.",
      },
    ],
    keyTools: ["OKR Frameworks", "Notion", "Slide Decks", "Financial Modelling", "Stakeholder Management", "Strategic Planning", "Executive Communication"],
  },

  {
    id: "Cloud_Engineer",
    title: "Cloud Engineer",
    level: "Intermediate",
    imageUrl: "/Training/Images/Cloud engineer.png",
    pdfUrl: "/Training/Cloud_Engineer.pdf",
    readTime: "11 min read",
    summary:
      "Cloud Engineers design, build, and maintain the infrastructure that powers modern software — from global CDNs to serverless functions to Kubernetes clusters. As every business moves to the cloud, this role has become foundational to the entire software industry.",
    whatYouLearn: [
      "Core services across AWS, Azure, and Google Cloud Platform",
      "Infrastructure as Code with Terraform and AWS CloudFormation",
      "Container orchestration with Kubernetes and Docker",
      "Cloud networking, security groups, VPCs, and IAM policies",
      "Cost optimization and cloud FinOps practices",
      "Architecting for high availability, scalability, and disaster recovery",
    ],
    sections: [
      {
        heading: "What Does a Cloud Engineer Do?",
        body: "Cloud Engineers are the architects and operators of the digital infrastructure that runs modern applications. They translate business requirements into cloud architecture decisions — choosing between EC2 instances and Lambda functions, designing multi-region data replication strategies, or building CI/CD pipelines on managed Kubernetes services.\n\nUnlike traditional sysadmins, cloud engineers work primarily with code. Infrastructure as Code (IaC) tools like Terraform let them define entire data centers in version-controlled configuration files, making infrastructure reproducible and auditable.",
      },
      {
        heading: "Major Cloud Platforms",
        body: "AWS holds roughly 32% of the cloud market and is the default choice at most startups and enterprises. Its breadth of services — over 200 at last count — means there is an AWS solution for virtually every infrastructure need. Azure is strong in enterprise and Microsoft-stack shops. GCP is particularly compelling for data-heavy and AI/ML workloads given Google's strengths in those areas.\n\nA strong cloud engineer typically specializes in one platform deeply while maintaining working knowledge of the others. AWS certifications (Solutions Architect, Developer, SysOps) are widely recognized and valued in the job market.",
      },
      {
        heading: "Critical Skills and Concepts",
        body: "Networking fundamentals are the bedrock: VPCs, subnets, security groups, load balancers, and DNS. Without understanding these, you cannot design a secure and performant cloud architecture. IAM (Identity and Access Management) is equally critical — a misconfigured IAM policy is one of the most common sources of cloud security breaches.\n\nOn the engineering side, Docker and Kubernetes are nearly universal. Most production deployments today are containerized, and Kubernetes has become the standard orchestration layer. Complement this with Terraform for infrastructure provisioning and you have the modern cloud engineer's core toolkit.",
      },
      {
        heading: "Career Outlook",
        body: "Cloud engineering is one of the most in-demand skills in tech. AWS-certified Cloud Engineers with 2–3 years of experience earn ₹15–25 LPA in India; senior cloud architects at MNCs or hyperscalers can earn ₹40–70 LPA. The cloud market itself is growing at ~20% annually, meaning demand will continue to outpace supply.\n\nTypical progression: Cloud Engineer → Senior Cloud Engineer → Cloud Architect → Principal Architect / VP Engineering. Specializations include Cloud Security, Cloud FinOps, and Platform Engineering.",
      },
      {
        heading: "How to Get Started",
        body: "Begin with the AWS Cloud Practitioner certification as a foundation, then work toward the Solutions Architect Associate. Simultaneously, spin up a personal AWS account and build real projects: host a static website on S3 + CloudFront, set up a serverless API with Lambda + API Gateway, and deploy a containerized app on ECS or EKS.\n\nLearn Terraform in parallel — it is the lingua franca of infrastructure. The free Terraform documentation and HashiCorp tutorials are excellent starting points. Document everything in a GitHub repository as proof of hands-on experience.",
      },
    ],
    keyTools: ["AWS", "GCP", "Azure", "Terraform", "Kubernetes", "Docker", "Linux", "Python", "Bash"],
  },

  {
    id: "Consulting",
    title: "Consulting Basics",
    level: "Intermediate",
    imageUrl: "/Training/Images/Consulting.png",
    pdfUrl: "/Training/Consulting.pdf",
    readTime: "10 min read",
    summary:
      "Consulting is the art of helping organizations solve their most complex problems. Whether at a Big 4 firm, a boutique strategy shop, or as an internal strategy analyst, the consulting toolkit — structured thinking, data-driven storytelling, and client management — is universally valuable.",
    whatYouLearn: [
      "Core consulting frameworks: MECE, issue trees, and hypothesis-driven problem solving",
      "How to structure and present recommendations in slide decks",
      "Stakeholder management and client communication skills",
      "Case interview preparation: profitability, market entry, and M&A cases",
      "The day-in-the-life at MBB vs. Big 4 vs. boutique firms",
      "Building a career in consulting from campus or lateral entry",
    ],
    sections: [
      {
        heading: "The Consulting Mindset",
        body: "At its core, consulting is about solving ambiguous problems in a structured way. Given a question like 'why is our revenue declining?' a consultant does not guess or dive into data randomly — they build a hypothesis tree, identify the key drivers to test, gather data efficiently, and synthesize findings into a clear recommendation with supporting evidence.\n\nThis MECE (Mutually Exclusive, Collectively Exhaustive) approach to problem decomposition is the foundational skill of consulting, and it transfers powerfully to roles in strategy, product management, operations, and finance.",
      },
      {
        heading: "Types of Consulting",
        body: "Strategy consulting (McKinsey, BCG, Bain — the 'MBB' firms) works on the highest-level questions: market entry, M&A, corporate strategy, and digital transformation. Projects are typically 3–6 months long and involve intensive client interaction at the C-suite level.\n\nManagement consulting at Big 4 firms (Deloitte, PwC, EY, KPMG) covers implementation, technology, risk, and regulatory work in addition to strategy. IT consulting (Accenture, Infosys, TCS) focuses on technology-led transformations. In India, there is also a large boutique sector serving startups and mid-market companies.",
      },
      {
        heading: "Essential Skills",
        body: "Structured communication is paramount. Consultants write decks that lead with the answer (the 'So What'), follow with supporting arguments, and back each with evidence. The Pyramid Principle by Barbara Minto is the canonical guide. Excel and PowerPoint remain the primary tools despite their limitations.\n\nQuantitative skills matter too — you need to build financial models, analyze market sizing data, and design customer surveys. Equally important is the ability to interview stakeholders, synthesize qualitative insights, and manage politically sensitive findings diplomatically.",
      },
      {
        heading: "Career Path",
        body: "At MBB and Big 4, careers progress through well-defined levels: Analyst → Consultant/Associate → Senior Consultant/Manager → Associate Principal/Associate Partner → Partner/Director. Analysts are typically campus hires with 0–2 years of experience; lateral consultant hires typically come from MBA programs or industry roles.\n\nPay is excellent — MBB analysts start at ₹18–25 LPA all-in at campus in India, with Manager-level compensation reaching ₹40–70 LPA. Exit opportunities are also strong: ex-consultants land in PE, VC, corporate strategy, and startup leadership roles.",
      },
      {
        heading: "Cracking the Case Interview",
        body: "The case interview is the primary selection tool for consulting firms. Candidates are given a business problem and expected to lead a structured analysis. Practice is the only path — there are no shortcuts. Resources like Case in Point, Victor Cheng's LOMS, and firm-specific case books are the gold standard.\n\nPractice with a partner at least 2–3 cases per week for 3–4 months before interview season. Focus equally on quantitative drills (mental math, market sizing) and communication quality (hypothesis-first, structured synthesis). The PDF resource covers a full structured preparation guide.",
      },
    ],
    keyTools: ["PowerPoint", "Excel", "MECE Frameworks", "Pyramid Principle", "Market Sizing", "Financial Modelling", "Hypothesis Trees"],
  },

  {
    id: "Data_Scientist",
    title: "Data Scientist",
    level: "Beginner",
    imageUrl: "/Training/Images/Data Science.png",
    pdfUrl: "/Training/Data_Scientist.pdf",
    readTime: "9 min read",
    summary:
      "Data Scientists extract insights from complex datasets to drive business decisions. Combining statistics, programming, and domain expertise, they turn raw data into actionable intelligence that helps companies grow smarter and faster.",
    whatYouLearn: [
      "Statistical foundations: distributions, hypothesis testing, regression, and Bayesian inference",
      "Python and R for data analysis, visualization, and modelling",
      "Machine learning algorithms and when to use each",
      "SQL and data pipeline fundamentals",
      "Data storytelling and communicating findings to non-technical audiences",
      "Building a data science portfolio that gets interviews",
    ],
    sections: [
      {
        heading: "Data Scientist vs. Data Analyst vs. ML Engineer",
        body: "These three roles sit on a spectrum. A Data Analyst focuses on historical data — querying databases, building dashboards, and answering specific business questions. A Data Scientist goes further by building predictive models, running statistical experiments (A/B tests), and framing open-ended business problems as quantitative questions.\n\nAn ML Engineer takes the models built by data scientists and puts them into production at scale. In practice, the boundaries are blurry, and many companies use all three titles interchangeably. Understanding where on this spectrum a role falls is important when evaluating job opportunities.",
      },
      {
        heading: "Core Statistical Concepts",
        body: "Statistics is the foundation everything rests on. You need a working understanding of descriptive statistics (mean, median, variance), probability distributions (normal, binomial, Poisson), hypothesis testing (t-tests, chi-square), confidence intervals, and regression (linear and logistic).\n\nBeyond the basics, causal inference is increasingly important — understanding the difference between correlation and causation, and how to design experiments (A/B tests, multi-armed bandits) that establish causal effects. This is where data science gets genuinely difficult and genuinely impactful.",
      },
      {
        heading: "The Python and SQL Stack",
        body: "Python is the language of data science. The core libraries are pandas (data manipulation), NumPy (numerical computing), Matplotlib and Seaborn (visualization), and scikit-learn (machine learning). For deep learning tasks, PyTorch or TensorFlow are added to the stack.\n\nSQL is equally non-negotiable. Real-world data science work involves writing complex queries against production databases — joining tables, windowing functions, and aggregating millions of rows. Platforms like BigQuery, Snowflake, and Redshift are the modern data warehouse tools you will encounter in industry.",
      },
      {
        heading: "Career Outlook",
        body: "Data Science remains one of the most attractive entry points into the tech industry. Starting salaries at product companies range from ₹10–18 LPA; experienced data scientists at top firms earn ₹25–50 LPA. The role evolves toward either a technical specialist track (Senior DS → Principal DS → Head of Data Science) or a management track (DS Manager → VP Data).\n\nIndustries hiring aggressively include fintech, e-commerce, health tech, and logistics — all domains with massive datasets and high tolerance for analytical hires.",
      },
    ],
    keyTools: ["Python", "pandas", "scikit-learn", "SQL", "Tableau", "Jupyter", "NumPy", "Matplotlib", "BigQuery"],
  },

  {
    id: "Founder_Office",
    title: "Founder's Office",
    level: "Beginner",
    imageUrl: "/Training/Images/Founder's office.png",
    pdfUrl: sbPdf("Founder's Office.pdf"),
    readTime: "8 min read",
    summary:
      "The Founder's Office is an emerging role at high-growth startups that combines strategy, operations, and execution at the highest level. It is arguably the most complete learning experience available to an early-career professional, offering exposure to every function of a business.",
    whatYouLearn: [
      "What the Founder's Office role involves day-to-day",
      "How to work directly with founders and senior leadership",
      "Strategic project management across business functions",
      "Building operating systems and processes from scratch",
      "Fundraising operations and investor relations basics",
      "Career paths from Founder's Office into entrepreneurship or leadership",
    ],
    sections: [
      {
        heading: "What is the Founder's Office?",
        body: "The Founder's Office (FO) is a relatively new construct in the Indian startup ecosystem, but it is gaining traction rapidly. It typically consists of 1–3 high-potential generalists who work directly under the founder or CEO, taking on the highest-priority projects across the company at any given moment.\n\nUnlike the Chief of Staff (which is a more formal, senior role), a Founder's Office hire is often a recent graduate or early-career professional who has demonstrated exceptional problem-solving and execution ability. The FO acts as a training ground and is sometimes called the 'CEO's shadow.'",
      },
      {
        heading: "What You Actually Work On",
        body: "Projects in the Founder's Office are highly variable. One week you might be conducting market research for a new product launch; the next, you are building a financial model for a fundraising round or redesigning the hiring process. You might be doing competitive analysis, drafting investor updates, or running a GTM experiment.\n\nThis breadth is both the challenge and the reward. You develop skills that would take a decade to acquire through the normal career ladder, and you build a deep understanding of how the business works holistically.",
      },
      {
        heading: "Skills That Matter",
        body: "The most important attributes are a strong bias to action, excellent written communication, and the ability to work with ambiguity. The founder does not have time to give detailed instructions — you need to take a direction, figure out the right approach, execute, and report back with clarity.\n\nAnalytical skills are critical too — you will frequently need to synthesize data, build quick models, and make recommendations under time pressure. Intellectual curiosity and the willingness to learn rapidly in any domain are what separate great FO candidates from good ones.",
      },
      {
        heading: "Career Trajectory",
        body: "A 1–2 year stint in the Founder's Office is an accelerant for almost any career path. Alumni of FO roles typically transition into Product Management, Business Development, Strategy, or VC. Some go on to found their own companies. The network and experience gained is unparalleled.\n\nCompensation ranges from ₹8–18 LPA depending on company stage, with significant equity upside at earlier-stage companies. The non-monetary value — learning, network, and optionality — often exceeds the monetary one.",
      },
    ],
    keyTools: ["Excel / Google Sheets", "Notion", "Slide Decks", "Market Research", "Financial Modelling", "Project Management", "Stakeholder Communication"],
  },

  {
    id: "Software_Engineer",
    title: "Software Engineer",
    level: "Beginner",
    imageUrl: "/Training/Images/Software Engineer.png",
    pdfUrl: "/Training/Software Engineer.pdf",
    readTime: "10 min read",
    summary:
      "Software Engineering is the discipline of designing, building, testing, and maintaining software systems. From mobile apps to distributed databases to operating systems, software engineers are the builders of the digital world.",
    whatYouLearn: [
      "Core programming concepts: data structures, algorithms, and complexity analysis",
      "Software design principles: SOLID, DRY, and clean architecture",
      "System design: how to architect scalable distributed systems",
      "The software development lifecycle and Agile practices",
      "How to prepare for and ace technical interviews",
      "Career progression from junior to staff engineer",
    ],
    sections: [
      {
        heading: "The Foundation: Data Structures and Algorithms",
        body: "Before anything else, a software engineer needs command of the fundamentals: arrays, linked lists, trees, graphs, hash maps, and the algorithms that operate on them — sorting, searching, dynamic programming, and graph traversal. These are the building blocks of every system you will ever build.\n\nMore importantly, understanding the time and space complexity of your code (Big-O notation) trains you to think about tradeoffs — when is it worth spending more memory to gain speed? When does an O(n²) algorithm become a problem? These questions arise daily in real engineering work.",
      },
      {
        heading: "System Design",
        body: "System design is where software engineering becomes architectural. Given a prompt like 'design Twitter' or 'design a URL shortener,' you need to think through load balancing, caching, database selection, horizontal scaling, message queues, and monitoring. This skill is tested heavily in senior engineer interviews.\n\nKey concepts to master: CAP theorem, consistent hashing, SQL vs. NoSQL tradeoffs, CDN and caching strategies, API design (REST vs. GraphQL), and service-oriented architecture. The 'Designing Data-Intensive Applications' book by Martin Kleppmann is the definitive resource.",
      },
      {
        heading: "The Software Development Lifecycle",
        body: "Professional software engineering is a team sport. You write code in Git repositories, review others' code in pull requests, run tests in CI/CD pipelines, and deploy to production using tools like GitHub Actions, Jenkins, or ArgoCD. Agile and Scrum ceremonies — sprints, stand-ups, retrospectives — structure how teams plan and deliver work.\n\nWriting good code is necessary but not sufficient. Clean commit messages, comprehensive test coverage, clear documentation, and thoughtful API design are what separate a junior engineer from a senior one.",
      },
      {
        heading: "Career Levels and Compensation",
        body: "Software engineering has one of the most structured career ladders in tech: SDE 1 → SDE 2 → Senior SDE → Staff Engineer → Principal Engineer → Distinguished Engineer. At each level, the expectation shifts from individual contribution to system-level design to organizational impact.\n\nIn India, SDE 1 salaries at top product companies (Atlassian, Google, Microsoft, Flipkart, Razorpay) range from ₹20–45 LPA. Senior SDEs earn ₹40–80 LPA. FAANG compensation with RSUs can reach ₹1 Cr+ at principal levels.",
      },
      {
        heading: "Interview Preparation Strategy",
        body: "Technical interview preparation is a separate skill from day-to-day engineering. Dedicate 2–3 months to LeetCode (focus on Medium problems), NeetCode's structured curriculum, and Blind 75. Practice on a whiteboard or empty editor without autocomplete to simulate real conditions.\n\nFor system design, study the Grokking the System Design Interview course and practice designing 3–4 systems per week from scratch. Behavioral interviews require the STAR format (Situation, Task, Action, Result) and preparation of 5–7 strong anecdotes from your experience.",
      },
    ],
    keyTools: ["Python / Java / C++", "Git", "LeetCode", "Docker", "REST APIs", "SQL", "Linux", "CI/CD"],
  },

  {
    id: "Strategy_and_Operations",
    title: "Strategy and Operations",
    level: "Beginner",
    imageUrl: "/Training/Images/Strat and Ops.png",
    pdfUrl: "/Training/Strategy and Operations Job Role Resource.docx.pdf",
    readTime: "8 min read",
    summary:
      "Strategy and Operations roles are the connective tissue of high-growth companies. They sit between leadership and execution, translating vision into plans and plans into results — across every function from product to sales to supply chain.",
    whatYouLearn: [
      "The scope and mandate of a Strategy & Ops role at startups vs. corporations",
      "Core frameworks: OKRs, KPIs, and operating cadences",
      "Building dashboards and reporting systems for leadership",
      "Running cross-functional projects from kick-off to completion",
      "Process design, optimization, and change management",
      "How to build a career in operations and strategy",
    ],
    sections: [
      {
        heading: "What is Strategy and Operations?",
        body: "Strategy and Operations (S&O) is one of the most versatile and impactful roles in a modern company. In a startup, an S&O hire might own the entire operating system — building dashboards, running planning cycles, leading key projects, and filling gaps wherever the company needs them most.\n\nIn larger organizations, S&O functions might be divided across business operations, revenue operations, supply chain, and corporate strategy teams. What unites them is the core mandate: ensure that the company's strategic priorities translate into measurable, executable plans.",
      },
      {
        heading: "Core Responsibilities",
        body: "A Strategy & Ops professional typically leads the planning process (quarterly OKR setting, annual budgeting), builds and maintains executive dashboards tracking key metrics, runs cross-functional projects (e.g., launching a new city, building a new sales process), and identifies and removes operational bottlenecks.\n\nThey act as translators between the 'what' (leadership's vision) and the 'how' (execution by teams). This requires both analytical rigor (to diagnose problems) and interpersonal skill (to align stakeholders and drive change).",
      },
      {
        heading: "Skills and Tools",
        body: "The S&O toolkit starts with Excel and SQL — you need to be comfortable pulling data, building models, and designing dashboards. Visualization tools like Looker, Tableau, or Metabase are increasingly common. Project management proficiency (Asana, Jira, Notion, or Linear) is expected.\n\nSoft skills are equally critical: stakeholder management, executive communication, and the ability to influence without authority. The best S&O professionals are trusted across the organization as neutral problem-solvers who care about outcomes, not credit.",
      },
      {
        heading: "Career Opportunities",
        body: "Strategy & Ops is a phenomenal career accelerator. Two to three years in a high-quality S&O role gives you exposure to every function of the business and equips you for senior leadership. Alumni of S&O programs at companies like Swiggy, Zomato, Ola, and Razorpay have gone on to become VPs, GMs, and founders.\n\nCompensation at VC-backed startups ranges from ₹10–20 LPA for early-career professionals, scaling significantly with seniority and company stage.",
      },
    ],
    keyTools: ["Excel", "SQL", "Looker / Tableau", "Notion / Asana", "OKR Frameworks", "Process Design", "Data Analysis"],
  },

  {
    id: "UI_UX_Designer",
    title: "UI/UX Designer",
    level: "Beginner",
    imageUrl: "/Training/Images/UI UX Design.png",
    pdfUrl: "/Training/UI UX Resource.docx.pdf",
    readTime: "9 min read",
    summary:
      "UI/UX Design is the craft of making technology intuitive, accessible, and delightful. Great design is invisible — it removes friction so users can accomplish their goals effortlessly. Poor design is everywhere, and great designers are in relentlessly high demand.",
    whatYouLearn: [
      "The difference between UX (experience) and UI (interface) design",
      "User research methods: interviews, surveys, and usability testing",
      "Wireframing, prototyping, and high-fidelity design in Figma",
      "Design systems, component libraries, and design tokens",
      "Accessibility (WCAG) and inclusive design principles",
      "Handing off designs to developers and collaborating cross-functionally",
    ],
    sections: [
      {
        heading: "UX vs. UI: What's the Difference?",
        body: "UX (User Experience) Design is about the overall experience of using a product — the flow, the information architecture, the logic of how tasks are accomplished. A UX designer asks: 'What does the user need to do? How do they think about it? What is the simplest path to their goal?' The output is wireframes, user flows, and research documentation.\n\nUI (User Interface) Design is about the visual and interactive layer — the colors, typography, spacing, icons, and animations that make the product feel polished and on-brand. In practice, most designers in the industry do both, and the boundary is increasingly blurred.",
      },
      {
        heading: "The Design Process",
        body: "Professional design follows a cycle: Discover → Define → Ideate → Prototype → Test. You start by researching users through interviews, surveys, and analytics. You define the problem with empathy maps and user journey maps. You generate solutions through sketching and ideation sessions. You prototype quickly in Figma and test with real users.\n\nThis process is iterative — you never get it right on the first try, and the best designers are those who embrace that reality, test early, and refine based on evidence rather than opinion.",
      },
      {
        heading: "Mastering Figma",
        body: "Figma is the industry-standard design tool, used at virtually every tech company in the world. Beyond basic shapes and text, you need to master: Auto Layout (for responsive components), components and variants (for design systems), interactive prototyping (for usability testing), and developer handoff (inspect mode, CSS export).\n\nBuild a personal design system — a library of 50–100 reusable components — as a portfolio piece. It demonstrates maturity in design thinking that goes beyond individual screens.",
      },
      {
        heading: "Career Path and Growth",
        body: "UI/UX Designers typically progress from Junior Designer → Designer → Senior Designer → Lead Designer / Design Manager → Head of Design / VP Design. Some designers specialize in research (UX Research), motion design, or design systems engineering.\n\nEntry-level salaries at product companies in India range from ₹8–15 LPA. Senior designers at top startups earn ₹20–35 LPA. The role has lower ceiling compensation than engineering but offers higher creative satisfaction and often better work-life balance.",
      },
    ],
    keyTools: ["Figma", "Adobe XD", "Maze", "Hotjar", "Miro", "Zeplin", "Principle", "Accessibility Checkers"],
  },

  {
    id: "Web_Development",
    title: "Web Development",
    level: "Beginner",
    imageUrl: "/Training/Images/Web development.png",
    pdfUrl: "/Training/Web_Development.pdf",
    readTime: "10 min read",
    summary:
      "Web development is the craft of building the websites and web applications that billions of people use every day. From static landing pages to real-time collaborative tools, web developers bring the internet to life using HTML, CSS, JavaScript, and a rich ecosystem of frameworks.",
    whatYouLearn: [
      "HTML, CSS, and JavaScript fundamentals from the ground up",
      "Modern frontend frameworks: React, Next.js, and Tailwind CSS",
      "Backend development with Node.js, APIs, and databases",
      "Version control with Git and GitHub collaboration workflows",
      "Deploying web applications to Vercel, Netlify, or AWS",
      "Web performance, accessibility, and SEO basics",
    ],
    sections: [
      {
        heading: "Frontend vs. Backend vs. Full Stack",
        body: "Frontend development focuses on what users see and interact with — HTML for structure, CSS for style, and JavaScript for interactivity. Modern frontend development means building in React or Vue, managing state, and interfacing with REST APIs. The job is to create fast, accessible, and beautiful user interfaces.\n\nBackend development is the server side: business logic, databases, authentication, and APIs. Node.js, Python (Django/FastAPI), Go, and Java are common backend languages. Full Stack developers work across both layers — increasingly common at startups where small teams own end-to-end features.",
      },
      {
        heading: "The Modern Frontend Stack",
        body: "The dominant frontend stack in 2024 is React + TypeScript + Tailwind CSS, often deployed on Next.js (which adds server-side rendering, file-based routing, and API routes on top of React). This combination powers companies from startups to Netflix, Airbnb, and Vercel itself.\n\nTailwind has transformed CSS — instead of writing custom stylesheets, you apply utility classes directly in your JSX. It sounds counterintuitive at first, but it dramatically accelerates development speed and ensures visual consistency across large teams.",
      },
      {
        heading: "Backend and APIs",
        body: "Every web application needs a backend to store data, authenticate users, and enforce business rules. The most common pattern is a REST API (or increasingly GraphQL) that the frontend calls over HTTP. Node.js with Express or Fastify is popular for JavaScript shops; FastAPI is the go-to for Python teams.\n\nDatabases are divided between SQL (PostgreSQL is the gold standard for new projects) and NoSQL (MongoDB for flexible schemas, Redis for caching). ORMs like Prisma or SQLAlchemy bridge application code and databases, reducing boilerplate significantly.",
      },
      {
        heading: "Building Your Portfolio",
        body: "Employers evaluate web developers almost entirely on their portfolio. You need 3–5 deployed projects that demonstrate both technical breadth and product thinking: a clone of a real product (to show you can build something familiar), a personal tool you actually use (to show genuine motivation), and at least one full-stack app with authentication and a database.\n\nDeploy everything — a GitHub link is not enough; employers want to click a link and use your app. Vercel makes deploying React/Next.js apps trivially simple; Railway or Render handle backend services. A polished portfolio site that showcases these projects is itself a demonstration of your abilities.",
      },
    ],
    keyTools: ["HTML/CSS/JS", "React", "Next.js", "TypeScript", "Tailwind CSS", "Node.js", "PostgreSQL", "Git", "Vercel"],
  },

  {
    id: "RA_1",
    title: "Analyst Roles — Part 1",
    level: "Beginner",
    imageUrl: "/Training/Images/Analyst (part 1).png",
    pdfUrl: "/Training/Resource on Analyst roles (part 1).docx.pdf",
    readTime: "8 min read",
    summary:
      "Analyst roles are the most common entry points into corporate careers across finance, consulting, operations, and tech. This first guide covers what analyst roles look like, what skills they demand, and how to land your first one.",
    whatYouLearn: [
      "The spectrum of analyst roles: business, financial, data, product, and research",
      "Core skills every analyst needs: Excel, SQL, PowerPoint, and communication",
      "How analysts spend their day across different industries",
      "The analyst hiring process: applications, tests, and interviews",
      "Building the profile that wins analyst interviews",
      "What sets high performers apart in the first 90 days",
    ],
    sections: [
      {
        heading: "What is an Analyst?",
        body: "The analyst title is used across virtually every industry, but the underlying job is consistent: take data or information, organize and analyze it, and produce insights or recommendations that help decision-makers act. A financial analyst builds valuation models. A business analyst maps processes and requirements. A data analyst queries databases and builds dashboards. A product analyst tracks metrics and designs experiments.\n\nDespite the variety, the core competencies are similar: structured thinking, quantitative skills, attention to detail, and clear written communication.",
      },
      {
        heading: "Skills You Need on Day One",
        body: "Excel proficiency is the most universal analyst skill — VLOOKUP, PivotTables, INDEX-MATCH, and basic financial formulas are expected from day one at most firms. SQL is increasingly expected across all analyst types, not just data roles. PowerPoint or Google Slides for communicating findings to non-technical audiences.\n\nBeyond the tools, analysts need to be curious, meticulous, and able to ask good questions. The difference between an average and excellent analyst often comes down to whether they question the data before drawing conclusions, or whether they take numbers at face value.",
      },
      {
        heading: "The Interview Process",
        body: "Most analyst hiring processes include an online aptitude test (numerical reasoning, logical reasoning, data interpretation), a case study or take-home analysis, and 1–2 rounds of interviews. The aptitude tests are designed to filter volume — practice extensively with GMAT-style quantitative questions and SHL-style reasoning tests.\n\nInterviews typically combine behavioral questions (tell me about a time you used data to make a decision) and technical questions (walk me through how you would analyze a drop in conversion rate). Prepare specific STAR-format answers for 6–8 behavioral scenarios.",
      },
      {
        heading: "The First 90 Days",
        body: "Success in the first 90 days of an analyst role is about building trust and delivering reliably. Resist the urge to overhaul everything — first understand deeply. Ask thoughtful questions, document what you learn, and produce clean, well-organized work.\n\nHigh performers in analyst roles develop strong working relationships with their managers, proactively communicate blockers, and look for opportunities to add value beyond their assigned tasks. The fastest-progressing analysts are the ones who make their managers' lives easier.",
      },
    ],
    keyTools: ["Excel", "PowerPoint", "SQL", "Google Sheets", "Data Visualization", "Quantitative Reasoning"],
  },

  {
    id: "RA_2",
    title: "Analyst Roles — Part 2",
    level: "Intermediate",
    imageUrl: "/Training/Images/Analyst (part 2).png",
    pdfUrl: "/Training/Resource on Analyst roles (part 2).docx.pdf",
    readTime: "9 min read",
    summary:
      "Building on the foundations in Part 1, this guide goes deeper into specialized analyst tracks — financial analysis, business analysis, and product analytics — and the path from analyst to manager.",
    whatYouLearn: [
      "Differences between financial analysts, business analysts, and product analysts",
      "Advanced Excel and financial modelling concepts",
      "Business process analysis and requirement documentation",
      "Product analytics: funnels, cohorts, and A/B testing",
      "Stakeholder management and influencing without authority",
      "The path from analyst to senior analyst to manager",
    ],
    sections: [
      {
        heading: "Financial Analysis Deep Dive",
        body: "Financial analysts at investment banks, private equity firms, and corporate finance teams build models that value companies, forecast revenues, and evaluate capital allocation decisions. The core modelling outputs are DCF (Discounted Cash Flow) valuations, LBO (Leveraged Buyout) models, and M&A accretion/dilution analyses.\n\nExcel is the primary tool — specifically: three-statement modelling (income statement, balance sheet, cash flow linked together), scenario analysis, and sensitivity tables. Bloomberg Terminal is used for market data. Mastery of these tools takes time, but the underlying logic — projecting cash flows and discounting them to present value — is learnable in weeks.",
      },
      {
        heading: "Business Analysis",
        body: "Business analysts (BAs) serve as the bridge between business stakeholders and technology teams. Their primary output is requirements documentation: user stories, process flow diagrams, wireframes, and acceptance criteria that tell developers exactly what to build.\n\nStrong BAs conduct structured discovery sessions, ask the 'five whys' to uncover root causes, and challenge stakeholders to distinguish between what they want and what they actually need. Tools like Jira, Confluence, Lucidchart, and Miro are standard in BA workflows.",
      },
      {
        heading: "Product Analytics",
        body: "Product analysts instrument digital products, define metrics, track user behavior, and run experiments to improve outcomes. Working closely with product managers and engineers, they answer questions like: 'Why did our Day-7 retention drop this week?' or 'Which onboarding flow leads to higher activation?'\n\nKey concepts include funnel analysis (where users drop off), cohort analysis (how different user segments behave over time), and A/B testing (running controlled experiments to measure causation). Tools include Mixpanel, Amplitude, Heap, Google Analytics 4, and dbt + SQL for data modelling.",
      },
      {
        heading: "Career Progression",
        body: "From Analyst, the next step is Senior Analyst (typically at 2–3 years), then Team Lead or Manager (3–5 years). The transition from individual contributor to manager requires a shift in focus from personal output to team output — coaching, hiring, prioritizing, and removing blockers for your team rather than doing the work yourself.\n\nAt this stage, compensation at top firms in India ranges from ₹15–30 LPA for senior analysts, with managers earning ₹25–50 LPA depending on company and sector.",
      },
    ],
    keyTools: ["Excel / Financial Modelling", "Jira / Confluence", "Amplitude / Mixpanel", "SQL", "Tableau", "A/B Testing", "Bloomberg"],
  },

  {
    id: "RA_3",
    title: "Analyst Roles — Part 3",
    level: "Advanced",
    imageUrl: "/Training/Images/Analyst (part 3).png",
    pdfUrl: "/Training/Resource on Analyst roles (part 3).docx.pdf",
    readTime: "10 min read",
    summary:
      "The final guide in the analyst series covers advanced topics: leading analytics teams, building data infrastructure, driving data-driven culture, and transitioning into executive leadership or entrepreneurship.",
    whatYouLearn: [
      "Building and scaling an analytics function from scratch",
      "Data infrastructure: modern data stack, data governance, and data quality",
      "How to cultivate a data-driven culture across an organization",
      "Advanced statistics: causal inference, Bayesian methods, and experimentation at scale",
      "Transitioning from analyst to Head of Analytics or Chief Data Officer",
      "Building a personal brand as an analytics leader",
    ],
    sections: [
      {
        heading: "Leading an Analytics Team",
        body: "At the senior level, analytics leadership is less about doing the analysis yourself and more about creating the conditions for your team to do excellent work. This means hiring the right people, defining a clear analytical roadmap aligned with company priorities, and evangelizing the use of data across the organization.\n\nThe best analytics leaders function as internal consultants — their team is a resource that other departments pull in to answer their most important questions. Building trust with stakeholders takes time and is earned through consistent delivery of accurate, actionable insights.",
      },
      {
        heading: "The Modern Data Stack",
        body: "The modern data stack has transformed how companies manage their analytical infrastructure. Data flows from source systems (production databases, APIs, SaaS tools) through ingestion tools (Fivetran, Airbyte) into a cloud data warehouse (Snowflake, BigQuery, Databricks). Transformation is handled by dbt (data build tool), and visualization is done in Looker, Tableau, or Mode.\n\nAs an analytics leader, you own this stack — choosing the right tools, maintaining data quality, defining governance standards, and ensuring that the business can trust the numbers they see in dashboards.",
      },
      {
        heading: "Causal Inference and Advanced Experimentation",
        body: "At the advanced level, analytics moves beyond description and prediction into causation. A/B testing is the cleanest method, but many business questions cannot be tested with a randomized experiment. Techniques like difference-in-differences, regression discontinuity, and instrumental variables allow causal inference from observational data.\n\nBuilding experimentation platforms — the infrastructure for running hundreds of concurrent experiments across a product — is a major investment for mature analytics organizations. Companies like Netflix, Airbnb, and Booking.com have published extensively on their experimentation infrastructure.",
      },
      {
        heading: "The CDO Path",
        body: "The Chief Data Officer (CDO) or VP of Data is an increasingly common C-suite role, particularly at data-intensive companies. The CDO is responsible for the company's data strategy, data infrastructure, analytics, and sometimes AI/ML initiatives.\n\nThe path to CDO typically runs through Head of Analytics or Head of Data Science, requiring a combination of technical depth, business acumen, and executive presence. Leading conversations about data privacy, regulatory compliance (GDPR, India's DPDP Act), and AI ethics is increasingly part of the role.",
      },
    ],
    keyTools: ["dbt", "Snowflake / BigQuery", "Looker / Tableau", "Python (statsmodels)", "Fivetran", "SQL", "A/B Testing Platforms"],
  },

  {
    id: "Robotics_Engineer",
    title: "Robotics Engineer",
    level: "Beginner",
    imageUrl: sbImg("Robotics.png"),
    pdfUrl: sbPdf("Robotics Engineer_ A Beginner's Guide.pdf"),
    readTime: "10 min read",
    summary:
      "Robotics Engineers design, build, and program intelligent machines that can perceive their environment, make decisions, and act in the physical world. From warehouse automation to surgical robots to autonomous vehicles, robotics is reshaping every physical industry.",
    whatYouLearn: [
      "Core components of a robotic system: sensors, actuators, and controllers",
      "Robot kinematics, dynamics, and control systems",
      "ROS (Robot Operating System) fundamentals",
      "Computer vision for robot perception",
      "Path planning and motion planning algorithms",
      "Career opportunities across industrial, medical, and consumer robotics",
    ],
    sections: [
      {
        heading: "What is Robotics Engineering?",
        body: "Robotics Engineering is an interdisciplinary field drawing from mechanical engineering, electrical engineering, computer science, and control theory. A robotics engineer might design the physical structure of a robot arm, wire its electronics, write the low-level firmware for its motors, and build the high-level AI software that decides what the arm should pick up.\n\nThe field is rapidly maturing. Advances in machine learning, sensor miniaturization, and battery technology are making robots more capable and economical — opening up applications in warehousing, agriculture, healthcare, construction, and home automation.",
      },
      {
        heading: "Core Technical Areas",
        body: "Kinematics describes how a robot's joints and links move in space — the mathematics of position, velocity, and acceleration. Control systems determine how the robot responds to errors between its intended and actual state; PID controllers are the most common starting point.\n\nPerception (sensors + computer vision) allows robots to understand their environment. Cameras, LiDAR, and IMUs feed data into perception pipelines that produce representations the robot can reason about. Path planning algorithms (A*, RRT, D*) determine how the robot moves from A to B while avoiding obstacles.",
      },
      {
        heading: "ROS — The Robot Operating System",
        body: "ROS (Robot Operating System) is the de facto standard middleware for robotics development. Despite the name, it is not an operating system but a framework that manages communication between different components of a robotic system — perception, planning, control, and simulation.\n\nROS 2 is the current standard, running natively on Ubuntu Linux. Learning ROS means understanding nodes, topics, services, and actions — the primitives through which robot components communicate. The Gazebo simulation environment, tightly integrated with ROS, lets you test robot code virtually before running it on real hardware.",
      },
      {
        heading: "Career and Industry Outlook",
        body: "Robotics engineering is a growth field, but still more niche than software engineering. The hottest areas are: autonomous vehicles (Waymo, Cruise, Mobileye), warehouse automation (Amazon Robotics, Geek+), surgical robotics (Intuitive Surgical), and humanoid robots (Boston Dynamics, Figure, 1X).\n\nIn India, the ecosystem is early but growing — defense robotics (DRDO), agricultural automation, and industrial automation are the primary areas. Salaries for robotics engineers at top companies range from ₹12–25 LPA for early-career, with experienced engineers earning ₹30–60 LPA at global companies.",
      },
    ],
    keyTools: ["Python", "C++", "ROS 2", "Gazebo", "OpenCV", "MATLAB / Simulink", "Linux", "PyTorch"],
  },

  {
    id: "Prompt_Engineer",
    title: "Prompt Engineer",
    level: "Beginner",
    imageUrl: sbImg("Prompt engineer.png"),
    pdfUrl: sbPdf("PROMPT ENGINEER.pdf"),
    readTime: "8 min read",
    summary:
      "Prompt Engineering is the art and science of crafting inputs to AI language models to get optimal outputs. As LLMs become embedded in every product, the ability to communicate effectively with AI systems has become a valuable professional skill.",
    whatYouLearn: [
      "Core prompting techniques: zero-shot, few-shot, chain-of-thought",
      "System prompts, personas, and context management",
      "Retrieval-Augmented Generation (RAG) and grounding AI responses",
      "Evaluating and iterating on prompt quality systematically",
      "Building AI pipelines and agents using LangChain or LlamaIndex",
      "Ethical considerations and safety in prompt design",
    ],
    sections: [
      {
        heading: "What is Prompt Engineering?",
        body: "Prompt Engineering is the discipline of designing and optimizing the inputs given to large language models (LLMs) like GPT-4, Claude, or Gemini to produce high-quality, reliable outputs. Because LLMs are extremely sensitive to how questions are framed, small changes to a prompt can dramatically change the quality and format of the response.\n\nWhile 'prompt engineering' as a standalone title may evolve, the underlying skill — knowing how to effectively direct AI systems — is becoming a core competency for product managers, data scientists, and software engineers alike.",
      },
      {
        heading: "Core Prompting Techniques",
        body: "Zero-shot prompting gives the model a task with no examples. Few-shot prompting provides 2–5 input/output examples before the actual query, teaching the model the desired format through demonstration. Chain-of-thought prompting asks the model to 'think step by step' before answering, which dramatically improves performance on complex reasoning tasks.\n\nSystem prompts define the model's role, personality, and constraints. A well-crafted system prompt is the difference between a generic chatbot and a focused, reliable AI assistant. Role prompting ('You are an expert Python developer reviewing code for security vulnerabilities') is a powerful technique for narrowing the model's output distribution.",
      },
      {
        heading: "RAG and Grounding",
        body: "LLMs hallucinate — they confidently produce false information because they are pattern-matching engines, not knowledge databases. Retrieval-Augmented Generation (RAG) solves this by embedding the model's knowledge in a retrieval system: the user's query first retrieves relevant documents from a vector database (Pinecone, Weaviate, Chroma), and those documents are injected into the prompt as context.\n\nRAG is now the standard architecture for building AI applications on top of private or up-to-date data. Understanding how to build, evaluate, and optimize RAG pipelines is one of the most in-demand AI engineering skills today.",
      },
      {
        heading: "Career Opportunities",
        body: "Prompt engineering skills are most valuable when paired with domain expertise. An AI product manager who can write effective prompts is more impactful than one who cannot. A data scientist building LLM-powered pipelines needs strong prompting intuition. A software engineer adding AI features to a product needs to debug and optimize prompts.\n\nDedicated 'AI Engineer' or 'LLM Engineer' roles at AI-first companies are the most specialized application of these skills. Compensation for these roles is competitive: ₹15–35 LPA for engineers with 1–3 years of AI experience in India.",
      },
    ],
    keyTools: ["OpenAI API", "Anthropic Claude API", "LangChain", "LlamaIndex", "Pinecone / Chroma", "Python", "Weights & Biases"],
  },

  {
    id: "MLOps_Engineer",
    title: "MLOps Engineer",
    level: "Intermediate",
    imageUrl: sbImg("MLOps Engineer.png"),
    pdfUrl: sbPdf("MLOps ENGINEER.pdf"),
    readTime: "11 min read",
    summary:
      "MLOps Engineers bridge the gap between machine learning research and production software engineering. They build the infrastructure, pipelines, and tooling that take ML models from a data scientist's laptop to reliable, scalable, monitored production systems.",
    whatYouLearn: [
      "The full ML lifecycle: data → training → evaluation → deployment → monitoring",
      "Building ML pipelines with Kubeflow, Airflow, or Prefect",
      "Model serving with TorchServe, TensorFlow Serving, or Triton",
      "Feature stores and data versioning with DVC and Feast",
      "Model monitoring: drift detection and performance degradation",
      "MLOps maturity model and how to build it incrementally",
    ],
    sections: [
      {
        heading: "Why MLOps Exists",
        body: "The vast majority of ML projects never make it to production — they stay in Jupyter notebooks. The reason is not the model quality; it is the infrastructure gap between a working prototype and a production system. MLOps exists to close that gap.\n\nMLOps (Machine Learning Operations) applies DevOps principles — continuous integration, continuous delivery, monitoring, and automation — to the ML lifecycle. An MLOps engineer ensures that models can be trained reliably, evaluated rigorously, deployed safely, and monitored continuously.",
      },
      {
        heading: "The ML Lifecycle",
        body: "The ML lifecycle starts with data: collection, validation, cleaning, and versioning. Data versioning tools like DVC (Data Version Control) track changes to datasets and models in Git-like fashion. Feature stores (Feast, Tecton, Hopsworks) provide a central repository of engineered features that can be shared across models and training jobs.\n\nTraining pipelines orchestrate data loading, model training, hyperparameter tuning, and evaluation in a reproducible, automated way. MLflow or Weights & Biases tracks experiments — hyperparameters, metrics, model artifacts — so results can be compared and reproduced.",
      },
      {
        heading: "Deployment and Serving",
        body: "Deploying a model means wrapping it in a web server that accepts requests and returns predictions. At small scale, Flask or FastAPI works fine. At production scale, dedicated model serving frameworks like TorchServe, TensorFlow Serving, or NVIDIA Triton Inference Server provide batching, GPU optimization, and high-throughput serving.\n\nContainerization (Docker) and orchestration (Kubernetes) are the deployment substrate. Model deployment workflows are managed through CI/CD pipelines (GitHub Actions, Jenkins) that run tests, build containers, and deploy to staging and production environments.",
      },
      {
        heading: "Monitoring and Observability",
        body: "A model that performed well at training time can degrade in production as the world changes — input data distribution shifts, new user behaviors emerge, and ground truth labels evolve. This is called data drift and concept drift, and catching it early is a core MLOps responsibility.\n\nMonitoring pipelines track statistical properties of model inputs and outputs over time, alerting when drift is detected. Tools like Evidently AI, Arize, and WhyLabs specialize in ML observability. Business-level metrics (revenue, conversion, error rates) must also be tracked alongside model-level metrics.",
      },
      {
        heading: "Career and Compensation",
        body: "MLOps is one of the fastest-growing specializations in ML, driven by the maturation of the industry and the realization that model deployment infrastructure is a persistent engineering challenge. MLOps engineers with 2–4 years of experience earn ₹18–35 LPA at top Indian product companies, with senior roles reaching ₹40–70 LPA.\n\nThe role requires a blend of ML understanding and software engineering expertise — making it harder to hire for than pure SWE or pure data science, which drives compensation up.",
      },
    ],
    keyTools: ["Python", "Docker", "Kubernetes", "MLflow", "Airflow / Prefect", "DVC", "Triton / TorchServe", "Evidently AI", "AWS / GCP"],
  },

  {
    id: "Full_Stack_Engineer",
    title: "Full Stack Engineer",
    level: "Beginner",
    imageUrl: sbImg("Full stack Engineer.png"),
    pdfUrl: sbPdf("FULL STACK ENGINEER (1).pdf"),
    readTime: "10 min read",
    summary:
      "Full Stack Engineers design and build complete software applications from the user interface down to the database and server infrastructure. They are the most versatile members of engineering teams, able to own features end-to-end without handoffs.",
    whatYouLearn: [
      "Modern frontend: React, TypeScript, Tailwind, and Next.js",
      "Backend: REST API design, Node.js, authentication, and databases",
      "Database design with PostgreSQL and ORMs",
      "Authentication, authorization, and security fundamentals",
      "Deployment and DevOps basics: CI/CD, Docker, and cloud platforms",
      "How to architect a new product feature end-to-end",
    ],
    sections: [
      {
        heading: "The Full Stack Advantage",
        body: "A Full Stack Engineer can take a user story — 'users should be able to reset their password' — and implement it entirely: the UI form, the backend API endpoint, the email service integration, the database migration, and the deployment pipeline. No handoffs, no waiting, no context lost in translation.\n\nThis makes full stack engineers uniquely valuable at startups and small teams where speed and iteration are paramount. At larger companies, full stack engineers are often grouped into 'product squads' that own a vertical end-to-end, and the autonomy is similarly high.",
      },
      {
        heading: "Frontend Mastery",
        body: "The modern frontend stack starts with React and TypeScript. React's component model and one-way data flow make UIs predictable and testable. TypeScript catches errors before they reach production. Next.js builds on React to add file-based routing, server-side rendering, and API routes — it is the dominant framework for production web applications in 2024.\n\nTailwind CSS eliminates most custom CSS — utility classes applied directly in JSX are faster to write, easier to review, and more consistent than custom stylesheets. Pair with shadcn/ui or Radix UI for accessible component primitives and you have a complete, production-ready frontend toolkit.",
      },
      {
        heading: "Backend and Data",
        body: "On the backend, Node.js (Express or Fastify) is the natural choice for JavaScript developers. Python with FastAPI is popular for teams with data science adjacent needs. Go is increasingly adopted for high-performance, low-latency services.\n\nPostgreSQL is the default relational database for new projects — its reliability, feature set (JSONB, full-text search, advanced indexing), and community support are unmatched. Prisma or Drizzle ORM provides type-safe database access from TypeScript. For authentication, NextAuth.js (now Auth.js) or Supabase Auth handle the complexity of session management, OAuth, and JWTs.",
      },
      {
        heading: "Career Trajectory",
        body: "Full Stack Engineers are highly employable across every stage of company. At startups, they often evolve into Tech Leads or CTOs. At mid-size companies, they specialize into either frontend or backend leadership while retaining cross-stack context. At large tech companies, the 'full stack' label becomes less common, and engineers typically specialize.\n\nCompensation for full stack engineers at Indian product companies: ₹12–25 LPA for early-career, ₹25–50 LPA for senior levels. Remote full stack roles for global companies pay significantly more in USD or EUR.",
      },
    ],
    keyTools: ["React", "TypeScript", "Next.js", "Tailwind CSS", "Node.js", "PostgreSQL", "Prisma", "Docker", "Vercel"],
  },

  {
    id: "DevOps_Engineer",
    title: "DevOps Engineer",
    level: "Intermediate",
    imageUrl: sbImg("DevOps Engineer.png"),
    pdfUrl: sbPdf("DevOPs ENGINEER.pdf"),
    readTime: "11 min read",
    summary:
      "DevOps Engineers automate and streamline the software delivery lifecycle — from code commit to production deployment. They build the pipelines, platforms, and practices that let development and operations teams collaborate seamlessly and ship fast.",
    whatYouLearn: [
      "CI/CD pipeline design with GitHub Actions, Jenkins, and GitLab CI",
      "Infrastructure as Code with Terraform and Ansible",
      "Container orchestration with Kubernetes and Helm",
      "Observability: logging, metrics, tracing with Prometheus, Grafana, and Jaeger",
      "Site Reliability Engineering (SRE) principles: SLOs, SLIs, and error budgets",
      "Cloud platforms: AWS, GCP, and Azure for production workloads",
    ],
    sections: [
      {
        heading: "What is DevOps?",
        body: "DevOps is a cultural and technical movement that breaks down silos between development (the people who write code) and operations (the people who run infrastructure). Before DevOps, code would be written in isolation and 'thrown over the wall' to ops for deployment — leading to slow releases, blame games, and poor system reliability.\n\nDevOps practices — CI/CD pipelines, infrastructure as code, monitoring, and blameless post-mortems — create a feedback loop where code moves from commit to production quickly and safely, and failures are learning opportunities rather than catastrophes.",
      },
      {
        heading: "CI/CD Pipelines",
        body: "Continuous Integration (CI) automatically builds and tests code every time a developer pushes a change. Continuous Delivery (CD) automates the deployment of tested code to staging and production environments. Together, they turn software releases from quarterly events into daily or hourly ones.\n\nGitHub Actions is the most popular CI/CD tool for GitHub-hosted repositories. Jenkins remains common in enterprise environments. GitLab CI is favored in GitLab shops. A well-designed pipeline catches integration errors early, runs automated test suites, builds container images, and deploys with zero-downtime strategies like blue-green or canary deployments.",
      },
      {
        heading: "Infrastructure as Code",
        body: "Infrastructure as Code (IaC) means managing servers, networks, databases, and every other piece of infrastructure through version-controlled configuration files — not through manual console clicks. Terraform is the dominant IaC tool, supporting all major cloud providers with a consistent, declarative syntax.\n\nAnsible handles configuration management — ensuring servers are configured identically and consistently. Together, Terraform (provision) and Ansible (configure) form the backbone of most IaC workflows. IaC makes infrastructure auditable, reproducible, and change-reviewed just like application code.",
      },
      {
        heading: "Observability and Reliability",
        body: "You cannot operate what you cannot observe. Observability in production means three pillars: metrics (quantitative measures like CPU usage and request latency), logs (structured event records), and traces (end-to-end request flows through distributed systems). Prometheus and Grafana are the standard open-source metrics stack. ELK (Elasticsearch, Logstash, Kibana) or Loki handles logging. Jaeger or Tempo handles distributed tracing.\n\nSite Reliability Engineering (SRE), pioneered by Google, adds a rigor layer: defining SLOs (Service Level Objectives) for availability and latency, measuring SLIs (indicators), and managing error budgets that determine when reliability work takes priority over feature development.",
      },
    ],
    keyTools: ["GitHub Actions", "Terraform", "Kubernetes", "Helm", "Prometheus", "Grafana", "Docker", "Ansible", "AWS / GCP"],
  },

  {
    id: "Cybersecurity_Engineer",
    title: "Cybersecurity Engineer",
    level: "Beginner",
    imageUrl: sbImg("Cybersecurity.png"),
    pdfUrl: sbPdf("CYBERSECURITYENGINEER (2) (1).pdf"),
    readTime: "11 min read",
    summary:
      "Cybersecurity Engineers protect organizations' systems, networks, and data from malicious attacks. As digital infrastructure becomes critical to every sector, skilled security professionals are in acute short supply worldwide — making this one of the most valuable careers in tech.",
    whatYouLearn: [
      "Fundamental security concepts: CIA triad, threat modelling, and attack surfaces",
      "Network security: firewalls, VPNs, IDS/IPS, and packet analysis",
      "Application security: OWASP Top 10 and secure coding practices",
      "Incident response and forensics fundamentals",
      "Penetration testing methodology and common tools",
      "Certifications and career paths in cybersecurity",
    ],
    sections: [
      {
        heading: "The Cybersecurity Landscape",
        body: "Cybersecurity is the practice of defending digital systems, networks, and data from unauthorized access, disruption, or destruction. The field is organized around the CIA triad: Confidentiality (information is accessible only to authorized parties), Integrity (information is accurate and unmodified), and Availability (systems and data are accessible when needed).\n\nAttackers exploit vulnerabilities in software, human psychology (phishing), network configurations, and physical access. Defenders must understand all these attack vectors — the attacker's mindset is the defender's most valuable mental model.",
      },
      {
        heading: "Key Specializations",
        body: "Cybersecurity is a broad field with many specializations. Application Security (AppSec) focuses on securing software — finding and fixing vulnerabilities in code before attackers exploit them. Network Security focuses on protecting the infrastructure layer. Cloud Security extends security practices to AWS, GCP, and Azure environments.\n\nPenetration Testing (ethical hacking) involves authorized simulation of attacks to find vulnerabilities before real attackers do. Incident Response handles the aftermath of security breaches — containment, forensics, and recovery. Security Operations Centers (SOCs) monitor for threats 24/7 using SIEM tools like Splunk or Microsoft Sentinel.",
      },
      {
        heading: "Essential Skills and Tools",
        body: "Linux proficiency is foundational — most security tools run on Linux, and attackers frequently target Linux systems. Networking fundamentals (TCP/IP, DNS, HTTP, TLS) are non-negotiable. Python scripting is essential for automating security tasks and building custom tools.\n\nHands-on practice is the only way to learn security effectively. Platforms like TryHackMe and HackTheBox provide legal, gamified environments to practice offensive and defensive techniques. The OWASP Top 10 (the most critical web application vulnerabilities) is the canonical starting point for application security.",
      },
      {
        heading: "Career Path and Certifications",
        body: "The CompTIA Security+ is the industry-standard entry-level certification, accepted by both government and private sector employers globally. The Certified Ethical Hacker (CEH) validates penetration testing skills. For advanced practitioners, OSCP (Offensive Security Certified Professional) is the gold standard for penetration testers, and CISSP is the benchmark for senior security architects.\n\nIn India, cybersecurity roles pay ₹8–18 LPA for entry-level, ₹20–40 LPA for mid-level, and ₹40–80 LPA for specialized roles like cloud security architect or red team lead. The global shortage of qualified cybersecurity professionals continues to drive compensation up.",
      },
    ],
    keyTools: ["Linux", "Wireshark", "Nmap", "Burp Suite", "Metasploit", "Python", "Splunk", "Nessus", "TryHackMe / HackTheBox"],
  },

  {
    id: "CFA_Introduction",
    title: "CFA: Introduction",
    level: "Beginner",
    imageUrl: sbImg("CFA.png"),
    pdfUrl: sbPdf("Chartered Financial Analyst (CFA)  (1).pdf"),
    readTime: "9 min read",
    summary:
      "The Chartered Financial Analyst (CFA) designation is the gold standard credential in investment management and financial analysis. This guide covers what the CFA is, what it takes to earn it, and the careers it unlocks.",
    whatYouLearn: [
      "What the CFA designation is and who should pursue it",
      "The three levels of the CFA exam and their content focus",
      "Ethical standards and the CFA Institute Code of Conduct",
      "Core topics: equity analysis, fixed income, derivatives, and portfolio management",
      "A realistic study plan to pass CFA Level 1",
      "Career opportunities for CFA charterholders",
    ],
    sections: [
      {
        heading: "What is the CFA Designation?",
        body: "The CFA (Chartered Financial Analyst) designation is awarded by the CFA Institute to investment professionals who pass three rigorous examinations and meet experience requirements. It is the most respected credential in investment management, equity research, and portfolio management globally.\n\nCFA charterholders are found at asset management firms, investment banks, pension funds, sovereign wealth funds, hedge funds, and corporate finance departments. The credential signals mastery of financial analysis, ethical standards, and professional judgment — a combination that is hard to fake.",
      },
      {
        heading: "The Three Levels",
        body: "Level 1 tests knowledge and comprehension across ten topic areas: ethical standards, quantitative methods, economics, financial statement analysis, corporate issuers, equity investments, fixed income, derivatives, alternative investments, and portfolio management. It is a 270-question multiple choice exam split across two sessions.\n\nLevel 2 applies that knowledge to asset valuation scenarios using item-set questions (mini-cases with 4–6 questions each). Level 3 focuses on portfolio management and wealth planning, with essay questions that require synthesis and judgment, not just calculation. Most candidates take 2–5 years to pass all three levels.",
      },
      {
        heading: "Study Strategy",
        body: "The CFA Institute recommends 300+ hours of study per level. For Level 1, the Schweser or Wiley prep materials condense the curriculum into manageable study notes. A structured 6-month plan works well: cover the curriculum in the first 4 months, then spend 2 months on practice questions and mock exams.\n\nPractice problems are more important than re-reading notes. Do at least 2,000 practice questions before exam day, and complete 3–4 full mock exams under timed conditions. The pass rate for Level 1 is approximately 40–45% — the exam is genuinely difficult and rewards serious preparation.",
      },
      {
        heading: "Career Opportunities",
        body: "CFA charterholders work in equity research (covering sectors and writing investment reports), portfolio management (managing equity, fixed income, or multi-asset portfolios), investment banking (M&A, capital markets advisory), and risk management.\n\nIn India, CFA charterholders at AMCs, investment banks, and private equity firms earn ₹15–40 LPA at mid-career, with senior portfolio managers and research heads earning significantly higher at top asset management firms. The designation is particularly powerful for transitioning into buy-side roles from accounting or corporate finance backgrounds.",
      },
    ],
    keyTools: ["Excel (Financial Modelling)", "Bloomberg Terminal", "Python (quant finance)", "CFA Curriculum", "Schweser / Wiley Notes", "FactSet"],
  },

  {
    id: "App_Developer",
    title: "App Developer",
    level: "Beginner",
    imageUrl: sbImg("App developer.png"),
    pdfUrl: sbPdf("App Developer.pdf"),
    readTime: "10 min read",
    summary:
      "App Developers build the mobile applications that live on billions of smartphones worldwide. From consumer apps with hundreds of millions of users to enterprise productivity tools, mobile development is one of the most impactful and in-demand engineering disciplines.",
    whatYouLearn: [
      "Native iOS development with Swift and SwiftUI",
      "Native Android development with Kotlin and Jetpack Compose",
      "Cross-platform development with React Native and Flutter",
      "App architecture patterns: MVC, MVVM, and clean architecture",
      "App store submission, review guidelines, and monetization",
      "Performance optimization and debugging on mobile",
    ],
    sections: [
      {
        heading: "Native vs. Cross-Platform",
        body: "The fundamental choice in mobile development is native (building separately for iOS and Android) versus cross-platform (building once and deploying to both). Native development uses Swift/SwiftUI for iOS and Kotlin/Jetpack Compose for Android — it gives the best performance and deepest platform integration, but requires maintaining two codebases.\n\nCross-platform frameworks like React Native (JavaScript) and Flutter (Dart) let you write most code once while still accessing native APIs. React Native is backed by Meta and has a large ecosystem; Flutter, backed by Google, has an excellent rendering engine and is gaining rapidly in popularity. At most startups, cross-platform is the pragmatic choice.",
      },
      {
        heading: "Mobile App Architecture",
        body: "Good mobile architecture separates concerns cleanly, making code testable, maintainable, and scalable. The most common patterns are MVVM (Model-View-ViewModel) and Clean Architecture. In MVVM, the ViewModel holds state and business logic; the View (UI) observes the ViewModel and renders accordingly; the Model represents data and business rules.\n\nState management is a recurring challenge in mobile apps. React Native uses Redux, Zustand, or React Query. Flutter uses Bloc, Riverpod, or Provider. In native iOS, Combine and @Observable are the modern reactive state management tools. Choosing the right pattern early saves significant refactoring later.",
      },
      {
        heading: "App Store and Monetization",
        body: "Submitting an app to the App Store (Apple) or Play Store (Google) involves following strict review guidelines — apps are manually reviewed before publishing. Common rejection reasons include incomplete functionality, privacy policy violations, deceptive descriptions, and violations of payment guidelines (Apple requires in-app purchase for digital goods).\n\nMonetization models include freemium (basic free, premium paid), subscription (recurring revenue, preferred by investors), in-app purchases, and advertising. Subscription revenue with high retention is the gold standard for consumer apps; enterprise apps typically use seat-based licensing.",
      },
      {
        heading: "Career Opportunities",
        body: "Mobile developers are in high demand, particularly those with proven App Store track records. A portfolio of 2–3 published apps, even with modest download numbers, demonstrates end-to-end product skills. Contributing to popular open-source React Native or Flutter packages builds visibility in the developer community.\n\nSalaries for mobile developers at Indian product companies start at ₹10–18 LPA for junior roles. Senior mobile engineers with 3–5 years of experience earn ₹25–50 LPA. Developers with iOS or Android specialization at top consumer apps (Swiggy, Zepto, CRED) can earn ₹40–70 LPA.",
      },
    ],
    keyTools: ["Swift / SwiftUI", "Kotlin / Jetpack Compose", "React Native", "Flutter", "Xcode", "Android Studio", "Firebase", "Fastlane"],
  },
];
