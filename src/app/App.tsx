import { useState, useRef, useEffect } from "react";
import {
  Monitor,
  BookOpen,
  GraduationCap,
  CreditCard,
  Settings,
  Send,
  Menu,
  X,
  LogIn,
  UserPlus,
  Eye,
  EyeOff,
  ChevronRight,
  Users,
  Wifi,
  WifiOff,
  Bell,
  Phone,
  MapPin,
  CheckSquare,
  Layers,
  Award,
  Briefcase,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Code2,
  Database,
  FileText,
  Laptop,
  School,
  ShieldCheck,
  Timer,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
type Page = "home" | "schools" | "courses" | "admissions" | "auth" | "dashboard";
type AuthMode = "signup" | "login";

// ─── Data ─────────────────────────────────────────────────────────────────────
const PROGRAMS = [
  {
    school: "School of Engineering & Technology",
    Icon: Code2,
    gradient: "from-[#1f2f8f] to-[#5b55d6]",
    borderAccent: "border-[#1f2f8f]/20",
    courses: [
      "Network and Security",
      "Telecommunication / ICT",
      "Computer Software Engineering",
      "Computer Hardware Engineering",
      "Web Design and E-Commerce",
      "Computer Graphics & Web Design",
      "Database Management",
      "Full Stack Development",
    ],
  },
  {
    school: "School of Business",
    Icon: Briefcase,
    gradient: "from-[#6d35c9] to-[#4338ca]",
    borderAccent: "border-[#5bc8bd]/20",
    courses: [
      "Assistant Manager / Digital Marketing",
      "Business Finance and Management",
      "Web Design / E-Commerce / Digital Marketing",
      "Accountancy / Computerized Accounting",
    ],
  },
  {
    school: "School of Education",
    Icon: GraduationCap,
    gradient: "from-[#0f7d69] to-[#5bc8bd]",
    borderAccent: "border-[#3b4fa8]/20",
    courses: [
      "Didactics & Curriculum Development",
      "Guidance and Counselling",
      "Special Education",
      "Public Health Education",
      "Educational Administration",
      "Mathematics of Education",
      "Statistics",
    ],
  },
];

const SHORT_COURSES = [
  { name: "Microsoft Office Package", Icon: FileText },
  { name: "Graphics Design", Icon: Layers },
  { name: "Programming / Coding (C/C++, Python, Java, ML)", Icon: Code2 },
  { name: "Cloud Computing (AWS, MS-Azure)", Icon: Wifi },
  { name: "Computer Networking (CCNA, CCNP)", Icon: Monitor },
  { name: "Data Science", Icon: Database },
  { name: "Data Analysis", Icon: ClipboardList },
  { name: "Web Design (HTML5, CSS3, React, Node.js)", Icon: Laptop },
  { name: "Database Administration (SQL, Oracle)", Icon: Database },
  { name: "Cyber Security / Ethical Hacking", Icon: ShieldCheck },
  { name: "CompTIA A+", Icon: Award },
];

const NAV_LINKS = ["Home", "Academic Schools", "Professional Courses", "Admissions"];
const CONTACT_HOTLINES = ["677 271 998", "699 918 003", "680 042 279"];

const MARKET_SKILLS = [
  {
    title: "AI & Data Analytics",
    Icon: Database,
    tag: "High demand",
    text: "Students learn how to clean data, read trends, build dashboards, and use AI tools responsibly for research and business decisions.",
    points: ["Excel, SQL, Python", "Dashboard reporting", "Prompt literacy"],
  },
  {
    title: "Cybersecurity & Networking",
    Icon: ShieldCheck,
    tag: "Career critical",
    text: "Practical labs help learners configure networks, understand threats, protect devices, and prepare for support or security assistant roles.",
    points: ["Packet Tracer labs", "Linux basics", "Security drills"],
  },
  {
    title: "Cloud & Modern IT Support",
    Icon: Wifi,
    tag: "Cloud ready",
    text: "Training introduces cloud services, storage, virtual machines, device maintenance, and reliable support routines for modern offices.",
    points: ["AWS and Azure basics", "Help desk practice", "Secure setup"],
  },
  {
    title: "Software & Web Development",
    Icon: Code2,
    tag: "Portfolio based",
    text: "Learners move from fundamentals to real web projects, API connections, database workflows, and portfolio work they can present.",
    points: ["React and Node.js", "Supabase basics", "Project deployment"],
  },
  {
    title: "Digital Business & E-Commerce",
    Icon: Briefcase,
    tag: "Business growth",
    text: "Business students practice online sales, content planning, digital marketing, customer communication, and computerized accounting.",
    points: ["SEO and social media", "WhatsApp sales", "Accounting software"],
  },
  {
    title: "Professional Productivity",
    Icon: Laptop,
    tag: "Workplace ready",
    text: "Every learner strengthens everyday computer confidence: documents, spreadsheets, presentations, email, file management, and reports.",
    points: ["Office documents", "Presentations", "Workplace reports"],
  },
];

const SCHOOL_ADVANTAGES = [
  {
    title: "Market-Aligned Curriculum",
    Icon: ClipboardList,
    text: "Program topics are refreshed around digital careers, campus practice, and the tools students are likely to meet at work.",
  },
  {
    title: "Portfolio And Lab Evidence",
    Icon: FileText,
    text: "Students complete assignments, designs, configurations, dashboards, or code projects that show practical competence.",
  },
  {
    title: "Mentorship And Career Guidance",
    Icon: Users,
    text: "Learners receive adviser support for course selection, study planning, interview readiness, and next-step progression.",
  },
];

const ADMISSION_OPTIONS = [
  {
    title: "HND Pathway",
    Icon: GraduationCap,
    text: "For students starting a structured higher national diploma in technology, business, or education.",
  },
  {
    title: "BSc Top-Up",
    Icon: Award,
    text: "For qualified HND holders who want a guided route into a Year 3 Bachelor program review.",
  },
  {
    title: "Professional Certificates",
    Icon: Briefcase,
    text: "For workers, entrepreneurs, and school leavers who need focused digital skills in weeks, not years.",
  },
  {
    title: "Flexible Class Batches",
    Icon: CalendarDays,
    text: "Admissions can help students confirm weekday, weekend, or blended learning options when batches are open.",
  },
];

const getNavPage = (link: string): Page => {
  if (link === "Academic Schools") return "schools";
  if (link === "Professional Courses") return "courses";
  if (link === "Admissions") return "admissions";
  return "home";
};

const CHECKLIST = [
  "Photocopy of Birth Certificate",
  "Photocopy of GCE A/L or Equivalent",
  "Photocopy of National Identity Card",
  "Two (02) recent passport-size photos",
  "Non-refundable registration fee of 25,000 FCFA",
  "HND Attestation (for degree tracks)",
];

const CHAT_SEED = [
  { sender: "Instructor", text: "Welcome class! Please download your terminal setup from the course portal before we begin.", time: "09:01" },
  { sender: "Amadou - HND Software", text: "Sir, is our Supabase database layer fully migration-verified?", time: "09:03" },
  { sender: "Florence - Network Tech", text: "The audio feed is perfectly synchronized on my end!", time: "09:04" },
  { sender: "Instructor", text: "Yes Amadou, the schema is live. Check #resources for the migration scripts.", time: "09:05" },
  { sender: "Paul - HND Business", text: "Will the session recording be available after class?", time: "09:07" },
  { sender: "Instructor", text: "Recordings are uploaded to Course Modules within 30 minutes after each session.", time: "09:08" },
];

const SIDEBAR_ITEMS = [
  { label: "Dashboard Overview", Icon: Monitor },
  { label: "Live Stream Lectures", Icon: Wifi },
  { label: "Course Modules & Handouts", Icon: BookOpen },
  { label: "Tuition & Fees Ledger", Icon: CreditCard },
  { label: "Account Profile Settings", Icon: Settings },
];

const SCHOOL_PAGE_DETAILS = [
  {
    name: "School of Engineering & Technology",
    Icon: Code2,
    image: "/assets/school-technology-code.jpg",
    credential: "HND, BSc Top-Up, Professional Diploma",
    duration: "2-3 years",
    summary:
      "A practical technology school for students who want to build, secure, repair, and operate modern digital systems.",
    highlights: ["Cisco-style networking labs", "Software product studio", "Hardware maintenance bench", "Cybersecurity drills"],
    focus: ["Network and Security", "Computer Software Engineering", "Database Management", "Cloud Computing", "AI and Data Basics"],
    careers: ["Network Technician", "Software Developer", "Cybersecurity Assistant", "Database Support Officer", "IT Support Specialist"],
  },
  {
    name: "School of Business",
    Icon: Briefcase,
    image: "/assets/school-business-students.jpg",
    credential: "HND, BSc Top-Up, Skills Certificate",
    duration: "2-3 years",
    summary:
      "A career-minded business school for students preparing for management, finance, accounting, and digital commerce roles.",
    highlights: ["Accounting software practice", "Digital marketing studio", "Business presentation clinics", "Entrepreneurship labs"],
    focus: ["Business Finance and Management", "Digital Marketing", "E-Commerce", "Computerized Accounting", "Operations Management"],
    careers: ["Assistant Manager", "Accounts Clerk", "Digital Marketing Officer", "Operations Assistant", "Small Business Operator"],
  },
  {
    name: "School of Education",
    Icon: School,
    image: "/assets/academic-students-black.jpg",
    credential: "HND, BSc Top-Up, Education Certificate",
    duration: "2-3 years",
    summary:
      "A structured education pathway for future teachers, school administrators, counsellors, and public health educators.",
    highlights: ["Teaching practice sessions", "Curriculum design workshops", "Counselling and learner support labs", "Digital classroom practice"],
    focus: ["Didactics", "Guidance and Counselling", "Special Education", "Educational Administration", "Digital Learning Methods"],
    careers: ["Teacher", "Education Officer", "School Administrator", "Guidance Counsellor", "Learning Support Assistant"],
  },
];

const CERTIFICATION_TRACKS = [
  {
    title: "AI, Data Analysis & Business Intelligence",
    Icon: Database,
    duration: "10 weeks",
    level: "Beginner to Intermediate",
    tools: ["Excel", "SQL", "Python", "Power BI", "AI prompts"],
    outcomes: ["Clean and organize datasets", "Build dashboard reports", "Use AI tools for research and analysis"],
  },
  {
    title: "Full Stack Web Development",
    Icon: Code2,
    duration: "12 weeks",
    level: "Beginner to Job Ready",
    tools: ["HTML5", "CSS3", "React", "Node.js", "Supabase"],
    outcomes: ["Build responsive websites", "Connect APIs and databases", "Deploy portfolio projects"],
  },
  {
    title: "Networking & Cybersecurity",
    Icon: ShieldCheck,
    duration: "10 weeks",
    level: "Intermediate",
    tools: ["CCNA labs", "Packet Tracer", "Linux basics", "Firewalls", "Security drills"],
    outcomes: ["Configure networks", "Troubleshoot devices", "Understand practical security controls"],
  },
  {
    title: "Cloud Computing & DevOps Foundation",
    Icon: Wifi,
    duration: "8 weeks",
    level: "Foundation",
    tools: ["AWS", "Microsoft Azure", "Virtual machines", "Storage", "GitHub Actions"],
    outcomes: ["Launch basic cloud services", "Understand cloud costs", "Practice secure deployments"],
  },
  {
    title: "Digital Marketing & E-Commerce",
    Icon: Briefcase,
    duration: "6 weeks",
    level: "Business Growth",
    tools: ["SEO basics", "Meta Business", "Content calendars", "WhatsApp sales"],
    outcomes: ["Plan online campaigns", "Set up product promotion flows", "Track leads and customer responses"],
  },
  {
    title: "Graphics, UI & Digital Media",
    Icon: Layers,
    duration: "6 weeks",
    level: "Creative Foundation",
    tools: ["Brand kits", "Poster design", "UI mockups", "Social media assets", "Print prep"],
    outcomes: ["Design brand assets", "Prepare marketing visuals", "Build a creative portfolio"],
  },
  {
    title: "Office Productivity & Computerized Accounting",
    Icon: FileText,
    duration: "6 weeks",
    level: "Workplace Foundation",
    tools: ["Word", "Excel", "PowerPoint", "Email", "Accounting software"],
    outcomes: ["Prepare office documents", "Build spreadsheets", "Handle basic accounting workflows"],
  },
  {
    title: "IT Support & Computer Maintenance",
    Icon: Laptop,
    duration: "6 weeks",
    level: "Beginner",
    tools: ["Windows setup", "Hardware checks", "Troubleshooting", "Backups"],
    outcomes: ["Maintain office computers", "Diagnose common faults", "Support everyday users confidently"],
  },
];

const ADMISSION_STEPS = [
  {
    title: "Choose Your Program",
    detail: "Meet an admissions adviser, review your background, and select an HND, BSc top-up, or professional course pathway.",
  },
  {
    title: "Submit Documents",
    detail: "Bring photocopies of your certificate, ID card, birth certificate, two passport photos, and any prior HND attestation.",
  },
  {
    title: "Complete Registration",
    detail: "Pay the non-refundable registration fee, confirm your intake, and receive your student portal access details.",
  },
  {
    title: "Start Orientation",
    detail: "Join orientation, collect your timetable, meet your course coordinator, and begin live or campus-based classes.",
  },
];

const ADMISSION_FEES = [
  { label: "Registration Fee", value: "25,000 FCFA", note: "Paid once during application submission." },
  { label: "Program Fees", value: "By pathway", note: "Confirmed at the admissions desk after program selection." },
  { label: "Payment Support", value: "Flexible", note: "Students can discuss installment planning with finance." },
];

// ─── Landing Page ──────────────────────────────────────────────────────────────
const ASSETS = {
  logo: "/assets/itcab-logo.jpg",
  manager: "/assets/ceo-manager.jpg",
  classSample: "/assets/class-sample.pdf",
  academicStudents: "/assets/academic-students-black.jpg",
  heroStudents: "/assets/academic-students-black.jpg",
  campusStudent: "/assets/academic-students-black.jpg",
  businessStudent: "/assets/academic-students-black.jpg",
};

function SiteHeader({ activePage, onNavigate }: { activePage: Page; onNavigate: (p: Page) => void }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <div className="bg-accent text-accent-foreground text-center text-xs font-semibold py-1.5 tracking-wide">
        In Affiliation with International University Bamenda (IUB)
      </div>
      <header className="bg-primary sticky top-0 z-50 shadow-xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-6">
          <button type="button" onClick={() => onNavigate("home")} className="shrink-0 text-left flex items-center gap-3">
            <img
              src={ASSETS.logo}
              alt="IT Complex Academy Bamenda logo"
              className="w-12 h-12 rounded-xl object-contain bg-white p-1.5 shadow-sm"
            />
            <div>
              <div className="font-display font-bold text-white text-xl lg:text-2xl leading-none tracking-tight">
                IT COMPLEX ACADEMY BAMENDA
              </div>
              <div className="text-accent text-xs font-semibold mt-0.5 tracking-wide">
                Next Gen Learning For The Digital Age
              </div>
            </div>
          </button>

          <nav className="hidden lg:flex items-center gap-7">
            {NAV_LINKS.map((link) => {
              const navPage = getNavPage(link);
              const isActive = navPage === activePage;
              return (
                <button
                  key={link}
                  type="button"
                  onClick={() => onNavigate(navPage)}
                  className={`text-sm font-medium transition-colors duration-150 ${
                    isActive ? "text-accent" : "text-white/70 hover:text-white"
                  }`}
                >
                  {link}
                </button>
              );
            })}
          </nav>

          <div className="hidden lg:flex items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigate("auth")}
              className="bg-accent hover:bg-[#43a99f] text-white text-sm font-bold px-5 py-2.5 rounded-lg transition-colors duration-150"
            >
              Student Portal
            </button>
          </div>

          <button className="lg:hidden text-white" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {mobileOpen && (
          <div className="lg:hidden border-t border-white/10 bg-[#1a2775] px-6 py-5 flex flex-col gap-4">
            {NAV_LINKS.map((link) => {
              const navPage = getNavPage(link);
              const isActive = navPage === activePage;
              return (
                <button
                  key={link}
                  type="button"
                  onClick={() => {
                    onNavigate(navPage);
                    setMobileOpen(false);
                  }}
                  className={`text-sm font-medium text-left ${
                    isActive ? "text-accent" : "text-white/80 hover:text-white"
                  }`}
                >
                  {link}
                </button>
              );
            })}
            <button
              onClick={() => {
                onNavigate("auth");
                setMobileOpen(false);
              }}
              className="bg-accent text-white text-sm font-bold px-5 py-3 rounded-lg"
            >
              Student Portal
            </button>
          </div>
        )}
      </header>
    </>
  );
}

