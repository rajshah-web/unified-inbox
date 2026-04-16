"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { Sidebar } from "@/components/Sidebar";
import { ConversationList } from "@/components/ConversationList";
import { ChatDetail } from "@/components/ChatDetail";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

// Mobile view states: sidebar | list | chat
type MobileView = "sidebar" | "list" | "chat";

export default function Home() {
  const setConversations = useAppStore((state) => state.setConversations);
  const setIsFetching = useAppStore((state) => state.setIsFetching);
  const pages = useAppStore((state) => state.pages);
  const activeConversationId = useAppStore((state) => state.activeConversationId);
  const [isInitializing, setIsInitializing] = useState(true);
  const [mobileView, setMobileView] = useState<MobileView>("list");

  // When a conversation is selected, jump to chat view on mobile
  useEffect(() => {
    if (activeConversationId) {
      setMobileView("chat");
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
      <main className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm font-medium">Loading unified inbox...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex h-[100dvh] w-full overflow-hidden bg-background text-foreground">
      {/* Desktop: show all 3 panes side by side */}
      {/* Mobile: show one pane at a time based on mobileView */}

      {/* Sidebar */}
      <div className={`
        ${mobileView === "sidebar" ? "flex" : "hidden"} 
        md:flex
        h-full w-full md:w-auto shrink-0
      `}>
        <Sidebar onNavigate={() => setMobileView("list")} />
      </div>

      {/* Conversation List */}
      <div className={`
        ${mobileView === "list" ? "flex" : "hidden"} 
        md:flex
        h-full w-full md:w-auto shrink-0
      `}>
        <ConversationList 
          onOpenSidebar={() => setMobileView("sidebar")} 
        />
      </div>

      {/* Chat Detail */}
      <div className={`
        ${mobileView === "chat" ? "flex" : "hidden"} 
        md:flex
        h-full w-full md:w-auto flex-1 min-w-0
      `}>
        <ChatDetail onBack={() => setMobileView("list")} />
      </div>
    </main>
  );
}
