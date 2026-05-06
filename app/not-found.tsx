import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/Button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-kno-white text-kno-black flex flex-col">
      <nav className="flex items-center gap-7 px-8 py-3.5 border-b border-kno-border-gray">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Image src="/logo-icon.png" alt="" width={22} height={22} />
          <span>useknockout</span>
        </Link>
        <div className="flex gap-6 ml-2">
          <Link className="text-[14px] text-kno-text-gray font-medium" href="/docs">Docs</Link>
          <Link className="text-[14px] text-kno-text-gray font-medium" href="/playground">Playground</Link>
          <Link className="text-[14px] text-kno-text-gray font-medium" href="/#pricing">Pricing</Link>
        </div>
      </nav>
      <div className="flex-1 flex items-center justify-center px-16 py-16">
        <div className="max-w-[720px] text-center">
          <p className="font-mono text-[18px] text-kno-text-gray-dark tracking-[0.08em] m-0">
            404 · NOT FOUND
          </p>
          <h1
            className="font-bold mt-4"
            style={{ fontSize: 88, lineHeight: 1.02, letterSpacing: "-0.035em" }}
          >
            This page got <span className="text-kno-green">knocked out.</span>
          </h1>
          <p className="text-[18px] text-kno-text-gray mt-6 leading-[1.5]">
            The URL you tried doesn&apos;t exist. The endpoint you wanted is probably{" "}
            <code className="code-chip">POST /remove</code> — see the docs.
          </p>
          <div className="flex gap-3 justify-center mt-9">
            <Button href="/docs" variant="primary" size="lg">
              Read the docs →
            </Button>
            <Button href="/" variant="secondary" size="lg">
              Back to home
            </Button>
          </div>
          <p className="mt-8 font-mono text-[12px] text-kno-text-gray">
            If you think this is a mistake, open an issue on github.com/useknockout/api
          </p>
        </div>
      </div>
    </div>
  );
}
