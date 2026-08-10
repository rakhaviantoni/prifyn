import { redirect } from "next/navigation";

export default function PreviewPage() {
  redirect("/app?mode=preview");
}
