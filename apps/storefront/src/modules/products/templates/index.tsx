import React, { Suspense } from "react"
import ImageGallery from "@modules/products/components/image-gallery"
import ProductActions from "@modules/products/components/product-actions"
import RelatedProducts from "@modules/products/components/related-products"
import SkeletonRelatedProducts from "@modules/skeletons/templates/skeleton-related-products"
import { notFound } from "next/navigation"
import { HttpTypes } from "@medusajs/types"
import ProductActionsWrapper from "./product-actions-wrapper"
import ProductReviews from "@modules/products/components/product-reviews"
import HediyeUrunler from "@modules/products/components/hediye-urunler"

type ProductTemplateProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  countryCode: string
  images: HttpTypes.StoreProductImage[]
}

const ProductTemplate: React.FC<ProductTemplateProps> = ({
  product,
  region,
  countryCode,
  images,
}) => {
  if (!product || !product.id) {
    return notFound()
  }

  return (
    <>
      <div
        className="content-container flex flex-col small:flex-row small:items-start py-8 relative gap-8 lg:gap-12"
        data-testid="product-container"
      >
        {/* Left Column (60%): Gallery */}
        <div className="w-full small:w-[60%]">
          <ImageGallery images={images} />
        </div>

        {/* Right Column (40%): Sidebar */}
        <div className="flex flex-col small:sticky small:top-24 w-full small:w-[40%] gap-y-8">
          <Suspense
            fallback={
              <ProductActions
                disabled={true}
                product={product}
                region={region}
              />
            }
          >
            <ProductActionsWrapper id={product.id} region={region}>
              <Suspense fallback={null}>
                <HediyeUrunler product={product} region={region} />
              </Suspense>
            </ProductActionsWrapper>
          </Suspense>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="content-container">
        <ProductReviews product={product} />
      </div>

      <div
        className="content-container my-16 small:my-32"
        data-testid="related-products-container"
      >
        <Suspense fallback={<SkeletonRelatedProducts />}>
          <RelatedProducts product={product} countryCode={countryCode} />
        </Suspense>
      </div>
    </>
  )
}

export default ProductTemplate
