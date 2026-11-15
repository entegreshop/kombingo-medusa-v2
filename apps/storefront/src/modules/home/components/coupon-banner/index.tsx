"use client"

import React, { useState } from "react"

export interface CouponBannerConfig {
  enabled?: boolean
  eyebrow?: string
  title_prefix?: string
  highlight_text?: string
  title_suffix?: string
  description?: string
  code_label?: string
  code?: string
  copy_text?: string
  copied_text?: string
  bg_color?: string
  glow_color?: string
  accent_color?: string
  auto_apply_checkout?: boolean
  show_popup_on_copy?: boolean
  popup_title?: string
  popup_description?: string
  popup_btn_text?: string
  popup_btn_link?: string
}

const DEFAULT_COUPON_BANNER: Required<CouponBannerConfig> = {
  enabled: true,
  eyebrow: "KOMBİNGO'YA ÖZEL",
  title_prefix: "SEPETTE EKSTRA",
  highlight_text: "%10",
  title_suffix: "İNDİRİM",
  description: "Kupon kodunu sepette girmeniz yeterli. Kampanya seçili yeni sezon ürünlerinde geçerlidir.",
  code_label: "KOD",
  code: "KOMBINGO10",
  copy_text: "KOPYALA",
  copied_text: "KOPYALANDI",
  bg_color: "#09090b",
  glow_color: "#c81e2d",
  accent_color: "#ffb4b4",
  auto_apply_checkout: true,
  show_popup_on_copy: true,
  popup_title: "Kupon Kodunuz Tanımlandı!",
  popup_description:
    "İndirim kuponunuz panoya kopyalandı ve ödeme adımınız için otomatik olarak kaydedildi. Sepette veya hızlı ödeme ekranında anında kullanabilirsiniz.",
  popup_btn_text: "Alışverişe Devam Et",
  popup_btn_link: "",
}

