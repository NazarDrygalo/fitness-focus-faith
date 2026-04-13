import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Navigation } from "@/components/Navigation";
import { MobileNav } from "@/components/MobileNav";
import { getDailyVerse } from "@/data/bibleVerses";
import { getDailyStudy } from "@/data/bibleStudy";
import { BookOpen, Lightbulb, Info, ScrollText } from "lucide-react";

const fadeIn = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

export default function BibleStudyPage() {
  const verse = getDailyVerse();
  const study = getDailyStudy(verse.reference);

  if (!study) {
    return (
      <div className="min-h-screen bg-background pb-16 sm:pb-0">
        <Navigation />
        <main className="container mx-auto px-4 py-8 max-w-3xl">
          <p className="text-muted-foreground">No study available for today's verse ({verse.reference}).</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-16 sm:pb-0">
      <Navigation />
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <motion.div initial="hidden" animate="visible" variants={fadeIn} transition={{ duration: 0.5 }}>
          <h1 className="text-3xl font-bold mb-1">Bible Study</h1>
          <p className="text-muted-foreground mb-8">Today's reading: {study.reference}</p>
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
      </main>
    </div>
  );
}
