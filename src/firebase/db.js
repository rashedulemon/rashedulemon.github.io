import { isFirebaseSupported, db } from "./config";
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  setDoc,
  query, 
  orderBy 
} from "firebase/firestore";

// --- Seed Data for Out-Of-The-Box Execution & Fallback ---
const DEFAULT_PROJECTS = [
  {
    id: "op-amp",
    title: "Op-amp AC Response",
    desc: "Analyzed AC response and stability of operational amplifiers using Cadence Virtuoso.",
    image: "op-amp_Schemetic.jpg",
    tags: ["Cadence Virtuoso", "ADE", "Analog Design", "VLSI"],
    outcome: "High Gain Verified",
    details: "This project focused on designing and analyzing a high-gain two-stage Operational Amplifier (Op-amp) using Cadence Virtuoso. Key achievements included verifying the AC response, ensuring stability via frequency compensation (Miller compensation), and running Monte Carlo simulations for yield analysis. I designed the schematic, performed DC bias point adjustments, and measured open-loop gain, phase margin, unity-gain bandwidth, and common-mode rejection ratio (CMRR)."
  },
  {
    id: "smart-home",
    title: "Smart Home Automation",
    desc: "IoT-based home automation system focused on energy optimization and real-time scheduling.",
    image: "smart-home.jpg",
    tags: ["ESP32", "IoT", "C++", "Sensors"],
    outcome: "Energy Efficient",
    details: "Developed a comprehensive home automation system utilizing an ESP32 microcontroller and various sensor modules (DHT22 for temperature, LDR for light, and relay circuits). The system allows remote appliance control and schedules high-load appliances during non-peak hours to reduce electricity bills. Real-time data is streamed to a dashboard using MQTT and WebSockets, enabling homeowners to monitor power usage dynamically."
  },
  {
    id: "fish-pond",
    title: "Smart Fish Pond Management",
    desc: "ML-powered water monitoring, filtration automation, and biomass growth prediction system.",
    image: "fish-pond.jpg",
    tags: ["IoT", "C++", "ESP32", "Machine Learning"],
    outcome: "Growth Prediction",
    details: "Designed an automated monitoring system for aquaculture, specifically focusing on fish pond water quality. Using an ESP32, pH, turbidity, and temperature sensors collect real-time data. A predictive regression model estimating biomass growth and predicting critical water contamination spikes runs locally on the data. Automated filtration and aeration pumps trigger based on water health metrics."
  },
  {
    id: "line-follower",
    title: "Line Follower Robot",
    desc: "Autonomous mobile robot utilizing PID control algorithms for precise track navigation.",
    image: "line-follower.jpg",
    tags: ["Arduino Nano", "IR Sensors", "C++", "Control Systems"],
    outcome: "High Precision",
    details: "Built an autonomous line-follower robot using an Arduino Nano and a 5-sensor array. The core navigation logic is driven by a Proportional-Integral-Derivative (PID) control algorithm, ensuring smooth tracking and high-speed cornering. H-bridge motor drivers (L298N) manage wheel speeds based on the PID output, minimizing path deviation and overshoot."
  }
];

const DEFAULT_EDUCATION = [
  {
    id: "edu-1",
    degree: "Bachelor of Science in Electrical and Electronic Engineering",
    institution: "Varendra University",
    date: "2022 - Present",
    details: "CGPA: 3.92 / 4.00. Focus areas include VLSI Design, Power System Analysis, Control Systems, and Digital Signal Processing."
  },
  {
    id: "edu-2",
    degree: "Diploma in Electrical Technology",
    institution: "Rajshahi Polytechnic Institute",
    date: "2016 - 2021",
    details: "GPA: 3.17 / 4.00. Acquired foundational practical and theoretical knowledge of electrical machinery, wiring installation, and basic electronics."
  },
  {
    id: "edu-3",
    degree: "Secondary School Certificate (SSC)",
    institution: "Technical Training Center",
    date: "2014 - 2016",
    details: "GPA: 4.68 / 5.00. Technical vocational education track."
  }
];