function hexToRgba(hex: string, alpha: number) {
  const clean = (hex || "#c81e2d").replace("#", "")
  if (clean.length !== 6) return `rgba(200, 30, 45, ${alpha})`
  const r = parseInt(clean.substring(0, 2), 16)
  const g = parseInt(clean.substring(2, 4), 16)
  const b = parseInt(clean.substring(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export default function CouponBanner({ config }: { config?: CouponBannerConfig | null }) {
  const [isCopied, setIsCopied] = useState(false)
  const [showPopup, setShowPopup] = useState(false)

  const cfg: Required<CouponBannerConfig> = {
    ...DEFAULT_COUPON_BANNER,
    ...(config || {}),
  }

  if (cfg.enabled === false) return null

  const handleCopyAndAction = async () => {
    const codeToCopy = (cfg.code || "KOMBINGO10").trim()

    try {
      await navigator.clipboard.writeText(codeToCopy)
    } catch {
      const input = document.createElement("input")
      input.value = codeToCopy
      document.body.appendChild(input)
      input.select()
      document.execCommand("copy")
      document.body.removeChild(input)
    }

    if (cfg.auto_apply_checkout !== false && typeof window !== "undefined") {
      try {
        window.localStorage.setItem("kombingo_active_coupon", codeToCopy)
        window.dispatchEvent(new CustomEvent("kombingo:coupon-copied", { detail: { code: codeToCopy } }))
      } catch {}
    }

    setIsCopied(true)
    if (cfg.show_popup_on_copy !== false) {
      setShowPopup(true)
    }

    window.setTimeout(() => {
      setIsCopied(false)
    }, 2600)
  }

  const glow1 = hexToRgba(cfg.glow_color, 0.44)
  const glow2 = hexToRgba(cfg.glow_color, 0.32)

  return (
    <>
      <style>{`
        @keyframes cb-shine {
          0%, 70% { transform: translateX(-160%) skewX(-18deg); }
          100% { transform: translateX(360%) skewX(-18deg); }
        }
        .cb-shimmer::after {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 40%;
          height: 100%;
          background: linear-gradient(100deg, transparent, rgba(255, 255, 255, 0.24), transparent);
          transform: translateX(-160%) skewX(-18deg);
          animation: cb-shine 5s ease-in-out infinite;
          pointer-events: none;
        }
      `}</style>

      <section
        role="region"
        aria-label={`${cfg.eyebrow} ${cfg.title_prefix} ${cfg.highlight_text} ${cfg.title_suffix}`}
        className="relative w-full min-h-[76px] sm:min-h-[88px] flex items-center px-3 py-2 sm:px-6 sm:py-3 overflow-hidden isolate select-none border-b border-white/10"
        style={{ backgroundColor: cfg.bg_color || "#09090b", color: "#ffffff" }}
      >
        {/* Luxury Ambient Glow Background */}
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 pointer-events-none"
          style={{
            background: `
              radial-gradient(38% 170% at 4% 50%, ${glow1}, transparent 70%),
              radial-gradient(26% 180% at 50% 135%, rgba(170, 184, 204, 0.25), transparent 70%),
              radial-gradient(32% 160% at 97% -15%, ${glow2}, transparent 70%),
              linear-gradient(90deg, ${cfg.bg_color || "#0e0e0e"}, #000000)
            `,
          }}
        />

        {/* Glassmorphism Pill Container */}
        <div
          className="relative w-full max-w-[1320px] min-h-[58px] sm:min-h-[64px] mx-auto flex items-center justify-between gap-2.5 sm:gap-6 px-2.5 py-2 sm:py-2 sm:pl-4 sm:pr-2.5 rounded-[14px] sm:rounded-[16px]"
          style={{
            background: "linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.04))",
            border: "1px solid rgba(255, 255, 255, 0.18)",
            boxShadow:
              "0 14px 34px -14px rgba(0, 0, 0, 0.75), 0 2px 8px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.28), inset 0 -1px 0 rgba(255, 255, 255, 0.05)",
            backdropFilter: "blur(14px) saturate(140%)",
            WebkitBackdropFilter: "blur(14px) saturate(140%)",
          }}
        >
          {/* Left: Metallic Ticket Badge + Title */}
          <div className="flex items-center gap-2.5 sm:gap-3.5 shrink-0 min-w-0">
            <span
              aria-hidden="true"
              className="hidden xs:grid w-[34px] h-[34px] sm:w-[42px] sm:h-[42px] rounded-full place-items-center shrink-0"
              style={{
                background: "linear-gradient(145deg, #ffffff, #c9ced6)",
                boxShadow: "0 6px 16px -4px rgba(255, 255, 255, 0.35), inset 0 -1px 0 rgba(0, 0, 0, 0.15)",
              }}
            >
              <svg
                className="w-[18px] h-[18px] sm:w-[22px] sm:h-[22px]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#000"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3.5 7h17v3a2 2 0 0 0 0 4v3h-17v-3a2 2 0 0 0 0-4z"></path>
                <path d="M15 7.5v9" strokeDasharray="1.6 2"></path>
                <path d="M7 14.5l4-5"></path>
                <circle cx="7.4" cy="9.9" r=".9" fill="#000" stroke="none"></circle>
                <circle cx="10.6" cy="14.1" r=".9" fill="#000" stroke="none"></circle>
              </svg>
            </span>

            <div className="flex flex-col gap-0.5 leading-tight min-w-0">
              {cfg.eyebrow && (
                <span className="text-[9px] sm:text-[10.5px] font-medium tracking-[0.2em] sm:tracking-[0.24em] uppercase text-white/75 truncate">
                  {cfg.eyebrow}
                </span>
              )}
              <strong className="text-[12.5px] sm:text-[16px] font-semibold tracking-[0.04em] sm:tracking-[0.06em] uppercase whitespace-nowrap text-white">
                {cfg.title_prefix}{" "}
                <em
                  className="not-italic text-[16px] sm:text-[21px] font-extrabold tracking-[0.02em] mx-0.5"
                  style={{ color: cfg.accent_color || "#ffb4b4" }}
                >
                  {cfg.highlight_text}
                </em>{" "}
                {cfg.title_suffix}
              </strong>
            </div>
          </div>

          {/* Center Description (Desktop) */}
          {cfg.description && (
            <div className="hidden lg:flex items-center flex-1 pl-6 border-l border-white/15 min-w-0">
              <p className="text-[13px] text-white/80 font-normal truncate">{cfg.description}</p>
            </div>
          )}

          {/* Right: Dashed Shimmering Code Button */}
          <button
            type="button"
            onClick={handleCopyAndAction}
            aria-label={`${cfg.code} kupon kodunu kopyala`}
            className="cb-shimmer relative overflow-hidden ml-auto shrink-0 flex items-center gap-2 sm:gap-3 h-[42px] sm:h-[46px] pl-2.5 pr-1 sm:pl-4 sm:pr-1.5 rounded-[10px] sm:rounded-[12px] border-[1.5px] border-dashed border-white/55 hover:border-white/90 bg-white/10 hover:bg-white/15 text-white cursor-pointer transition-all"
          >
            <span className="hidden sm:inline text-[10px] tracking-[0.2em] uppercase text-white/65 font-medium">
              {cfg.code_label || "KOD"}
            </span>
            <span className="text-[14px] sm:text-[17px] font-bold tracking-[0.14em] sm:tracking-[0.2em] uppercase">
              {cfg.code}
            </span>
            <span
              className={`flex items-center justify-center gap-1.5 h-[32px] sm:h-[34px] px-2.5 sm:px-3.5 rounded-[8px] sm:rounded-[9px] text-[11.5px] sm:text-[12px] font-bold tracking-[0.08em] uppercase shadow-md transition-all duration-200 ${
                isCopied ? "bg-[#d7f0df] text-[#0f3d22]" : "bg-white text-black"
              }`}
            >
              {!isCopied ? (
                <svg
                  className="w-[15px] h-[15px] shrink-0"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="9" y="9" width="11" height="11" rx="2"></rect>
                  <path d="M5 15V6a2 2 0 0 1 2-2h8"></path>
                </svg>
              ) : (
                <svg
                  className="w-[15px] h-[15px] shrink-0"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              )}
              <span className="hidden sm:inline">{isCopied ? cfg.copied_text : cfg.copy_text}</span>
            </span>
          </button>
        </div>
      </section>

      {/* Luxury Coupon Action Popup Modal */}
      {showPopup && (
        <div
          className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setShowPopup(false)}
        >
          <div
            className="relative w-full max-w-[420px] rounded-2xl bg-[#111115] border border-white/15 text-white p-6 sm:p-7 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Ambient Glow inside Modal */}
            <div
              className="absolute -top-20 -left-20 w-52 h-52 rounded-full blur-3xl pointer-events-none opacity-40"
              style={{ backgroundColor: cfg.glow_color || "#c81e2d" }}
            />
            <button
              type="button"
              onClick={() => setShowPopup(false)}
              aria-label="Kapat"
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition cursor-pointer"
            >
              ✕
            </button>

            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full bg-[#d7f0df] text-[#0f3d22] flex items-center justify-center mb-4 shadow-lg">
                <svg
                  className="w-7 h-7"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>

              <span
                className="text-[11px] font-bold tracking-[0.22em] uppercase mb-1"
                style={{ color: cfg.accent_color || "#ffb4b4" }}
              >
                {cfg.eyebrow} • {cfg.highlight_text} {cfg.title_suffix}
              </span>

              <h3 className="text-xl font-extrabold tracking-tight text-white mb-2">
                {cfg.popup_title || "Kupon Kodunuz Tanımlandı!"}
              </h3>

              <p className="text-[13px] text-white/75 leading-relaxed mb-5">
                {cfg.popup_description}
              </p>

              {/* Dashed Copied Code Showcase */}
              <div className="w-full py-3 px-4 rounded-xl border border-dashed border-white/40 bg-white/5 flex items-center justify-between mb-5">
                <span className="text-[11px] uppercase tracking-widest text-white/60 font-semibold">
                  AKTİF KUPON KODU
                </span>
                <span className="text-[17px] font-mono font-extrabold tracking-[0.18em] text-[#86efac]">
                  {cfg.code} ✓
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowPopup(false)
                  if (cfg.popup_btn_link) {
                    window.location.href = cfg.popup_btn_link
                  }
                }}
                className="w-full py-3.5 rounded-xl bg-white text-black hover:bg-zinc-100 font-extrabold text-[13.5px] uppercase tracking-wider transition cursor-pointer shadow-lg"
              >
                {cfg.popup_btn_text || "Alışverişe Devam Et"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
