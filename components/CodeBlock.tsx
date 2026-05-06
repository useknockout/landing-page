"use client";

import { useState, type ReactNode } from "react";
import { copyToClipboard } from "@/lib/copy";

type Props = {
  children: string;
  dark?: boolean;
  language?: string;
  className?: string;
  copyable?: boolean;
  rightSlot?: ReactNode;
};

export function CodeBlock({
  children,
  dark = true,
  language,
  className = "",
  copyable = true,
  rightSlot,
}: Props) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const ok = await copyToClipboard(children);
    if (ok) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    }
  }

  const themeClass = dark
    ? "bg-kno-bg-dark text-[#E5E7EB] border border-kno-border-dark"
    : "bg-kno-surface-gray text-kno-black border border-kno-border-gray";

  return (
    <div
      className={`relative rounded-kno-lg overflow-hidden font-mono text-[13px] leading-[1.65] ${themeClass} ${className}`}
    >
      {(language || copyable || rightSlot) && (
        <div
          className={`flex items-center gap-2 px-4 py-2 border-b text-[11px] ${
            dark
              ? "border-kno-border-dark text-kno-text-gray-dark"
              : "border-kno-border-gray text-kno-text-gray"
          }`}
        >
          {language && <span className="font-medium">{language}</span>}
          <span className="ml-auto flex items-center gap-3">
            {rightSlot}
            {copyable && (
              <button
                type="button"
                onClick={handleCopy}
                className={`text-[11px] px-2 py-1 rounded-kno-sm transition-colors duration-kno-fast ease-kno-out ${
                  dark
                    ? "hover:bg-kno-bg-elev-dark text-kno-text-gray-dark hover:text-kno-white"
                    : "hover:bg-kno-border-gray text-kno-text-gray hover:text-kno-black"
                }`}
                aria-label="Copy code"
              >
                {copied ? "Copied" : "Copy"}
              </button>
            )}
          </span>
        </div>
      )}
      <pre className="m-0 p-[16px_18px] overflow-x-auto">
        <code className="font-mono">{children}</code>
      </pre>
    </div>
  );
}
