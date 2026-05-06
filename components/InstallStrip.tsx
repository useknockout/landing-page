import { CodeTabs } from "./CodeTabs";

const TABS = [
  {
    name: "Node",
    code: `npm i @useknockout/node

import { Knockout } from "@useknockout/node";
const client = new Knockout({ token: process.env.KNOCKOUT_TOKEN });
const png = await client.remove({ file: "./input.jpg" });`,
  },
  {
    name: "React",
    code: `npm i @useknockout/react

import { useRemoveBackground } from "@useknockout/react";
const { remove, dataUrl, isLoading } = useRemoveBackground({ token });

<input type="file" onChange={e => remove(e.target.files[0])} />`,
  },
  {
    name: "CLI",
    code: `npx @useknockout/cli remove cat.jpg
# → cat-nobg.png in the same folder

useknockout replace photo.jpg --bg-color "#FF5733"
useknockout sticker dog.jpg --stroke-width 24`,
  },
  {
    name: "Python",
    code: `pip install requests

import requests
resp = requests.post("https://useknockout--api.modal.run/remove",
  headers={"Authorization": f"Bearer {TOKEN}"},
  files={"file": open("input.jpg", "rb")})
open("out.png", "wb").write(resp.content)`,
  },
  {
    name: "cURL",
    code: `curl -X POST "https://useknockout--api.modal.run/remove" \\
  -H "Authorization: Bearer $TOKEN" \\
  -F "file=@cat.jpg" \\
  -o out.png`,
  },
];

export function InstallStrip() {
  return (
    <section className="bg-kno-bg-dark px-8 py-20">
      <div className="max-w-[1000px] mx-auto">
        <div className="mb-6">
          <h2
            className="font-bold text-kno-white m-0"
            style={{ fontSize: 36, letterSpacing: "-0.02em", lineHeight: 1.15 }}
          >
            Install in your stack.
          </h2>
          <p className="text-[16px] text-kno-text-gray-dark mt-2">
            Official SDKs for Node, React, CLI, and Python. Or hit the REST API directly.
          </p>
        </div>
        <CodeTabs tabs={TABS} dark />
      </div>
    </section>
  );
}
