import Footer from '../components/landing/Footer'
import Navbar from '../components/landing/Navbar'

export function CsaePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-12">
        <div className="container mx-auto px-6 max-w-4xl">
          <article className="prose prose-sm prose-rose max-w-none space-y-6 text-rose-800">
            <div>
              <h1 className="mb-2 text-3xl font-bold text-rose-900">
                Child Sexual Abuse and Exploitation (CSAE) Standards
              </h1>
              <p className="text-sm text-rose-600">
                <strong>Last Updated:</strong> March 11, 2026
              </p>
            </div>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-rose-900">1. Zero Tolerance Policy</h2>
              <p>
                Drawback maintains a <strong>zero-tolerance policy</strong> regarding child sexual abuse and exploitation (CSAE).
                Any content or behavior that exploits, endangers, or sexualizes minors is strictly prohibited.
              </p>
              <h3 className="text-xl font-semibold text-rose-900">1.1 Prohibited Content and Conduct</h3>
              <ul className="ml-4 list-inside list-disc space-y-1 text-sm">
                <li>CSAM, solicitation, or facilitation of child exploitation material</li>
                <li>Grooming behavior or attempts to establish inappropriate relationships with minors</li>
                <li>Sexualized content involving minors, including cartoon or AI-generated depictions</li>
                <li>Sharing links to external sites containing child exploitation content</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-rose-900">2. Detection and Prevention</h2>
              <h3 className="text-xl font-semibold text-rose-900">2.1 Proactive Safeguards</h3>
              <ul className="ml-4 list-inside list-disc space-y-1 text-sm">
                <li>Email verification for account registration</li>
                <li>Opt-in chat request model before private collaboration</li>
                <li>User blocking and profile visibility controls</li>
                <li>Safety monitoring and abuse-review workflows</li>
              </ul>
              <h3 className="text-xl font-semibold text-rose-900">2.2 Technical Measures</h3>
              <ul className="ml-4 list-inside list-disc space-y-1 text-sm">
                <li>Session metadata logging (for security and lawful investigations)</li>
                <li>Rate limiting and abuse prevention controls</li>
                <li>Secure transport using HTTPS/WSS</li>
                <li>Audit trails for moderation and enforcement actions</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-rose-900">3. Reporting Mechanisms</h2>
              <h3 className="text-xl font-semibold text-rose-900">3.1 User Reporting</h3>
              <ul className="ml-4 list-inside list-disc space-y-1 text-sm">
                <li>In-app user reporting for safety concerns</li>
                <li>Email reporting to <strong>safety@drawback.chat</strong> or <strong>abuse@drawback.chat</strong></li>
                <li>Reports reviewed within 24 hours, with CSAE reports prioritized</li>
              </ul>
              <h3 className="text-xl font-semibold text-rose-900">3.2 Anonymous Reporting</h3>
              <p>
                We accept anonymous safety reports. Reporter identity is protected and is never disclosed to the reported user.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-rose-900">4. Investigation and Response</h2>
              <h3 className="text-xl font-semibold text-rose-900">4.1 Investigation Process</h3>
              <ol className="ml-4 list-inside list-decimal space-y-1 text-sm">
                <li>Immediate containment and evidence preservation</li>
                <li>Safety team review and case triage</li>
                <li>Escalation for legal and law-enforcement cooperation when required</li>
                <li>Action and documentation with a complete audit trail</li>
              </ol>
              <h3 className="text-xl font-semibold text-rose-900">4.2 Response Timeline</h3>
              <ul className="ml-4 list-inside list-disc space-y-1 text-sm">
                <li>Urgent CSAE reports are prioritized immediately</li>
                <li>Confirmed illegal content is reported according to applicable law</li>
                <li>Accounts may be suspended or permanently banned without warning</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-rose-900">5. Enforcement Actions</h2>
              <ul className="ml-4 list-inside list-disc space-y-1 text-sm">
                <li>Immediate account restriction or permanent ban for CSAE violations</li>
                <li>Removal of violating content and related access restrictions</li>
                <li>Evidence retention for lawful reporting and investigations</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-rose-900">6. Cooperation with Law Enforcement</h2>
              <p>
                Drawback cooperates with lawful requests and mandatory reporting obligations, including reporting to NCMEC where applicable.
              </p>
              <ul className="ml-4 list-inside list-disc space-y-1 text-sm">
                <li>Secure chain-of-custody and preservation of relevant records</li>
                <li>Coordinated disclosure to avoid compromising active investigations</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-rose-900">7. Minor Protection</h2>
              <ul className="ml-4 list-inside list-disc space-y-1 text-sm">
                <li>Drawback is not intended for children under 13</li>
                <li>Protective controls for visibility, communication, and moderation</li>
                <li>Additional safeguards may be applied for at-risk account activity</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-rose-900">8. Staff Training and Access Controls</h2>
              <ul className="ml-4 list-inside list-disc space-y-1 text-sm">
                <li>Safety personnel receive CSAE response training</li>
                <li>Access to sensitive data follows least-privilege principles</li>
                <li>Access and moderation actions are logged and auditable</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-rose-900">9. Transparency and Accountability</h2>
              <p>
                We continuously review safety operations, improve controls, and maintain internal accountability for response quality.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-rose-900">10. User Education</h2>
              <p>
                Drawback provides guidance on safe usage, suspicious behavior reporting, and emergency resources.
              </p>
              <p className="text-sm">
                Community guidelines: <a href="https://drawback.chat/community-guidelines" target="_blank" rel="noopener noreferrer">https://drawback.chat/community-guidelines</a>
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-rose-900">11. Continuous Improvement</h2>
              <p>
                These standards are reviewed regularly and updated as legal requirements, threat patterns, and platform capabilities evolve.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-rose-900">12. Contact Information</h2>
              <p className="text-sm font-semibold text-rose-900"><strong>Safety:</strong> safety@drawback.chat</p>
              <p className="text-sm font-semibold text-rose-900"><strong>Abuse Reports:</strong> abuse@drawback.chat</p>
              <p className="text-sm font-semibold text-rose-900"><strong>Legal/Law Enforcement:</strong> legal@drawback.chat</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-rose-900">13. Emergency Resources</h2>
              <p>
                If you or someone you know is in immediate danger, contact local emergency services.
              </p>
              <ul className="ml-4 list-inside list-disc space-y-1 text-sm">
                <li>NCMEC CyberTipline: 1-800-843-5678 or cybertipline.org</li>
                <li>FBI IC3: ic3.gov</li>
                <li>INHOPE: inhope.org</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-rose-900">14. Commitment Statement</h2>
              <p>
                Protecting children from abuse and exploitation is a core safety commitment at Drawback. We will continue strengthening safeguards,
                cooperating with authorities, and enforcing violations decisively.
              </p>
            </section>

            <hr className="border-rose-300" />

            <p className="text-center text-sm text-rose-600">
              <strong>End of CSAE Standards</strong>
            </p>
          </article>
        </div>
      </main>
      <Footer />
    </div>
  )
}
