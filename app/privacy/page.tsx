import type { Metadata } from "next";
import { TopNav } from "@/components/TopNav";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How useknockout collects, uses, and protects your data.",
  robots: { index: true, follow: true },
};

export default function PrivacyPage() {
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
              Privacy Policy
            </h1>
            <p className="text-[14px] text-kno-text-gray mt-2">
              Last updated: May 8, 2026
            </p>
          </header>

          <Section title="1. Who we are">
            <p>
              useknockout (&quot;we,&quot; &quot;us,&quot; &quot;our&quot;) operates the website{" "}
              <strong>useknockout.com</strong> and the background-removal API at{" "}
              <strong>api.useknockout.com</strong>. For questions about this policy, contact us
              at{" "}
              <a href="mailto:hi@useknockout.com" className="text-kno-green hover:underline">
                hi@useknockout.com
              </a>
              .
            </p>
          </Section>

          <Section title="2. Information we collect">
            <h3 className="font-semibold text-[16px] mt-4 mb-2">Account data</h3>
            <p>
              When you sign up we collect your <strong>email address</strong>. If you sign in
              with Google OAuth we also receive your name and profile picture from Google.
            </p>

            <h3 className="font-semibold text-[16px] mt-4 mb-2">Payment data</h3>
            <p>
              Billing is handled by <strong>Stripe</strong>. We never see or store your full
              card number. We store your Stripe customer ID to link your subscription to your
              account.
            </p>

            <h3 className="font-semibold text-[16px] mt-4 mb-2">Usage data</h3>
            <p>
              We log each API call: endpoint, HTTP status, response latency, and timestamp. We
              use this to calculate billing, display your usage dashboard, and monitor service
              health. Logs are retained for 90 days.
            </p>

            <h3 className="font-semibold text-[16px] mt-4 mb-2">Images</h3>
            <p>
              Images you send to the API are processed in memory on GPU workers and{" "}
              <strong>are not stored</strong> after the response is returned. We do not use your
              images for model training.
            </p>

            <h3 className="font-semibold text-[16px] mt-4 mb-2">Automatic data</h3>
            <p>
              Like most websites, our servers record your IP address, browser type, and pages
              visited. Vercel (our hosting provider) and Cloudflare (our DNS/CDN provider) may
              collect similar data under their own privacy policies.
            </p>
          </Section>

          <Section title="3. How we use your information">
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Provide and maintain the service</li>
              <li>Process payments and send invoices via Stripe</li>
              <li>Send transactional emails (sign-in codes, billing receipts)</li>
              <li>Monitor for abuse, enforce rate limits, and prevent fraud</li>
              <li>Improve the API and website</li>
            </ul>
            <p className="mt-3">
              We do <strong>not</strong> sell your personal data. We do <strong>not</strong> run
              third-party advertising trackers.
            </p>
          </Section>

          <Section title="4. Third-party services">
            <p>We share data with these providers only as needed to operate the service:</p>
            <ul className="list-disc pl-5 space-y-1.5 mt-2">
              <li>
                <strong>Supabase</strong> — authentication and database (
                <a
                  href="https://supabase.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-kno-green hover:underline"
                >
                  privacy policy
                </a>
                )
              </li>
              <li>
                <strong>Stripe</strong> — payment processing (
                <a
                  href="https://stripe.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-kno-green hover:underline"
                >
                  privacy policy
                </a>
                )
              </li>
              <li>
                <strong>Vercel</strong> — website hosting (
                <a
                  href="https://vercel.com/legal/privacy-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-kno-green hover:underline"
                >
                  privacy policy
                </a>
                )
              </li>
              <li>
                <strong>Modal</strong> — GPU compute for image processing (
                <a
                  href="https://modal.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-kno-green hover:underline"
                >
                  privacy policy
                </a>
                )
              </li>
              <li>
                <strong>Cloudflare</strong> — DNS and email routing (
                <a
                  href="https://www.cloudflare.com/privacypolicy/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-kno-green hover:underline"
                >
                  privacy policy
                </a>
                )
              </li>
              <li>
                <strong>Resend</strong> — transactional email delivery (
                <a
                  href="https://resend.com/legal/privacy-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-kno-green hover:underline"
                >
                  privacy policy
                </a>
                )
              </li>
            </ul>
          </Section>

          <Section title="5. Cookies">
            <p>
              We use <strong>essential cookies only</strong> — a session cookie to keep you
              signed in. We do not use analytics cookies or tracking pixels. No cookie banner is
              required because we do not set non-essential cookies.
            </p>
          </Section>

          <Section title="6. Data retention">
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Account data is retained until you delete your account.</li>
              <li>API usage logs are retained for 90 days, then deleted.</li>
              <li>Images are processed in memory and never persisted.</li>
              <li>
                Stripe retains payment data per their own retention policy (typically 7 years
                for tax/legal compliance).
              </li>
            </ul>
          </Section>

          <Section title="7. Your rights">
            <p>You can at any time:</p>
            <ul className="list-disc pl-5 space-y-1.5 mt-2">
              <li>
                <strong>Access</strong> — view your data on the dashboard or email us for an
                export.
              </li>
              <li>
                <strong>Delete</strong> — delete your account from dashboard settings. This
                removes your profile, tokens, and usage history.
              </li>
              <li>
                <strong>Correct</strong> — update your email from dashboard settings.
              </li>
              <li>
                <strong>Object / Restrict</strong> — email us at{" "}
                <a href="mailto:hi@useknockout.com" className="text-kno-green hover:underline">
                  hi@useknockout.com
                </a>{" "}
                and we will address your request within 30 days.
              </li>
            </ul>
            <p className="mt-3">
              If you are in the EU/EEA, you have additional rights under GDPR. Contact us and
              we will comply.
            </p>
          </Section>

          <Section title="8. Security">
            <p>
              API tokens are SHA-256 hashed before storage — we never store the raw token.
              Passwords are managed by Supabase Auth using bcrypt. All traffic is encrypted via
              TLS. We follow industry-standard practices but cannot guarantee absolute security.
            </p>
          </Section>

          <Section title="9. Children">
            <p>
              useknockout is not directed at children under 13. We do not knowingly collect data
              from children. If you believe a child has provided us personal data, contact us
              and we will delete it.
            </p>
          </Section>

          <Section title="10. Changes to this policy">
            <p>
              We may update this policy from time to time. Material changes will be posted here
              with an updated &quot;Last updated&quot; date. Continued use of the service after
              changes constitutes acceptance.
            </p>
          </Section>

          <Section title="11. Contact">
            <p>
              Questions? Email{" "}
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
