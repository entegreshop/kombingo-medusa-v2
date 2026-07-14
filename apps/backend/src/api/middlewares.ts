import { defineMiddlewares } from "@medusajs/framework/http"
import express from "express"

export default defineMiddlewares({
  routes: [
    {
      method: "USE",
      matcher: "/uploads/*",
      middlewares: [
        express.static(".")
      ],
    },
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
  ]
})