const DEFAULT_EXPERIENCE = [
  {
    id: "exp-1",
    role: "Intern in Infrastructure Planning",
    company: "Fiber@Home Ltd.",
    date: "May 2022 - June 2022",
    details: ["Assisting in telecommunications and fiber infrastructure planning, layout design, and route optimization."],
    category: "work"
  },
  {
    id: "exp-2",
    role: "Lead Designer",
    company: "Satirtho Prokasona",
    date: "September 2018 - February 2022",
    details: ["Designed and implemented a comprehensive home automation system focused on energy efficiency and user convenience."],
    category: "work"
  },
  {
    id: "vol-1",
    role: "Campus Ambassador",
    company: "Ulkasemi",
    date: "March 2026 - Present",
    details: ["Represent Ulkasemi in Varendra University, promoting semiconductor design careers, training courses, and industry-academic bridge programs."],
    category: "volunteering"
  },
  {
    id: "vol-2",
    role: "President",
    company: "Varendra University E-Club",
    date: "February 2026 - Present",
    details: ["Organizing workshops on entrepreneurship, VLSI, and project design for engineering students."],
    category: "volunteering"
  },
  {
    id: "vol-3",
    role: "Executive Member",
    company: "Lighter Youth Foundation",
    date: "September 2018 - Present",
    details: ["Organized and executed various community service projects, relief operations, and educational campaigns."],
    category: "volunteering"
  },
  {
    id: "vol-4",
    role: "Department Representative",
    company: "Varendra University Research Club",
    date: "October 2025 - January 2026",
    details: ["Facilitated coordination of research projects, paper presentations, and research methodology bootcamps for EEE undergraduates."],
    category: "volunteering"
  }
];

const DEFAULT_CERTIFICATES = [
  {
    id: "cert-1",
    title: "AI+ Prompt Engineer Level 1™",
    issuer: "AiCert's",
    date: "Jul 2025",
    description: "Reflects expertise in prompt engineering, LLM optimization, and system instructions design."
  },
  {
    id: "cert-2",
    title: "Certified Python (Basic)",
    issuer: "HackerRank",
    date: "Sep 2020",
    description: "Demonstrates understanding of core Python programming concepts, algorithms, and data structures."
  },
  {
    id: "cert-3",
    title: "Android Application Development",
    issuer: "LEDP PANCHBIBI",
    date: "Jul 2019",
    description: "Foundational certification on building mobile applications with Java/Android SDK."
  },
  {
    id: "cert-4",
    title: "Solar Home System: Design, Installation & Maintenance",
    issuer: "IEEE",
    date: "Dec 2017",
    description: "Training in off-grid solar systems engineering, battery banks calculations, PV sizing, and inverters."
  }
];

const DEFAULT_ACTIVITIES = [
  {
    id: "act-1",
    title: "VLSI Course",
    desc: "Completed advanced training in digital VLSI design flow, physical layout design, and power/static timing analysis.",
    date: "April 2026",
    image: "vlsi_course.png"
  },
  {
    id: "act-2",
    title: "Ulkasemi Campus Ambassador Onboarding",
    desc: "Joined the onboarding session for Ulkasemi, learning about semiconductor chip design pipelines, fabrication flows, and bridging industry-academic gaps in Bangladesh.",
    date: "March 2026",
    image: "ca_ulkasemi.png"
  },
  {
    id: "act-3",
    title: "Control Design Onramp with Simulink",
    desc: "Completed comprehensive training in modeling, tuning, and simulating PID/feedback controllers in MATLAB & Simulink.",
    date: "March 2026",
    image: null
  },
  {
    id: "act-4",
    title: "AI Prompt Engineer Level 1™",
    desc: "Received certification on prompt structuring, reasoning pipelines, and API integrations with AI systems.",
    date: "July 2025",
    image: null
  }
];

// Helper to initialize local storage databases
const initLocalStorage = () => {
  if (!localStorage.getItem("portfolio_projects")) {
    localStorage.setItem("portfolio_projects", JSON.stringify(DEFAULT_PROJECTS));
  }
  if (!localStorage.getItem("portfolio_education")) {
    localStorage.setItem("portfolio_education", JSON.stringify(DEFAULT_EDUCATION));
  }
  if (!localStorage.getItem("portfolio_experience")) {
    localStorage.setItem("portfolio_experience", JSON.stringify(DEFAULT_EXPERIENCE));
  }
  if (!localStorage.getItem("portfolio_certificates")) {
    localStorage.setItem("portfolio_certificates", JSON.stringify(DEFAULT_CERTIFICATES));
  }
  if (!localStorage.getItem("portfolio_activities")) {
    localStorage.setItem("portfolio_activities", JSON.stringify(DEFAULT_ACTIVITIES));
  }
  if (!localStorage.getItem("portfolio_messages")) {
    localStorage.setItem("portfolio_messages", JSON.stringify([]));
  }
  if (!localStorage.getItem("portfolio_guestbook")) {
    localStorage.setItem("portfolio_guestbook", JSON.stringify([
      { id: "gb-1", name: "Dr. Ali", content: "Great VLSI simulator widget! The MOSFET channel cross-section visualization is very clean.", date: new Date(Date.now() - 86400000 * 3).toISOString() },
      { id: "gb-2", name: "Sajid", content: "Amazing portfolio Emon. The CMOS inverter simulator shows exactly how PMOS/NMOS conduct current. Best of luck!", date: new Date(Date.now() - 86400000).toISOString() }
    ]));
  }
};

