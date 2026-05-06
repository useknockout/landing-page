import type { Metadata } from "next";
import { Suspense } from "react";
import { TopNav } from "@/components/TopNav";
import { Footer } from "@/components/Footer";
import { SigninForm } from "./SigninForm";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to useknockout to manage your API keys, usage, and billing.",
  robots: { index: false, follow: true },
};

export default function SigninPage() {
  return (
    <>
      <TopNav active={null} />
      <main className="min-h-[calc(100vh-64px)] flex items-center justify-center px-8 py-16 bg-kno-surface-gray">
        <div className="w-full max-w-[420px] bg-kno-white border border-kno-border-gray rounded-kno-xl p-10">
          <div className="mb-8">
            <h1
              className="font-bold m-0"
              style={{ fontSize: 28, letterSpacing: "-0.015em", lineHeight: 1.2 }}
            >
              Sign in to useknockout
            </h1>
            <p className="text-[14px] text-kno-text-gray mt-2">
              Manage tokens, usage, and billing. New here? Same form — we create your
              account on first sign-in.
            </p>
          </div>
          <Suspense fallback={null}>
            <SigninForm />
          </Suspense>
        </div>
      </main>
      <Footer />
    </>
  );
}
