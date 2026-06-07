import type { Metadata } from "next";
import { TopNav } from "@/components/TopNav";
import { Footer } from "@/components/Footer";
import { SupportForm } from "./SupportForm";

export const metadata: Metadata = {
  title: "Support",
  description: "Get help with the useknockout API — contact form, email, and GitHub issues.",
  robots: { index: true, follow: true },
};

export default function SupportPage() {
  return (
    <>
      <TopNav active={null} />
      <main className="min-h-[calc(100vh-64px)] bg-kno-surface-gray px-8 py-16">
        <div className="max-w-[640px] mx-auto">
          <header className="mb-8">
            <h1
              className="font-bold m-0"
              style={{ fontSize: 36, letterSpacing: "-0.02em", lineHeight: 1.15 }}
            >
              Support
            </h1>
            <p className="text-[16px] text-kno-text-gray mt-2 max-w-[520px]">
              Hit a bug, a billing question, or a broken endpoint? Send us a message and we&apos;ll
              get back to you. Include the <code className="font-mono text-[13px] px-1.5 py-0.5 rounded-kno-sm bg-kno-white border border-kno-border-gray">request_id</code> from any error response so we can trace it fast.
            </p>
          </header>

          <SupportForm />
        </div>
      </main>
      <Footer />
    </>
  );
}
