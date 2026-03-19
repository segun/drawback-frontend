import Footer from '../components/landing/Footer'
import Navbar from '../components/landing/Navbar'

export function EulaPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-12">
        <div className="container mx-auto px-6 max-w-4xl">
          <article className="prose prose-sm prose-rose max-w-none space-y-6 text-rose-800">
            <div>
              <h1 className="mb-2 text-3xl font-bold text-rose-900">Terms of Service</h1>
              <p className="text-sm text-rose-600">
                Drawback — Real-Time Collaborative Drawing Platform
              </p>
              <p className="text-sm text-rose-600">
                <strong>Last Updated:</strong> March 19, 2026 &nbsp;|&nbsp;{' '}
                <strong>Effective Date:</strong> March 19, 2026
              </p>
            </div>

            <section className="space-y-2">
              <h2 className="text-2xl font-bold text-rose-900">Table of Contents</h2>
              <ol className="ml-4 list-inside list-decimal space-y-1 text-sm">
                <li><a href="#acceptance-of-terms" className="text-rose-600 underline hover:text-rose-800">Acceptance of Terms</a></li>
                <li><a href="#eligibility" className="text-rose-600 underline hover:text-rose-800">Eligibility</a></li>
                <li><a href="#account-registration" className="text-rose-600 underline hover:text-rose-800">Account Registration and Security</a></li>
                <li><a href="#license" className="text-rose-600 underline hover:text-rose-800">License to Use the Service</a></li>
                <li><a href="#subscriptions" className="text-rose-600 underline hover:text-rose-800">Subscriptions and Billing</a></li>
                <li><a href="#user-content" className="text-rose-600 underline hover:text-rose-800">User-Generated Content</a></li>
                <li><a href="#acceptable-use" className="text-rose-600 underline hover:text-rose-800">Acceptable Use Policy</a></li>
                <li><a href="#child-safety" className="text-rose-600 underline hover:text-rose-800">Child Safety and Zero Tolerance</a></li>
                <li><a href="#reporting" className="text-rose-600 underline hover:text-rose-800">Reporting, Moderation, and Enforcement</a></li>
                <li><a href="#privacy" className="text-rose-600 underline hover:text-rose-800">Privacy</a></li>
                <li><a href="#intellectual-property" className="text-rose-600 underline hover:text-rose-800">Intellectual Property</a></li>
                <li><a href="#third-party" className="text-rose-600 underline hover:text-rose-800">Third-Party Services</a></li>
                <li><a href="#termination" className="text-rose-600 underline hover:text-rose-800">Termination</a></li>
                <li><a href="#disclaimer" className="text-rose-600 underline hover:text-rose-800">Disclaimer of Warranties</a></li>
                <li><a href="#liability" className="text-rose-600 underline hover:text-rose-800">Limitation of Liability</a></li>
                <li><a href="#indemnification" className="text-rose-600 underline hover:text-rose-800">Indemnification</a></li>
                <li><a href="#governing-law" className="text-rose-600 underline hover:text-rose-800">Governing Law and Dispute Resolution</a></li>
                <li><a href="#changes" className="text-rose-600 underline hover:text-rose-800">Changes to These Terms</a></li>
                <li><a href="#miscellaneous" className="text-rose-600 underline hover:text-rose-800">Miscellaneous</a></li>
                <li><a href="#contact" className="text-rose-600 underline hover:text-rose-800">Contact Us</a></li>
              </ol>
            </section>

            <hr className="border-rose-300" />

            <section id="acceptance-of-terms" className="space-y-4">
              <h2 className="text-2xl font-bold text-rose-900">1. Acceptance of Terms</h2>
              <p>
                By downloading, installing, accessing, or using the Drawback application or any related service
                (collectively, the "Service"), you agree to be bound by these Terms of Service ("Terms"), our{' '}
                <a href="/privacy" className="text-rose-600 underline hover:text-rose-800">Privacy Policy</a>, and our{' '}
                <a href="/csae" className="text-rose-600 underline hover:text-rose-800">CSAE Standards</a>, which
                are incorporated herein by reference. If you do not agree to all of these Terms, you must not use
                the Service.
              </p>
              <p>
                These Terms constitute a legally binding agreement between you ("User", "you", or "your") and
                Drawback ("Company", "we", "us", or "our").
              </p>
              <p>
                Your continued use of the Service after any modification to these Terms constitutes your binding
                acceptance of the updated Terms.
              </p>
            </section>

            <section id="eligibility" className="space-y-4">
              <h2 className="text-2xl font-bold text-rose-900">2. Eligibility</h2>

              <h3 className="text-xl font-semibold text-rose-900">2.1 Minimum Age</h3>
              <p>
                You must be at least <strong>13 years of age</strong> to use the Service. By creating an account,
                you represent and warrant that you meet this requirement.
              </p>

              <h3 className="text-xl font-semibold text-rose-900">2.2 Users Under 18</h3>
              <p>
                If you are between 13 and 17 years of age (or the applicable age of majority in your
                jurisdiction), you may only use the Service with the knowledge, supervision, and consent of a
                parent or legal guardian. Your parent or guardian must agree to these Terms on your behalf and
                accepts responsibility for your compliance with them.
              </p>

              <h3 className="text-xl font-semibold text-rose-900">2.3 Legal Capacity</h3>
              <p>
                You represent that you have the full right, power, and authority to enter into these Terms and
                that doing so does not violate any other agreement to which you are a party.
              </p>
            </section>

            <section id="account-registration" className="space-y-4">
              <h2 className="text-2xl font-bold text-rose-900">3. Account Registration and Security</h2>

              <h3 className="text-xl font-semibold text-rose-900">3.1 Account Creation</h3>
              <p>
                To access most features of the Service, you must register for an account by providing a valid
                email address, a display name, and a password. You must verify your email address before your
                account is activated.
              </p>

              <h3 className="text-xl font-semibold text-rose-900">3.2 Accuracy of Information</h3>
              <p>
                You agree to provide accurate and complete information during registration and to keep this
                information up to date. You must not create an account using false identity, impersonation, or on
                behalf of another person without their consent.
              </p>

              <h3 className="text-xl font-semibold text-rose-900">3.3 Account Security</h3>
              <p>You are solely responsible for:</p>
              <ul className="ml-4 list-inside list-disc space-y-1 text-sm">
                <li>Maintaining the confidentiality of your password</li>
                <li>All activity that occurs under your account</li>
                <li>
                  Notifying us immediately at <strong>support@drawback.chat</strong> if you suspect unauthorized
                  access to your account
                </li>
              </ul>
              <p>
                We are not liable for any loss resulting from unauthorized use of your account where you have
                failed to maintain adequate security.
              </p>

              <h3 className="text-xl font-semibold text-rose-900">3.4 One Account Per Person</h3>
              <p>
                You may not create multiple accounts. If we detect duplicate accounts, we reserve the right to
                suspend or terminate the duplicate account(s) without notice.
              </p>

              <h3 className="text-xl font-semibold text-rose-900">3.5 Account Deletion</h3>
              <p>
                You may delete your account at any time from within the application. Account deletion is
                permanent and irreversible. Refer to our{' '}
                <a href="/privacy" className="text-rose-600 underline hover:text-rose-800">Privacy Policy</a> for
                details on data handling upon deletion.
              </p>
            </section>

            <section id="license" className="space-y-4">
              <h2 className="text-2xl font-bold text-rose-900">4. License to Use the Service</h2>

              <h3 className="text-xl font-semibold text-rose-900">4.1 Grant of License</h3>
              <p>
                Subject to your compliance with these Terms, we grant you a limited, non-exclusive,
                non-transferable, non-sublicensable, revocable license to:
              </p>
              <ul className="ml-4 list-inside list-disc space-y-1 text-sm">
                <li>Download and install the application on your personal device(s)</li>
                <li>Access and use the Service for your personal, non-commercial purposes</li>
              </ul>

              <h3 className="text-xl font-semibold text-rose-900">4.2 Restrictions</h3>
              <p>You must not:</p>
              <ul className="ml-4 list-inside list-disc space-y-1 text-sm">
                <li>Copy, modify, distribute, sell, or lease any part of the Service or its underlying software</li>
                <li>
                  Reverse-engineer, decompile, disassemble, or attempt to derive the source code of the Service
                </li>
                <li>Build competing products or services using the Service or its components</li>
                <li>
                  Access the Service by any means other than the officially provided application or API
                </li>
                <li>
                  Use automated tools (bots, scrapers, crawlers) to access or interact with the Service
                </li>
                <li>Remove, alter, or obscure any proprietary notices within the Service</li>
              </ul>

              <h3 className="text-xl font-semibold text-rose-900">4.3 Platform Terms</h3>
              <p>
                If you access the Service through a third-party platform (Apple App Store, Google Play Store),
                you must also comply with that platform's terms of service. In the event of a conflict, the more
                restrictive terms apply.
              </p>

              <h3 className="text-xl font-semibold text-rose-900">4.4 No Implied License</h3>
              <p>
                Nothing in these Terms grants you any right to our trademarks, service marks, trade names,
                logos, or other distinctive brand features beyond what is expressly stated.
              </p>
            </section>

            <section id="subscriptions" className="space-y-4">
              <h2 className="text-2xl font-bold text-rose-900">5. Subscriptions and Billing</h2>

              <h3 className="text-xl font-semibold text-rose-900">5.1 Free and Paid Features</h3>
              <p>
                Certain features of the Service are available without charge. Access to premium features
                ("Discovery Mode" or other subscription-gated features) requires a paid subscription
                ("Subscription").
              </p>

              <h3 className="text-xl font-semibold text-rose-900">5.2 Subscription Plans and Pricing</h3>
              <p>
                Current pricing and plan details are available within the application at the time of purchase.
                We reserve the right to change pricing at any time, with reasonable notice provided to active
                subscribers.
              </p>

              <h3 className="text-xl font-semibold text-rose-900">5.3 Billing and Renewal</h3>
              <p>
                Subscriptions are billed on a recurring basis (monthly or annual, as selected). Your
                subscription will <strong>automatically renew</strong> at the end of each billing period unless
                you cancel before the renewal date through the platform through which you subscribed (Apple App
                Store or Google Play Store).
              </p>

              <h3 className="text-xl font-semibold text-rose-900">5.4 Platform Billing</h3>
              <p>All purchases are processed by the platform through which you subscribed:</p>
              <ul className="ml-4 list-inside list-disc space-y-1 text-sm">
                <li>
                  <strong>iOS users:</strong> Billing is managed by Apple. Contact Apple Support for billing
                  issues.
                </li>
                <li>
                  <strong>Android users:</strong> Billing is managed by Google. Contact Google Play Support for
                  billing issues.
                </li>
              </ul>
              <p>
                We do not have access to your payment card details. All billing disputes must be raised with
                the applicable platform.
              </p>

              <h3 className="text-xl font-semibold text-rose-900">5.5 Cross-Platform Access</h3>
              <p>
                A Subscription purchased on one platform grants access across all supported platforms when you
                are logged into the same Drawback account. Revenue and billing remain associated with the
                platform of original purchase.
              </p>

              <h3 className="text-xl font-semibold text-rose-900">5.6 Refunds</h3>
              <p>
                Refund eligibility is governed by the refund policy of the platform through which you made
                your purchase (Apple App Store or Google Play Store). We do not directly issue refunds for
                subscription purchases made through third-party platforms.
              </p>

              <h3 className="text-xl font-semibold text-rose-900">5.7 Cancellation</h3>
              <p>
                You may cancel your Subscription at any time through the subscription management settings of
                your platform (Apple App Store or Google Play Store). Cancellation takes effect at the end of
                the current billing period. You will retain access to Subscription features until that date.
              </p>

              <h3 className="text-xl font-semibold text-rose-900">5.8 Free Trials</h3>
              <p>
                Where offered, a free trial will convert to a paid Subscription at the end of the trial period
                unless you cancel before the trial expires. You may be required to provide payment information
                to begin a free trial.
              </p>
            </section>

            <section id="user-content" className="space-y-4">
              <h2 className="text-2xl font-bold text-rose-900">6. User-Generated Content</h2>

              <h3 className="text-xl font-semibold text-rose-900">6.1 Definition</h3>
              <p>
                "User Content" means any content you create, submit, upload, transmit, or share through the
                Service, including but not limited to drawings, strokes, saved sessions, display names, and any
                other materials you contribute.
              </p>

              <h3 className="text-xl font-semibold text-rose-900">6.2 Your Ownership</h3>
              <p>
                You retain ownership of your User Content. We do not claim ownership over what you create.
              </p>

              <h3 className="text-xl font-semibold text-rose-900">6.3 License to Drawback</h3>
              <p>
                By submitting User Content to the Service, you grant us a worldwide, royalty-free,
                non-exclusive, sublicensable license to:
              </p>
              <ul className="ml-4 list-inside list-disc space-y-1 text-sm">
                <li>Store, process, and display your User Content solely to operate and provide the Service</li>
                <li>Reproduce or transmit your User Content to participants in your drawing sessions</li>
                <li>Create and store backups of your User Content</li>
              </ul>
              <p>
                This license is limited to operating the Service and does not extend to commercial exploitation
                of your User Content.
              </p>

              <h3 className="text-xl font-semibold text-rose-900">6.4 Your Responsibility</h3>
              <p>
                You are solely responsible for your User Content and the consequences of sharing it. You
                represent and warrant that:
              </p>
              <ul className="ml-4 list-inside list-disc space-y-1 text-sm">
                <li>You own or have the necessary rights to submit your User Content</li>
                <li>
                  Your User Content does not infringe any third-party intellectual property rights
                </li>
                <li>Your User Content complies with these Terms and all applicable laws</li>
              </ul>

              <h3 className="text-xl font-semibold text-rose-900">6.5 Content Shared with Others</h3>
              <p>
                When you participate in a collaborative drawing session, your drawing activity is visible to
                all session participants in real time. You acknowledge this and accept responsibility for what
                you create and share during sessions.
              </p>

              <h3 className="text-xl font-semibold text-rose-900">6.6 Removal</h3>
              <p>
                We reserve the right, but have no obligation, to review and remove any User Content at our
                sole discretion if we determine that it violates these Terms or is otherwise objectionable.
              </p>
            </section>

            <section id="acceptable-use" className="space-y-4">
              <h2 className="text-2xl font-bold text-rose-900">7. Acceptable Use Policy</h2>

              <h3 className="text-xl font-semibold text-rose-900">7.1 Prohibited Conduct</h3>
              <p>You agree not to use the Service to:</p>

              <h4 className="font-semibold text-rose-800">Harmful and Illegal Content:</h4>
              <ul className="ml-4 list-inside list-disc space-y-1 text-sm">
                <li>
                  Create, upload, transmit, or share content that is illegal, harmful, threatening, abusive,
                  harassing, tortious, defamatory, vulgar, obscene, or otherwise objectionable
                </li>
                <li>Post or transmit unsolicited or unauthorized advertising, spam, or chain messages</li>
                <li>Defame, impersonate, or harass other users</li>
              </ul>

              <h4 className="font-semibold text-rose-800">System Integrity:</h4>
              <ul className="ml-4 list-inside list-disc space-y-1 text-sm">
                <li>
                  Disrupt, interfere with, or overburden the Service's servers or networks
                </li>
                <li>Introduce viruses, trojans, worms, or other malicious code</li>
                <li>
                  Circumvent, disable, or interfere with security-related features of the Service
                </li>
                <li>
                  Attempt to gain unauthorized access to any part of the Service, other accounts, or systems
                </li>
              </ul>

              <h4 className="font-semibold text-rose-800">Fraudulent Activity:</h4>
              <ul className="ml-4 list-inside list-disc space-y-1 text-sm">
                <li>Misrepresent your identity or affiliation</li>
                <li>Collect or harvest personal data of other users without their consent</li>
                <li>Engage in any activity designed to deceive other users</li>
              </ul>

              <h4 className="font-semibold text-rose-800">Intellectual Property:</h4>
              <ul className="ml-4 list-inside list-disc space-y-1 text-sm">
                <li>
                  Create or transmit content that infringes patents, trademarks, copyrights, or trade secrets
                  of any party
                </li>
                <li>
                  Use the Service to violate the privacy or intellectual property rights of others
                </li>
              </ul>

              <h3 className="text-xl font-semibold text-rose-900">7.2 Consequences of Violations</h3>
              <p>
                Violation of this Acceptable Use Policy may result in immediate suspension or termination of
                your account, removal of your content, reporting to law enforcement, and/or legal action.
              </p>
            </section>

            <section id="child-safety" className="space-y-4">
              <h2 className="text-2xl font-bold text-rose-900">8. Child Safety and Zero Tolerance</h2>

              <h3 className="text-xl font-semibold text-rose-900">8.1 Prohibited Content Involving Minors</h3>
              <p>
                We maintain a <strong>zero-tolerance policy</strong> regarding child sexual abuse and
                exploitation (CSAE). The following are strictly prohibited on our platform:
              </p>
              <ul className="ml-4 list-inside list-disc space-y-1 text-sm">
                <li>
                  Any depiction, description, or solicitation involving minors in sexually explicit or
                  suggestive contexts
                </li>
                <li>
                  Grooming behavior or attempts to establish inappropriate relationships with minors
                </li>
                <li>
                  Creation, sharing, requesting, or facilitating access to child sexual abuse material (CSAM)
                  in any form, including AI-generated or illustrated depictions
                </li>
                <li>Age-inappropriate sexual content directed at or involving minors</li>
                <li>
                  Attempts to obtain personal information from minors for exploitative purposes
                </li>
              </ul>

              <h3 className="text-xl font-semibold text-rose-900">8.2 Mandatory Reporting</h3>
              <p>
                We are required by law (18 U.S.C. § 2258A) to report confirmed or suspected CSAM to the{' '}
                <strong>National Center for Missing &amp; Exploited Children (NCMEC)</strong>. By using the
                Service, you acknowledge this obligation and agree not to engage in conduct that would trigger it.
              </p>

              <h3 className="text-xl font-semibold text-rose-900">8.3 Preservation of Evidence</h3>
              <p>
                In cases involving suspected CSAE, we will immediately preserve all relevant data (account
                information, content, session metadata, IP addresses) and cooperate fully with law enforcement.
              </p>

              <h3 className="text-xl font-semibold text-rose-900">8.4 Immediate Account Termination</h3>
              <p>
                Any account found to be involved in CSAE will be{' '}
                <strong>permanently and immediately terminated</strong> without warning, refund, or appeal.
                Law enforcement will be notified as required by law. For our full CSAE prevention and response
                standards, see our{' '}
                <a href="/csae" className="text-rose-600 underline hover:text-rose-800">CSAE Standards</a>.
              </p>
            </section>

            <section id="reporting" className="space-y-4">
              <h2 className="text-2xl font-bold text-rose-900">
                9. Reporting, Moderation, and Enforcement
              </h2>

              <h3 className="text-xl font-semibold text-rose-900">9.1 How to Report</h3>
              <p>
                You may report violations of these Terms, inappropriate content, or safety concerns through:
              </p>
              <ul className="ml-4 list-inside list-disc space-y-1 text-sm">
                <li>
                  <strong>In-app reporting:</strong> Use the report feature within the application
                </li>
                <li>
                  <strong>Email:</strong> <strong>safety@drawback.chat</strong> (urgent/safety matters) or{' '}
                  <strong>abuse@drawback.chat</strong>
                </li>
                <li>
                  <strong>CSAE reports:</strong> <strong>safety@drawback.chat</strong> (reviewed within 1 hour
                  for suspected CSAM)
                </li>
              </ul>
              <p>All reports are treated confidentially. Your identity is not disclosed to the reported user.</p>

              <h3 className="text-xl font-semibold text-rose-900">9.2 Report Types</h3>
              <p>We accept reports for:</p>
              <ul className="ml-4 list-inside list-disc space-y-1 text-sm">
                <li>
                  <strong>CSAE</strong> — Child abuse or exploitation (highest priority)
                </li>
                <li>
                  <strong>Harassment</strong> — Bullying, threats, or unwanted contact
                </li>
                <li>
                  <strong>Inappropriate Content</strong> — Offensive, graphic, or sexual content
                </li>
                <li>
                  <strong>Spam</strong> — Spam, advertisements, or bot behavior
                </li>
                <li>
                  <strong>Impersonation</strong> — Pretending to be someone else
                </li>
                <li>
                  <strong>Other</strong> — Violations not listed above
                </li>
              </ul>

              <h3 className="text-xl font-semibold text-rose-900">9.3 Our Response</h3>
              <p>We commit to:</p>
              <ul className="ml-4 list-inside list-disc space-y-1 text-sm">
                <li>Reviewing all reports within <strong>24 hours</strong></li>
                <li>
                  Taking immediate action on confirmed CSAE (within 1 hour for suspected CSAM)
                </li>
                <li>Maintaining confidentiality of reporter identities</li>
                <li>Providing investigation status updates where appropriate</li>
              </ul>

              <h3 className="text-xl font-semibold text-rose-900">9.4 Moderation Decisions</h3>
              <p>
                We reserve the right to remove content, suspend accounts, or take other enforcement actions at
                our sole discretion. Enforcement decisions are final, subject to any appeal process we may make
                available.
              </p>
            </section>

            <section id="privacy" className="space-y-4">
              <h2 className="text-2xl font-bold text-rose-900">10. Privacy</h2>
              <p>
                Your use of the Service is governed by our{' '}
                <a href="/privacy" className="text-rose-600 underline hover:text-rose-800">Privacy Policy</a>,
                which is incorporated into these Terms. By agreeing to these Terms, you also agree to our
                Privacy Policy.
              </p>
            </section>

            <section id="intellectual-property" className="space-y-4">
              <h2 className="text-2xl font-bold text-rose-900">11. Intellectual Property</h2>

              <h3 className="text-xl font-semibold text-rose-900">11.1 Drawback Ownership</h3>
              <p>
                The Service, including all software, content, features, graphics, design, and documentation,
                is owned by Drawback or its licensors and is protected by copyright, trademark, and other
                intellectual property laws. Nothing in these Terms grants you any rights in the Service beyond
                what is expressly stated.
              </p>

              <h3 className="text-xl font-semibold text-rose-900">11.2 Feedback</h3>
              <p>
                If you provide us with feedback, suggestions, or ideas relating to the Service ("Feedback"),
                you grant us a perpetual, irrevocable, royalty-free license to use and incorporate that
                Feedback into the Service without any obligation to compensate you.
              </p>

              <h3 className="text-xl font-semibold text-rose-900">11.3 DMCA and Copyright Claims</h3>
              <p>
                If you believe that your copyrighted work has been infringed by content on our Service, please
                contact us at <strong>legal@drawback.chat</strong> with:
              </p>
              <ul className="ml-4 list-inside list-disc space-y-1 text-sm">
                <li>A description of the copyrighted work you claim has been infringed</li>
                <li>A description of where the infringing material appears</li>
                <li>Your contact information</li>
                <li>
                  A statement of good faith belief that the use is not authorized
                </li>
                <li>
                  A statement, under penalty of perjury, that the information is accurate and you are the
                  copyright owner or authorized to act on their behalf
                </li>
              </ul>
            </section>

            <section id="third-party" className="space-y-4">
              <h2 className="text-2xl font-bold text-rose-900">12. Third-Party Services</h2>
              <p>
                The Service may contain links to, or integrate with, third-party websites, services, or
                platforms (including Apple App Store and Google Play Store). We are not responsible for the
                content, privacy practices, or terms of any third-party service. Your use of third-party
                services is at your own risk and subject to the applicable third-party terms.
              </p>
            </section>

            <section id="termination" className="space-y-4">
              <h2 className="text-2xl font-bold text-rose-900">13. Termination</h2>

              <h3 className="text-xl font-semibold text-rose-900">13.1 Termination by You</h3>
              <p>
                You may stop using the Service and delete your account at any time through the application
                settings. Termination does not entitle you to any refunds except as required by applicable law
                or platform policy.
              </p>

              <h3 className="text-xl font-semibold text-rose-900">13.2 Termination by Us</h3>
              <p>
                We reserve the right to suspend or permanently terminate your account and access to the
                Service at any time, with or without notice, for:
              </p>
              <ul className="ml-4 list-inside list-disc space-y-1 text-sm">
                <li>Violation of these Terms or our policies</li>
                <li>
                  Conduct that we determine, in our sole discretion, is harmful to other users, us, or the
                  integrity of the Service
                </li>
                <li>Legal requirements or requests from law enforcement</li>
                <li>Extended inactivity (with reasonable prior notice where practicable)</li>
              </ul>

              <h3 className="text-xl font-semibold text-rose-900">13.3 Effect of Termination</h3>
              <p>Upon termination:</p>
              <ul className="ml-4 list-inside list-disc space-y-1 text-sm">
                <li>Your license to use the Service immediately ends</li>
                <li>Your access to your account and User Content is revoked</li>
                <li>
                  We may delete your account data, subject to our data retention obligations under applicable
                  law
                </li>
                <li>
                  Provisions of these Terms that by their nature should survive termination will remain in
                  effect (including Sections 6, 11, 14, 15, 16, and 17)
                </li>
              </ul>
            </section>

            <section id="disclaimer" className="space-y-4">
              <h2 className="text-2xl font-bold text-rose-900">14. Disclaimer of Warranties</h2>
              <p className="font-semibold uppercase text-sm">
                The Service is provided "as is" and "as available," without warranties of any kind, express or
                implied, including but not limited to warranties of merchantability, fitness for a particular
                purpose, non-infringement, or uninterrupted or error-free operation.
              </p>
              <p>We do not warrant that:</p>
              <ul className="ml-4 list-inside list-disc space-y-1 text-sm">
                <li>The Service will meet your specific requirements</li>
                <li>
                  The Service will be available, uninterrupted, timely, secure, or error-free at all times
                </li>
                <li>Any errors or defects will be corrected</li>
                <li>
                  The Service or any servers that provide it are free of viruses or other harmful components
                </li>
              </ul>
              <p>
                Some jurisdictions do not allow the exclusion of implied warranties. If you reside in such a
                jurisdiction, the foregoing exclusions apply to the extent permitted by applicable law.
              </p>
            </section>

            <section id="liability" className="space-y-4">
              <h2 className="text-2xl font-bold text-rose-900">15. Limitation of Liability</h2>
              <p className="font-semibold uppercase text-sm">
                To the maximum extent permitted by applicable law, Drawback and its officers, directors,
                employees, agents, partners, licensors, and suppliers shall not be liable for any indirect,
                incidental, special, consequential, exemplary, or punitive damages, including but not limited
                to loss of profits, data, goodwill, or other intangible losses, arising out of or related to
                your access to or use of (or inability to use) the Service.
              </p>
              <p className="font-semibold uppercase text-sm">
                In no event shall our total aggregate liability to you for any claims arising from or related
                to the Service exceed the greater of: (a) the amount you paid to us in the twelve (12) months
                preceding the claim, or (b) one hundred US dollars (USD $100).
              </p>
              <p>
                Some jurisdictions do not allow the limitation or exclusion of liability for incidental or
                consequential damages. If you reside in such a jurisdiction, these limitations apply to the
                extent permitted by applicable law.
              </p>
            </section>

            <section id="indemnification" className="space-y-4">
              <h2 className="text-2xl font-bold text-rose-900">16. Indemnification</h2>
              <p>
                You agree to defend, indemnify, and hold harmless Drawback and its officers, directors,
                employees, agents, and licensors from and against any claims, liabilities, damages, judgments,
                awards, losses, costs, expenses, and fees (including reasonable attorneys' fees) arising out of
                or relating to:
              </p>
              <ul className="ml-4 list-inside list-disc space-y-1 text-sm">
                <li>Your use of the Service</li>
                <li>Your User Content</li>
                <li>Your violation of these Terms</li>
                <li>
                  Your violation of any third party's rights (including intellectual property or privacy
                  rights)
                </li>
                <li>Your violation of any applicable law or regulation</li>
              </ul>
            </section>

            <section id="governing-law" className="space-y-4">
              <h2 className="text-2xl font-bold text-rose-900">
                17. Governing Law and Dispute Resolution
              </h2>

              <h3 className="text-xl font-semibold text-rose-900">17.1 Governing Law</h3>
              <p>
                These Terms are governed by and construed in accordance with applicable law, without regard to
                conflict of law principles. If you are located in the United States, the laws of the state in
                which we are incorporated apply. For users in the European Union or United Kingdom, mandatory
                consumer protection laws of your country of residence apply despite this choice of law.
              </p>

              <h3 className="text-xl font-semibold text-rose-900">17.2 Informal Resolution</h3>
              <p>
                Before initiating any formal legal proceeding, you agree to first attempt to resolve any
                dispute by contacting us at <strong>legal@drawback.chat</strong>. We will make good-faith
                efforts to resolve the matter within 30 days.
              </p>

              <h3 className="text-xl font-semibold text-rose-900">17.3 Arbitration (US Users)</h3>
              <p>
                For users in the United States, any dispute that cannot be resolved informally shall be
                settled by binding arbitration on an individual basis, rather than in court, except that either
                party may bring claims in small claims court.{' '}
                <strong>
                  You waive your right to participate in a class action lawsuit or class-wide arbitration.
                </strong>
              </p>

              <h3 className="text-xl font-semibold text-rose-900">17.4 EU/UK Consumer Rights</h3>
              <p>
                If you are a consumer in the European Union or United Kingdom, you may be entitled to certain
                statutory rights that cannot be waived by contract, including rights to bring claims in local
                courts. Nothing in these Terms limits those rights.
              </p>

              <h3 className="text-xl font-semibold text-rose-900">17.5 Prohibitions</h3>
              <p>
                You agree not to initiate any legal proceedings relating to your use of the Service more than{' '}
                <strong>one (1) year</strong> after the cause of action arose, to the extent permitted by
                applicable law.
              </p>
            </section>

            <section id="changes" className="space-y-4">
              <h2 className="text-2xl font-bold text-rose-900">18. Changes to These Terms</h2>
              <p>
                We reserve the right to modify these Terms at any time. When we make material changes, we
                will:
              </p>
              <ul className="ml-4 list-inside list-disc space-y-1 text-sm">
                <li>Update the "Last Updated" date at the top of this document</li>
                <li>
                  Notify you via email (to the address associated with your account) or through an in-app
                  notification at least <strong>14 days</strong> before the changes take effect
                </li>
              </ul>
              <p>
                Your continued use of the Service after the effective date of the updated Terms constitutes
                your acceptance of those changes. If you do not accept the updated Terms, you must stop using
                the Service and delete your account before the changes take effect.
              </p>
            </section>

            <section id="miscellaneous" className="space-y-4">
              <h2 className="text-2xl font-bold text-rose-900">19. Miscellaneous</h2>

              <h3 className="text-xl font-semibold text-rose-900">19.1 Entire Agreement</h3>
              <p>
                These Terms, together with the{' '}
                <a href="/privacy" className="text-rose-600 underline hover:text-rose-800">Privacy Policy</a>{' '}
                and{' '}
                <a href="/csae" className="text-rose-600 underline hover:text-rose-800">CSAE Standards</a>,
                constitute the entire agreement between you and Drawback regarding the Service and supersede
                all prior agreements, representations, or understandings.
              </p>

              <h3 className="text-xl font-semibold text-rose-900">19.2 Severability</h3>
              <p>
                If any provision of these Terms is found to be invalid, illegal, or unenforceable, that
                provision will be modified to the minimum extent necessary to make it enforceable, or if
                modification is not possible, severed from these Terms. The remaining provisions will continue
                in full force and effect.
              </p>

              <h3 className="text-xl font-semibold text-rose-900">19.3 Waiver</h3>
              <p>
                Our failure to enforce any right or provision of these Terms will not constitute a waiver of
                that right or provision. Any waiver must be made in writing and signed by an authorized
                representative of Drawback to be effective.
              </p>

              <h3 className="text-xl font-semibold text-rose-900">19.4 Assignment</h3>
              <p>
                You may not assign or transfer your rights or obligations under these Terms without our prior
                written consent. We may freely assign or transfer our rights and obligations, including in
                connection with a merger, acquisition, or sale of assets, with notice to you.
              </p>

              <h3 className="text-xl font-semibold text-rose-900">19.5 No Third-Party Beneficiaries</h3>
              <p>
                These Terms do not create any third-party beneficiary rights except as expressly stated herein.
              </p>

              <h3 className="text-xl font-semibold text-rose-900">19.6 Headings</h3>
              <p>Section headings are for convenience only and have no legal effect.</p>
            </section>

            <section id="contact" className="space-y-4">
              <h2 className="text-2xl font-bold text-rose-900">20. Contact Us</h2>
              <p>
                For questions, concerns, or notices regarding these Terms, please contact us at:
              </p>
              <div className="ml-4 space-y-1 text-sm">
                <p>
                  <strong>General inquiries and Terms questions:</strong> legal@drawback.chat
                </p>
                <p>
                  <strong>User safety and abuse reports:</strong> safety@drawback.chat
                </p>
                <p>
                  <strong>Child safety / CSAE reports:</strong> safety@drawback.chat
                </p>
                <p>
                  <strong>General support:</strong> support@drawback.chat
                </p>
              </div>
              <p>
                We aim to respond to all legal and compliance inquiries within{' '}
                <strong>5 business days</strong>.
              </p>
            </section>

            <hr className="border-rose-300" />

            <p className="text-center text-sm text-rose-600">
              <em>
                By using Drawback, you acknowledge that you have read, understood, and agree to be bound by
                these Terms of Service.
              </em>
            </p>
          </article>
        </div>
      </main>
      <Footer />
    </div>
  )
}
