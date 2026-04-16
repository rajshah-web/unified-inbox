"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useAppStore } from "@/store/useAppStore";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PlusCircle, KeyRound, Loader2 } from "lucide-react";

interface AddPageModalProps {
  children?: React.ReactElement;
}

export function AddPageModal({ children }: AddPageModalProps) {
  const [open, setOpen] = useState(false);
  const [pageName, setPageName] = useState("");
  const [pageId, setPageId] = useState("");
  const [token, setToken] = useState("");
  
  // Token exchange fields
  const [showExchange, setShowExchange] = useState(false);
  const [appId, setAppId] = useState("");
  const [appSecret, setAppSecret] = useState("");
  const [shortToken, setShortToken] = useState("");
  const [isExchanging, setIsExchanging] = useState(false);

  const addPage = useAppStore((state) => state.addPage);
  const pages = useAppStore((state) => state.pages);

  const handleSave = () => {
    if (!pageName.trim() || !pageId.trim() || !token.trim()) {
      toast.error("Please fill in all fields.");
      return;
    }

    if (pages.some((p) => p.id === pageId.trim())) {
      toast.error("A page with this ID already exists.");
      return;
    }

    addPage({
      id: pageId.trim(),
      name: pageName.trim(),
      token: token.trim(),
    });

    toast.success(`Page "${pageName}" added successfully.`);
    
    setPageName("");
    setPageId("");
    setToken("");
    setShowExchange(false);
    setOpen(false);
  };

  const handleExchangeToken = async () => {
    if (!appId.trim() || !appSecret.trim() || !shortToken.trim() || !pageId.trim()) {
      toast.error("Fill in Page ID, App ID, App Secret, and your current token.");
      return;
    }

    setIsExchanging(true);
    try {
      const response = await fetch("/api/facebook/exchange-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          app_id: appId.trim(),
          app_secret: appSecret.trim(),
          short_lived_token: shortToken.trim(),
          page_id: pageId.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Token exchange failed.");
      }

      setToken(data.permanent_token);
      if (data.page_name && !pageName.trim()) {
        setPageName(data.page_name);
      }
      toast.success("Permanent token generated! Click 'Save Page' to add it.");
      setShowExchange(false);
    } catch (error: any) {
      toast.error(error.message || "Token exchange failed.");
    } finally {
      setIsExchanging(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger 
        render={
          children || (
            <Button variant="outline" className="w-full justify-start gap-2">
              <PlusCircle className="h-4 w-4" />
              Add Page
            </Button>
          )
        } 
      />
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Add Facebook Page</DialogTitle>
          <DialogDescription>
            Enter your Facebook Page details. Use the token exchange to generate a permanent (never-expiring) token.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="name" className="text-right text-sm font-medium">
              Page Name
            </label>
            <Input
              id="name"
              placeholder="e.g. VegasSweep"
              className="col-span-3"
              value={pageName}
              onChange={(e) => setPageName(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="pageId" className="text-right text-sm font-medium">
              Page ID
            </label>
            <Input
              id="pageId"
              placeholder="e.g. 1234567890"
              className="col-span-3"
              value={pageId}
              onChange={(e) => setPageId(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="token" className="text-right text-sm font-medium">
              Token
            </label>
            <Input
              id="token"
              type="password"
              placeholder="EAA..."
              className="col-span-3"
              value={token}
              onChange={(e) => setToken(e.target.value)}
            />
          </div>
          
          {/* Token Exchange Section */}
          {!showExchange ? (
            <div className="col-span-4 flex justify-center">
              <Button
                variant="link"
                size="sm"
                onClick={() => setShowExchange(true)}
                className="text-xs gap-1"
              >
                <KeyRound className="h-3 w-3" />
                Generate Permanent Token
              </Button>
            </div>
          ) : (
            <div className="col-span-4 border rounded-lg p-4 bg-muted/30 space-y-3 mt-2">
              <p className="text-xs text-muted-foreground">
                Enter your Facebook App credentials to convert a short-lived token into a permanent one.
              </p>
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right text-xs font-medium">App ID</label>
                <Input
                  placeholder="Your Facebook App ID"
                  className="col-span-3 h-8 text-xs"
                  value={appId}
                  onChange={(e) => setAppId(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right text-xs font-medium">App Secret</label>
                <Input
                  type="password"
                  placeholder="Your Facebook App Secret"
                  className="col-span-3 h-8 text-xs"
                  value={appSecret}
                  onChange={(e) => setAppSecret(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right text-xs font-medium">Current Token</label>
                <Input
                  type="password"
                  placeholder="Short-lived user access token"
                  className="col-span-3 h-8 text-xs"
                  value={shortToken}
                  onChange={(e) => setShortToken(e.target.value)}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="ghost" size="sm" onClick={() => setShowExchange(false)} className="h-7 text-xs">
                  Cancel
                </Button>
                <Button size="sm" onClick={handleExchangeToken} disabled={isExchanging} className="h-7 text-xs">
                  {isExchanging ? (
                    <>
                      <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                      Exchanging...
                    </>
                  ) : (
                    "Generate Permanent Token"
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSave}>Save Page</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
