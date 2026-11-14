"use client"

import { useState, useEffect } from "react"

export default function TopAnnouncementCarousel({
  phrases,
  bg,
  textColor,
}: {
  phrases: string[]
  bg: string
  textColor: string
}) {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (phrases.length <= 1) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % phrases.length)
    }, 3800) // Match the 3.8s total animation cycle time

    return () => clearInterval(interval)
  }, [phrases])

  if (!phrases || phrases.length === 0) return null

  // If there's only 1 phrase, render it statically without transition animations
  if (phrases.length === 1) {
    return (
      <div
        className="w-full py-2.5 text-center text-xs font-bold uppercase tracking-wider select-none flex items-center justify-center h-9"
        style={{ backgroundColor: bg, color: textColor }}
      >
        {phrases[0]}
      </div>
    )
  }

  const currentPhrase = phrases[currentIndex]

  return (
    <div
      className="overflow-hidden relative w-full h-9 select-none flex items-center justify-center text-center text-xs font-bold uppercase tracking-wider"
      style={{ backgroundColor: bg, color: textColor }}
    >
      <style>{`
        @keyframes slideInOut {
          0% {
            transform: translate3d(80px, 0, 0);
            opacity: 0;
          }
          10.5% {
            transform: translate3d(0, 0, 0);
            opacity: 1;
          }
          89.5% {
            transform: translate3d(0, 0, 0);
            opacity: 1;
          }
          100% {
            transform: translate3d(-80px, 0, 0);
            opacity: 0;
          }
        }
        .animate-slide-in-out {
          animation: slideInOut 3.8s cubic-bezier(0.25, 1, 0.5, 1) infinite;
        }
      `}</style>
      <div key={currentIndex} className="animate-slide-in-out px-4 whitespace-nowrap">
        {currentPhrase}
      </div>
    </div>
  )
}
