import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  auth, 
  isFirebaseSupported, 
  googleProvider 
} from "../firebase/config";
import { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged 
} from "firebase/auth";
import {
  fetchProjects,
  fetchEducation,
  fetchExperience,
  fetchCertificates,
  fetchActivities,
  fetchMessages,
  updateMessageStatus,
  deleteMessage,
  addPortfolioItem,
  updatePortfolioItem,
  deletePortfolioItem,
  seedFirestore
} from "../firebase/db";
import CircuitBg from "../components/CircuitBg";
import { 
  Cpu, 
  ArrowLeft, 
  LogIn, 
  LogOut, 
  Trash2, 
  MailOpen, 
  Mail, 
  Plus, 
  Pencil, 
  Check, 
  Database, 
  RefreshCw, 
  LayoutDashboard, 
  Briefcase, 
  FlameKindling, 
  ShieldAlert, 
  CheckCircle2,
  Settings
} from "lucide-react";

const ADMIN_EMAIL = "emonrasedul@gmail.com";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [activeTab, setActiveTab] = useState("messages"); // messages, projects, resume, activities, settings

  // Database collections state
  const [messages, setMessages] = useState([]);
  const [projects, setProjects] = useState([]);
  const [education, setEducation] = useState([]);
  const [experience, setExperience] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [activities, setActivities] = useState([]);

  // Data Loading indicators
  const [loadingData, setLoadingData] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Form edit states
  const [editingItem, setEditingItem] = useState(null); // { type: 'project'|'education'|'experience'|'certificate'|'activity', data: obj }
  const [isAdding, setIsAdding] = useState(false); // Flag for rendering Add Form

  // Project Form State
  const [projectForm, setProjectForm] = useState({
    id: "",
    title: "",
    desc: "",
    image: "",
    tags: "",
    outcome: "",
    details: ""
  });

  // Education Form State
  const [educationForm, setEducationForm] = useState({
    degree: "",
    institution: "",
    date: "",
    details: ""
  });

  // Experience Form State
  const [experienceForm, setExperienceForm] = useState({
    role: "",
    company: "",
    date: "",
    details: "", // newline separated
    category: "work" // work or volunteering
  });

  // Certificate Form State
  const [certificateForm, setCertificateForm] = useState({
    title: "",
    issuer: "",
    date: "",
    description: ""
  });

  // Activity Form State
  const [activityForm, setActivityForm] = useState({
    title: "",
    desc: "",
    date: "",
    image: ""
  });

  // General Status Alerts
  const [alertMsg, setAlertMsg] = useState({ type: null, text: "" });

  // Helper alerts
  const triggerAlert = (type, text) => {
    setAlertMsg({ type, text });
    setTimeout(() => setAlertMsg({ type: null, text: "" }), 5000);
  };

  // Auth Checks
  const isAdminAuthorized = () => {
    if (!currentUser) return false;
    if (!isFirebaseSupported) return true; // Local storage development
    return currentUser.email === ADMIN_EMAIL;
  };

  // 1. Auth Monitoring
  useEffect(() => {
    if (!isFirebaseSupported) {
      // In local mode, bypass login and simulate local admin
      setCurrentUser({ email: "local-admin@local.host", displayName: "Local Admin" });
      setLoadingAuth(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
      }
      setLoadingAuth(false);
    });

    return () => unsubscribe();
  }, []);

  // 2. Load Dashboard Data once authorized
  const loadDashboardData = async () => {
    if (!isAdminAuthorized()) return;
    setLoadingData(true);
    try {
      const msgs = await fetchMessages();
      const projs = await fetchProjects();
      const edu = await fetchEducation();
      const exp = await fetchExperience();
      const certs = await fetchCertificates();
      const acts = await fetchActivities();

      setMessages(msgs || []);
      setProjects(projs || []);
      setEducation(edu || []);
      setExperience(exp || []);
      setCertificates(certs || []);
      setActivities(acts || []);
    } catch (e) {
      console.error("Error loading dashboard data:", e);
      triggerAlert("error", "Failed to retrieve database records.");
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  const handleSignIn = async () => {
    if (!isFirebaseSupported) return;
    try {
      setAlertMsg({ type: null, text: "" });
      await signInWithPopup(auth, googleProvider);
    } catch (e) {
      console.error("Admin sign in failed:", e);
      triggerAlert("error", "Sign in failed: " + e.message);
    }
  };

  const handleSignOut = async () => {
    if (!isFirebaseSupported) return;
    try {
      await signOut(auth);
      setCurrentUser(null);
      navigate("/");
    } catch (e) {
      console.error("Sign out failed:", e);
    }
  };

  // 3. Message Handlers
  const handleToggleMessageRead = async (msg) => {
    setActionLoading(true);
    const newStatus = msg.status === "unread" ? "read" : "unread";
    try {
      await updateMessageStatus(msg.id, newStatus);
      setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, status: newStatus } : m));
      triggerAlert("success", `Message status marked as ${newStatus}.`);
    } catch (err) {
      console.error("Failed to update message status:", err);
      triggerAlert("error", "Failed to update message status.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteMessage = async (id) => {
    if (!window.confirm("Are you sure you want to delete this message?")) return;
    setActionLoading(true);
    try {
      await deleteMessage(id);
      setMessages(prev => prev.filter(m => m.id !== id));
      triggerAlert("success", "Message deleted successfully.");
    } catch (err) {
      console.error("Failed to delete message:", err);
      triggerAlert("error", "Failed to delete message.");
    } finally {
      setActionLoading(false);
    }
  };

  // 4. Seeding Handler
  const handleSeedDatabase = async () => {
    if (!isFirebaseSupported) {
      triggerAlert("error", "Cannot seed database: Firebase connection is inactive.");
      return;
    }
    if (!window.confirm("This will overwrite existing items with baseline EEE portfolio documents. Proceed?")) return;
    setActionLoading(true);
    try {
      const res = await seedFirestore();
      if (res) {
        triggerAlert("success", "Firestore successfully seeded with portfolio data!");
        await loadDashboardData();
      } else {
        triggerAlert("error", "Failed to seed Firestore database.");
      }
    } catch (e) {
      triggerAlert("error", "Seeding error: " + e.message);
    } finally {
      setActionLoading(false);
    }
  };

  // 5. CRUD Submissions
  const resetForms = () => {
    setEditingItem(null);
    setIsAdding(false);
    
    setProjectForm({ id: "", title: "", desc: "", image: "", tags: "", outcome: "", details: "" });
    setEducationForm({ degree: "", institution: "", date: "", details: "" });
    setExperienceForm({ role: "", company: "", date: "", details: "", category: "work" });
    setCertificateForm({ title: "", issuer: "", date: "", description: "" });
    setActivityForm({ title: "", desc: "", date: "", image: "" });
  };

  const populateEditForm = (type, item) => {
    setEditingItem({ type, data: item });
    setIsAdding(false);

    if (type === "project") {
      setProjectForm({
        id: item.id,
        title: item.title || "",
        desc: item.desc || "",
        image: item.image || "",
        tags: item.tags ? item.tags.join(", ") : "",
        outcome: item.outcome || "",
        details: item.details || ""
      });
    } else if (type === "education") {
      setEducationForm({
        degree: item.degree || "",
        institution: item.institution || "",
        date: item.date || "",
        details: item.details || ""
      });
    } else if (type === "experience") {
      setExperienceForm({
        role: item.role || "",
        company: item.company || "",
        date: item.date || "",
        details: item.details ? item.details.join("\n") : "",
        category: item.category || "work"
      });
    } else if (type === "certificate") {
      setCertificateForm({
        title: item.title || "",
        issuer: item.issuer || "",
        date: item.date || "",
        description: item.description || ""
      });
    } else if (type === "activity") {
      setActivityForm({
        title: item.title || "",
        desc: item.desc || "",
        date: item.date || "",
        image: item.image || ""
      });
    }
  };

  const handleCreateOrUpdateItem = async (e, type) => {
    e.preventDefault();
    setActionLoading(true);

    let colName = "";
    let localKey = "";
    let formattedData = {};
    let isEdit = !!editingItem;
    let targetId = isEdit ? editingItem.data.id : null;

    // Prep item specific schemas
    if (type === "project") {
      colName = "projects";
      localKey = "portfolio_projects";
      
      const customId = projectForm.id.trim() || "proj-" + Date.now();
      formattedData = {
        title: projectForm.title,
        desc: projectForm.desc,
        image: projectForm.image,
        tags: projectForm.tags.split(",").map(t => t.trim()).filter(Boolean),
        outcome: projectForm.outcome,
        details: projectForm.details
      };
      // Firestore setDoc needs id, addDoc auto generates. 
      // If adding new, we append id. If edit, keep the same.
      if (!isEdit) {
        formattedData.id = customId;
      } else {
        formattedData.id = targetId;
      }
    } else if (type === "education") {
      colName = "education";
      localKey = "portfolio_education";
      formattedData = { ...educationForm };
    } else if (type === "experience") {
      colName = "experience";
      localKey = "portfolio_experience";
      formattedData = {
        role: experienceForm.role,
        company: experienceForm.company,
        date: experienceForm.date,
        details: experienceForm.details.split("\n").map(line => line.trim()).filter(Boolean),
        category: experienceForm.category
      };
    } else if (type === "certificate") {
      colName = "certificates";
      localKey = "portfolio_certificates";
      formattedData = { ...certificateForm };
    } else if (type === "activity") {
      colName = "activities";
      localKey = "portfolio_activities";
      formattedData = { 
        ...activityForm,
        image: activityForm.image || null
      };
    }

    try {
      if (isEdit) {
        await updatePortfolioItem(colName, localKey, targetId, formattedData);
        triggerAlert("success", `${type.toUpperCase()} item updated successfully.`);
      } else {
        await addPortfolioItem(colName, localKey, formattedData);
        triggerAlert("success", `${type.toUpperCase()} item created successfully.`);
      }
      
      resetForms();
      // Reload from storage/cloud
      await loadDashboardData();
    } catch (err) {
      console.error(err);
      triggerAlert("error", `Failed to complete ${isEdit ? "update" : "creation"} operation.`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteItem = async (type, id) => {
    if (!window.confirm(`Are you sure you want to delete this ${type} item?`)) return;
    setActionLoading(true);

    let colName = "";
    let localKey = "";

    if (type === "project") { colName = "projects"; localKey = "portfolio_projects"; }
    else if (type === "education") { colName = "education"; localKey = "portfolio_education"; }
    else if (type === "experience") { colName = "experience"; localKey = "portfolio_experience"; }
    else if (type === "certificate") { colName = "certificates"; localKey = "portfolio_certificates"; }
    else if (type === "activity") { colName = "activities"; localKey = "portfolio_activities"; }

    try {
      await deletePortfolioItem(colName, localKey, id);
      triggerAlert("success", "Item deleted successfully.");
      await loadDashboardData();
    } catch (err) {
      console.error(err);
      triggerAlert("error", "Failed to delete item.");
    } finally {
      setActionLoading(false);
    }
  };

  // Render Loader if auth loading
  if (loadingAuth) {
    return (
      <div className="relative min-h-screen bg-slate-50 text-slate-800 flex items-center justify-center font-mono text-sm z-10">
        <CircuitBg />
        <div className="flex flex-col items-center gap-3 relative z-10">
          <Cpu className="w-8 h-8 text-brand-blue animate-spin" />
          <span className="text-slate-600">Authenticating Administrator...</span>
        </div>
      </div>
    );
  }

  // Render Access Denied or Sign In UI
  if (!currentUser || !isAdminAuthorized()) {
    return (
      <div className="relative min-h-screen bg-slate-50 text-slate-800 flex items-center justify-center font-mono text-sm z-10">
        <CircuitBg />
        <div className="relative z-10 w-full max-w-md p-8 glass-card border border-slate-200/80 rounded-2xl flex flex-col items-center gap-6 shadow-lg text-center">
          <div className="h-16 w-16 bg-red-50 border border-red-200 text-red-600 rounded-full flex items-center justify-center mb-2">
            <ShieldAlert className="w-8 h-8" />
          </div>
          
          <div>
            <h2 className="text-xl font-bold text-slate-900 uppercase tracking-wider">Admin Gate</h2>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              {currentUser 
                ? `Authorized access only. Account ${currentUser.email} is not permitted.` 
                : "Enter administrator credentials to configure and manage database nodes."}
            </p>
          </div>

          {alertMsg.text && (
            <div className="w-full p-3 rounded-lg text-xs bg-red-55 border border-red-200 text-red-700">
              {alertMsg.text}
            </div>
          )}

          {currentUser ? (
            <div className="flex flex-col gap-3 w-full">
              <span className="text-[10px] text-slate-400">SIGNED IN AS: {currentUser.email}</span>
              <button
                onClick={handleSignOut}
                className="w-full py-2.5 rounded-xl border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 text-xs font-bold uppercase transition-all"
              >
                Sign Out / Disconnect
              </button>
            </div>
          ) : (
            <button
              onClick={handleSignIn}
              className="w-full py-3 rounded-xl bg-brand-blue hover:bg-brand-blue/90 text-white font-bold uppercase text-xs tracking-wider transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <LogIn className="w-4 h-4" /> Google Admin Login
            </button>
          )}

          <Link to="/" className="text-xs text-brand-blue/80 hover:text-brand-blue flex items-center gap-1.5 transition-colors border-t border-slate-200/80 pt-4 w-full justify-center">
            <ArrowLeft className="w-3.5 h-3.5" /> Return to Public Shell
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-slate-50 text-slate-800 z-10 font-sans">
      <CircuitBg />

      {/* Admin Floating Banner */}
      <div className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur-md shadow-sm">
        <div className="container mx-auto px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-brand-blue/10 rounded-xl border border-brand-blue/30 flex items-center justify-center text-brand-blue">
              <LayoutDashboard className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-extrabold text-slate-900 uppercase tracking-wider font-mono flex items-center gap-1.5">
                Core Control Panel
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-blue/15 border border-brand-blue/30 text-brand-blue lowercase">
                  admin
                </span>
              </h1>
              <p className="text-[10px] text-slate-500 font-mono">
                Operator Node: <span className="text-brand-blue font-bold">{currentUser.email}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link 
              to="/" 
              className="px-4 py-2 rounded-lg bg-white border border-slate-200 text-xs font-mono font-bold text-slate-650 hover:bg-slate-50 transition-all flex items-center gap-1.5 shadow-sm"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Site
            </Link>
            <button
              onClick={handleSignOut}
              className="px-4 py-2 rounded-lg bg-red-50 border border-red-200 text-xs font-mono font-bold text-red-650 hover:bg-red-100 transition-all flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" /> Terminate Node
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 pt-8 pb-32 relative z-10 max-w-6xl">
        {/* Alerts */}
        {alertMsg.text && (
          <div className={`p-4 rounded-xl text-xs font-mono font-semibold border mb-6 flex items-center gap-2 ${
            alertMsg.type === "success" 
              ? "bg-green-50 text-green-700 border-green-200" 
              : "bg-red-50 text-red-700 border-red-200"
          }`}>
            {alertMsg.type === "success" ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <ShieldAlert className="w-4 h-4 shrink-0" />}
            {alertMsg.text}
          </div>
        )}

        {/* Firebase Config Notice banner */}
        {!isFirebaseSupported && (
          <div className="flex items-start gap-2 bg-yellow-50 border border-yellow-250 p-4 rounded-xl text-xs font-mono text-yellow-800 leading-relaxed mb-6">
            <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block uppercase mb-0.5">Offline Database Mode</span>
              Firestore is currently offline (no VITE_FIREBASE_API_KEY credentials found in environment). 
              Edits made below will persist directly to this browser's <code className="bg-slate-100 border border-slate-200 px-1 py-0.5 rounded text-slate-800 text-[10px]">localStorage</code>.
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* LEFT: Sidebar Navigation Tabs */}
          <div className="lg:col-span-1 flex flex-col gap-2">
            <button
              onClick={() => { setActiveTab("messages"); resetForms(); }}
              className={`w-full p-4 rounded-xl text-left font-mono text-xs font-bold transition-all flex items-center justify-between border ${
                activeTab === "messages"
                  ? "bg-brand-blue text-white border-brand-blue shadow-sm"
                  : "bg-white text-slate-650 hover:text-slate-850 hover:bg-slate-50 border-slate-200/80"
              }`}
            >
              <span className="flex items-center gap-2">
                <Mail className="w-4 h-4" /> Message Inbox
              </span>
              <span className={`text-[9px] px-2 py-0.5 rounded-full ${
                activeTab === "messages" ? "bg-blue-900 text-white" : "bg-slate-100 text-slate-500"
              }`}>
                {messages.filter(m => m.status === "unread").length} unread
              </span>
            </button>

            <button
              onClick={() => { setActiveTab("projects"); resetForms(); }}
              className={`w-full p-4 rounded-xl text-left font-mono text-xs font-bold transition-all flex items-center gap-2 border ${
                activeTab === "projects"
                  ? "bg-brand-blue text-white border-brand-blue shadow-sm"
                  : "bg-white text-slate-650 hover:text-slate-850 hover:bg-slate-50 border-slate-200/80"
              }`}
            >
              <Cpu className="w-4 h-4" /> Projects CMS
            </button>

            <button
              onClick={() => { setActiveTab("resume"); resetForms(); }}
              className={`w-full p-4 rounded-xl text-left font-mono text-xs font-bold transition-all flex items-center gap-2 border ${
                activeTab === "resume"
                  ? "bg-brand-blue text-white border-brand-blue shadow-sm"
                  : "bg-white text-slate-650 hover:text-slate-850 hover:bg-slate-50 border-slate-200/80"
              }`}
            >
              <Briefcase className="w-4 h-4" /> Resume / Education
            </button>

            <button
              onClick={() => { setActiveTab("activities"); resetForms(); }}
              className={`w-full p-4 rounded-xl text-left font-mono text-xs font-bold transition-all flex items-center gap-2 border ${
                activeTab === "activities"
                  ? "bg-brand-blue text-white border-brand-blue shadow-sm"
                  : "bg-white text-slate-650 hover:text-slate-850 hover:bg-slate-50 border-slate-200/80"
              }`}
            >
              <FlameKindling className="w-4 h-4" /> Activities Tracker
            </button>

            <button
              onClick={() => { setActiveTab("settings"); resetForms(); }}
              className={`w-full p-4 rounded-xl text-left font-mono text-xs font-bold transition-all flex items-center gap-2 border ${
                activeTab === "settings"
                  ? "bg-brand-blue text-white border-brand-blue shadow-sm"
                  : "bg-white text-slate-650 hover:text-slate-850 hover:bg-slate-50 border-slate-200/80"
              }`}
            >
              <Settings className="w-4 h-4" /> Settings & Cloud
            </button>
          </div>

          {/* RIGHT: Content Viewer & Editor */}
          <div className="lg:col-span-3">
            <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200/80 shadow-md min-h-[400px]">
              
              {/* TAB 1: MESSAGE INBOX */}
              {activeTab === "messages" && (
                <div>
                  <div className="flex justify-between items-center border-b border-slate-200/80 pb-4 mb-6">
                    <h2 className="text-lg font-bold font-mono uppercase tracking-wider text-slate-800 flex items-center gap-2">
                      <Mail className="w-5 h-5 text-brand-blue" /> Submissions Inbox
                    </h2>
                    <button
                      onClick={loadDashboardData}
                      disabled={loadingData}
                      className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-700 transition-colors"
                    >
                      <RefreshCw className={`w-4 h-4 ${loadingData ? "animate-spin" : ""}`} />
                    </button>
                  </div>

                  {loadingData ? (
                    <div className="py-12 flex flex-col items-center justify-center gap-2 text-xs font-mono text-slate-500">
                      <RefreshCw className="w-6 h-6 text-brand-blue animate-spin" />
                      Loading records...
                    </div>
                  ) : messages.length > 0 ? (
                    <div className="space-y-4">
                      {messages.map((msg) => (
                        <div 
                          key={msg.id} 
                          className={`p-5 rounded-xl border transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${
                            msg.status === "unread" 
                              ? "bg-blue-50/60 border-brand-blue/20" 
                              : "bg-slate-50/50 border-slate-200"
                          }`}
                        >
                          <div className="flex-grow space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-bold text-slate-800 text-sm font-mono">{msg.name}</span>
                              <a href={`mailto:${msg.email}`} className="text-xs text-brand-blue/80 hover:underline font-mono">
                                ({msg.email})
                              </a>
                              {msg.status === "unread" && (
                                <span className="text-[8px] font-mono px-1.5 py-0.5 rounded bg-brand-blue text-white uppercase font-extrabold tracking-wide">
                                  NEW
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-600 mt-2 whitespace-pre-wrap leading-relaxed">{msg.message}</p>
                            <span className="text-[9px] font-mono text-slate-400 block mt-2">
                              Logged: {new Date(msg.date).toLocaleString()}
                            </span>
                          </div>

                          <div className="flex gap-2 shrink-0 self-end md:self-center">
                            <button
                              onClick={() => handleToggleMessageRead(msg)}
                              disabled={actionLoading}
                              title={msg.status === "unread" ? "Mark as Read" : "Mark as Unread"}
                              className={`p-2 rounded-lg border transition-all hover:scale-105 ${
                                msg.status === "unread"
                                  ? "bg-brand-blue/10 border-brand-blue/30 text-brand-blue hover:bg-brand-blue/20"
                                  : "bg-white border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                              }`}
                            >
                              {msg.status === "unread" ? <MailOpen className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={() => handleDeleteMessage(msg.id)}
                              disabled={actionLoading}
                              title="Delete Message"
                              className="p-2 rounded-lg border border-red-200 hover:border-red-300 bg-red-50 hover:bg-red-100 text-red-650 hover:scale-105 transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-12 text-center text-xs font-mono text-slate-500">
                      Inbox is empty. No messages received yet.
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: PROJECTS CMS */}
              {activeTab === "projects" && (
                <div>
                  <div className="flex justify-between items-center border-b border-slate-200/80 pb-4 mb-6">
                    <h2 className="text-lg font-bold font-mono uppercase tracking-wider text-slate-800 flex items-center gap-2">
                      <Cpu className="w-5 h-5 text-brand-blue" /> Projects CMS
                    </h2>
                    {!isAdding && !editingItem && (
                      <button
                        onClick={() => { resetForms(); setIsAdding(true); }}
                        className="px-4 py-2 bg-brand-blue text-white font-bold font-mono text-xs rounded-xl flex items-center gap-1 shadow-sm hover:scale-105 hover:bg-brand-blue/90 transition-all"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Project
                      </button>
                    )}
                  </div>

                  {/* Add / Edit Form Panel */}
                  {(isAdding || editingItem) ? (
                    <form onSubmit={(e) => handleCreateOrUpdateItem(e, "project")} className="space-y-4">
                      <h3 className="text-xs font-bold font-mono uppercase text-brand-blue">
                        {editingItem ? `Editing: ${editingItem.data.title}` : "New Silicon Design Project"}
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-mono font-semibold uppercase text-slate-500">Project Key ID (slug)</label>
                          <input
                            type="text"
                            value={projectForm.id}
                            onChange={(e) => setProjectForm(prev => ({ ...prev, id: e.target.value }))}
                            placeholder="e.g. op-amp-v2"
                            disabled={!!editingItem}
                            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-brand-blue/50 focus:bg-white font-mono transition-colors disabled:opacity-40"
                            required
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-mono font-semibold uppercase text-slate-500">Title</label>
                          <input
                            type="text"
                            value={projectForm.title}
                            onChange={(e) => setProjectForm(prev => ({ ...prev, title: e.target.value }))}
                            placeholder="Project Title"
                            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-brand-blue/50 focus:bg-white transition-colors"
                            required
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-mono font-semibold uppercase text-slate-500">Short Summary</label>
                        <input
                          type="text"
                          value={projectForm.desc}
                          onChange={(e) => setProjectForm(prev => ({ ...prev, desc: e.target.value }))}
                          placeholder="Short description displayed on card grid"
                          className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-brand-blue/50 focus:bg-white transition-colors"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-mono font-semibold uppercase text-slate-500">Image Filename</label>
                          <input
                            type="text"
                            value={projectForm.image}
                            onChange={(e) => setProjectForm(prev => ({ ...prev, image: e.target.value }))}
                            placeholder="e.g. op-amp.jpg"
                            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-brand-blue/50 focus:bg-white font-mono transition-colors"
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-mono font-semibold uppercase text-slate-500">Tags (comma separated)</label>
                          <input
                            type="text"
                            value={projectForm.tags}
                            onChange={(e) => setProjectForm(prev => ({ ...prev, tags: e.target.value }))}
                            placeholder="e.g. Cadence, VLSI, ADE"
                            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-brand-blue/50 focus:bg-white font-mono transition-colors"
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-mono font-semibold uppercase text-slate-500">Outcome</label>
                          <input
                            type="text"
                            value={projectForm.outcome}
                            onChange={(e) => setProjectForm(prev => ({ ...prev, outcome: e.target.value }))}
                            placeholder="e.g. 85% Efficiency verified"
                            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-brand-blue/50 focus:bg-white transition-colors"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-mono font-semibold uppercase text-slate-500">Detailed Report (markdown/text)</label>
                        <textarea
                          value={projectForm.details}
                          onChange={(e) => setProjectForm(prev => ({ ...prev, details: e.target.value }))}
                          placeholder="Comprehensive implementation details, testing configurations, and experimental outcomes..."
                          rows="6"
                          className="px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-brand-blue/50 focus:bg-white transition-colors resize-none"
                          required
                        />
                        <div className="text-[10px] text-slate-500 font-mono leading-relaxed mt-1 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                          <span className="font-bold text-slate-700 block mb-1">Markdown Formatting Reference:</span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
                            <div>• <code className="bg-slate-200/80 px-1 py-0.5 rounded text-slate-850 font-bold">### Heading</code> for subsections</div>
                            <div>• <code className="bg-slate-200/80 px-1 py-0.5 rounded text-slate-850 font-bold">**bold text**</code> for bolding</div>
                            <div>• <code className="bg-slate-200/80 px-1 py-0.5 rounded text-slate-850 font-bold">- Bullet point</code> (or <code className="bg-slate-200/80 px-1 py-0.5 rounded text-slate-850 font-bold">*</code>) for list item</div>
                            <div>• <code className="bg-slate-200/80 px-1 py-0.5 rounded text-slate-850 font-bold">1. Numbered list</code> for ordered list</div>
                            <div>• <code className="bg-slate-200/80 px-1 py-0.5 rounded text-slate-850 font-bold">![Caption](filename.jpg)</code> for inline images</div>
                            <div>• <code className="bg-slate-200/80 px-1 py-0.5 rounded text-slate-850 font-bold">[Link Text](url)</code> for links</div>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-3 justify-end pt-4 border-t border-slate-200/80">
                        <button
                          type="button"
                          onClick={resetForms}
                          className="px-4 py-2 bg-slate-100 text-slate-600 font-mono text-xs rounded-xl hover:bg-slate-200 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={actionLoading}
                          className="px-5 py-2 bg-brand-blue text-white font-bold font-mono text-xs rounded-xl hover:bg-brand-blue/90 transition-all shadow flex items-center gap-1.5"
                        >
                          {actionLoading ? "Writing..." : <><Check className="w-3.5 h-3.5" /> Save Record</>}
                        </button>
                      </div>
                    </form>
                  ) : (
                    /* Project List Grid */
                    <div className="space-y-4">
                      {projects.map((proj) => (
                        <div key={proj.id} className="p-4 bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl flex items-center justify-between gap-4">
                          <div>
                            <h4 className="text-sm font-bold text-slate-800">{proj.title}</h4>
                            <span className="text-[10px] text-brand-blue font-mono font-semibold">ID Key: {proj.id}</span>
                            <p className="text-xs text-slate-600 mt-1 line-clamp-1">{proj.desc}</p>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => populateEditForm("project", proj)}
                              title="Edit Record"
                              className="p-2 bg-white hover:bg-slate-100 text-brand-blue border border-slate-200 rounded-lg transition-all"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteItem("project", proj.id)}
                              title="Delete Record"
                              className="p-2 bg-red-50 hover:bg-red-100 text-red-650 border border-red-200 rounded-lg transition-all"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: RESUME & EDUCATION */}
              {activeTab === "resume" && (
                <div>
                  <div className="flex justify-between items-center border-b border-slate-200/80 pb-4 mb-6">
                    <h2 className="text-lg font-bold font-mono uppercase tracking-wider text-slate-800 flex items-center gap-2">
                      <Briefcase className="w-5 h-5 text-brand-blue" /> Resume & CV Items
                    </h2>
                    {!isAdding && !editingItem && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => { resetForms(); setIsAdding("experience"); }}
                          className="px-3 py-1.5 bg-brand-blue text-white font-bold font-mono text-[10px] rounded-lg flex items-center gap-1 hover:bg-brand-blue/90 hover:scale-105 transition-all"
                        >
                          <Plus className="w-3 h-3" /> Add Experience
                        </button>
                        <button
                          onClick={() => { resetForms(); setIsAdding("education"); }}
                          className="px-3 py-1.5 bg-slate-700 text-white font-bold font-mono text-[10px] rounded-lg flex items-center gap-1 hover:bg-slate-800 hover:scale-105 transition-all"
                        >
                          <Plus className="w-3 h-3" /> Add Education
                        </button>
                        <button
                          onClick={() => { resetForms(); setIsAdding("certificate"); }}
                          className="px-3 py-1.5 bg-green-50 text-green-700 font-bold font-mono text-[10px] border border-green-200 rounded-lg flex items-center gap-1 hover:bg-green-100 hover:scale-105 transition-all"
                        >
                          <Plus className="w-3 h-3" /> Add Cert
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Form templates */}
                  {isAdding === "experience" || (editingItem && editingItem.type === "experience") ? (
                    <form onSubmit={(e) => handleCreateOrUpdateItem(e, "experience")} className="space-y-4">
                      <h3 className="text-xs font-bold font-mono uppercase text-brand-blue">
                        {editingItem ? "Edit Experience Entry" : "New Experience Log"}
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-mono font-semibold uppercase text-slate-500">Role / Designation</label>
                          <input
                            type="text"
                            value={experienceForm.role}
                            onChange={(e) => setExperienceForm(prev => ({ ...prev, role: e.target.value }))}
                            placeholder="e.g. Silicon Layout Engineer"
                            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-brand-blue/50 focus:bg-white"
                            required
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-mono font-semibold uppercase text-slate-500">Company / Organization</label>
                          <input
                            type="text"
                            value={experienceForm.company}
                            onChange={(e) => setExperienceForm(prev => ({ ...prev, company: e.target.value }))}
                            placeholder="e.g. Ulkasemi"
                            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-brand-blue/50 focus:bg-white"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-mono font-semibold uppercase text-slate-500">Date Range</label>
                          <input
                            type="text"
                            value={experienceForm.date}
                            onChange={(e) => setExperienceForm(prev => ({ ...prev, date: e.target.value }))}
                            placeholder="e.g. Mar 2026 - Present"
                            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-brand-blue/50 focus:bg-white"
                            required
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-mono font-semibold uppercase text-slate-500">Category</label>
                          <select
                            value={experienceForm.category}
                            onChange={(e) => setExperienceForm(prev => ({ ...prev, category: e.target.value }))}
                            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-brand-blue/50 focus:bg-white font-mono"
                          >
                            <option value="work">Professional Work</option>
                            <option value="volunteering">Volunteering / Club Activity</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-mono font-semibold uppercase text-slate-500">Responsibility Bullets (One per line)</label>
                        <textarea
                          value={experienceForm.details}
                          onChange={(e) => setExperienceForm(prev => ({ ...prev, details: e.target.value }))}
                          placeholder="Represented campus events...&#10;Coordinated physical chip workshops..."
                          rows="4"
                          className="px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-brand-blue/50 focus:bg-white transition-colors resize-none font-mono"
                          required
                        />
                      </div>

                      <div className="flex gap-3 justify-end pt-4 border-t border-slate-200/80">
                        <button type="button" onClick={resetForms} className="px-4 py-2 bg-slate-100 text-slate-650 font-mono text-xs rounded-xl hover:bg-slate-200">Cancel</button>
                        <button type="submit" className="px-5 py-2 bg-brand-blue text-white font-bold font-mono text-xs rounded-xl hover:bg-brand-blue/90 shadow">Save</button>
                      </div>
                    </form>
                  ) : isAdding === "education" || (editingItem && editingItem.type === "education") ? (
                    <form onSubmit={(e) => handleCreateOrUpdateItem(e, "education")} className="space-y-4">
                      <h3 className="text-xs font-bold font-mono uppercase text-brand-blue">
                        {editingItem ? "Edit Education Entry" : "New Academic Document"}
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-mono font-semibold uppercase text-slate-500">Degree / Diploma</label>
                          <input
                            type="text"
                            value={educationForm.degree}
                            onChange={(e) => setEducationForm(prev => ({ ...prev, degree: e.target.value }))}
                            placeholder="Degree details"
                            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-brand-blue/50 focus:bg-white"
                            required
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-mono font-semibold uppercase text-slate-500">Institution</label>
                          <input
                            type="text"
                            value={educationForm.institution}
                            onChange={(e) => setEducationForm(prev => ({ ...prev, institution: e.target.value }))}
                            placeholder="School/University"
                            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-brand-blue/50 focus:bg-white"
                            required
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-mono font-semibold uppercase text-slate-500">Timeframe Date</label>
                        <input
                          type="text"
                          value={educationForm.date}
                          onChange={(e) => setEducationForm(prev => ({ ...prev, date: e.target.value }))}
                          placeholder="e.g. 2022 - Present"
                          className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-brand-blue/50 focus:bg-white"
                          required
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-mono font-semibold uppercase text-slate-500">Additional Details (GPA, Key Focus Areas)</label>
                        <input
                          type="text"
                          value={educationForm.details}
                          onChange={(e) => setEducationForm(prev => ({ ...prev, details: e.target.value }))}
                          placeholder="CGPA: 3.92 / 4.00. Focus areas include..."
                          className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-brand-blue/50 focus:bg-white"
                          required
                        />
                      </div>

                      <div className="flex gap-3 justify-end pt-4 border-t border-slate-200/80">
                        <button type="button" onClick={resetForms} className="px-4 py-2 bg-slate-100 text-slate-655 font-mono text-xs rounded-xl hover:bg-slate-200">Cancel</button>
                        <button type="submit" className="px-5 py-2 bg-brand-blue text-white font-bold font-mono text-xs rounded-xl hover:bg-brand-blue/90 shadow">Save</button>
                      </div>
                    </form>
                  ) : isAdding === "certificate" || (editingItem && editingItem.type === "certificate") ? (
                    <form onSubmit={(e) => handleCreateOrUpdateItem(e, "certificate")} className="space-y-4">
                      <h3 className="text-xs font-bold font-mono uppercase text-brand-blue">
                        {editingItem ? "Edit Certificate Item" : "New Certificate Record"}
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-mono font-semibold uppercase text-slate-500">Title</label>
                          <input
                            type="text"
                            value={certificateForm.title}
                            onChange={(e) => setCertificateForm(prev => ({ ...prev, title: e.target.value }))}
                            placeholder="e.g. Certified Python"
                            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-brand-blue/50 focus:bg-white"
                            required
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-mono font-semibold uppercase text-slate-500">Issuer Agency</label>
                          <input
                            type="text"
                            value={certificateForm.issuer}
                            onChange={(e) => setCertificateForm(prev => ({ ...prev, issuer: e.target.value }))}
                            placeholder="e.g. HackerRank"
                            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-brand-blue/50 focus:bg-white"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-mono font-semibold uppercase text-slate-500">Date Issued</label>
                          <input
                            type="text"
                            value={certificateForm.date}
                            onChange={(e) => setCertificateForm(prev => ({ ...prev, date: e.target.value }))}
                            placeholder="e.g. Dec 2017"
                            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-brand-blue/50 focus:bg-white"
                            required
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-mono font-semibold uppercase text-slate-500">Description</label>
                          <input
                            type="text"
                            value={certificateForm.description}
                            onChange={(e) => setCertificateForm(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Focus of verification..."
                            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-brand-blue/50 focus:bg-white"
                            required
                          />
                        </div>
                      </div>

                      <div className="flex gap-3 justify-end pt-4 border-t border-slate-200/80">
                        <button type="button" onClick={resetForms} className="px-4 py-2 bg-slate-100 text-slate-655 font-mono text-xs rounded-xl hover:bg-slate-200">Cancel</button>
                        <button type="submit" className="px-5 py-2 bg-brand-blue text-white font-bold font-mono text-xs rounded-xl hover:bg-brand-blue/90 shadow">Save</button>
                      </div>
                    </form>
                  ) : (
                    /* LIST ALL RESUME ITEMS */
                    <div className="space-y-8">
                      {/* Section A: Experience */}
                      <div>
                        <h3 className="text-xs font-bold font-mono uppercase text-brand-blue tracking-wider border-b border-slate-200/80 pb-2 mb-3">
                          Experiences
                        </h3>
                        <div className="space-y-2">
                          {experience.map(exp => (
                            <div key={exp.id} className="p-3 bg-slate-50 border border-slate-200/80 rounded-lg flex items-center justify-between gap-4">
                              <div>
                                <h4 className="text-xs font-bold text-slate-800">{exp.role} @ {exp.company}</h4>
                                <span className="text-[9px] text-slate-500 font-mono">{exp.date} | <code className="text-green-700 font-semibold">{exp.category}</code></span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <button onClick={() => populateEditForm("experience", exp)} className="p-1.5 text-brand-blue hover:bg-slate-100 rounded"><Pencil className="w-3.5 h-3.5" /></button>
                                <button onClick={() => handleDeleteItem("experience", exp.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-3.5 h-3.5" /></button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Section B: Education */}
                      <div>
                        <h3 className="text-xs font-bold font-mono uppercase text-brand-blue tracking-wider border-b border-slate-200/80 pb-2 mb-3">
                          Academic records
                        </h3>
                        <div className="space-y-2">
                          {education.map(edu => (
                            <div key={edu.id} className="p-3 bg-slate-50 border border-slate-200/80 rounded-lg flex items-center justify-between gap-4">
                              <div>
                                <h4 className="text-xs font-bold text-slate-800">{edu.degree}</h4>
                                <span className="text-[9px] text-slate-500 font-mono">{edu.institution} | {edu.date}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <button onClick={() => populateEditForm("education", edu)} className="p-1.5 text-brand-blue hover:bg-slate-100 rounded"><Pencil className="w-3.5 h-3.5" /></button>
                                <button onClick={() => handleDeleteItem("education", edu.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-3.5 h-3.5" /></button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Section C: Certificates */}
                      <div>
                        <h3 className="text-xs font-bold font-mono uppercase text-green-700 tracking-wider border-b border-slate-200/80 pb-2 mb-3">
                          Certificates & Credentials
                        </h3>
                        <div className="space-y-2">
                          {certificates.map(cert => (
                            <div key={cert.id} className="p-3 bg-slate-50 border border-slate-200/80 rounded-lg flex items-center justify-between gap-4">
                              <div>
                                <h4 className="text-xs font-bold text-slate-800">{cert.title}</h4>
                                <span className="text-[9px] text-slate-500 font-mono">{cert.issuer} | {cert.date}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <button onClick={() => populateEditForm("certificate", cert)} className="p-1.5 text-brand-blue hover:bg-slate-100 rounded"><Pencil className="w-3.5 h-3.5" /></button>
                                <button onClick={() => handleDeleteItem("certificate", cert.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-3.5 h-3.5" /></button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: ACTIVITIES TRACKER */}
              {activeTab === "activities" && (
                <div>
                  <div className="flex justify-between items-center border-b border-slate-200/80 pb-4 mb-6">
                    <h2 className="text-lg font-bold font-mono uppercase tracking-wider text-slate-800 flex items-center gap-2">
                      <FlameKindling className="w-5 h-5 text-brand-blue" /> Recent Activities
                    </h2>
                    {!isAdding && !editingItem && (
                      <button
                        onClick={() => { resetForms(); setIsAdding(true); }}
                        className="px-4 py-2 bg-brand-blue text-white font-bold font-mono text-xs rounded-xl flex items-center gap-1 transition-all hover:scale-105 hover:bg-brand-blue/90 shadow"
                      >
                        <Plus className="w-3.5 h-3.5" /> Log Activity
                      </button>
                    )}
                  </div>

                  {isAdding || editingItem ? (
                    <form onSubmit={(e) => handleCreateOrUpdateItem(e, "activity")} className="space-y-4">
                      <h3 className="text-xs font-bold font-mono uppercase text-brand-blue">
                        {editingItem ? "Edit Activity Log" : "New Recent Activity"}
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-mono font-semibold uppercase text-slate-500">Activity Title</label>
                          <input
                            type="text"
                            value={activityForm.title}
                            onChange={(e) => setActivityForm(prev => ({ ...prev, title: e.target.value }))}
                            placeholder="Title of event/activity"
                            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-brand-blue/50 focus:bg-white transition-colors"
                            required
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-mono font-semibold uppercase text-slate-500">Timeframe Date</label>
                          <input
                            type="text"
                            value={activityForm.date}
                            onChange={(e) => setActivityForm(prev => ({ ...prev, date: e.target.value }))}
                            placeholder="e.g. April 2026"
                            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-brand-blue/50 focus:bg-white transition-colors"
                            required
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-mono font-semibold uppercase text-slate-500">Summary description</label>
                        <input
                          type="text"
                          value={activityForm.desc}
                          onChange={(e) => setActivityForm(prev => ({ ...prev, desc: e.target.value }))}
                          placeholder="Short summary of accomplishment..."
                          className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-brand-blue/50 focus:bg-white transition-colors"
                          required
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-mono font-semibold uppercase text-slate-500">Attached Image Filename (Saved in public/activity/)</label>
                        <input
                          type="text"
                          value={activityForm.image}
                          onChange={(e) => setActivityForm(prev => ({ ...prev, image: e.target.value }))}
                          placeholder="e.g. ca_ulkasemi.png (leave empty if none)"
                          className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-brand-blue/50 focus:bg-white font-mono transition-colors"
                        />
                      </div>

                      <div className="flex gap-3 justify-end pt-4 border-t border-slate-200/80">
                        <button type="button" onClick={resetForms} className="px-4 py-2 bg-slate-100 text-slate-600 font-mono text-xs rounded-xl hover:bg-slate-200 transition-colors">Cancel</button>
                        <button type="submit" disabled={actionLoading} className="px-5 py-2 bg-brand-blue text-white font-bold font-mono text-xs rounded-xl hover:bg-brand-blue/90 transition-all shadow flex items-center gap-1.5">
                          {actionLoading ? "Writing..." : <><Check className="w-3.5 h-3.5" /> Save Record</>}
                        </button>
                      </div>
                    </form>
                  ) : (
                    /* LIST OF ACTIVITIES */
                    <div className="space-y-4">
                      {activities.map((act) => (
                        <div key={act.id} className="p-4 bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl flex items-center justify-between gap-4">
                          <div>
                            <h4 className="text-sm font-bold text-slate-800">{act.title}</h4>
                            <span className="text-[10px] text-slate-500 font-mono">{act.date} {act.image && `| File: ${act.image}`}</span>
                            <p className="text-xs text-slate-600 mt-1">{act.desc}</p>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setEditingItem({ type: "activity", data: act });
                                setActivityForm({
                                  title: act.title || "",
                                  desc: act.desc || "",
                                  date: act.date || "",
                                  image: act.image || ""
                                });
                              }}
                              className="p-2 bg-white hover:bg-slate-100 text-brand-blue border border-slate-200 rounded-lg transition-all"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteItem("activity", act.id)}
                              className="p-2 bg-red-50 hover:bg-red-100 text-red-650 border border-red-200 rounded-lg transition-all"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 5: SYSTEM & DATABASE SETTINGS */}
              {activeTab === "settings" && (
                <div className="space-y-6">
                  <div className="border-b border-slate-200/80 pb-4">
                    <h2 className="text-lg font-bold font-mono uppercase tracking-wider text-slate-800 flex items-center gap-2">
                      <Database className="w-5 h-5 text-brand-blue" /> Cloud Config & Sync
                    </h2>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                    <h3 className="text-sm font-bold text-slate-800 font-mono uppercase">Firestore Seed Controller</h3>
                    <p className="text-xs text-slate-650 leading-relaxed">
                      If you've just initialized a fresh Cloud Firestore node in the Firebase Console, you can push the complete set of baseline EEE/VLSI portfolio documents (baseline projects, experiences, certifications) with one click.
                    </p>

                    <div className="flex items-center gap-3 pt-2">
                      <button
                        onClick={handleSeedDatabase}
                        disabled={actionLoading}
                        className={`px-5 py-3 rounded-xl font-mono text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
                          actionLoading || !isFirebaseSupported
                            ? "bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed"
                            : "bg-brand-blue text-white hover:bg-brand-blue/90 cursor-pointer shadow hover:shadow-md"
                        }`}
                      >
                        <RefreshCw className={`w-4 h-4 ${actionLoading ? "animate-spin" : ""}`} />
                        Seed Cloud Firestore
                      </button>
                      {!isFirebaseSupported && (
                        <span className="text-[10px] text-red-650 font-mono font-semibold">
                          (Disabled: Firebase connection inactive)
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 font-mono text-xs text-slate-600">
                    <h3 className="text-xs font-bold text-slate-800 uppercase flex items-center gap-2">
                      <Settings className="w-4 h-4 text-brand-blue" /> Diagnostics Info
                    </h3>
                    <ul className="space-y-1.5 pl-2 list-disc">
                      <li>Environment Integration: <span className={isFirebaseSupported ? "text-green-700 font-bold" : "text-amber-600 font-bold"}>{isFirebaseSupported ? "Cloud (Firebase)" : "Offline (Local Storage)"}</span></li>
                      <li>Authorized Administrator: <span className="text-brand-blue font-bold">{ADMIN_EMAIL}</span></li>
                      <li>Current User Session: <span className="text-slate-800 font-semibold">{currentUser ? currentUser.email : "none"}</span></li>
                      <li>Local Storage Key Cache: <span className="text-slate-500">portfolio_projects, portfolio_experience, portfolio_guestbook</span></li>
                    </ul>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