function SiteFooter({ onNavigate }: { onNavigate: (p: Page) => void }) {
  return (
    <footer className="bg-[#151949] text-white py-14">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-10">
          <div>
            <div className="font-display font-bold text-xl mb-2">IT COMPLEX ACADEMY BAMENDA</div>
            <div className="text-accent text-sm mb-4 font-semibold">Next Gen Learning For The Digital Age</div>
            <p className="text-white/45 text-sm leading-relaxed">
              Practical HND, BSc top-up, professional certification, and virtual learning pathways for ambitious
              students in Bamenda.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-xs uppercase tracking-widest text-accent mb-5 flex items-center gap-2">
              <MapPin size={13} /> Visit The Campus
            </h4>
            <ul className="space-y-4 text-sm text-white/65">
              <li>
                <span className="text-white font-semibold block mb-0.5">Campus A</span>
                Behind Union Bank, Commercial Avenue, Bamenda
              </li>
              <li>
                <span className="text-white font-semibold block mb-0.5">Campus B</span>
                Behind International Hotel, entrance to Fon Street, 2nd Floor
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-xs uppercase tracking-widest text-accent mb-5 flex items-center gap-2">
              <Phone size={13} /> Contact Hotlines
            </h4>
            <ul className="space-y-2.5">
              {CONTACT_HOTLINES.map((phone) => (
                <li key={phone}>
                  <a
                    href={`tel:+237${phone.replace(/\s/g, "")}`}
                    className="font-mono text-white/65 hover:text-accent transition-colors text-sm"
                  >
                    +237 {phone}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-white/35 text-xs">Copyright 2026 IT Complex Academy Bamenda. All rights reserved.</p>
          <button onClick={() => onNavigate("auth")} className="text-accent text-xs font-semibold hover:underline">
            Open Student Portal
          </button>
        </div>
      </div>
    </footer>
  );
}

function LandingPage({ onNavigate }: { onNavigate: (p: Page) => void }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* Affiliation Banner */}
      <div className="bg-accent text-accent-foreground text-center text-xs font-semibold py-1.5 tracking-wide">
        In Affiliation with International University Bamenda (IUB)
      </div>

      {/* Navbar */}
      <header className="bg-primary sticky top-0 z-50 shadow-xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-6">
          {/* Brand */}
          <div className="shrink-0 flex items-center gap-3">
            <img
              src={ASSETS.logo}
              alt="IT Complex Academy Bamenda logo"
              className="w-12 h-12 rounded-xl object-contain bg-white p-1.5 shadow-sm"
            />
            <div>
              <div className="font-display font-bold text-white text-xl lg:text-2xl leading-none tracking-tight">
                IT COMPLEX ACADEMY BAMENDA
              </div>
              <div className="text-accent text-xs font-semibold mt-0.5 tracking-wide">
                Next Gen Learning For The Digital Age
              </div>
            </div>
          </div>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-7">
            {NAV_LINKS.map((link) => (
              <button
                key={link}
                type="button"
                onClick={() => onNavigate(getNavPage(link))}
                className={`text-sm font-medium transition-colors duration-150 ${
                  link === "Home" ? "text-accent" : "text-white/70 hover:text-white"
                }`}
              >
                {link}
              </button>
            ))}
          </nav>

          {/* CTA */}
          <div className="hidden lg:flex items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigate("auth")}
              className="bg-accent hover:bg-[#43a99f] text-white text-sm font-bold px-5 py-2.5 rounded-lg transition-colors duration-150"
            >
              Student Portal
            </button>
          </div>

          {/* Mobile toggle */}
          <button className="lg:hidden text-white" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-white/10 bg-[#1a2775] px-6 py-5 flex flex-col gap-4">
            {NAV_LINKS.map((link) => (
              <button
                key={link}
                type="button"
                onClick={() => {
                  onNavigate(getNavPage(link));
                  setMobileOpen(false);
                }}
                className="text-white/80 hover:text-white text-sm font-medium text-left"
              >
                {link}
              </button>
            ))}
            <button
              onClick={() => onNavigate("auth")}
              className="bg-accent text-white text-sm font-bold px-5 py-3 rounded-lg"
            >
              Student Portal
            </button>
          </div>
        )}
      </header>

      {/* ── Hero ── */}
      <section className="relative bg-primary min-h-[560px] overflow-hidden">
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{
            backgroundImage: `url('${ASSETS.heroStudents}')`,
          }}
          role="img"
          aria-label="Students in a professional training environment"
        />
        {/* Geometric accent */}
        <div className="absolute top-0 right-0 w-[55%] h-full bg-gradient-to-l from-accent/15 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent" />

        <div className="relative max-w-7xl mx-auto px-6 py-24 lg:py-32">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 bg-accent/20 border border-accent/40 text-accent text-xs font-bold uppercase tracking-widest px-3.5 py-1.5 rounded-full mb-6">
              HND | BSc | Professional Certifications
            </span>
            <h1 className="font-display text-5xl lg:text-7xl font-bold text-white leading-none tracking-tight mb-6">
              World-Class<br />
              <span className="text-accent">Professional</span><br />
              Training in Bamenda
            </h1>
            <p className="text-white/65 text-base lg:text-lg leading-relaxed mb-10 max-w-lg">
              Are you looking for a place to be trained as a world-class professional in any specialty of your choice? IT Complex has you covered.
            </p>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => onNavigate("auth")}
                className="bg-accent hover:bg-[#43a99f] text-white font-bold text-base px-8 py-4 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-accent/30 flex items-center gap-2"
              >
                Enroll Online Now <ChevronRight size={18} />
              </button>
              <a
                href="#programs"
                className="border border-white/25 hover:border-white/50 text-white/75 hover:text-white font-semibold text-base px-8 py-4 rounded-xl transition-all duration-200"
              >
                View Programs
              </a>
            </div>
          </div>
        </div>

        {/* Stats strip */}
        <div className="relative bg-[#151949]/82 backdrop-blur-sm border-t border-white/10">
          <div className="max-w-7xl mx-auto px-6 py-5 grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { value: "15+", label: "Academic Programs" },
              { value: "11", label: "Pro Certifications" },
              { value: "IUB", label: "Partner University" },
              { value: "2", label: "Campus Locations" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="font-display font-bold text-accent text-2xl">{stat.value}</div>
                <div className="text-white/45 text-xs font-medium mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-card border-y border-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-12 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
            <div className="max-w-3xl">
              <p className="text-accent font-semibold text-xs uppercase tracking-widest mb-2">
                2026 Skills Focus
              </p>
              <h2 className="font-display font-bold text-primary text-3xl lg:text-5xl leading-tight">
                Learn the digital skills employers and businesses now ask for
              </h2>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-md">
              ITCAB combines academic programs with practical modules in AI, data, cybersecurity, cloud, business,
              and productivity so students can graduate with usable workplace confidence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {MARKET_SKILLS.map(({ title, Icon, tag, text, points }) => (
              <article key={title} className="bg-background border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-4 mb-5">
                  <div className="w-12 h-12 rounded-xl bg-primary/8 flex items-center justify-center">
                    <Icon className="text-primary" size={23} />
                  </div>
                  <span className="bg-accent/10 text-accent text-xs font-bold px-3 py-1 rounded-full">{tag}</span>
                </div>
                <h3 className="font-display font-bold text-primary text-xl mb-3">{title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-5">{text}</p>
                <div className="flex flex-wrap gap-2">
                  {points.map((point) => (
                    <span key={point} className="bg-muted text-muted-foreground text-xs font-semibold px-3 py-1.5 rounded-full">
                      {point}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Academic Programs ── */}
      <section id="programs" className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-12">
            <p className="text-accent font-semibold text-xs uppercase tracking-widest mb-2">
              Degree & HND Tracks
            </p>
            <h2 className="font-display font-bold text-primary text-3xl lg:text-5xl leading-tight">
              Our HND &amp; BSc Academic Programs
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {PROGRAMS.map((prog) => (
              <div
                key={prog.school}
                className={`bg-card rounded-2xl border ${prog.borderAccent} overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200 group`}
              >
                <div className={`bg-gradient-to-br ${prog.gradient} px-6 py-6`}>
                  <div className="w-11 h-11 rounded-xl bg-white/12 border border-white/15 flex items-center justify-center mb-4">
                    <prog.Icon className="text-white" size={23} />
                  </div>
                  <h3 className="font-display font-bold text-white text-xl leading-tight">{prog.school}</h3>
                </div>
                <ul className="px-6 py-5 space-y-2.5">
                  {prog.courses.map((course, i) => (
                    <li key={course} className="flex items-start gap-2.5 text-sm text-foreground/80">
                      <span className="font-mono text-accent font-bold text-xs mt-0.5 shrink-0 w-5">
                        {String(i + 1).padStart(2, "0")}.
                      </span>
                      {course}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Short Courses ── */}
      <section className="py-20 bg-card border-y border-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-12 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            <div>
              <p className="text-accent font-semibold text-xs uppercase tracking-widest mb-2">
                Industry-Recognized
              </p>
              <h2 className="font-display font-bold text-primary text-3xl lg:text-5xl leading-tight">
                Professional Computer Certifications
              </h2>
            </div>
            <button
              onClick={() => onNavigate("auth")}
              className="shrink-0 bg-primary hover:bg-[#1a2775] text-white font-semibold text-sm px-6 py-3 rounded-xl transition-colors duration-150 self-start lg:self-auto"
            >
              Enroll in a Course
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {SHORT_COURSES.map((course, i) => (
              <div
                key={course.name}
                className="flex items-center gap-4 p-4 rounded-xl border border-border bg-background hover:border-accent/50 hover:bg-[#f0faf9] transition-all duration-200 group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/8 flex items-center justify-center text-lg shrink-0 group-hover:bg-accent/15 transition-colors duration-200">
                  <course.Icon className="text-primary" size={19} />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                    {course.name}
                  </span>
                </div>
                <span className="font-mono text-xs text-muted-foreground shrink-0">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Admissions ── */}
      <section className="py-20 bg-primary">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-12 text-center">
            <p className="text-accent font-semibold text-xs uppercase tracking-widest mb-2">How to Apply</p>
            <h2 className="font-display font-bold text-white text-3xl lg:text-5xl leading-tight">
              Entry Qualifications &amp; Admission Requirements
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
            {/* HND Criteria */}
            <div className="bg-white/6 border border-white/10 rounded-2xl p-8 hover:bg-white/8 transition-colors duration-200">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
                  <GraduationCap className="text-accent" size={20} />
                </div>
                <h3 className="font-display font-bold text-white text-xl">HND Entry Criteria</h3>
              </div>
              <p className="text-white/65 text-sm leading-relaxed mb-4">
                Prospective candidates for HND must be holders of{" "}
                <strong className="text-white font-semibold">GCE Advanced Level Certificate</strong> in at least
                two papers (excluding Religious Knowledge) or an equivalent certificate.
              </p>
              <p className="text-white/65 text-sm leading-relaxed">
                An HND attestation/certificate is required for the{" "}
                <strong className="text-white font-semibold">Year 3 Bachelor&apos;s Degree program</strong>.
              </p>
            </div>

            {/* Checklist */}
            <div className="bg-white/6 border border-white/10 rounded-2xl p-8 hover:bg-white/8 transition-colors duration-200">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
                  <CheckSquare className="text-accent" size={20} />
                </div>
                <h3 className="font-display font-bold text-white text-xl">Document Checklist</h3>
              </div>
              <ul className="space-y-3">
                {CHECKLIST.map((doc) => (
                  <li key={doc} className="flex items-start gap-3 text-sm text-white/70">
                    <div className="mt-0.5 w-4 h-4 rounded border border-accent bg-accent/15 flex items-center justify-center shrink-0">
                      <div className="w-1.5 h-1.5 rounded-sm bg-accent" />
                    </div>
                    {doc}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={() => onNavigate("auth")}
              className="bg-accent hover:bg-[#43a99f] text-white font-bold text-base px-10 py-4 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-accent/30"
            >
              Apply Online Now
            </button>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-[#151949] text-white py-14">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-10">
            <div>
              <div className="font-display font-bold text-xl mb-2">IT COMPLEX ACADEMY BAMENDA</div>
              <div className="text-accent text-sm mb-4 font-semibold">Next Gen Learning For The Digital Age</div>
              <p className="text-white/45 text-sm leading-relaxed">
                In Affiliation with International University Bamenda. Empowering the next generation of technology
                and business professionals in Cameroon and beyond.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-xs uppercase tracking-widest text-accent mb-5 flex items-center gap-2">
                <MapPin size={13} /> Campus Locations
              </h4>
              <ul className="space-y-4 text-sm text-white/65">
                <li>
                  <span className="text-white font-semibold block mb-0.5">Campus A</span>
                  Behind Union Bank, Commercial Avenue, Bamenda
                </li>
                <li>
                  <span className="text-white font-semibold block mb-0.5">Campus B</span>
                  White storey building behind International Hotel, entrance to Fon Street - 2nd Floor
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-xs uppercase tracking-widest text-accent mb-5 flex items-center gap-2">
                <Phone size={13} /> Contact Hotlines
              </h4>
              <ul className="space-y-2.5">
                {CONTACT_HOTLINES.map((phone) => (
                  <li key={phone}>
                    <a
                      href={`tel:+237${phone.replace(/\s/g, "")}`}
                      className="font-mono text-white/65 hover:text-accent transition-colors text-sm"
                    >
                      +237 {phone}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-white/35 text-xs">
            Copyright 2026 IT Complex Academy Bamenda. All rights reserved.
            </p>
            <button
              onClick={() => onNavigate("auth")}
              className="text-accent text-xs font-semibold hover:underline"
            >
              Student Portal
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ─── Auth Page ─────────────────────────────────────────────────────────────────
function AcademicSchoolsPage({ onNavigate }: { onNavigate: (p: Page) => void }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader activePage="schools" onNavigate={onNavigate} />

      <main>
        <section className="relative bg-primary text-white overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-20"
            style={{
              backgroundImage: `url('${ASSETS.academicStudents}')`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/92 to-primary/55" />
          <div className="relative max-w-7xl mx-auto px-6 py-20 lg:py-24 grid grid-cols-1 lg:grid-cols-[1fr_0.85fr] gap-12 items-center">
            <div>
              <span className="inline-flex items-center gap-2 bg-accent/20 border border-accent/35 text-accent text-xs font-bold uppercase tracking-widest px-3.5 py-1.5 rounded-full mb-6">
                <School size={14} /> Academic Schools
              </span>
              <h1 className="font-display font-bold text-4xl lg:text-6xl leading-none tracking-tight mb-6">
                Choose a school built around your career direction
              </h1>
              <p className="text-white/68 text-base lg:text-lg leading-relaxed max-w-2xl mb-9">
                ITCAB groups its HND, BSc top-up, and professional diploma pathways into focused schools so each
                student can learn with the right labs, mentors, and career outcomes.
              </p>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => onNavigate("auth")}
                  className="bg-accent hover:bg-[#43a99f] text-white font-bold text-sm px-7 py-3.5 rounded-xl transition-all duration-200 flex items-center gap-2"
                >
                  Apply For A Program <ChevronRight size={17} />
                </button>
                <button
                  onClick={() => onNavigate("courses")}
                  className="border border-white/25 hover:border-white/55 text-white/75 hover:text-white font-semibold text-sm px-7 py-3.5 rounded-xl transition-all duration-200"
                >
                  Explore Short Courses
                </button>
              </div>
            </div>

            <div className="bg-white/8 border border-white/12 rounded-2xl p-6 backdrop-blur-sm">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { value: "3", label: "Academic Schools" },
                  { value: "15+", label: "HND and BSc Tracks" },
                  { value: "2-3", label: "Years of Study" },
                  { value: "IUB", label: "Affiliation" },
                ].map((item) => (
                  <div key={item.label} className="rounded-xl bg-white/8 border border-white/10 p-5">
                    <div className="font-display font-bold text-accent text-3xl">{item.value}</div>
                    <div className="text-white/55 text-xs font-semibold mt-1">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-background">
          <div className="max-w-7xl mx-auto px-6">
            <div className="mb-12 max-w-3xl">
              <p className="text-accent font-semibold text-xs uppercase tracking-widest mb-2">Program Faculties</p>
              <h2 className="font-display font-bold text-primary text-3xl lg:text-5xl leading-tight">
                Three schools with practical learning environments
              </h2>
            </div>

            <div className="space-y-8">
              {SCHOOL_PAGE_DETAILS.map((school, index) => {
                const Icon = school.Icon;
                return (
                  <article
                    key={school.name}
                    className={`grid grid-cols-1 lg:grid-cols-2 gap-0 bg-card border border-border rounded-2xl overflow-hidden shadow-sm ${
                      index % 2 === 1 ? "lg:[&>div:first-child]:order-2" : ""
                    }`}
                  >
                    <div className="min-h-[280px] bg-cover bg-center" style={{ backgroundImage: `url('${school.image}')` }} />
                    <div className="p-7 lg:p-9">
                      <div className="flex items-center gap-3 mb-5">
                        <div className="w-11 h-11 rounded-xl bg-primary/8 flex items-center justify-center">
                          <Icon className="text-primary" size={22} />
                        </div>
                        <div>
                          <h3 className="font-display font-bold text-primary text-2xl leading-tight">{school.name}</h3>
                          <p className="text-muted-foreground text-xs font-semibold mt-0.5">
                            {school.credential} | {school.duration}
                          </p>
                        </div>
                      </div>

                      <p className="text-foreground/70 text-sm leading-relaxed mb-6">{school.summary}</p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                          <h4 className="text-xs uppercase tracking-widest text-accent font-bold mb-3">Core Focus</h4>
                          <ul className="space-y-2">
                            {school.focus.map((item) => (
                              <li key={item} className="flex items-start gap-2 text-sm text-foreground/75">
                                <CheckCircle2 className="text-accent shrink-0 mt-0.5" size={15} />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="text-xs uppercase tracking-widest text-accent font-bold mb-3">Career Paths</h4>
                          <ul className="space-y-2">
                            {school.careers.map((item) => (
                              <li key={item} className="flex items-start gap-2 text-sm text-foreground/75">
                                <Briefcase className="text-primary/70 shrink-0 mt-0.5" size={15} />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="mt-7 flex flex-wrap gap-2">
                        {school.highlights.map((item) => (
                          <span key={item} className="bg-muted text-muted-foreground text-xs font-semibold px-3 py-1.5 rounded-full">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="py-16 bg-card border-y border-border">
          <div className="max-w-7xl mx-auto px-6">
            <div className="mb-10 max-w-3xl">
              <p className="text-accent font-semibold text-xs uppercase tracking-widest mb-2">Academic Strength</p>
              <h2 className="font-display font-bold text-primary text-3xl lg:text-4xl leading-tight">
                Professional training that feels organized from day one
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {SCHOOL_ADVANTAGES.map(({ title, Icon, text }) => (
                <article key={title} className="bg-background border border-border rounded-2xl p-6 shadow-sm">
                  <Icon className="text-accent mb-4" size={26} />
                  <h3 className="font-display font-bold text-primary text-xl mb-3">{title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 bg-card border-y border-border">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-10 items-center">
            <div>
              <p className="text-accent font-semibold text-xs uppercase tracking-widest mb-2">Student Support</p>
              <h2 className="font-display font-bold text-primary text-3xl lg:text-4xl leading-tight mb-4">
                More than classes: a guided academic pathway
              </h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Each school is organized around practical assignments, regular lecturer contact, digital resources,
                and assessment preparation for students moving toward HND, BSc top-up, or direct workplace skills.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { Icon: Laptop, label: "Computer Labs", text: "Hands-on practice with guided lab sessions." },
                { Icon: Users, label: "Mentor Support", text: "Academic advisers help students stay on track." },
                { Icon: Award, label: "Career Outcomes", text: "Programs are mapped to practical roles." },
              ].map(({ Icon, label, text }) => (
                <div key={label} className="bg-background border border-border rounded-xl p-5">
                  <Icon className="text-accent mb-4" size={24} />
                  <h3 className="font-display font-bold text-primary text-lg mb-2">{label}</h3>
                  <p className="text-muted-foreground text-xs leading-relaxed">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <SiteFooter onNavigate={onNavigate} />
    </div>
  );
}

function ProfessionalCoursesPage({ onNavigate }: { onNavigate: (p: Page) => void }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader activePage="courses" onNavigate={onNavigate} />

      <main>
        <section className="relative bg-primary text-white overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-20"
            style={{
              backgroundImage: `url('${ASSETS.academicStudents}')`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary via-[#1f2f8f]/92 to-[#321064]/70" />
          <div className="relative max-w-7xl mx-auto px-6 py-20 lg:py-24">
            <div className="max-w-3xl">
              <span className="inline-flex items-center gap-2 bg-accent/20 border border-accent/35 text-accent text-xs font-bold uppercase tracking-widest px-3.5 py-1.5 rounded-full mb-6">
                <Award size={14} /> Professional Courses
              </span>
              <h1 className="font-display font-bold text-4xl lg:text-6xl leading-none tracking-tight mb-6">
                Short courses that turn practice into confidence
              </h1>
              <p className="text-white/68 text-base lg:text-lg leading-relaxed mb-9">
                Build practical computer, business, data, networking, cloud, and creative skills through focused
                tracks that can fit around school, work, or career change plans.
              </p>
              <button
                onClick={() => onNavigate("auth")}
                className="bg-accent hover:bg-[#43a99f] text-white font-bold text-sm px-7 py-3.5 rounded-xl transition-all duration-200 flex items-center gap-2"
              >
                Enroll In A Course <ChevronRight size={17} />
              </button>
            </div>
          </div>
        </section>

        <section className="py-16 bg-card border-y border-border">
          <div className="max-w-7xl mx-auto px-6">
            <div className="mb-10 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
              <div className="max-w-3xl">
                <p className="text-accent font-semibold text-xs uppercase tracking-widest mb-2">Demand-Led Training</p>
                <h2 className="font-display font-bold text-primary text-3xl lg:text-4xl leading-tight">
                  Courses grouped around the fastest-moving digital work areas
                </h2>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed max-w-md">
                Each short course is designed to produce a practical output: a dashboard, website, campaign plan,
                support checklist, network configuration, or portfolio-ready design.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
              {MARKET_SKILLS.slice(0, 4).map(({ title, Icon, points }) => (
                <article key={title} className="bg-background border border-border rounded-2xl p-5 shadow-sm">
                  <Icon className="text-accent mb-4" size={24} />
                  <h3 className="font-display font-bold text-primary text-lg mb-4">{title}</h3>
                  <div className="space-y-2">
                    {points.map((point) => (
                      <div key={point} className="flex items-center gap-2 text-sm text-foreground/75">
                        <CheckCircle2 className="text-accent shrink-0" size={15} />
                        {point}
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 bg-background">
          <div className="max-w-7xl mx-auto px-6">
            <div className="mb-12 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
              <div className="max-w-3xl">
                <p className="text-accent font-semibold text-xs uppercase tracking-widest mb-2">Certification Tracks</p>
                <h2 className="font-display font-bold text-primary text-3xl lg:text-5xl leading-tight">
                  Practical tracks for students, workers, and entrepreneurs
                </h2>
              </div>
              <div className="flex items-center gap-2 bg-card border border-border rounded-xl px-4 py-3 text-sm text-muted-foreground">
                <Timer className="text-accent" size={18} />
                Weekend and weekday batches available
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {CERTIFICATION_TRACKS.map((track) => {
                const Icon = track.Icon;
                return (
                  <article key={track.title} className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-200">
                    <div className="flex items-start justify-between gap-4 mb-5">
                      <div className="w-12 h-12 rounded-xl bg-primary/8 flex items-center justify-center">
                        <Icon className="text-primary" size={24} />
                      </div>
                      <span className="bg-accent/10 text-accent text-xs font-bold px-3 py-1 rounded-full">{track.duration}</span>
                    </div>

                    <h3 className="font-display font-bold text-primary text-2xl leading-tight mb-2">{track.title}</h3>
                    <p className="text-muted-foreground text-xs font-semibold mb-5">{track.level}</p>

                    <div className="mb-5">
                      <h4 className="text-xs uppercase tracking-widest text-accent font-bold mb-3">Tools Covered</h4>
                      <div className="flex flex-wrap gap-2">
                        {track.tools.map((tool) => (
                          <span key={tool} className="bg-muted text-muted-foreground text-xs font-semibold px-3 py-1.5 rounded-full">
                            {tool}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs uppercase tracking-widest text-accent font-bold mb-3">What You Can Do</h4>
                      <ul className="space-y-2">
                        {track.outcomes.map((outcome) => (
                          <li key={outcome} className="flex items-start gap-2 text-sm text-foreground/75">
                            <CheckCircle2 className="text-accent shrink-0 mt-0.5" size={15} />
                            {outcome}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="py-18 bg-card border-y border-border">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-10 items-center">
              <div>
                <p className="text-accent font-semibold text-xs uppercase tracking-widest mb-2">Training Model</p>
                <h2 className="font-display font-bold text-primary text-3xl lg:text-4xl leading-tight mb-4">
                  Learn by building real outputs every week
                </h2>
                <p className="text-muted-foreground text-sm leading-relaxed mb-7">
                  The short course experience is designed around guided practice, small deliverables, and visible
                  progress so students can show what they learned instead of only listing topics.
                </p>
                <button
                  onClick={() => onNavigate("admissions")}
                  className="bg-primary hover:bg-[#1a2775] text-white text-sm font-bold px-6 py-3 rounded-xl transition-colors"
                >
                  See Admission Process
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { Icon: ClipboardList, label: "Weekly Lab Tasks", text: "Each batch includes structured assignments and review." },
                  { Icon: FileText, label: "Portfolio Evidence", text: "Students leave with project files, reports, or designs." },
                  { Icon: Users, label: "Instructor Feedback", text: "Classes include direct correction and practical support." },
                  { Icon: Award, label: "Certificate Ready", text: "Training prepares learners for local work and certification goals." },
                ].map(({ Icon, label, text }) => (
                  <div key={label} className="bg-background border border-border rounded-xl p-5">
                    <Icon className="text-accent mb-4" size={24} />
                    <h3 className="font-display font-bold text-primary text-lg mb-2">{label}</h3>
                    <p className="text-muted-foreground text-xs leading-relaxed">{text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="py-18 bg-primary text-white">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-[1fr_0.8fr] gap-10 items-center">
            <div>
              <p className="text-accent font-semibold text-xs uppercase tracking-widest mb-2">Ready For Skills Training</p>
              <h2 className="font-display font-bold text-3xl lg:text-5xl leading-tight mb-4">
                Start with one course, leave with a practical skill.
              </h2>
              <p className="text-white/60 text-sm leading-relaxed max-w-2xl">
                Choose a track, complete registration, and join the next available weekday or weekend cohort.
              </p>
            </div>
            <button
              onClick={() => onNavigate("auth")}
              className="justify-self-start lg:justify-self-end bg-accent hover:bg-[#43a99f] text-white font-bold text-sm px-8 py-4 rounded-xl transition-colors flex items-center gap-2"
            >
              Register Online <ChevronRight size={17} />
            </button>
          </div>
        </section>
      </main>

      <SiteFooter onNavigate={onNavigate} />
    </div>
  );
}

function AdmissionsPage({ onNavigate }: { onNavigate: (p: Page) => void }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader activePage="admissions" onNavigate={onNavigate} />

      <main>
        <section className="relative bg-primary text-white overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-20"
            style={{
              backgroundImage: `url('${ASSETS.manager}')`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/92 to-[#151949]/70" />
          <div className="relative max-w-7xl mx-auto px-6 py-20 lg:py-24 grid grid-cols-1 lg:grid-cols-[1fr_0.85fr] gap-12 items-center">
            <div>
              <span className="inline-flex items-center gap-2 bg-accent/20 border border-accent/35 text-accent text-xs font-bold uppercase tracking-widest px-3.5 py-1.5 rounded-full mb-6">
                <ClipboardList size={14} /> Admissions
              </span>
              <h1 className="font-display font-bold text-4xl lg:text-6xl leading-none tracking-tight mb-6">
                Apply with a clear path from enquiry to orientation
              </h1>
              <p className="text-white/68 text-base lg:text-lg leading-relaxed max-w-2xl mb-9">
                Whether you are joining an HND program, completing a BSc top-up, or taking a professional course,
                the admissions process is simple, guided, and documented.
              </p>
              <button
                onClick={() => onNavigate("auth")}
                className="bg-accent hover:bg-[#43a99f] text-white font-bold text-sm px-7 py-3.5 rounded-xl transition-all duration-200 flex items-center gap-2"
              >
                Start Online Application <ChevronRight size={17} />
              </button>
            </div>

            <div className="bg-white/8 border border-white/12 rounded-2xl p-6 backdrop-blur-sm">
              <div className="flex items-center gap-4 mb-6">
                <img
                  src={ASSETS.manager}
                  alt="IT Complex Academy CEO and manager"
                  className="w-20 h-20 rounded-2xl object-cover border border-white/20 shadow-lg"
                />
                <div>
                  <p className="text-accent text-xs font-bold uppercase tracking-widest mb-1">Leadership</p>
                  <h2 className="font-display font-bold text-white text-2xl leading-tight">CEO / Manager</h2>
                  <p className="text-white/50 text-xs mt-1">Admissions and student guidance</p>
                </div>
              </div>
              <h2 className="font-display font-bold text-white text-2xl mb-5">Admissions Desk</h2>
              <div className="space-y-4">
                {[
                  { Icon: CalendarDays, label: "Intake Guidance", text: "Confirm current batches and preferred class schedules." },
                  { Icon: FileText, label: "Document Review", text: "Check certificates, identification, and required photocopies." },
                  { Icon: CreditCard, label: "Fee Confirmation", text: "Receive registration fee and tuition payment guidance." },
                ].map(({ Icon, label, text }) => (
                  <div key={label} className="flex gap-3 rounded-xl bg-white/8 border border-white/10 p-4">
                    <Icon className="text-accent shrink-0 mt-0.5" size={20} />
                    <div>
                      <h3 className="text-white font-bold text-sm mb-1">{label}</h3>
                      <p className="text-white/55 text-xs leading-relaxed">{text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-background">
          <div className="max-w-7xl mx-auto px-6">
            <div className="mb-12 max-w-3xl">
              <p className="text-accent font-semibold text-xs uppercase tracking-widest mb-2">Application Steps</p>
              <h2 className="font-display font-bold text-primary text-3xl lg:text-5xl leading-tight">
                Four clear steps to become an ITCAB student
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
              {ADMISSION_STEPS.map((step, index) => (
                <article key={step.title} className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                  <div className="w-11 h-11 rounded-xl bg-accent/10 text-accent flex items-center justify-center font-display font-bold text-2xl mb-5">
                    {index + 1}
                  </div>
                  <h3 className="font-display font-bold text-primary text-xl mb-3">{step.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{step.detail}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 bg-background">
          <div className="max-w-7xl mx-auto px-6">
            <div className="mb-10 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
              <div className="max-w-3xl">
                <p className="text-accent font-semibold text-xs uppercase tracking-widest mb-2">Study Options</p>
                <h2 className="font-display font-bold text-primary text-3xl lg:text-4xl leading-tight">
                  Choose the pathway that matches your present level
                </h2>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed max-w-md">
                Applicants can come in as new higher-education students, BSc top-up candidates, working adults, or
                short-course learners who need one focused skill.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
              {ADMISSION_OPTIONS.map(({ title, Icon, text }) => (
                <article key={title} className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                  <Icon className="text-accent mb-4" size={26} />
                  <h3 className="font-display font-bold text-primary text-xl mb-3">{title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 bg-card border-y border-border">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-[0.85fr_1.15fr] gap-10">
            <div>
              <p className="text-accent font-semibold text-xs uppercase tracking-widest mb-2">Requirements</p>
              <h2 className="font-display font-bold text-primary text-3xl lg:text-4xl leading-tight mb-4">
                Bring the right documents and choose the right pathway
              </h2>
              <p className="text-muted-foreground text-sm leading-relaxed mb-7">
                Admissions staff can review your certificates and recommend the right track based on your academic
                background and career goal.
              </p>
              <button
                onClick={() => onNavigate("auth")}
                className="bg-primary hover:bg-[#1a2775] text-white text-sm font-bold px-6 py-3 rounded-xl transition-colors"
              >
                Submit Student Profile
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <article className="bg-background border border-border rounded-2xl p-6">
                <GraduationCap className="text-accent mb-4" size={28} />
                <h3 className="font-display font-bold text-primary text-2xl mb-3">HND Entry</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Candidates should hold GCE Advanced Level in at least two papers, excluding Religious Knowledge,
                  or an equivalent certificate.
                </p>
              </article>
              <article className="bg-background border border-border rounded-2xl p-6">
                <Award className="text-accent mb-4" size={28} />
                <h3 className="font-display font-bold text-primary text-2xl mb-3">BSc Top-Up</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Students applying for Year 3 Bachelor programs should present an HND attestation or equivalent
                  qualification for review.
                </p>
              </article>
              <article className="bg-background border border-border rounded-2xl p-6 md:col-span-2">
                <CheckSquare className="text-accent mb-4" size={28} />
                <h3 className="font-display font-bold text-primary text-2xl mb-5">Document Checklist</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {CHECKLIST.map((doc) => (
                    <div key={doc} className="flex items-start gap-2 text-sm text-foreground/75">
                      <CheckCircle2 className="text-accent shrink-0 mt-0.5" size={16} />
                      {doc}
                    </div>
                  ))}
                </div>
              </article>
            </div>
          </div>
        </section>

        <section className="py-20 bg-background">
          <div className="max-w-7xl mx-auto px-6">
            <div className="mb-10 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
              <div>
                <p className="text-accent font-semibold text-xs uppercase tracking-widest mb-2">Fees And Support</p>
                <h2 className="font-display font-bold text-primary text-3xl lg:text-5xl leading-tight">
                  Clear fees before you commit
                </h2>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed max-w-lg">
                Tuition depends on the selected program, but registration and advisory support are clear from the
                first admissions conversation.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
              {ADMISSION_FEES.map((fee) => (
                <article key={fee.label} className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                  <h3 className="text-muted-foreground text-xs uppercase tracking-widest font-bold mb-3">{fee.label}</h3>
                  <div className="font-display font-bold text-primary text-3xl mb-3">{fee.value}</div>
                  <p className="text-muted-foreground text-sm leading-relaxed">{fee.note}</p>
                </article>
              ))}
            </div>

            <div className="bg-primary text-white rounded-2xl p-7 lg:p-9 grid grid-cols-1 lg:grid-cols-[1fr_0.7fr] gap-8 items-center">
              <div>
                <h2 className="font-display font-bold text-3xl lg:text-4xl leading-tight mb-3">
                  Need help choosing the right program?
                </h2>
                <p className="text-white/60 text-sm leading-relaxed">
                  Visit either Bamenda campus or call the admissions hotlines for course advice, fee guidance, and
                  document review before you apply.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row lg:flex-col gap-3">
                <a
                  href="tel:+237677271998"
                  className="bg-white/10 hover:bg-white/15 border border-white/15 text-white text-sm font-bold px-5 py-3 rounded-xl transition-colors text-center"
                >
                  Call +237 677 271 998
                </a>
                <button
                  onClick={() => onNavigate("auth")}
                  className="bg-accent hover:bg-[#43a99f] text-white text-sm font-bold px-5 py-3 rounded-xl transition-colors"
                >
                  Apply Online
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter onNavigate={onNavigate} />
    </div>
  );
}

function AuthPage({ onNavigate }: { onNavigate: (p: Page) => void }) {
  const [mode, setMode] = useState<AuthMode>("signup");
  const [showPass, setShowPass] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNavigate("dashboard");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Mini header */}
      <header className="bg-primary px-6 py-4 flex items-center justify-between shrink-0">
        <button
          onClick={() => onNavigate("home")}
          className="text-white/70 hover:text-white text-sm font-medium flex items-center gap-1.5 transition-colors"
        >
          Back to Home
        </button>
        <div className="hidden sm:flex items-center gap-2">
          <img
            src={ASSETS.logo}
            alt="IT Complex Academy Bamenda logo"
            className="w-9 h-9 rounded-lg object-contain bg-white p-1"
          />
          <div className="font-display font-bold text-white text-sm tracking-tight">
            IT COMPLEX ACADEMY BAMENDA
          </div>
        </div>
        <div className="w-28" />
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left panel */}
        <div className="hidden lg:flex flex-col w-[42%] bg-primary relative overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-10"
            style={{
              backgroundImage: `url('${ASSETS.manager}')`,
            }}
            role="img"
            aria-label="Students collaborating with laptops"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/95 to-[#6d35c9]/35" />

          <div className="relative flex flex-col justify-between h-full p-14">
            <div>
              <span className="inline-block bg-accent/20 text-accent text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-8">
                ITCAB Virtual Campus
              </span>
              <h2 className="font-display font-bold text-white text-4xl xl:text-5xl leading-tight mb-5">
                Your Academic<br />Journey Starts Here
              </h2>
              <p className="text-white/55 text-base leading-relaxed max-w-xs">
                Access live lectures, course materials, tuition records, and connect directly with instructors.
              </p>
            </div>

            <div className="space-y-4">
              {[
                { icon: GraduationCap, label: "HND & BSc Degree Programs" },
                { icon: Wifi, label: "Live Stream Lecture Rooms" },
                { icon: BookOpen, label: "Course Modules & Handouts" },
                { icon: Layers, label: "Real-time Supabase Integration" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-3 text-white/60 text-sm">
                  <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                    <Icon size={15} className="text-accent" />
                  </div>
                  {label}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div className="flex-1 flex items-center justify-center p-6 lg:p-14 overflow-y-auto">
          <div className="w-full max-w-md">
            <div className="bg-card rounded-2xl shadow-lg border border-border p-8">
              <div className="mb-7">
                <h1 className="font-display font-bold text-primary text-2xl xl:text-3xl mb-1">
                  {mode === "signup" ? "Create Your Account" : "Welcome Back"}
                </h1>
                <p className="text-muted-foreground text-sm">
                  {mode === "signup"
                    ? "Complete enrollment and access your online classes."
                    : "Sign in to your ITCAB student portal."}
                </p>
              </div>

              {/* Mode toggle */}
              <div className="flex bg-muted rounded-xl p-1 mb-7">
                {(["signup", "login"] as AuthMode[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={`flex-1 flex items-center justify-center gap-1.5 text-sm font-semibold py-2.5 rounded-lg transition-all duration-150 ${
                      mode === m
                        ? "bg-card text-primary shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {m === "signup" ? <UserPlus size={14} /> : <LogIn size={14} />}
                    {m === "signup" ? "Sign Up" : "Log In"}
                  </button>
                ))}
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {mode === "signup" && (
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-1.5">Full Name</label>
                    <input
                      type="text"
                      placeholder="Enter your legal name"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-input-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-colors"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">Email Address</label>
                  <input
                    type="email"
                    placeholder="student@example.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-input-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">
                    {mode === "signup" ? "Create Password" : "Password"}
                  </label>
                  <div className="relative">
                    <input
                      type={showPass ? "text" : "password"}
                      placeholder={mode === "signup" ? "Minimum 6 characters" : "Enter your password"}
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      className="w-full px-4 py-3 pr-11 rounded-xl border border-border bg-input-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {mode === "signup" && (
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-1.5">Academic School</label>
                    <select className="w-full px-4 py-3 rounded-xl border border-border bg-input-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-colors">
                      <option value="">Select your school / program</option>
                      <option>School of Engineering &amp; Technology</option>
                      <option>School of Business</option>
                      <option>School of Education</option>
                      <option>Professional Certification Track</option>
                    </select>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-primary hover:bg-[#1a2775] text-white font-bold py-3.5 rounded-xl transition-colors duration-150 text-sm"
                >
                  {mode === "signup" ? "Create Account & Connect Profile" : "Log In to Student Portal"}
                </button>
              </form>

              <p className="mt-5 text-center text-xs text-muted-foreground">
                {mode === "signup" ? "Already have an account?" : "New student?"}{" "}
                <button
                  onClick={() => setMode(mode === "signup" ? "login" : "signup")}
                  className="text-accent font-semibold hover:underline"
                >
                  {mode === "signup" ? "Log in here" : "Create an account"}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Dashboard Page ────────────────────────────────────────────────────────────
function DashboardPage({ onNavigate }: { onNavigate: (p: Page) => void }) {
  const [activeItem, setActiveItem] = useState("Live Stream Lectures");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState(CHAT_SEED);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!message.trim()) return;
    setMessages((prev) => [...prev, { sender: "You", text: message.trim(), time: "Now" }]);
    setMessage("");
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">

      {/* Mobile top bar */}
      <header className="lg:hidden bg-primary px-4 py-3 flex items-center justify-between shrink-0">
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-white">
          <Menu size={22} />
        </button>
        <span className="font-display font-bold text-white text-sm">ITCAB Dashboard</span>
        <button onClick={() => onNavigate("home")} className="text-white/55 text-xs font-medium">
          Exit
        </button>
      </header>

      <div className="flex flex-1 overflow-hidden relative">

        {/* ── Sidebar ── */}
        <aside
          className={`
            fixed lg:static top-0 bottom-0 left-0 z-40 w-72 bg-primary flex flex-col
            transition-transform duration-200 ease-in-out
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          `}
        >
          {/* Brand */}
          <div className="px-6 py-5 border-b border-white/10 shrink-0">
            <div className="font-display font-bold text-white text-base leading-tight tracking-tight">
              IT COMPLEX ACADEMY
            </div>
            <div className="text-accent text-xs mt-0.5 font-semibold">Virtual Campus Portal</div>
          </div>

          {/* Student chip */}
          <div className="px-5 py-4 border-b border-white/10 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-accent flex items-center justify-center font-display font-bold text-white text-sm shrink-0">
                AM
              </div>
              <div className="min-w-0">
                <div className="text-white text-sm font-semibold truncate">Amadou Mbeki</div>
                <div className="text-white/45 text-xs truncate">HND Software Eng. | Year 2</div>
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto [scrollbar-width:none]">
            {SIDEBAR_ITEMS.map(({ label, Icon }) => {
              const isActive = activeItem === label;
              return (
                <button
                  key={label}
                  onClick={() => { setActiveItem(label); setSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-left transition-all duration-150 ${
                    isActive
                      ? "bg-accent/20 text-accent border border-accent/30"
                      : "text-white/55 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon size={15} />
                  {label}
                </button>
              );
            })}
          </nav>

          {/* Exit */}
          <div className="px-6 py-4 border-t border-white/10 shrink-0">
            <button
              onClick={() => onNavigate("home")}
              className="text-white/35 hover:text-white/65 text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              Back to Main Site
            </button>
          </div>
        </aside>

        {/* Sidebar backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* ── Main workspace ── */}
        <main className="flex-1 flex flex-col overflow-hidden">

          {/* Class header bar */}
          <div className="bg-card border-b border-border px-6 py-4 flex items-center justify-between gap-4 shrink-0">
            <div className="min-w-0">
              <h1 className="font-display font-bold text-primary text-lg leading-tight truncate">
                Live Lecture Room: Advanced Software Engineering
              </h1>
              <div className="flex flex-wrap items-center gap-3 mt-1">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-green-600 text-xs font-bold">LIVE</span>
                </div>
                <span className="text-muted-foreground text-xs hidden sm:block">
                  Connected: Supabase Cluster | HND Software Eng. Level II
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <div className="hidden sm:flex items-center gap-1.5 bg-green-50 text-green-700 text-xs font-semibold px-3 py-1.5 rounded-full border border-green-200">
                <Users size={12} /> 24 Online
              </div>
              <button className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                <Bell size={15} />
              </button>
            </div>
          </div>

          {/* Content area */}
          <div className="flex flex-1 overflow-hidden">

            {/* Center content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 [scrollbar-width:none]">

              {/* Video frame */}
              <div className="bg-[#111111] rounded-2xl overflow-hidden relative" style={{ aspectRatio: "16/9" }}>
                {/* LIVE badge */}
                <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                  <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  LIVE
                </div>
                {/* Time */}
                <div className="absolute top-4 right-4 z-10 font-mono text-white/40 text-xs">
                  09:14:32
                </div>
                {/* Connection status */}
                <div className="absolute top-12 right-4 z-10 flex items-center gap-1.5 text-green-400 text-xs font-medium">
                  <Wifi size={12} /> Synced
                </div>
                {/* Placeholder */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <Monitor className="text-white/40 mb-4" size={56} />
                  <p className="text-white/55 text-sm font-medium text-center px-6">
                    Waiting for Lecturer to broadcast stream...
                  </p>
                  <p className="text-white/25 text-xs mt-2 font-mono text-center">
                    Live sync initialized | Supabase Realtime connected
                  </p>
                </div>
                {/* Playback bar */}
                <div className="absolute bottom-0 left-0 right-0">
                  <div className="h-0.5 bg-white/10">
                    <div className="h-full w-1/3 bg-accent" />
                  </div>
                  <div className="bg-black/60 backdrop-blur-sm px-4 py-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button className="text-white/60 hover:text-white transition-colors">▶</button>
                      <span className="font-mono text-white/40 text-xs">00:00 / --:--</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="text-white/60 hover:text-white transition-colors text-xs font-medium">HD</button>
                      <button className="text-white/60 hover:text-white transition-colors text-xs font-medium">CC</button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Today's schedule */}
              <div className="bg-card rounded-xl border border-border p-5">
                <h3 className="font-display font-bold text-primary text-base mb-4">
                  Today&apos;s Schedule - Current Week
                </h3>
                <div className="space-y-1">
                  {[
                    { time: "09:00", title: "Advanced Software Engineering", instructor: "Dr. Nkemdirim A.", status: "live" },
                    { time: "11:00", title: "Database Systems & Architecture", instructor: "Mr. Fomba G.", status: "upcoming" },
                    { time: "14:00", title: "Network Security Fundamentals", instructor: "Ms. Achu B.", status: "upcoming" },
                    { time: "16:00", title: "Data Structures & Algorithms", instructor: "Mr. Tanyi F.", status: "upcoming" },
                  ].map((session) => (
                    <div
                      key={session.title}
                      className={`flex items-center gap-4 py-3 px-4 rounded-lg transition-colors ${
                        session.status === "live" ? "bg-green-50 border border-green-200/60" : "hover:bg-muted/50"
                      }`}
                    >
                      <span className="font-mono text-xs text-muted-foreground w-12 shrink-0">
                        {session.time}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-foreground truncate">{session.title}</div>
                        <div className="text-xs text-muted-foreground">{session.instructor}</div>
                      </div>
                      <span
                        className={`text-xs font-bold px-3 py-1 rounded-full shrink-0 ${
                          session.status === "live"
                            ? "bg-red-500 text-white"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {session.status === "live" ? "● LIVE" : "Upcoming"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick resources */}
              <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
                {[
                  { label: "Lecture Slides", sub: "Adv. Software Eng.", Icon: FileText },
                  { label: "Lab Exercise", sub: "Supabase setup", Icon: ClipboardList },
                  { label: "Reading List", sub: "Week 6 materials", Icon: BookOpen },
                  { label: "Class Sample PDF", sub: "Preview class format", Icon: FileText, href: ASSETS.classSample },
                ].map((item) => (
                  <a
                    key={item.label}
                    href={item.href ?? "#"}
                    target={item.href ? "_blank" : undefined}
                    rel={item.href ? "noreferrer" : undefined}
                    className="bg-card rounded-xl border border-border p-4 text-left hover:border-accent/50 hover:shadow-sm transition-all duration-150 group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-primary/8 flex items-center justify-center mb-3 group-hover:bg-accent/15 transition-colors">
                      <item.Icon className="text-primary" size={19} />
                    </div>
                    <div className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                      {item.label}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">{item.sub}</div>
                  </a>
                ))}
              </div>
            </div>

            {/* ── Chat panel ── */}
            <div className="hidden xl:flex flex-col w-80 bg-card border-l border-border">
              <div className="px-5 py-4 border-b border-border shrink-0">
                <h3 className="font-display font-bold text-primary text-base">Classroom Discussion</h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  <p className="text-muted-foreground text-xs">24 students active</p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 [scrollbar-width:none]">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex flex-col ${msg.sender === "You" ? "items-end" : "items-start"}`}>
                    {msg.sender !== "You" && (
                      <span className="text-accent text-xs font-bold mb-1">{msg.sender}</span>
                    )}
                    <div
                      className={`max-w-[88%] px-3.5 py-2.5 text-xs leading-relaxed rounded-xl ${
                        msg.sender === "You"
                          ? "bg-primary text-white rounded-tr-sm"
                          : msg.sender === "Instructor"
                          ? "bg-primary/8 text-foreground border border-primary/12 rounded-tl-sm"
                          : "bg-muted text-foreground rounded-tl-sm"
                      }`}
                    >
                      {msg.text}
                    </div>
                    <span className="text-muted-foreground text-[10px] mt-1 font-mono">{msg.time}</span>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              <div className="px-4 py-4 border-t border-border shrink-0">
                <div className="flex items-center gap-2 bg-muted rounded-xl px-3.5 py-2.5">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    placeholder="Type a message to the classroom..."
                    className="flex-1 bg-transparent text-xs text-foreground placeholder:text-muted-foreground outline-none"
                  />
                  <button
                    onClick={sendMessage}
                    className="text-primary hover:text-accent transition-colors shrink-0"
                  >
                    <Send size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

// ─── Root ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState<Page>("home");
  return (
    <>
      {page === "home" && <LandingPage onNavigate={setPage} />}
      {page === "schools" && <AcademicSchoolsPage onNavigate={setPage} />}
      {page === "courses" && <ProfessionalCoursesPage onNavigate={setPage} />}
      {page === "admissions" && <AdmissionsPage onNavigate={setPage} />}
      {page === "auth" && <AuthPage onNavigate={setPage} />}
      {page === "dashboard" && <DashboardPage onNavigate={setPage} />}
    </>
  );
}
