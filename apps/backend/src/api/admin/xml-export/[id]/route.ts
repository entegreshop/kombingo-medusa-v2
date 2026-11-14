import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { getXmlFeeds, saveXmlFeeds } from "../route"

export async function DELETE(
  req: MedusaRequest,
  res: MedusaResponse
) {
  try {
    const id = req.params.id
    if (!id) {
      return res.status(400).json({ success: false, error: "Feed ID is required" })
    }

    let feeds = getXmlFeeds()
    const initialLength = feeds.length
    feeds = feeds.filter(f => f.id !== id)

    if (feeds.length === initialLength) {
      return res.status(404).json({ success: false, error: "Feed not found" })
    }

    saveXmlFeeds(feeds)
    res.json({ success: true, id })
  } catch (error) {
    console.error("Error deleting xml feed:", error)
    res.status(500).json({ success: false, error: "Internal server error" })
  }
}
