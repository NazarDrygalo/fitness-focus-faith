import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Fingerprint } from "lucide-react";
import { toast } from "sonner";
import { isNative } from "@/lib/native";
import { appLockEnabled, biometricLabel, biometricsAvailable, setAppLockEnabled, authenticate } from "@/lib/appLock";
import { haptic } from "@/lib/haptics";

export function AppLockCard() {
  const [available, setAvailable] = useState(false);
  const [label, setLabel] = useState("Biometrics");
  const [enabled, setEnabled] = useState(appLockEnabled());

  useEffect(() => {
    if (!isNative()) return;
    biometricsAvailable().then(async (ok) => {
      setAvailable(ok);
      if (ok) setLabel(await biometricLabel());
    });
  }, []);

  // Only meaningful inside the installed native app.
  if (!isNative() || !available) return null;

  const toggle = async (next: boolean) => {
    haptic("light");
    if (next) {
      const ok = await authenticate();
      if (!ok) {
        toast.error("Couldn't verify — app lock not enabled.");
        return;
      }
    }
    setAppLockEnabled(next);
    setEnabled(next);
    toast.success(next ? `App lock on with ${label}` : "App lock off");
  };

  return (
    <Card className="bg-card border-border mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Fingerprint className="h-5 w-5 text-muted-foreground" strokeWidth={1.75} />
          App Lock
        </CardTitle>
        <CardDescription>Require {label} when reopening GRIND</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between min-h-[48px]">
          <span className="text-sm">Unlock with {label}</span>
          <Switch checked={enabled} onCheckedChange={toggle} />
        </div>
      </CardContent>
    </Card>
  );
}
