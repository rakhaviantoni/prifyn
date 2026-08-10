"use client";

import { Translate } from "@phosphor-icons/react";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";

type Language = "en" | "id";
const LanguageContext = createContext<{ language: Language; setLanguage: (value: Language) => void }>({ language: "en", setLanguage: () => undefined });

const translations: Record<string, string> = {
  "Features": "Fitur",
  "Pricing": "Harga",
  "Product": "Produk",
  "Solutions": "Solusi",
  "Resources": "Referensi",
  "Case Studies": "Studi Kasus",
  "For Brands": "Untuk Brand",
  "For Agencies": "Untuk Agensi",
  "For Creators": "Untuk Kreator",
  "Growth Intelligence": "Growth OS",
  "Sign in": "Masuk",
  "Start free": "Mulai gratis",
  "The AI-native Growth Operating System for SMEs.": "Growth Operating System berbasis AI untuk bisnis berkembang.",
  "Build demand. Operate with confidence.": "Bangun permintaan. Jalankan pertumbuhan dengan percaya diri.",
  "Know what moves": "Tahu apa yang perlu",
  "your business": "bisnis Anda lakukan",
  "next.": "selanjutnya.",
  "PRIFYN connects campaigns, creators, revenue, and operating signals—then turns the evidence into the next best decision.": "PRIFYN menghubungkan kampanye, kreator, pendapatan, dan sinyal operasional—lalu mengubah bukti menjadi keputusan terbaik berikutnya.",
  "Start building growth": "Mulai membangun pertumbuhan",
  "Explore Growth OS": "Jelajahi Growth OS",
  "No credit card": "Tanpa kartu kredit",
  "Guided setup": "Pengaturan terpandu",
  "Your data stays yours": "Data Anda tetap milik Anda",
  "The operating gap": "Masalah di balik pertumbuhan",
  "Growth creates complexity.": "Pertumbuhan menambah kompleksitas.",
  "PRIFYN creates clarity.": "PRIFYN membantu tim tetap jelas.",
  "Most SMEs can create demand. The real constraint appears after the campaign works: disconnected data, overloaded teams, uncertain attribution, and decisions made too late.": "Sebagian besar UMKM mampu menciptakan permintaan. Hambatan sebenarnya muncul setelah kampanye berhasil: data terpisah, tim kewalahan, atribusi tidak pasti, dan keputusan yang terlambat.",
  "Growing businesses and multi-brand teams can create demand. The real constraint appears after the campaign works: disconnected data, overloaded teams, uncertain attribution, and decisions made too late.": "Bisnis yang sedang berkembang dan tim multi-brand mampu menciptakan permintaan. Hambatan sebenarnya muncul setelah campaign berhasil: data terpisah, tim kewalahan, atribusi tidak pasti, dan keputusan yang terlambat.",
  "See how the system works": "Lihat cara sistem bekerja",
  "Work is scattered": "Pekerjaan tersebar",
  "Performance lacks context": "Angka kinerja tanpa konteks",
  "Decisions arrive late": "Keputusan terlambat diambil",
  "One operating rhythm": "Satu cara kerja yang selaras",
  "From signal to decision": "Dari data menjadi keputusan",
  "in one connected system.": "dalam satu sistem yang terhubung.",
  "Plan with intent": "Rencanakan dengan jelas",
  "Execute with control": "Jalankan dengan terarah",
  "Measure the outcome": "Ukur dampaknya",
  "Decide with evidence": "Ambil keputusan berdasarkan bukti",
  "Explainable intelligence": "AI yang bisa dijelaskan",
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
  "Growth intelligence": "Growth OS",
  "Growth OS overview": "Gambaran Growth OS",
  "See the whole growth system,": "Lihat keseluruhan sistem pertumbuhan,",
  "not another isolated channel.": "bukan kanal lain yang terpisah.",
  "Bring campaigns, creators, paid media, pipeline, and revenue into one evidence layer. Understand what is driving growth, what is blocking it, and what the team should do next.": "Satukan kampanye, kreator, media berbayar, pipeline, dan pendapatan dalam satu lapisan bukti. Pahami apa yang mendorong pertumbuhan, apa yang menghambatnya, dan tindakan berikutnya bagi tim.",
  "Open Growth OS": "Buka Growth OS",
  "Your operating day": "Hari operasional Anda",
  "Good morning, Rakha.": "Selamat pagi, Rakha.",
  "Three decisions need your attention. One may affect this week's revenue.": "Tiga keputusan membutuhkan perhatian Anda. Satu di antaranya dapat memengaruhi pendapatan minggu ini.",
  "Decision inbox": "Keputusan yang perlu ditindaklanjuti",
  "Performance pulse": "Kondisi kinerja terkini",
  "Active campaigns": "Campaign aktif",
  "Campaigns": "Campaign",
  "Ads Manager": "Kelola Iklan",
  "KOL Campaigns": "Campaign KOL",
  "Launch Campaign": "Launch Campaign",
  "Setup": "Persiapan",
  "Channel & Account": "Channel & Account",
  "Preview": "Preview",
  "Launch": "Peluncuran",
  "Collaboration": "Kolaborasi",
  "Results": "Hasil",
  "Campaign details": "Detail campaign",
  "Campaign objective": "Objective campaign",
  "Campaign name": "Nama campaign",
  "Conversion event": "Event konversi",
  "Audience": "Audiens",
  "Ad channels": "Kanal iklan",
  "Ad creative": "Materi iklan",
  "Ad name": "Nama iklan",
  "Brand profile": "Profil brand",
  "Image or video": "Gambar atau video",
  "Upload image / video": "Upload gambar / video",
  "Use existing post": "Gunakan post yang sudah ada",
  "Ad copy and keywords": "Copy iklan dan kata kunci",
  "Call to action": "CTA",
  "Destination URL": "URL tujuan",
  "Conversion tracking": "Pelacakan konversi",
  "Run campaign": "Jalankan campaign",
  "Publish campaign": "Publish campaign",
  "Delivery status": "Status delivery",
  "Report will be ready 3 days after your campaign starts.": "Report tersedia 3 hari setelah campaign dimulai.",
  "KOL level": "Level KOL",
  "Cash budget": "Budget tunai",
  "Product barter": "Barter produk",
  "Cash + product": "Tunai + produk",
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
  "New campaign": "Campaign Baru",
  "Weekly review": "Tinjauan mingguan",
  "Campaign operations": "Operasional campaign",
  "Creator intelligence": "Analisis kreator",
  "Creator Discovery": "Jelajahi Kreator",
  "Talent Pipeline": "Pipeline Kreator",
  "No creators have joined yet.": "Belum ada kreator yang bergabung.",
  "Team & Access": "Tim & Akses",
  "Find creators with evidence.": "Temukan kreator berdasarkan bukti.",
  "Discover, evaluate, compare, and recruit the right talent—without a marketplace feed.": "Cari, nilai, bandingkan, dan rekrut kreator yang tepat berdasarkan bukti—bukan sekadar feed marketplace.",
  "Creator workspace": "Workspace kreator",
  "Your next best move.": "Prioritas terbaik Anda berikutnya.",
  "Campaigns worth your time.": "Kampanye yang paling sesuai untuk Anda.",
  "My profile": "Profil saya",
  "Applications": "Lamaran",
  "Payments": "Pembayaran",
  "Performance": "Performa",
  "Build a profile brands can trust.": "Bangun profil yang dipercaya brand.",
  "Team & access": "Tim & akses",
  "Company owners can invite users, assign roles, and limit access by brand or business unit.": "Pemilik perusahaan dapat mengundang pengguna, menetapkan peran, dan membatasi akses per brand atau unit bisnis.",
  "Decision reporting": "Laporan untuk mengambil keputusan",
  "Workspace preferences": "Pengaturan workspace",
  "Control how your team works, reviews decisions, and receives updates.": "Atur cara tim bekerja, meninjau keputusan, dan menerima pembaruan.",
  "Welcome back": "Selamat datang kembali",
  "Create your workspace": "Buat workspace Anda",
  "Continue with Google": "Lanjutkan dengan Google",
  "or continue with email": "atau lanjutkan dengan email",
  "Work email": "Email kerja",
  "Password": "Kata sandi",
  "Create account": "Buat akun",
  "AI Business Copilot": "Asisten Bisnis AI",
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
