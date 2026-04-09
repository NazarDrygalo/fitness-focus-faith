import { Navigation } from "@/components/Navigation";
import { useAuth } from "@/hooks/useAuth";

export default function Privacy() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {user && <Navigation />}
      <main className="container mx-auto px-4 py-12 max-w-3xl prose prose-invert">
        <h1 className="text-3xl font-bold text-foreground">Privacy Policy</h1>
        <p className="text-muted-foreground text-sm">Last updated: April 9, 2026</p>

        <h2 className="text-xl font-semibold text-foreground mt-8">1. Information We Collect</h2>
        <p className="text-foreground/80"><strong>Account Data:</strong> When you sign up, we collect your email address and password (stored securely via hashing).</p>
        <p className="text-foreground/80"><strong>Workout Data:</strong> Exercise counts, timer durations, and workout dates you log in the App.</p>
        <p className="text-foreground/80"><strong>Usage Data:</strong> Basic analytics such as session duration and feature usage to improve the App.</p>

        <h2 className="text-xl font-semibold text-foreground mt-8">2. How We Use Your Information</h2>
        <ul className="text-foreground/80 space-y-1">
          <li>To provide and maintain the App's functionality</li>
          <li>To display your workout history and progress</li>
          <li>To send account-related emails (verification, password reset)</li>
          <li>To improve and optimize the App experience</li>
        </ul>

        <h2 className="text-xl font-semibold text-foreground mt-8">3. Data Storage and Security</h2>
        <p className="text-foreground/80">Your data is stored securely in cloud infrastructure with encryption at rest and in transit. We use industry-standard security practices including Row Level Security to ensure your data is only accessible to you.</p>

        <h2 className="text-xl font-semibold text-foreground mt-8">4. Data Sharing</h2>
        <p className="text-foreground/80">We do not sell, rent, or share your personal data with third parties. Your workout data is private and only accessible to you.</p>

        <h2 className="text-xl font-semibold text-foreground mt-8">5. Your Rights</h2>
        <ul className="text-foreground/80 space-y-1">
          <li><strong>Access:</strong> You can view all your data within the App</li>
          <li><strong>Deletion:</strong> You can delete your account and all associated data from the Settings page</li>
          <li><strong>Portability:</strong> You can export your workout data from the Progress page</li>
        </ul>

        <h2 className="text-xl font-semibold text-foreground mt-8">6. Cookies</h2>
        <p className="text-foreground/80">We use essential cookies and local storage for authentication session management only. We do not use tracking cookies or third-party advertising cookies.</p>

        <h2 className="text-xl font-semibold text-foreground mt-8">7. Children's Privacy</h2>
        <p className="text-foreground/80">The App is not intended for children under 13. We do not knowingly collect data from children under 13.</p>

        <h2 className="text-xl font-semibold text-foreground mt-8">8. Changes to This Policy</h2>
        <p className="text-foreground/80">We may update this Privacy Policy from time to time. We will notify you of significant changes via email or in-app notification.</p>

        <h2 className="text-xl font-semibold text-foreground mt-8">9. Contact</h2>
        <p className="text-foreground/80">For privacy-related questions, please contact us through the App.</p>
      </main>
    </div>
  );
}
