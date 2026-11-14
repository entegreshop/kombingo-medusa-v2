"use client"

import { Popover, PopoverPanel, Transition } from "@headlessui/react"
import { XMark } from "@medusajs/icons"
import { clx } from "@medusajs/ui"
import { Fragment, useState } from "react"
import { useRouter } from "next/navigation"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { HttpTypes } from "@medusajs/types"
import { Locale } from "@lib/data/locales"

const isExcludedCategory = (cat: any) => {
  if (!cat) return true
  const handle = cat.handle?.toLowerCase() || ""
  const name = cat.name?.toLowerCase() || ""
  
  if (["shirts", "sweatshirts", "pants", "merch"].includes(handle)) {
    return true
  }
  if (handle.startsWith("test") || name.startsWith("test")) {
    return true
  }
  return false
}

type SideMenuProps = {
  regions: HttpTypes.StoreRegion[] | null
  locales: Locale[] | null
  currentLocale: string | null
  categories?: any[] | null
}

const ChevronDown = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2}
    stroke="currentColor"
    className={className}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
  </svg>
)

const SearchIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
  </svg>
)

const UserIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="8" r="3.5" />
    <path d="M7 20c0-3.5 2.5-5.5 5-5.5s5 2 5 5.5H7z" />
  </svg>
)

const UserPlusIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="10" cy="8" r="3.5" />
    <path d="M5 20c0-3.5 2.5-5.5 5-5.5s5 2 5 5.5H5z" />
    <path d="M19 8v5m-2.5-2.5h5" />
  </svg>
)

const CartIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M4 5h2.5l1.5 9.5h9l1.5-6H7.5" />
    <circle cx="9.5" cy="18.5" r="1" />
    <circle cx="16.5" cy="18.5" r="1" />
  </svg>
)

const DocumentIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
    <polyline points="14 3 14 8 19 8" />
    <line x1="9" y1="11" x2="12" y2="11" />
    <line x1="9" y1="15" x2="15" y2="15" />
    <line x1="9" y1="18" x2="15" y2="18" />
  </svg>
)

