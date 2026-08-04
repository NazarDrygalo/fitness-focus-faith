import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { App as CapApp } from "@capacitor/app";
import { isNative } from "@/lib/native";

/**
 * Native shell glue: deep links / home-screen quick actions open the right
 * route, and the Android hardware back button navigates instead of closing.
 */
export function NativeBridge() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!isNative()) return;
    const handles = [
      CapApp.addListener("appUrlOpen", ({ url }) => {
        try {
          const parsed = new URL(url);
          navigate(`${parsed.pathname}${parsed.search}`);
        } catch {
          /* ignore malformed deep links */
        }
      }),
      CapApp.addListener("backButton", ({ canGoBack }) => {
        if (canGoBack) navigate(-1);
        else CapApp.exitApp();
      }),
    ];
    return () => { handles.forEach((h) => h.then((x) => x.remove())); };
  }, [navigate]);

  return null;
}