initLocalStorage();

// --- Firestore CRUD operations & local storage fallbacks ---

const getCollectionData = async (colName, localStorageKey) => {
  if (isFirebaseSupported) {
    try {
      const q = query(collection(db, colName));
      const querySnapshot = await getDocs(q);
      const items = [];
      querySnapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() });
      });
      return items;
    } catch (e) {
      console.error(`Error fetching collection ${colName}:`, e);
    }
  }
  // Local storage fallback
  return JSON.parse(localStorage.getItem(localStorageKey));
};

function compareDateStrings(aStr, bStr) {
  const getParts = (str) => {
    if (!str) return { start: 0, end: 0 };
    const parts = str.split(/[-–]/).map(s => s.trim());
    
    const parseSingle = (s) => {
      if (!s) return 0;
      if (s.toLowerCase().includes("present")) return 9999999999999; // Stable high constant for sorting Present
      const parsed = Date.parse(s);
      return isNaN(parsed) ? 0 : parsed;
    };
    
    const start = parseSingle(parts[0]);
    const end = parts.length > 1 ? parseSingle(parts[1]) : start;
    return { start, end };
  };

  const a = getParts(aStr);
  const b = getParts(bStr);

  if (b.end !== a.end) {
    return b.end - a.end;
  }
  return b.start - a.start;
}

export const fetchProjects = () => getCollectionData("projects", "portfolio_projects");
export const fetchEducation = () => getCollectionData("education", "portfolio_education");

export const fetchExperience = async () => {
  const data = await getCollectionData("experience", "portfolio_experience");
  if (!data) return [];
  return [...data].sort((a, b) => compareDateStrings(a.date, b.date));
};

export const fetchCertificates = () => getCollectionData("certificates", "portfolio_certificates");

export const fetchActivities = async () => {
  const data = await getCollectionData("activities", "portfolio_activities");
  if (!data) return [];
  return [...data].sort((a, b) => compareDateStrings(a.date, b.date));
};

// --- Contact Form Messages ---
export const submitMessage = async (messageData) => {
  const messageWithTimestamp = {
    ...messageData,
    date: new Date().toISOString(),
    status: "unread"
  };

  if (isFirebaseSupported) {
    try {
      const docRef = await addDoc(collection(db, "messages"), messageWithTimestamp);
      return { success: true, id: docRef.id };
    } catch (e) {
      console.error("Error sending message to Firestore:", e);
    }
  }
  
  // Local storage fallback
  const messages = JSON.parse(localStorage.getItem("portfolio_messages")) || [];
  const localId = "msg-" + Date.now();
  const newMessage = { id: localId, ...messageWithTimestamp };
  messages.push(newMessage);
  localStorage.setItem("portfolio_messages", JSON.stringify(messages));
  return { success: true, id: localId };
};

export const fetchMessages = async () => {
  if (isFirebaseSupported) {
    try {
      const q = query(collection(db, "messages"), orderBy("date", "desc"));
      const snapshot = await getDocs(q);
      const items = [];
      snapshot.forEach(doc => {
        items.push({ id: doc.id, ...doc.data() });
      });
      return items;
    } catch (e) {
      console.error("Error fetching messages:", e);
    }
  }
  
  const messages = JSON.parse(localStorage.getItem("portfolio_messages")) || [];
  return messages.sort((a, b) => new Date(b.date) - new Date(a.date));
};

export const updateMessageStatus = async (id, status) => {
  if (isFirebaseSupported) {
    try {
      await updateDoc(doc(db, "messages", id), { status });
      return true;
    } catch (e) {
      console.error("Error updating message status:", e);
    }
  }

  const messages = JSON.parse(localStorage.getItem("portfolio_messages")) || [];
  const idx = messages.findIndex(m => m.id === id);
  if (idx !== -1) {
    messages[idx].status = status;
    localStorage.setItem("portfolio_messages", JSON.stringify(messages));
    return true;
  }
  return false;
};

