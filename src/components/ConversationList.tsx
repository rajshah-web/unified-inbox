"use client";

import { useAppStore } from "@/store/useAppStore";
import { formatDistanceToNow } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";

export function ConversationList() {
  const conversations = useAppStore((state) => state.conversations);
  const activePageFilter = useAppStore((state) => state.activePageFilter);
  const activeConversationId = useAppStore((state) => state.activeConversationId);
  const setActiveConversation = useAppStore((state) => state.setActiveConversation);
  
  const isFetching = useAppStore((state) => state.isFetching);
  
  const [searchQuery, setSearchQuery] = useState("");

  const filteredConversations = conversations.filter(c => {
    // 1. Filter by page
    if (activePageFilter !== "ALL" && c.page_id !== activePageFilter) return false;
    
    // 2. Filter by search query (participant name)
    if (searchQuery.trim() !== "") {
      const p = c.participants?.data?.find((p: any) => p.id !== c.page_id);
      if (p && !p.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
    }
    
    return true;
  });

  return (
    <div className="flex h-full w-[350px] flex-col border-r bg-background">
      <div className="border-b p-4 h-14 flex items-center justify-between gap-2">
        <h2 className="font-semibold text-lg truncate">Messages</h2>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
          <RefreshCw className={cn("h-4 w-4", isFetching && "animate-spin")} />
        </Button>
      </div>
      
      <div className="p-3 border-b bg-muted/10">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            type="search" 
            placeholder="Search conversations..." 
            className="w-full pl-9 bg-background shadow-none" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-1 p-3">
          {isFetching ? (
            // Skeleton Loaders
            Array.from({ length: 6 }).map((_, i) => (
              <div key={`skeleton-${i}`} className="flex flex-col items-start gap-2 rounded-lg p-3 border border-transparent">
                <div className="flex w-full items-center gap-3">
                  <Skeleton className="h-9 w-9 rounded-full" />
                  <div className="flex flex-col gap-1 flex-1">
                    <Skeleton className="h-4 w-[120px]" />
                    <Skeleton className="h-3 w-[60px]" />
                  </div>
                </div>
                <Skeleton className="h-3 w-full mt-1" />
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
              
              return (
                <button
                  key={conv.id}
                  onClick={() => setActiveConversation(conv.id)}
                  className={cn(
                    "flex flex-col items-start gap-2 rounded-lg p-3 text-left text-sm transition-all hover:bg-accent",
                    isActive ? "bg-accent" : "bg-transparent"
                  )}
                >
                  <div className="flex w-full justify-between items-start gap-2">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 border">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {customer?.name?.substring(0, 2).toUpperCase() || "??"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-semibold">{customer?.name || "Unknown User"}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground capitalize">
                            via {conv.page_name}
                          </span>
                        </div>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {conv.updated_time ? formatDistanceToNow(new Date(conv.updated_time), { addSuffix: true }) : ""}
                    </span>
                  </div>
                  <div className="line-clamp-1 text-xs text-muted-foreground w-full">
                    {lastMessage ? (
                      <>
                        <span className="font-medium mr-1">
                          {lastMessage.from?.id === conv.page_id ? "You:" : ""}
                        </span>
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
