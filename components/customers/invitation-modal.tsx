"use client";

import React, { useState } from "react";
import { Dialog, Button, Badge } from "@/components/ui";
import { Check, Copy, ExternalLink, ShieldCheck, Clock, MessageSquare, Send } from "lucide-react";

interface InvitationModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerName: string;
  phone?: string;
  email?: string;
  plainToken: string;
  expiresAt?: string;
}

export function InvitationModal({
  isOpen,
  onClose,
  customerName,
  phone,
  email,
  plainToken,
  expiresAt,
}: InvitationModalProps) {
  const [copied, setCopied] = useState(false);

  // Generate portal link
  const appBaseUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";
  const inviteUrl = `${appBaseUrl}/invite/${plainToken}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const shareText = `Hello ${customerName}, your ServiceOS customer portal is ready. View your solar assets, quotes, and service requests here: ${inviteUrl}`;
  const whatsappUrl = phone
    ? `https://wa.me/${phone.replace(/[^\d]/g, "")}?text=${encodeURIComponent(shareText)}`
    : `https://wa.me/?text=${encodeURIComponent(shareText)}`;

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Customer Portal Invitation Generated"
      description={`Secure onboarding invitation link generated for ${customerName}.`}
      maxWidth="md"
    >
      <div className="mt-4 space-y-4">
        {/* Token Status Badge */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50/80 border border-emerald-200/80">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#006937]" />
            <span className="text-xs font-semibold text-emerald-900">
              Single-Use Secure Token Active
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-amber-700 font-medium">
            <Clock className="w-3.5 h-3.5" />
            <span>Expires in 24 hours</span>
          </div>
        </div>

        {/* Link box */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Invitation URL
          </label>
          <div className="flex items-center gap-2">
            <div className="flex-1 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-700 truncate select-all">
              {inviteUrl}
            </div>
            <Button
              type="button"
              variant={copied ? "primary" : "outline"}
              onClick={handleCopy}
              className={`shrink-0 transition-all ${
                copied
                  ? "bg-emerald-600 text-white hover:bg-emerald-700"
                  : "hover:bg-slate-50"
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 mr-1" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 mr-1" />
                  Copy Link
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Quick Send Options */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <p className="text-xs font-semibold text-slate-700">Quick Share Channel</p>
          <div className="grid grid-cols-2 gap-2">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              WhatsApp Client
            </a>
            <a
              href={`mailto:${email || ""}?subject=${encodeURIComponent(
                "Access Your ServiceOS Customer Portal"
              )}&body=${encodeURIComponent(shareText)}`}
              className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              Email Invite
            </a>
          </div>
        </div>

        {/* Direct Test Link */}
        <div className="pt-2">
          <a
            href={inviteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-[#006937] hover:underline font-medium"
          >
            <span>Preview Customer Claim Experience</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="flex justify-end pt-3 border-t border-slate-100">
          <Button
            type="button"
            onClick={onClose}
            className="bg-[#006937] hover:bg-[#004D28] text-white"
          >
            Done
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
