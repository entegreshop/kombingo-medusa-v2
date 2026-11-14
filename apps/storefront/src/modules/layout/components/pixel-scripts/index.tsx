import { sdk } from "@lib/config"
import PixelRouteTracker from "./route-tracker"

export default async function PixelScripts() {
  let config = null
  try {
    const res = await sdk.client.fetch<{ config: any }>("/store/pixel-settings", {
      cache: "no-store",
    })
    config = res?.config
  } catch (e) {
    console.error("Error loading pixel settings on storefront:", e)
  }

  if (!config) return null

  const {
    meta_pixel,
    google_ads,
    google_analytics,
    google_tag_manager,
    tiktok_pixel
  } = config

  return (
    <>
      {/* Dynamic Navigation & PageView Tracker */}
      <PixelRouteTracker config={config} />

      {/* 1. Meta Pixel */}
      {meta_pixel?.active && meta_pixel?.pixel_id && (
        <>
          <script
            id="fb-pixel"
            dangerouslySetInnerHTML={{
              __html: `
                !function(f,b,e,v,n,t,s)
                {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t,s)}(window, document,'script',
                'https://connect.facebook.net/en_US/fbevents.js');
                fbq('init', '${meta_pixel.pixel_id}');
              `,
            }}
          />
          <noscript>
            <img
              height="1"
              width="1"
              style={{ display: "none" }}
              src={`https://www.facebook.com/tr?id=${meta_pixel.pixel_id}&ev=PageView&noscript=1`}
              alt="meta-pixel-noscript"
            />
          </noscript>
        </>
      )}

      {/* 2. Google Analytics (GA4) */}
      {google_analytics?.active && google_analytics?.measurement_id && (
        <>
          <script
            async
            src={`https://www.googletagmanager.com/gtag/js?id=${google_analytics.measurement_id}`}
          />
          <script
            id="ga4-pixel"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${google_analytics.measurement_id}', { send_page_view: false });
              `,
            }}
          />
        </>
      )}

      {/* 3. Google Tag Manager */}
      {google_tag_manager?.active && google_tag_manager?.gtm_id && (
        <>
          <script
            id="gtm-pixel"
            dangerouslySetInnerHTML={{
              __html: `
                (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                })(window,document,'script','dataLayer','${google_tag_manager.gtm_id}');
              `,
            }}
          />
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${google_tag_manager.gtm_id}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
              title="gtm-noscript"
            />
          </noscript>
        </>
      )}

      {/* 4. TikTok Pixel */}
      {tiktok_pixel?.active && tiktok_pixel?.pixel_id && (
        <script
          id="tiktok-pixel"
          dangerouslySetInnerHTML={{
            __html: `
              !function (w, d, t) {
                w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var e=0;e<ttq.methods.length;e++)ttq.setAndDefer(ttq,ttq.methods[e]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.mixpool;w[t].type="use_cookie",w[t].enableSdk=1,w[t].instances=n&&n.instances||[];var i=d.createElement("script");i.type="text/javascript",i.async=!0,i.src=r;var a=d.getElementsByTagName("script")[0];a.parentNode.insertBefore(i,a)};
                ttq.load('${tiktok_pixel.pixel_id}');
              }(window, document, 'ttq');
            `,
          }}
        />
      )}

      {/* 5. Google Ads Conversion Pixel */}
      {google_ads?.active && google_ads?.conversion_id && (
        <>
          <script
            async
            src={`https://www.googletagmanager.com/gtag/js?id=${google_ads.conversion_id}`}
          />
          <script
            id="google-ads-pixel"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${google_ads.conversion_id}', { send_page_view: false });
              `,
            }}
          />
        </>
      )}
    </>
  )
}
