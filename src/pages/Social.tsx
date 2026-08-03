import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Navigation } from "@/components/Navigation";
import { MobileNav } from "@/components/MobileNav";
import { PageMeta } from "@/components/PageMeta";
import { PullToRefresh } from "@/components/PullToRefresh";
import { PartnerCard } from "@/components/social/PartnerCard";
import { GroupsCard } from "@/components/social/GroupsCard";
import { ProfileCard } from "@/components/social/ProfileCard";
import { useAuth } from "@/hooks/useAuth";
import { ensureProfile, syncUserStats } from "@/lib/social";

const fadeIn = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

export default function SocialPage() {
  const { user } = useAuth();
  const [params] = useSearchParams();
  const [key, setKey] = useState(0);
  const joinCode = params.get("join");
  const groupCode = params.get("group");

  useEffect(() => {
    if (!user) return;
    ensureProfile(user.id, user.email?.split("@")[0] ?? "Athlete").then(() => syncUserStats(user.id));
  }, [user, key]);

  const refresh = async () => {
    if (user) await syncUserStats(user.id);
    setKey((k) => k + 1);
  };

  return (
    <div className="min-h-screen bg-background pb-safe">
      <PageMeta
        title="Accountability · GRIND"
        description="Train with a partner, join a small group, and keep each other consistent."
        path="/social"
      />
      <Navigation />
      <MobileNav />
      <PullToRefresh onRefresh={refresh}>
        <main className="container mx-auto px-3 py-5 sm:px-4 sm:py-8 max-w-3xl pb-28">
          <motion.div initial="hidden" animate="visible" variants={fadeIn} transition={{ duration: 0.4 }}>
            <h1 className="text-2xl sm:text-3xl font-bold mb-1 tracking-tight">Accountability</h1>
            <p className="text-sm text-muted-foreground mb-5">Stay consistent with a partner and your group.</p>
          </motion.div>

          <div className="space-y-4" key={key}>
            <PartnerCard joinCode={joinCode} />
            <GroupsCard joinCode={groupCode} />
            <ProfileCard />
          </div>
        </main>
      </PullToRefresh>
    </div>
  );
}
