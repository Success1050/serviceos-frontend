"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface SwitchProps {
  id?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  description?: string;
  className?: string;
}

export function Switch({
  id,
  checked,
  onCheckedChange,
  disabled = false,
  label,
  description,
  className,
}: SwitchProps) {
  const switchId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  return (
    <div className={cn("flex items-start justify-between gap-4 py-1", className)}>
      {(label || description) && (
        <div className="flex flex-col min-w-0 pr-2">
          {label && (
            <label
              htmlFor={switchId}
              className={cn(
                "text-xs font-semibold text-slate-800 tracking-tight select-none",
                disabled ? "cursor-not-allowed text-slate-400" : "cursor-pointer"
              )}
            >
              {label}
            </label>
          )}
          {description && (
            <span
              className={cn(
                "text-[11px] leading-relaxed text-slate-500",
                disabled && "text-slate-400"
              )}
            >
              {description}
            </span>
          )}
        </div>
      )}

      <button
        type="button"
        role="switch"
        id={switchId}
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onCheckedChange(!checked)}
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#006937] focus:ring-offset-2",
          checked ? "bg-[#006937]" : "bg-slate-200",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <span
          className={cn(
            "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out",
            checked ? "translate-x-5" : "translate-x-0"
          )}
        />
      </button>
    </div>
  );
}

export default Switch;
