import { Link } from "react-router-dom";
import { QrCode, ScanLine, Download, History, Palette, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const features = [
  { icon: QrCode, title: "Generate QR Codes", desc: "Create QR codes for URLs, text, WiFi, email, and phone numbers." },
  { icon: ScanLine, title: "Scan QR Codes", desc: "Use your camera or upload an image to decode any QR code instantly." },
  { icon: Palette, title: "Customize", desc: "Choose colors and sizes to match your brand or style." },
  { icon: Download, title: "Download PNG", desc: "Export your QR codes as high-quality PNG images." },
  { icon: History, title: "History", desc: "All your generated QR codes saved locally for easy access." },
  { icon: Zap, title: "Instant & Free", desc: "No signup needed. Works right in your browser, fast and free." },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4 } }),
};

export default function Index() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="container py-20 md:py-32 flex flex-col items-center text-center gap-6">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-sm text-muted-foreground">
          <QrCode className="h-4 w-4 text-primary" /> Free &amp; open QR utility
        </motion.div>
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.5 }}
          className="text-4xl md:text-6xl font-extrabold tracking-tight text-secondary max-w-2xl leading-tight">
          Generate &amp; Scan QR&nbsp;Codes in Seconds
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }}
          className="text-lg text-muted-foreground max-w-lg">
          A fast, clean, all-in-one QR tool — no app install, no clutter, no ads.
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5 }}
          className="flex gap-3 flex-wrap justify-center">
          <Link to="/generate"><Button size="lg" className="gap-2"><QrCode className="h-5 w-5" />Generate QR</Button></Link>
          <Link to="/scan"><Button size="lg" variant="outline" className="gap-2"><ScanLine className="h-5 w-5" />Scan QR</Button></Link>
        </motion.div>
      </section>

      {/* Features */}
      <section className="container pb-20">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f, i) => (
            <motion.div key={f.title} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
              className="rounded-lg border border-border bg-card p-6 flex flex-col gap-3 hover:shadow-sm transition-shadow">
              <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center">
                <f.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold text-secondary">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="container pb-20">
        <h2 className="text-2xl font-bold text-secondary text-center mb-8">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
          {["Pick a type & enter data", "Customize colors & size", "Download or scan instantly"].map((step, i) => (
            <div key={step} className="flex flex-col items-center text-center gap-2">
              <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">{i + 1}</div>
              <p className="text-sm text-muted-foreground">{step}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
