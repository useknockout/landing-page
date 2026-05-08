import type { Metadata } from "next";
import { TopNav } from "@/components/TopNav";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Terms governing your use of the useknockout API and website.",
  robots: { index: true, follow: true },
};

export default function TermsPage() {
  return (
    <>
      <TopNav active={null} />
      <main className="min-h-[calc(100vh-64px)] bg-kno-surface-gray px-8 py-16">
        <article className="max-w-[720px] mx-auto prose-kno">
          <header className="mb-10">
            <h1
              className="font-bold m-0"
              style={{ fontSize: 36, letterSpacing: "-0.02em", lineHeight: 1.15 }}
            >
              Terms of Service
            </h1>
            <p className="text-[14px] text-kno-text-gray mt-2">
              Last updated: May 8, 2026
            </p>
          </header>

          <Section title="1. Agreement">
            <p>
              By accessing <strong>useknockout.com</strong> or using the useknockout API
              (&quot;Service&quot;), you agree to these Terms of Service (&quot;Terms&quot;). If you
              do not agree, do not use the Service.
            </p>
            <p>
              &quot;We,&quot; &quot;us,&quot; and &quot;our&quot; refer to useknockout.
              &quot;You&quot; refers to the person or entity using the Service.
            </p>
          </Section>

          <Section title="2. Description of Service">
            <p>
              useknockout provides a background-removal and image-processing API. The API runs
              on GPU infrastructure and returns processed images. The underlying model (BiRefNet)
              is open-source (MIT licensed). The hosted API service, website, and related
              infrastructure are operated by useknockout.
            </p>
          </Section>

          <Section title="3. Accounts">
            <ul className="list-disc pl-5 space-y-1.5">
              <li>You must provide a valid email address to create an account.</li>
              <li>You are responsible for keeping your API tokens secure.</li>
              <li>
                You must not share, sell, or redistribute your API tokens to third parties.
              </li>
              <li>
                Notify us immediately at{" "}
                <a href="mailto:hi@useknockout.com" className="text-kno-green hover:underline">
                  hi@useknockout.com
                </a>{" "}
                if you suspect unauthorized access to your account.
              </li>
              <li>One account per person or entity. Duplicate accounts may be terminated.</li>
            </ul>
          </Section>

          <Section title="4. Free tier">
            <p>
              The free tier includes up to <strong>20 API calls per calendar month</strong>. Free
              usage is subject to rate limits (60 requests per minute). We reserve the right to
              modify free tier limits with 30 days notice.
            </p>
          </Section>

          <Section title="5. Paid plans and billing">
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                Paid plans are billed monthly via <strong>Stripe</strong> based on metered usage
                (per image processed).
              </li>
              <li>
                Prices are listed on the pricing page. We may change prices with 30 days
                notice.
              </li>
              <li>
                You authorize us to charge your payment method on file for usage during each
                billing period.
              </li>
              <li>
                All fees are in USD and are non-refundable, except where required by law or at
                our sole discretion.
              </li>
              <li>
                Failed payments may result in service suspension. We will notify you by email
                before suspending your account.
              </li>
            </ul>
          </Section>

          <Section title="6. Acceptable use">
            <p>You agree <strong>not</strong> to:</p>
            <ul className="list-disc pl-5 space-y-1.5 mt-2">
              <li>
                Use the Service to process illegal content, including but not limited to child
                sexual abuse material (CSAM).
              </li>
              <li>Circumvent rate limits or quota enforcement.</li>
              <li>
                Reverse-engineer, scrape, or probe the Service beyond normal API usage.
              </li>
              <li>
                Use the Service in a way that degrades performance for other users.
              </li>
              <li>
                Resell API access directly (wrapping the API in your own product is fine — reselling
                raw access is not).
              </li>
              <li>
                Transmit malware, viruses, or malicious payloads through the API.
              </li>
            </ul>
            <p className="mt-3">
              Violation may result in immediate account termination without refund.
            </p>
          </Section>

          <Section title="7. Intellectual property">
            <h3 className="font-semibold text-[16px] mt-4 mb-2">Your content</h3>
            <p>
              You retain all rights to images you upload. We do not claim ownership of your
              content. Images are processed in memory and are <strong>not stored</strong> after
              the response is returned.
            </p>

            <h3 className="font-semibold text-[16px] mt-4 mb-2">Our content</h3>
            <p>
              The useknockout name, logo, website design, and documentation are our property.
              The underlying BiRefNet model is MIT licensed and governed by its own license.
            </p>
          </Section>

          <Section title="8. Self-hosting">
            <p>
              The API source code is available under the MIT license at{" "}
              <a
                href="https://github.com/useknockout/api"
                target="_blank"
                rel="noopener noreferrer"
                className="text-kno-green hover:underline"
              >
                github.com/useknockout/api
              </a>
              . Self-hosted instances are your responsibility. These Terms only govern the
              hosted service at api.useknockout.com.
            </p>
          </Section>

          <Section title="9. Availability and SLA">
            <p>
              We aim for high availability but do <strong>not guarantee uptime</strong> on the
              Free or Pay-as-you-go tiers. Volume and Enterprise customers may negotiate an SLA
              separately.
            </p>
            <p>
              We may perform maintenance with reasonable notice. Scheduled downtime will be
              communicated via the status page.
            </p>
          </Section>

          <Section title="10. Limitation of liability">
            <p>
              To the maximum extent permitted by law, useknockout is provided &quot;as is&quot;
              without warranties of any kind, express or implied.
            </p>
            <p>
              We are <strong>not liable</strong> for indirect, incidental, special, consequential,
              or punitive damages, including lost profits or data, arising from your use of the
              Service.
            </p>
            <p>
              Our total liability for any claim related to the Service is limited to the amount
              you paid us in the 12 months preceding the claim, or $100, whichever is greater.
            </p>
          </Section>

          <Section title="11. Indemnification">
            <p>
              You agree to indemnify and hold harmless useknockout from any claims, damages, or
              expenses (including reasonable legal fees) arising from your use of the Service or
              violation of these Terms.
            </p>
          </Section>

          <Section title="12. Termination">
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                You may cancel your account at any time from dashboard settings.
              </li>
              <li>
                We may suspend or terminate your account for violation of these Terms, with or
                without notice.
              </li>
              <li>
                On termination, your API tokens are immediately revoked. Data deletion follows
                our{" "}
                <a href="/privacy" className="text-kno-green hover:underline">
                  Privacy Policy
                </a>
                .
              </li>
            </ul>
          </Section>

          <Section title="13. Governing law">
            <p>
              These Terms are governed by the laws of the United States. Any disputes will be
              resolved in the state or federal courts located in the United States.
            </p>
          </Section>

          <Section title="14. Changes to these Terms">
            <p>
              We may update these Terms from time to time. Material changes will be posted here
              with an updated date. Continued use after changes constitutes acceptance. If you
              disagree with any changes, stop using the Service and delete your account.
            </p>
          </Section>

          <Section title="15. Contact">
            <p>
              Questions about these Terms? Email{" "}
              <a href="mailto:hi@useknockout.com" className="text-kno-green hover:underline">
                hi@useknockout.com
              </a>
              .
            </p>
          </Section>
        </article>
      </main>
      <Footer />
    </>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-8">
      <h2
        className="font-bold m-0 mb-3"
        style={{ fontSize: 22, letterSpacing: "-0.015em", lineHeight: 1.3 }}
      >
        {title}
      </h2>
      <div className="text-[15px] leading-[1.7] text-kno-black space-y-3">
        {children}
      </div>
    </section>
  );
}
