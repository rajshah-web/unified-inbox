"use client";

import { useAppStore } from "@/store/useAppStore";
import { AddPageModal } from "@/components/AddPageModal";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Inbox, Layers, Trash2, X, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface SidebarProps {
  onNavigate?: () => void;
}

export function Sidebar({ onNavigate }: SidebarProps) {
  const pages = useAppStore((state) => state.pages);
  const activePageFilter = useAppStore((state) => state.activePageFilter);
  const setFilter = useAppStore((state) => state.setFilter);
  const conversations = useAppStore((state) => state.conversations);
  const removePage = useAppStore((state) => state.removePage);

  const getPageCount = (pageId: string) => {
    return conversations.filter(c => c.page_id === pageId).length;
  };

  const allCount = conversations.length;

  const handleFilterClick = (filter: string) => {
    setFilter(filter);
    onNavigate?.();
  };

  const handleDeletePage = (pageId: string, pageName: string) => {
    removePage(pageId);
    toast.success(`"${pageName}" removed successfully.`);
  };

  return (
    <div className="flex h-full w-full md:w-[280px] flex-col border-r bg-card">
      {/* Premium Gradient Header */}
      <div className="relative overflow-hidden border-b">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-primary/5 to-transparent" />
        <div className="relative p-4 flex items-center justify-between h-14">
          <h2 className="font-bold text-lg flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            Unified Inbox
          </h2>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            {/* Close button on mobile */}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 md:hidden text-muted-foreground"
              onClick={onNavigate}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="p-4">
        <AddPageModal />
      </div>

      <ScrollArea className="flex-1 px-4">
        <div className="space-y-1 mb-6">
          <button
            onClick={() => handleFilterClick("ALL")}
            className={cn(
              "flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 hover:bg-accent hover:text-accent-foreground",
              activePageFilter === "ALL" 
                ? "bg-primary/10 text-primary border border-primary/20 shadow-sm" 
                : "text-muted-foreground"
            )}
          >
            <div className="flex items-center gap-2">
              <Inbox className="h-4 w-4" />
              All Messages
            </div>
            {allCount > 0 && (
              <Badge className="ml-auto flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] px-1.5">
                {allCount}
              </Badge>
            )}
          </button>
        </div>

        <Separator className="my-4" />

        <div className="space-y-1">
          <h3 className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Connected Pages
          </h3>
          {pages.length === 0 ? (
            <p className="px-3 text-xs text-muted-foreground py-2">No pages added yet.</p>
          ) : (
            pages.map((page) => (
              <div
                key={page.id}
                className={cn(
                  "group flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm transition-all duration-200 hover:bg-accent hover:text-accent-foreground",
                  activePageFilter === page.id 
                    ? "bg-primary/10 font-medium text-primary border border-primary/20 shadow-sm" 
                    : "text-muted-foreground"
                )}
              >
                <button
                  onClick={() => handleFilterClick(page.id)}
                  className="flex items-center truncate flex-1 text-left"
                >
                  <div className="mr-2 h-6 w-6 rounded-lg bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center text-[10px] font-bold text-primary shrink-0 border border-primary/20">
                    {page.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="truncate">{page.name}</span>
                </button>
                <div className="flex items-center gap-1">
                  {getPageCount(page.id) > 0 && (
                    <Badge className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary text-[10px] px-1.5 border-0">
                      {getPageCount(page.id)}
                    </Badge>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10 rounded-lg"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeletePage(page.id, page.name);
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
      
      {/* Footer branding */}
      <div className="p-4 border-t">
        <p className="text-[10px] text-muted-foreground/60 text-center">
          Powered by VegasSweep • v1.0
        </p>
      </div>
    </div>
  );
}
