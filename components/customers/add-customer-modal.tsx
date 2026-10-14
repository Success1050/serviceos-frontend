"use client";

import React, { useState } from "react";
import apiClient from "@/lib/api/client";
import { normalizePhoneNumber } from "@/lib/utils";
import { Button, Input, Dialog, Switch } from "@/components/ui";
import { User, Phone, Mail, MapPin, Building, Sparkles, CheckCircle2, AlertCircle } from "lucide-react";

interface AddCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCustomerCreated: (customer: any, inviteToken?: string) => void;
}

export function AddCustomerModal({
  isOpen,
  onClose,
  onCustomerCreated,
}: AddCustomerModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    sendInviteNow: true,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.name.trim()) {
      setError("Customer name is required");
      return;
    }

    if (!formData.phone.trim() && !formData.email.trim()) {
      setError("Please provide at least a phone number or email address");
      return;
    }

    setLoading(true);

    try {
      const normalizedPhone = formData.phone.trim()
        ? normalizePhoneNumber(formData.phone.trim())
        : undefined;

      const payload = {
        name: formData.name.trim(),
        phone: normalizedPhone,
        email: formData.email.trim().toLowerCase() || undefined,
        address: formData.address.trim() || undefined,
        city: formData.city.trim() || undefined,
      };

      // 1. Create the customer record
      const createRes = await apiClient.post("/customers", payload);
      const newCustomer = createRes.data;

      let plainToken: string | undefined;

      // 2. If option enabled, generate portal invitation
      if (formData.sendInviteNow && newCustomer?.id) {
        try {
          const inviteRes = await apiClient.post(`/customers/${newCustomer.id}/invite`);
          plainToken = inviteRes.data?.plainToken;
        } catch (inviteErr) {
          console.warn("Auto-invite failed but customer was created:", inviteErr);
        }
      }

      onCustomerCreated(newCustomer, plainToken);
      setFormData({
        name: "",
        phone: "",
        email: "",
        address: "",
        city: "",
        sendInviteNow: true,
      });
      onClose();
    } catch (err: any) {
      console.error("Create customer error:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to create customer. Please check details and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Customer"
      description="Add a residential or commercial client to your ServiceOS directory."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        {error && (
          <div className="flex items-center gap-2 p-3 text-xs rounded-xl bg-rose-50 text-rose-700 border border-rose-200">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Full Customer / Business Name <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              type="text"
              placeholder="e.g. Chief Adeleke or Greenfield Estates"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="pl-9"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Phone Number <span className="text-slate-400">(Nigerian / Int'l)</span>
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                type="tel"
                placeholder="0803 123 4567 or +234..."
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="pl-9"
              />
            </div>
            <p className="mt-1 text-[10px] text-slate-400">
              Normalized automatically to +234 standard for SMS alerts
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Email Address <span className="text-slate-400">(Optional)</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                type="email"
                placeholder="client@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="pl-9"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Installation Address
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                type="text"
                placeholder="Plot 14, Admiralty Way, Lekki Phase 1"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="pl-9"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              City / State
            </label>
            <div className="relative">
              <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                type="text"
                placeholder="Lagos"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="pl-9"
              />
            </div>
          </div>
        </div>

        {/* Invite Switch */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-100 text-[#006937]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-800">
                Generate Customer Portal Invitation
              </p>
              <p className="text-[11px] text-slate-500">
                Creates a secure single-use invitation token valid for 24 hours.
              </p>
            </div>
          </div>
          <Switch
            checked={formData.sendInviteNow}
            onCheckedChange={(checked: boolean) => setFormData({ ...formData, sendInviteNow: checked })}
          />
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100 sticky bottom-0 bg-white/95 backdrop-blur-xs py-3 -mx-6 px-6 shadow-[0_-4px_12px_rgba(0,0,0,0.03)] mt-6">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading} className="text-xs font-semibold px-4 h-9">
            Cancel
          </Button>
          <Button
            type="submit"
            isLoading={loading}
            className="bg-[#006937] hover:bg-[#004D28] text-white text-xs font-semibold h-9 px-4 shadow-sm"
          >
            Create Customer
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
