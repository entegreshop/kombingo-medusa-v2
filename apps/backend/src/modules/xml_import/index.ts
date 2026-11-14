import { Module } from "@medusajs/framework/utils"
import { MedusaService } from "@medusajs/framework/utils"
import { XmlSource } from "./models/xml-source"

export const XML_IMPORT_MODULE = "xml_import"

class XmlImportService extends MedusaService({ XmlSource }) {
  // We can add methods here later, for now we just inherit DML methods
}

export default Module(XML_IMPORT_MODULE, {
  service: XmlImportService,
})
