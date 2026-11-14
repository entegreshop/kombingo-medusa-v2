import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { XML_IMPORT_MODULE } from "../../../modules/xml_import"

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
) {
  try {
    const xmlImportService: any = req.scope.resolve(XML_IMPORT_MODULE)
    console.log("Resolved Service Keys: ", Object.keys(xmlImportService), xmlImportService.__type)
    const created = await xmlImportService.createXmlSources(req.body)
    res.json({ xml_source: created })
  } catch (error: any) {
    res.status(400).json({ message: error.message })
  }
}

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
) {
  try {
    const xmlImportService: any = req.scope.resolve(XML_IMPORT_MODULE)
    const sources = await xmlImportService.listXmlSources()
    res.json({ xml_sources: sources })
  } catch (error: any) {
    res.status(400).json({ message: error.message })
  }
}
