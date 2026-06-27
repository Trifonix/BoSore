import { redirect } from "next/navigation";

export default function MySourcesLegacyRedirect() {
  redirect("/dashboard");
}
