import { loadEnv, defineConfig, Modules } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())
delete process.env.REDIS_URL

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    databaseDriverOptions: process.env.DATABASE_SSL === "true" ? {
      ssl: { rejectUnauthorized: false },
      connection: { ssl: { rejectUnauthorized: false } }
    } : {},
    sessionOptions: {
      name: "medusa.sid",
      secret: process.env.COOKIE_SECRET || "supersecret",
      resave: false,
      saveUninitialized: false,
    },
    cookieOptions: {
      secure: false,
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    },
    http: {
      storeCors: (process.env.STORE_CORS || "https://kombingo.com,https://www.kombingo.com") + (process.env.COOLIFY_URL ? `,${process.env.COOLIFY_URL},http://kombingo.com,https://kombingo.com,http://www.kombingo.com,https://www.kombingo.com` : ""),
      adminCors: (process.env.ADMIN_CORS || "https://api.kombingo.com,https://kombingo.com,https://www.kombingo.com") + (process.env.COOLIFY_URL ? `,${process.env.COOLIFY_URL},http://kombingo.com,https://kombingo.com,http://www.kombingo.com,https://www.kombingo.com` : ""),
      authCors: (process.env.AUTH_CORS || "https://api.kombingo.com,https://kombingo.com,https://www.kombingo.com") + (process.env.COOLIFY_URL ? `,${process.env.COOLIFY_URL},http://kombingo.com,https://kombingo.com,http://www.kombingo.com,https://www.kombingo.com` : ""),
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    }
  },
  admin: {
    path: "/app",
    backendUrl: process.env.MEDUSA_BACKEND_URL || "https://api.kombingo.com",
  },
  modules: {
    [Modules.PAYMENT]: {
      resolve: "@medusajs/payment",
      options: {
        providers: [
          {
            resolve: "./src/modules/custom-payment/providers/cash-on-delivery",
            id: "CASH-ON-DELIVERY",
            options: {},
          },
          {
            resolve: "./src/modules/custom-payment/providers/card-on-delivery",
            id: "CARD-ON-DELIVERY",
            options: {},
          },
          {
            resolve: "./src/modules/custom-payment/providers/bank-transfer",
            id: "BANK-TRANSFER",
            options: {},
          },
          {
            resolve: "./src/modules/custom-payment/providers/paytr",
            id: "PAYTR",
            options: {},
          }
        ],
      },
    },
    multiPaymentModuleService: {
      resolve: "./src/modules/payment-integrations"
    },
    xml_import: {
      resolve: "./src/modules/xml_import",
    },
    [Modules.FILE]: {
      resolve: "@medusajs/file",
      options: {
        providers: [
          {
            resolve: "@medusajs/file-local",
            id: "local",
            options: {
              upload_dir: "uploads",
              backend_url: process.env.MEDUSA_BACKEND_URL || (process.env.COOLIFY_URL ? "https://api.kombingo.com/uploads" : "http://localhost:9001/uploads"),
            },
          },
        ],
      },
    },
  }
})

// Veritabanindaki eski payment provider kalintilarini ve kopmus baglantilari silen temizlik kodu
setTimeout(async () => {
  try {
    const { Client } = require('pg');
    const c = new Client({ connectionString: process.env.DATABASE_URL });
    await c.connect();
    
    // 1. Gecersiz odeme saglayicilarini sil (zaten silinmisti)
    await c.query(`DELETE FROM payment_provider WHERE id NOT IN ('pp_CASH-ON-DELIVERY_CASH-ON-DELIVERY', 'pp_CARD-ON-DELIVERY_CARD-ON-DELIVERY', 'pp_BANK-TRANSFER_BANK-TRANSFER', 'pp_PAYTR_PAYTR', 'pp_system_default')`).catch(() => {});
    
    // 2. Bölgelere (Region) bagli olan ama aslinda silinmis olan (null dönen) ödeme yöntemlerinin kopmus baglantilarini sil
    await c.query(`DELETE FROM region_payment_provider WHERE payment_provider_id NOT IN (SELECT id FROM payment_provider)`).catch(() => {});
    await c.query(`DELETE FROM store_payment_provider WHERE payment_provider_id NOT IN (SELECT id FROM payment_provider)`).catch(() => {});
    
    await c.end();
    console.log('KOPMUS VERITABANI BAGLANTILARI TEMIZLENDI!');
  } catch (e) { console.error(e); }
}, 10000);
