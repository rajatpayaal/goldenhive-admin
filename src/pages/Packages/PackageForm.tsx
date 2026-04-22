import React, { useEffect, useRef, useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Trash2, Upload, X, ChevronDown, ChevronUp, GripVertical } from 'lucide-react'
import { fetchCategories, fetchCountries, fetchStates, fetchCities } from './service'
import { Toggle } from '../../components/ui'

const itineraryDaySchema = z.object({
  day: z.coerce.number().min(1),
  title: z.string().min(1, 'Title required'),
  meals: z.string().optional(),
  stay: z.string().optional(),
  description: z.string().optional(),
})

const schema = z.object({
  name: z.string().min(2, 'Name required'),
  slug: z.string().optional(),
  tagline: z.string().optional(),
  destination: z.string().min(2, 'Destination required'),
  categoryId: z.string().min(1, 'Category required'),
  countryId: z.string().min(1, 'Country required'),
  stateId: z.string().optional(),
  cityId: z.string().optional(),
  durationDays: z.coerce.number().min(1),
  nights: z.coerce.number().min(0),
  basePrice: z.coerce.number().min(0),
  discountPercent: z.coerce.number().min(0).max(100),
  currency: z.string().default('INR'),
  tags: z.array(z.string()).optional(),
  heroTitle: z.string().optional(),
  heroSubtitle: z.string().optional(),
  heroBadges: z.array(z.string()).optional(),
  heroCtaText: z.string().optional(),
  pickup: z.string().optional(),
  drop: z.string().optional(),
  meals: z.string().optional(),
  stay: z.string().optional(),
  transport: z.string().optional(),
  difficulty: z.string().optional(),
  timing: z.string().optional(),
  quickDuration: z.string().optional(),
  ageLimit: z.string().optional(),
  bestTime: z.string().optional(),
  groupSize: z.string().optional(),
  language: z.string().optional(),
  guide: z.string().optional(),
  overviewShort: z.string().optional(),
  overviewLong: z.string().optional(),
  address: z.string().optional(),
  mapUrl: z.string().optional(),
  whyChooseUs: z.array(z.string()).optional(),
  highlights: z.array(z.string()).optional(),
  inclusions: z.array(z.string()).optional(),
  exclusions: z.array(z.string()).optional(),
  travelBestTime: z.string().optional(),
  temperature: z.string().optional(),
  clothing: z.string().optional(),
  cancellation: z.string().optional(),
  refund: z.string().optional(),
  terms: z.string().optional(),
  whatsapp: z.string().optional(),
  call: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  keywords: z.array(z.string()).optional(),
  status: z.string().default('ACTIVE'),
  itinerary: z.array(itineraryDaySchema).optional(),
  visibilityTagline: z.boolean().default(true),
  visibilityPricing: z.boolean().default(true),
  visibilityStats: z.boolean().default(true),
  visibilityHero: z.boolean().default(true),
  visibilityGallery: z.boolean().default(true),
  visibilityQuickInfo: z.boolean().default(true),
  visibilityOverview: z.boolean().default(true),
  visibilityWhyChooseUs: z.boolean().default(true),
  visibilityHighlights: z.boolean().default(true),
  visibilityInclusions: z.boolean().default(true),
  visibilityExclusions: z.boolean().default(true),
  visibilityItinerary: z.boolean().default(true),
  visibilitySuggestions: z.boolean().default(true),
  visibilityHotelDetails: z.boolean().default(true),
  visibilityReviews: z.boolean().default(true),
  visibilityFaq: z.boolean().default(true),
})

type PackageFormData = z.infer<typeof schema>
type DynamicListName =
  | 'whyChooseUs'
  | 'highlights'
  | 'inclusions'
  | 'exclusions'
  | 'tags'
  | 'heroBadges'
  | 'keywords'

const VISIBILITY_KEYS = [
  { key: 'visibilityTagline', label: 'Tagline' },
  { key: 'visibilityPricing', label: 'Pricing Block' },
  { key: 'visibilityStats', label: 'Package Stats' },
  { key: 'visibilityHero', label: 'Hero Banner' },
  { key: 'visibilityGallery', label: 'Image Gallery' },
  { key: 'visibilityQuickInfo', label: 'Quick Info Grid' },
  { key: 'visibilityOverview', label: 'Overview Text' },
  { key: 'visibilityWhyChooseUs', label: 'Why Choose Us' },
  { key: 'visibilityHighlights', label: 'Highlights' },
  { key: 'visibilityInclusions', label: 'Inclusions/Exclusions' },
  { key: 'visibilityItinerary', label: 'Itinerary' },
  { key: 'visibilitySuggestions', label: 'Related Packages' },
  { key: 'visibilityHotelDetails', label: 'Hotel Details' },
  { key: 'visibilityReviews', label: 'Reviews' },
  { key: 'visibilityFaq', label: 'FAQs' },
] as const

