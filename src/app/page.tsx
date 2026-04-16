"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { Sidebar } from "@/components/Sidebar";
import { ConversationList } from "@/components/ConversationList";
import { ChatDetail } from "@/components/ChatDetail";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function Home() {
  const setConversations = useAppStore((state) => state.setConversations);
  const setIsFetching = useAppStore((state) => state.setIsFetching);
  const pages = useAppStore((state) => state.pages);
  const activeConversationId = useAppStore((state) => state.activeConversationId);
  const [isInitializing, setIsInitializing] = useState(true);
  
  // Mobile states
  const [showChat, setShowChat] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // When a conversation is selected, show chat on mobile
  useEffect(() => {
    if (activeConversationId) {
      setShowChat(true);
    }
  }, [activeConversationId]);

  // Sync with Graph API
  const loadConversations = async (background = false) => {
    if (pages.length === 0) {
      setConversations([]);
      return;
    }
    
    if (!background) setIsFetching(true);
    
    try {
      const response = await fetch("/api/facebook/fetch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pages }),
      });
      
      if (!response.ok) throw new Error("Failed to sync conversations");
      const data = await response.json();
      
      if (data.errors && data.errors.length > 0) {
         if (!background) {
            toast.error("Facebook API Sync Failed", {
               description: "Please check if your Access Token is valid and hasn't expired."
            });
         }
      }

      if (data.conversations) {
        setConversations(data.conversations);
      }
    } catch (error) {
      console.error(error);
    } finally {
      if (!background) setIsFetching(false);
    }
  };

  useEffect(() => {
    const initFetch = async () => {
      await loadConversations();
      setIsInitializing(false);
    };
    
    initFetch();
    
    const interval = setInterval(() => {
      loadConversations(true);
    }, 10000);
    
    return () => clearInterval(interval);
  }, [pages]);

  if (isInitializing) {
    return (
      <main className="flex h-[100dvh] w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4 text-muted-foreground">
          <div className="relative">
            <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
            <Loader2 className="h-8 w-8 animate-spin text-primary relative" />
          </div>
          <p className="text-sm font-medium">Loading unified inbox...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex h-[100dvh] w-full overflow-hidden bg-background text-foreground">
      
      {/* ---- DESKTOP LAYOUT: 3 panes side by side ---- */}
      <div className="hidden md:flex h-full w-full">
        <Sidebar onNavigate={() => {}} />
        <ConversationList onOpenSidebar={() => {}} />
        <ChatDetail onBack={() => {}} />
      </div>

      {/* ---- MOBILE LAYOUT: One pane at a time with slide animations ---- */}
      <div className="flex md:hidden h-full w-full relative">
        
        {/* Conversation List (always visible as base layer on mobile) */}
        <div className={`absolute inset-0 transition-transform duration-300 ease-in-out ${showChat ? '-translate-x-1/3 scale-95 opacity-50' : 'translate-x-0 scale-100 opacity-100'}`}>
          <ConversationList onOpenSidebar={() => setSidebarOpen(true)} />
        </div>
        
        {/* Chat Detail (slides in from right) */}
        <div className={`absolute inset-0 transition-transform duration-300 ease-in-out bg-background ${showChat ? 'translate-x-0' : 'translate-x-full'}`}>
          <ChatDetail onBack={() => {
            setShowChat(false);
            useAppStore.getState().setActiveConversation(null);
          }} />
        </div>

        {/* Sidebar Overlay (slides in from left) */}
        {sidebarOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-black/50 backdrop-blur-sm z-40 backdrop-fade-in"
              onClick={() => setSidebarOpen(false)}
            />
            {/* Sidebar panel */}
            <div className="absolute inset-y-0 left-0 w-[85%] max-w-[320px] z-50 sidebar-slide-in shadow-2xl">
              <Sidebar onNavigate={() => setSidebarOpen(false)} />
            </div>
          </>
        )}
      </div>
    </main>
  );
}
