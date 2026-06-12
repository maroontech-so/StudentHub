import React, { useState, useEffect } from "react";
import { fbfs, auth } from "../lib/firebase";
import { GalleryItem, GalleryAlbum } from "../types";
import { useAuth } from "../App";
import { uploadToImgBB } from "../lib/firebase";
import { Image as ImageIcon, Plus, Check, Compass, FolderClosed, Grid2X2, Sparkles, X, ChevronLeft, ChevronRight, Info } from "lucide-react";

interface LightboxOverlayProps {
  lightboxItem: GalleryItem;
  lightboxIndex: number;
  displayItems: GalleryItem[];
  albums: GalleryAlbum[];
  onNavigate: (direction: "next" | "prev") => void;
  onClose: () => void;
}

function LightboxOverlay({
  lightboxItem,
  lightboxIndex,
  displayItems,
  albums,
  onNavigate,
  onClose
}: LightboxOverlayProps) {
  const touchStartX = React.useRef(0);
  const touchEndX = React.useRef(0);

  // Keyboard navigation support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") onNavigate("next");
      if (e.key === "ArrowLeft") onNavigate("prev");
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onNavigate, onClose]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    touchEndX.current = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX.current;
    if (diff > 55) {
      onNavigate("next");
    } else if (diff < -55) {
      onNavigate("prev");
    }
  };

  const assignedAlb = albums.find(a => a.id === lightboxItem.albumId);

  return (
    <div 
      className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-black/98 backdrop-blur-xl transition-all duration-300"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Dynamic Swiper Top Header overlay bar */}
      <div className="w-full bg-black/40 border-b border-white/5 backdrop-blur-lg px-6 py-4 flex items-center justify-between z-[60] select-none text-left">
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono font-black text-gavel-yellow border border-gavel-yellow/20 px-2.5 py-1 rounded bg-black/50 uppercase tracking-widest">
            {lightboxItem.category || "Campus Photo"}
          </span>
          <span className="text-xs font-mono text-gray-400 font-bold">
            IMAGE {lightboxIndex + 1} OF {displayItems.length}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {displayItems.length > 1 && (
            <div className="flex bg-neutral-900 border border-white/10 rounded-xl p-0.5 mr-2">
              <button
                onClick={() => onNavigate("prev")}
                className="p-2 rounded-lg text-white hover:text-gavel-yellow transition-all cursor-pointer"
                title="Previous Photo (Left Arrow)"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => onNavigate("next")}
                className="p-2 rounded-lg text-white hover:text-gavel-yellow transition-all cursor-pointer"
                title="Next Photo (Right Arrow)"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
          <button
            onClick={onClose}
            className="p-2.5 rounded-xl bg-red-955/20 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-all duration-300 cursor-pointer shadow-lg"
            title="Dismiss full view (Esc)"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Main interactive visualization segment with double-edged trigger click */}
      <div className="w-full flex-1 flex items-center justify-center relative select-none overflow-hidden max-h-[75vh]">
        
        {/* Left 35% Click Target trigger */}
        <div 
          onClick={() => onNavigate("prev")} 
          className="absolute left-0 top-0 bottom-0 w-[35%] z-20 cursor-w-resize group flex items-center justify-start pl-8"
          title="Click to view previous"
        >
          <div className="p-3 bg-black/60 border border-white/10 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform -translate-x-4 group-hover:translate-x-0">
            <ChevronLeft size={24} />
          </div>
        </div>

        {/* Right 35% Click Target trigger */}
        <div 
          onClick={() => onNavigate("next")} 
          className="absolute right-0 top-0 bottom-0 w-[35%] z-20 cursor-e-resize group flex items-center justify-end pr-8"
          title="Click to view next"
        >
          <div className="p-3 bg-black/60 border border-white/10 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-x-4 group-hover:translate-x-0">
            <ChevronRight size={24} />
          </div>
        </div>

        {/* Heavy Image Showcase frame */}
        <div className="w-full max-w-4xl px-4 flex justify-center items-center relative z-10">
          <img
            src={lightboxItem.imageUrl}
            alt={lightboxItem.title}
            referrerPolicy="no-referrer"
            className="max-h-[73vh] w-auto max-w-full object-contain rounded-2xl border border-white/15 shadow-[0_25px_60px_rgba(0,0,0,0.85)] animate-scale-up"
          />
        </div>
      </div>

      {/* Scrollable details view card strictly supporting dynamic overflows */}
      <div className="w-full max-w-3xl px-4 pb-8 pt-4 z-10 select-text">
        <div className="bg-neutral-950/95 border border-white/10 rounded-[2rem] p-6 space-y-3.5 text-left shadow-2xl">
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            <span className="px-3 py-1 bg-neutral-900 border border-white/10 rounded-lg text-[9px] font-mono text-gavel-yellow uppercase font-black tracking-widest leading-none">
              {lightboxItem.category || "General Roll"}
            </span>
            <span className="text-[10px] font-mono text-gavel-muted uppercase tracking-wider font-semibold">
              INDEX TIMELINE: {lightboxItem.uploadedAt && new Date(lightboxItem.uploadedAt?.seconds ? lightboxItem.uploadedAt.seconds * 1000 : lightboxItem.uploadedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>

          <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight leading-snug">{lightboxItem.title}</h2>
          {lightboxItem.description && (
            <p className="text-gavel-muted text-xs sm:text-sm leading-relaxed whitespace-pre-wrap leading-relaxed pb-1 font-medium">{lightboxItem.description}</p>
          )}

          <div className="pt-3.5 border-t border-white/5 flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono text-gavel-muted uppercase font-bold">
            <span>By Operator: <strong className="text-white">{lightboxItem.uploaderName}</strong></span>
            {assignedAlb && (
              <span className="flex items-center gap-1">🏷️ Collection: <strong className="text-gavel-yellow px-1 py-0.5 rounded bg-gavel-yellow/15 border border-gavel-yellow/30">{assignedAlb.name}</strong></span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function GalleryView() {
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [albums, setAlbums] = useState<GalleryAlbum[]>([]);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"feed" | "albums">("feed");
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [albumsLoading, setAlbumsLoading] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  
  // Album Creation form states
  const [albumCreateOpen, setAlbumCreateOpen] = useState(false);
  const [albumName, setAlbumName] = useState("");
  const [albumDescription, setAlbumDescription] = useState("");
  const [albumTopic, setAlbumTopic] = useState("");
  const [albumLoading, setAlbumLoading] = useState(false);

  // Photo form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("campus");
  const [uploadAlbumId, setUploadAlbumId] = useState("");
  const [file, setFile] = useState<File | null>(null);

  // Lightbox & Scroll state
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const { profile } = useAuth();
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const triggerToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadPhotos = async () => {
    try {
      setLoading(true);
      const items = await fbfs.getCollection<GalleryItem>("gallery", [["visible", "==", true]], "uploadedAt", "desc");
      setGallery(items);
    } catch (err) {
      console.error("Error setting up student life gallery:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadAlbums = async () => {
    try {
      setAlbumsLoading(true);
      const items = await fbfs.getCollection<GalleryAlbum>("gallery_albums", [], "createdAt", "desc");
      setAlbums(items || []);
    } catch (err) {
      console.error("Error setting up albums stream:", err);
    } finally {
      setAlbumsLoading(false);
    }
  };

  useEffect(() => {
    loadPhotos();
    loadAlbums();
  }, []);

  const handleCreateAlbum = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser || profile?.role !== "admin") {
      triggerToast("Only authorized Admins can establish collection albums.", "error");
      return;
    }
    if (!albumName.trim() || !albumTopic.trim()) {
      triggerToast("Please supply the Album title & overarching Topic name.", "error");
      return;
    }

    setAlbumLoading(true);
    try {
      const payload: Partial<GalleryAlbum> = {
        name: albumName.trim(),
        description: albumDescription.trim(),
        topic: albumTopic.trim(),
        createdAt: new Date()
      };

      await fbfs.addDocInCollection("gallery_albums", payload);
      setAlbumCreateOpen(false);
      setAlbumName("");
      setAlbumDescription("");
      setAlbumTopic("");
      triggerToast(`Topic Album "${albumName}" cataloged successfully!`);
      await loadAlbums();
    } catch (err: any) {
      triggerToast(err.message || "Failed to catalog new Album topic", "error");
    } finally {
      setAlbumLoading(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) {
      triggerToast("Authenticate to publish imagery.", "error");
      return;
    }
    if (!file) {
      triggerToast("Please select a high resolution photograph to upload", "error");
      return;
    }

    setUploadLoading(true);

    try {
      // 1. Upload file object directly to ImgBB
      const cloudUrl = await uploadToImgBB(file);

      // 2. Save document payload to Firestore
      const payload: Partial<GalleryItem> = {
        title,
        description,
        imageUrl: cloudUrl,
        category,
        featured: false,
        visible: true,
        uploadedBy: auth.currentUser.uid,
        uploaderName: profile?.name || auth.currentUser.displayName || auth.currentUser.email?.split("@")[0] || "University Comrade",
        uploadedAt: new Date()
      };

      if (uploadAlbumId) {
        payload.albumId = uploadAlbumId;
      }

      await fbfs.addDocInCollection("gallery", payload);

      setUploadOpen(false);
      setTitle("");
      setDescription("");
      setUploadAlbumId("");
      setFile(null);
      
      triggerToast("Imagery added successfully to the public archives!");
      await loadPhotos();
    } catch (err: any) {
      triggerToast(err.message || "An error occurred during photograph sync", "error");
    } finally {
      setUploadLoading(false);
    }
  };

  // Filter photostream items
  const displayItems = React.useMemo(() => {
    let result = gallery;
    if (viewMode === "feed") {
      if (categoryFilter !== "all") {
        result = result.filter(item => item.category.toLowerCase() === categoryFilter.toLowerCase());
      }
    } else if (viewMode === "albums") {
      if (selectedAlbumId) {
        result = result.filter(item => item.albumId === selectedAlbumId);
      } else {
        return [];
      }
    }
    return result;
  }, [gallery, viewMode, categoryFilter, selectedAlbumId]);

  // Current open lightbox item helper
  const lightboxItem = lightboxIndex !== null ? displayItems[lightboxIndex] : null;

  const navigateLightbox = (direction: "next" | "prev") => {
    if (lightboxIndex === null || displayItems.length <= 1) return;
    if (direction === "next") {
      setLightboxIndex((lightboxIndex + 1) % displayItems.length);
    } else {
      setLightboxIndex((lightboxIndex - 1 + displayItems.length) % displayItems.length);
    }
  };

  return (
    <div className="space-y-8 pt-6 pb-32 sm:pt-8 sm:pb-40 text-left scroll-fade-in relative">
      {/* 1. ELEGANT CLASSIC HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-gavel-border/30">
        <div>
          <span className="text-[10px] text-gavel-yellow font-mono uppercase tracking-[0.2em] font-black block">
            COMRADE PHOTOSTUDIO
          </span>
        </div>
        
        {profile?.role === "admin" && (
          <div className="flex items-center gap-2 select-none w-full sm:w-auto">
            <button
              onClick={() => setAlbumCreateOpen(true)}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-white/10 hover:border-white/20 font-extrabold text-[10px] sm:text-xs font-mono uppercase tracking-widest transition-all duration-300 shadow-md flex items-center justify-center gap-2 cursor-pointer text-center text-white"
            >
              <FolderClosed size={14} /> Create Album
            </button>
            <button
              onClick={() => setUploadOpen(true)}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-gavel-yellow border border-gavel-yellow text-black hover:bg-[#FFDE00] font-extrabold text-[10px] sm:text-xs font-mono uppercase tracking-widest transition-all duration-300 shadow-md flex items-center justify-center gap-2 cursor-pointer text-center shrink-0 animate-pulse"
            >
              <Plus size={14} /> Add Imagery
            </button>
          </div>
        )}
      </div>

      {viewMode === "feed" ? (
        null
      ) : (
        selectedAlbumId && (
          <div className="pb-2">
            <button
              onClick={() => setSelectedAlbumId(null)}
              className="px-4 py-2 border border-gavel-border/50 text-gavel-muted hover:text-white rounded-xl text-xs font-mono font-bold uppercase transition-all flex items-center gap-2 cursor-pointer bg-[#0e0e0f]"
            >
              <ChevronLeft size={14} /> Back to Albums directory
            </button>
          </div>
        )
      )}

      {/* 3. ALBUMS LAYOUT PANEL */}
      {viewMode === "albums" && !selectedAlbumId && (
        <div className="space-y-6">
          {albumsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
              {[1, 2, 3].map(n => (
                <div key={n} className="h-44 bg-white/5 rounded-[2rem] border border-gavel-border"></div>
              ))}
            </div>
          ) : albums.length === 0 ? (
            <div className="py-20 text-center border border-dashed border-gavel-border rounded-[2rem] bg-gavel-card/40 max-w-sm mx-auto">
              <FolderClosed size={32} className="text-gavel-muted mx-auto opacity-50 mb-3" />
              <p className="text-gavel-muted text-xs font-mono uppercase tracking-widest font-bold">No topic albums yet</p>
              <p className="text-xs text-gavel-muted mt-2">The Operators have not classified any photos into structured topic albums.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {albums.map(album => {
                const albumPhotos = gallery.filter(item => item.albumId === album.id);
                const coverImage = albumPhotos.length > 0 ? albumPhotos[0].imageUrl : "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=800&auto=format&fit=crop";
                
                return (
                  <div
                    key={album.id}
                    onClick={() => setSelectedAlbumId(album.id)}
                    className="premium-card rounded-[2rem] border border-gavel-border/80 overflow-hidden cursor-pointer hover:border-gavel-yellow/40 hover-lift bg-gavel-card/60 flex flex-col justify-between group"
                  >
                    <div className="relative aspect-video w-full overflow-hidden border-b border-gavel-border/30">
                      <img
                        src={coverImage}
                        alt={album.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
                        loading="lazy"
                      />
                      <div className="absolute top-3 left-3 px-2.5 py-1 bg-black/75 backdrop-blur border border-white/5 rounded-lg text-[9px] font-mono text-gavel-yellow uppercase font-bold tracking-widest">
                        {album.topic}
                      </div>
                      <div className="absolute bottom-3 right-3 px-2 py-0.5 bg-black/80 rounded-md text-[9px] font-mono font-bold text-white uppercase">
                        {albumPhotos.length} Items
                      </div>
                    </div>

                    <div className="p-6 text-left space-y-2">
                      <h3 className="text-base font-black text-white uppercase tracking-tight group-hover:text-gavel-yellow transition-all duration-300">
                        {album.name}
                      </h3>
                      {album.description && (
                        <p className="text-gavel-muted text-xs leading-relaxed line-clamp-2">
                          {album.description}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 4. DRIPPING PEBBLE CORE PHOTOGRID (MANDATORY ON MOBILE AT LEAST 2 COLUMNS) */}
      {!(viewMode === "albums" && !selectedAlbumId) && (
        <>
          {viewMode === "albums" && selectedAlbumId && (
            <div className="relative overflow-hidden rounded-[2rem] border border-gavel-border/80 bg-gradient-to-br from-gavel-card/40 to-[#0e0e0f] p-8 md:p-10 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-2xl">
              {/* Decorative dynamic blurry light reflection */}
              <div className="absolute -right-16 -top-16 w-48 h-48 rounded-full blur-2xl bg-gavel-yellow/5 pointer-events-none"></div>

              {(() => {
                const currentAlb = albums.find(a => a.id === selectedAlbumId);
                return (
                  currentAlb && (
                    <div className="space-y-3 text-left max-w-2xl relative z-10">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="px-3 py-1 bg-gavel-yellow/15 border border-gavel-yellow/35 text-[10px] font-mono text-gavel-yellow uppercase font-black tracking-widest rounded-lg">
                          📁 COLLECTION: {currentAlb.topic}
                        </span>
                        <span className="text-[10px] font-mono text-gavel-muted font-bold tracking-wider">
                          {displayItems.length} PHOTO PORTFOLIOS CATALOGED
                        </span>
                      </div>
                      <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight leading-none pt-1">
                        {currentAlb.name}
                      </h2>
                      {currentAlb.description && (
                        <p className="text-gavel-muted text-xs md:text-sm font-medium leading-relaxed max-w-xl">
                          {currentAlb.description}
                        </p>
                      )}
                    </div>
                  )
                );
              })()}

              <button
                type="button"
                onClick={() => {
                  if (displayItems.length > 0) {
                    setLightboxIndex(0);
                  } else {
                    triggerToast("No photos in this collection to play.", "error");
                  }
                }}
                className="w-full md:w-auto px-6 py-3.5 bg-gavel-yellow border border-gavel-yellow hover:bg-[#FFDE00] text-black font-extrabold text-xs font-mono uppercase tracking-widest rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer shrink-0"
              >
                ⚡ Start Slideshow
              </button>
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(n => (
                <div key={n} className="p-4 rounded-3xl border border-gavel-border bg-white/[0.01] animate-pulse h-60 flex flex-col justify-end">
                  <div className="space-y-2">
                    <div className="h-3.5 bg-white/10 rounded w-1/2"></div>
                    <div className="h-3 bg-white/5 rounded w-3/4"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : displayItems.length === 0 ? (
            <div className="py-20 text-center border border-dashed border-gavel-border rounded-3xl bg-gavel-card/40 max-w-sm mx-auto w-full">
              <p className="text-gavel-muted text-xs font-mono uppercase tracking-widest font-bold">Section Silent</p>
              <p className="text-xs text-gavel-muted mt-2">No photographs recorded inside this gallery segment.</p>
            </div>
          ) : viewMode === "albums" && selectedAlbumId ? (
            /* --- SPECIAL COLLECTION MUSEUM EXHIBITION POLAROID STYLE GRID --- */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 py-4">
              {displayItems.map((item, idx) => {
                // Generate a deterministic slight tilt rotation and margin layout based on photo index to look scattered
                const tiltOptions = ["rotate-1", "-rotate-1", "rotate-2", "-rotate-[1.5deg]", "rotate-[1.2deg]", "rotate-0"];
                const tiltClass = tiltOptions[idx % tiltOptions.length];

                return (
                  <div
                    key={item.id}
                    onClick={() => setLightboxIndex(idx)}
                    className={`break-inside-avoid bg-[#fffdf5] border border-[#e5e0d5] p-4 pb-8 flex flex-col justify-between hover:scale-[1.015] hover:rotate-0 hover:border-gavel-yellow/50 group transition-all duration-300 relative shadow-[0_15px_30px_rgba(0,0,0,0.45)] cursor-zoom-in rounded-[4px] ${tiltClass}`}
                  >
                    {/* Shadow simulation */}
                    <div className="absolute inset-0 bg-neutral-900/5 pointer-events-none group-hover:opacity-0 transition-opacity"></div>
                    
                    <div className="relative aspect-square w-full overflow-hidden border border-[#d8d3c5] bg-neutral-950">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        referrerPolicy="no-referrer"
                        loading="lazy"
                        className="w-full h-full object-cover brightness-[0.96] contrast-[1.02]"
                      />
                      <span className="absolute bottom-2.5 right-2.5 px-2 py-0.5 bg-black/85 border border-[#FFDE00]/30 rounded text-[8px] font-mono text-[#FFDE00] uppercase font-black tracking-widest leading-none">
                        {item.category}
                      </span>
                    </div>

                    <div className="pt-5 text-center space-y-1">
                      <h3 className="text-sm font-semibold tracking-tight leading-snug line-clamp-1 italic text-neutral-800 font-serif font-bold uppercase block">
                        {item.title}
                      </h3>
                      <div className="flex items-center justify-center gap-1.5 text-[8.5px] font-mono text-neutral-500 uppercase font-extrabold tracking-wider mt-1 border-t border-neutral-200/65 pt-2">
                        <span>by {item.uploaderName}</span>
                        <span>•</span>
                        {item.uploadedAt && (
                          <span>
                            {new Date(item.uploadedAt?.seconds ? item.uploadedAt.seconds * 1000 : item.uploadedAt).toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                              year: "numeric"
                            })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* PROFESSIONAL ORGANIC MOSAIC GLASS GRID - MANDATORY COLUMNS-2 ON MOBILE WITH EXPLICIT IMAGE SIZES */
            <div className="columns-2 sm:columns-3 lg:columns-4 gap-4 space-y-4">
              {displayItems.map((item, idx) => (
                <div 
                  key={item.id} 
                  onClick={() => setLightboxIndex(idx)}
                  className="break-inside-avoid bg-[#09090a]/80 backdrop-blur-md rounded-2xl md:rounded-[2rem] border border-gavel-border p-3 flex flex-col justify-between hover:border-gavel-yellow/30 group transition-all duration-300 relative overflow-hidden cursor-zoom-in hover-lift"
                >
                  <div className="relative overflow-hidden rounded-xl md:rounded-[1.5rem] bg-black/60">
                    <img 
                      src={item.imageUrl} 
                      alt={item.title} 
                      referrerPolicy="no-referrer"
                      loading="lazy"
                      className="w-full h-auto object-cover brightness-[0.93] group-hover:scale-[1.015] transition-all duration-500" 
                    />
                    <span className="absolute top-2.5 left-2.5 px-2 py-0.5 bg-black/75 backdrop-blur border border-white/5 rounded-md text-[8px] font-mono text-gavel-yellow uppercase font-bold tracking-widest leading-none">
                      {item.category}
                    </span>
                  </div>

                  <div className="p-3 text-left space-y-1">
                    <h3 className="text-xs font-black text-white uppercase tracking-tight leading-snug group-hover:text-gavel-yellow transition-all duration-200 line-clamp-1">{item.title}</h3>
                    {item.description && (
                      <p className="text-[10px] text-gavel-muted leading-relaxed line-clamp-2 font-medium">{item.description}</p>
                    )}
                    <div className="pt-1.5 flex items-center justify-between text-[8px] font-mono text-gavel-muted uppercase">
                      <span className="truncate max-w-[70%]">by {item.uploaderName}</span>
                      {item.uploadedAt && (
                        <span>{new Date(item.uploadedAt?.seconds ? item.uploadedAt.seconds * 1000 : item.uploadedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* 5. MULTI-SCROLL FULLSCREEN INTERACTIVE LIGHTBOX */}
      {lightboxIndex !== null && lightboxItem && (
        <LightboxOverlay
          lightboxItem={lightboxItem}
          lightboxIndex={lightboxIndex}
          displayItems={displayItems}
          albums={albums}
          onNavigate={navigateLightbox}
          onClose={() => setLightboxIndex(null)}
        />
      )}

      {/* 6. MODAL POPUP: CREATE ALBUM */}
      {albumCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
          <div className="w-full max-w-md p-8 rounded-[2rem] premium-card backdrop-blur-3xl shadow-2xl relative border border-gavel-border text-left">
            <button
              onClick={() => setAlbumCreateOpen(false)}
              className="absolute top-6 right-6 p-2 rounded-xl text-gavel-muted hover:text-white hover:bg-white/5 transition-all text-sm cursor-pointer"
            >
              <X size={16} />
            </button>

            <div className="mb-6">
              <h2 className="text-xl font-black text-white uppercase tracking-tight">Create Archive Album</h2>
              <p className="text-gavel-muted text-xs font-mono tracking-wide uppercase mt-1">Classify visual arrays by academic topic</p>
            </div>

            <form onSubmit={handleCreateAlbum} className="space-y-4">
              <div>
                <label className="block text-[10px] font-mono text-gavel-muted uppercase tracking-wider mb-1.5 font-bold">
                  Album Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Moot Court Finals 2026"
                  value={albumName}
                  onChange={(e) => setAlbumName(e.target.value)}
                  className="w-full bg-[#111112] border border-gavel-border rounded-xl px-4 py-3 text-sm text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-gavel-muted uppercase tracking-wider mb-1.5 font-bold">
                  Topic / Subheading
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Trial Advocacy"
                  value={albumTopic}
                  onChange={(e) => setAlbumTopic(e.target.value)}
                  className="w-full bg-[#111112] border border-gavel-border rounded-xl px-4 py-3 text-sm text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-gavel-muted uppercase tracking-wider mb-1.5 font-bold">
                  Description
                </label>
                <textarea
                  placeholder="Provide context about what students are pictured..."
                  value={albumDescription}
                  onChange={(e) => setAlbumDescription(e.target.value)}
                  className="w-full bg-[#111112] border border-gavel-border rounded-xl px-4 py-3 text-sm text-white focus:outline-none h-24 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={albumLoading}
                className="w-full bg-gavel-yellow hover:bg-[#FFDE00] text-black font-semibold text-xs py-3.5 px-4 rounded-xl uppercase tracking-widest transition-all duration-300 mt-4 cursor-pointer font-bold"
              >
                {albumLoading ? "Establishing Album..." : "Establish Topic Album"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 7. MODAL POPUP: CONTRIBUTE IMAGE */}
      {uploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg p-8 rounded-[2rem] premium-card backdrop-blur-3xl shadow-2xl relative border border-gavel-border text-left">
            <button
              onClick={() => setUploadOpen(false)}
              className="absolute top-6 right-6 p-2 rounded-xl text-gavel-muted hover:text-white hover:bg-white/5 transition-all text-sm cursor-pointer"
            >
              <X size={16} />
            </button>

            <div className="mb-6">
              <h2 className="text-xl font-black text-white uppercase tracking-tight">Post Campus Image</h2>
              <p className="text-gavel-muted text-xs font-mono tracking-wide uppercase mt-1">Append a photo to the students shared log</p>
            </div>

            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-[10px] font-mono text-gavel-muted uppercase tracking-wider mb-1.5 font-bold">
                  Image Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MKU Law Moot Selection Finalists"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#111112] border border-gavel-border rounded-xl px-4 py-3 text-sm text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-gavel-muted uppercase tracking-wider mb-1.5 font-bold">
                  Brief Story description
                </label>
                <textarea
                  placeholder="Outline who is pictured, the legal topic discussed or the date..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[#111112] border border-gavel-border rounded-xl px-4 py-3 text-sm text-white focus:outline-none h-24 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono text-gavel-muted uppercase tracking-wider mb-1.5 font-bold">
                    Category Classification
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-[#111112] border border-gavel-border rounded-xl px-4 py-3 text-xs text-white uppercase font-mono tracking-wider focus:outline-none cursor-pointer"
                  >
                    <option value="campus">Campus life</option>
                    <option value="events">Events Commences</option>
                    <option value="social">Social arrays</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-gavel-muted uppercase tracking-wider mb-1.5 font-bold">
                    Assign to Album (Optional)
                  </label>
                  <select
                    value={uploadAlbumId}
                    onChange={(e) => setUploadAlbumId(e.target.value)}
                    className="w-full bg-[#111112] border border-gavel-border rounded-xl px-4 py-3 text-xs text-white uppercase font-mono tracking-wider focus:outline-none cursor-pointer"
                  >
                    <option value="">No Associated Album</option>
                    {albums.map(alb => (
                      <option key={alb.id} value={alb.id}>{alb.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-gavel-muted uppercase tracking-wider mb-1.5 font-bold">
                  Choose Photograph
                </label>
                <input
                  type="file"
                  required
                  accept="image/*"
                  onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                  className="w-full text-xs text-gavel-muted file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-[10px] file:font-mono file:font-bold file:uppercase file:bg-gavel-yellow file:text-black hover:file:bg-white file:cursor-pointer cursor-pointer"
                />
              </div>

              <button
                type="submit"
                disabled={uploadLoading}
                className="w-full bg-gavel-yellow hover:bg-white text-black font-semibold text-xs py-3.5 px-4 rounded-xl uppercase tracking-widest transition-all duration-300 mt-4 cursor-pointer font-bold"
              >
                {uploadLoading ? "Uploading to Roll..." : "Upload Campus Artwork"}
              </button>
            </form>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl border bg-[#0F0F0F]/90 backdrop-blur-xl shadow-2xl text-xs font-medium max-w-sm border-gavel-border text-white animate-fade-in">
          <div className={`w-2 h-2 rounded-full ${toast.type === 'success' ? 'bg-green-500' : 'bg-gavel-danger'}`}></div>
          <p className="flex-1">{toast.message}</p>
          <button onClick={() => setToast(null)} className="text-[10px] text-gavel-muted hover:text-white ml-2">Dismiss</button>
        </div>
      )}
    </div>
  );
}
