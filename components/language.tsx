"use client";

import { Translate } from "@phosphor-icons/react";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";

type Language = "en" | "id";
const LanguageContext = createContext<{ language: Language; setLanguage: (value: Language) => void }>({ language: "en", setLanguage: () => undefined });

const translations: Record<string, string> = {
  "Features": "Fitur",
  "Pricing": "Harga",
  "Growth Intelligence": "Intelijen Pertumbuhan",
  "Sign in": "Masuk",
  "Start free": "Mulai gratis",
  "The AI-native Growth Operating System for SMEs.": "Sistem Operasi Pertumbuhan berbasis AI untuk UMKM.",
  "Build demand. Operate with confidence.": "Bangun permintaan. Jalankan bisnis dengan percaya diri.",
  "Know what moves": "Ketahui apa yang menggerakkan",
  "your business": "bisnis Anda",
  "next.": "selanjutnya.",
  "PRIFYN connects campaigns, creators, revenue, and operating signals—then turns the evidence into the next best decision.": "PRIFYN menghubungkan kampanye, kreator, pendapatan, dan sinyal operasional—lalu mengubah bukti menjadi keputusan terbaik berikutnya.",
  "Start building growth": "Mulai membangun pertumbuhan",
  "Explore Growth OS": "Jelajahi Growth OS",
  "No credit card": "Tanpa kartu kredit",
  "Guided setup": "Pengaturan terpandu",
  "Your data stays yours": "Data Anda tetap milik Anda",
  "The operating gap": "Kesenjangan operasional",
  "Growth creates complexity.": "Pertumbuhan menciptakan kompleksitas.",
  "PRIFYN creates clarity.": "PRIFYN menciptakan kejelasan.",
  "Most SMEs can create demand. The real constraint appears after the campaign works: disconnected data, overloaded teams, uncertain attribution, and decisions made too late.": "Sebagian besar UMKM mampu menciptakan permintaan. Hambatan sebenarnya muncul setelah kampanye berhasil: data terpisah, tim kewalahan, atribusi tidak pasti, dan keputusan yang terlambat.",
  "See how the system works": "Lihat cara sistem bekerja",
  "Work is scattered": "Pekerjaan tersebar",
  "Performance lacks context": "Kinerja kehilangan konteks",
  "Decisions arrive late": "Keputusan datang terlambat",
  "One operating rhythm": "Satu ritme operasional",
  "From signal to decision": "Dari sinyal menuju keputusan",
  "in one connected system.": "dalam satu sistem terhubung.",
  "Plan with intent": "Rencanakan dengan tujuan",
  "Execute with control": "Eksekusi dengan kendali",
  "Measure the outcome": "Ukur hasilnya",
  "Decide with evidence": "Putuskan dengan bukti",
  "Explainable intelligence": "Intelijen yang dapat dijelaskan",
  "AI recommendations": "Rekomendasi AI",
  "you can actually trust.": "yang benar-benar dapat dipercaya.",
  "Grow with confidence": "Bertumbuh dengan percaya diri",
  "Your business already has the signals.": "Bisnis Anda sudah memiliki sinyalnya.",
  "PRIFYN makes them useful.": "PRIFYN membuatnya berguna.",
  "View pricing": "Lihat harga",
  "Every growth signal.": "Setiap sinyal pertumbuhan.",
  "One operating rhythm.": "Satu ritme operasional.",
  "Simple, deliberate pricing": "Harga sederhana dan terarah",
  "Start with decisions.": "Mulai dari keputusan.",
  "Scale with your operation.": "Berkembang bersama operasi Anda.",
  "Growth intelligence": "Intelijen pertumbuhan",
  "See the whole growth system,": "Lihat keseluruhan sistem pertumbuhan,",
  "not another isolated channel.": "bukan kanal lain yang terpisah.",
  "Bring campaigns, creators, paid media, pipeline, and revenue into one evidence layer. Understand what is driving growth, what is blocking it, and what the team should do next.": "Satukan kampanye, kreator, media berbayar, pipeline, dan pendapatan dalam satu lapisan bukti. Pahami apa yang mendorong pertumbuhan, apa yang menghambatnya, dan tindakan berikutnya bagi tim.",
  "Open Growth OS": "Buka Growth OS",
  "Your operating day": "Hari operasional Anda",
  "Good morning, Rakha.": "Selamat pagi, Rakha.",
  "Three decisions need your attention. One may affect this week's revenue.": "Tiga keputusan membutuhkan perhatian Anda. Satu di antaranya dapat memengaruhi pendapatan minggu ini.",
  "Decision inbox": "Kotak keputusan",
  "Performance pulse": "Ringkasan kinerja",
  "Active campaigns": "Kampanye aktif",
  "Campaigns": "Kampanye",
  "Ads Manager": "Kelola Iklan",
  "KOL Campaigns": "Kampanye KOL",
  "Setup": "Persiapan",
  "Launch": "Peluncuran",
  "Collaboration": "Kolaborasi",
  "Results": "Hasil",
  "Campaign details": "Detail kampanye",
  "Campaign objective": "Tujuan kampanye",
  "Campaign name": "Nama kampanye",
  "Conversion event": "Event konversi",
  "Audience": "Audiens",
  "Ad channels": "Kanal iklan",
  "Ad creative": "Materi iklan",
  "Ad name": "Nama iklan",
  "Brand profile": "Profil brand",
  "Image or video": "Gambar atau video",
  "Ad copy and keywords": "Copy iklan dan kata kunci",
  "Destination URL": "URL tujuan",
  "Conversion tracking": "Pelacakan konversi",
  "Run campaign": "Jalankan kampanye",
  "KOL level": "Level KOL",
  "Detail brief": "Detail brief",
  "Primary KPI": "KPI utama",
  "Total budget": "Total anggaran",
  "Maximum revisions": "Maksimum revisi",
  "Request revision": "Minta revisi",
  "Approve video": "Setujui video",
  "Creators": "Kreator",
  "Reports": "Laporan",
  "Settings": "Pengaturan",
  "Ask PRIFYN": "Tanya PRIFYN",
  "New campaign": "Kampanye baru",
  "Weekly review": "Tinjauan mingguan",
  "Campaign operations": "Operasi kampanye",
  "Creator intelligence": "Intelijen kreator",
  "Creator Discovery": "Pencarian Kreator",
  "Talent Pipeline": "Pipeline Talenta",
  "Team & Access": "Tim & Akses",
  "Find creators with evidence.": "Temukan kreator berdasarkan bukti.",
  "Discover, evaluate, compare, and recruit the right talent—without a marketplace feed.": "Temukan, evaluasi, bandingkan, dan rekrut talenta yang tepat—tanpa feed marketplace.",
  "Creator workspace": "Workspace kreator",
  "Your next best move.": "Langkah terbaik Anda berikutnya.",
  "Campaigns worth your time.": "Kampanye yang layak untuk waktu Anda.",
  "My profile": "Profil saya",
  "Applications": "Lamaran",
  "Payments": "Pembayaran",
  "Performance": "Performa",
  "Build a profile brands can trust.": "Bangun profil yang dipercaya brand.",
  "Team & access": "Tim & akses",
  "Company owners can invite users, assign roles, and limit access by brand or business unit.": "Pemilik perusahaan dapat mengundang pengguna, menetapkan peran, dan membatasi akses per brand atau unit bisnis.",
  "Decision reporting": "Pelaporan keputusan",
  "Workspace preferences": "Preferensi workspace",
  "Control how your team works, reviews decisions, and receives updates.": "Atur cara tim bekerja, meninjau keputusan, dan menerima pembaruan.",
  "Welcome back": "Selamat datang kembali",
  "Create your workspace": "Buat workspace Anda",
  "Continue with Google": "Lanjutkan dengan Google",
  "or continue with email": "atau lanjutkan dengan email",
  "Work email": "Email kerja",
  "Password": "Kata sandi",
  "Create account": "Buat akun",
  "AI Business Copilot": "Kopilot Bisnis AI",
  "Ask PRIFYN about your growth.": "Tanyakan pertumbuhan bisnis Anda kepada PRIFYN.",
  "Every answer is grounded in governed business metrics and includes the reason, evidence, confidence, and limitations.": "Setiap jawaban berlandaskan metrik bisnis yang terkelola serta menyertakan alasan, bukti, tingkat keyakinan, dan keterbatasan.",
  "Why did ROAS decline this week?": "Mengapa ROAS menurun minggu ini?",
  "Which creator performed best?": "Kreator mana yang berkinerja terbaik?",
  "What should I improve this month?": "Apa yang perlu saya tingkatkan bulan ini?",
  "Which campaign has the highest delivery risk?": "Kampanye mana yang memiliki risiko pengiriman tertinggi?",
};

