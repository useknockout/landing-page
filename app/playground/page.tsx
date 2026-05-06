import type { Metadata } from "next";
import { TopNav } from "@/components/TopNav";
import { Footer } from "@/components/Footer";
import { Playground } from "./Playground";

export const metadata: Metadata = {
  title: "Playground",
  description:
    "Try the useknockout API without signing up. Live cutouts on real photos, with the exact code that produced each result.",
};

export default function PlaygroundPage() {
  return (
    <>
      <TopNav active="Playground" badge="playground" />
      <main className="min-h-[calc(100vh-64px)]">
        <Playground />
      </main>
      <Footer />
    </>
  );
}
