"use client"

import React, { useState, useEffect } from "react"
import { Button, Heading } from "@medusajs/ui"
import Link from "next/link"

export interface SlideData {
  tag: string
  title: string
  subtitle: string
  btn_text: string
  btn_link: string
  media_type: "image" | "video"
  media_url: string
  mobile_media_url?: string
}

export default function HeroSlider({
  slides,
  height = "75vh",
  overlayOpacity = 15,
  btnBg = "#7C3AED",
  btnTextColor = "#ffffff",
  autoplay = true,
  interval = 5000,
}: {
  slides: SlideData[]
  height?: string
  overlayOpacity?: number
  btnBg?: string
  btnTextColor?: string
  autoplay?: boolean
  interval?: number
}) {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    if (!autoplay || slides.length <= 1) return
    const timer = window.setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length)
    }, interval)
    return () => window.clearInterval(timer)
  }, [autoplay, interval, slides.length])

  const slide = slides[current] || slides[0]
  if (!slide) return null

  return (
    <div
      className="w-full relative bg-zinc-50 overflow-hidden border-b border-zinc-200 transition-all duration-500"
      style={{ height }}
    >
      {slide.media_url ? (
        <>
          {slide.media_type === "video" ? (
            <video
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover z-0"
              src={slide.media_url}
            />
          ) : (
            <picture>
              {slide.mobile_media_url && <source media="(max-width: 767px)" srcSet={slide.mobile_media_url} />}
              <img
                className="absolute inset-0 w-full h-full object-cover z-0 transition-opacity duration-500"
                src={slide.media_url}
                alt={slide.title || "Hero Banner"}
              />
            </picture>
          )}
          <div
            className="absolute inset-0 z-0"
            style={{ backgroundColor: `rgba(255,255,255,${Math.max(0.15, (100 - overlayOpacity) / 140)})` }}
          />
        </>
      ) : (
        <>
          <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-violet-500/10 blur-[120px] pointer-events-none z-0" />
          <div className="absolute top-1/3 right-1/4 -translate-y-1/2 w-[350px] h-[350px] rounded-full bg-indigo-500/10 blur-[100px] pointer-events-none z-0" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-50 z-0" />
        </>
      )}

      <div className="absolute inset-0 z-10 flex flex-col justify-center items-center text-center px-6 small:p-32 gap-6">
        {slide.tag && (
          <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-violet-500/20 bg-white/90 text-violet-700 text-xs font-semibold tracking-wider uppercase shadow-2xs">
            {slide.tag}
          </span>
        )}

        <span className="flex flex-col gap-3 max-w-3xl">
          <Heading
            level="h1"
            className="text-4xl md:text-6xl font-bold tracking-tight text-zinc-950 font-sans leading-tight"
          >
            {slide.title}
          </Heading>
          {slide.subtitle && (
            <p className="text-base md:text-xl text-zinc-700 font-medium max-w-xl mx-auto leading-relaxed">
              {slide.subtitle}
            </p>
          )}
        </span>

        {slide.btn_text && (
          <div className="flex flex-col small:flex-row gap-4 mt-2">
            <Link href={slide.btn_link || "/store"}>
              <Button
                className="px-8 py-3.5 rounded-lg shadow-md transition-all duration-300 transform hover:scale-[1.02] flex items-center gap-2 font-bold border-none"
                style={{
                  backgroundColor: btnBg,
                  color: btnTextColor,
                }}
              >
                {slide.btn_text}
              </Button>
            </Link>
          </div>
        )}

        {slides.length > 1 && (
          <div className="flex items-center gap-2 mt-4">
            {slides.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrent(idx)}
                aria-label={`Slayt ${idx + 1}`}
                className={`h-2.5 rounded-full transition-all ${
                  idx === current ? "w-8 bg-zinc-900" : "w-2.5 bg-zinc-400/60 hover:bg-zinc-600"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
