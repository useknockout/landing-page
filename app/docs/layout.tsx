import type { Metadata } from "next";
import { TopNav } from "@/components/TopNav";
import { Footer } from "@/components/Footer";
import { DocsSidebar } from "@/components/DocsSidebar";

export const metadata: Metadata = {
  title: "Docs",
  description: "useknockout API reference, SDKs, and self-hosting guide.",
};

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <TopNav active="Docs" badge="docs" />
      <div className="max-w-kno-content-wide mx-auto px-8 flex gap-10">
        <DocsSidebar />
        <main className="flex-1 min-w-0 py-10 max-w-kno-prose">{children}</main>
      </div>
      <Footer />
    </>
  );
}
