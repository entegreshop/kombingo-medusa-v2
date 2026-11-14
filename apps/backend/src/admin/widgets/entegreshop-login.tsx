import React, { useEffect, useState } from "react"
import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { ENTEGRESHOP_LOGO_BLACK } from "../routes/dashboard/page"

const EntegreShopLoginWidget = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState("admin@entegreshop.com")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const fromPath = (location.state as any)?.from?.pathname || "/dashboard"

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.title = "EntegreShop v5.2.1 Yönetim Paneli - Giriş"
    }
  }, [])

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    const trimmedEmail = email.trim()
    if (!trimmedEmail || !password) {
      setErrorMessage("Lütfen e-posta adresinizi ve şifrenizi girin.")
      return
    }

    setIsLoading(true)
    try {
      const sdk = (window as any).__sdk
      if (sdk?.auth?.login) {
        await sdk.auth.login("user", "emailpass", {
          email: trimmedEmail,
          password,
        })
      } else {
        const res = await fetch("/auth/user/emailpass", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: trimmedEmail, password }),
        })
        if (!res.ok) {
          throw new Error("E-posta adresi veya şifre hatalı.")
        }
        const data = await res.json()
        if (data?.token) {
          await fetch("/auth/session", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${data.token}`,
            },
          })
        }
      }
      navigate(fromPath === "/" || fromPath === "/orders" ? "/dashboard" : fromPath, {
        replace: true,
      })
    } catch (err: any) {
      setErrorMessage("Giriş başarısız: E-posta adresi veya şifre hatalı.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div
      id="entegreshop-login-screen"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        backgroundColor: "#e9ecf1",
        backgroundImage:
          "repeating-linear-gradient(-45deg, rgba(255,255,255,0.35) 0px, rgba(255,255,255,0.35) 14px, transparent 14px, transparent 28px)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        fontFamily:
          "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      <style>{`
        /* Medusa varsayılan login kartını ve logosunu tamamen gizle */
        div.max-w-\\[280px\\] > *:not(#entegreshop-login-wrapper) {
          visibility: hidden !important;
        }
        #entegreshop-login-screen, #entegreshop-login-screen * {
          visibility: visible !important;
          box-sizing: border-box;
        }
      `}</style>

      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "16px",
          border: "1px solid #d5dbe3",
          boxShadow: "0 25px 50px -12px rgba(15, 23, 42, 0.22)",
          width: "100%",
          maxWidth: "390px",
          padding: "36px 32px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          position: "relative",
        }}
      >
        {/* Top EntegreShop Brand Header (Replaces Medusa Logo) */}
        <div
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            paddingBottom: "16px",
            marginBottom: "16px",
            borderBottom: "1px solid rgba(226, 232, 240, 0.8)",
          }}
        >
          <img
            src={ENTEGRESHOP_LOGO_BLACK}
            alt="EntegreShop"
            style={{
              height: "56px",
              width: "auto",
              objectFit: "contain",
              marginBottom: "10px",
            }}
          />
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "3px 11px",
              borderRadius: "9999px",
              backgroundColor: "#f1f5f9",
              border: "1px solid #cbd5e1",
              fontSize: "10.5px",
              fontWeight: 700,
              color: "#334155",
            }}
          >
            <span
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "9999px",
                backgroundColor: "#10b981",
              }}
            />
            EntegreShop v5.2.1 Yönetim Paneli
          </span>
        </div>

        <h1
          style={{
            fontSize: "18px",
            fontWeight: 800,
            color: "#0f172a",
            letterSpacing: "-0.015em",
            margin: 0,
          }}
        >
          EntegreShop&apos;a Hoş Geldiniz
        </h1>
        <p
          style={{
            fontSize: "12px",
            fontWeight: 500,
            color: "#64748b",
            marginTop: "5px",
            marginBottom: "20px",
          }}
        >
          EntegreShop yönetim paneline erişmek için oturum açın
        </p>

        <form
          onSubmit={handleLoginSubmit}
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            textAlign: "left",
          }}
        >
          <div>
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="E-posta"
              style={{
                width: "100%",
                height: "40px",
                padding: "0 14px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                backgroundColor: "rgba(248, 250, 252, 0.7)",
                fontSize: "12.5px",
                fontWeight: 500,
                color: "#1e293b",
                outline: "none",
              }}
            />
          </div>

          <div style={{ position: "relative" }}>
            <input
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Şifre"
              style={{
                width: "100%",
                height: "40px",
                padding: "0 36px 0 14px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                backgroundColor: "rgba(248, 250, 252, 0.7)",
                fontSize: "12.5px",
                fontWeight: 500,
                color: "#1e293b",
                outline: "none",
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              title={showPassword ? "Şifreyi Gizle" : "Şifreyi Göster"}
              style={{
                position: "absolute",
                right: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "transparent",
                border: "none",
                color: "#94a3b8",
                fontSize: "13px",
                cursor: "pointer",
                padding: "2px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              👁
            </button>
          </div>

          {errorMessage && (
            <div
              style={{
                padding: "8px 12px",
                borderRadius: "8px",
                backgroundColor: "#fef2f2",
                border: "1px solid #fecaca",
                color: "#dc2626",
                fontSize: "11.5px",
                fontWeight: 600,
                textAlign: "center",
              }}
            >
              {errorMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: "100%",
              height: "40px",
              marginTop: "4px",
              borderRadius: "8px",
              backgroundColor: "#0f172a",
              color: "#ffffff",
              fontSize: "12.5px",
              fontWeight: 700,
              border: "none",
              boxShadow: "0 1px 3px rgba(15, 23, 42, 0.15)",
              cursor: isLoading ? "wait" : "pointer",
              opacity: isLoading ? 0.8 : 1,
              transition: "background-color 0.15s ease",
            }}
          >
            {isLoading ? "Oturum Açılıyor..." : "E-posta ile Devam Et"}
          </button>
        </form>

        <div
          style={{
            marginTop: "16px",
            fontSize: "11.5px",
            color: "#64748b",
            fontWeight: 500,
          }}
        >
          Şifrenizi mi unuttunuz? -{" "}
          <Link
            to="/reset-password"
            style={{
              color: "#1565c0",
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            Sıfırla
          </Link>
        </div>
      </div>
    </div>
  )
}

export const config = defineWidgetConfig({
  zone: "login.before",
})

export default EntegreShopLoginWidget