const SideMenu = ({ regions, locales, currentLocale, categories }: SideMenuProps) => {
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({})
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()

  const toggleCategory = (id: string) => {
    setOpenCategories((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  const handleSearch = (e: React.FormEvent, close: () => void) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/store?q=${encodeURIComponent(searchQuery.trim())}`)
      close()
    }
  }

  return (
    <div className="h-full">
      <div className="flex items-center h-full">
        <Popover className="h-full flex">
          {({ open, close }) => (
            <>
              <div className="relative flex h-full">
                <Popover.Button
                  data-testid="nav-menu-button"
                  className="relative h-full flex items-center transition-all ease-out duration-200 focus:outline-none hover:text-zinc-600 group/btn"
                >
                  <div className="flex items-center gap-2">
                    <div className="flex flex-col gap-1.5 w-5 justify-center h-5">
                      <span className={clx("h-[1.5px] w-5 bg-zinc-900 rounded-full transition-all duration-300 group-hover/btn:bg-zinc-600", open ? "rotate-45 translate-y-2" : "")}></span>
                      <span className={clx("h-[1.5px] w-5 bg-zinc-900 rounded-full transition-all duration-300", open ? "opacity-0" : "")}></span>
                      <span className={clx("h-[1.5px] w-5 bg-zinc-900 rounded-full transition-all duration-300", open ? "-rotate-45 -translate-y-1.5" : "")}></span>
                    </div>
                  </div>
                </Popover.Button>
              </div>

              {open && (
                <div
                  className="fixed inset-0 z-[50] bg-black/40 pointer-events-auto"
                  onClick={close}
                  data-testid="side-menu-backdrop"
                />
              )}

              <Transition
                show={open}
                as={Fragment}
                enter="transition ease-out duration-300 transform"
                enterFrom="-translate-x-full"
                enterTo="translate-x-0"
                leave="transition ease-in duration-200 transform"
                leaveFrom="translate-x-0"
                leaveTo="-translate-x-full"
              >
                <PopoverPanel className="flex flex-col fixed inset-0 w-full h-[100dvh] z-[100] bg-white overflow-hidden">
                  <div className="flex flex-col h-full bg-white relative">
                    {/* Header: Logo and Close Button */}
                    <div className="flex items-center justify-between p-4 pb-2">
                       <div className="flex-1">
                         <img src="/logo.png" alt="Kombingo" className="h-7 w-auto object-contain" />
                       </div>
                       
                       <div className="flex items-center gap-4">
                         <button onClick={close} className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-300 text-gray-500 hover:text-black hover:border-gray-500 focus:outline-none transition-colors">
                           <XMark className="w-5 h-5" />
                         </button>
                       </div>
                    </div>

                    <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide flex flex-col mt-2">
                      {/* Search Bar */}
                      <div className="px-4 pb-4 border-b border-gray-200">
                         <form onSubmit={(e) => handleSearch(e, close)} className="relative flex items-center">
                           <input 
                              type="text" 
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              placeholder="Aramak istediğiniz ürünü yazın..." 
                              className="w-full border border-gray-300 rounded-sm pl-4 pr-10 py-3 text-[14px] text-gray-700 focus:outline-none focus:border-gray-500 placeholder-gray-400" 
                           />
                           <button type="submit" className="absolute right-3 text-gray-400 hover:text-gray-600 focus:outline-none">
                             <SearchIcon className="w-5 h-5" />
                           </button>
                         </form>
                      </div>

                      {/* Categories */}
                      <div className="px-4 pt-6 pb-2">
                         <div className="text-[13px] font-bold uppercase tracking-wide text-black mb-4">
                            Tüm Kategoriler
                         </div>
                      </div>
                      <ul className="flex flex-col px-4">
                         {categories
                           ?.filter((cat) => !cat.parent_category_id && !isExcludedCategory(cat))
                           ?.map((cat) => {
                             const children = categories?.filter(
                               (child) => child.parent_category_id === cat.id && !isExcludedCategory(child)
                             ) || []

                             return (
                               <li key={cat.id} className="border-t border-gray-200 last:border-b">
                                 <div className="flex items-center justify-between w-full py-4">
                                   <LocalizedClientLink
                                     href={`/categories/${cat.handle}`}
                                     className="text-[14px] font-bold uppercase text-black hover:text-gray-600 transition-colors flex-1"
                                     onClick={close}
                                   >
                                     {cat.name}
                                   </LocalizedClientLink>
                                   {children.length > 0 && (
                                     <button
                                       onClick={(e) => {
                                         e.stopPropagation()
                                         toggleCategory(cat.id)
                                       }}
                                       className="p-1 text-black hover:text-gray-600 transition-colors focus:outline-none"
                                     >
                                       <ChevronDown className={clx("w-5 h-5 transition-transform duration-200", openCategories[cat.id] ? "rotate-180" : "")} />
                                     </button>
                                   )}
                                 </div>
                                 
                                 {children.length > 0 && (
                                   <div className={clx(
                                     "grid transition-all duration-300 ease-in-out",
                                     openCategories[cat.id] ? "grid-rows-[1fr] opacity-100 mb-4" : "grid-rows-[0fr] opacity-0 overflow-hidden"
                                   )}>
                                     <div className="overflow-hidden">
                                       <ul className="flex flex-col gap-3 pl-0">
                                         {children.map((child) => (
                                           <li key={child.id}>
                                             <LocalizedClientLink
                                               href={`/categories/${child.handle}`}
                                               className="text-[14px] font-medium text-gray-700 hover:text-black transition-colors"
                                               onClick={close}
                                             >
                                               {child.name}
                                             </LocalizedClientLink>
                                           </li>
                                         ))}
                                       </ul>
                                     </div>
                                   </div>
                                 )}
                               </li>
                             )
                           })}
                      </ul>

                      {/* Yardım Merkezi */}
                      <div className="mt-auto px-4 pb-8 pt-10">
                         <div className="text-[13px] font-bold uppercase tracking-wide text-black mb-4">
                            Yardım Merkezi
                         </div>
                         <div className="grid grid-cols-2 grid-rows-2 border border-gray-200 bg-white">
                            <LocalizedClientLink href="/account" onClick={close} className="flex flex-col items-center justify-center py-8 px-2 border-r border-b border-gray-200 hover:bg-gray-50 transition-colors group">
                               <UserIcon className="w-7 h-7 text-black group-hover:text-gray-600 mb-3" />
                               <span className="text-[13px] font-bold text-black tracking-wide">Giriş Yap</span>
                            </LocalizedClientLink>
                            <LocalizedClientLink href="/account" onClick={close} className="flex flex-col items-center justify-center py-8 px-2 border-b border-gray-200 hover:bg-gray-50 transition-colors group">
                               <UserPlusIcon className="w-7 h-7 text-black group-hover:text-gray-600 mb-3" />
                               <span className="text-[13px] font-bold text-black tracking-wide">Üye Ol</span>
                            </LocalizedClientLink>
                            <LocalizedClientLink href="/account/orders" onClick={close} className="flex flex-col items-center justify-center py-8 px-2 border-r border-gray-200 hover:bg-gray-50 transition-colors group">
                               <CartIcon className="w-7 h-7 text-black group-hover:text-gray-600 mb-3" />
                               <span className="text-[13px] font-bold text-black tracking-wide">Sipariş Takip</span>
                            </LocalizedClientLink>
                            <LocalizedClientLink href="/customer-service" onClick={close} className="flex flex-col items-center justify-center py-8 px-2 border-gray-200 hover:bg-gray-50 transition-colors group">
                               <DocumentIcon className="w-7 h-7 text-black group-hover:text-gray-600 mb-3" />
                               <span className="text-[13px] font-bold text-black tracking-wide">S.S.S</span>
                            </LocalizedClientLink>
                         </div>
                      </div>

                    </div>
                  </div>
                </PopoverPanel>
              </Transition>
            </>
          )}
        </Popover>
      </div>
    </div>
  )
}

export default SideMenu
