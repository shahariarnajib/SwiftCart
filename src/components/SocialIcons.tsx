import React from "react";

export type SocialPlatformKey =
  | "whatsapp"
  | "facebook"
  | "messenger"
  | "instagram"
  | "tiktok"
  | "youtube";

export interface SocialConfig {
  name: string;
  key: SocialPlatformKey;
  settingKey: string;
  brandColor: string; // Official brand HEX
  bgClass: string;
  hoverClass: string;
  textClass: string;
  gradientClass: string;
  defaultUrl: string;
  placeholder: string;
  description: string;
  ariaLabel: string;
}

export const SOCIAL_PLATFORMS: Record<SocialPlatformKey, SocialConfig> = {
  whatsapp: {
    name: "WhatsApp",
    key: "whatsapp",
    settingKey: "social_whatsapp",
    brandColor: "#25D366",
    bgClass: "bg-[#25D366]",
    hoverClass: "hover:bg-[#20bd5a] hover:shadow-[#25D366]/40",
    textClass: "text-[#25D366]",
    gradientClass: "from-[#25D366] to-[#128C7E]",
    defaultUrl: "https://wa.me/8801925613994",
    placeholder: "+8801925613994 or https://wa.me/8801925613994",
    description: "Instant customer support & order inquiries hotline",
    ariaLabel: "Chat on WhatsApp with Swift Cart support",
  },
  facebook: {
    name: "Facebook",
    key: "facebook",
    settingKey: "social_facebook",
    brandColor: "#1877F2",
    bgClass: "bg-[#1877F2]",
    hoverClass: "hover:bg-[#166fe5] hover:shadow-[#1877F2]/40",
    textClass: "text-[#1877F2]",
    gradientClass: "from-[#1877F2] to-[#0d5ac2]",
    defaultUrl: "https://facebook.com/swiftcartbd",
    placeholder: "https://facebook.com/your-page-slug",
    description: "Official Facebook page for offers, updates, and reviews",
    ariaLabel: "Visit Swift Cart on Facebook",
  },
  messenger: {
    name: "Messenger",
    key: "messenger",
    settingKey: "social_messenger",
    brandColor: "#0084FF",
    bgClass: "bg-gradient-to-tr from-[#006AFF] to-[#00B2FF]",
    hoverClass: "hover:opacity-95 hover:shadow-[#0084FF]/40",
    textClass: "text-[#0084FF]",
    gradientClass: "from-[#006AFF] to-[#00B2FF]",
    defaultUrl: "https://m.me/swiftcartbd",
    placeholder: "https://m.me/your-page or https://messenger.com/t/...",
    description: "Direct Facebook Messenger chat with support team",
    ariaLabel: "Chat with Swift Cart on Facebook Messenger",
  },
  instagram: {
    name: "Instagram",
    key: "instagram",
    settingKey: "social_instagram",
    brandColor: "#E4405F",
    bgClass: "bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888]",
    hoverClass: "hover:opacity-95 hover:shadow-[#dc2743]/40",
    textClass: "text-[#E4405F]",
    gradientClass: "from-[#f09433] via-[#dc2743] to-[#bc1888]",
    defaultUrl: "https://instagram.com/swiftcartbd",
    placeholder: "https://instagram.com/your-username",
    description: "Visual product showcases, reels, and stories",
    ariaLabel: "Follow Swift Cart on Instagram",
  },
  tiktok: {
    name: "TikTok",
    key: "tiktok",
    settingKey: "social_tiktok",
    brandColor: "#000000",
    bgClass: "bg-black",
    hoverClass: "hover:bg-slate-900 hover:shadow-black/50",
    textClass: "text-black",
    gradientClass: "from-black to-slate-900",
    defaultUrl: "https://tiktok.com/@swiftcartbd",
    placeholder: "https://tiktok.com/@your-account",
    description: "Short-form video unboxings, demos, and trending items",
    ariaLabel: "Watch Swift Cart videos on TikTok",
  },
  youtube: {
    name: "YouTube",
    key: "youtube",
    settingKey: "social_youtube",
    brandColor: "#FF0000",
    bgClass: "bg-[#FF0000]",
    hoverClass: "hover:bg-[#e60000] hover:shadow-[#FF0000]/40",
    textClass: "text-[#FF0000]",
    gradientClass: "from-[#FF0000] to-[#cc0000]",
    defaultUrl: "https://youtube.com/@swiftcartbd",
    placeholder: "https://youtube.com/@your-channel",
    description: "In-depth gadget reviews, unboxing, and tutorials",
    ariaLabel: "Subscribe to Swift Cart on YouTube",
  },
};

