import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Navigation } from "@/components/Navigation";
import { MobileNav } from "@/components/MobileNav";
import { getDailyVerse } from "@/data/bibleVerses";
import { getDailyStudy } from "@/data/bibleStudy";
import { BookOpen, Lightbulb, Info, ScrollText } from "lucide-react";
import { PageMeta } from "@/components/PageMeta";
import { PullToRefresh } from "@/components/PullToRefresh";
import { VerseHighlightButton } from "@/components/VerseHighlightButton";
import { VerseAudioButton } from "@/components/VerseAudioButton";
import { ReflectionJournal } from "@/components/ReflectionJournal";
import { ReadingPlansCard } from "@/components/ReadingPlansCard";
import { HighlightsList } from "@/components/HighlightsList";

const fadeIn = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

export default function BibleStudyPage() {
  // Bumping this key forces the daily verse/study to re-evaluate on pull-to-refresh.
  const [, setRefreshKey] = useState(0);
  const refresh = () =>
    new Promise<void>((resolve) => {
      setRefreshKey((k) => k + 1);
      setTimeout(resolve, 200);
    });

  const verse = getDailyVerse();
  const study = getDailyStudy(verse.reference);

  if (!study) {
    return (
      <div className="min-h-screen bg-background pb-safe">
        <Navigation />
        <MobileNav />
        <main className="container mx-auto px-3 py-5 sm:px-4 sm:py-8 max-w-3xl">
          <p className="text-muted-foreground">No study available for today's verse ({verse.reference}).</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-safe">
      <PageMeta title="Bible Study · GRIND" description="Today's NIV verse with context and core teachings, refreshed daily." path="/bible" />
      <Navigation />
      <MobileNav />
      <PullToRefresh onRefresh={refresh}>
      <main className="container mx-auto px-3 py-5 sm:px-4 sm:py-8 max-w-3xl">
        <motion.div initial="hidden" animate="visible" variants={fadeIn} transition={{ duration: 0.5 }}>
          <h1 className="text-2xl sm:text-3xl font-bold mb-1 tracking-tight">Bible Study</h1>
          <p className="text-sm text-muted-foreground mb-3 sm:mb-4">Today's reading: {study.reference}</p>
          <div className="flex flex-wrap gap-2 mb-5 sm:mb-8">
            <VerseHighlightButton reference={verse.reference} verseText={verse.verse} />
            <VerseAudioButton text={`${verse.verse} — ${verse.reference}`} />
          </div>
        </motion.div>


        {/* Book Overview */}
        <motion.div initial="hidden" animate="visible" variants={fadeIn} transition={{ delay: 0.1 }}>
          <Card className="bg-card border-border mb-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2"><Info className="h-5 w-5" /> About {study.book}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-muted-foreground">{study.bookOverview}</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Chapter Context */}
        <motion.div initial="hidden" animate="visible" variants={fadeIn} transition={{ delay: 0.2 }}>
          <Card className="bg-card border-border mb-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2"><BookOpen className="h-5 w-5" /> What's Happening</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-muted-foreground">{study.chapterContext}</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Teachings */}
        <motion.div initial="hidden" animate="visible" variants={fadeIn} transition={{ delay: 0.3 }}>
          <Card className="bg-card border-border mb-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2"><Lightbulb className="h-5 w-5" /> Key Teachings</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {study.teachings.map((t, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="text-foreground font-medium mt-0.5 shrink-0">{i + 1}.</span>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </motion.div>

        {/* Full Chapter */}
        <motion.div initial="hidden" animate="visible" variants={fadeIn} transition={{ delay: 0.4 }}>
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2"><ScrollText className="h-5 w-5" /> {study.reference} (NIV)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm leading-7 text-muted-foreground whitespace-pre-line">
                {study.fullChapter}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <ReflectionJournal reference={verse.reference} />
        <ReadingPlansCard />
        <HighlightsList />
      </main>
      </PullToRefresh>
    </div>
  );
}
