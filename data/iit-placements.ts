// ──────────────────────────────────────────────
// IIT Placement Data — Single source of truth
// ──────────────────────────────────────────────

export interface BranchPlacement {
  branch: string;
  avgPackage: string;
  medianPackage: string;
}

export interface YearlyPlacement {
  year: number;
  highestPackage: string;
  averagePackage: string;
  medianPackage: string;
  placementPercentage: string;
  totalOffers: string;
  internationalOffers: string;
  topRecruiters: string[];
  branchWise: BranchPlacement[];
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface IITPlacementData {
  slug: string;
  name: string;
  fullName: string;
  city: string;
  state: string;
  nirfRank: number | null;
  generation: "gen1" | "gen2" | "gen3";
  description: string;
  placements: YearlyPlacement[];
  ocsLink: string;
  faqs: FAQ[];
  relatedIITs: string[];
}

// ──────────────────────────────────────────────
// Data for all 23 IITs
// ──────────────────────────────────────────────

export const IIT_PLACEMENT_DATA: IITPlacementData[] = [
  // ═══════════════════════════════════════════
  // GENERATION 1 — Original / Legacy IITs
  // ═══════════════════════════════════════════
  {
    slug: "iit-bombay",
    name: "IIT Bombay",
    fullName: "Indian Institute of Technology Bombay",
    city: "Mumbai",
    state: "Maharashtra",
    nirfRank: 2,
    generation: "gen1",
    description:
      "IIT Bombay, established in 1958, is consistently ranked among the top 2 engineering institutions in India. Located in Powai, Mumbai, IIT Bombay is renowned for its rigorous academic programmes, world-class research output, and an exceptionally strong placement record. The institute's Office of Career Services (OCS) coordinates one of the largest campus recruitment drives in Asia, attracting 300+ companies each year. IIT Bombay graduates are highly sought after by global technology giants, top-tier consulting firms, quantitative trading companies, and leading startups. The institute's proximity to India's financial capital gives students unique access to finance, fintech, and enterprise technology recruiters. With a sprawling 550-acre campus and over 16,000 students, IIT Bombay produces some of the highest-paid fresh graduates in the country year after year.",
    placements: [
      {
        year: 2025,
        highestPackage: "₹1.48 Cr+",
        averagePackage: "₹23.5 LPA",
        medianPackage: "₹18.5 LPA",
        placementPercentage: "95%+",
        totalOffers: "1400+",
        internationalOffers: "60+",
        topRecruiters: [
          "Google",
          "Microsoft",
          "Goldman Sachs",
          "JP Morgan",
          "Tower Research",
          "Uber",
          "Apple",
          "Qualcomm",
          "McKinsey",
          "BCG",
          "Flipkart",
          "Amazon",
          "DE Shaw",
          "Graviton",
          "Optiver",
        ],
        branchWise: [
          { branch: "Computer Science", avgPackage: "₹55 LPA", medianPackage: "₹42 LPA" },
          { branch: "Electrical Engineering", avgPackage: "₹28 LPA", medianPackage: "₹22 LPA" },
          { branch: "Mechanical Engineering", avgPackage: "₹18 LPA", medianPackage: "₹16 LPA" },
          { branch: "Chemical Engineering", avgPackage: "₹17 LPA", medianPackage: "₹15 LPA" },
          { branch: "Civil Engineering", avgPackage: "₹16 LPA", medianPackage: "₹14 LPA" },
          { branch: "Aerospace Engineering", avgPackage: "₹19 LPA", medianPackage: "₹16 LPA" },
          { branch: "Engineering Physics", avgPackage: "₹26 LPA", medianPackage: "₹20 LPA" },
          { branch: "Metallurgical Engineering", avgPackage: "₹16.5 LPA", medianPackage: "₹14 LPA" },
        ],
      },
      {
        year: 2024,
        highestPackage: "₹1.31 Cr",
        averagePackage: "₹21.8 LPA",
        medianPackage: "₹17 LPA",
        placementPercentage: "93%",
        totalOffers: "1350+",
        internationalOffers: "55+",
        topRecruiters: [
          "Google",
          "Microsoft",
          "Goldman Sachs",
          "Tower Research",
          "Uber",
          "Qualcomm",
          "McKinsey",
          "BCG",
          "Flipkart",
          "Amazon",
        ],
        branchWise: [
          { branch: "Computer Science", avgPackage: "₹50 LPA", medianPackage: "₹40 LPA" },
          { branch: "Electrical Engineering", avgPackage: "₹26 LPA", medianPackage: "₹20 LPA" },
          { branch: "Mechanical Engineering", avgPackage: "₹17 LPA", medianPackage: "₹15 LPA" },
        ],
      },
      {
        year: 2023,
        highestPackage: "₹1.68 Cr",
        averagePackage: "₹21.8 LPA",
        medianPackage: "₹18 LPA",
        placementPercentage: "95%",
        totalOffers: "1500+",
        internationalOffers: "70+",
        topRecruiters: [
          "Google",
          "Microsoft",
          "Goldman Sachs",
          "Tower Research",
          "Apple",
          "Qualcomm",
          "McKinsey",
          "BCG",
        ],
        branchWise: [
          { branch: "Computer Science", avgPackage: "₹48 LPA", medianPackage: "₹38 LPA" },
          { branch: "Electrical Engineering", avgPackage: "₹24 LPA", medianPackage: "₹19 LPA" },
          { branch: "Mechanical Engineering", avgPackage: "₹16.5 LPA", medianPackage: "₹14 LPA" },
        ],
      },
    ],
    ocsLink: "https://placements.iitb.ac.in/",
    faqs: [
      {
        question: "What is the highest package offered at IIT Bombay in 2025?",
        answer:
          "The highest package at IIT Bombay for the 2024-25 placement season exceeded ₹1.48 Crore per annum. This was offered by a leading quantitative trading firm for a role in algorithmic trading and quantitative research. Such packages typically include a base salary, performance bonuses, and stock options, with the total compensation often significantly exceeding the base. IIT Bombay consistently records some of the highest placement packages among all IITs in India.",
      },
      {
        question: "What is the average salary at IIT Bombay?",
        answer:
          "The average salary at IIT Bombay for the 2024-25 placement season was approximately ₹23.5 LPA across all branches and degree programmes. However, this number varies significantly by department — Computer Science graduates averaged around ₹55 LPA, while core engineering branches like Mechanical and Chemical averaged ₹17-18 LPA. The median package, which is often a more representative metric, stood at around ₹18.5 LPA.",
      },
      {
        question: "Which companies recruit from IIT Bombay?",
        answer:
          "Over 300 companies recruit from IIT Bombay each year across diverse sectors. The top recruiters include global technology giants like Google, Microsoft, Apple, and Amazon; consulting firms such as McKinsey, BCG, and Bain; financial institutions like Goldman Sachs, JP Morgan, and Morgan Stanley; quantitative trading firms including Tower Research, DE Shaw, Graviton, and Optiver; and leading Indian startups like Flipkart, Zomato, and PhonePe. The recruitment spans software engineering, data science, product management, consulting, finance, and core engineering roles.",
      },
      {
        question: "What is the placement percentage at IIT Bombay?",
        answer:
          "IIT Bombay typically achieves a placement rate of 93-95% for students who register for the placement process. It is important to note that not all students register for placements — many opt for higher studies (MS/PhD abroad), entrepreneurship, or civil services preparation. Of those who actively participate in the placement process, the overwhelming majority receive at least one offer by the end of the placement season, which spans from December through May.",
      },
      {
        question: "How does IIT Bombay's placement process work?",
        answer:
          "IIT Bombay's placement process is managed by the Office of Career Services (OCS) and follows a structured Day-based system. Companies are slotted into specific days based on the compensation they offer — Day 1 companies offer the highest packages. The process begins in December with Phase 1 (the main placement season) and continues with Phase 2 for remaining students. Before formal placements, many students receive Pre-Placement Offers (PPOs) through their internships. The institute also conducts a robust internship season separately.",
      },
      {
        question: "Do international companies hire from IIT Bombay?",
        answer:
          "Yes, IIT Bombay attracts significant international recruitment. In the 2024-25 season, over 60 international offers were made, with placements in the United States, Singapore, Japan, Europe, and the Middle East. Companies like Google, Microsoft, Apple, Uber, and several quantitative trading firms offer roles at their global offices. International offers tend to carry higher compensation due to cost-of-living adjustments, often crossing the ₹1 Crore mark in total CTC.",
      },
    ],
    relatedIITs: ["iit-delhi", "iit-madras", "iit-kanpur"],
  },

  {
    slug: "iit-delhi",
    name: "IIT Delhi",
    fullName: "Indian Institute of Technology Delhi",
    city: "New Delhi",
    state: "Delhi",
    nirfRank: 1,
    generation: "gen1",
    description:
      "IIT Delhi, established in 1961, holds the top rank in India's NIRF Engineering rankings. Situated in the heart of New Delhi near Hauz Khas, IIT Delhi benefits from its strategic location in the national capital, giving students access to government organizations, leading consultancies, think tanks, and international corporations with Indian headquarters. The institute's Office of Career Services manages a rigorous and highly organized placement process that regularly sees over 1,200 offers extended to students across B.Tech, M.Tech, MBA, MSc, and PhD programmes. IIT Delhi is particularly strong in placements for consulting, policy, and technology roles, and its alumni network is one of the most influential in India's corporate and entrepreneurial ecosystem.",
    placements: [
      {
        year: 2025,
        highestPackage: "₹1.1 Cr+",
        averagePackage: "₹22 LPA",
        medianPackage: "₹18 LPA",
        placementPercentage: "94%",
        totalOffers: "1200+",
        internationalOffers: "50+",
        topRecruiters: [
          "Google",
          "Microsoft",
          "Goldman Sachs",
          "McKinsey",
          "BCG",
          "Bain",
          "Amazon",
          "Flipkart",
          "Uber",
          "Tower Research",
          "Samsung",
          "Qualcomm",
          "Texas Instruments",
          "JP Morgan",
        ],
        branchWise: [
          { branch: "Computer Science", avgPackage: "₹50 LPA", medianPackage: "₹40 LPA" },
          { branch: "Electrical Engineering", avgPackage: "₹26 LPA", medianPackage: "₹20 LPA" },
          { branch: "Mechanical Engineering", avgPackage: "₹17 LPA", medianPackage: "₹15 LPA" },
          { branch: "Chemical Engineering", avgPackage: "₹16 LPA", medianPackage: "₹14 LPA" },
          { branch: "Civil Engineering", avgPackage: "₹15 LPA", medianPackage: "₹13 LPA" },
          { branch: "Textile Technology", avgPackage: "₹14 LPA", medianPackage: "₹12 LPA" },
          { branch: "Engineering Physics", avgPackage: "₹24 LPA", medianPackage: "₹19 LPA" },
        ],
        },
      {
        year: 2024,
        highestPackage: "₹1.0 Cr+",
        averagePackage: "₹20.5 LPA",
        medianPackage: "₹17 LPA",
        placementPercentage: "92%",
        totalOffers: "1150+",
        internationalOffers: "45+",
        topRecruiters: [
          "Google",
          "Microsoft",
          "Goldman Sachs",
          "McKinsey",
          "BCG",
          "Amazon",
          "Flipkart",
          "Tower Research",
        ],
        branchWise: [
          { branch: "Computer Science", avgPackage: "₹47 LPA", medianPackage: "₹38 LPA" },
          { branch: "Electrical Engineering", avgPackage: "₹24 LPA", medianPackage: "₹19 LPA" },
          { branch: "Mechanical Engineering", avgPackage: "₹16 LPA", medianPackage: "₹14 LPA" },
        ],
      },
    ],
    ocsLink: "https://ocs.iitd.ac.in/",
    faqs: [
      {
        question: "What is the highest package at IIT Delhi in 2025?",
        answer:
          "The highest package at IIT Delhi for the 2024-25 placement season exceeded ₹1.1 Crore per annum. This was offered by a prominent quantitative trading firm. IIT Delhi has consistently seen top packages in the range of ₹80 LPA to ₹1.1 Cr+ over the past several years, with the highest offers typically going to students in Computer Science and related departments who are placed in algorithmic trading, AI research, or senior software engineering roles at top global firms.",
      },
      {
        question: "What is the average package at IIT Delhi?",
        answer:
          "The average package at IIT Delhi for the 2024-25 placement season was approximately ₹22 LPA. Computer Science students averaged around ₹50 LPA, while Electrical Engineering students averaged ₹26 LPA. Core branches like Mechanical, Chemical, and Civil had averages in the ₹15-17 LPA range. The median package across all branches was approximately ₹18 LPA, reflecting the broad distribution of offers across sectors and roles.",
      },
      {
        question: "Which sectors hire the most from IIT Delhi?",
        answer:
          "The placement data from IIT Delhi shows that Core Technical roles are the largest sector (approximately 34% of all placements), followed by Information Technology (20%), Consulting (14%), Finance and Analytics (12%), and Research & Development (10%). This distribution reflects IIT Delhi's strength in producing graduates suited for technical roles while also being a strong feeder for management consulting and financial services firms.",
      },
      {
        question: "How many students get placed at IIT Delhi?",
        answer:
          "In the 2024-25 placement season, over 1,200 offers were made to IIT Delhi students, with approximately 1,150 students placed in Phase 1 itself. The overall placement rate for registered students is typically around 92-94%. Students who don't get placed through the campus process often choose alternative paths such as higher education, entrepreneurship, or off-campus opportunities through their strong alumni network.",
      },
      {
        question: "Does IIT Delhi offer international placements?",
        answer:
          "Yes, IIT Delhi has a robust international placement track record. In the 2024-25 season, over 50 international offers were made across locations including the United States, Singapore, Japan, South Korea, and Europe. Companies like Google, Microsoft, Uber, and various quantitative trading firms regularly offer positions at their international offices to top IIT Delhi graduates.",
      },
      {
        question: "What is the placement process at IIT Delhi?",
        answer:
          "IIT Delhi's placement process is coordinated by the Office of Career Services (OCS). It follows a slot-based system where companies are grouped by the compensation they offer. Phase 1 runs from December to February and accounts for the majority of placements. Phase 2 continues through May for remaining students. The process includes pre-placement talks, online tests, group discussions, and interviews conducted on campus. Many students also secure PPOs (Pre-Placement Offers) through summer internships.",
      },
    ],
    relatedIITs: ["iit-bombay", "iit-kanpur", "iit-roorkee"],
  },

  {
    slug: "iit-madras",
    name: "IIT Madras",
    fullName: "Indian Institute of Technology Madras",
    city: "Chennai",
    state: "Tamil Nadu",
    nirfRank: 3,
    generation: "gen1",
    description:
      "IIT Madras, established in 1959, is one of India's most prestigious engineering institutions and consistently ranks in the top 3. Set within 617 acres of reserved forest inside the Guindy National Park in Chennai, IIT Madras is known for its outstanding research output, strong industry connections, and a vibrant startup ecosystem (the IIT Madras Research Park is India's first university-based research park). The Centre for International and Corporate Relations (CICR) manages placements, attracting over 300 companies annually. IIT Madras is particularly strong in data science, AI/ML, and core engineering placements, with a growing reputation in semiconductor and VLSI design roles given the presence of major chip design companies in Chennai and Bengaluru.",
    placements: [
      {
        year: 2025,
        highestPackage: "₹1.1 Cr+",
        averagePackage: "₹21.5 LPA",
        medianPackage: "₹17.5 LPA",
        placementPercentage: "94%",
        totalOffers: "1300+",
        internationalOffers: "40+",
        topRecruiters: [
          "Google",
          "Microsoft",
          "Goldman Sachs",
          "Amazon",
          "Flipkart",
          "Qualcomm",
          "Texas Instruments",
          "Samsung",
          "McKinsey",
          "BCG",
          "Tower Research",
          "DE Shaw",
          "Oracle",
          "Intel",
        ],
        branchWise: [
          { branch: "Computer Science", avgPackage: "₹53.2 LPA", medianPackage: "₹42 LPA" },
          { branch: "Electrical Engineering", avgPackage: "₹28.8 LPA", medianPackage: "₹22 LPA" },
          { branch: "Mechanical Engineering", avgPackage: "₹17 LPA", medianPackage: "₹15 LPA" },
          { branch: "Chemical Engineering", avgPackage: "₹16 LPA", medianPackage: "₹14 LPA" },
          { branch: "Civil Engineering", avgPackage: "₹15 LPA", medianPackage: "₹13 LPA" },
          { branch: "Aerospace Engineering", avgPackage: "₹18 LPA", medianPackage: "₹15.5 LPA" },
          { branch: "Engineering Design", avgPackage: "₹20 LPA", medianPackage: "₹17 LPA" },
          { branch: "MBA", avgPackage: "₹17.9 LPA", medianPackage: "₹15 LPA" },
        ],
      },
      {
        year: 2024,
        highestPackage: "₹1.0 Cr+",
        averagePackage: "₹20 LPA",
        medianPackage: "₹16.5 LPA",
        placementPercentage: "92%",
        totalOffers: "1250+",
        internationalOffers: "35+",
        topRecruiters: [
          "Google",
          "Microsoft",
          "Amazon",
          "Qualcomm",
          "Texas Instruments",
          "Goldman Sachs",
          "McKinsey",
          "Samsung",
        ],
        branchWise: [
          { branch: "Computer Science", avgPackage: "₹48 LPA", medianPackage: "₹38 LPA" },
          { branch: "Electrical Engineering", avgPackage: "₹26 LPA", medianPackage: "₹20 LPA" },
          { branch: "Mechanical Engineering", avgPackage: "₹16 LPA", medianPackage: "₹14 LPA" },
        ],
      },
    ],
    ocsLink: "https://placement.iitm.ac.in/",
    faqs: [
      {
        question: "What is the highest package at IIT Madras in 2025?",
        answer:
          "The highest package at IIT Madras for the 2024-25 placement season exceeded ₹1.1 Crore per annum. This offer came from a leading quantitative finance firm. IIT Madras has seen its highest packages grow steadily, crossing the ₹1 Cr mark consistently in recent years. The institute's strong Computer Science and Data Science programmes produce graduates who command top-tier compensation from global technology and finance firms.",
      },
      {
        question: "What is the average package at IIT Madras?",
        answer:
          "The average package at IIT Madras for the 2024-25 season was approximately ₹21.5 LPA across all programmes. CSE graduates commanded the highest average at ₹53.2 LPA, followed by Electrical Engineering at ₹28.8 LPA. The MBA programme through the Department of Management Studies recorded an average of ₹17.9 LPA. The median package stood at around ₹17.5 LPA, reflecting the distribution across different branches and degree levels.",
      },
      {
        question: "How many companies recruit from IIT Madras?",
        answer:
          "Over 300 companies participate in IIT Madras campus placements each year. These span technology, consulting, finance, core engineering, FMCG, analytics, and the public sector. IIT Madras's location in Chennai — a hub for automobile, manufacturing, and semiconductor companies — gives it unique access to core engineering recruiters alongside the standard tech and finance firms that recruit from all top IITs.",
      },
      {
        question: "What makes IIT Madras placements unique?",
        answer:
          "IIT Madras stands out for several reasons: its Computer Science average package consistently ranks among the top 2-3 across all IITs; its Research Park ecosystem creates unique startup placement opportunities; its proximity to semiconductor hubs in Chennai and Bengaluru attracts major chip design companies like Texas Instruments, Qualcomm, Intel, and Samsung LSI; and its strong MBA programme through DoMS adds management placements to the mix. The institute also hosts over 2,000 students in its placement pool, making it one of the largest by volume.",
      },
      {
        question: "Does IIT Madras have good placements for core branches?",
        answer:
          "Yes, IIT Madras is particularly strong for core engineering placements compared to other top IITs. Branches like Mechanical, Chemical, and Civil Engineering see better placement numbers here due to Chennai's industrial ecosystem. Companies like L&T, Tata Steel, Caterpillar, Shell, Schlumberger, and ISRO regularly recruit from core branches. The average package for Mechanical Engineering is around ₹17 LPA, which is competitive among top IITs for non-CS branches.",
      },
    ],
    relatedIITs: ["iit-bombay", "iit-hyderabad", "iit-delhi"],
  },

  {
    slug: "iit-kanpur",
    name: "IIT Kanpur",
    fullName: "Indian Institute of Technology Kanpur",
    city: "Kanpur",
    state: "Uttar Pradesh",
    nirfRank: 4,
    generation: "gen1",
    description:
      "IIT Kanpur, established in 1959, is one of the original five IITs and has a storied legacy of producing some of India's most accomplished technologists, entrepreneurs, and academicians. Located on a 1,055-acre campus on the banks of the Ganges in Kanpur, UP, the institute is known for its strong academic culture, pioneering computer science department (one of the first in India), and a focus on research-driven education. The Students' Placement Office (SPO) coordinates placements that attract 250+ companies annually. IIT Kanpur alumni have founded or led companies like Flipkart, InfoEdge (Naukri.com), and HCL, lending the institute a powerful entrepreneurial legacy.",
    placements: [
      {
        year: 2025,
        highestPackage: "₹90 LPA+",
        averagePackage: "₹21 LPA",
        medianPackage: "₹17 LPA",
        placementPercentage: "90%",
        totalOffers: "1100+",
        internationalOffers: "30+",
        topRecruiters: [
          "Google",
          "Microsoft",
          "Goldman Sachs",
          "Samsung",
          "Qualcomm",
          "McKinsey",
          "BCG",
          "Amazon",
          "Flipkart",
          "Tower Research",
          "DE Shaw",
          "Texas Instruments",
        ],
        branchWise: [
          { branch: "Computer Science", avgPackage: "₹45 LPA", medianPackage: "₹36 LPA" },
          { branch: "Electrical Engineering", avgPackage: "₹24 LPA", medianPackage: "₹19 LPA" },
          { branch: "Mechanical Engineering", avgPackage: "₹16 LPA", medianPackage: "₹14 LPA" },
          { branch: "Chemical Engineering", avgPackage: "₹15 LPA", medianPackage: "₹13 LPA" },
          { branch: "Civil Engineering", avgPackage: "₹14.5 LPA", medianPackage: "₹12.5 LPA" },
          { branch: "Aerospace Engineering", avgPackage: "₹17 LPA", medianPackage: "₹15 LPA" },
        ],
      },
      {
        year: 2024,
        highestPackage: "₹80 LPA+",
        averagePackage: "₹19.5 LPA",
        medianPackage: "₹16 LPA",
        placementPercentage: "88%",
        totalOffers: "1050+",
        internationalOffers: "25+",
        topRecruiters: [
          "Google",
          "Microsoft",
          "Goldman Sachs",
          "Samsung",
          "Amazon",
          "McKinsey",
          "Tower Research",
        ],
        branchWise: [
          { branch: "Computer Science", avgPackage: "₹42 LPA", medianPackage: "₹34 LPA" },
          { branch: "Electrical Engineering", avgPackage: "₹22 LPA", medianPackage: "₹18 LPA" },
          { branch: "Mechanical Engineering", avgPackage: "₹15 LPA", medianPackage: "₹13 LPA" },
        ],
      },
    ],
    ocsLink: "https://spo.iitk.ac.in/",
    faqs: [
      {
        question: "What is the highest package at IIT Kanpur in 2025?",
        answer:
          "The highest package at IIT Kanpur for the 2024-25 placement season was over ₹90 LPA. This was typically offered by quantitative trading firms or global tech companies for specialized roles. While this is lower than the ₹1 Cr+ figures at IIT Bombay and Delhi, IIT Kanpur's average and median packages remain highly competitive, and its computer science programme consistently commands premium salaries.",
      },
      {
        question: "What is the average salary at IIT Kanpur?",
        answer:
          "The average salary at IIT Kanpur for the 2024-25 season was approximately ₹21 LPA. Computer Science students averaged around ₹45 LPA, Electrical Engineering around ₹24 LPA, and core branches in the ₹14-17 LPA range. The median package was ₹17 LPA, indicating a healthy distribution of salaries across the student body with fewer extreme outliers skewing the data.",
      },
      {
        question: "Is IIT Kanpur good for placements?",
        answer:
          "Yes, IIT Kanpur offers excellent placement opportunities. With a placement rate of approximately 90% for registered students and an average package of ₹21 LPA, it ranks among the top 5 IITs for campus recruitment. The institute's legendary computer science department, strong alumni network, and reputation for producing problem-solvers make its graduates highly valued. The only challenge is its location in Kanpur, which means slightly fewer recruiters visit compared to metro-based IITs — but the top-tier companies are all present.",
      },
      {
        question: "Which companies recruit from IIT Kanpur?",
        answer:
          "Over 250 companies recruit from IIT Kanpur. The major recruiters include Google, Microsoft, Amazon, Goldman Sachs, Samsung, Qualcomm, Texas Instruments, McKinsey, BCG, Tower Research, DE Shaw, Flipkart, and many more. The institute sees strong recruitment from both tech and non-tech sectors, with consulting firms and financial institutions being particularly active.",
      },
      {
        question: "How does IIT Kanpur compare to IIT Bombay for placements?",
        answer:
          "IIT Kanpur and IIT Bombay are both tier-1 IITs with exceptional placement records. IIT Bombay typically has a higher average package (₹23.5 LPA vs ₹21 LPA) and more international offers due to its Mumbai location. However, IIT Kanpur's CS programme is equally respected, and the gap between the two has narrowed significantly. For core branches, the difference is minimal. IIT Kanpur's stronger academic culture (more students pursue research/PhD) also means slightly fewer students enter the placement pool.",
      },
    ],
    relatedIITs: ["iit-delhi", "iit-bombay", "iit-kharagpur"],
  },

  {
    slug: "iit-kharagpur",
    name: "IIT Kharagpur",
    fullName: "Indian Institute of Technology Kharagpur",
    city: "Kharagpur",
    state: "West Bengal",
    nirfRank: 5,
    generation: "gen1",
    description:
      "IIT Kharagpur, established in 1951, is the oldest and largest IIT, spread across a massive 2,100-acre campus in Kharagpur, West Bengal. Known as the 'Institute of Eminence,' IIT KGP has the widest range of academic departments among all IITs, offering programmes across engineering, science, management, law, architecture, and medicine. The Career Development Centre (CDC) manages one of the country's largest placement drives, regularly attracting 250+ recruiters and extending over 1,000 offers. IIT KGP's sheer scale — with over 12,000 students — means it places more graduates in absolute numbers than almost any other IIT. The 2024-25 season saw a record-breaking highest package of ₹2.44 Crore, the highest across all IITs.",
    placements: [
      {
        year: 2025,
        highestPackage: "₹2.44 Cr",
        averagePackage: "₹21 LPA",
        medianPackage: "₹16.5 LPA",
        placementPercentage: "90%",
        totalOffers: "1200+",
        internationalOffers: "15+",
        topRecruiters: [
          "Google",
          "Microsoft",
          "Goldman Sachs",
          "Amazon",
          "Flipkart",
          "Samsung",
          "Qualcomm",
          "JP Morgan",
          "BCG",
          "McKinsey",
          "Shell",
          "Tata Steel",
          "L&T",
          "Schlumberger",
        ],
        branchWise: [
          { branch: "Computer Science", avgPackage: "₹42 LPA", medianPackage: "₹34 LPA" },
          { branch: "Electrical Engineering", avgPackage: "₹22 LPA", medianPackage: "₹18 LPA" },
          { branch: "Mechanical Engineering", avgPackage: "₹16 LPA", medianPackage: "₹14 LPA" },
          { branch: "Chemical Engineering", avgPackage: "₹15.5 LPA", medianPackage: "₹13.5 LPA" },
          { branch: "Civil Engineering", avgPackage: "₹14 LPA", medianPackage: "₹12 LPA" },
          { branch: "Mining Engineering", avgPackage: "₹13 LPA", medianPackage: "₹11.5 LPA" },
          { branch: "Architecture", avgPackage: "₹12 LPA", medianPackage: "₹10.5 LPA" },
        ],
      },
      {
        year: 2024,
        highestPackage: "₹1.2 Cr+",
        averagePackage: "₹19.5 LPA",
        medianPackage: "₹15.5 LPA",
        placementPercentage: "88%",
        totalOffers: "1100+",
        internationalOffers: "12+",
        topRecruiters: [
          "Google",
          "Microsoft",
          "Amazon",
          "Goldman Sachs",
          "Samsung",
          "Flipkart",
          "BCG",
          "Shell",
        ],
        branchWise: [
          { branch: "Computer Science", avgPackage: "₹39 LPA", medianPackage: "₹32 LPA" },
          { branch: "Electrical Engineering", avgPackage: "₹20 LPA", medianPackage: "₹17 LPA" },
          { branch: "Mechanical Engineering", avgPackage: "₹15 LPA", medianPackage: "₹13 LPA" },
        ],
      },
    ],
    ocsLink: "https://cdc.iitkgp.ac.in/",
    faqs: [
      {
        question: "What is the highest package at IIT Kharagpur in 2025?",
        answer:
          "IIT Kharagpur recorded the highest placement package across all IITs in the 2024-25 season at ₹2.44 Crore per annum. This exceptional offer was made by a leading quantitative trading and financial technology firm. The package represents a significant jump from the previous year's highest of ₹1.2 Cr+, demonstrating the growing demand for top-tier engineering talent from IIT KGP in the quantitative finance sector.",
      },
      {
        question: "How many students get placed at IIT Kharagpur?",
        answer:
          "In the 2024-25 placement season, over 1,079 students were placed in Phase 1 alone, with 250+ recruiters participating. The total number of offers exceeded 1,200 across all phases. Given that IIT KGP has one of the largest student bodies among IITs, the absolute number of placements is among the highest. The placement percentage for registered students is approximately 90%.",
      },
      {
        question: "Is IIT Kharagpur better than IIT Bombay for placements?",
        answer:
          "Both IIT Kharagpur and IIT Bombay are elite institutions with excellent placement records. IIT Bombay has a higher average package (₹23.5 LPA vs ₹21 LPA) and more international offers due to its location advantage in Mumbai. However, IIT KGP recorded the highest package across all IITs in 2025 at ₹2.44 Cr. IIT KGP's wider range of departments means more diverse career paths, and its massive alumni network provides unique opportunities. The choice depends more on the specific branch and career goal than a blanket comparison.",
      },
      {
        question: "What are the top recruiting sectors at IIT Kharagpur?",
        answer:
          "IIT Kharagpur sees recruitment across a very wide range of sectors: Information Technology (the largest sector with companies like Google, Microsoft, Amazon), Consulting (McKinsey, BCG, Bain), Finance (Goldman Sachs, JP Morgan, DE Shaw), Core Engineering (Tata Steel, L&T, Shell, Schlumberger, ONGC), FMCG (HUL, P&G), and Analytics/Data Science. IIT KGP is particularly strong in core engineering placements due to its large number of core departments including Mining, Ocean Engineering, and Geology.",
      },
      {
        question: "Does IIT Kharagpur have international placements?",
        answer:
          "Yes, IIT Kharagpur offers international placements, though the number is lower compared to IIT Bombay and Delhi. In the 2024-25 season, 15 international offers were made, with placements in Singapore, Japan, the US, and Europe. The number has been growing steadily as more global firms discover the quality of IIT KGP talent. The institute's CDC is actively working to increase international recruitment participation.",
      },
    ],
    relatedIITs: ["iit-bombay", "iit-delhi", "iit-bhu-varanasi"],
  },

  {
    slug: "iit-roorkee",
    name: "IIT Roorkee",
    fullName: "Indian Institute of Technology Roorkee",
    city: "Roorkee",
    state: "Uttarakhand",
    nirfRank: 6,
    generation: "gen1",
    description:
      "IIT Roorkee, originally established in 1847 as the Thomason College of Civil Engineering, is the oldest technical institution in Asia. Converted to an IIT in 2001, IIT Roorkee in Uttarakhand carries a heritage of over 175 years of engineering education. The institute has modernized rapidly since joining the IIT system, with strong improvements in placement numbers and average packages. The Placement and Internship Cell (PIC) manages campus recruitment that attracts 250+ companies. IIT Roorkee is particularly well-regarded for civil engineering, earthquake engineering, and water resources, while also building competitive CSE and IT programmes. Its location in the foothills of the Himalayas provides a unique campus experience.",
    placements: [
      {
        year: 2025,
        highestPackage: "₹80 LPA+",
        averagePackage: "₹19.5 LPA",
        medianPackage: "₹16 LPA",
        placementPercentage: "88%",
        totalOffers: "1000+",
        internationalOffers: "15+",
        topRecruiters: [
          "Google",
          "Microsoft",
          "Amazon",
          "Goldman Sachs",
          "Samsung",
          "Qualcomm",
          "McKinsey",
          "Flipkart",
          "Uber",
          "Tower Research",
          "L&T",
          "Tata Steel",
        ],
        branchWise: [
          { branch: "Computer Science", avgPackage: "₹38 LPA", medianPackage: "₹30 LPA" },
          { branch: "Electrical Engineering", avgPackage: "₹21 LPA", medianPackage: "₹17.5 LPA" },
          { branch: "Mechanical Engineering", avgPackage: "₹15.5 LPA", medianPackage: "₹13.5 LPA" },
          { branch: "Civil Engineering", avgPackage: "₹14 LPA", medianPackage: "₹12 LPA" },
          { branch: "Chemical Engineering", avgPackage: "₹14.5 LPA", medianPackage: "₹12.5 LPA" },
          { branch: "Metallurgical Engineering", avgPackage: "₹14 LPA", medianPackage: "₹12 LPA" },
        ],
      },
    ],
    ocsLink: "https://placement.iitr.ac.in/",
    faqs: [
      {
        question: "What is the highest package at IIT Roorkee?",
        answer:
          "The highest package at IIT Roorkee for the 2024-25 placement season was over ₹80 LPA. This offer typically comes from quantitative trading firms or leading technology companies. While this is lower than the ₹1 Cr+ packages at IIT Bombay, Delhi, and Madras, IIT Roorkee's packages have been increasing steadily, and the institute offers strong placement opportunities across both tech and core engineering sectors.",
      },
      {
        question: "What is the average salary at IIT Roorkee?",
        answer:
          "The average salary at IIT Roorkee for 2024-25 was approximately ₹19.5 LPA. The median package was ₹16 LPA. Computer Science graduates led with an average of ₹38 LPA, followed by Electrical Engineering at ₹21 LPA. Core branches like Mechanical, Civil, and Chemical had averages in the ₹14-15.5 LPA range, which is respectable and reflects strong core engineering recruitment.",
      },
      {
        question: "Is IIT Roorkee good for civil engineering placements?",
        answer:
          "IIT Roorkee is historically one of the best institutions in India for civil engineering, given its 175+ year heritage in the field. The department has strong connections with infrastructure companies, government bodies, and consulting firms. Civil engineering graduates receive offers from L&T, Tata Projects, NHAI, and consulting firms. While the average salary for civil engineering (₹14 LPA) is lower than CS, the career growth trajectory in infrastructure is strong.",
      },
      {
        question: "How does IIT Roorkee compare to other IITs?",
        answer:
          "IIT Roorkee ranks 6th in the NIRF Engineering rankings and is part of the original gen-1 IIT group. Its placement numbers are slightly lower than the top 4-5 IITs in terms of average package, but the gap has narrowed significantly in recent years. For Computer Science, the average (₹38 LPA) is competitive with most IITs. IIT Roorkee's unique strength lies in its civil, earthquake, and hydrology departments, which are among the best in the world.",
      },
      {
        question: "Which companies hire from IIT Roorkee?",
        answer:
          "Over 250 companies recruit from IIT Roorkee annually. Key recruiters include Google, Microsoft, Amazon, Goldman Sachs, Samsung, Qualcomm, McKinsey, Flipkart, Uber, Tower Research, L&T, and Tata Steel. The recruitment spans technology, consulting, finance, core engineering, FMCG, and analytics sectors. The institute has also seen increasing participation from startups and mid-stage companies in recent years.",
      },
    ],
    relatedIITs: ["iit-delhi", "iit-kanpur", "iit-guwahati"],
  },

  {
    slug: "iit-guwahati",
    name: "IIT Guwahati",
    fullName: "Indian Institute of Technology Guwahati",
    city: "Guwahati",
    state: "Assam",
    nirfRank: 7,
    generation: "gen1",
    description:
      "IIT Guwahati, established in 1994, is the youngest of the gen-1 IITs and sits on a stunning 700-acre campus on the banks of the Brahmaputra river. Despite being newer than the original five, IIT Guwahati has rapidly climbed to NIRF rank 7 and established itself as a premier research and teaching institution. The Centre for Career Development (CCD) manages placements that attract 200+ companies. IIT Guwahati is known for its strong departments in CSE, EE, and Design, and has been a pioneer in integrating design thinking into engineering education. The institute's location in Northeast India has also made it a hub for development-sector recruitment and international collaborations with Southeast Asian countries.",
    placements: [
      {
        year: 2025,
        highestPackage: "₹75 LPA+",
        averagePackage: "₹19 LPA",
        medianPackage: "₹15.5 LPA",
        placementPercentage: "88%",
        totalOffers: "900+",
        internationalOffers: "10+",
        topRecruiters: [
          "Google",
          "Microsoft",
          "Amazon",
          "Goldman Sachs",
          "Samsung",
          "Qualcomm",
          "Flipkart",
          "McKinsey",
          "Uber",
          "Oracle",
          "Cisco",
        ],
        branchWise: [
          { branch: "Computer Science", avgPackage: "₹36 LPA", medianPackage: "₹28 LPA" },
          { branch: "Electrical Engineering", avgPackage: "₹20 LPA", medianPackage: "₹16.5 LPA" },
          { branch: "Mechanical Engineering", avgPackage: "₹15 LPA", medianPackage: "₹13 LPA" },
          { branch: "Chemical Engineering", avgPackage: "₹14 LPA", medianPackage: "₹12 LPA" },
          { branch: "Civil Engineering", avgPackage: "₹13.5 LPA", medianPackage: "₹11.5 LPA" },
          { branch: "Design", avgPackage: "₹18 LPA", medianPackage: "₹15 LPA" },
        ],
      },
    ],
    ocsLink: "https://placement.iitg.ac.in/",
    faqs: [
      {
        question: "What is the highest package at IIT Guwahati?",
        answer:
          "The highest package at IIT Guwahati for the 2024-25 placement season was over ₹75 LPA, offered by a quantitative trading or tech firm. While this is lower than the top 4-5 IITs, IIT Guwahati's placement numbers have been improving rapidly year-over-year. The institute's growing reputation and strong CSE department are attracting higher-paying recruiters each year.",
      },
      {
        question: "What is the average package at IIT Guwahati?",
        answer:
          "The average package at IIT Guwahati for 2024-25 was approximately ₹19 LPA, with a median of ₹15.5 LPA. Computer Science graduates averaged ₹36 LPA, Electrical Engineering ₹20 LPA, and the Design programme ₹18 LPA. Core branches averaged in the ₹13-15 LPA range. These numbers have shown consistent improvement over the past 3-4 years as the institute attracts more top-tier recruiters.",
      },
      {
        question: "Is IIT Guwahati good for design placements?",
        answer:
          "Yes, IIT Guwahati is one of the few IITs with a dedicated Department of Design, offering B.Des and M.Des programmes. The design graduates average around ₹18 LPA and are recruited by companies like Samsung, Google, Microsoft, Adobe, and several design consultancies. IIT Guwahati was among the pioneers of design education within the IIT system, and its design alumni are well-placed across the product design and UX industry.",
      },
      {
        question: "How does IIT Guwahati compare to the older IITs?",
        answer:
          "IIT Guwahati, established in 1994, is the youngest gen-1 IIT but has quickly risen to rank 7 nationally. Its average package (₹19 LPA) is close to IIT Roorkee (₹19.5 LPA) and competitive with the other gen-1 IITs. While the absolute highest packages are lower than IIT Bombay or Delhi, the difference in average and median packages is narrowing each year. IIT Guwahati's unique strengths in design, nanotechnology, and environmental engineering give it a distinctive edge.",
      },
      {
        question: "Which companies recruit from IIT Guwahati?",
        answer:
          "Over 200 companies recruit from IIT Guwahati, including Google, Microsoft, Amazon, Goldman Sachs, Samsung, Qualcomm, Flipkart, McKinsey, Uber, Oracle, Cisco, and many more. The recruitment is diverse across tech, consulting, finance, and core engineering sectors. The institute has also seen growing interest from startups and mid-stage companies, particularly in the data science and AI space.",
      },
    ],
    relatedIITs: ["iit-roorkee", "iit-kharagpur", "iit-hyderabad"],
  },

  // ═══════════════════════════════════════════
  // GENERATION 2 — Established 2008-2009
  // ═══════════════════════════════════════════
  {
    slug: "iit-hyderabad",
    name: "IIT Hyderabad",
    fullName: "Indian Institute of Technology Hyderabad",
    city: "Hyderabad",
    state: "Telangana",
    nirfRank: 8,
    generation: "gen2",
    description:
      "IIT Hyderabad, established in 2008, has rapidly become the highest-ranked gen-2 IIT, sitting at NIRF rank 8. Located in Sangareddy near Hyderabad's thriving IT corridor, IIT Hyderabad benefits from proximity to major tech companies like Google, Amazon, Microsoft, and numerous startups based in the city. The institute is known for its interdisciplinary approach, strong AI/ML research, and innovative curriculum that integrates fractal academics. Its Office of Career Services manages placements attracting 200+ companies, and the average packages have been growing at one of the fastest rates among all IITs.",
    placements: [
      {
        year: 2025,
        highestPackage: "₹60 LPA+",
        averagePackage: "₹18 LPA",
        medianPackage: "₹15 LPA",
        placementPercentage: "88%",
        totalOffers: "700+",
        internationalOffers: "8+",
        topRecruiters: [
          "Google",
          "Microsoft",
          "Amazon",
          "Goldman Sachs",
          "Qualcomm",
          "Samsung",
          "Flipkart",
          "McKinsey",
          "Oracle",
          "Texas Instruments",
        ],
        branchWise: [
          { branch: "Computer Science", avgPackage: "₹32 LPA", medianPackage: "₹26 LPA" },
          { branch: "Electrical Engineering", avgPackage: "₹18 LPA", medianPackage: "₹15 LPA" },
          { branch: "Mechanical Engineering", avgPackage: "₹14 LPA", medianPackage: "₹12 LPA" },
          { branch: "Chemical Engineering", avgPackage: "₹13 LPA", medianPackage: "₹11 LPA" },
          { branch: "Civil Engineering", avgPackage: "₹12 LPA", medianPackage: "₹10.5 LPA" },
          { branch: "AI & Data Science", avgPackage: "₹28 LPA", medianPackage: "₹22 LPA" },
        ],
      },
    ],
    ocsLink: "https://placement.iith.ac.in/",
    faqs: [
      {
        question: "What is the highest package at IIT Hyderabad?",
        answer:
          "The highest package at IIT Hyderabad for the 2024-25 season was over ₹60 LPA. This was offered by a leading tech company for a specialized role. IIT Hyderabad's highest packages have been climbing steadily as the institute gains reputation and attracts more top-tier recruiters. Being located in Hyderabad's tech hub gives it proximity to major companies that increasingly recruit directly from campus.",
      },
      {
        question: "What is the average salary at IIT Hyderabad?",
        answer:
          "The average salary at IIT Hyderabad for 2024-25 was approximately ₹18 LPA, with a median of ₹15 LPA. Computer Science graduates averaged ₹32 LPA, AI & Data Science students averaged ₹28 LPA, and Electrical Engineering was at ₹18 LPA. Core branches averaged ₹12-14 LPA. These numbers are the highest among all gen-2 IITs, reflecting the institute's rapid rise in reputation.",
      },
      {
        question: "Is IIT Hyderabad the best among newer IITs?",
        answer:
          "Yes, IIT Hyderabad is widely regarded as the top-ranked gen-2 IIT, holding NIRF rank 8 — higher than several older IITs. Its location in Hyderabad's technology corridor, strong AI/ML research, and innovative academic programmes have propelled it ahead of other 2008-batch IITs. The institute's placement numbers and average packages are competitive with some gen-1 IITs, making it an excellent choice for students seeking a newer IIT with top-tier opportunities.",
      },
      {
        question: "Which companies recruit from IIT Hyderabad?",
        answer:
          "Over 200 companies recruit from IIT Hyderabad, including Google, Microsoft, Amazon, Goldman Sachs, Qualcomm, Samsung, Flipkart, McKinsey, Oracle, and Texas Instruments. The institute benefits from Hyderabad's thriving tech ecosystem — many companies with offices in the city recruit directly from IIT-H. There's strong representation from semiconductor firms (Qualcomm, Texas Instruments, Intel) and growing participation from AI/ML startups.",
      },
      {
        question: "Does IIT Hyderabad have good placements for AI?",
        answer:
          "Yes, IIT Hyderabad is one of the few IITs with a dedicated AI & Data Science programme, and its graduates from this stream average around ₹28 LPA. The institute has a strong AI/ML research group, and the Hyderabad region hosts multiple AI labs from Google, Microsoft, and Amazon. This combination of academic strength and industry proximity makes IIT Hyderabad one of the best choices in India for an AI-focused engineering career.",
      },
    ],
    relatedIITs: ["iit-madras", "iit-indore", "iit-guwahati"],
  },

  {
    slug: "iit-indore",
    name: "IIT Indore",
    fullName: "Indian Institute of Technology Indore",
    city: "Indore",
    state: "Madhya Pradesh",
    nirfRank: 11,
    generation: "gen2",
    description:
      "IIT Indore, established in 2009, has emerged as one of the fastest-growing IITs in India, currently ranked 11th in the NIRF Engineering rankings. Located on a scenic 510-acre campus in Simrol near Indore, the institute has built a reputation for strong research output, particularly in photonics, space technology, and computational sciences. Despite being a gen-2 IIT, IIT Indore's placement statistics rival several older IITs, with a growing list of top-tier recruiters and steadily improving average packages. The Training and Placement Cell manages campus recruitment that attracts 150+ companies annually.",
    placements: [
      {
        year: 2025,
        highestPackage: "₹50 LPA+",
        averagePackage: "₹16 LPA",
        medianPackage: "₹14 LPA",
        placementPercentage: "85%",
        totalOffers: "500+",
        internationalOffers: "5+",
        topRecruiters: [
          "Google",
          "Microsoft",
          "Amazon",
          "Goldman Sachs",
          "Samsung",
          "Flipkart",
          "Oracle",
          "Infosys",
          "TCS",
          "Wipro",
        ],
        branchWise: [
          { branch: "Computer Science", avgPackage: "₹28 LPA", medianPackage: "₹22 LPA" },
          { branch: "Electrical Engineering", avgPackage: "₹16 LPA", medianPackage: "₹13.5 LPA" },
          { branch: "Mechanical Engineering", avgPackage: "₹13 LPA", medianPackage: "₹11 LPA" },
          { branch: "Civil Engineering", avgPackage: "₹11 LPA", medianPackage: "₹9.5 LPA" },
          { branch: "Metallurgical Engineering", avgPackage: "₹12 LPA", medianPackage: "₹10 LPA" },
        ],
      },
    ],
    ocsLink: "https://placement.iiti.ac.in/",
    faqs: [
      {
        question: "What is the highest package at IIT Indore?",
        answer:
          "The highest package at IIT Indore for the 2024-25 season was over ₹50 LPA, offered by a leading tech or finance firm. IIT Indore has seen its highest packages grow from the ₹30-35 LPA range to ₹50 LPA+ in just a few years, reflecting the institute's improving reputation among top recruiters. The CSE department consistently sees the highest offers.",
      },
      {
        question: "What is the average package at IIT Indore?",
        answer:
          "The average package at IIT Indore for 2024-25 was approximately ₹16 LPA, with a median of ₹14 LPA. Computer Science graduates averaged ₹28 LPA, while Electrical Engineering was at ₹16 LPA. Core branches averaged ₹11-13 LPA. For a gen-2 IIT, these numbers are very competitive and have been trending upward consistently year-over-year.",
      },
      {
        question: "Is IIT Indore worth joining?",
        answer:
          "Yes, IIT Indore is an excellent choice, especially considering its rapid growth trajectory. Ranked 11th nationally by NIRF, it has a strong research culture, a modern campus, and placement numbers that compete with several older IITs. The CSE programme is particularly strong. For students who score between the top gen-1 IIT cutoffs, IIT Indore in CSE or EE is often a better choice than a less popular branch at a gen-1 IIT.",
      },
      {
        question: "Which companies hire from IIT Indore?",
        answer:
          "Over 150 companies recruit from IIT Indore, including Google, Microsoft, Amazon, Goldman Sachs, Samsung, Flipkart, Oracle, and major IT services companies. The recruiter base has been expanding rapidly, with more Day 1 companies participating each year. The institute's growing reputation and improving CSE programme are attracting higher-paying companies that previously only visited the gen-1 IITs.",
      },
      {
        question: "How does IIT Indore compare to IIT Hyderabad?",
        answer:
          "IIT Hyderabad (NIRF 8) slightly outranks IIT Indore (NIRF 11) and has higher average packages (₹18 LPA vs ₹16 LPA). IIT Hyderabad benefits from its location in a major tech hub. However, IIT Indore has been closing the gap rapidly, with some of the fastest year-over-year improvements in placement metrics among all IITs. Both are excellent gen-2 choices, and the difference is narrowing.",
      },
    ],
    relatedIITs: ["iit-hyderabad", "iit-gandhinagar", "iit-ropar"],
  },

  {
    slug: "iit-bhu-varanasi",
    name: "IIT (BHU) Varanasi",
    fullName: "Indian Institute of Technology (BHU) Varanasi",
    city: "Varanasi",
    state: "Uttar Pradesh",
    nirfRank: 10,
    generation: "gen2",
    description:
      "IIT (BHU) Varanasi has a unique history — it originated as the Banaras Engineering College (BENCO) in 1919, part of Banaras Hindu University, making it one of the oldest engineering colleges in India. It was converted to an IIT in 2012. Located within the historic BHU campus in Varanasi, the institute combines a rich heritage with the modern IIT framework. With over 100 years of engineering education history, IIT (BHU) has an extensive alumni network that includes industry leaders, bureaucrats, and academics. The Training and Placement Cell manages recruitment from 200+ companies, and the institute's NIRF rank of 10 reflects its competitive standing.",
    placements: [
      {
        year: 2025,
        highestPackage: "₹55 LPA+",
        averagePackage: "₹17 LPA",
        medianPackage: "₹14.5 LPA",
        placementPercentage: "85%",
        totalOffers: "800+",
        internationalOffers: "5+",
        topRecruiters: [
          "Google",
          "Microsoft",
          "Amazon",
          "Goldman Sachs",
          "Samsung",
          "Qualcomm",
          "Flipkart",
          "Oracle",
          "JP Morgan",
          "L&T",
        ],
        branchWise: [
          { branch: "Computer Science", avgPackage: "₹30 LPA", medianPackage: "₹24 LPA" },
          { branch: "Electrical Engineering", avgPackage: "₹17 LPA", medianPackage: "₹14 LPA" },
          { branch: "Mechanical Engineering", avgPackage: "₹14 LPA", medianPackage: "₹12 LPA" },
          { branch: "Chemical Engineering", avgPackage: "₹13 LPA", medianPackage: "₹11.5 LPA" },
          { branch: "Civil Engineering", avgPackage: "₹12 LPA", medianPackage: "₹10.5 LPA" },
          { branch: "Mining Engineering", avgPackage: "₹12.5 LPA", medianPackage: "₹10.5 LPA" },
          { branch: "Ceramic Engineering", avgPackage: "₹11 LPA", medianPackage: "₹9.5 LPA" },
        ],
      },
    ],
    ocsLink: "https://placement.iitbhu.ac.in/",
    faqs: [
      {
        question: "What is the highest package at IIT BHU Varanasi?",
        answer:
          "The highest package at IIT (BHU) Varanasi for the 2024-25 placement season was over ₹55 LPA. This offer came from a top technology or quantitative finance company. IIT BHU's highest packages have improved significantly since its conversion to an IIT in 2012, and the trend continues upward as more premium recruiters participate in campus placements.",
      },
      {
        question: "What is the average salary at IIT BHU?",
        answer:
          "The average salary at IIT (BHU) Varanasi for 2024-25 was approximately ₹17 LPA, with a median of ₹14.5 LPA. CSE graduates averaged ₹30 LPA, EE ₹17 LPA, and core branches ₹12-14 LPA. IIT BHU has unique departments like Mining, Ceramic, and Pharmaceutical Engineering that have niche placement opportunities not available at other IITs.",
      },
      {
        question: "Is IIT BHU a good IIT?",
        answer:
          "Yes, IIT (BHU) Varanasi is ranked 10th by NIRF and has a legacy of over 100 years of engineering education. Its large alumni network, strong academic programmes, and improving placement statistics make it a highly regarded institution. The campus within BHU is one of the most vibrant university ecosystems in India, offering a well-rounded college experience beyond just academics.",
      },
      {
        question: "How does IIT BHU compare to other IITs?",
        answer:
          "IIT BHU ranks 10th nationally, placing it in the top tier of Indian engineering institutions. Its average package (₹17 LPA) is competitive with other gen-2 IITs and close to some gen-1 IITs. The institute's unique advantage is its 100+ year engineering heritage, extensive alumni network, and unique departments not found at other IITs. For CSE and core engineering, it offers placement opportunities comparable to most IITs in the country.",
      },
      {
        question: "Which unique departments does IIT BHU have?",
        answer:
          "IIT (BHU) Varanasi has several unique departments not found at other IITs, including Mining Engineering, Ceramic Engineering, Pharmaceutical Engineering, and Biochemical Engineering. These departments have niche placement opportunities with specialized companies in mining, materials science, pharma, and biotech. The Mining department, in particular, has strong connections with Coal India, Vedanta, and other mining conglomerates.",
      },
    ],
    relatedIITs: ["iit-kanpur", "iit-kharagpur", "iit-dhanbad"],
  },

  {
    slug: "iit-ropar",
    name: "IIT Ropar",
    fullName: "Indian Institute of Technology Ropar",
    city: "Rupnagar",
    state: "Punjab",
    nirfRank: 17,
    generation: "gen2",
    description:
      "IIT Ropar, established in 2008, is located in Rupnagar (Ropar), Punjab, on a 500+ acre campus along the Sutlej river. The institute has been steadily building its academic reputation and placement record. IIT Ropar is known for its emphasis on biomedical engineering, AI research, and a strong focus on innovation and entrepreneurship. The Training and Placement Cell coordinates recruitment from 120+ companies, and the institute has shown consistent year-over-year improvement in placement metrics.",
    placements: [
      {
        year: 2025,
        highestPackage: "₹45 LPA+",
        averagePackage: "₹15 LPA",
        medianPackage: "₹13 LPA",
        placementPercentage: "82%",
        totalOffers: "400+",
        internationalOffers: "3+",
        topRecruiters: [
          "Google",
          "Microsoft",
          "Amazon",
          "Samsung",
          "Flipkart",
          "Oracle",
          "Goldman Sachs",
          "Infosys",
          "TCS",
        ],
        branchWise: [
          { branch: "Computer Science", avgPackage: "₹24 LPA", medianPackage: "₹20 LPA" },
          { branch: "Electrical Engineering", avgPackage: "₹15 LPA", medianPackage: "₹12.5 LPA" },
          { branch: "Mechanical Engineering", avgPackage: "₹12 LPA", medianPackage: "₹10 LPA" },
          { branch: "Chemical Engineering", avgPackage: "₹11 LPA", medianPackage: "₹9.5 LPA" },
          { branch: "Civil Engineering", avgPackage: "₹10 LPA", medianPackage: "₹8.5 LPA" },
        ],
      },
    ],
    ocsLink: "https://placement.iitrpr.ac.in/",
    faqs: [
      {
        question: "What is the highest package at IIT Ropar?",
        answer:
          "The highest package at IIT Ropar for the 2024-25 season was over ₹45 LPA, offered by a leading tech company. IIT Ropar's top packages have been improving steadily as the institute gains recognition. While lower than the gen-1 IITs, the growth trajectory is promising and the CSE department consistently attracts strong offers.",
      },
      {
        question: "What is the average package at IIT Ropar?",
        answer:
          "The average package at IIT Ropar for 2024-25 was approximately ₹15 LPA, with a median of ₹13 LPA. CSE graduates averaged ₹24 LPA, which is competitive for a gen-2 IIT. Electrical Engineering averaged ₹15 LPA, and core branches were in the ₹10-12 LPA range. These numbers represent steady improvement from previous years.",
      },
      {
        question: "Is IIT Ropar worth joining?",
        answer:
          "IIT Ropar is a solid choice, particularly for CSE and EE. With a NIRF rank of 17 and improving placements, the institute offers good value. Its proximity to Chandigarh (a well-connected city) and a growing campus with modern facilities make it attractive. For students choosing between IIT Ropar CSE and a lower branch at a gen-1 IIT, the branch choice often matters more for placement outcomes.",
      },
      {
        question: "Which companies recruit from IIT Ropar?",
        answer:
          "Over 120 companies recruit from IIT Ropar, including Google, Microsoft, Amazon, Samsung, Flipkart, Oracle, Goldman Sachs, and major IT services companies like Infosys and TCS. The recruiter base has been expanding year-over-year, with more mid-to-large tech companies participating. The institute is actively working to attract more Day 1 recruiters.",
      },
    ],
    relatedIITs: ["iit-mandi", "iit-patna", "iit-jodhpur"],
  },

  {
    slug: "iit-patna",
    name: "IIT Patna",
    fullName: "Indian Institute of Technology Patna",
    city: "Patna",
    state: "Bihar",
    nirfRank: 20,
    generation: "gen2",
    description:
      "IIT Patna, established in 2008, is located in Bihta near Patna, Bihar, on a 500-acre permanent campus. The institute has been growing steadily and has built a respectable placement record within the gen-2 IIT cohort. IIT Patna is known for its research in computational neuroscience, signal processing, and renewable energy. The Training and Placement Cell manages recruitment from 100+ companies and has been improving its recruiter base consistently.",
    placements: [
      {
        year: 2025,
        highestPackage: "₹40 LPA+",
        averagePackage: "₹14 LPA",
        medianPackage: "₹12 LPA",
        placementPercentage: "80%",
        totalOffers: "350+",
        internationalOffers: "2+",
        topRecruiters: [
          "Microsoft",
          "Amazon",
          "Samsung",
          "Flipkart",
          "Oracle",
          "Goldman Sachs",
          "Infosys",
          "TCS",
          "Wipro",
        ],
        branchWise: [
          { branch: "Computer Science", avgPackage: "₹22 LPA", medianPackage: "₹18 LPA" },
          { branch: "Electrical Engineering", avgPackage: "₹14 LPA", medianPackage: "₹12 LPA" },
          { branch: "Mechanical Engineering", avgPackage: "₹11 LPA", medianPackage: "₹9.5 LPA" },
          { branch: "Chemical Engineering", avgPackage: "₹10.5 LPA", medianPackage: "₹9 LPA" },
          { branch: "Civil Engineering", avgPackage: "₹10 LPA", medianPackage: "₹8.5 LPA" },
        ],
      },
    ],
    ocsLink: "https://placement.iitp.ac.in/",
    faqs: [
      {
        question: "What is the highest package at IIT Patna?",
        answer:
          "The highest package at IIT Patna for the 2024-25 season was over ₹40 LPA, offered by a major tech firm. IIT Patna has seen consistent improvement in its top packages, growing from ₹20-25 LPA range to ₹40 LPA+ in recent years. The CSE department drives the highest offers, with quantitative firms and tech companies beginning to participate more actively.",
      },
      {
        question: "What is the average salary at IIT Patna?",
        answer:
          "The average salary at IIT Patna for 2024-25 was approximately ₹14 LPA, with a median of ₹12 LPA. CSE graduates averaged around ₹22 LPA, Electrical Engineering around ₹14 LPA, and core branches ₹10-11 LPA. These figures are in line with other gen-2 IITs and represent solid placement opportunities for graduates.",
      },
      {
        question: "Is IIT Patna a good IIT for placements?",
        answer:
          "IIT Patna offers respectable placement opportunities, particularly for CSE and EE students. While its average packages are lower than the top-ranked IITs, the institute provides access to major tech companies like Microsoft, Amazon, and Samsung. The placement rate of 80% for registered students is improving, and the growing campus infrastructure is helping attract better recruiters each year.",
      },
      {
        question: "Which companies recruit from IIT Patna?",
        answer:
          "Over 100 companies recruit from IIT Patna, including Microsoft, Amazon, Samsung, Flipkart, Oracle, Goldman Sachs, and major IT services firms like Infosys, TCS, and Wipro. While the recruiter base is smaller than gen-1 IITs, it includes several high-paying technology companies, and the list grows each year as the institute's reputation strengthens.",
      },
    ],
    relatedIITs: ["iit-bhu-varanasi", "iit-ropar", "iit-gandhinagar"],
  },

  {
    slug: "iit-gandhinagar",
    name: "IIT Gandhinagar",
    fullName: "Indian Institute of Technology Gandhinagar",
    city: "Gandhinagar",
    state: "Gujarat",
    nirfRank: 13,
    generation: "gen2",
    description:
      "IIT Gandhinagar, established in 2008, has rapidly emerged as one of the strongest gen-2 IITs, ranked 13th by NIRF. Located on a 400-acre campus in Palaj near Gandhinagar, the capital of Gujarat, the institute is known for its liberal arts-integrated engineering education, strong emphasis on design thinking, and a pioneering Explorer Programme that encourages interdisciplinary learning. The Career Development Services (CDS) manages placements attracting 150+ companies. IIT Gandhinagar has a distinctive culture that blends humanities with engineering, producing well-rounded graduates highly valued by consulting and product companies.",
    placements: [
      {
        year: 2025,
        highestPackage: "₹50 LPA+",
        averagePackage: "₹16 LPA",
        medianPackage: "₹14 LPA",
        placementPercentage: "85%",
        totalOffers: "450+",
        internationalOffers: "5+",
        topRecruiters: [
          "Google",
          "Microsoft",
          "Amazon",
          "Goldman Sachs",
          "Samsung",
          "Flipkart",
          "Oracle",
          "Adani Group",
          "Reliance",
        ],
        branchWise: [
          { branch: "Computer Science", avgPackage: "₹26 LPA", medianPackage: "₹21 LPA" },
          { branch: "Electrical Engineering", avgPackage: "₹16 LPA", medianPackage: "₹13 LPA" },
          { branch: "Mechanical Engineering", avgPackage: "₹13 LPA", medianPackage: "₹11 LPA" },
          { branch: "Chemical Engineering", avgPackage: "₹12 LPA", medianPackage: "₹10 LPA" },
          { branch: "Civil Engineering", avgPackage: "₹11 LPA", medianPackage: "₹9.5 LPA" },
        ],
      },
    ],
    ocsLink: "https://placement.iitgn.ac.in/",
    faqs: [
      {
        question: "What is the highest package at IIT Gandhinagar?",
        answer:
          "The highest package at IIT Gandhinagar for the 2024-25 season was over ₹50 LPA, offered by a major technology company. IIT Gandhinagar has shown impressive growth in top packages, reflecting its strong NIRF ranking (13th) and the quality of its graduates. The institute's emphasis on interdisciplinary education produces well-rounded candidates valued by top firms.",
      },
      {
        question: "What is the average salary at IIT Gandhinagar?",
        answer:
          "The average salary at IIT Gandhinagar for 2024-25 was approximately ₹16 LPA, with a median of ₹14 LPA. CSE graduates averaged ₹26 LPA, EE ₹16 LPA, and core branches ₹11-13 LPA. These numbers are strong for a gen-2 IIT and reflect the institute's growing placement capabilities and recruiter relationships.",
      },
      {
        question: "What makes IIT Gandhinagar unique?",
        answer:
          "IIT Gandhinagar is distinctive for its integration of liberal arts and humanities into engineering education. The Explorer Programme requires all students to take courses across disciplines, producing graduates who combine technical skills with critical thinking, communication, and design sensibility. This makes IIT GN graduates particularly attractive to consulting firms, product companies, and design-driven organizations.",
      },
      {
        question: "Which companies recruit from IIT Gandhinagar?",
        answer:
          "Over 150 companies recruit from IIT Gandhinagar, including Google, Microsoft, Amazon, Goldman Sachs, Samsung, Flipkart, Oracle, and major Indian conglomerates like Adani Group and Reliance. The institute's location in Gujarat also attracts recruiters from the state's strong manufacturing, chemical, and infrastructure sectors.",
      },
      {
        question: "Is IIT Gandhinagar better than IIT Indore?",
        answer:
          "IIT Gandhinagar (NIRF 13) and IIT Indore (NIRF 11) are both strong gen-2 IITs with similar placement statistics. IIT Indore has a slight edge in average packages (₹16 LPA for both, but Indore's CSE average is higher at ₹28 LPA vs ₹26 LPA). However, IIT Gandhinagar's liberal arts approach and unique campus culture offer a distinctly different educational experience. The choice depends on personal preferences for location, culture, and academic style.",
      },
    ],
    relatedIITs: ["iit-indore", "iit-hyderabad", "iit-jodhpur"],
  },

  {
    slug: "iit-jodhpur",
    name: "IIT Jodhpur",
    fullName: "Indian Institute of Technology Jodhpur",
    city: "Jodhpur",
    state: "Rajasthan",
    nirfRank: 22,
    generation: "gen2",
    description:
      "IIT Jodhpur, established in 2008, is situated on a 852-acre campus in Karwar near Jodhpur, Rajasthan. The institute has been developing its academic programmes and infrastructure rapidly. Known for its focus on renewable energy, smart city technologies, and digital humanities, IIT Jodhpur offers a unique desert campus experience. The Career Development Cell manages placements from 100+ companies, with consistent improvement in placement statistics each year.",
    placements: [
      {
        year: 2025,
        highestPackage: "₹40 LPA+",
        averagePackage: "₹14 LPA",
        medianPackage: "₹12 LPA",
        placementPercentage: "80%",
        totalOffers: "350+",
        internationalOffers: "2+",
        topRecruiters: [
          "Microsoft",
          "Amazon",
          "Samsung",
          "Flipkart",
          "Oracle",
          "Infosys",
          "TCS",
          "Wipro",
          "L&T",
        ],
        branchWise: [
          { branch: "Computer Science", avgPackage: "₹22 LPA", medianPackage: "₹18 LPA" },
          { branch: "Electrical Engineering", avgPackage: "₹14 LPA", medianPackage: "₹12 LPA" },
          { branch: "Mechanical Engineering", avgPackage: "₹11 LPA", medianPackage: "₹9.5 LPA" },
          { branch: "Civil Engineering", avgPackage: "₹10 LPA", medianPackage: "₹8.5 LPA" },
        ],
      },
    ],
    ocsLink: "https://placement.iitj.ac.in/",
    faqs: [
      {
        question: "What is the highest package at IIT Jodhpur?",
        answer:
          "The highest package at IIT Jodhpur for the 2024-25 season was over ₹40 LPA, offered by a leading technology company. While IIT Jodhpur's top packages are lower than some other IITs, they have been growing consistently. The institute is actively working to attract more premium recruiters, and the CSE department has been the primary driver of top offers.",
      },
      {
        question: "What is the average salary at IIT Jodhpur?",
        answer:
          "The average salary at IIT Jodhpur for 2024-25 was approximately ₹14 LPA, with a median of ₹12 LPA. CSE graduates averaged ₹22 LPA, EE ₹14 LPA, and core branches ₹10-11 LPA. These numbers are consistent with other gen-2 IITs and represent solid placement opportunities for graduates from a growing institution.",
      },
      {
        question: "Is IIT Jodhpur good for placements?",
        answer:
          "IIT Jodhpur offers decent placement opportunities, particularly for CSE students. The placement rate of 80% is improving each year, and companies like Microsoft, Amazon, Samsung, and Flipkart recruit from campus. The institute's focus areas in renewable energy and smart technologies also create unique niche opportunities not available at all IITs.",
      },
      {
        question: "What are IIT Jodhpur's strengths?",
        answer:
          "IIT Jodhpur is known for its research in renewable energy (solar and wind — leveraging its desert location), smart city technologies, digital humanities, and computational sciences. The institute's scenic desert campus offers a unique experience. Its proximity to Jodhpur's growing IT sector and strong connections with DRDO and ISRO provide unique research and career opportunities.",
      },
    ],
    relatedIITs: ["iit-gandhinagar", "iit-indore", "iit-mandi"],
  },

  {
    slug: "iit-mandi",
    name: "IIT Mandi",
    fullName: "Indian Institute of Technology Mandi",
    city: "Mandi",
    state: "Himachal Pradesh",
    nirfRank: 16,
    generation: "gen2",
    description:
      "IIT Mandi, established in 2009, is located in the serene Kamand valley in Mandi, Himachal Pradesh, at an altitude of 1,000 meters. Despite its remote location, IIT Mandi has built an impressive academic reputation, ranking 16th by NIRF. The institute is known for its project-based learning approach, strong biomedical and bioengineering programmes, and a unique academic structure that emphasizes hands-on innovation. IIT Mandi was the first IIT to collaborate with a foreign university (University of Würzburg, Germany) for its curriculum design. The Career and Placement Cell manages recruitment from 120+ companies.",
    placements: [
      {
        year: 2025,
        highestPackage: "₹45 LPA+",
        averagePackage: "₹15 LPA",
        medianPackage: "₹13 LPA",
        placementPercentage: "82%",
        totalOffers: "400+",
        internationalOffers: "3+",
        topRecruiters: [
          "Google",
          "Microsoft",
          "Amazon",
          "Samsung",
          "Flipkart",
          "Oracle",
          "Infosys",
          "TCS",
          "Qualcomm",
        ],
        branchWise: [
          { branch: "Computer Science", avgPackage: "₹24 LPA", medianPackage: "₹20 LPA" },
          { branch: "Electrical Engineering", avgPackage: "₹15 LPA", medianPackage: "₹12.5 LPA" },
          { branch: "Mechanical Engineering", avgPackage: "₹12 LPA", medianPackage: "₹10 LPA" },
          { branch: "Civil Engineering", avgPackage: "₹10.5 LPA", medianPackage: "₹9 LPA" },
          { branch: "Bioengineering", avgPackage: "₹11 LPA", medianPackage: "₹9.5 LPA" },
        ],
      },
    ],
    ocsLink: "https://placement.iitmandi.ac.in/",
    faqs: [
      {
        question: "What is the highest package at IIT Mandi?",
        answer:
          "The highest package at IIT Mandi for the 2024-25 season was over ₹45 LPA, offered by a leading technology firm. IIT Mandi's highest packages have improved significantly as the institute has climbed to NIRF rank 16. The CSE department consistently attracts the best offers, with growing participation from mid-to-high-paying tech companies.",
      },
      {
        question: "What is the average salary at IIT Mandi?",
        answer:
          "The average salary at IIT Mandi for 2024-25 was approximately ₹15 LPA, with a median of ₹13 LPA. CSE graduates averaged ₹24 LPA, EE ₹15 LPA, and core branches ₹10-12 LPA. For a gen-2 IIT, these numbers are competitive, and the upward trend reflects the institute's growing reputation among recruiters.",
      },
      {
        question: "What is IIT Mandi known for?",
        answer:
          "IIT Mandi is known for its project-based learning curriculum (inspired by its collaboration with the University of Würzburg), strong biomedical and bioengineering programmes, beautiful Himalayan campus, and an emphasis on innovation and entrepreneurship. The institute's unique location in the mountains provides a campus experience unlike any other IIT. It has also been a pioneer in integrating design thinking into engineering courses.",
      },
      {
        question: "Is IIT Mandi's location a disadvantage for placements?",
        answer:
          "While IIT Mandi's remote location in the Himalayas might seem like a disadvantage, it hasn't significantly impacted placements. Major tech companies like Google, Microsoft, and Amazon recruit from campus either through virtual processes or campus visits. The rise of remote hiring has actually benefited IITs in less accessible locations. However, the institute has fewer local industry connections compared to IITs in major cities.",
      },
    ],
    relatedIITs: ["iit-ropar", "iit-roorkee", "iit-jodhpur"],
  },

  // ═══════════════════════════════════════════
  // GENERATION 3 — Newer IITs (2012+)
  // ═══════════════════════════════════════════
  {
    slug: "iit-bhubaneswar",
    name: "IIT Bhubaneswar",
    fullName: "Indian Institute of Technology Bhubaneswar",
    city: "Bhubaneswar",
    state: "Odisha",
    nirfRank: 24,
    generation: "gen3",
    description:
      "IIT Bhubaneswar, established in 2008, is located in Argul near Bhubaneswar, Odisha. The institute has been building its academic infrastructure and reputation steadily. Known for its research in climate science, earth sciences, and sustainable engineering, IIT Bhubaneswar benefits from Odisha's growing industrial base. The Training and Placement Cell manages recruitment from 100+ companies and has shown consistent improvement in placement outcomes.",
    placements: [
      {
        year: 2025,
        highestPackage: "₹35 LPA+",
        averagePackage: "₹13 LPA",
        medianPackage: "₹11 LPA",
        placementPercentage: "78%",
        totalOffers: "300+",
        internationalOffers: "Data pending",
        topRecruiters: [
          "Microsoft",
          "Amazon",
          "Samsung",
          "Flipkart",
          "Oracle",
          "Infosys",
          "TCS",
          "Wipro",
          "L&T",
        ],
        branchWise: [
          { branch: "Computer Science", avgPackage: "₹20 LPA", medianPackage: "₹17 LPA" },
          { branch: "Electrical Engineering", avgPackage: "₹13 LPA", medianPackage: "₹11 LPA" },
          { branch: "Mechanical Engineering", avgPackage: "₹10.5 LPA", medianPackage: "₹9 LPA" },
          { branch: "Civil Engineering", avgPackage: "₹9.5 LPA", medianPackage: "₹8 LPA" },
        ],
      },
    ],
    ocsLink: "https://placement.iitbbs.ac.in/",
    faqs: [
      {
        question: "What is the highest package at IIT Bhubaneswar?",
        answer:
          "The highest package at IIT Bhubaneswar for the 2024-25 season was over ₹35 LPA, offered by a technology company. The institute has been improving its placement numbers steadily, with top packages growing from the ₹20-25 LPA range to ₹35 LPA+ in recent years. The CSE department sees the highest offers.",
      },
      {
        question: "What is the average salary at IIT Bhubaneswar?",
        answer:
          "The average salary at IIT Bhubaneswar for 2024-25 was approximately ₹13 LPA, with a median of ₹11 LPA. CSE graduates averaged ₹20 LPA, while core branches ranged from ₹9.5-10.5 LPA. These numbers are competitive for a gen-3 IIT and have been trending upward as the institute attracts more recruiters.",
      },
      {
        question: "Is IIT Bhubaneswar good for engineering?",
        answer:
          "IIT Bhubaneswar is a respectable choice for engineering, offering the IIT brand value and education quality. The institute has been growing steadily since its establishment and offers good placement opportunities, particularly in CSE and EE. Its location in Odisha's growing industrial corridor and research strengths in earth sciences and sustainable engineering provide unique opportunities.",
      },
      {
        question: "Which companies recruit from IIT Bhubaneswar?",
        answer:
          "Over 100 companies recruit from IIT Bhubaneswar, including Microsoft, Amazon, Samsung, Flipkart, Oracle, and major IT services companies. The recruiter base is growing each year as the institute builds its reputation. Local companies in Odisha's industrial corridor also participate, offering core engineering roles.",
      },
    ],
    relatedIITs: ["iit-kharagpur", "iit-patna", "iit-hyderabad"],
  },

  {
    slug: "iit-tirupati",
    name: "IIT Tirupati",
    fullName: "Indian Institute of Technology Tirupati",
    city: "Tirupati",
    state: "Andhra Pradesh",
    nirfRank: 28,
    generation: "gen3",
    description:
      "IIT Tirupati, established in 2015, is one of the newer IITs, located in Yerpedu near Tirupati, Andhra Pradesh. Initially mentored by IIT Madras, the institute has been building its academic programmes and campus infrastructure. IIT Tirupati benefits from its mentor IIT's reputation and has been attracting growing recruiter interest. The Training and Placement Cell is actively expanding its corporate partnerships.",
    placements: [
      {
        year: 2025,
        highestPackage: "₹30 LPA+",
        averagePackage: "₹12 LPA",
        medianPackage: "₹10 LPA",
        placementPercentage: "75%",
        totalOffers: "200+",
        internationalOffers: "Data pending",
        topRecruiters: [
          "Amazon",
          "Samsung",
          "Flipkart",
          "Oracle",
          "Infosys",
          "TCS",
          "Wipro",
          "L&T",
        ],
        branchWise: [
          { branch: "Computer Science", avgPackage: "₹18 LPA", medianPackage: "₹15 LPA" },
          { branch: "Electrical Engineering", avgPackage: "₹12 LPA", medianPackage: "₹10 LPA" },
          { branch: "Mechanical Engineering", avgPackage: "₹10 LPA", medianPackage: "₹8.5 LPA" },
          { branch: "Civil Engineering", avgPackage: "₹9 LPA", medianPackage: "₹8 LPA" },
        ],
      },
    ],
    ocsLink: "https://placement.iittp.ac.in/",
    faqs: [
      {
        question: "What is the highest package at IIT Tirupati?",
        answer:
          "The highest package at IIT Tirupati for the 2024-25 season was over ₹30 LPA. As a newer IIT (established 2015), its placement statistics are still developing. However, the IIT brand and mentorship from IIT Madras have helped attract credible recruiters from the start. The highest packages are expected to grow as the institute matures.",
      },
      {
        question: "What is the average salary at IIT Tirupati?",
        answer:
          "The average salary at IIT Tirupati for 2024-25 was approximately ₹12 LPA, with a median of ₹10 LPA. CSE graduates averaged ₹18 LPA, while other branches ranged from ₹9-12 LPA. As a newer IIT, these numbers are promising and are expected to improve as more graduating batches build the institute's alumni network and industry reputation.",
      },
      {
        question: "Is IIT Tirupati a good choice?",
        answer:
          "IIT Tirupati is a good choice for students who value the IIT education and brand. Being mentored by IIT Madras, it follows strong academic standards. While placement numbers are still developing (the institute is relatively young), the trajectory is positive. Students in CSE can expect competitive packages, and the growing Andhra Pradesh tech ecosystem is creating local opportunities.",
      },
      {
        question: "How does IIT Tirupati compare to other newer IITs?",
        answer:
          "IIT Tirupati is comparable to other gen-3 IITs like IIT Palakkad, IIT Dharwad, and IIT Bhilai in terms of placement statistics. Its advantage is the mentorship from IIT Madras (one of the top 3 IITs) and its location in South India, which provides access to the Bengaluru-Chennai tech corridor. As the institute matures, its placement numbers are expected to converge with older gen-2 IITs.",
      },
    ],
    relatedIITs: ["iit-madras", "iit-palakkad", "iit-hyderabad"],
  },

  {
    slug: "iit-palakkad",
    name: "IIT Palakkad",
    fullName: "Indian Institute of Technology Palakkad",
    city: "Palakkad",
    state: "Kerala",
    nirfRank: 30,
    generation: "gen3",
    description:
      "IIT Palakkad, established in 2015, is located in Kanjikode, Palakkad, Kerala. Mentored by IIT Madras, the institute is building a reputation for quality education in a serene campus setting. IIT Palakkad focuses on interdisciplinary education and has strong programmes in data science, AI, and computational engineering. The Career Development Centre manages placements that are growing steadily each year.",
    placements: [
      {
        year: 2025,
        highestPackage: "₹28 LPA+",
        averagePackage: "₹11 LPA",
        medianPackage: "₹9.5 LPA",
        placementPercentage: "73%",
        totalOffers: "180+",
        internationalOffers: "Data pending",
        topRecruiters: [
          "Amazon",
          "Samsung",
          "Oracle",
          "Infosys",
          "TCS",
          "Wipro",
          "UST Global",
          "Mphasis",
        ],
        branchWise: [
          { branch: "Computer Science", avgPackage: "₹17 LPA", medianPackage: "₹14 LPA" },
          { branch: "Electrical Engineering", avgPackage: "₹11 LPA", medianPackage: "₹9.5 LPA" },
          { branch: "Mechanical Engineering", avgPackage: "₹9.5 LPA", medianPackage: "₹8 LPA" },
          { branch: "Civil Engineering", avgPackage: "₹8.5 LPA", medianPackage: "₹7.5 LPA" },
        ],
      },
    ],
    ocsLink: "https://placement.iitpkd.ac.in/",
    faqs: [
      {
        question: "What is the highest package at IIT Palakkad?",
        answer:
          "The highest package at IIT Palakkad for the 2024-25 season was over ₹28 LPA, offered by a technology company. As a newer IIT established in 2015, the institute's placement record is still developing. The mentorship from IIT Madras and growing alumni network are helping improve recruiter participation year-over-year.",
      },
      {
        question: "What is the average salary at IIT Palakkad?",
        answer:
          "The average salary at IIT Palakkad for 2024-25 was approximately ₹11 LPA, with a median of ₹9.5 LPA. CSE graduates averaged ₹17 LPA, which is competitive for a gen-3 IIT. Core branches ranged from ₹8.5-9.5 LPA. These numbers represent a growing trend as the institute builds its reputation.",
      },
      {
        question: "Is IIT Palakkad worth it?",
        answer:
          "IIT Palakkad offers the IIT brand and quality education at a lower JEE cutoff than older IITs, making it an excellent value proposition. The mentorship from IIT Madras ensures academic standards are high. While placements are still developing, the CSE programme offers competitive packages. Students benefit from Kerala's growing tech ecosystem and proximity to major IT hubs like Kochi and Bengaluru.",
      },
    ],
    relatedIITs: ["iit-tirupati", "iit-madras", "iit-dharwad"],
  },

  {
    slug: "iit-dhanbad",
    name: "IIT (ISM) Dhanbad",
    fullName: "Indian Institute of Technology (Indian School of Mines) Dhanbad",
    city: "Dhanbad",
    state: "Jharkhand",
    nirfRank: 12,
    generation: "gen3",
    description:
      "IIT (ISM) Dhanbad has a distinguished history dating back to 1926 as the Indian School of Mines. Converted to an IIT in 2016, it brings nearly 100 years of engineering education heritage. Located in Dhanbad, the coal capital of India, IIT (ISM) is renowned for its mining, petroleum, and geological engineering programmes — unique specializations not available at most other IITs. The institute has rapidly improved its placement record since becoming an IIT, with NIRF rank 12 reflecting its strong standing. The Placement Cell manages recruitment from 200+ companies across diverse sectors.",
    placements: [
      {
        year: 2025,
        highestPackage: "₹50 LPA+",
        averagePackage: "₹16 LPA",
        medianPackage: "₹13.5 LPA",
        placementPercentage: "85%",
        totalOffers: "700+",
        internationalOffers: "5+",
        topRecruiters: [
          "Google",
          "Microsoft",
          "Amazon",
          "Goldman Sachs",
          "Samsung",
          "Flipkart",
          "Oracle",
          "Coal India",
          "ONGC",
          "Vedanta",
          "Shell",
        ],
        branchWise: [
          { branch: "Computer Science", avgPackage: "₹28 LPA", medianPackage: "₹22 LPA" },
          { branch: "Electrical Engineering", avgPackage: "₹15 LPA", medianPackage: "₹12.5 LPA" },
          { branch: "Mechanical Engineering", avgPackage: "₹13 LPA", medianPackage: "₹11 LPA" },
          { branch: "Mining Engineering", avgPackage: "₹12 LPA", medianPackage: "₹10.5 LPA" },
          { branch: "Petroleum Engineering", avgPackage: "₹14 LPA", medianPackage: "₹12 LPA" },
          { branch: "Chemical Engineering", avgPackage: "₹12.5 LPA", medianPackage: "₹10.5 LPA" },
        ],
      },
    ],
    ocsLink: "https://placement.iitism.ac.in/",
    faqs: [
      {
        question: "What is the highest package at IIT Dhanbad?",
        answer:
          "The highest package at IIT (ISM) Dhanbad for the 2024-25 season was over ₹50 LPA. Since its conversion to an IIT in 2016, the institute has seen significant improvements in top packages, now competing with several gen-2 IITs. The CSE department drives the highest offers, while mining and petroleum companies offer competitive sector-specific packages.",
      },
      {
        question: "What is the average salary at IIT Dhanbad?",
        answer:
          "The average salary at IIT (ISM) Dhanbad for 2024-25 was approximately ₹16 LPA, with a median of ₹13.5 LPA. CSE graduates averaged ₹28 LPA, and Petroleum Engineering averaged ₹14 LPA. Mining Engineering, the institute's flagship programme, averaged ₹12 LPA. These numbers make IIT Dhanbad one of the better-placed gen-3 IITs (by conversion year).",
      },
      {
        question: "Is IIT Dhanbad good for mining and petroleum?",
        answer:
          "IIT (ISM) Dhanbad is the best institution in India for mining and petroleum engineering, with nearly 100 years of legacy in these fields. The institute has exclusive relationships with Coal India, ONGC, Vedanta, Tata Steel, and other mining and energy conglomerates. Petroleum Engineering graduates are also recruited by Shell, Schlumberger, and Cairn Energy. For students interested in the mining and energy sectors, there is no better institution in the country.",
      },
      {
        question: "How does IIT Dhanbad compare to other IITs?",
        answer:
          "IIT Dhanbad ranks 12th by NIRF, placing it above several gen-2 IITs. Its average package (₹16 LPA) is competitive with IIT Indore and IIT Gandhinagar. The institute's unique strength is its mining, petroleum, and geological engineering programmes that no other IIT can match. For CSE, the placement metrics are comparable to other mid-tier IITs, with growing participation from top tech companies.",
      },
      {
        question: "What is the placement rate at IIT Dhanbad?",
        answer:
          "IIT (ISM) Dhanbad achieves a placement rate of approximately 85% for registered students. The institute places over 700 students annually across diverse sectors including IT, mining, energy, finance, consulting, and manufacturing. The large student body (inherited from the ISM era) means the absolute number of placements is among the highest among all IITs.",
      },
    ],
    relatedIITs: ["iit-bhu-varanasi", "iit-kharagpur", "iit-patna"],
  },

  {
    slug: "iit-bhilai",
    name: "IIT Bhilai",
    fullName: "Indian Institute of Technology Bhilai",
    city: "Bhilai",
    state: "Chhattisgarh",
    nirfRank: 40,
    generation: "gen3",
    description:
      "IIT Bhilai, established in 2016, is located in Kutelabhata near Bhilai in Chhattisgarh. Mentored by IIT Hyderabad, the institute has been growing its academic programmes and campus infrastructure. IIT Bhilai is known for its focus on data science, power electronics, and sustainable technologies. While one of the newer IITs, it benefits from the IIT Hyderabad mentorship and is steadily building its placement capabilities.",
    placements: [
      {
        year: 2025,
        highestPackage: "₹25 LPA+",
        averagePackage: "₹10 LPA",
        medianPackage: "₹8.5 LPA",
        placementPercentage: "72%",
        totalOffers: "150+",
        internationalOffers: "Data pending",
        topRecruiters: [
          "Amazon",
          "Samsung",
          "Oracle",
          "Infosys",
          "TCS",
          "Wipro",
          "Cognizant",
          "Capgemini",
        ],
        branchWise: [
          { branch: "Computer Science", avgPackage: "₹16 LPA", medianPackage: "₹13 LPA" },
          { branch: "Electrical Engineering", avgPackage: "₹10 LPA", medianPackage: "₹8.5 LPA" },
          { branch: "Mechanical Engineering", avgPackage: "₹8.5 LPA", medianPackage: "₹7.5 LPA" },
        ],
      },
    ],
    ocsLink: "https://placement.iitbhilai.ac.in/",
    faqs: [
      {
        question: "What is the highest package at IIT Bhilai?",
        answer:
          "The highest package at IIT Bhilai for the 2024-25 season was over ₹25 LPA. As one of the newest IITs (established 2016), the institute's placement record is still in its early growth phase. The mentorship from IIT Hyderabad and the IIT brand are helping attract credible recruiters, and packages are expected to improve as the institute matures and its alumni base grows.",
      },
      {
        question: "What is the average salary at IIT Bhilai?",
        answer:
          "The average salary at IIT Bhilai for 2024-25 was approximately ₹10 LPA, with a median of ₹8.5 LPA. CSE graduates averaged around ₹16 LPA, which is decent for a gen-3 IIT. The placement statistics are improving each year as the institute builds its corporate relationships and more graduating batches enter the workforce.",
      },
      {
        question: "Is IIT Bhilai a good option?",
        answer:
          "IIT Bhilai is a viable option for students who want the IIT education experience. While its placement statistics are still developing, the IIT brand ensures a baseline quality of education and career opportunity. CSE students at IIT Bhilai can expect packages comparable to many NITs. The key advantage is the lower JEE cutoff, which provides access to IIT-quality education and the powerful IIT alumni network.",
      },
    ],
    relatedIITs: ["iit-hyderabad", "iit-goa", "iit-dharwad"],
  },

  {
    slug: "iit-goa",
    name: "IIT Goa",
    fullName: "Indian Institute of Technology Goa",
    city: "Ponda",
    state: "Goa",
    nirfRank: 35,
    generation: "gen3",
    description:
      "IIT Goa, established in 2016, is located in Farmagudi, Ponda, Goa. Mentored by IIT Bombay, the institute benefits from one of the strongest mentor-mentee relationships in the IIT system. IIT Goa's academic programmes follow IIT Bombay's curriculum closely, and the institute has been attracting quality faculty. The pleasant Goan climate and lifestyle, combined with the IIT Bombay mentorship, make IIT Goa an interesting choice for students. The Placement Cell is growing its recruiter network steadily.",
    placements: [
      {
        year: 2025,
        highestPackage: "₹28 LPA+",
        averagePackage: "₹11 LPA",
        medianPackage: "₹9 LPA",
        placementPercentage: "74%",
        totalOffers: "160+",
        internationalOffers: "Data pending",
        topRecruiters: [
          "Amazon",
          "Samsung",
          "Oracle",
          "Infosys",
          "TCS",
          "Wipro",
          "Cognizant",
          "Capgemini",
        ],
        branchWise: [
          { branch: "Computer Science", avgPackage: "₹17 LPA", medianPackage: "₹14 LPA" },
          { branch: "Electrical Engineering", avgPackage: "₹11 LPA", medianPackage: "₹9 LPA" },
          { branch: "Mechanical Engineering", avgPackage: "₹9 LPA", medianPackage: "₹7.5 LPA" },
        ],
      },
    ],
    ocsLink: "https://placement.iitgoa.ac.in/",
    faqs: [
      {
        question: "What is the highest package at IIT Goa?",
        answer:
          "The highest package at IIT Goa for the 2024-25 season was over ₹28 LPA. Being mentored by IIT Bombay (ranked #2 in India) gives IIT Goa a significant advantage in establishing credibility with recruiters. The highest packages have been improving each year as the institute's early alumni build its reputation in the industry.",
      },
      {
        question: "What is the average salary at IIT Goa?",
        answer:
          "The average salary at IIT Goa for 2024-25 was approximately ₹11 LPA, with a median of ₹9 LPA. CSE graduates averaged around ₹17 LPA. These numbers are typical for a newer gen-3 IIT and are expected to improve significantly as the institute matures and its alumni network strengthens.",
      },
      {
        question: "Is IIT Goa mentored by IIT Bombay?",
        answer:
          "Yes, IIT Goa is mentored by IIT Bombay, which is one of the top 2 IITs in India. This mentorship means IIT Goa's curriculum, academic standards, and faculty recruitment follow IIT Bombay's guidelines. This is one of the strongest mentor relationships in the IIT system and gives IIT Goa graduates credibility with recruiters who respect the IIT Bombay academic standard.",
      },
    ],
    relatedIITs: ["iit-bombay", "iit-bhilai", "iit-dharwad"],
  },

  {
    slug: "iit-jammu",
    name: "IIT Jammu",
    fullName: "Indian Institute of Technology Jammu",
    city: "Jammu",
    state: "Jammu & Kashmir",
    nirfRank: 38,
    generation: "gen3",
    description:
      "IIT Jammu, established in 2016, is located in Jagti near Jammu city. Mentored by IIT Delhi, the institute has been building its academic foundation with a focus on quality education and research. The permanent campus is under development on a 533-acre site. Despite being one of the newer IITs, IIT Jammu benefits from strong mentorship from India's top-ranked IIT (Delhi) and has been attracting growing recruiter interest. The Placement Cell is actively expanding its corporate network.",
    placements: [
      {
        year: 2025,
        highestPackage: "₹25 LPA+",
        averagePackage: "₹10 LPA",
        medianPackage: "₹8.5 LPA",
        placementPercentage: "72%",
        totalOffers: "150+",
        internationalOffers: "Data pending",
        topRecruiters: [
          "Amazon",
          "Samsung",
          "Oracle",
          "Infosys",
          "TCS",
          "Wipro",
          "Cognizant",
        ],
        branchWise: [
          { branch: "Computer Science", avgPackage: "₹16 LPA", medianPackage: "₹13 LPA" },
          { branch: "Electrical Engineering", avgPackage: "₹10 LPA", medianPackage: "₹8.5 LPA" },
          { branch: "Mechanical Engineering", avgPackage: "₹8.5 LPA", medianPackage: "₹7.5 LPA" },
          { branch: "Civil Engineering", avgPackage: "₹8 LPA", medianPackage: "₹7 LPA" },
        ],
      },
    ],
    ocsLink: "https://placement.iitjammu.ac.in/",
    faqs: [
      {
        question: "What is the highest package at IIT Jammu?",
        answer:
          "The highest package at IIT Jammu for the 2024-25 season was over ₹25 LPA. As a newer IIT established in 2016 and mentored by IIT Delhi (ranked #1), the institute's placement record is growing. The IIT brand and Delhi mentorship help attract credible recruiters even at this early stage of the institute's development.",
      },
      {
        question: "What is the average salary at IIT Jammu?",
        answer:
          "The average salary at IIT Jammu for 2024-25 was approximately ₹10 LPA, with a median of ₹8.5 LPA. CSE graduates averaged around ₹16 LPA. While these numbers are still developing, they are competitive with other gen-3 IITs and are expected to improve as the institute's alumni network grows and more recruiters participate.",
      },
      {
        question: "Is IIT Jammu a good choice?",
        answer:
          "IIT Jammu is a solid option for students seeking IIT-quality education. Mentored by IIT Delhi (India's top-ranked IIT), it follows strong academic standards. The institute offers lower JEE cutoffs than established IITs, making it accessible to more students. While placements are still developing, the IIT brand provides a strong foundation for career growth, and the numbers are improving each year.",
      },
    ],
    relatedIITs: ["iit-delhi", "iit-mandi", "iit-ropar"],
  },

  {
    slug: "iit-dharwad",
    name: "IIT Dharwad",
    fullName: "Indian Institute of Technology Dharwad",
    city: "Dharwad",
    state: "Karnataka",
    nirfRank: 42,
    generation: "gen3",
    description:
      "IIT Dharwad, established in 2016, is located in Dharwad, Karnataka. Mentored by IIT Bombay, the institute follows IIT Bombay's academic framework and has been building its programmes with a focus on quality. Located in Karnataka, IIT Dharwad has proximity to Bengaluru's thriving tech ecosystem. The institute has been actively developing its campus infrastructure and academic capabilities. The Placement Cell is in its early stages of building corporate relationships.",
    placements: [
      {
        year: 2025,
        highestPackage: "₹25 LPA+",
        averagePackage: "₹10 LPA",
        medianPackage: "₹8.5 LPA",
        placementPercentage: "70%",
        totalOffers: "140+",
        internationalOffers: "Data pending",
        topRecruiters: [
          "Amazon",
          "Samsung",
          "Oracle",
          "Infosys",
          "TCS",
          "Wipro",
          "Cognizant",
          "Capgemini",
        ],
        branchWise: [
          { branch: "Computer Science", avgPackage: "₹16 LPA", medianPackage: "₹13 LPA" },
          { branch: "Electrical Engineering", avgPackage: "₹10 LPA", medianPackage: "₹8.5 LPA" },
          { branch: "Mechanical Engineering", avgPackage: "₹8.5 LPA", medianPackage: "₹7 LPA" },
        ],
      },
    ],
    ocsLink: "https://placement.iitdh.ac.in/",
    faqs: [
      {
        question: "What is the highest package at IIT Dharwad?",
        answer:
          "The highest package at IIT Dharwad for the 2024-25 season was over ₹25 LPA. As a newer IIT mentored by IIT Bombay, the institute is still building its placement infrastructure. The Karnataka location and IIT Bombay mentorship provide a strong foundation for growth in the coming years.",
      },
      {
        question: "What is the average salary at IIT Dharwad?",
        answer:
          "The average salary at IIT Dharwad for 2024-25 was approximately ₹10 LPA, with a median of ₹8.5 LPA. CSE graduates averaged around ₹16 LPA. As one of the newer IITs, these numbers are expected to improve significantly as the institute matures, builds its alumni network, and attracts more high-paying recruiters.",
      },
      {
        question: "Is IIT Dharwad mentored by IIT Bombay?",
        answer:
          "Yes, IIT Dharwad is mentored by IIT Bombay, one of India's top 2 engineering institutions. This mentorship ensures that IIT Dharwad follows IIT Bombay's curriculum standards, academic rigour, and assessment patterns. Faculty recruitment also benefits from the IIT Bombay connection. This mentor relationship gives IIT Dharwad graduates additional credibility with potential recruiters.",
      },
    ],
    relatedIITs: ["iit-bombay", "iit-goa", "iit-palakkad"],
  },
];

// ──────────────────────────────────────────────
// Hub-page FAQs (general IIT placement questions)
// ──────────────────────────────────────────────

export const HUB_FAQS: FAQ[] = [
  {
    question: "What is the average package at IITs in 2025?",
    answer:
      "The average package at IITs in 2025 varies significantly by institute and branch. The top 7 gen-1 IITs (Bombay, Delhi, Madras, Kanpur, Kharagpur, Roorkee, Guwahati) reported average packages in the range of ₹19-23.5 LPA. Gen-2 IITs like IIT Hyderabad, Indore, and Gandhinagar averaged ₹14-18 LPA. Newer gen-3 IITs averaged ₹10-13 LPA. Within any IIT, Computer Science graduates command the highest averages (₹28-55 LPA at top IITs), while core branches like Mechanical and Civil average ₹10-18 LPA depending on the institute.",
  },
  {
    question: "What is the highest package ever offered at an IIT?",
    answer:
      "The highest package in the 2024-25 placement season was ₹2.44 Crore per annum, offered at IIT Kharagpur by a quantitative trading firm. IIT Bombay recorded the next highest at ₹1.48 Cr+. Historically, packages above ₹1 Crore have been regularly offered at IIT Bombay, IIT Delhi, IIT Madras, and IIT Kanpur, primarily by quantitative trading firms (Tower Research, DE Shaw, Graviton, Optiver) and global tech companies for specialized roles in algorithmic trading, AI research, and systems engineering.",
  },
  {
    question: "How do IIT placements work?",
    answer:
      "IIT placements follow a structured process managed by each institute's placement cell (OCS, CDC, SPO, etc.). Companies register and are slotted based on the compensation they offer — the highest-paying companies get earlier slots (Day 1). The process typically begins in December with Phase 1 (the main season, running until February) and continues with Phase 2 (March-May) for remaining students. Before formal placements, many students receive Pre-Placement Offers (PPOs) based on their summer internship performance. Each student can hold one offer at a time — if they receive a higher offer later, the previous one is released back.",
  },
  {
    question: "Which IIT has the best placements?",
    answer:
      "IIT Bombay consistently has the best overall placement record, with the highest average package (₹23.5 LPA), most international offers (60+), and top-tier recruiter participation. IIT Delhi (NIRF #1) and IIT Madras (#3) are very close behind. However, the 'best' depends on the metric: IIT Kharagpur had the single highest package in 2025 (₹2.44 Cr), IIT Madras has the best CSE average (₹53.2 LPA), and IIT Delhi leads in consulting placements. For overall placement outcomes across all branches, the top 4 IITs (Bombay, Delhi, Madras, Kanpur) are roughly equivalent.",
  },
  {
    question: "Do startups hire from IITs?",
    answer:
      "Yes, a growing number of startups hire from IITs. Well-funded startups like Flipkart, Zomato, PhonePe, CRED, Razorpay, Meesho, and many others actively participate in IIT placement drives. However, early-stage startups often find it challenging to go through the formal placement cell process due to minimum CTC requirements, paperwork, and scheduling constraints. This is where platforms like Novare Talent bridge the gap — we help startups access curated IIT talent without the formal campus recruitment overhead.",
  },
  {
    question: "What is the placement percentage across IITs?",
    answer:
      "Placement percentages vary by IIT: gen-1 IITs (Bombay, Delhi, Madras, etc.) achieve 88-95% placement for registered students. Gen-2 IITs (Hyderabad, Indore, etc.) range from 80-88%. Newer gen-3 IITs achieve 70-78%. It's important to note that many top students don't register for placements — they opt for higher studies (MS/PhD abroad), competitive exams (UPSC), or entrepreneurship. The reported percentage only counts students who actively participate in the placement process.",
  },
  {
    question: "What is a PPO and how does it work at IITs?",
    answer:
      "PPO stands for Pre-Placement Offer. It is an offer made by a company to a student based on their internship performance, before the formal placement season begins. At IITs, PPOs are highly valued — they provide placement security before the main season even starts. Typically, 20-30% of students at top IITs receive PPOs. PPO recipients can either accept (and sit out of formal placements) or reject the PPO and participate in the main placement process. Companies like Google, Microsoft, Goldman Sachs, and top startups actively use internships as a hiring pipeline, extending PPOs to their best interns.",
  },
  {
    question: "What is the Day 1 / Day 2 system in IIT placements?",
    answer:
      "The Day system is how IITs organize their placement schedule. Companies are assigned to specific 'days' based on the compensation they offer. Day 1 companies offer the highest packages (typically ₹25 LPA+ at top IITs) and include firms like Google, Microsoft, Goldman Sachs, and McKinsey. Day 2 companies offer slightly lower but still competitive packages (₹15-25 LPA), and so on. Students can appear for companies on their assigned day and all subsequent days. If a student receives an offer on Day 1, they exit the process (unless they reject it). This system ensures orderly placements and gives students who miss Day 1 opportunities on later days.",
  },
  {
    question: "How can recruiters hire from IITs without going through placement cells?",
    answer:
      "Hiring from IITs outside the formal placement cell process is possible but requires the right connections. Novare Talent provides curated access to verified IIT talent for companies — especially startups and growing companies — who may not meet the minimum CTC requirements of placement cells, can't navigate the complex registration process, or want to hire for roles that don't fit the traditional campus recruitment mould. Through Novare, companies get pre-screened candidates matched to their specific requirements, without the overhead of formal campus recruitment.",
  },
  {
    question: "Which branches at IITs get the highest packages?",
    answer:
      "Computer Science Engineering (CSE) consistently commands the highest packages across all IITs, with averages ranging from ₹16-55 LPA depending on the institute. Electrical Engineering (EE) is typically second, followed by Engineering Physics and Mathematics & Computing programmes. The gap between CSE and other branches is significant — at IIT Bombay, CSE averages ₹55 LPA while Mechanical averages ₹18 LPA. However, emerging fields like AI/ML, Data Science, and Quantitative Finance are creating high-paying opportunities for non-CSE students who develop relevant skills.",
  },
  {
    question: "What are the top recruiting companies at IITs?",
    answer:
      "The top recruiting companies at IITs include: Technology — Google, Microsoft, Amazon, Apple, Meta, Uber, Flipkart, Samsung, Qualcomm; Consulting — McKinsey, BCG, Bain, Kearney; Finance — Goldman Sachs, JP Morgan, Morgan Stanley, Tower Research, DE Shaw, Graviton, Optiver; Core — Tata Steel, L&T, Shell, Schlumberger, ISRO; FMCG — HUL, P&G; Analytics — Mu Sigma, Tiger Analytics. The exact mix varies by IIT, with metro-based IITs attracting more finance and consulting firms, and IITs in industrial regions seeing stronger core engineering recruitment.",
  },
  {
    question: "Is it worth joining a newer IIT over an older NIT?",
    answer:
      "This is a common dilemma for JEE aspirants. In general, even newer IITs offer certain advantages: the IIT brand carries significant weight with recruiters, the academic standards are maintained through mentor IIT relationships, and the alumni network spans all IITs. For CSE, a newer IIT's average package (₹16-20 LPA) often exceeds that of many established NITs. However, for core branches, older NITs with strong local industry connections may offer comparable or better placements. The decision should factor in the specific branch, career goals, and campus infrastructure of the institutions being compared.",
  },
];

// ──────────────────────────────────────────────
// Helper functions
// ──────────────────────────────────────────────

export function getAllIITs(): IITPlacementData[] {
  return IIT_PLACEMENT_DATA;
}

export function getIITBySlug(slug: string): IITPlacementData | undefined {
  return IIT_PLACEMENT_DATA.find((iit) => iit.slug === slug);
}

export function getIITsByGeneration(gen: "gen1" | "gen2" | "gen3"): IITPlacementData[] {
  return IIT_PLACEMENT_DATA.filter((iit) => iit.generation === gen);
}

export function getRelatedIITs(slug: string): IITPlacementData[] {
  const iit = getIITBySlug(slug);
  if (!iit) return [];
  return iit.relatedIITs
    .map((relSlug) => getIITBySlug(relSlug))
    .filter((item): item is IITPlacementData => item !== undefined);
}

export function getLatestPlacement(iit: IITPlacementData): YearlyPlacement {
  return iit.placements[0];
}
