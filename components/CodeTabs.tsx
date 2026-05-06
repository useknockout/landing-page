"use client";

import { useState } from "react";
import { CodeBlock } from "./CodeBlock";

export type CodeTab = { name: string; code: string; language?: string };

type Props = {
  tabs: CodeTab[];
  dark?: boolean;
  className?: string;
};

export function CodeTabs({ tabs, dark = true, className = "" }: Props) {
  const [active, setActive] = useState(tabs[0]?.name ?? "");
  const current = tabs.find((t) => t.name === active) ?? tabs[0];

  return (
    <div
      className={`rounded-kno-lg overflow-hidden border ${
        dark ? "border-kno-border-dark" : "border-kno-border-gray"
      } ${className}`}
    >
      <div
        className={`flex items-stretch ${
          dark
            ? "bg-kno-bg-dark border-b border-kno-border-dark"
            : "bg-kno-surface-gray border-b border-kno-border-gray"
        }`}
      >
        <div className="flex no-scrollbar overflow-x-auto">
          {tabs.map((t) => {
            const isActive = t.name === current.name;
            return (
              <button
                key={t.name}
                type="button"
                onClick={() => setActive(t.name)}
                className={`px-4 py-2.5 text-[12px] font-medium font-sans cursor-pointer border-b-2 -mb-px transition-colors duration-kno-fast ease-kno-out ${
                  isActive
                    ? "border-kno-green text-kno-green"
                    : `border-transparent ${
                        dark
                          ? "text-kno-text-gray-dark hover:text-kno-white"
                          : "text-kno-text-gray hover:text-kno-black"
                      }`
                }`}
              >
                {t.name}
              </button>
            );
          })}
        </div>
      </div>
      <CodeBlock dark={dark} copyable className="rounded-none border-0">
        {current?.code ?? ""}
      </CodeBlock>
    </div>
  );
}
