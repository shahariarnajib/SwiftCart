import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  Zap,
  ShieldCheck,
  Truck,
  Users,
  Award,
  HeartHandshake,
  ArrowRight,
  Quote,
  CheckCircle2,
  Mail,
  Linkedin,
  Facebook,
  Sparkles,
  MapPin,
  ExternalLink,
} from "lucide-react";

export const metadata = {
  title: "About Us | Meet the Founder & The Story Behind Swift Cart",
  description:
    "Discover the story behind Swift Cart Bangladesh, our founder, and our mission to provide authentic gadgets with express nationwide Cash on Delivery.",
};

export const revalidate = 60;

async function getAboutSettings() {
  try {
    const list = await prisma.storeSetting.findMany();
    const map: Record<string, string> = {};
    list.forEach((item) => {
      map[item.key] = item.value;
    });
    return map;
  } catch (error) {
    console.error("Error fetching about settings:", error);
    return {};
  }
}

export default async function AboutPage() {
  const settings = await getAboutSettings();

  const founderName = settings["founder_name"] || "Md. Sajedul Alam";
  const founderRole = settings["founder_role"] || "Founder & CEO, Swift Cart";
  const founderImage =
    settings["founder_image"] ||
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80";
  const founderBio =
    settings["founder_bio"] ||
    "Tech entrepreneur and e-commerce innovator passionate about authentic consumer electronics and dependable fulfillment in Bangladesh.";
  const founderQuote =
    settings["founder_quote"] ||
    "We didn't build Swift Cart just to sell products; we built it to restore trust, authenticity, and speed to online shopping across all 64 districts in Bangladesh.";
  const founderStory =
    settings["founder_story"] ||
    "The idea for Swift Cart began in Chawkbazar, Chittagong. Like thousands of shoppers across Bangladesh, I was constantly frustrated by online orders that arrived late, lacked official warranties, or were grey-market replicas.\n\nI believed Bangladeshi consumers deserved a store they could trust without second thought: a platform that inspects every product serial number, partners with official warranty distributors, and dispatches parcels with Cash on Delivery in 24-48 hours.\n\nFrom our fulfillment center in Chittagong, we have built Swift Cart into a platform built on speed, authenticity, and unwavering customer care.";
  const founderVision =
    settings["founder_vision"] ||
    "To be Bangladesh's most reliable e-commerce destination where speed, authenticity, and customer happiness are non-negotiable standards.";
  const founderBadge = settings["founder_badge"] || "Established 2024 • Chittagong, BD";
  const founderLinkedin = settings["founder_linkedin"] || "";
  const founderEmail = settings["founder_email"] || "founder@swiftcart.com";
  const founderFacebook = settings["founder_facebook"] || "";

  // Split story into readable paragraphs
  const storyParagraphs = founderStory
    .split("\n\n")
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <div className="bg-slate-50/50 min-h-screen py-12 sm:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-bold uppercase tracking-wider">
            <Zap className="w-3.5 h-3.5 fill-brand-600 text-brand-600" />
            <span>Our Heritage & Vision</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            About Swift Cart
          </h1>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
            Founded with one direct mission: to make online shopping in Bangladesh faster,
            transparent, and 100% dependable through authentic sourcing and express Cash on
            Delivery.
          </p>
        </div>

        {/* FOUNDER & STORY BEHIND SWIFT CART SECTION */}
        <section className="bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12">
            {/* Left Column: Founder Profile Card */}
            <div className="lg:col-span-5 bg-gradient-to-b from-slate-900 to-slate-950 p-8 sm:p-10 text-white flex flex-col justify-between relative overflow-hidden">
              {/* Subtle background glow */}
              <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-brand-600/15 blur-3xl pointer-events-none"></div>

              <div className="relative z-10 space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/20 border border-brand-400/30 text-brand-300 text-xs font-bold uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Leadership</span>
                </div>

                {/* Founder Photo */}
                <div className="relative mx-auto lg:mx-0 w-48 h-48 sm:w-56 sm:h-56 rounded-3xl overflow-hidden border-4 border-white/10 shadow-2xl bg-slate-800">
                  <img
                    src={founderImage}
                    alt={founderName}
                    className="w-full h-full object-cover object-top"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>
                  <div className="absolute bottom-3 left-3 right-3 text-center">
                    <span className="inline-block px-3 py-1 rounded-full bg-brand-600/90 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-wider shadow-sm">
                      {founderBadge}
                    </span>
                  </div>
                </div>

                {/* Founder Identity */}
                <div className="text-center lg:text-left space-y-1.5">
                  <h3 className="text-2xl font-black text-white tracking-tight">{founderName}</h3>
                  <p className="text-xs sm:text-sm font-bold text-brand-400">{founderRole}</p>
                  <p className="text-xs text-slate-300 leading-relaxed pt-2">{founderBio}</p>
                </div>
              </div>

              {/* Founder Social & Direct Channels */}
              <div className="relative z-10 pt-8 border-t border-slate-800/80 mt-8 space-y-3">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block text-center lg:text-left">
                  Connect with the Founder
                </span>
                <div className="flex items-center justify-center lg:justify-start gap-2.5 flex-wrap">
                  {founderEmail && (
                    <a
                      href={`mailto:${founderEmail}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700/60 transition-colors"
                      title="Send direct email"
                    >
                      <Mail className="w-3.5 h-3.5 text-brand-400" />
                      <span>Email</span>
                    </a>
                  )}

                  {founderLinkedin && (
                    <a
                      href={founderLinkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0A66C2]/20 hover:bg-[#0A66C2]/30 text-sky-200 text-xs font-bold border border-[#0A66C2]/40 transition-colors"
                      title="Connect on LinkedIn"
                    >
                      <Linkedin className="w-3.5 h-3.5 text-[#0A66C2]" />
                      <span>LinkedIn</span>
                    </a>
                  )}

                  {founderFacebook && (
                    <a
                      href={founderFacebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1877F2]/20 hover:bg-[#1877F2]/30 text-blue-200 text-xs font-bold border border-[#1877F2]/40 transition-colors"
                      title="Follow on Facebook"
                    >
                      <Facebook className="w-3.5 h-3.5 text-[#1877F2]" />
                      <span>Facebook</span>
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Story Behind Swift Cart & Vision */}
            <div className="lg:col-span-7 p-8 sm:p-12 space-y-8 flex flex-col justify-between">
              {/* Founder Personal Quote Box */}
              <div className="relative p-6 rounded-2xl bg-brand-50/70 border border-brand-100 space-y-3">
                <Quote className="w-8 h-8 text-brand-500/40" />
                <p className="text-base sm:text-lg font-bold text-slate-800 italic leading-snug">
                  &ldquo;{founderQuote}&rdquo;
                </p>
                <div className="flex items-center gap-2 pt-1 text-xs font-bold text-brand-700">
                  <span>— {founderName}</span>
                  <span className="text-slate-400 font-normal">• {founderRole}</span>
                </div>
              </div>

              {/* Story Narrative */}
              <div className="space-y-4">
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 uppercase tracking-widest">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>The Origin</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  The Story Behind Swift Cart
                </h2>

                <div className="space-y-3.5 text-slate-600 text-sm sm:text-base leading-relaxed">
                  {storyParagraphs.map((para, idx) => (
                    <p key={idx}>{para}</p>
                  ))}
                </div>
              </div>

              {/* Founder Vision Box */}
              {founderVision && (
                <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-brand-400">
                    Our Core Vision
                  </span>
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
                    {founderVision}
                  </p>
                </div>
              )}

              {/* Milestone Checkmarks */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Chawkbazar, Chittagong Fulfillment Hub</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>100% Genuine Direct Importer Sourcing</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Cash on Delivery Across 64 Districts</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>24-48h Rapid Doorstep Dispatch</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Operating Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Authenticity First</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              We never compromise with copycats or replica goods. Every product is authenticated, serial-checked, and backed by official warranty.
            </p>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center">
              <Truck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Lightning Logistics</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Centralized inventory and streamlined warehouse workflows mean same-day packaging and fast delivery via Steadfast, Pathao, and RedX.
            </p>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Customer Protection</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Risk-free ordering with Cash on Delivery nationwide, instant WhatsApp support, and a 7-day hassle-free replacement guarantee.
            </p>
          </div>
        </div>

        {/* Quick Numbers Bar */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
            <div className="p-2">
              <span className="text-3xl sm:text-4xl font-black text-brand-600">64</span>
              <p className="text-xs text-slate-500 font-bold mt-1">Districts Covered Nationwide</p>
            </div>
            <div className="p-2">
              <span className="text-3xl sm:text-4xl font-black text-brand-600">100%</span>
              <p className="text-xs text-slate-500 font-bold mt-1">Original & Authentic Guarantee</p>
            </div>
            <div className="p-2">
              <span className="text-3xl sm:text-4xl font-black text-brand-600">24-48h</span>
              <p className="text-xs text-slate-500 font-bold mt-1">Express Dispatch Speed</p>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center pt-2">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-base shadow-xl shadow-brand-600/30 transition-all hover:scale-105 active:scale-95"
          >
            <span>Explore Swift Cart Products</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
