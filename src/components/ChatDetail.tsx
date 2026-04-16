"use client";

import { useAppStore } from "@/store/useAppStore";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, MessageSquare, Send, Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { useState, useRef, useEffect } from "react";
import type { KeyboardEvent } from "react";
import { toast } from "sonner";

export function ChatDetail() {
  const activeConversationId = useAppStore((state) => state.activeConversationId);
  const conversations = useAppStore((state) => state.conversations);
  const pages = useAppStore((state) => state.pages);
  
  const [inputText, setInputText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const activeConv = conversations.find(c => c.id === activeConversationId);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activeConv?.messages?.data?.length, activeConversationId]);

  if (!activeConv) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center bg-muted/10 p-8 text-center text-muted-foreground">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted/40 mb-6 border shadow-sm">
          <MessageSquare className="h-10 w-10 text-muted-foreground/50" />
        </div>
        <h3 className="mb-2 text-xl font-semibold text-foreground">Select a conversation</h3>
        <p className="max-w-[400px] text-sm">
          Choose an active thread from the list on the left to view the message history and reply.
        </p>
      </div>
    );
  }

  const customer = activeConv.participants?.data?.find((p: any) => p.id !== activeConv.page_id);

  const handleSend = async () => {
    if (!inputText.trim() || !activeConv) return;
    
    const token = pages.find((p) => p.id === activeConv.page_id)?.token;
    if (!token) {
      toast.error("Access token not found for this page.");
      return;
    }

    if (!customer) {
      toast.error("Could not identify customer in this conversation.");
      return;
    }

    setIsSending(true);
    const messageOut = inputText.trim();
    const tempId = `temp_${Date.now()}`;
    
    // Optimistic UI: clear input and show bubble immediately
    setInputText("");
    const store = useAppStore.getState();
    store.addOptimisticMessage(activeConv.id, messageOut, activeConv.page_id, activeConv.page_name, tempId);
    
    try {
      const response = await fetch("/api/facebook/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          page_token: token,
          conversation_id: activeConv.id,
          message_text: messageOut
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send message");
      }

      toast.success("Message sent!");
    } catch (error: any) {
      console.error("Send error:", error);
      // Revert the optimistic bubble
      useAppStore.getState().removeOptimisticMessage(activeConv.id, tempId);
      
      const errMsg = error.message || "Failed to send message";
      if (errMsg.includes("(#10)") || errMsg.includes("outside of allowed window")) {
        toast.error("24-Hour Window Expired", {
          description: "Facebook only allows replies within 24 hours of the customer's last message."
        });
      } else {
        toast.error("Failed to send", { description: errMsg });
      }
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-1 flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between border-b p-4 h-14">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9 border">
            <AvatarFallback className="bg-primary/10 text-primary">
              {customer?.name?.substring(0, 2).toUpperCase() || "??"}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-semibold leading-none">{customer?.name || "Unknown User"}</span>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="text-[10px] uppercase font-semibold h-4 px-1 border-primary/20 bg-primary/5 text-primary">
                {activeConv.page_name}
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-8 shadow-sm">
            <Check className="mr-2 h-4 w-4 text-green-500" />
            Resolve
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-auto p-4" ref={scrollRef}>
        <div className="space-y-4">
          {activeConv.messages?.data?.map((msg, idx) => {
            const isOutbound = msg.from?.id === activeConv.page_id;
            
            return (
              <div 
                key={msg.id || idx} 
                className={cn(
                  "flex w-max max-w-[75%] flex-col gap-1",
                  isOutbound ? "ml-auto" : ""
                )}
              >
                <div className="text-[10px] text-muted-foreground px-1 mb-0.5">
                  <span className="font-medium mr-1">{msg.from?.name || "Unknown"}</span>
                  {msg.created_time && formatDistanceToNow(new Date(msg.created_time), { addSuffix: true })}
                </div>
                <div
                  className={cn(
                    "rounded-2xl px-4 py-2.5 text-sm shadow-sm",
                    isOutbound
                      ? "bg-primary text-primary-foreground rounded-tr-sm"
                      : "bg-muted/80 text-foreground rounded-tl-sm border"
                  )}
                >
                  {msg.text || ""}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Input Area */}
      <div className="p-4 bg-muted/10 border-t">
        <div className="relative flex w-full items-end gap-2 p-1 border rounded-lg bg-background shadow-sm focus-within:ring-1 focus-within:ring-ring transition-shadow">
          <Textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Reply to ${customer?.name || "Customer"}...`}
            className="min-h-[44px] w-full resize-none border-0 shadow-none focus-visible:ring-0 p-3 pt-3 scrollbar-hide text-sm"
            rows={1}
            disabled={isSending}
          />
          <div className="p-1 shrink-0">
            <Button 
              size="icon" 
              onClick={handleSend}
              disabled={isSending || !inputText.trim()}
              className="h-8 w-8 rounded-md transition-all"
            >
              {isSending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              <span className="sr-only">Send message</span>
            </Button>
          </div>
        </div>
        <div className="text-center mt-2 text-[10px] text-muted-foreground">
          Press <kbd className="font-mono bg-muted px-1 py-0.5 rounded border border-border">Enter</kbd> to send · <kbd className="font-mono bg-muted px-1 py-0.5 rounded border border-border">Shift+Enter</kbd> for new line
        </div>
      </div>
    </div>
  );
}
