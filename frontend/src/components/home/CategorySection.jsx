import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { Link } from 'react-router-dom'

import { ChevronLeft, ChevronRight } from 'lucide-react'

import { normalizeCategoryLink } from '../../config/categoryRoutes'

import { api } from '../../services/api'

import { homeCategories } from '../../data/fallbackCatalog'

import {

  DEFAULT_CATEGORY_CAROUSEL,

  mapApiCategoryCarouselItem,

} from '../../data/defaultCategoryCarousel'

import { resolveMediaUrl } from '../../utils/mediaUrl'



const GAP = 32

const ITEM_MIN = 120



function CategoryMedia({ video, poster, label }) {

  const [showPoster, setShowPoster] = useState(!video)

  const resolvedPoster = resolveMediaUrl(poster)

  const resolvedVideo = video ? resolveMediaUrl(video) : ''



  if (showPoster || !resolvedVideo) {

    return (

      <img

        src={resolvedPoster}

        alt={label}

        className="h-full w-full object-cover"

        loading="lazy"

      />

    )

  }



  return (

    <video

      src={resolvedVideo}

      poster={resolvedPoster}

      autoPlay

      muted

      loop

      playsInline

      preload="metadata"

      onError={() => setShowPoster(true)}

      className="h-full w-full object-cover"

    />

  )

}



const CategorySection = () => {

  const trackRef = useRef(null)

  const [offset, setOffset] = useState(0)

  const [maxOffset, setMaxOffset] = useState(0)

  const [step, setStep] = useState(ITEM_MIN + GAP)

  const [remoteItems, setRemoteItems] = useState(null)



  useEffect(() => {

    let cancelled = false

    api

      .categoryCarousel()

      .then((payload) => {

        if (cancelled) return

        const items = (payload.items || []).map(mapApiCategoryCarouselItem)

        setRemoteItems(items.length ? items : [])

      })

      .catch(() => {

        if (!cancelled) setRemoteItems([])

      })

    return () => {

      cancelled = true

    }

  }, [])



  const categories = useMemo(() => {

    if (remoteItems === null) return homeCategories

    if (remoteItems.length) return remoteItems

    return DEFAULT_CATEGORY_CAROUSEL.map(mapApiCategoryCarouselItem)

  }, [remoteItems])



  const recalc = useCallback(() => {

    const track = trackRef.current

    if (!track) return

    const viewport = track.parentElement

    if (!viewport) return



    const itemEl = track.querySelector('[data-category-item]')

    const itemW = itemEl ? itemEl.offsetWidth : ITEM_MIN

    const nextStep = itemW + GAP

    const totalW = track.scrollWidth

    const viewW = viewport.clientWidth

    const max = Math.max(0, totalW - viewW)



    setStep(nextStep)

    setMaxOffset(max)

    setOffset((prev) => Math.min(prev, max))

  }, [])



  useEffect(() => {

    recalc()

    window.addEventListener('resize', recalc)

    return () => window.removeEventListener('resize', recalc)

  }, [recalc, categories])



  const slide = (dir) => {

    const delta = step * 3

    setOffset((prev) => {

      if (dir === 'left') return Math.max(0, prev - delta)

      return Math.min(maxOffset, prev + delta)

    })

  }



  const canGoLeft = offset > 4

  const canGoRight = offset < maxOffset - 4



  return (

    <section className="bg-[#f5f5f5] py-12 sm:py-16">

      <div className="mx-auto max-w-7xl px-4 sm:px-6">

        <div className="mb-10 text-center sm:mb-12">

          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-orange-500 sm:text-sm">

            Browse Categories

          </p>

          <h2 className="mt-2 font-heading text-3xl font-bold text-gray-900 sm:text-4xl">

            Shop By{' '}

            <span className="italic text-orange-500">Category</span>

          </h2>

        </div>



        <div className="relative px-10 sm:px-12">

          <button

            type="button"

            aria-label="Previous categories"

            onClick={() => slide('left')}

            disabled={!canGoLeft}

            className="absolute left-0 top-[62px] z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white text-gray-700 shadow-lg transition hover:bg-orange-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-35 sm:top-[68px] sm:h-11 sm:w-11"

          >

            <ChevronLeft size={22} strokeWidth={2.5} />

          </button>



          <div className="overflow-hidden">

            <div

              ref={trackRef}

              className="flex transition-transform duration-500 ease-out"

              style={{

                gap: `${GAP}px`,

                transform: `translateX(-${offset}px)`,

                touchAction: 'none',

              }}

            >

              <Link

                data-category-item

                to="/products"

                className="group flex w-[120px] shrink-0 flex-col items-center sm:w-[130px]"

              >

                <div className="relative h-[120px] w-[120px] sm:h-[130px] sm:w-[130px]">

                  <div className="absolute inset-0 rounded-full border-[3px] border-orange-500 bg-gradient-to-br from-orange-400 to-amber-400 shadow-[0_8px_24px_rgba(0,0,0,0.12)] transition group-hover:shadow-[0_12px_28px_rgba(249,115,22,0.25)]" />

                  <div className="absolute inset-0 flex items-center justify-center rounded-full text-center text-sm font-bold text-white">

                    All

                  </div>

                </div>

                <h3 className="mt-3 max-w-[120px] text-center text-[13px] font-bold leading-tight text-gray-900 transition group-hover:text-orange-600 sm:text-sm">

                  All Products

                </h3>

              </Link>



              {categories.map((item, index) => (

                <Link

                  key={item._id || `${item.value}-${index}`}

                  data-category-item

                  to={normalizeCategoryLink(item)}

                  className="group flex w-[120px] shrink-0 flex-col items-center sm:w-[130px]"

                >

                  <div className="relative h-[120px] w-[120px] sm:h-[130px] sm:w-[130px]">

                    <div className="absolute inset-0 rounded-full border-[3px] border-orange-500 bg-white shadow-[0_8px_24px_rgba(0,0,0,0.12)] transition group-hover:shadow-[0_12px_28px_rgba(249,115,22,0.25)]" />

                    <div className="absolute inset-[5px] overflow-hidden rounded-full">

                      <CategoryMedia

                        video={item.video}

                        poster={item.poster}

                        label={item.label}

                      />

                    </div>

                  </div>

                  <h3 className="mt-3 max-w-[120px] text-center text-[13px] font-bold leading-tight text-gray-900 transition group-hover:text-orange-600 sm:text-sm">

                    {item.label}

                  </h3>

                </Link>

              ))}

            </div>

          </div>



          <button

            type="button"

            aria-label="Next categories"

            onClick={() => slide('right')}

            disabled={!canGoRight}

            className="absolute right-0 top-[62px] z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white text-gray-700 shadow-lg transition hover:bg-orange-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-35 sm:top-[68px] sm:h-11 sm:w-11"

          >

            <ChevronRight size={22} strokeWidth={2.5} />

          </button>

        </div>

      </div>

    </section>

  )

}



export default CategorySection

