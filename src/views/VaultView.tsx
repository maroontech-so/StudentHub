import React, { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { auth, rtdb } from "../lib/firebase";
import { VaultPost } from "../types";
import { ref, set, push, onValue, get, runTransaction as runRtdbTransaction } from "firebase/database";
import { Lock, Flame, Heart, Sparkles, MessageSquare, X, Check, ShieldCheck, Info, HelpCircle } from "lucide-react";

export function VaultView() {
  const [posts, setPosts] = useState<VaultPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Unified inline form inputs for ease of use
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [supportsMap, setSupportsMap] = useState<Record<string, boolean>>({});

  const [, setLocation] = useLocation();

  useEffect(() => {
    const handleGlobalSearch = (e: any) => {
      const customEvent = e as unknown as CustomEvent<string>;
      setSearchTerm(customEvent.detail || "");
    };
    window.addEventListener("global-search", handleGlobalSearch as EventListener);
    return () => window.removeEventListener("global-search", handleGlobalSearch as EventListener);
  }, []);

  const filteredPosts = posts.filter(p => {
    if (!searchTerm.trim()) return true;
    const s = searchTerm.toLowerCase();
    return p.title?.toLowerCase().includes(s) || p.content?.toLowerCase().includes(s);
  });

  useEffect(() => {
    setLoading(true);
    const vaultRef = ref(rtdb, "vault");

    const unsubscribe = onValue(vaultRef, (snap) => {
      const data = snap.val() || {};
      const listed: VaultPost[] = Object.entries(data).map(([id, val]: any) => ({
        id,
        ...val
      })).sort((a, b) => b.timestamp - a.timestamp); // newest top

      setPosts(listed);
      setLoading(false);
    }, (err) => {
      console.error("RTDB error reading Vault posts:", err);
      setLoading(false);
    });

    return () => {
      // Clean up Realtime Database observers
    };
  }, []);

  const handleSubmitPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setSubmitLoading(true);
    try {
      const randomId = Math.random().toString(36).substring(2, 8).toUpperCase();
      const vaultRef = ref(rtdb, "vault");
      const newPostRef = push(vaultRef);

      // Dynamically derive a title if the user didn't write one
      const finalTitle = title.trim() || content.trim().slice(0, 45) + (content.trim().length > 45 ? "..." : "");

      const payload: VaultPost & { status?: string, adminResponse?: string } = {
        id: newPostRef.key || "",
        title: finalTitle,
        content: content.trim(),
        anonymousId: `COMRADE_${randomId}`,
        timestamp: Date.now(),
        supportCount: 0,
        authorName: "Anonymous Comrade"
      };

      await set(newPostRef, payload);

      setTitle("");
      setContent("");
    } catch (err) {
      console.error("Error submitting Vault bulletin:", err);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleSupport = async (postId: string) => {
    if (!auth.currentUser) {
      setLocation("/auth");
      return;
    }

    const userId = auth.currentUser.uid;
    const supportKey = `vaultSupports/${postId}/${userId}`;
    const userSupportRef = ref(rtdb, supportKey);

    try {
      const supportSnap = await get(userSupportRef);
      const postSupportCountRef = ref(rtdb, `vault/${postId}/supportCount`);

      if (supportSnap.exists()) {
        // Unsupport (decrement and remove)
        await set(userSupportRef, null);
        await runRtdbTransaction(postSupportCountRef, (current) => {
          return Math.max(0, (current || 0) - 1);
        });
        setSupportsMap(prev => ({ ...prev, [postId]: false }));
      } else {
        // Support (increment and write)
        await set(userSupportRef, true);
        await runRtdbTransaction(postSupportCountRef, (current) => {
          return (current || 0) + 1;
        });
        setSupportsMap(prev => ({ ...prev, [postId]: true }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8 pt-6 pb-32 sm:pt-8 sm:pb-40 text-left w-full px-2 sm:px-6 select-none">
      
      {/* 1. ELEGANT CLASSIC HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-gavel-border/30">
        <div>
          <span className="text-[10px] text-gavel-purple font-mono uppercase tracking-widest font-bold flex items-center gap-1">
            <Lock size={12} className="text-gavel-purple shrink-0" /> Secure Peer Feedback Box
          </span>
          <h1 className="text-3xl font-black tracking-tight text-white dark:text-white uppercase font-sans mt-1">
            The Student Vault
          </h1>
          <p className="text-gavel-muted text-xs font-mono uppercase tracking-wider mt-1">
            ANONYMOUS COMMUNIQUE DESK SECURE CHANNEL ARCHIVES
          </p>
        </div>
      </div>

      {/* 3. SUGGESTIONS LISTING FLOW */}
      <section className="space-y-6">
        <div className="flex justify-between items-center pb-2 border-b border-gavel-border/50">
          <span className="text-[10px] font-mono font-bold text-gavel-muted uppercase tracking-widest flex items-center gap-1.5">
            <Flame size={12} className="text-gavel-purple" /> Living Slips stream
          </span>
          <span className="text-[10px] font-mono text-gavel-muted">{filteredPosts.length} Notes Cataloged</span>
        </div>

        {loading ? (
          /* MODERN SKELETON GRAPHIC LOADING EFFECTS */
          <div className="space-y-4">
            {[1, 2, 3].map((num) => (
              <div key={num} className="p-5 rounded-2xl border border-gavel-border bg-white/[0.01] animate-pulse h-36 flex flex-col justify-between">
                <div className="space-y-2.5">
                  <div className="h-3.5 bg-white/10 rounded w-1/4"></div>
                  <div className="h-3 bg-white/5 rounded w-3/4"></div>
                  <div className="h-3 bg-white/5 rounded w-1/2"></div>
                </div>
                <div className="h-7 bg-white/5 rounded w-1/5 mt-4"></div>
              </div>
            ))}
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="py-16 text-center border border-dashed border-gavel-border rounded-2xl max-w-sm mx-auto">
            <HelpCircle size={24} className="text-gavel-muted mx-auto mb-2.5 opacity-60" />
            <p className="text-gavel-muted text-xs font-mono uppercase tracking-widest font-bold">The Vault is Silent</p>
            <p className="text-xs text-gavel-muted mt-2">No suggestion matches the search or whispering is empty.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPosts.map(post => (
              <div key={post.id} className="premium-card rounded-2xl border border-gavel-border p-5 flex flex-col justify-between hover:border-gavel-purple/10 transition-all text-left bg-[#0c0c0e]">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-mono font-bold bg-white/5 border border-white/10 px-2.5 py-1 rounded text-gavel-purple uppercase leading-none">
                      {post.anonymousId || "anonymous"}
                    </span>
                    <div className="flex items-center gap-2">
                      {post.status && (
                        <span className={`text-[8px] font-mono px-2 py-0.5 rounded uppercase font-bold border ${
                          post.status === "Implemented" ? "bg-green-500/10 text-green-400 border-green-500/20" :
                          post.status === "Under Review" ? "bg-gavel-yellow/10 text-gavel-yellow border-gavel-yellow/20" :
                          post.status === "Pending Review" ? "bg-[#3b82f6]/10 text-[#3b82f6] border-[#3b82f6]/20" :
                          "bg-white/5 text-gavel-muted border-white/10"
                        }`}>
                          {post.status}
                        </span>
                      )}
                      <span className="text-[9px] font-mono text-gavel-muted">
                        {new Date(post.timestamp).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h3 className="font-extrabold text-[#ffffff] uppercase leading-tight text-xs tracking-tight">{post.title}</h3>
                    <p className="text-gavel-muted text-xs leading-relaxed font-sans">{post.content}</p>
                  </div>

                  {post.adminResponse && (
                    <div className="p-3.5 rounded-xl border border-gavel-yellow/10 bg-gavel-yellow/[0.02] space-y-1 mt-3">
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-gavel-yellow animate-pulse"></span>
                        <span className="text-[8px] font-mono text-gavel-yellow uppercase font-black tracking-widest">OFFICIAL DESK RESPONSE:</span>
                      </div>
                      <p className="text-xs text-gavel-muted leading-relaxed italic font-sans font-medium">"{post.adminResponse}"</p>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3.5 border-t border-gavel-border/45 flex justify-between items-center text-[10px] font-mono text-gavel-muted uppercase font-bold select-none">
                  <span className="flex items-center gap-1 font-semibold text-[9px]"><MessageSquare size={12} /> Student Suggestion Slip</span>
                  <button
                    onClick={() => handleSupport(post.id)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border cursor-pointer text-[9px] transition-all duration-200 ${supportsMap[post.id] ? "bg-gavel-yellow/10 border-gavel-yellow text-gavel-yellow animate-pulse" : "border-gavel-border text-gavel-muted hover:text-white"}`}
                  >
                    <Heart size={11} className={supportsMap[post.id] ? "fill-gavel-yellow" : ""} /> Support ({post.supportCount || 0})
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  );
}
