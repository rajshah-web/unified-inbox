"use client";

import { useAppStore } from "@/store/useAppStore";
import { AddPageModal } from "@/components/AddPageModal";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Inbox, Layers, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function Sidebar() {
  const pages = useAppStore((state) => state.pages);
  const activePageFilter = useAppStore((state) => state.activePageFilter);
  const setFilter = useAppStore((state) => state.setFilter);
  const conversations = useAppStore((state) => state.conversations);
  const removePage = useAppStore((state) => state.removePage);

  const getPageCount = (pageId: string) => {
    return conversations.filter(c => c.page_id === pageId).length;
  };

  const allCount = conversations.length;

  const handleDeletePage = (pageId: string, pageName: string) => {
    removePage(pageId);
    toast.success(`"${pageName}" removed successfully.`);
  };

  return (
    <div className="flex h-full w-[280px] flex-col border-r bg-muted/20">
      <div className="p-4 flex items-center justify-between border-b h-14">
        <h2 className="font-semibold text-lg flex items-center gap-2">
          <Layers className="h-5 w-5 text-primary" />
          Inboxes
        </h2>
        <ThemeToggle />
      </div>

      <div className="p-4">
        <AddPageModal />
      </div>

      <ScrollArea className="flex-1 px-4">
        <div className="space-y-1 mb-6">
          <button
            onClick={() => setFilter("ALL")}
            className={cn(
              "flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
              activePageFilter === "ALL" ? "bg-accent text-accent-foreground" : "text-muted-foreground"
            )}
          >
            <div className="flex items-center gap-2">
              <Inbox className="h-4 w-4" />
              All Messages
            </div>
            {allCount > 0 && <Badge variant="secondary" className="ml-auto flex h-5 w-5 shrink-0 items-center justify-center rounded-full">{allCount}</Badge>}
          </button>
        </div>

        <Separator className="my-4" />

        <div className="space-y-1">
          <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Connected Pages
          </h3>
          {pages.length === 0 ? (
            <p className="px-3 text-xs text-muted-foreground py-2">No pages added.</p>
          ) : (
            pages.map((page) => (
              <div
                key={page.id}
                className={cn(
                  "group flex w-full items-center justify-between rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
                  activePageFilter === page.id ? "bg-accent font-medium text-accent-foreground" : "text-muted-foreground"
                )}
              >
                <button
                  onClick={() => setFilter(page.id)}
                  className="flex items-center truncate flex-1 text-left"
                >
                  <div className="mr-2 h-4 w-4 rounded-full bg-primary/20 flex items-center justify-center text-[8px] font-bold text-primary shrink-0">
                    {page.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="truncate">{page.name}</span>
                </button>
                <div className="flex items-center gap-1">
                  {getPageCount(page.id) > 0 && (
                     <Badge variant="secondary" className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full">{getPageCount(page.id)}</Badge>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
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
    </div>
  );
}