const normalizeList = (payload: any) => {
  if (!payload) return []
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload.data)) return payload.data
  if (Array.isArray(payload.items)) return payload.items
  return []
}

const Section: React.FC<{ title: string; children: React.ReactNode; collapsible?: boolean }> = ({ title, children, collapsible = false }) => {
  const [open, setOpen] = useState(!collapsible)
  return (
    <div className="space-y-4 rounded-2xl border border-surface-border bg-surface-card/80 p-4 shadow-sm sm:rounded-3xl sm:p-5">
      <div className={`flex items-center justify-between gap-3 ${collapsible ? 'cursor-pointer' : ''}`} onClick={() => collapsible && setOpen(!open)}>
        <h4 className="text-sm font-semibold text-text-primary">{title}</h4>
        {collapsible && (open ? <ChevronUp className="w-4 h-4 text-text-tertiary" /> : <ChevronDown className="w-4 h-4 text-text-tertiary" />)}
      </div>
      {open && children}
    </div>
  )
}

const toCommaList = (value: any) => {
  if (!value) return ''
  if (Array.isArray(value)) return value.join(', ')
  return String(value)
}

const normalizeOptionalText = (value: unknown) => {
  if (value === undefined || value === null) return ''
  const text = String(value).trim()
  if (!text) return ''
  const lowered = text.toLowerCase()
  if (lowered === '[]') return ''
  if (lowered === 'not specified.' || lowered === 'not specified') return ''
  return text
}

const parseNestedJson = (value: unknown, depth = 0): unknown => {
  if (typeof value !== 'string' || depth > 5) return value

  const trimmed = value.trim()
  if (!trimmed) return ''

  const looksSerialized =
    (trimmed.startsWith('[') && trimmed.endsWith(']')) ||
    (trimmed.startsWith('{') && trimmed.endsWith('}')) ||
    (trimmed.startsWith('"') && trimmed.endsWith('"'))

  if (!looksSerialized) return trimmed

  try {
    return parseNestedJson(JSON.parse(trimmed), depth + 1)
  } catch {
    return trimmed
  }
}

const flattenToStringArray = (value: unknown): string[] => {
  if (value === undefined || value === null || value === '') return []

  const parsed = parseNestedJson(value)

  if (Array.isArray(parsed)) {
    return parsed.flatMap((item) => flattenToStringArray(item))
  }

  if (typeof parsed === 'string') {
    const trimmed = parsed.trim()
    return trimmed ? [trimmed] : []
  }

  return [String(parsed).trim()].filter(Boolean)
}

const toStringArray = (value: any) => flattenToStringArray(value)

const toBoolean = (value: unknown, fallback = true) => {
  if (value === undefined || value === null || value === '') return fallback
  if (typeof value === 'boolean') return value
  if (typeof value === 'number') return value === 1
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase()
    if (['true', '1', 'yes', 'on'].includes(normalized)) return true
    if (['false', '0', 'no', 'off'].includes(normalized)) return false
  }
  return fallback
}

