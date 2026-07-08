import { loadEnv, defineConfig, Modules } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

module.exports = defineConfig({
  admin: {
    disable: false,
    path: (process.env.MEDUSA_ADMIN_PATH || "/app") as `/${string}`,
    backendUrl: process.env.MEDUSA_BACKEND_URL || "http://localhost:9000",
  },
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    databaseDriverOptions: {
      pool: {
        min: 2,
        max: 40,
        idleTimeoutMillis: 30000,
        createTimeoutMillis: 30000,
      },
    },
    http: {
      storeCors: process.env.STORE_CORS + ",https://www.kombingo.com,https://kombingo.com,http://localhost:8000",
      adminCors: process.env.ADMIN_CORS + ",https://www.kombingo.com,https://kombingo.com,https://kombingo-admin.vercel.app,https://kombingo-yonetim.vercel.app",
      authCors: process.env.AUTH_CORS + ",https://www.kombingo.com,https://kombingo.com,https://kombingo-admin.vercel.app,https://kombingo-yonetim.vercel.app",
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    }
  },
  modules: [
    {
      resolve: "./src/modules/xml_import",
    },
    {
      resolve: "@medusajs/medusa/payment",
      options: {
        providers: [
          {
            resolve: "./src/modules/payment-integrations/providers/paytr",
          },
          {
            resolve: "./src/modules/payment-integrations/providers/cod",
          },
          {
            resolve: "./src/modules/payment-integrations/providers/bank-transfer",
          },
        ],
      },
    },
  ],
})
