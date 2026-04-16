"use client";

import { useAppStore } from "@/store/useAppStore";
import { formatDistanceToNow } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw, Search, Menu } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface ConversationListProps {
  onOpenSidebar?: () => void;
}

export function ConversationList({ onOpenSidebar }: ConversationListProps) {
  const conversations = useAppStore((state) => state.conversations);
  const activePageFilter = useAppStore((state) => state.activePageFilter);
  const activeConversationId = useAppStore((state) => state.activeConversationId);
  const setActiveConversation = useAppStore((state) => state.setActiveConversation);
  const isFetching = useAppStore((state) => state.isFetching);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredConversations = conversations.filter(c => {
    if (activePageFilter !== "ALL" && c.page_id !== activePageFilter) return false;
    
    if (searchQuery.trim() !== "") {
      const p = c.participants?.data?.find((p: any) => p.id !== c.page_id);
      if (p && !p.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
    }
    
    return true;
  });

  // Generate a consistent vibrant color for each user avatar
  const getAvatarColor = (name: string) => {
    const colors = [
      "bg-violet-500/15 text-violet-600 dark:text-violet-400",
      "bg-blue-500/15 text-blue-600 dark:text-blue-400",
      "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
      "bg-amber-500/15 text-amber-600 dark:text-amber-400",
      "bg-rose-500/15 text-rose-600 dark:text-rose-400",
      "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400",
      "bg-fuchsia-500/15 text-fuchsia-600 dark:text-fuchsia-400",
    ];
    const index = name.split("").reduce((sum, c) => sum + c.charCodeAt(0), 0) % colors.length;
    return colors[index];
  };

  return (
    <div className="flex h-full w-full md:w-[350px] flex-col border-r bg-background">
      {/* Header */}
      <div className="border-b p-4 h-14 flex items-center justify-between gap-2">
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 md:hidden text-muted-foreground hover:text-foreground"
          onClick={onOpenSidebar}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <h2 className="font-bold text-lg truncate">Messages</h2>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
          <RefreshCw className={cn("h-4 w-4", isFetching && "animate-spin")} />
        </Button>
      </div>
      
      {/* Search */}
      <div className="p-3 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            type="search" 
            placeholder="Search conversations..." 
            className="w-full pl-9 bg-muted/50 border-0 shadow-none focus-visible:ring-1 focus-visible:ring-primary/30 rounded-xl h-10" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Conversations */}
      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-0.5 p-2">
          {isFetching ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={`skeleton-${i}`} className="flex flex-col items-start gap-2 rounded-xl p-3">
                <div className="flex w-full items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex flex-col gap-1.5 flex-1">
                    <Skeleton className="h-4 w-[120px]" />
                    <Skeleton className="h-3 w-[80px]" />
                  </div>
                  <Skeleton className="h-3 w-[50px]" />
                </div>
              </div>
            ))
          ) : filteredConversations.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              No conversations found.
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const customer = conv.participants?.data?.find((p: any) => p.id !== conv.page_id);
              const lastMessage = conv.messages?.data?.[conv.messages.data.length - 1];
              const isActive = activeConversationId === conv.id;
              const customerName = customer?.name || "Unknown User";
              
              return (
                <button
                  key={conv.id}
                  onClick={() => setActiveConversation(conv.id)}
                  className={cn(
                    "flex flex-col items-start gap-1.5 rounded-xl p-3 text-left text-sm transition-all duration-200 hover:bg-accent active:scale-[0.98]",
                    isActive 
                      ? "bg-primary/8 border border-primary/15 shadow-sm" 
                      : "bg-transparent"
                  )}
                >
                  <div className="flex w-full justify-between items-center gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar className={cn("h-10 w-10 border-0 shrink-0", getAvatarColor(customerName))}>
                        <AvatarFallback className={cn("font-semibold text-xs", getAvatarColor(customerName))}>
                          {customerName.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col min-w-0">
                        <span className="font-semibold truncate">{customerName}</span>
                        <span className="text-[11px] text-muted-foreground truncate">
                          via {conv.page_name}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap shrink-0">
                      {conv.updated_time ? formatDistanceToNow(new Date(conv.updated_time), { addSuffix: true }) : ""}
                    </span>
                  </div>
                  <div className="line-clamp-1 text-xs text-muted-foreground w-full pl-[52px]">
                    {lastMessage ? (
                      <>
                        {lastMessage.from?.id === conv.page_id && (
                          <span className="font-medium text-primary/70 mr-1">You:</span>
                        )}
                        {lastMessage.text}
                      </>
                    ) : (
                      <span className="italic">No messages yet</span>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