export const buildPackageFormData = (data: PackageFormData, primaryImage?: File, gallery?: File[]) => {
  const fd = new FormData()
  const keys = Object.keys(data) as Array<keyof PackageFormData>
  const JSON_ARRAY_KEYS = new Set([
    'whyChooseUs',
    'highlights',
    'inclusions',
    'exclusions',
    'tags',
    'heroBadges',
    'keywords',
  ])
  const ALWAYS_APPEND_STRING_KEYS = new Set([
    'pickup',
    'drop',
    'meals',
    'transport',
    'bestTime',
    'groupSize',
    'language',
    'guide',
    'travelBestTime',
    'clothing',
    'cancellation',
    'refund',
    'terms',
  ])

  const visibility = {
    tagline: data.visibilityTagline,
    pricing: data.visibilityPricing,
    stats: data.visibilityStats,
    hero: data.visibilityHero,
    gallery: data.visibilityGallery,
    quickInfo: data.visibilityQuickInfo,
    overview: data.visibilityOverview,
    whyChooseUs: data.visibilityWhyChooseUs,
    highlights: data.visibilityHighlights,
    inclusions: data.visibilityInclusions,
    exclusions: data.visibilityExclusions,
    itinerary: data.visibilityItinerary,
    suggestions: data.visibilitySuggestions,
    hotelDetails: data.visibilityHotelDetails,
    reviews: data.visibilityReviews,
    faq: data.visibilityFaq,
  }

  keys.forEach((k) => {
    const value = data[k]
    if (JSON_ARRAY_KEYS.has(k as string)) {
      const raw = Array.isArray(value) ? value : toStringArray(value)
      const normalized = raw.map((item) => String(item).trim()).filter(Boolean)
      const unique = Array.from(new Set(normalized))
      fd.append(k as string, JSON.stringify(unique))
    } else if (k === 'itinerary') {
      fd.append('itinerary', JSON.stringify(value || []))
    } else if (typeof value === 'boolean') {
      fd.append(k as string, value ? 'true' : 'false')
    } else if (ALWAYS_APPEND_STRING_KEYS.has(k as string)) {
      // Allow clearing previously-saved values that might be `"[]"` or "Not specified."
      fd.append(k as string, normalizeOptionalText(value))
    } else if (value !== undefined && value !== '') {
      fd.append(k as string, String(value))
    }
  })

  fd.append('visibility', JSON.stringify(visibility))

  const finalPrice = Math.max(0, (Number(data.basePrice) || 0) * (1 - (Number(data.discountPercent) || 0) / 100))
  fd.append('finalPrice', String(finalPrice))
  fd.append('pricingBasePrice', String(data.basePrice))
  fd.append('pricingDiscountPercent', String(data.discountPercent))
  fd.append('pricingFinalPrice', String(finalPrice))

  if (primaryImage) fd.append('primaryImage', primaryImage)
  if (gallery) gallery.forEach((file) => fd.append('gallery', file))
  return fd
}

export const mapPackageToForm = (r: any): Partial<PackageFormData> => ({
  name: r.basic?.name,
  slug: r.basic?.slug,
  categoryId: String(r.categoryId?._id || r.categoryId || ''),
  countryId: String(r.countryId?._id || r.countryId || ''),
  stateId: String(r.stateId?._id || r.stateId || ''),
  cityId: String(r.cityId?._id || r.cityId || ''),
  tagline: r.basic?.tagline,
  destination: r.basic?.destination,
  durationDays: r.basic?.durationDays,
  nights: r.basic?.nights,
  basePrice: r.basic?.basePrice,
  discountPercent: r.basic?.discount,
  currency: r.basic?.currency || 'INR',
  tags: toStringArray(r.basic?.tags),
  heroTitle: r.hero?.title,
  heroSubtitle: r.hero?.subtitle,
  heroBadges: toStringArray(r.hero?.badges),
  heroCtaText: r.hero?.ctaText,
  pickup: toCommaList(toStringArray(r.quickInfo?.pickup)),
  drop: toCommaList(toStringArray(r.quickInfo?.drop)),
  meals: toCommaList(toStringArray(r.quickInfo?.meals)),
  stay: r.quickInfo?.stay,
  transport: toCommaList(toStringArray(r.quickInfo?.transport)),
  difficulty: r.quickInfo?.difficulty,
  timing: r.quickInfo?.timing,
  quickDuration: r.quickInfo?.duration,
  ageLimit: r.quickInfo?.ageLimit,
  bestTime: toCommaList(toStringArray(r.quickInfo?.bestTime)),
  groupSize: toCommaList(toStringArray(r.quickInfo?.groupSize)),
  language: toCommaList(toStringArray(r.quickInfo?.language)),
  guide: toCommaList(toStringArray(r.quickInfo?.guide)),
  overviewShort: r.overview?.short,
  overviewLong: r.overview?.long,
  address: r.location?.address,
  mapUrl: r.location?.mapUrl,
  whyChooseUs: toStringArray(r.whyChooseUs),
  highlights: toStringArray(r.highlights),
  inclusions: toStringArray(r.inclusions),
  exclusions: toStringArray(r.exclusions),
  travelBestTime: toCommaList(toStringArray(r.travelInfo?.bestTime)),
  temperature: r.travelInfo?.temperature,
  clothing: toCommaList(toStringArray(r.travelInfo?.clothing)),
  cancellation: normalizeOptionalText(r.policies?.cancellation),
  refund: normalizeOptionalText(r.policies?.refund),
  terms: normalizeOptionalText(r.policies?.terms),
  whatsapp: r.cta?.whatsapp,
  call: r.cta?.call,
  metaTitle: r.seo?.metaTitle,
  metaDescription: r.seo?.metaDescription,
  keywords: toStringArray(r.seo?.keywords),
  status: r.meta?.status || 'ACTIVE',
  itinerary: r.itinerary || [],
  visibilityTagline: toBoolean(r.visibility?.tagline ?? r.visibilityTagline, true),
  visibilityPricing: toBoolean(r.visibility?.pricing ?? r.visibilityPricing, true),
  visibilityStats: toBoolean(r.visibility?.stats ?? r.visibilityStats, true),
  visibilityHero: toBoolean(r.visibility?.hero ?? r.visibilityHero, true),
  visibilityGallery: toBoolean(r.visibility?.gallery ?? r.visibilityGallery, true),
  visibilityQuickInfo: toBoolean(r.visibility?.quickInfo ?? r.visibilityQuickInfo, true),
  visibilityOverview: toBoolean(r.visibility?.overview ?? r.visibilityOverview, true),
  visibilityWhyChooseUs: toBoolean(r.visibility?.whyChooseUs ?? r.visibilityWhyChooseUs, true),
  visibilityHighlights: toBoolean(r.visibility?.highlights ?? r.visibilityHighlights, true),
  visibilityInclusions: toBoolean(r.visibility?.inclusions ?? r.visibilityInclusions, true),
  visibilityExclusions: toBoolean(r.visibility?.exclusions ?? r.visibilityExclusions, true),
  visibilityItinerary: toBoolean(r.visibility?.itinerary ?? r.visibilityItinerary, true),
  visibilitySuggestions: toBoolean(r.visibility?.suggestions ?? r.visibilitySuggestions, true),
  visibilityHotelDetails: toBoolean(r.visibility?.hotelDetails ?? r.visibilityHotelDetails, true),
  visibilityReviews: toBoolean(r.visibility?.reviews ?? r.visibilityReviews, true),
  visibilityFaq: toBoolean(r.visibility?.faq ?? r.visibilityFaq, true),
})