export function formatSocialUrl(platform: SocialPlatformKey, raw?: string | null): string {
  const defaultUrl = SOCIAL_PLATFORMS[platform].defaultUrl;
  if (!raw || !raw.trim()) return defaultUrl;

  const val = raw.trim();

  if (platform === "whatsapp") {
    if (val.startsWith("http://") || val.startsWith("https://")) {
      return val;
    }
    // Clean phone number: remove non-digits except leading +
    const cleanNumber = val.replace(/[^0-9]/g, "");
    return `https://wa.me/${cleanNumber}`;
  }

  if (platform === "messenger") {
    if (val.startsWith("http://") || val.startsWith("https://")) {
      return val;
    }
    const cleanId = val.replace(/^@/, "").replace(/^\/+/, "");
    return `https://m.me/${cleanId}`;
  }

  if (val.startsWith("http://") || val.startsWith("https://")) {
    return val;
  }

  if (platform === "instagram") {
    const handle = val.replace(/^@/, "").replace(/^\/+/, "");
    return `https://instagram.com/${handle}`;
  }

  if (platform === "tiktok") {
    const handle = val.startsWith("@") ? val : `@${val}`;
    return `https://tiktok.com/${handle}`;
  }

  if (platform === "youtube") {
    if (val.startsWith("@")) {
      return `https://youtube.com/${val}`;
    }
    return `https://youtube.com/${val}`;
  }

  if (platform === "facebook") {
    const handle = val.replace(/^@/, "").replace(/^\/+/, "");
    return `https://facebook.com/${handle}`;
  }

  return `https://${val}`;
}

export function SocialIcon({
  platform,
  className = "w-5 h-5",
}: {
  platform: SocialPlatformKey;
  className?: string;
}) {
  switch (platform) {
    case "whatsapp":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className={className}
          aria-hidden="true"
        >
          <path d="M17.472 14.382c-.301-.15-1.782-.879-2.058-.98-.276-.1-.476-.15-.677.15-.2.3-.778.98-.953 1.18-.175.2-.351.226-.652.075s-1.27-.468-2.42-1.493c-.894-.798-1.498-1.784-1.674-2.085-.175-.3-.019-.462.132-.612.136-.135.301-.35.452-.525.15-.176.201-.3.301-.501.101-.2.05-.376-.025-.526-.075-.15-.677-1.631-.928-2.232-.244-.585-.492-.506-.677-.515-.175-.009-.376-.011-.577-.011s-.527.075-.803.376c-.276.301-1.053 1.028-1.053 2.507s1.079 2.908 1.229 3.109c.15.201 2.122 3.24 5.141 4.544.718.31 1.278.496 1.716.635.722.23 1.379.197 1.898.12.578-.087 1.782-.728 2.033-1.432.251-.703.251-1.306.176-1.432-.076-.126-.276-.201-.577-.351z" />
          <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.174L2.05 21.95l4.898-1.352A9.957 9.957 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.2a8.17 8.17 0 01-4.223-1.168l-.303-.18-2.906.802.793-2.83-.197-.315A8.176 8.176 0 013.8 12c0-4.522 3.678-8.2 8.2-8.2 4.522 0 8.2 3.678 8.2 8.2 0 4.522-3.678 8.2-8.2 8.2z" />
        </svg>
      );

    case "facebook":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className={className}
          aria-hidden="true"
        >
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      );

    case "messenger":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className={className}
          aria-hidden="true"
        >
          <path d="M12 2C6.36 2 2 6.13 2 11.7c0 2.91 1.19 5.43 3.14 7.17.16.14.26.35.26.57l-.07 1.78c-.03.73.72 1.25 1.38.93l1.98-.95c.18-.09.39-.1.58-.05.88.24 1.8.37 2.73.37 5.64 0 10-4.13 10-9.7S17.64 2 12 2zm1.09 13.06l-2.54-2.71-4.96 2.71c-.55.3-1.19-.27-.95-.84l2.71-6.42a1 1 0 011.39-.51l2.54 2.71 4.96-2.71c.55-.3 1.19.27.95.84l-2.71 6.42a1 1 0 01-1.39.51z" />
        </svg>
      );

    case "instagram":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className={className}
          aria-hidden="true"
        >
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      );

    case "tiktok":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className={className}
          aria-hidden="true"
        >
          <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64c.29 0 .58.04.85.12V9.4a6.33 6.33 0 00-.85-.06A6.34 6.34 0 003.15 15.7a6.34 6.34 0 0010.82 4.47V11.2a8.28 8.28 0 005.62 2.25V10a4.84 4.84 0 01-3.77-3.31h3.77z" />
        </svg>
      );

    case "youtube":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className={className}
          aria-hidden="true"
        >
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      );

    default:
      return null;
  }
}
