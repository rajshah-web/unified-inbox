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
  const [isInitializing, setIsInitializing] = useState(true);

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
         // Optionally toast errors to inform the user about invalid tokens
         // We only do this if it's the main initialization to prevent spam every 10 seconds
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
    
    // Poll every 10 seconds for new messages in the background
    const interval = setInterval(() => {
      loadConversations(true);
    }, 10000);
    
    return () => clearInterval(interval);
  }, [pages]); // Re-run if pages change

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
    <main className="flex h-screen w-full overflow-hidden bg-background text-foreground">
      {/* 3-Pane Architecture */}
      <Sidebar />
      <ConversationList />
      <ChatDetail />
    </main>
  );
}