const PackageForm: React.FC<{
  defaultValues?: Partial<PackageFormData>
  onSubmit: (data: PackageFormData, primaryImage?: File, gallery?: File[]) => void
  saving: boolean
}> = ({ defaultValues, onSubmit, saving }) => {
  const {
    register,
    handleSubmit,
    watch,
    getValues,
    setValue,
    control,
    formState: { errors },
  } = useForm<PackageFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      durationDays: 1,
      nights: 0,
      basePrice: 0,
      discountPercent: 0,
      currency: 'INR',
      status: 'ACTIVE',
      whyChooseUs: [],
      highlights: [],
      inclusions: [],
      exclusions: [],
      tags: [],
      heroBadges: [],
      keywords: [],
      itinerary: [],
      ...defaultValues,
    },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'itinerary' })
  const { fields: whyChooseUsFields, append: appendWhyChooseUs, remove: removeWhyChooseUs } = useFieldArray({ control: control as any, name: 'whyChooseUs' as never })
  const { fields: highlightsFields, append: appendHighlights, remove: removeHighlights } = useFieldArray({ control: control as any, name: 'highlights' as never })
  const { fields: inclusionsFields, append: appendInclusions, remove: removeInclusions } = useFieldArray({ control: control as any, name: 'inclusions' as never })
  const { fields: exclusionsFields, append: appendExclusions, remove: removeExclusions } = useFieldArray({ control: control as any, name: 'exclusions' as never })
  const { fields: tagsFields, append: appendTags, remove: removeTags } = useFieldArray({ control: control as any, name: 'tags' as never })
  const { fields: heroBadgesFields, append: appendHeroBadges, remove: removeHeroBadges } = useFieldArray({ control: control as any, name: 'heroBadges' as never })
  const { fields: keywordsFields, append: appendKeywords, remove: removeKeywords } = useFieldArray({ control: control as any, name: 'keywords' as never })
  const [primaryFile, setPrimaryFile] = useState<File>()
  const [galleryFiles, setGalleryFiles] = useState<File[]>([])
  const primaryRef = useRef<HTMLInputElement>(null)
  const galleryRef = useRef<HTMLInputElement>(null)
  const [categories, setCategories] = useState<any[]>([])
  const [countries, setCountries] = useState<any[]>([])
  const [states, setStates] = useState<any[]>([])
  const [cities, setCities] = useState<any[]>([])
  const [editingLists, setEditingLists] = useState<Record<DynamicListName, number[]>>({
    whyChooseUs: [],
    highlights: [],
    inclusions: [],
    exclusions: [],
    tags: [],
    heroBadges: [],
    keywords: [],
  })

  const countryId = watch('countryId')
  const stateId = watch('stateId')
  const basePrice = watch('basePrice')
  const discountP = watch('discountPercent')
  const finalPrice = Math.max(0, (Number(basePrice) || 0) * (1 - (Number(discountP) || 0) / 100))

  useEffect(() => {
    fetchCategories().then((r) => setCategories(normalizeList(r.data?.data || r.data?.items || r.data || [])))
  }, [])

  useEffect(() => {
    fetchCountries().then((r) => setCountries(normalizeList(r.data?.data || r.data?.items || r.data || [])))
  }, [])

  useEffect(() => {
    if (countryId) {
      fetchStates(countryId).then((r) => setStates(normalizeList(r.data?.data || r.data?.items || r.data || [])))
    }
  }, [countryId])

  useEffect(() => {
    if (stateId) {
      fetchCities(stateId).then((r) => setCities(normalizeList(r.data?.data || r.data?.items || r.data || [])))
    }
  }, [stateId])

  const handleSubmitForm = (data: PackageFormData) => {
    onSubmit(data, primaryFile, galleryFiles.length ? galleryFiles : undefined)
  }

  const isEditingItem = (name: DynamicListName, index: number) => editingLists[name].includes(index)

  const startEditingItem = (name: DynamicListName, index: number) => {
    setEditingLists((prev) => ({
      ...prev,
      [name]: prev[name].includes(index) ? prev[name] : [...prev[name], index],
    }))
  }

  const stopEditingItem = (name: DynamicListName, index: number) => {
    setEditingLists((prev) => ({
      ...prev,
      [name]: prev[name].filter((itemIndex) => itemIndex !== index),
    }))
  }

  const removeEditingItem = (name: DynamicListName, index: number) => {
    setEditingLists((prev) => ({
      ...prev,
      [name]: prev[name]
        .filter((itemIndex) => itemIndex !== index)
        .map((itemIndex) => (itemIndex > index ? itemIndex - 1 : itemIndex)),
    }))
  }

  const Field = ({ name, label, type = 'text', placeholder = '' }: any) => (
    <div>
      <label className="mb-2 block text-sm font-medium text-text-primary">{label}</label>
      <input
        type={type}
        {...register(name)}
        placeholder={placeholder}
        className={`w-full rounded-2xl border border-surface-border bg-surface-card/90 px-4 py-3 text-sm text-text-primary outline-none transition focus:border-brand-400 focus:ring-1 focus:ring-brand-400/30 ${(errors as any)[name] ? 'border-red-400 focus:ring-red-400/30' : ''}`}
      />
      {(errors as any)[name] && <p className="mt-1 text-xs text-danger-500">{(errors as any)[name]?.message}</p>}
    </div>
  )

  const TextArea = ({ name, label, rows = 3, placeholder = '' }: any) => (
    <div>
      <label className="mb-2 block text-sm font-medium text-text-primary">{label}</label>
      <textarea
        {...register(name)}
        rows={rows}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-surface-border bg-surface-card/90 px-4 py-3 text-sm text-text-primary outline-none transition focus:border-brand-400 focus:ring-1 focus:ring-brand-400/30 resize-none"
      />
    </div>
  )

  const DynamicListField = ({
    name,
    label,
    fields,
    append,
    remove,
    placeholder,
  }: {
    name: DynamicListName
    label: string
    fields: Array<{ id: string }>
    append: (value: string) => void
    remove: (index: number) => void
    placeholder: string
  }) => {
    const values = (getValues(name) || []) as string[]

    return (
      <div className="space-y-3">
        <label className="block text-sm font-medium text-text-primary">{label}</label>
        {fields.length > 0 ? (
          fields.map((field, index) => {
            const editing = isEditingItem(name, index)
            const value = values[index] || ''

            return (
              <div key={field.id} className="rounded-2xl border border-surface-border bg-surface-card/70 p-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                  <div className="flex-1">
                    {editing ? (
                      <input
                        {...register(`${name}.${index}`)}
                        placeholder={placeholder}
                        className="w-full rounded-2xl border border-surface-border bg-surface-card/90 px-4 py-3 text-sm text-text-primary outline-none transition focus:border-brand-400 focus:ring-1 focus:ring-brand-400/30"
                      />
                    ) : (
                      <div className="rounded-2xl border border-dashed border-surface-border px-4 py-3 text-sm text-text-primary">
                        {value || 'Empty item'}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-row flex-wrap items-center justify-start gap-2 sm:flex-nowrap">
                    {editing ? (
                      <button
                        type="button"
                        onClick={() => stopEditingItem(name, index)}
                        className="inline-flex min-h-11 items-center justify-center rounded-xl bg-brand-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-400"
                      >
                        Save
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => startEditingItem(name, index)}
                        className="inline-flex min-h-11 items-center justify-center rounded-xl border border-surface-border bg-surface-card px-4 py-3 text-sm font-semibold text-text-primary transition hover:bg-surface-hover"
                      >
                        Edit
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        remove(index)
                        removeEditingItem(name, index)
                      }}
                      className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-danger-500 text-white transition hover:bg-danger-400"
                      aria-label={`Remove ${label} item ${index + 1}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })
        ) : (
          <p className="rounded-2xl border border-dashed border-surface-border px-4 py-3 text-sm text-text-tertiary">
            No items added yet.
          </p>
        )}
        <button
          type="button"
          onClick={() => {
            const nextIndex = values.length
            append('')
            startEditingItem(name, nextIndex)
          }}
          className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-surface-border bg-surface-card px-4 py-3 text-sm font-semibold text-text-primary transition hover:bg-surface-hover"
        >
          <Plus className="h-4 w-4" /> Add
        </button>
      </div>
    )
  }

  const Select = ({ name, label, options, required }: any) => (
    <div>
      <label className="mb-2 block text-sm font-medium text-text-primary">{label}{required && ' *'}</label>
      <select
        {...register(name)}
        className={`w-full rounded-2xl border border-surface-border bg-surface-card/90 px-4 py-3 text-sm text-text-primary outline-none transition focus:border-brand-400 focus:ring-1 focus:ring-brand-400/30 ${(errors as any)[name] ? 'border-red-400 focus:ring-red-400/30' : ''}`}
      >
        <option value="">Select {label}</option>
        {options.map((o: any) => <option key={o._id || o.value} value={o._id || o.value}>{o.name || o.label}</option>)}
      </select>
      {(errors as any)[name] && <p className="mt-1 text-xs text-danger-500">{(errors as any)[name]?.message}</p>}
    </div>
  )

  return (
    <form onSubmit={handleSubmit(handleSubmitForm)} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1 custom-scrollbar sm:pr-2">
      <Section title="Basic Information">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field name="name" label="Package Name *" placeholder="e.g. Shimla Manali Delight" />
          <Field name="slug" label="URL Slug (Optional)" placeholder="e.g. shimla-manali-delight" />
          <Field name="destination" label="Destination *" placeholder="e.g. Shimla, Manali" />
          <Field name="tagline" label="Tagline" placeholder="A short catchy line" />
          <Select name="categoryId" label="Category" required options={categories} />
          <Select name="countryId" label="Country" required options={countries} />
          <Select name="stateId" label="State" options={states} />
          <Select name="cityId" label="City" options={cities} />
          <DynamicListField
            name="tags"
            label="Search Tags"
            fields={tagsFields as Array<{ id: string }>}
            append={appendTags as (value: string) => void}
            remove={removeTags}
            placeholder="hill station"
          />
          <Select name="status" label="Status" options={[{ value: 'ACTIVE', name: 'Active' }, { value: 'INACTIVE', name: 'Inactive' }, { value: 'DRAFT', name: 'Draft' }]} />
        </div>
      </Section>

      <Section title="Duration & Pricing" collapsible>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Field name="durationDays" label="Duration (Days)" type="number" />
          <Field name="nights" label="Nights" type="number" />
          <Field name="currency" label="Currency" placeholder="INR, USD" />
          <div>
            <label className="mb-2 block text-sm font-medium text-text-primary">Base Price</label>
            <input type="number" {...register('basePrice')} className="w-full rounded-2xl border border-surface-border bg-surface-card/90 px-4 py-3 text-sm text-text-primary outline-none transition focus:border-brand-400 focus:ring-1 focus:ring-brand-400/30" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-text-primary">Discount (%)</label>
            <input type="number" {...register('discountPercent')} className="w-full rounded-2xl border border-surface-border bg-surface-card/90 px-4 py-3 text-sm text-text-primary outline-none transition focus:border-brand-400 focus:ring-1 focus:ring-brand-400/30" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-text-primary">Final Price (Auto)</label>
            <div className="rounded-2xl border border-surface-border bg-surface-border/30 px-4 py-3 text-sm font-bold text-emerald-400">
              {watch('currency')} {finalPrice.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
            </div>
          </div>
        </div>
      </Section>

      <Section title="Hero Banner Configuration" collapsible>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field name="heroTitle" label="Hero Title Overlay" placeholder="e.g. The Ultimate Getaway" />
          <Field name="heroSubtitle" label="Hero Subtitle" placeholder="e.g. Unwind in nature" />
          <DynamicListField
            name="heroBadges"
            label="Hero Badges"
            fields={heroBadgesFields as Array<{ id: string }>}
            append={appendHeroBadges as (value: string) => void}
            remove={removeHeroBadges}
            placeholder="Best Seller"
          />
          <Field name="heroCtaText" label="Hero CTA Button" placeholder="Book Now for ₹25,000" />
        </div>
      </Section>

      <Section title="Media Artifacts">
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-text-primary">Primary Catalog Image</label>
            <div onClick={() => primaryRef.current?.click()} className="border-2 border-dashed border-surface-border rounded-xl p-6 text-center cursor-pointer hover:border-brand-500/50 transition-colors">
              {primaryFile ? (
                <img src={URL.createObjectURL(primaryFile)} alt="Primary" className="h-32 object-cover rounded-lg mx-auto" />
              ) : (
                <div className="flex flex-col items-center gap-2 text-text-tertiary">
                  <Upload className="w-6 h-6" />
                  <span className="text-xs">Select Primary Presentation Image</span>
                </div>
              )}
              <input ref={primaryRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && setPrimaryFile(e.target.files[0])} />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-text-primary">Carousel / Gallery Images</label>
            <div onClick={() => galleryRef.current?.click()} className="border-2 border-dashed border-surface-border rounded-xl p-4 cursor-pointer hover:border-brand-500/50 transition-colors">
              {galleryFiles.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {galleryFiles.map((file, index) => (
                    <div key={index} className="relative">
                      <img src={URL.createObjectURL(file)} alt="" className="h-16 w-16 object-cover rounded-lg" />
                      <button type="button" onClick={(e) => { e.stopPropagation(); setGalleryFiles((prev) => prev.filter((_, i) => i !== index)) }} className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                        <X className="w-2.5 h-2.5 text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-text-tertiary">
                  <Upload className="w-5 h-5" />
                  <span className="text-xs">Attach supplementary media for carousel</span>
                </div>
              )}
              <input ref={galleryRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => e.target.files && setGalleryFiles((prev) => [...prev, ...Array.from(e.target.files)])} />
            </div>
          </div>
        </div>
      </Section>

      <Section title="Quick Info Grid (Stats)" collapsible>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 xl:grid-cols-4">
          <Field name="pickup" label="Pickup Location" />
          <Field name="drop" label="Drop Location" />
          <Field name="meals" label="Meals Provided" />
          <Field name="stay" label="Stay Rating" />
          <Field name="transport" label="Transport Mode" />
          <Field name="difficulty" label="Difficulty Level" />
          <Field name="timing" label="Timing" />
          <Field name="quickDuration" label="UI Duration Label" />
          <Field name="ageLimit" label="Age Bounds" />
          <Field name="bestTime" label="Best Months to Go" />
          <Field name="groupSize" label="Group Size limit" />
          <Field name="language" label="Primary Language" />
          <Field name="guide" label="Tour Guide Available" />
        </div>
      </Section>

      <Section title="Description Overviews" collapsible>
        <div className="space-y-4">
          <TextArea name="overviewShort" label="Abstract Summary (Short)" rows={2} />
          <TextArea name="overviewLong" label="Body Synopsis (Long)" rows={4} />
        </div>
      </Section>

      <Section title="Bullet Lists" collapsible>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <DynamicListField
            name="whyChooseUs"
            label="Why Choose Us?"
            fields={whyChooseUsFields as Array<{ id: string }>}
            append={appendWhyChooseUs as (value: string) => void}
            remove={removeWhyChooseUs}
            placeholder="Best prices"
          />
          <DynamicListField
            name="highlights"
            label="Key Highlights"
            fields={highlightsFields as Array<{ id: string }>}
            append={appendHighlights as (value: string) => void}
            remove={removeHighlights}
            placeholder="Bonfire"
          />
          <DynamicListField
            name="inclusions"
            label="Inclusions"
            fields={inclusionsFields as Array<{ id: string }>}
            append={appendInclusions as (value: string) => void}
            remove={removeInclusions}
            placeholder="Breakfast included"
          />
          <DynamicListField
            name="exclusions"
            label="Exclusions"
            fields={exclusionsFields as Array<{ id: string }>}
            append={appendExclusions as (value: string) => void}
            remove={removeExclusions}
            placeholder="Personal expenses"
          />
        </div>
      </Section>

      <Section title="Day-By-Day Itinerary Mapper" collapsible>
        <div className="space-y-3">
          {fields.map((field, index) => (
            <div key={field.id} className="bg-surface border border-surface-border rounded-xl p-3 space-y-3 sm:p-4">
              <div className="flex flex-wrap items-center gap-2">
                <GripVertical className="w-4 h-4 cursor-grab text-text-tertiary" />
                <span className="text-xs font-bold text-brand-400">Chronological Day {index + 1}</span>
                <button type="button" onClick={() => remove(index)} className="ml-auto inline-flex min-h-10 w-full items-center justify-center rounded-xl bg-danger-500 px-4 text-white transition hover:bg-danger-400 sm:h-9 sm:w-9 sm:px-0">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-text-primary">Itinerary Title *</label>
                  <input {...register(`itinerary.${index}.title`)} placeholder="e.g. Arrival at Goa Airport" className="w-full rounded-2xl border border-surface-border bg-surface-card/90 px-4 py-3 text-sm text-text-primary outline-none transition focus:border-brand-400 focus:ring-1 focus:ring-brand-400/30" />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-text-primary">Meals Handled</label>
                  <input {...register(`itinerary.${index}.meals`)} placeholder="e.g. Breakfast, Dinner" className="w-full rounded-2xl border border-surface-border bg-surface-card/90 px-4 py-3 text-sm text-text-primary outline-none transition focus:border-brand-400 focus:ring-1 focus:ring-brand-400/30" />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-text-primary">Stay Details</label>
                  <input {...register(`itinerary.${index}.stay`)} placeholder="Hotel check-in details" className="w-full rounded-2xl border border-surface-border bg-surface-card/90 px-4 py-3 text-sm text-text-primary outline-none transition focus:border-brand-400 focus:ring-1 focus:ring-brand-400/30" />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-text-primary">Action Log / Description</label>
                  <textarea {...register(`itinerary.${index}.description`)} rows={2} className="w-full rounded-2xl border border-surface-border bg-surface-card/90 px-4 py-3 text-sm text-text-primary outline-none transition focus:border-brand-400 focus:ring-1 focus:ring-brand-400/30 resize-none" />
                </div>
              </div>
            </div>
          ))}
          <button type="button" onClick={() => append({ day: fields.length + 1, title: '', meals: '', stay: '', description: '' })} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-surface-border bg-surface-card px-4 py-3 text-sm font-semibold text-text-primary transition hover:bg-surface-hover">
            <Plus className="w-4 h-4" /> Add Next Itinerary Node
          </button>
        </div>
      </Section>

      <Section title="Location & Weather" collapsible>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <TextArea name="address" label="Real-World Address" rows={2} />
          <TextArea name="mapUrl" label="iFrame src / Map URL" rows={2} />
          <Field name="travelBestTime" label="Recommended Time of Year" />
          <Field name="temperature" label="Average Temperature Range" />
          <Field name="clothing" label="Clothing Advised" />
        </div>
      </Section>

      <Section title="Fine Print Policies" collapsible>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <TextArea name="cancellation" label="Cancellation Restrictions" rows={3} />
          <TextArea name="refund" label="Refund Protocol" rows={3} />
          <TextArea name="terms" label="Legal Terms" rows={3} />
        </div>
      </Section>

      <Section title="Action & SEO Directives" collapsible>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field name="whatsapp" label="WhatsApp Phone Dial" placeholder="+91..." />
          <Field name="call" label="Direct Phone Dial" placeholder="+91..." />
          <Field name="metaTitle" label="Override SEO Meta Title" />
          <TextArea name="metaDescription" label="Custom DOM Meta Description" rows={2} />
          <DynamicListField
            name="keywords"
            label="DOM Keywords"
            fields={keywordsFields as Array<{ id: string }>}
            append={appendKeywords as (value: string) => void}
            remove={removeKeywords}
            placeholder="family trip"
          />
        </div>
      </Section>

      <Section title="DOM Node Rendering (Visibility Controls)" collapsible>
        <div className="grid grid-cols-1 gap-3 rounded-xl border border-surface-border bg-surface-card p-3 sm:grid-cols-2 sm:gap-4 sm:p-4 md:grid-cols-3 xl:grid-cols-4">
          {VISIBILITY_KEYS.map(({ key, label }) => (
            <label key={key} className="flex items-center gap-3 rounded-xl border border-surface-border/60 bg-surface-card/70 px-3 py-2 cursor-pointer">
              <Toggle checked={Boolean(watch(key as any))} onChange={(v) => setValue(key as any, v)} />
              <span className="mt-[2px] text-[10px] font-bold uppercase tracking-wider leading-none text-text-secondary">{label}</span>
            </label>
          ))}
        </div>
      </Section>

      <div className="mt-6 flex flex-col gap-3 border-t border-surface-border pb-12 pt-6 md:flex-row md:justify-end">
        <button type="submit" disabled={saving} className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-brand-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-400 disabled:cursor-not-allowed disabled:opacity-60 md:w-auto">
          {saving ? 'Saving…' : 'Save Package Build'}
        </button>
      </div>
    </form>
  )
}

export type { PackageFormData }
export default PackageForm
