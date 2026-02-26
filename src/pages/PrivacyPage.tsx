import { Header } from '../components/common/Header'

export function PrivacyPage() {
  return (
    <div className="min-h-dvh bg-rose-50 text-rose-800">
      <Header isLoggedIn={false} />
      <main className="mx-auto max-w-4xl px-4 py-12 pb-20">
        <article className="prose prose-sm prose-rose max-w-none space-y-6 text-rose-800">
          <div>
            <h1 className="mb-2 text-3xl font-bold text-rose-900">Privacy Policy</h1>
            <p className="text-sm text-rose-600">
              <strong>Last Updated:</strong> February 25, 2026
            </p>
          </div>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-rose-900">1. Introduction</h2>
            <p>
              Drawback ("we," "us," "our," or "Company") operates a real-time collaborative drawing
              platform. This Privacy Policy explains how we collect, use, disclose, and safeguard your
              information when you use our service, including our website, mobile application, and
              related services (collectively, the "Service").
            </p>
            <p>
              Please read this Privacy Policy carefully. If you do not agree with our policies and
              practices, please do not use our Service.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-rose-900">2. Information We Collect</h2>

            <h3 className="text-xl font-semibold text-rose-900">2.1 Information You Provide Directly</h3>

            <div className="ml-4 space-y-3">
              <div>
                <h4 className="font-semibold text-rose-800">Account Registration:</h4>
                <ul className="ml-4 list-inside list-disc space-y-1 text-sm">
                  <li>Email address (required for account creation and identity verification)</li>
                  <li>Display name (used for profile identification and search)</li>
                  <li>Password (securely hashed, never stored in plain text)</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-rose-800">Profile Information:</h4>
                <ul className="ml-4 list-inside list-disc space-y-1 text-sm">
                  <li>Display name and profile mode (public or private)</li>
                  <li>Account settings and preferences</li>
                  <li>User blocks and blocked user lists</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-rose-800">Communication:</h4>
                <ul className="ml-4 list-inside list-disc space-y-1 text-sm">
                  <li>Chat requests and responses</li>
                  <li>Drawing sessions and collaborative canvases</li>
                  <li>Real-time drawing data (strokes, clears, emotes)</li>
                  <li>Session history (saved drawing sessions)</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-rose-800">Account Management:</h4>
                <ul className="ml-4 list-inside list-disc space-y-1 text-sm">
                  <li>Email address confirmation tokens</li>
                  <li>Password reset tokens (temporary, single-use)</li>
                  <li>Activity logs for account security purposes</li>
                </ul>
              </div>
            </div>

            <h3 className="text-xl font-semibold text-rose-900">2.2 Information Collected Automatically</h3>

            <div className="ml-4 space-y-3">
              <div>
                <h4 className="font-semibold text-rose-800">Connection and Session Data:</h4>
                <ul className="ml-4 list-inside list-disc space-y-1 text-sm">
                  <li>IP address</li>
                  <li>Device and browser information</li>
                  <li>Unique socket identifiers for real-time connection</li>
                  <li>Session duration and timestamps</li>
                  <li>Authentication tokens (JWT)</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-rose-800">Usage Data:</h4>
                <ul className="ml-4 list-inside list-disc space-y-1 text-sm">
                  <li>Drawing activities and interactions</li>
                  <li>Chat request patterns</li>
                  <li>Search queries</li>
                  <li>User connectivity events (login, logout, disconnection)</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-rose-900">3. How We Use Your Information</h2>

            <h3 className="text-xl font-semibold text-rose-900">3.1 Service Delivery</h3>
            <ul className="ml-4 list-inside list-disc space-y-1 text-sm">
              <li>Creating and maintaining your account</li>
              <li>Enabling real-time collaborative drawing features</li>
              <li>Processing chat requests and responses</li>
              <li>Delivering email confirmations and notifications</li>
              <li>Saving and retrieving drawing sessions</li>
            </ul>

            <h3 className="text-xl font-semibold text-rose-900">3.2 Security and Fraud Prevention</h3>
            <ul className="ml-4 list-inside list-disc space-y-1 text-sm">
              <li>Verifying user identity and ownership</li>
              <li>Detecting and preventing abuse, fraud, and unauthorized access</li>
              <li>Enforcing Terms of Service and other agreements</li>
              <li>Protecting the integrity of the Service</li>
            </ul>

            <h3 className="text-xl font-semibold text-rose-900">3.3 Communication</h3>
            <ul className="ml-4 list-inside list-disc space-y-1 text-sm">
              <li>Sending security alerts and account notifications</li>
              <li>Responding to inquiries and support requests</li>
              <li>Notifying you of changes to our Service</li>
              <li>Delivering password reset and email confirmation emails</li>
            </ul>

            <h3 className="text-xl font-semibold text-rose-900">3.4 Service Improvement</h3>
            <ul className="ml-4 list-inside list-disc space-y-1 text-sm">
              <li>Analyzing usage patterns and service statistics</li>
              <li>Identifying technical issues and optimizing performance</li>
              <li>Understanding user behavior to enhance features</li>
              <li>Conducting research for Service development</li>
            </ul>

            <h3 className="text-xl font-semibold text-rose-900">3.5 Legal Compliance</h3>
            <ul className="ml-4 list-inside list-disc space-y-1 text-sm">
              <li>Complying with legal obligations and court orders</li>
              <li>Protecting legal rights and preventing harm</li>
              <li>Enforcing agreements and policies</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-rose-900">4. How We Share Your Information</h2>

            <h3 className="text-xl font-semibold text-rose-900">4.1 With Other Users</h3>

            <div className="ml-4 space-y-3">
              <div>
                <h4 className="font-semibold text-rose-800">When You Have a Public Profile:</h4>
                <ul className="ml-4 list-inside list-disc space-y-1 text-sm">
                  <li>Your display name appears in search results and public user listings</li>
                  <li>Other users can find you via the public user search functionality</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-rose-800">During Collaborative Drawing:</h4>
                <ul className="ml-4 list-inside list-disc space-y-1 text-sm">
                  <li>
                    Drawing strokes, clears, and emotes are visible to all participants in the same
                    drawing session
                  </li>
                  <li>User presence information (who is in the room) is shared with session participants</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-rose-800">Chat Requests:</h4>
                <ul className="ml-4 list-inside list-disc space-y-1 text-sm">
                  <li>Chat request recipients see your user ID and associated information</li>
                  <li>Accepted chat participants can see your real-time drawing activity</li>
                </ul>
              </div>
            </div>

            <h3 className="text-xl font-semibold text-rose-900">4.2 When You Block Users</h3>
            <ul className="ml-4 list-inside list-disc space-y-1 text-sm">
              <li>You can block other users to prevent them from contacting you or seeing your profile</li>
              <li>Block relationships are maintained privately and are not disclosed</li>
            </ul>

            <h3 className="text-xl font-semibold text-rose-900">4.3 With Service Providers</h3>
            <ul className="ml-4 list-inside list-disc space-y-1 text-sm">
              <li>
                <strong>Email Service Provider:</strong> Email addresses are shared with our mail service
                provider (Nodemailer/SMTP) solely for sending transactional emails (confirmations,
                password resets)
              </li>
              <li>
                <strong>Cloud Infrastructure:</strong> Data may be stored on cloud infrastructure providers
              </li>
            </ul>

            <h3 className="text-xl font-semibold text-rose-900">4.4 Legal Requirements</h3>
            <ul className="ml-4 list-inside list-disc space-y-1 text-sm">
              <li>We may disclose information when required by law, court order, or government request</li>
              <li>We will provide notice of such disclosure unless legally prohibited</li>
            </ul>

            <h3 className="text-xl font-semibold text-rose-900">4.5 Business Transfers</h3>
            <ul className="ml-4 list-inside list-disc space-y-1 text-sm">
              <li>
                If Drawback is acquired, merged, or subject to bankruptcy proceedings, your information may
                be transferred as part of that transaction
              </li>
              <li>We will provide notice before your information becomes subject to a different privacy policy</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-rose-900">5. Data Security</h2>

            <h3 className="text-xl font-semibold text-rose-900">5.1 Security Measures</h3>
            <ul className="ml-4 list-inside list-disc space-y-1 text-sm">
              <li>Passwords are hashed using bcrypt (cost factor 12) before storage</li>
              <li>Sensitive data (passwords, tokens, socket IDs) are excluded from API responses</li>
              <li>JWT tokens are used for stateless authentication</li>
              <li>HTTPS/TLS encryption is used for all data in transit</li>
              <li>Input validation and SQL injection prevention measures are implemented</li>
            </ul>

            <h3 className="text-xl font-semibold text-rose-900">5.2 Limitations</h3>
            <ul className="ml-4 list-inside list-disc space-y-1 text-sm">
              <li>While we implement security measures, no system is completely secure</li>
              <li>Unauthorized access, hardware failure, and other factors may compromise security</li>
              <li>You are responsible for maintaining the confidentiality of your login credentials</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-rose-900">6. Your Privacy Rights and Choices</h2>

            <h3 className="text-xl font-semibold text-rose-900">6.1 Account Deletion</h3>
            <ul className="ml-4 list-inside list-disc space-y-1 text-sm">
              <li>You may delete your account at any time via the Settings section</li>
              <li>Upon deletion, your profile is removed and no longer searchable</li>
              <li>Drawing history and saved sessions associated with your account will be deleted</li>
              <li>This action is permanent and cannot be undone</li>
            </ul>

            <h3 className="text-xl font-semibold text-rose-900">6.2 Profile Visibility</h3>
            <ul className="ml-4 list-inside list-disc space-y-1 text-sm">
              <li>
                You can set your profile to <strong>Public</strong> (visible in searches) or{' '}
                <strong>Private</strong> (hidden from public listings)
              </li>
              <li>
                Other users cannot search for you when your profile is private, but may send requests if they
                know your account
              </li>
              <li>These settings can be changed at any time</li>
            </ul>

            <h3 className="text-xl font-semibold text-rose-900">6.3 User Blocking</h3>
            <ul className="ml-4 list-inside list-disc space-y-1 text-sm">
              <li>You can block users to prevent them from contacting you or seeing your profile</li>
              <li>You can unblock users at any time</li>
              <li>A list of your blocked users is available in your account settings</li>
            </ul>

            <h3 className="text-xl font-semibold text-rose-900">6.4 Data Access</h3>
            <ul className="ml-4 list-inside list-disc space-y-1 text-sm">
              <li>You can access your personal information through your account profile</li>
              <li>Contact us to request a copy of all data associated with your account</li>
            </ul>

            <h3 className="text-xl font-semibold text-rose-900">6.5 Data Correction</h3>
            <ul className="ml-4 list-inside list-disc space-y-1 text-sm">
              <li>You can update your display name and profile settings directly</li>
              <li>Contact us to request corrections to other personal information</li>
            </ul>

            <h3 className="text-xl font-semibold text-rose-900">6.6 Cookie and Tracking Technology</h3>
            <ul className="ml-4 list-inside list-disc space-y-1 text-sm">
              <li>We do not use cookies or tracking technologies beyond session management</li>
              <li>You can control browser-level cookies through your browser settings</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-rose-900">7. Data Retention</h2>

            <h3 className="text-xl font-semibold text-rose-900">7.1 Active Account Data</h3>
            <ul className="ml-4 list-inside list-disc space-y-1 text-sm">
              <li>Personal information and account data are retained while your account is active</li>
              <li>Drawing history and saved sessions are retained until deleted by you or account deletion</li>
            </ul>

            <h3 className="text-xl font-semibold text-rose-900">7.2 After Account Deletion</h3>
            <ul className="ml-4 list-inside list-disc space-y-1 text-sm">
              <li>Account information is permanently deleted</li>
              <li>Associated drawing sessions and chat history are removed</li>
              <li>
                We may retain anonymized usage data for analytics (aggregated, non-identifiable)
              </li>
              <li>Backup copies may exist for a limited period but will be purged according to our backup retention policy</li>
            </ul>

            <h3 className="text-xl font-semibold text-rose-900">7.3 Legal Requirements</h3>
            <ul className="ml-4 list-inside list-disc space-y-1 text-sm">
              <li>
                We may retain information longer if required by law or for legitimate business purposes
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-rose-900">8. Real-Time Communication</h2>

            <h3 className="text-xl font-semibold text-rose-900">8.1 WebSocket Connections</h3>
            <ul className="ml-4 list-inside list-disc space-y-1 text-sm">
              <li>
                Drawing data transmitted via WebSocket connections is not encrypted at the application level
                (relies on HTTPS/WSS encryption)
              </li>
              <li>Real-time drawing content is viewable by all participants in a drawing session</li>
              <li>Consider sensitive information before sharing during collaborative sessions</li>
            </ul>

            <h3 className="text-xl font-semibold text-rose-900">8.2 Session Participants</h3>
            <ul className="ml-4 list-inside list-disc space-y-1 text-sm">
              <li>When you join a drawing session, your user ID and drawing activity are visible to other participants</li>
              <li>Leaving or disconnecting from a session terminates real-time data sharing</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-rose-900">9. Children's Privacy</h2>
            <p>
              Drawback is not intended for children under 13 years old. We do not knowingly collect personal
              information from children under 13. If we become aware that we have collected information from
              a child under 13 without parental consent, we will delete such information promptly. Parents or
              guardians who believe their child has provided information to Drawback should contact us
              immediately.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-rose-900">10. International Data Transfers</h2>
            <p>
              If you access Drawback from outside the jurisdiction where our servers are located, your
              information may be transferred to, stored in, and processed in jurisdictions with different
              data protection laws. By using Drawback, you consent to the transfer of your information to
              jurisdictions outside your country of residence.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-rose-900">11. Third-Party Links</h2>
            <p>
              Drawback may contain links to third-party websites and services not operated by us. This
              Privacy Policy does not apply to third-party services, and we are not responsible for their
              privacy practices. We encourage you to review the privacy policies of any third-party service
              before providing personal information.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-rose-900">12. Do Not Track</h2>
            <p>
              Some browsers include a "Do Not Track" feature. Currently, there is no industry standard for
              recognizing Do Not Track signals. Drawback does not respond to Do Not Track browser signals, but
              you may disable cookies and limit tracking through your browser settings.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-rose-900">13. California Privacy Rights</h2>
            <p>
              <strong>For California Residents (CCPA):</strong>
            </p>
            <ul className="ml-4 list-inside list-disc space-y-1 text-sm">
              <li>You have the right to know what personal information is collected, used, and shared</li>
              <li>You have the right to delete personal information collected from you</li>
              <li>You have the right to opt-out of the sale or sharing of your personal information</li>
              <li>You have the right to non-discrimination for exercising your privacy rights</li>
            </ul>
            <p className="text-sm">
              To submit a request, contact us using the information in Section 16. We will verify your identity
              and respond within 45 days.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-rose-900">14. European Union Privacy Rights</h2>
            <p>
              <strong>For EU Residents (GDPR):</strong>
            </p>
            <ul className="ml-4 list-inside list-disc space-y-1 text-sm">
              <li>You have the right to access, correct, or delete your personal information</li>
              <li>You have the right to restrict processing of your information</li>
              <li>You have the right to data portability</li>
              <li>You have the right to object to processing</li>
              <li>You have the right to lodge a complaint with your supervisory authority</li>
            </ul>
            <p className="text-sm">
              To submit a request, contact us using the information in Section 16. We will respond within 30
              days.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-rose-900">15. Updates to This Privacy Policy</h2>
            <p>
              We may update this Privacy Policy from time to time to reflect changes in our practices,
              technology, applicable laws, or other factors. When we make material changes, we will:
            </p>
            <ul className="ml-4 list-inside list-disc space-y-1 text-sm">
              <li>Update the "Last Updated" date at the top</li>
              <li>
                Notify you via email or a prominent notice on the Service if the changes significantly affect
                your rights
              </li>
            </ul>
            <p className="text-sm">
              Your continued use of Drawback after changes become effective constitutes your acceptance of the
              updated Privacy Policy.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-rose-900">16. Contact Us</h2>
            <p>
              If you have questions, concerns, or requests regarding this Privacy Policy or our privacy
              practices, please contact us:
            </p>
            <p className="text-sm font-semibold text-rose-900">
              <strong>Email:</strong> support@drawback.chat
            </p>
            <p className="text-sm">We will respond to your inquiry within 30 days of receipt.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-rose-900">17. Additional Information by Jurisdiction</h2>

            <h3 className="text-xl font-semibold text-rose-900">17.1 United Kingdom (GDPR/DPA 2018)</h3>
            <p className="text-sm">You have the same rights as EU residents listed in Section 14.</p>

            <h3 className="text-xl font-semibold text-rose-900">17.2 Canada (PIPEDA)</h3>
            <ul className="ml-4 list-inside list-disc space-y-1 text-sm">
              <li>You have the right to access and request correction of your personal information</li>
              <li>
                You have the right to lodge a complaint with the Office of the Privacy Commissioner of Canada
              </li>
            </ul>

            <h3 className="text-xl font-semibold text-rose-900">17.3 Australia (Privacy Act 1988)</h3>
            <ul className="ml-4 list-inside list-disc space-y-1 text-sm">
              <li>You have the right to request access and correction of your personal information</li>
              <li>
                You can lodge a complaint with the Office of the Australian Information Commissioner
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-rose-900">18. Acknowledgement</h2>
            <p>
              By using Drawback, you acknowledge that you have read this Privacy Policy and agree to its
              terms. If you do not agree, please discontinue your use of the Service.
            </p>
          </section>

          <hr className="border-rose-300" />

          <p className="text-center text-sm text-rose-600">
            <strong>End of Privacy Policy</strong>
          </p>
        </article>
      </main>
    </div>
  )
}