export const deleteMessage = async (id) => {
  if (isFirebaseSupported) {
    try {
      await deleteDoc(doc(db, "messages", id));
      return true;
    } catch (e) {
      console.error("Error deleting message from Firestore:", e);
    }
  }

  const messages = JSON.parse(localStorage.getItem("portfolio_messages")) || [];
  const filtered = messages.filter(m => m.id !== id);
  localStorage.setItem("portfolio_messages", JSON.stringify(filtered));
  return true;
};

// --- Guestbook ---
export const fetchGuestbookMessages = async () => {
  if (isFirebaseSupported) {
    try {
      const q = query(collection(db, "guestbook"), orderBy("date", "desc"));
      const snapshot = await getDocs(q);
      const items = [];
      snapshot.forEach(doc => {
        items.push({ id: doc.id, ...doc.data() });
      });
      return items;
    } catch (e) {
      console.error("Error fetching guestbook:", e);
    }
  }

  const gb = JSON.parse(localStorage.getItem("portfolio_guestbook")) || [];
  return gb.sort((a, b) => new Date(b.date) - new Date(a.date));
};

export const postGuestbookMessage = async (name, content) => {
  const comment = {
    name,
    content,
    date: new Date().toISOString()
  };

  if (isFirebaseSupported) {
    try {
      const docRef = await addDoc(collection(db, "guestbook"), comment);
      return { id: docRef.id, ...comment };
    } catch (e) {
      console.error("Error posting to guestbook:", e);
    }
  }

  const gb = JSON.parse(localStorage.getItem("portfolio_guestbook")) || [];
  const localId = "gb-" + Date.now();
  const newComment = { id: localId, ...comment };
  gb.push(newComment);
  localStorage.setItem("portfolio_guestbook", JSON.stringify(gb));
  return newComment;
};

// --- General CMS Actions for Admin Panel ---
export const addPortfolioItem = async (colName, localStorageKey, data) => {
  if (isFirebaseSupported) {
    try {
      const docRef = await addDoc(collection(db, colName), data);
      return { id: docRef.id, ...data };
    } catch (e) {
      console.error(`Error adding to ${colName}:`, e);
    }
  }

  const items = JSON.parse(localStorage.getItem(localStorageKey)) || [];
  const newId = "local-" + Date.now();
  const newItem = { id: newId, ...data };
  items.push(newItem);
  localStorage.setItem(localStorageKey, JSON.stringify(items));
  return newItem;
};

export const updatePortfolioItem = async (colName, localStorageKey, id, data) => {
  if (isFirebaseSupported) {
    try {
      await updateDoc(doc(db, colName, id), data);
      return true;
    } catch (e) {
      console.error(`Error updating in ${colName}:`, e);
    }
  }

  const items = JSON.parse(localStorage.getItem(localStorageKey)) || [];
  const idx = items.findIndex(item => item.id === id);
  if (idx !== -1) {
    items[idx] = { id, ...data };
    localStorage.setItem(localStorageKey, JSON.stringify(items));
    return true;
  }
  return false;
};

export const deletePortfolioItem = async (colName, localStorageKey, id) => {
  if (isFirebaseSupported) {
    try {
      await deleteDoc(doc(db, colName, id));
      return true;
    } catch (e) {
      console.error(`Error deleting from ${colName}:`, e);
    }
  }

  const items = JSON.parse(localStorage.getItem(localStorageKey)) || [];
  const filtered = items.filter(item => item.id !== id);
  localStorage.setItem(localStorageKey, JSON.stringify(filtered));
  return true;
};

// --- Database Seeding Helper ---
// Admin can trigger this from the panel to bulk push baseline data to Firestore
export const seedFirestore = async () => {
  if (!isFirebaseSupported) {
    alert("Cannot seed database: Firebase is not configured.");
    return false;
  }

  try {
    // Seed Projects
    for (const item of DEFAULT_PROJECTS) {
      await setDoc(doc(db, "projects", item.id), item);
    }
    // Seed Education
    for (const item of DEFAULT_EDUCATION) {
      await setDoc(doc(db, "education", item.id), item);
    }
    // Seed Experience
    for (const item of DEFAULT_EXPERIENCE) {
      await setDoc(doc(db, "experience", item.id), item);
    }
    // Seed Certificates
    for (const item of DEFAULT_CERTIFICATES) {
      await setDoc(doc(db, "certificates", item.id), item);
    }
    // Seed Activities
    for (const item of DEFAULT_ACTIVITIES) {
      await setDoc(doc(db, "activities", item.id), item);
    }
    return true;
  } catch (e) {
    console.error("Error seeding Firestore:", e);
    throw e;
  }
};
