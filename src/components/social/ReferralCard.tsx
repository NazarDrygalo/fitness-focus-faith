import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Gift, Link2, Loader2, Snowflake } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { haptic } from "@/lib/haptics";
import { referralLink, syncReferralRewards, type ReferralRow } from "@/lib/referrals";

export function ReferralCard() {
  const { user } = useAuth();
  const [rows, setRows] = useState<ReferralRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { rows, awarded } = await syncReferralRewards(user.id);
    setRows(rows);
    setLoading(false);
    if (awarded > 0) {
      toast.success(`You earned ${awarded} freeze token${awarded === 1 ? "" : "s"}!`);
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const share = async () => {
    if (!user) return;
    haptic("light");
    const url = referralLink(user.id);
    const text = "Train with me on GrindFaith — daily strength & scripture.";
    try {
      if (navigator.share) {
        await navigator.share({ title: "GrindFaith", text, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Referral link copied");
      }
    } catch (e) {
      if ((e as Error)?.name !== "AbortError") toast.error("Couldn't share link");
    }
  };

  const earned = rows.filter((r) => r.rewarded).length;

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Gift className="h-5 w-5" strokeWidth={1.75} /> Invite a friend
        </CardTitle>
        <CardDescription>
          Gift a friend the app. When they log their first full week, you both get a streak freeze token.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={share} className="w-full h-12 gap-2 tap">
          <Link2 className="h-4 w-4" /> Share your referral link
        </Button>

        {loading ? (
          <div className="flex justify-center py-2">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="flex items-center justify-between rounded-lg bg-secondary/50 px-3 py-2.5">
            <div>
              <p className="text-sm font-medium">{rows.length} invited</p>
              <p className="text-xs text-muted-foreground">
                {earned} completed their first week
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Snowflake className="h-4 w-4" strokeWidth={1.75} />
              {earned}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
