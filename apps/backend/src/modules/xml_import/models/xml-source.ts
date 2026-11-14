import { model } from "@medusajs/framework/utils"

export const XmlSource = model.define("xml_source", {
  id: model.id().primaryKey(),
  name: model.text(),
  url: model.text(),
  schedule: model.text(),
  prefix_product: model.text().nullable(),
  prefix_barcode: model.text().nullable(),
  cdn_link: model.text().nullable(),
  xml_main_tag: model.text().nullable(),
  xml_products_tag: model.text().nullable(),
  xml_product_tag: model.text().nullable(),
  settings: model.json().nullable(),
  tag_mappings: model.json().nullable(),
  category_mappings: model.json().nullable(),
})