const reverseTranslations = Object.fromEntries(Object.entries(translations).map(([english, indonesian]) => [indonesian, english]));

function translateDocument(language: Language) {
  const dictionary = language === "id" ? translations : reverseTranslations;
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent || ["SCRIPT", "STYLE", "NOSCRIPT"].includes(parent.tagName)) return NodeFilter.FILTER_REJECT;
      return node.textContent?.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
    },
  });
  const nodes: Text[] = [];
  while (walker.nextNode()) nodes.push(walker.currentNode as Text);
  for (const node of nodes) {
    const value = node.textContent ?? "";
    const trimmed = value.trim();
    const translated = dictionary[trimmed];
    if (translated) node.textContent = value.replace(trimmed, translated);
  }
  document.documentElement.lang = language;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");
  useEffect(() => {
    const saved = window.localStorage.getItem("prifyn-language") === "id" ? "id" : "en";
    queueMicrotask(() => setLanguageState(saved));
    translateDocument(saved);
  }, []);
  useEffect(() => {
    translateDocument(language);
    const observer = new MutationObserver(() => translateDocument(language));
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [language]);
  const setLanguage = (value: Language) => {
    setLanguageState(value);
    window.localStorage.setItem("prifyn-language", value);
  };
  return <LanguageContext.Provider value={{ language, setLanguage }}>{children}</LanguageContext.Provider>;
}

export function LanguageToggle({ inverse = false }: { inverse?: boolean }) {
  const { language, setLanguage } = useContext(LanguageContext);
  const next = language === "en" ? "id" : "en";
  return <button className={`language-toggle ${inverse ? "inverse" : ""}`} type="button" onClick={() => setLanguage(next)} aria-label={next === "id" ? "Gunakan Bahasa Indonesia" : "Use English"}><Translate weight="bold" /><span>{next === "id" ? "ID" : "EN"}</span></button>;
}
