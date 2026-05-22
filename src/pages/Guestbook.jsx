import { useState, useEffect } from "react";
import { 
  fetchGuestbookMessages, 
  postGuestbookMessage 
} from "../firebase/db";
import { 
  auth, 
  isFirebaseSupported, 
  googleProvider, 
  githubProvider 
} from "../firebase/config";
import { 
  signInAnonymously, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged 
} from "firebase/auth";
import CircuitBg from "../components/CircuitBg";
import { MessageSquare, Send, LogIn, LogOut, ShieldAlert, User } from "lucide-react";
import { motion } from "framer-motion";

export default function Guestbook() {
  const [messages, setMessages] = useState([]);
  const [commentContent, setCommentContent] = useState("");
  const [visitorName, setVisitorName] = useState(""); // For anonymous fallback
  const [currentUser, setCurrentUser] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Monitor auth state if Firebase is supported
  useEffect(() => {
    if (!isFirebaseSupported) return;

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });

    return () => unsubscribe();
  }, []);

  // Fetch comments
  const loadMessages = async () => {
    try {
      const gbMessages = await fetchGuestbookMessages();
      setMessages(gbMessages || []);
    } catch (err) {
      console.error("Error loading guestbook:", err);
    }
  };

  useEffect(() => {
    loadMessages();
  }, []);

  // Handle Authentication triggers
  const handleGoogleSignIn = async () => {
    if (!isFirebaseSupported) return;
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error("Google Auth failed:", err);
    }
  };

  const handleGitHubSignIn = async () => {
    if (!isFirebaseSupported) return;
    try {
      await signInWithPopup(auth, githubProvider);
    } catch (err) {
      console.error("GitHub Auth failed:", err);
    }
  };

  const handleAnonymousSignIn = async () => {
    if (!isFirebaseSupported) return;
    try {
      await signInAnonymously(auth);
    } catch (err) {
      console.error("Anonymous Sign-in failed:", err);
    }
  };

  const handleSignOut = async () => {
    if (!isFirebaseSupported) return;
    try {
      await signOut(auth);
      setCurrentUser(null);
    } catch (err) {
      console.error("Sign-out failed:", err);
    }
  };

  // Submit comment
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentContent.trim()) return;

    let authorName;
    if (isFirebaseSupported && currentUser) {
      authorName = currentUser.displayName || currentUser.email || "Anonymous User";
    } else {
      // Local fallback requires entering a name
      if (!visitorName.trim()) {
        alert("Please enter your name/nickname.");
        return;
      }
      authorName = visitorName.trim();
    }

    setIsSubmitting(true);
    try {
      await postGuestbookMessage(authorName, commentContent.trim());
      setCommentContent("");
      // Reload comments
      await loadMessages();
    } catch (err) {
      console.error("Error posting message:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#0b0f19] text-gray-100 z-10">
      <CircuitBg />

      <div className="container mx-auto px-6 pt-24 pb-20 max-w-3xl relative z-10">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-white flex items-center justify-center gap-2">
            <MessageSquare className="w-8 h-8 text-brand-cyan" />
            Visitor Guestbook
          </h1>
          <p className="text-xs text-gray-400 font-mono mt-1 leading-relaxed">
            Leave a note, feedback, or say hello! Log in or use the local nickname option.
          </p>
          <div className="h-1 w-12 bg-brand-cyan mx-auto mt-3 rounded"></div>
        </div>

        {/* Auth / Nickname Form block */}
        <div className="glass-card p-6 rounded-2xl border border-white/5 mb-8">
          {isFirebaseSupported ? (
            currentUser ? (
              // Authenticated user form
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-full bg-brand-cyan/15 flex items-center justify-center text-brand-cyan">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs text-gray-400 font-mono block">Logged in as:</span>
                      <span className="text-sm font-bold text-white font-mono">
                        {currentUser.displayName || currentUser.email || "Anonymous User"}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-1 text-[10px] font-mono font-semibold text-red-400 hover:text-red-300 border border-red-500/10 hover:border-red-500/30 px-3 py-1.5 rounded-lg transition-all"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Sign Out
                  </button>
                </div>

                <form onSubmit={handleCommentSubmit} className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-mono text-gray-400 uppercase font-semibold">Your Comment</label>
                    <textarea
                      value={commentContent}
                      onChange={(e) => setCommentContent(e.target.value)}
                      placeholder="Write your note here..."
                      rows="3"
                      className="px-4 py-2.5 rounded-xl bg-slate-950 border border-white/5 text-sm text-gray-200 focus:outline-none focus:border-brand-cyan/50 font-mono transition-colors resize-none"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="self-end px-5 py-2.5 bg-brand-cyan hover:bg-brand-cyan/95 text-gray-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" /> {isSubmitting ? "Posting..." : "Post Message"}
                  </button>
                </form>
              </div>
            ) : (
              // Authentication prompts
              <div className="text-center py-4">
                <p className="text-xs text-gray-300 font-mono mb-4">Please log in to write a comment on the database guestbook:</p>
                <div className="flex flex-wrap justify-center gap-3">
                  <button
                    onClick={handleGoogleSignIn}
                    className="px-4 py-2 bg-slate-900 border border-white/10 hover:border-white/20 rounded-xl text-xs font-mono text-gray-200 transition-all flex items-center gap-2"
                  >
                    <i className="fab fa-google text-red-500"></i> Google Login
                  </button>
                  <button
                    onClick={handleGitHubSignIn}
                    className="px-4 py-2 bg-slate-900 border border-white/10 hover:border-white/20 rounded-xl text-xs font-mono text-gray-200 transition-all flex items-center gap-2"
                  >
                    <i className="fab fa-github"></i> GitHub Login
                  </button>
                  <button
                    onClick={handleAnonymousSignIn}
                    className="px-4 py-2 bg-slate-800/80 border border-white/5 hover:border-brand-cyan/20 rounded-xl text-xs font-mono text-gray-300 transition-all flex items-center gap-2"
                  >
                    <LogIn className="w-3.5 h-3.5 text-brand-cyan" /> Anonymous Login
                  </button>
                </div>
              </div>
            )
          ) : (
            // Local fallback form (No login needed, just type name)
            <div className="flex flex-col gap-4 font-mono">
              <div className="flex items-start gap-2 bg-slate-950/60 p-3 rounded-lg border border-white/5 text-[10px] text-gray-400 leading-relaxed">
                <ShieldAlert className="w-4 h-4 text-brand-cyan shrink-0 mt-0.5" />
                <p>
                  Firebase integration is running in offline mode. Comments will be saved to your browser's local storage and visible only on your machine.
                </p>
              </div>

              <form onSubmit={handleCommentSubmit} className="flex flex-col gap-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-1 flex flex-col gap-1.5">
                    <label className="text-[10px] text-gray-400 uppercase font-semibold">Nickname</label>
                    <input
                      type="text"
                      value={visitorName}
                      onChange={(e) => setVisitorName(e.target.value)}
                      placeholder="e.g. John"
                      className="px-3 py-2 rounded-xl bg-slate-950 border border-white/5 text-xs text-gray-200 focus:outline-none focus:border-brand-cyan/50"
                      required
                    />
                  </div>
                  <div className="sm:col-span-2 flex flex-col gap-1.5">
                    <label className="text-[10px] text-gray-400 uppercase font-semibold">Comment</label>
                    <input
                      type="text"
                      value={commentContent}
                      onChange={(e) => setCommentContent(e.target.value)}
                      placeholder="Write your note..."
                      className="px-3 py-2 rounded-xl bg-slate-950 border border-white/5 text-xs text-gray-200 focus:outline-none focus:border-brand-cyan/50"
                      required
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="self-end px-5 py-2 bg-brand-cyan hover:bg-brand-cyan/95 text-gray-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" /> {isSubmitting ? "Saving..." : "Save Note"}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Comments List */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-gray-400 font-mono uppercase tracking-wider mb-2 border-b border-white/5 pb-2">
            Visitor Board Logs
          </h3>

          {messages.length > 0 ? (
            messages.map((msg) => (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={msg.id}
                className="p-4 bg-[#0e1423]/70 backdrop-blur-md border border-white/5 rounded-2xl flex flex-col gap-2"
              >
                <div className="flex justify-between items-center border-b border-white/5 pb-1 text-[10px] font-mono text-gray-500">
                  <span className="font-bold text-brand-cyan">{msg.name}</span>
                  <span>{new Date(msg.date).toLocaleDateString()} at {new Date(msg.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <p className="text-sm text-gray-300 font-normal leading-relaxed">{msg.content}</p>
              </motion.div>
            ))
          ) : (
            <p className="text-center text-gray-500 font-mono text-xs py-8">
              No comments have been posted yet. Be the first!
            </p>
          )}
        </div>
      </div>

      {/* FOOTER */}
      <footer className="relative py-8 z-10 border-t border-white/5 bg-slate-950/80">
        <div className="container mx-auto px-6 text-center text-xs text-gray-500 font-mono leading-relaxed">
          <p>&copy; {new Date().getFullYear()} ⚡ Md. Rashedul Islam Emon. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
