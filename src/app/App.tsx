import { useState, useRef, useEffect, useCallback, createContext, useContext } from "react";
import {
  api,
  ApiError,
  formatFcfa,
  formatTime,
  getToken,
  setToken,
  SCHOOL_OPTIONS,
  type AdminOverview,
  type ChatMessage,
  type DashboardData,
  type FeesData,
  type User,
} from "./api";
import {
  Loader2,
  LogOut,
  MessageSquare,
  ShieldAlert,
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
// `school` preselects the program on the sign-up form.
type Nav = (p: Page, school?: string) => void;

type AuthState = {
  user: User | null;
  setUser: (u: User | null) => void;
  logout: () => void;
};
const AuthContext = createContext<AuthState>({ user: null, setUser: () => {}, logout: () => {} });
const useAuth = () => useContext(AuthContext);

const PAGES: Page[] = ["home", "schools", "courses", "admissions", "auth", "dashboard"];
const pageFromHash = (): Page => {
  const name = window.location.hash.replace(/^#\/?/, "").split("?")[0];
  return (PAGES as string[]).includes(name) ? (name as Page) : "home";
};

const inputClass =
  "w-full px-4 py-3 rounded-xl border border-border bg-input-background text-base sm:text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-colors";

function FormMessage({ kind, children }: { kind: "error" | "success"; children: React.ReactNode }) {
  return (
    <div
      role={kind === "error" ? "alert" : "status"}
      className={`text-sm rounded-xl px-4 py-3 border ${
        kind === "error" ? "bg-red-50 text-red-700 border-red-200" : "bg-green-50 text-green-700 border-green-200"
      }`}
    >
      {children}
    </div>
  );
}

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
    text: "Admissions can help students confirm weekday or weekend class options when batches are open.",
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

type DashSection = "overview" | "timetable" | "modules" | "fees" | "profile" | "admin";

const SIDEBAR_ITEMS: { id: DashSection; label: string; Icon: typeof Monitor }[] = [
  { id: "overview", label: "Dashboard Overview", Icon: Monitor },
  { id: "timetable", label: "Class Timetable", Icon: CalendarDays },
  { id: "modules", label: "Course Materials", Icon: BookOpen },
  { id: "fees", label: "Fees Record", Icon: CreditCard },
  { id: "profile", label: "Account Profile Settings", Icon: Settings },
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
    detail: "Pay the non-refundable registration fee at the campus finance desk, confirm your intake, and create your student portal account.",
  },
  {
    title: "Start Orientation",
    detail: "Join orientation, collect your timetable, meet your course coordinator, and begin your classes on campus.",
  },
];

const ADMISSION_FEES = [
  { label: "Registration Fee", value: "25,000 FCFA", note: "Paid once, in person at the campus finance desk." },
  { label: "Program Fees", value: "By pathway", note: "Confirmed at the admissions desk after program selection." },
  { label: "Payment Support", value: "Flexible", note: "Discuss installment planning with the finance office on campus." },
];

// ─── Landing Page ──────────────────────────────────────────────────────────────
const ASSETS = {
  logo: "/assets/itcab-logo.jpg",
  manager: "/assets/ceo-manager.jpg",
  classSample: "/assets/class-sample.pdf",
  academicStudents: "/assets/academic-students-black.jpg",
  heroStudents: "/assets/academic-students-black.jpg",
};

function SiteHeader({ activePage, onNavigate }: { activePage: Page; onNavigate: Nav }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuth();
  const go = (p: Page) => {
    onNavigate(p);
    setMobileOpen(false);
  };
  const portalPage: Page = user ? "dashboard" : "auth";
  const portalLabel = user ? "My Dashboard" : "Student Portal";

  return (
    <>
      <div className="bg-accent text-accent-foreground text-center text-[11px] sm:text-xs font-semibold py-1.5 px-4 tracking-wide">
        In Affiliation with International University Bamenda (IUB)
      </div>
      <header className="bg-primary sticky top-0 z-50 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-3 sm:gap-6">
          <button type="button" onClick={() => go("home")} className="min-w-0 text-left flex items-center gap-2.5 sm:gap-3">
            <img
              src={ASSETS.logo}
              alt="IT Complex Academy Bamenda logo"
              className="w-10 h-10 sm:w-12 sm:h-12 shrink-0 rounded-xl object-contain bg-white p-1 sm:p-1.5 shadow-sm"
            />
            <div className="min-w-0">
              <div className="font-display font-bold text-white text-sm sm:text-xl lg:text-lg xl:text-2xl leading-tight tracking-tight">
                IT COMPLEX ACADEMY BAMENDA
              </div>
              <div className="hidden min-[400px]:block text-accent text-[11px] sm:text-xs font-semibold mt-0.5 tracking-wide truncate">
                Next Gen Learning For The Digital Age
              </div>
            </div>
          </button>

          <nav className="hidden lg:flex items-center gap-5 xl:gap-7">
            {NAV_LINKS.map((link) => {
              const navPage = getNavPage(link);
              const isActive = navPage === activePage;
              return (
                <button
                  key={link}
                  type="button"
                  onClick={() => go(navPage)}
                  className={`text-sm font-medium whitespace-nowrap transition-colors duration-150 ${
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
              onClick={() => go(portalPage)}
              className="bg-accent hover:bg-[#43a99f] text-white text-sm font-bold px-5 py-2.5 rounded-lg transition-colors duration-150 whitespace-nowrap"
            >
              {portalLabel}
            </button>
          </div>

          <button
            className="lg:hidden text-white shrink-0 w-10 h-10 -mr-2 flex items-center justify-center"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {mobileOpen && (
          <div className="lg:hidden border-t border-white/10 bg-[#1a2775] px-4 sm:px-6 py-3 flex flex-col">
            {NAV_LINKS.map((link) => {
              const navPage = getNavPage(link);
              const isActive = navPage === activePage;
              return (
                <button
                  key={link}
                  type="button"
                  onClick={() => go(navPage)}
                  className={`text-base font-medium text-left py-3 border-b border-white/5 ${
                    isActive ? "text-accent" : "text-white/80 hover:text-white"
                  }`}
                >
                  {link}
                </button>
              );
            })}
            <button onClick={() => go(portalPage)} className="bg-accent text-white text-sm font-bold px-5 py-3 rounded-lg mt-4 mb-2">
              {portalLabel}
            </button>
          </div>
        )}
      </header>
    </>
  );
}

function SiteFooter({ onNavigate }: { onNavigate: Nav }) {
  const { user } = useAuth();
  return (
    <footer className="bg-[#151949] text-white py-12 sm:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 mb-10">
          <div>
            <div className="font-display font-bold text-xl mb-2">IT COMPLEX ACADEMY BAMENDA</div>
            <div className="text-accent text-sm mb-4 font-semibold">Next Gen Learning For The Digital Age</div>
            <p className="text-white/45 text-sm leading-relaxed">
              Practical HND, BSc top-up, and professional certification pathways for ambitious students in
              Bamenda.
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
          <p className="text-white/35 text-xs text-center sm:text-left">
            Copyright 2026 IT Complex Academy Bamenda. All rights reserved.
          </p>
          <button
            onClick={() => onNavigate(user ? "dashboard" : "auth")}
            className="text-accent text-xs font-semibold hover:underline"
          >
            {user ? "Open My Dashboard" : "Open Student Portal"}
          </button>
        </div>
      </div>
    </footer>
  );
}

function LandingPage({ onNavigate }: { onNavigate: Nav }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader activePage="home" onNavigate={onNavigate} />

      {/* ── Hero ── */}
      <section className="relative bg-primary lg:min-h-[560px] overflow-hidden">
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

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-14 sm:py-24 lg:py-32">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 bg-accent/20 border border-accent/40 text-accent text-xs font-bold uppercase tracking-wider sm:tracking-widest px-3.5 py-1.5 rounded-full mb-6">
              HND | BSc | Professional Certifications
            </span>
            <h1 className="font-display text-[2.5rem] sm:text-6xl lg:text-7xl font-bold text-white leading-[1.05] tracking-tight mb-6">
              World-Class<br />
              <span className="text-accent">Professional</span><br />
              Training in Bamenda
            </h1>
            <p className="text-white/65 text-base lg:text-lg leading-relaxed mb-10 max-w-lg">
              Are you looking for a place to be trained as a world-class professional in any specialty of your choice? IT Complex has you covered.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <button
                onClick={() => onNavigate("auth")}
                className="bg-accent hover:bg-[#43a99f] text-white font-bold text-base px-8 py-4 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-accent/30 flex items-center justify-center gap-2"
              >
                Enroll Online Now <ChevronRight size={18} />
              </button>
              <button
                type="button"
                onClick={() => document.getElementById("programs")?.scrollIntoView({ behavior: "smooth" })}
                className="border border-white/25 hover:border-white/50 text-white/75 hover:text-white font-semibold text-base px-8 py-4 rounded-xl transition-all duration-200"
              >
                View Programs
              </button>
            </div>
          </div>
        </div>

        {/* Stats strip */}
        <div className="relative bg-[#151949]/82 backdrop-blur-sm border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
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

      <section className="py-14 sm:py-20 bg-card border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="mb-8 sm:mb-12 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
            <div className="max-w-3xl">
              <p className="text-accent font-semibold text-xs uppercase tracking-widest mb-2">
                2026 Skills Focus
              </p>
              <h2 className="font-display font-bold text-primary text-2xl sm:text-3xl lg:text-5xl leading-tight">
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="mb-8 sm:mb-12">
            <p className="text-accent font-semibold text-xs uppercase tracking-widest mb-2">
              Degree & HND Tracks
            </p>
            <h2 className="font-display font-bold text-primary text-2xl sm:text-3xl lg:text-5xl leading-tight">
              Our HND &amp; BSc Academic Programs
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {PROGRAMS.map((prog) => (
              <div
                key={prog.school}
                className={`bg-card rounded-2xl border ${prog.borderAccent} overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200 group`}
              >
                <div className={`bg-gradient-to-br ${prog.gradient} px-5 sm:px-6 py-6`}>
                  <div className="w-11 h-11 rounded-xl bg-white/12 border border-white/15 flex items-center justify-center mb-4">
                    <prog.Icon className="text-white" size={23} />
                  </div>
                  <h3 className="font-display font-bold text-white text-xl leading-tight">{prog.school}</h3>
                </div>
                <ul className="px-5 sm:px-6 py-5 space-y-2.5">
                  {prog.courses.map((course, i) => (
                    <li key={course} className="flex items-start gap-2.5 text-sm text-foreground/80">
                      <span className="font-mono text-accent font-bold text-xs mt-0.5 shrink-0 w-5">
                        {String(i + 1).padStart(2, "0")}.
                      </span>
                      {course}
                    </li>
                  ))}
                </ul>
                <div className="px-5 sm:px-6 pb-6">
                  <button
                    type="button"
                    onClick={() => onNavigate("auth", prog.school)}
                    className="text-sm font-bold text-primary hover:text-accent flex items-center gap-1 transition-colors"
                  >
                    Apply to this school <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Short Courses ── */}
      <section className="py-14 sm:py-20 bg-card border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="mb-8 sm:mb-12 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            <div>
              <p className="text-accent font-semibold text-xs uppercase tracking-widest mb-2">
                Industry-Recognized
              </p>
              <h2 className="font-display font-bold text-primary text-2xl sm:text-3xl lg:text-5xl leading-tight">
                Professional Computer Certifications
              </h2>
            </div>
            <button
              onClick={() => onNavigate("auth", "Professional Certification Track")}
              className="shrink-0 bg-primary hover:bg-[#1a2775] text-white font-semibold text-sm px-6 py-3 rounded-xl transition-colors duration-150 self-start lg:self-auto"
            >
              Enroll in a Course
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {SHORT_COURSES.map((course, i) => (
              <button
                type="button"
                key={course.name}
                onClick={() => onNavigate("auth", "Professional Certification Track")}
                className="text-left flex items-center gap-4 p-4 rounded-xl border border-border bg-background hover:border-accent/50 hover:bg-[#f0faf9] transition-all duration-200 group"
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
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Admissions ── */}
      <section className="py-14 sm:py-20 bg-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="mb-8 sm:mb-12 text-center">
            <p className="text-accent font-semibold text-xs uppercase tracking-widest mb-2">How to Apply</p>
            <h2 className="font-display font-bold text-white text-2xl sm:text-3xl lg:text-5xl leading-tight">
              Entry Qualifications &amp; Admission Requirements
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
            {/* HND Criteria */}
            <div className="bg-white/6 border border-white/10 rounded-2xl p-6 sm:p-8 hover:bg-white/8 transition-colors duration-200">
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
            <div className="bg-white/6 border border-white/10 rounded-2xl p-6 sm:p-8 hover:bg-white/8 transition-colors duration-200">
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
              className="w-full sm:w-auto bg-accent hover:bg-[#43a99f] text-white font-bold text-base px-10 py-4 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-accent/30"
            >
              Apply Online Now
            </button>
          </div>
        </div>
      </section>

      <SiteFooter onNavigate={onNavigate} />
    </div>
  );
}

// ─── Auth Page ─────────────────────────────────────────────────────────────────
function AcademicSchoolsPage({ onNavigate }: { onNavigate: Nav }) {
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
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-14 sm:py-20 lg:py-24 grid grid-cols-1 lg:grid-cols-[1fr_0.85fr] gap-12 items-center">
            <div>
              <span className="inline-flex items-center gap-2 bg-accent/20 border border-accent/35 text-accent text-xs font-bold uppercase tracking-widest px-3.5 py-1.5 rounded-full mb-6">
                <School size={14} /> Academic Schools
              </span>
              <h1 className="font-display font-bold text-3xl sm:text-4xl lg:text-6xl leading-none tracking-tight mb-6">
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

        <section className="py-14 sm:py-20 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="mb-8 sm:mb-12 max-w-3xl">
              <p className="text-accent font-semibold text-xs uppercase tracking-widest mb-2">Program Faculties</p>
              <h2 className="font-display font-bold text-primary text-2xl sm:text-3xl lg:text-5xl leading-tight">
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
                    <div className="min-h-[200px] sm:min-h-[280px] bg-cover bg-center" style={{ backgroundImage: `url('${school.image}')` }} />
                    <div className="p-5 sm:p-7 lg:p-9">
                      <div className="flex items-start sm:items-center gap-3 mb-5">
                        <div className="w-11 h-11 shrink-0 rounded-xl bg-primary/8 flex items-center justify-center">
                          <Icon className="text-primary" size={22} />
                        </div>
                        <div>
                          <h3 className="font-display font-bold text-primary text-xl sm:text-2xl leading-tight">{school.name}</h3>
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

                      <button
                        type="button"
                        onClick={() => onNavigate("auth", school.name)}
                        className="mt-7 w-full sm:w-auto bg-primary hover:bg-[#1a2775] text-white text-sm font-bold px-6 py-3 rounded-xl transition-colors inline-flex items-center justify-center gap-2"
                      >
                        Apply to this school <ChevronRight size={16} />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="py-12 sm:py-16 bg-card border-y border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="mb-10 max-w-3xl">
              <p className="text-accent font-semibold text-xs uppercase tracking-widest mb-2">Academic Strength</p>
              <h2 className="font-display font-bold text-primary text-2xl sm:text-3xl lg:text-4xl leading-tight">
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

        <section className="py-12 sm:py-16 bg-card border-y border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-10 items-center">
            <div>
              <p className="text-accent font-semibold text-xs uppercase tracking-widest mb-2">Student Support</p>
              <h2 className="font-display font-bold text-primary text-2xl sm:text-3xl lg:text-4xl leading-tight mb-4">
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

function ProfessionalCoursesPage({ onNavigate }: { onNavigate: Nav }) {
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
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-14 sm:py-20 lg:py-24">
            <div className="max-w-3xl">
              <span className="inline-flex items-center gap-2 bg-accent/20 border border-accent/35 text-accent text-xs font-bold uppercase tracking-widest px-3.5 py-1.5 rounded-full mb-6">
                <Award size={14} /> Professional Courses
              </span>
              <h1 className="font-display font-bold text-3xl sm:text-4xl lg:text-6xl leading-none tracking-tight mb-6">
                Short courses that turn practice into confidence
              </h1>
              <p className="text-white/68 text-base lg:text-lg leading-relaxed mb-9">
                Build practical computer, business, data, networking, cloud, and creative skills through focused
                tracks that can fit around school, work, or career change plans.
              </p>
              <button
                onClick={() => onNavigate("auth", "Professional Certification Track")}
                className="bg-accent hover:bg-[#43a99f] text-white font-bold text-sm px-7 py-3.5 rounded-xl transition-all duration-200 flex items-center gap-2"
              >
                Enroll In A Course <ChevronRight size={17} />
              </button>
            </div>
          </div>
        </section>

        <section className="py-12 sm:py-16 bg-card border-y border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="mb-10 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
              <div className="max-w-3xl">
                <p className="text-accent font-semibold text-xs uppercase tracking-widest mb-2">Demand-Led Training</p>
                <h2 className="font-display font-bold text-primary text-2xl sm:text-3xl lg:text-4xl leading-tight">
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

        <section className="py-14 sm:py-20 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="mb-8 sm:mb-12 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
              <div className="max-w-3xl">
                <p className="text-accent font-semibold text-xs uppercase tracking-widest mb-2">Certification Tracks</p>
                <h2 className="font-display font-bold text-primary text-2xl sm:text-3xl lg:text-5xl leading-tight">
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
                  <article key={track.title} className="bg-card border border-border rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-lg transition-all duration-200 flex flex-col">
                    <div className="flex items-start justify-between gap-4 mb-5">
                      <div className="w-12 h-12 rounded-xl bg-primary/8 flex items-center justify-center">
                        <Icon className="text-primary" size={24} />
                      </div>
                      <span className="bg-accent/10 text-accent text-xs font-bold px-3 py-1 rounded-full">{track.duration}</span>
                    </div>

                    <h3 className="font-display font-bold text-primary text-xl sm:text-2xl leading-tight mb-2">{track.title}</h3>
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

                    <button
                      type="button"
                      onClick={() => onNavigate("auth", "Professional Certification Track")}
                      className="mt-auto pt-6 text-sm font-bold text-primary hover:text-accent flex items-center gap-1 transition-colors self-start"
                    >
                      Enroll in this track <ChevronRight size={16} />
                    </button>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="py-12 sm:py-18 bg-card border-y border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-10 items-center">
              <div>
                <p className="text-accent font-semibold text-xs uppercase tracking-widest mb-2">Training Model</p>
                <h2 className="font-display font-bold text-primary text-2xl sm:text-3xl lg:text-4xl leading-tight mb-4">
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

        <section className="py-12 sm:py-18 bg-primary text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-[1fr_0.8fr] gap-10 items-center">
            <div>
              <p className="text-accent font-semibold text-xs uppercase tracking-widest mb-2">Ready For Skills Training</p>
              <h2 className="font-display font-bold text-2xl sm:text-3xl lg:text-5xl leading-tight mb-4">
                Start with one course, leave with a practical skill.
              </h2>
              <p className="text-white/60 text-sm leading-relaxed max-w-2xl">
                Choose a track, complete registration, and join the next available weekday or weekend cohort.
              </p>
            </div>
            <button
              onClick={() => onNavigate("auth", "Professional Certification Track")}
              className="justify-self-stretch sm:justify-self-start lg:justify-self-end justify-center bg-accent hover:bg-[#43a99f] text-white font-bold text-sm px-8 py-4 rounded-xl transition-colors flex items-center gap-2"
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

function EnquiryForm() {
  const [form, setForm] = useState({ name: "", phone: "", email: "", program: "", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [err, setErr] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    setStatus("sending");
    try {
      await api.enquiry(form);
      setStatus("sent");
      setForm({ name: "", phone: "", email: "", program: "", message: "" });
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not send your request.");
      setStatus("idle");
    }
  };

  if (status === "sent") {
    return (
      <div className="bg-white rounded-2xl p-6 sm:p-8 text-foreground text-center">
        <CheckCircle2 className="text-accent mx-auto mb-4" size={40} />
        <h3 className="font-display font-bold text-primary text-xl mb-2">Request received</h3>
        <p className="text-muted-foreground text-sm mb-5">An admissions adviser will call you shortly.</p>
        <button onClick={() => setStatus("idle")} className="text-accent text-sm font-semibold hover:underline">
          Send another request
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="bg-white rounded-2xl p-5 sm:p-7 text-foreground space-y-4">
      <h3 className="font-display font-bold text-primary text-xl">Request a callback</h3>
      {err && <FormMessage kind="error">{err}</FormMessage>}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <input
          required
          placeholder="Your full name"
          autoComplete="name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className={inputClass}
        />
        <input
          required
          type="tel"
          placeholder="Phone (e.g. 677 271 998)"
          autoComplete="tel"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          className={inputClass}
        />
      </div>
      <input
        type="email"
        placeholder="Email (optional)"
        autoComplete="email"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        className={inputClass}
      />
      <select value={form.program} onChange={(e) => setForm({ ...form, program: e.target.value })} className={inputClass}>
        <option value="">Program of interest (optional)</option>
        {SCHOOL_OPTIONS.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
      <textarea
        rows={3}
        placeholder="Your question (optional)"
        value={form.message}
        onChange={(e) => setForm({ ...form, message: e.target.value })}
        className={`${inputClass} resize-none`}
      />
      <button
        type="submit"
        disabled={status === "sending"}
        className="w-full bg-accent hover:bg-[#43a99f] disabled:opacity-60 text-white font-bold py-3.5 rounded-xl transition-colors text-sm flex items-center justify-center gap-2"
      >
        {status === "sending" && <Loader2 className="animate-spin" size={16} />}
        Request Callback
      </button>
    </form>
  );
}

function AdmissionsPage({ onNavigate }: { onNavigate: Nav }) {
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
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-14 sm:py-20 lg:py-24 grid grid-cols-1 lg:grid-cols-[1fr_0.85fr] gap-12 items-center">
            <div>
              <span className="inline-flex items-center gap-2 bg-accent/20 border border-accent/35 text-accent text-xs font-bold uppercase tracking-widest px-3.5 py-1.5 rounded-full mb-6">
                <ClipboardList size={14} /> Admissions
              </span>
              <h1 className="font-display font-bold text-3xl sm:text-4xl lg:text-6xl leading-none tracking-tight mb-6">
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

            <div className="bg-white/8 border border-white/12 rounded-2xl p-5 sm:p-6 backdrop-blur-sm">
              <div className="flex items-center gap-4 mb-6">
                <img
                  src={ASSETS.manager}
                  alt="IT Complex Academy CEO and manager"
                  className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-2xl object-cover border border-white/20 shadow-lg"
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

        <section className="py-14 sm:py-20 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="mb-8 sm:mb-12 max-w-3xl">
              <p className="text-accent font-semibold text-xs uppercase tracking-widest mb-2">Application Steps</p>
              <h2 className="font-display font-bold text-primary text-2xl sm:text-3xl lg:text-5xl leading-tight">
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

        <section className="py-12 sm:py-16 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="mb-10 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
              <div className="max-w-3xl">
                <p className="text-accent font-semibold text-xs uppercase tracking-widest mb-2">Study Options</p>
                <h2 className="font-display font-bold text-primary text-2xl sm:text-3xl lg:text-4xl leading-tight">
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

        <section className="py-14 sm:py-20 bg-card border-y border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-[0.85fr_1.15fr] gap-10">
            <div>
              <p className="text-accent font-semibold text-xs uppercase tracking-widest mb-2">Requirements</p>
              <h2 className="font-display font-bold text-primary text-2xl sm:text-3xl lg:text-4xl leading-tight mb-4">
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
                <h3 className="font-display font-bold text-primary text-xl sm:text-2xl mb-5">Document Checklist</h3>
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

        <section className="py-14 sm:py-20 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="mb-10 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
              <div>
                <p className="text-accent font-semibold text-xs uppercase tracking-widest mb-2">Fees And Support</p>
                <h2 className="font-display font-bold text-primary text-2xl sm:text-3xl lg:text-5xl leading-tight">
                  Clear fees before you commit
                </h2>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed max-w-lg">
                Tuition depends on the selected program, but registration and advisory support are clear from the
                first admissions conversation.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8 sm:mb-12">
              {ADMISSION_FEES.map((fee) => (
                <article key={fee.label} className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                  <h3 className="text-muted-foreground text-xs uppercase tracking-widest font-bold mb-3">{fee.label}</h3>
                  <div className="font-display font-bold text-primary text-2xl sm:text-3xl mb-3">{fee.value}</div>
                  <p className="text-muted-foreground text-sm leading-relaxed">{fee.note}</p>
                </article>
              ))}
            </div>

            <div id="enquiry" className="bg-primary text-white rounded-2xl p-5 sm:p-7 lg:p-9 grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-8 items-start">
              <div>
                <h2 className="font-display font-bold text-2xl sm:text-3xl lg:text-4xl leading-tight mb-3">
                  Need help choosing the right program?
                </h2>
                <p className="text-white/60 text-sm leading-relaxed mb-6">
                  Visit either Bamenda campus, call the admissions hotlines, or leave your details and an adviser will
                  call you back with course advice, fee guidance, and document review.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
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
              <EnquiryForm />
            </div>
          </div>
        </section>
      </main>

      <SiteFooter onNavigate={onNavigate} />
    </div>
  );
}

function AuthPage({
  onNavigate,
  initialSchool,
  defaultMode = "signup",
}: {
  onNavigate: Nav;
  initialSchool: string;
  defaultMode?: AuthMode;
}) {
  const { user, setUser } = useAuth();
  const [mode, setMode] = useState<AuthMode>(defaultMode);
  const [showPass, setShowPass] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", school: initialSchool });
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (user) onNavigate("dashboard");
  }, [user, onNavigate]);

  useEffect(() => {
    setForm((f) => ({ ...f, school: initialSchool }));
    if (initialSchool) setMode("signup");
  }, [initialSchool]);

  const switchMode = (m: AuthMode) => {
    setMode(m);
    setErr("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    setSubmitting(true);
    try {
      const res =
        mode === "signup"
          ? await api.signup({ name: form.name, email: form.email, password: form.password, school: form.school })
          : await api.login({ email: form.email, password: form.password });
      setToken(res.token);
      setUser(res.user);
      onNavigate("dashboard");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background">
      {/* Mini header */}
      <header className="bg-primary px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-3 shrink-0">
        <button
          onClick={() => onNavigate("home")}
          className="text-white/70 hover:text-white text-sm font-medium flex items-center gap-1.5 transition-colors py-2"
        >
          <ChevronRight size={16} className="rotate-180" /> Back to Home
        </button>
        <div className="flex items-center gap-2 min-w-0">
          <img
            src={ASSETS.logo}
            alt="IT Complex Academy Bamenda logo"
            className="w-9 h-9 rounded-lg object-contain bg-white p-1 shrink-0"
          />
          <div className="hidden sm:block font-display font-bold text-white text-sm tracking-tight">
            IT COMPLEX ACADEMY BAMENDA
          </div>
        </div>
      </header>

      <div className="flex flex-1">
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

          <div className="relative flex flex-col justify-between h-full p-10 xl:p-14 gap-10">
            <div>
              <span className="inline-block bg-accent/20 text-accent text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-8">
                ITCAB Student Portal
              </span>
              <h2 className="font-display font-bold text-white text-4xl xl:text-5xl leading-tight mb-5">
                Your Academic<br />Journey Starts Here
              </h2>
              <p className="text-white/55 text-base leading-relaxed max-w-xs">
                Check your class timetable, course materials, and fee records, and chat with your classmates.
              </p>
            </div>

            <div className="space-y-4">
              {[
                { icon: GraduationCap, label: "HND & BSc Degree Programs" },
                { icon: CalendarDays, label: "Class Timetable" },
                { icon: BookOpen, label: "Course Modules & Handouts" },
                { icon: CreditCard, label: "Fee Records" },
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
        <div className="flex-1 flex items-start sm:items-center justify-center px-4 py-6 sm:p-10 lg:p-14">
          <div className="w-full max-w-md">
            <div className="bg-card rounded-2xl shadow-lg border border-border p-5 sm:p-8">
              <div className="mb-6 sm:mb-7">
                <h1 className="font-display font-bold text-primary text-2xl xl:text-3xl mb-1">
                  {mode === "signup" ? "Create Your Account" : "Welcome Back"}
                </h1>
                <p className="text-muted-foreground text-sm">
                  {mode === "signup"
                    ? "Create your portal account. Admission is completed with your documents on campus."
                    : "Sign in to your ITCAB student portal."}
                </p>
              </div>

              {/* Mode toggle */}
              <div className="flex bg-muted rounded-xl p-1 mb-6 sm:mb-7">
                {(["signup", "login"] as AuthMode[]).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => switchMode(m)}
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
                {err && <FormMessage kind="error">{err}</FormMessage>}

                {mode === "signup" && (
                  <div>
                    <label htmlFor="auth-name" className="block text-sm font-semibold text-foreground mb-1.5">Full Name</label>
                    <input
                      id="auth-name"
                      type="text"
                      required
                      autoComplete="name"
                      placeholder="Enter your legal name"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                )}
                <div>
                  <label htmlFor="auth-email" className="block text-sm font-semibold text-foreground mb-1.5">Email Address</label>
                  <input
                    id="auth-email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="student@example.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="auth-pass" className="block text-sm font-semibold text-foreground mb-1.5">
                    {mode === "signup" ? "Create Password" : "Password"}
                  </label>
                  <div className="relative">
                    <input
                      id="auth-pass"
                      type={showPass ? "text" : "password"}
                      required
                      minLength={mode === "signup" ? 6 : undefined}
                      autoComplete={mode === "signup" ? "new-password" : "current-password"}
                      placeholder={mode === "signup" ? "Minimum 6 characters" : "Enter your password"}
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      className={`${inputClass} pr-12`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      aria-label={showPass ? "Hide password" : "Show password"}
                      className="absolute right-1 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {mode === "signup" && (
                  <div>
                    <label htmlFor="auth-school" className="block text-sm font-semibold text-foreground mb-1.5">Academic School</label>
                    <select
                      id="auth-school"
                      required
                      value={form.school}
                      onChange={(e) => setForm({ ...form, school: e.target.value })}
                      className={`${inputClass} text-foreground`}
                    >
                      <option value="">Select your school / program</option>
                      {SCHOOL_OPTIONS.map((o) => (
                        <option key={o}>{o}</option>
                      ))}
                    </select>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-primary hover:bg-[#1a2775] disabled:opacity-60 text-white font-bold py-3.5 rounded-xl transition-colors duration-150 text-sm flex items-center justify-center gap-2"
                >
                  {submitting && <Loader2 className="animate-spin" size={16} />}
                  {mode === "signup" ? "Create Account & Connect Profile" : "Log In to Student Portal"}
                </button>
              </form>

              <p className="mt-5 text-center text-sm sm:text-xs text-muted-foreground">
                {mode === "signup" ? "Already have an account?" : "New student?"}{" "}
                <button
                  type="button"
                  onClick={() => switchMode(mode === "signup" ? "login" : "signup")}
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
function useClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);
  return now;
}

function Panel({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="bg-card rounded-xl border border-border p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3 mb-4">
        <h3 className="font-display font-bold text-primary text-base">{title}</h3>
        {action}
      </div>
      {children}
    </div>
  );
}

function ScheduleList({ sessions }: { sessions: DashboardData["sessions"] }) {
  if (!sessions.length) return <p className="text-sm text-muted-foreground">No classes scheduled for your program today.</p>;
  return (
    <div className="space-y-1">
      {sessions.map((session) => (
        <div
          key={session.id}
          className={`flex items-center gap-3 sm:gap-4 py-3 px-3 sm:px-4 rounded-lg transition-colors ${
            session.status === "live" ? "bg-green-50 border border-green-200/60" : "hover:bg-muted/50"
          }`}
        >
          <span className="font-mono text-xs text-muted-foreground w-11 shrink-0">{session.time}</span>
          <div className="flex-1 min-w-0">
            <div className={`text-sm font-semibold leading-snug ${session.status === "done" ? "text-muted-foreground" : "text-foreground"}`}>
              {session.title}
            </div>
            <div className="text-xs text-muted-foreground truncate">{session.instructor}</div>
          </div>
          <span
            className={`text-xs font-bold px-2.5 sm:px-3 py-1 rounded-full shrink-0 ${
              session.status === "live" ? "bg-red-500 text-white" : "bg-muted text-muted-foreground"
            }`}
          >
            {session.status === "live" ? "In class now" : session.status === "done" ? "Ended" : "Upcoming"}
          </span>
        </div>
      ))}
    </div>
  );
}

function ResourceGrid({ resources }: { resources: DashboardData["resources"] }) {
  if (!resources.length) {
    return <p className="text-sm text-muted-foreground">No course materials have been uploaded for your program yet.</p>;
  }
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
      {resources.map((item) => {
        return (
          <a
            key={item.id}
            href={item.url ?? "#"}
            target="_blank"
            rel="noreferrer"
            className="bg-card rounded-xl border border-border p-4 text-left hover:border-accent/50 hover:shadow-sm transition-all duration-150 group"
          >
            <div className="w-10 h-10 rounded-lg bg-primary/8 flex items-center justify-center mb-3 group-hover:bg-accent/15 transition-colors">
              <FileText className="text-primary" size={19} />
            </div>
            <div className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{item.title}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{item.subtitle}</div>
          </a>
        );
      })}
    </div>
  );
}

function ChatPanel({
  messages,
  userId,
  online,
  onSend,
  onClose,
}: {
  messages: ChatMessage[];
  userId: number;
  online: number;
  onSend: (text: string) => Promise<void>;
  onClose?: () => void;
}) {
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const send = async () => {
    const text = draft.trim();
    if (!text || sending) return;
    setSending(true);
    setErr("");
    try {
      await onSend(text);
      setDraft("");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Message not sent.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-card">
      <div className="px-5 py-4 border-b border-border shrink-0 flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display font-bold text-primary text-base">Classroom Discussion</h3>
          <div className="flex items-center gap-1.5 mt-0.5">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
            <p className="text-muted-foreground text-xs">{online} online in your program</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} aria-label="Close chat" className="w-9 h-9 -mr-2 flex items-center justify-center text-muted-foreground">
            <X size={20} />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 [scrollbar-width:none]">
        {messages.length === 0 && <p className="text-center text-xs text-muted-foreground mt-6">No messages yet. Say hello!</p>}
        {messages.map((msg) => {
          const mine = msg.userId === userId;
          return (
            <div key={msg.id} className={`flex flex-col ${mine ? "items-end" : "items-start"}`}>
              {!mine && <span className="text-accent text-xs font-bold mb-1">{msg.sender}</span>}
              <div
                className={`max-w-[88%] px-3.5 py-2.5 text-sm xl:text-xs leading-relaxed rounded-xl break-words ${
                  mine
                    ? "bg-primary text-white rounded-tr-sm"
                    : msg.sender === "Instructor"
                    ? "bg-primary/8 text-foreground border border-primary/12 rounded-tl-sm"
                    : "bg-muted text-foreground rounded-tl-sm"
                }`}
              >
                {msg.text}
              </div>
              <span className="text-muted-foreground text-[10px] mt-1 font-mono">{formatTime(msg.createdAt)}</span>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      <div className="px-4 py-3 sm:py-4 border-t border-border shrink-0 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        {err && <p className="text-xs text-red-600 mb-2">{err}</p>}
        <div className="flex items-center gap-2 bg-muted rounded-xl pl-3.5 pr-1.5 py-1.5">
          <input
            type="text"
            value={draft}
            maxLength={1000}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Type a message to the classroom..."
            className="flex-1 min-w-0 bg-transparent text-base xl:text-xs text-foreground placeholder:text-muted-foreground outline-none py-1.5"
          />
          <button
            onClick={send}
            disabled={sending || !draft.trim()}
            aria-label="Send message"
            className="w-9 h-9 flex items-center justify-center text-primary hover:text-accent disabled:opacity-40 transition-colors shrink-0"
          >
            {sending ? <Loader2 className="animate-spin" size={15} /> : <Send size={15} />}
          </button>
        </div>
      </div>
    </div>
  );
}

function FeesSection({ fees }: { fees: FeesData | null }) {
  if (!fees) return <LoadingBlock />;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { label: "Total Billed", value: fees.total },
          { label: "Paid", value: fees.paid },
          { label: "Balance Due", value: fees.balance },
        ].map((c) => (
          <div key={c.label} className="bg-card rounded-xl border border-border p-4 sm:p-5">
            <div className="text-xs uppercase tracking-widest text-muted-foreground font-bold mb-2">{c.label}</div>
            <div className={`font-display font-bold text-2xl ${c.label === "Balance Due" && c.value > 0 ? "text-red-600" : "text-primary"}`}>
              {formatFcfa(c.value)}
            </div>
          </div>
        ))}
      </div>
      <Panel title="Fee Items">
        <div className="divide-y divide-border">
          {fees.items.map((item) => (
            <div key={item.id} className="py-3 flex flex-wrap items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="text-sm font-semibold text-foreground">{item.label}</div>
                <div className="text-xs text-muted-foreground">
                  Billed {new Date(item.createdAt).toLocaleDateString()}
                  {item.paidAt && ` · Paid ${new Date(item.paidAt).toLocaleDateString()}`}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm font-semibold">{formatFcfa(item.amount)}</span>
                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                    item.status === "paid" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {item.status === "paid" ? "Paid" : "Pending"}
                </span>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-4 leading-relaxed">
          Fees are paid in person at the finance desk on either campus. There is no online payment. Your record
          updates once the finance office confirms the payment. Program tuition is added after your pathway is
          confirmed with admissions.
        </p>
      </Panel>
    </div>
  );
}

function ProfileSection({ user, onSaved }: { user: User; onSaved: (u: User) => void }) {
  const [form, setForm] = useState({ name: user.name, phone: user.phone, school: user.school, currentPassword: "", newPassword: "" });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ kind: "error" | "success"; text: string } | null>(null);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    try {
      const res = await api.updateProfile(form);
      onSaved(res.user);
      setForm((f) => ({ ...f, currentPassword: "", newPassword: "" }));
      setMsg({ kind: "success", text: "Profile saved." });
    } catch (e) {
      setMsg({ kind: "error", text: e instanceof Error ? e.message : "Could not save profile." });
    } finally {
      setSaving(false);
    }
  };

  const label = "block text-sm font-semibold text-foreground mb-1.5";
  return (
    <form onSubmit={save} className="bg-card rounded-xl border border-border p-4 sm:p-6 space-y-5 max-w-2xl">
      {msg && <FormMessage kind={msg.kind}>{msg.text}</FormMessage>}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={label} htmlFor="p-name">Full Name</label>
          <input id="p-name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} />
        </div>
        <div>
          <label className={label} htmlFor="p-phone">Phone</label>
          <input id="p-phone" type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputClass} placeholder="+237 ..." />
        </div>
      </div>
      <div>
        <label className={label} htmlFor="p-email">Email</label>
        <input id="p-email" value={user.email} disabled className={`${inputClass} opacity-60`} />
      </div>
      <div>
        <label className={label} htmlFor="p-school">School / Program</label>
        <select id="p-school" value={form.school} onChange={(e) => setForm({ ...form, school: e.target.value })} className={inputClass}>
          {SCHOOL_OPTIONS.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
      </div>
      <div className="border-t border-border pt-5">
        <h4 className="font-display font-bold text-primary mb-1">Change Password</h4>
        <p className="text-xs text-muted-foreground mb-4">Leave blank to keep your current password.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input
            type="password"
            autoComplete="current-password"
            placeholder="Current password"
            value={form.currentPassword}
            onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
            className={inputClass}
          />
          <input
            type="password"
            autoComplete="new-password"
            placeholder="New password (min 6)"
            value={form.newPassword}
            onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
            className={inputClass}
          />
        </div>
      </div>
      <button
        type="submit"
        disabled={saving}
        className="w-full sm:w-auto bg-primary hover:bg-[#1a2775] disabled:opacity-60 text-white font-bold px-8 py-3 rounded-xl text-sm flex items-center justify-center gap-2"
      >
        {saving && <Loader2 className="animate-spin" size={16} />}
        Save Changes
      </button>
    </form>
  );
}

function AdminSection() {
  const [data, setData] = useState<AdminOverview | null>(null);
  const [err, setErr] = useState("");
  const [note, setNote] = useState({ title: "", body: "" });
  const [posted, setPosted] = useState(false);

  const load = useCallback(() => {
    api.adminOverview().then(setData).catch((e) => setErr(e.message));
  }, []);
  useEffect(load, [load]);

  const run = async (fn: () => Promise<unknown>) => {
    setErr("");
    try {
      await fn();
      load();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Action failed.");
    }
  };

  if (!data) return err ? <FormMessage kind="error">{err}</FormMessage> : <LoadingBlock />;
  return (
    <div className="space-y-4">
      {err && <FormMessage kind="error">{err}</FormMessage>}
      <Panel title={`Admissions Enquiries (${data.enquiries.length})`}>
        {data.enquiries.length === 0 && <p className="text-sm text-muted-foreground">No enquiries yet.</p>}
        <div className="divide-y divide-border">
          {data.enquiries.map((q) => (
            <div key={q.id} className="py-3 flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-sm font-semibold">
                  {q.name} · <a href={`tel:${q.phone}`} className="text-accent">{q.phone}</a>
                </div>
                <div className="text-xs text-muted-foreground break-words">
                  {[q.email, q.program, new Date(q.createdAt).toLocaleString()].filter(Boolean).join(" · ")}
                </div>
                {q.message && <p className="text-sm text-foreground/80 mt-1 break-words">{q.message}</p>}
              </div>
              <select
                value={q.status}
                onChange={(e) => run(() => api.adminSetEnquiryStatus(q.id, e.target.value as typeof q.status))}
                className="shrink-0 px-3 py-2 rounded-lg border border-border bg-input-background text-sm"
              >
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          ))}
        </div>
      </Panel>

      <Panel title={`Students (${data.students.length})`}>
        {data.students.length === 0 && <p className="text-sm text-muted-foreground">No students registered yet.</p>}
        <div className="divide-y divide-border">
          {data.students.map((s) => (
            <div key={s.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="text-sm font-semibold truncate">{s.name}</div>
                <div className="text-xs text-muted-foreground break-words">
                  {s.email} · {s.school}
                </div>
              </div>
              {s.feesDue > 0 ? (
                <button
                  onClick={() => run(() => api.adminMarkPaid(s.id))}
                  className="shrink-0 bg-accent hover:bg-[#43a99f] text-white text-xs font-bold px-4 py-2 rounded-lg"
                >
                  Confirm {formatFcfa(s.feesDue)} paid
                </button>
              ) : (
                <span className="shrink-0 text-xs font-bold px-2.5 py-1 rounded-full bg-green-100 text-green-700 self-start sm:self-auto">
                  Fees cleared
                </span>
              )}
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="Post Announcement">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            run(async () => {
              await api.adminAnnounce(note);
              setNote({ title: "", body: "" });
              setPosted(true);
            });
          }}
          className="space-y-3"
        >
          {posted && <FormMessage kind="success">Announcement posted to all students.</FormMessage>}
          <input required placeholder="Title" value={note.title} onChange={(e) => setNote({ ...note, title: e.target.value })} className={inputClass} />
          <textarea
            required
            rows={3}
            placeholder="Message"
            value={note.body}
            onChange={(e) => setNote({ ...note, body: e.target.value })}
            className={`${inputClass} resize-none`}
          />
          <button type="submit" className="w-full sm:w-auto bg-primary text-white font-bold px-6 py-3 rounded-xl text-sm">
            Post
          </button>
        </form>
      </Panel>
    </div>
  );
}

function LoadingBlock() {
  return (
    <div className="flex items-center justify-center py-16 text-muted-foreground">
      <Loader2 className="animate-spin" size={24} />
    </div>
  );
}

function DashboardPage({ onNavigate }: { onNavigate: Nav }) {
  const { user, setUser, logout } = useAuth();
  const [section, setSection] = useState<DashSection>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const [data, setData] = useState<DashboardData | null>(null);
  const [fees, setFees] = useState<FeesData | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadError, setLoadError] = useState("");
  const lastMsgId = useRef(0);
  const now = useClock();

  const onApiError = useCallback(
    (e: unknown) => {
      if (e instanceof ApiError && e.status === 401) logout();
      else setLoadError(e instanceof Error ? e.message : "Could not load data.");
    },
    [logout],
  );

  const loadDashboard = useCallback(() => {
    api.dashboard().then((d) => { setData(d); setLoadError(""); }).catch(onApiError);
    api.fees().then(setFees).catch(onApiError);
  }, [onApiError]);

  // Refresh schedule / fees every minute; poll chat every 4 seconds.
  useEffect(() => {
    loadDashboard();
    const id = window.setInterval(loadDashboard, 60_000);
    return () => window.clearInterval(id);
  }, [loadDashboard, user?.school]);

  useEffect(() => {
    let alive = true;
    lastMsgId.current = 0;
    setMessages([]);
    const poll = () =>
      api
        .messages(lastMsgId.current)
        .then(({ messages: fresh }) => {
          if (!alive || !fresh.length) return;
          lastMsgId.current = fresh[fresh.length - 1].id;
          setMessages((prev) => [...prev, ...fresh.filter((m) => !prev.some((p) => p.id === m.id))]);
        })
        .catch(() => {});
    poll();
    const id = window.setInterval(poll, 4000);
    return () => {
      alive = false;
      window.clearInterval(id);
    };
  }, [user?.school]);

  const sendMessage = async (text: string) => {
    const { message } = await api.sendMessage(text);
    lastMsgId.current = Math.max(lastMsgId.current, message.id);
    setMessages((prev) => (prev.some((p) => p.id === message.id) ? prev : [...prev, message]));
  };

  if (!user) return null;

  const items = user.role === "admin" ? [...SIDEBAR_ITEMS, { id: "admin" as DashSection, label: "Admin Panel", Icon: ShieldAlert }] : SIDEBAR_ITEMS;
  const current = items.find((i) => i.id === section) ?? items[0];
  const liveSession = data?.sessions.find((s) => s.status === "live");
  const nextSession = data?.sessions.find((s) => s.status === "upcoming");
  const initials = user.name
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const goSection = (id: DashSection) => {
    setSection(id);
    setSidebarOpen(false);
  };

  return (
    <div className="h-[100dvh] flex flex-col overflow-hidden bg-background">
      {/* Mobile top bar */}
      <header className="lg:hidden bg-primary px-2 py-2 flex items-center justify-between shrink-0">
        <button onClick={() => setSidebarOpen(true)} className="text-white w-11 h-11 flex items-center justify-center" aria-label="Open menu">
          <Menu size={22} />
        </button>
        <span className="font-display font-bold text-white text-sm">ITCAB Student Portal</span>
        <button onClick={() => onNavigate("home")} className="text-white/70 text-xs font-medium px-3 h-11">
          Main site
        </button>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* ── Sidebar ── */}
        <aside
          className={`
            fixed lg:static top-0 bottom-0 left-0 z-40 w-72 max-w-[85vw] bg-primary flex flex-col
            transition-transform duration-200 ease-in-out
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          `}
        >
          <div className="px-6 py-5 border-b border-white/10 shrink-0 flex items-start justify-between">
            <div>
              <div className="font-display font-bold text-white text-base leading-tight tracking-tight">IT COMPLEX ACADEMY</div>
              <div className="text-accent text-xs mt-0.5 font-semibold">Student Portal</div>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-white/60 -mr-2" aria-label="Close menu">
              <X size={20} />
            </button>
          </div>

          <div className="px-5 py-4 border-b border-white/10 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-accent flex items-center justify-center font-display font-bold text-white text-sm shrink-0">
                {initials}
              </div>
              <div className="min-w-0">
                <div className="text-white text-sm font-semibold truncate">{user.name}</div>
                <div className="text-white/45 text-xs truncate">
                  {user.role === "admin" ? "Administrator" : `${user.school} | Year ${user.year}`}
                </div>
              </div>
            </div>
          </div>

          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto [scrollbar-width:none]">
            {items.map(({ id, label, Icon }) => {
              const isActive = section === id;
              return (
                <button
                  key={id}
                  onClick={() => goSection(id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-left transition-all duration-150 ${
                    isActive ? "bg-accent/20 text-accent border border-accent/30" : "text-white/55 hover:text-white hover:bg-white/5 border border-transparent"
                  }`}
                >
                  <Icon size={15} />
                  {label}
                </button>
              );
            })}
          </nav>

          <div className="px-6 py-4 border-t border-white/10 shrink-0 flex items-center justify-between gap-3">
            <button onClick={() => onNavigate("home")} className="text-white/45 hover:text-white/75 text-xs font-medium py-2 transition-colors">
              Back to Main Site
            </button>
            <button onClick={logout} className="text-white/70 hover:text-white text-xs font-semibold flex items-center gap-1.5 py-2">
              <LogOut size={14} /> Log out
            </button>
          </div>
        </aside>

        {sidebarOpen && <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />}

        {/* ── Main workspace ── */}
        <main className="flex-1 flex flex-col overflow-hidden min-w-0">
          <div className="bg-card border-b border-border px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-3 shrink-0 relative">
            <div className="min-w-0">
              <h1 className="font-display font-bold text-primary text-base sm:text-lg leading-tight truncate">
                {current.label}
              </h1>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                {liveSession ? (
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-green-600 text-xs font-bold">CLASS IN PROGRESS</span>
                  </div>
                ) : (
                  <span className="text-muted-foreground text-xs">{now.toLocaleDateString([], { weekday: "long", day: "numeric", month: "short" })}</span>
                )}
                <span className="text-muted-foreground text-xs hidden sm:block truncate">{user.school}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <div className="hidden sm:flex items-center gap-1.5 bg-green-50 text-green-700 text-xs font-semibold px-3 py-1.5 rounded-full border border-green-200">
                <Users size={12} /> {data?.online ?? "–"} Online
              </div>
              <button
                onClick={() => setChatOpen(true)}
                aria-label="Open classroom chat"
                className="xl:hidden w-9 h-9 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <MessageSquare size={16} />
              </button>
              <button
                onClick={() => setBellOpen(!bellOpen)}
                aria-label="Announcements"
                className="relative w-9 h-9 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <Bell size={16} />
                {!!data?.announcements.length && <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-accent" />}
              </button>
            </div>

            {bellOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setBellOpen(false)} />
                <div className="absolute right-3 sm:right-6 top-full mt-2 z-50 w-[calc(100vw-1.5rem)] sm:w-80 max-h-[60vh] overflow-y-auto bg-card border border-border rounded-xl shadow-xl p-4 space-y-3">
                  <h3 className="font-display font-bold text-primary text-sm">Announcements</h3>
                  {data?.announcements.length ? (
                    data.announcements.map((a) => (
                      <div key={a.id} className="border-t border-border pt-3">
                        <div className="text-sm font-semibold">{a.title}</div>
                        <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">{a.body}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground">No announcements.</p>
                  )}
                </div>
              </>
            )}
          </div>

          <div className="flex flex-1 overflow-hidden">
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 [scrollbar-width:none] min-w-0">
              {loadError && (
                <FormMessage kind="error">
                  {loadError}{" "}
                  <button onClick={loadDashboard} className="font-semibold underline">Retry</button>
                </FormMessage>
              )}

              {section === "overview" &&
                (data ? (
                  <>
                    <div className="bg-primary text-white rounded-2xl p-5 sm:p-6">
                      <p className="text-accent text-xs font-bold uppercase tracking-widest mb-1">Welcome back</p>
                      <h2 className="font-display font-bold text-xl sm:text-2xl mb-2">{user.name}</h2>
                      <p className="text-white/60 text-sm">
                        {liveSession
                          ? `${liveSession.title} with ${liveSession.instructor} is in progress now.`
                          : nextSession
                          ? `Your next class is ${nextSession.title} at ${nextSession.time}.`
                          : "You have no more classes today."}
                      </p>
                      <button
                        onClick={() => setSection("timetable")}
                        className="mt-4 bg-accent hover:bg-[#43a99f] text-white text-sm font-bold px-5 py-2.5 rounded-lg inline-flex items-center gap-1.5"
                      >
                        View timetable <ChevronRight size={16} />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
                      {[
                        { label: "Classes Today", value: String(data.sessions.length), Icon: CalendarDays, to: "timetable" as DashSection },
                        { label: "Fee Balance", value: fees ? formatFcfa(fees.balance) : "–", Icon: CreditCard, to: "fees" as DashSection },
                        { label: "Classmates Online", value: String(data.online), Icon: Users, to: "overview" as DashSection },
                        { label: "Course Materials", value: String(data.resources.length), Icon: BookOpen, to: "modules" as DashSection },
                      ].map((c) => (
                        <button
                          key={c.label}
                          onClick={() => setSection(c.to)}
                          className="text-left bg-card rounded-xl border border-border p-4 hover:border-accent/50 transition-colors"
                        >
                          <c.Icon className="text-accent mb-3" size={20} />
                          <div className="font-display font-bold text-primary text-lg sm:text-xl leading-tight break-words">{c.value}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">{c.label}</div>
                        </button>
                      ))}
                    </div>
                    <Panel title="Today's Schedule">
                      <ScheduleList sessions={data.sessions} />
                    </Panel>
                    <Panel title="Announcements">
                      <div className="space-y-3">
                        {data.announcements.map((a) => (
                          <div key={a.id}>
                            <div className="text-sm font-semibold">{a.title}</div>
                            <p className="text-sm text-muted-foreground leading-relaxed">{a.body}</p>
                          </div>
                        ))}
                      </div>
                    </Panel>
                  </>
                ) : (
                  !loadError && <LoadingBlock />
                ))}

              {section === "timetable" &&
                (data ? (
                  <>
                    <Panel title="Today's Classes">
                      <ScheduleList sessions={data.sessions} />
                    </Panel>
                    <p className="text-xs text-muted-foreground px-1">
                      Classes hold on campus. Check with your course coordinator for room changes.
                    </p>
                  </>
                ) : (
                  !loadError && <LoadingBlock />
                ))}

              {section === "modules" && (data ? <ResourceGrid resources={data.resources} /> : !loadError && <LoadingBlock />)}
              {section === "fees" && <FeesSection fees={fees} />}
              {section === "profile" && <ProfileSection user={user} onSaved={setUser} />}
              {section === "admin" && user.role === "admin" && <AdminSection />}
            </div>

            {/* ── Chat panel: docked on wide screens ── */}
            <div className="hidden xl:flex flex-col w-80 border-l border-border">
              <ChatPanel messages={messages} userId={user.id} online={data?.online ?? 0} onSend={sendMessage} />
            </div>
          </div>
        </main>
      </div>

      {/* ── Chat panel: slide-over on phones / tablets ── */}
      {chatOpen && (
        <div className="xl:hidden fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/50" onClick={() => setChatOpen(false)} />
          <div className="relative w-full sm:w-96 h-full shadow-2xl">
            <ChatPanel
              messages={messages}
              userId={user.id}
              online={data?.online ?? 0}
              onSend={sendMessage}
              onClose={() => setChatOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Root ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState<Page>(pageFromHash);
  const [signupSchool, setSignupSchool] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(() => !!getToken());

  // Hash routing keeps the phone back button and page refresh working.
  useEffect(() => {
    const onHash = () => setPage(pageFromHash());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [page]);

  // Restore a saved login.
  useEffect(() => {
    if (!getToken()) return;
    api
      .me()
      .then((r) => setUser(r.user))
      .catch((e) => {
        if (e instanceof ApiError && e.status === 401) setToken(null);
      })
      .finally(() => setChecking(false));
  }, []);

  const navigate: Nav = useCallback((p, school) => {
    if (p === "auth") setSignupSchool(school ?? "");
    const hash = p === "home" ? "#/" : `#/${p}`;
    if (window.location.hash !== hash) window.location.hash = hash;
    setPage(p);
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    navigate("home");
  }, [navigate]);

  let content: React.ReactNode;
  if (page === "dashboard") {
    if (user) content = <DashboardPage onNavigate={navigate} />;
    else if (checking) content = <div className="h-[100dvh] flex items-center justify-center"><LoadingBlock /></div>;
    else content = <AuthPage onNavigate={navigate} initialSchool="" defaultMode="login" />;
  } else if (page === "auth") content = <AuthPage onNavigate={navigate} initialSchool={signupSchool} />;
  else if (page === "schools") content = <AcademicSchoolsPage onNavigate={navigate} />;
  else if (page === "courses") content = <ProfessionalCoursesPage onNavigate={navigate} />;
  else if (page === "admissions") content = <AdmissionsPage onNavigate={navigate} />;
  else content = <LandingPage onNavigate={navigate} />;

  return <AuthContext.Provider value={{ user, setUser, logout }}>{content}</AuthContext.Provider>;
}
