import { redirect } from "next/navigation";

export default function PortalIndexPage() {
  // Redirect root /s to sunshine-solar demo portal
  redirect("/s/sunshine-solar");
}
