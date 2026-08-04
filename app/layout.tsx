import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const metadataBase = new URL(`${protocol}://${host}`);

  return {
    metadataBase,
    title: "PRIFYN — Growth OS",
    description: "A decision-first operating system for confident, measurable growth.",
    icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
    openGraph: {
      title: "PRIFYN — Growth decisions, made clear.",
      description: "A decision-first operating system for confident, measurable growth.",
      type: "website",
      images: [{ url: "/og.png", width: 1733, height: 909, alt: "PRIFYN — Growth decisions, made clear." }],
    },
    twitter: {
      card: "summary_large_image",
      title: "PRIFYN — Growth decisions, made clear.",
      description: "A decision-first operating system for confident, measurable growth.",
      images: ["/og.png"],
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
