import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EndpointDoc } from "@/components/EndpointDoc";
import { ENDPOINTS_BY_SLUG, ENDPOINTS } from "@/lib/endpoints";

type Props = { params: { slug: string } };

export function generateStaticParams() {
  return ENDPOINTS.map((e) => ({ slug: e.slug }));
}

export function generateMetadata({ params }: Props): Metadata {
  const spec = ENDPOINTS_BY_SLUG[params.slug];
  if (!spec) return {};
  return {
    title: `${spec.verb} ${spec.path}`,
    description: spec.lede,
  };
}

export default function EndpointPage({ params }: Props) {
  const spec = ENDPOINTS_BY_SLUG[params.slug];
  if (!spec) notFound();
  return <EndpointDoc spec={spec} />;
}
