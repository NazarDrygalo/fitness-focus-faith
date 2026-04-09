import { Navigation } from "@/components/Navigation";
import { useAuth } from "@/hooks/useAuth";

export default function Terms() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {user && <Navigation />}
      <main className="container mx-auto px-4 py-12 max-w-3xl prose prose-invert">
        <h1 className="text-3xl font-bold text-foreground">Terms of Service</h1>
        <p className="text-muted-foreground text-sm">Last updated: April 9, 2026</p>

        <h2 className="text-xl font-semibold text-foreground mt-8">1. Acceptance of Terms</h2>
        <p className="text-foreground/80">By accessing or using GRIND ("the App"), you agree to be bound by these Terms of Service. If you do not agree, do not use the App.</p>

        <h2 className="text-xl font-semibold text-foreground mt-8">2. Description of Service</h2>
        <p className="text-foreground/80">GRIND is a personal fitness and devotional tracking application. We provide tools to log workouts, track progress, and engage with daily Bible study content.</p>

        <h2 className="text-xl font-semibold text-foreground mt-8">3. User Accounts</h2>
        <p className="text-foreground/80">You must create an account to use the App. You are responsible for maintaining the confidentiality of your credentials and for all activity under your account.</p>

        <h2 className="text-xl font-semibold text-foreground mt-8">4. User Conduct</h2>
        <p className="text-foreground/80">You agree not to misuse the App, attempt to gain unauthorized access, or use the App for any unlawful purpose.</p>

        <h2 className="text-xl font-semibold text-foreground mt-8">5. Data and Privacy</h2>
        <p className="text-foreground/80">Your use of the App is also governed by our <a href="/privacy" className="text-primary underline">Privacy Policy</a>. By using the App, you consent to the collection and use of your data as described therein.</p>

        <h2 className="text-xl font-semibold text-foreground mt-8">6. Intellectual Property</h2>
        <p className="text-foreground/80">All content, design, and code in the App are the property of GRIND and its creators. You may not reproduce, distribute, or create derivative works without permission.</p>

        <h2 className="text-xl font-semibold text-foreground mt-8">7. Disclaimer of Warranties</h2>
        <p className="text-foreground/80">The App is provided "as is" without warranties of any kind. We do not guarantee uninterrupted or error-free service. Workout advice in the App is not a substitute for professional medical guidance.</p>

        <h2 className="text-xl font-semibold text-foreground mt-8">8. Limitation of Liability</h2>
        <p className="text-foreground/80">To the maximum extent permitted by law, GRIND shall not be liable for any indirect, incidental, or consequential damages arising from your use of the App.</p>

        <h2 className="text-xl font-semibold text-foreground mt-8">9. Termination</h2>
        <p className="text-foreground/80">We reserve the right to suspend or terminate your account at our discretion. You may delete your account at any time through the Settings page.</p>

        <h2 className="text-xl font-semibold text-foreground mt-8">10. Changes to Terms</h2>
        <p className="text-foreground/80">We may update these Terms from time to time. Continued use of the App after changes constitutes acceptance of the updated Terms.</p>

        <h2 className="text-xl font-semibold text-foreground mt-8">11. Contact</h2>
        <p className="text-foreground/80">For questions about these Terms, please contact us through the App.</p>
      </main>
    </div>
  );
}
