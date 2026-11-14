import { defineMiddlewares } from "@medusajs/framework/http"

export default defineMiddlewares({
  routes: [
    {
      method: ["POST"],
      matcher: "/admin/hero-config/upload",
      bodyParser: {
        sizeLimit: "25mb",
      },
    },
    {
      method: ["POST"],
      matcher: "/admin/hero-config",
      bodyParser: {
        sizeLimit: "25mb",
      },
    },
    {
      method: ["POST"],
      matcher: "/admin/catalog-operations",
      bodyParser: {
        sizeLimit: "25mb",
      },
    },
    {
      method: ["POST"],
      matcher: "/store/product-reviews",
      bodyParser: {
        sizeLimit: "25mb",
      },
    },
  ],
})
