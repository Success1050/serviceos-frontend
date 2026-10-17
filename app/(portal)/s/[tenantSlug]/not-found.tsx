"use client";

import React from "react";
import { useParams } from "next/navigation";
import { TenantNotFound } from "@/components/portal";

export default function PortalNotFound() {
  const params = useParams();
  const slug = (params?.tenantSlug as string) || "";
  return <TenantNotFound slug={slug} />;
}
