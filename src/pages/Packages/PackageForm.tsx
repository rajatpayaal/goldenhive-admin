import React, { useEffect, useRef, useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Trash2, Upload, X, ChevronDown, ChevronUp, GripVertical, Check, Image as ImageIcon } from 'lucide-react'
import { fetchCategories, fetchCountries, fetchStates, fetchCities } from './service'
import { listFaqs } from '../../services/adminPanel.service'
import { Toggle } from '../../components/ui'

const itineraryDaySchema = z.object({
  day: z.coerce.number().min(1),
  title: z.string().min(1, 'Title required'),
  meals: z.string().optional(),
  stay: z.string().optional(),
  description: z.string().optional(),
})

const schema = z.object({
  // Basic
  name: z.string().min(2, 'Name required'),
  slug: z.string().optional(),
  packageCode: z.string().optional(),
  tagline: z.string().optional(),
  destination: z.string().min(2, 'Destination required'),
  categoryId: z.string().min(1, 'Category required'),
  countryId: z.string().min(1, 'Country required'),
  stateId: z.string().optional(),
  cityId: z.string().optional(),
  durationDays: z.coerce.number().min(1),
  nights: z.coerce.number().min(0),
  difficulty: z.string().optional(),
  groupSize: z.string().optional(),
  sortOrder: z.coerce.number().min(1).optional(),
  tags: z.array(z.string()).optional(),

  // Hero
  heroTitle: z.string().optional(),
  heroSubtitle: z.string().optional(),
  heroBadges: z.array(z.string()).optional(),
  heroCtaText: z.string().optional(),

  // Pricing
  currency: z.string().default('INR'),
  basePrice: z.coerce.number().min(0),
  discountPercent: z.coerce.number().min(0).max(100),
  showBasePrice: z.boolean().default(true),
  showDiscount: z.boolean().default(true),
  showFinalPrice: z.boolean().default(true),
  taxesIncluded: z.boolean().default(true),

  // Details
  overviewShort: z.string().optional(),
  overviewLong: z.string().optional(),
  stay: z.string().optional(),
  pickup: z.string().optional(),
  drop: z.string().optional(),
  meals: z.string().optional(),
  transport: z.string().optional(),
  timing: z.string().optional(),
  ageLimit: z.string().optional(),
  bestTime: z.string().optional(),
  language: z.string().optional(),
  guide: z.string().optional(),
  address: z.string().optional(),
  mapUrl: z.string().optional(),

  // Lists
  whyChooseUs: z.array(z.string()).optional(),
  highlights: z.array(z.string()).optional(),
  inclusions: z.array(z.string()).optional(),
  exclusions: z.array(z.string()).optional(),
  
  // Itinerary
  itinerary: z.array(itineraryDaySchema).optional(),

  // Travel / Policies
  travelBestTime: z.string().optional(),
  temperature: z.string().optional(),
  clothing: z.string().optional(),
  cancellation: z.string().optional(),
  refund: z.string().optional(),
  terms: z.string().optional(),
  
  // CTA & SEO
  whatsapp: z.string().optional(),
  call: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  keywords: z.array(z.string()).optional(),
  faqId: z.array(z.string()).optional(),

  status: z.string().default('ACTIVE'),

  // Visibilities
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

export type PackageFormData = z.infer<typeof schema>

type DynamicListName = 'whyChooseUs' | 'highlights' | 'inclusions' | 'exclusions' | 'tags' | 'heroBadges' | 'keywords'

const normalizeList = (payload: any) => {
  if (!payload) return []
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload.data)) return payload.data
  if (Array.isArray(payload.items)) return payload.items
  return []
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
  if (lowered === '[]' || lowered === 'not specified.' || lowered === 'not specified') return ''
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
  if (Array.isArray(parsed)) return parsed.flatMap(flattenToStringArray)
  if (typeof parsed === 'string') return parsed.trim() ? [parsed.trim()] : []
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

export const buildPackageFormData = (data: PackageFormData, primaryImage?: File, gallery?: File[], existingGallery?: any[]) => {
  const fd = new FormData()
  const keys = Object.keys(data) as Array<keyof PackageFormData>
  const JSON_ARRAY_KEYS = new Set(['whyChooseUs', 'highlights', 'inclusions', 'exclusions', 'tags', 'heroBadges', 'keywords', 'faqId'])
  const ALWAYS_APPEND_STRING_KEYS = new Set([
    'pickup', 'drop', 'meals', 'transport', 'bestTime', 'groupSize', 'language', 'guide',
    'travelBestTime', 'clothing', 'cancellation', 'refund', 'terms'
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
    // Skip visibility toggles since we group them
    if (k.startsWith('visibility')) return

    if (JSON_ARRAY_KEYS.has(k as string)) {
      const raw = Array.isArray(value) ? value : toStringArray(value)
      const normalized = raw.map((item) => String(item).trim()).filter(Boolean)
      const unique = Array.from(new Set(normalized))
      fd.append(k as string, JSON.stringify(unique))
    } else if (k === 'itinerary') {
      fd.append('itinerary', JSON.stringify(value || []))
    } else if (k === 'showBasePrice' || k === 'showDiscount' || k === 'showFinalPrice' || k === 'taxesIncluded') {
      // Handled in pricing below
    } else if (typeof value === 'boolean') {
      fd.append(k as string, value ? 'true' : 'false')
    } else if (ALWAYS_APPEND_STRING_KEYS.has(k as string)) {
      fd.append(k as string, normalizeOptionalText(value))
    } else if (value !== undefined && value !== '') {
      fd.append(k as string, String(value))
    }
  })

  fd.append('visibility', JSON.stringify(visibility))

  const finalPrice = Math.max(0, (Number(data.basePrice) || 0) * (1 - (Number(data.discountPercent) || 0) / 100))
  
  // Appending flat pricing fields for backward compatibility or simple parsing
  fd.append('pricingBasePrice', String(data.basePrice))
  fd.append('pricingDiscountPercent', String(data.discountPercent))
  fd.append('pricingFinalPrice', String(finalPrice))
  
  // Appending strict schema JSON
  const pricingJson = {
    basePrice: data.basePrice,
    discountPercent: data.discountPercent,
    finalPrice: finalPrice,
    currency: data.currency,
    taxesIncluded: data.taxesIncluded,
    show: {
      basePrice: data.showBasePrice,
      discount: data.showDiscount,
      finalPrice: data.showFinalPrice
    }
  }
  fd.append('pricing', JSON.stringify(pricingJson))

  if (primaryImage) fd.append('primaryImage', primaryImage)
  if (gallery) gallery.forEach((file) => fd.append('gallery', file))
  
  if (existingGallery) {
    fd.append('retainedGallery', JSON.stringify(existingGallery))
  }

  return fd
}

export const mapPackageToForm = (r: any): Partial<PackageFormData> & { primaryImage?: string; gallery?: any[] } => ({
  name: r.basic?.name,
  slug: r.basic?.slug,
  packageCode: r.packageCode,
  categoryId: String(r.categoryId?._id || r.categoryId || ''),
  countryId: String(r.countryId?._id || r.countryId || ''),
  stateId: String(r.stateId?._id || r.stateId || ''),
  cityId: String(r.cityId?._id || r.cityId || ''),
  tagline: r.basic?.tagline,
  destination: r.basic?.destination,
  durationDays: r.basic?.durationDays,
  nights: r.basic?.nights,
  basePrice: r.pricing?.basePrice ?? r.basic?.basePrice ?? 0,
  discountPercent: r.pricing?.discountPercent ?? r.basic?.discount ?? 0,
  currency: r.pricing?.currency ?? r.basic?.currency ?? 'INR',
  showBasePrice: r.pricing?.show?.basePrice ?? true,
  showDiscount: r.pricing?.show?.discount ?? true,
  showFinalPrice: r.pricing?.show?.finalPrice ?? true,
  taxesIncluded: r.pricing?.taxesIncluded ?? true,
  tags: toStringArray(r.basic?.tags),
  
  faqId: Array.isArray(r.faqId) ? r.faqId.map((f: any) => String(f._id || f)) : [],
  primaryImage: r.images?.primary?.url || r.primaryImage?.url || r.primaryImage,
  gallery: r.images?.gallery || r.gallery || [],
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
  sortOrder: r.sortOrder,
  
  // Visibility mapped explicitly
  visibilityTagline: toBoolean(r.visibility?.tagline ?? true),
  visibilityPricing: toBoolean(r.visibility?.pricing ?? true),
  visibilityStats: toBoolean(r.visibility?.stats ?? true),
  visibilityHero: toBoolean(r.visibility?.hero ?? true),
  visibilityGallery: toBoolean(r.visibility?.gallery ?? true),
  visibilityQuickInfo: toBoolean(r.visibility?.quickInfo ?? true),
  visibilityOverview: toBoolean(r.visibility?.overview ?? true),
  visibilityWhyChooseUs: toBoolean(r.visibility?.whyChooseUs ?? true),
  visibilityHighlights: toBoolean(r.visibility?.highlights ?? true),
  visibilityInclusions: toBoolean(r.visibility?.inclusions ?? true),
  visibilityExclusions: toBoolean(r.visibility?.exclusions ?? true),
  visibilityItinerary: toBoolean(r.visibility?.itinerary ?? true),
  visibilitySuggestions: toBoolean(r.visibility?.suggestions ?? true),
  visibilityHotelDetails: toBoolean(r.visibility?.hotelDetails ?? true),
  visibilityReviews: toBoolean(r.visibility?.reviews ?? true),
  visibilityFaq: toBoolean(r.visibility?.faq ?? true),
})

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="space-y-4 rounded-2xl border border-surface-border bg-surface-card p-5 shadow-sm">
    <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
      <span className="p-1.5 rounded-lg bg-surface-hover"><Check className="w-4 h-4 text-brand-500" /></span>
      {title}
    </h3>
    {children}
  </div>
)

const VISIBILITY_KEYS = [
  { key: 'visibilityHero', label: 'Hero Section' },
  { key: 'visibilityTagline', label: 'Tagline' },
  { key: 'visibilityOverview', label: 'Overview' },
  { key: 'visibilityInclusions', label: 'Inclusions' },
  { key: 'visibilityExclusions', label: 'Exclusions' },
  { key: 'visibilityItinerary', label: 'Itinerary' },
  { key: 'visibilityHighlights', label: 'Highlights' },
  { key: 'visibilityGallery', label: 'Gallery' },
  { key: 'visibilityPricing', label: 'Pricing' },
  { key: 'visibilityQuickInfo', label: 'Quick Info' },
  { key: 'visibilityHotelDetails', label: 'Hotel Details' },
  { key: 'visibilityReviews', label: 'Reviews' },
  { key: 'visibilityFaq', label: 'FAQ' },
  { key: 'visibilitySuggestions', label: 'Suggestions' },
  { key: 'visibilityStats', label: 'Stats' },
  { key: 'visibilityWhyChooseUs', label: 'Why Choose Us' },
] as const

const PackageForm: React.FC<{
  defaultValues?: Partial<PackageFormData> & { primaryImage?: string; gallery?: any[] }
  onSubmit: (data: PackageFormData, primaryImage?: File, gallery?: File[], existingGallery?: any[]) => void
  saving: boolean
}> = ({ defaultValues, onSubmit, saving }) => {
  const {
    register,
    handleSubmit,
    watch,
    getValues,
    control,
    setValue,
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
      ...defaultValues,
    },
  })

  const [activeTab, setActiveTab] = useState<'overview' | 'inclusions' | 'exclusions' | 'itinerary' | 'highlights' | 'stay'>('overview')
  
  const { fields: itineraryFields, append: appendItinerary, remove: removeItinerary } = useFieldArray({ control, name: 'itinerary' })
  const { fields: whyChooseUsFields, append: appendWhyChooseUs, remove: removeWhyChooseUs } = useFieldArray({ control: control as any, name: 'whyChooseUs' as never })
  const { fields: highlightsFields, append: appendHighlights, remove: removeHighlights } = useFieldArray({ control: control as any, name: 'highlights' as never })
  const { fields: inclusionsFields, append: appendInclusions, remove: removeInclusions } = useFieldArray({ control: control as any, name: 'inclusions' as never })
  const { fields: exclusionsFields, append: appendExclusions, remove: removeExclusions } = useFieldArray({ control: control as any, name: 'exclusions' as never })
  const { fields: tagsFields, append: appendTags, remove: removeTags } = useFieldArray({ control: control as any, name: 'tags' as never })
  const { fields: heroBadgesFields, append: appendHeroBadges, remove: removeHeroBadges } = useFieldArray({ control: control as any, name: 'heroBadges' as never })

  const [primaryFile, setPrimaryFile] = useState<File>()
  const [galleryFiles, setGalleryFiles] = useState<File[]>([])
  const primaryRef = useRef<HTMLInputElement>(null)
  const galleryRef = useRef<HTMLInputElement>(null)
  
  const [categories, setCategories] = useState<any[]>([])
  const [countries, setCountries] = useState<any[]>([])
  const [states, setStates] = useState<any[]>([])
  const [cities, setCities] = useState<any[]>([])
  const [faqs, setFaqs] = useState<any[]>([])
  const [editingLists, setEditingLists] = useState<Record<DynamicListName, number[]>>({ whyChooseUs: [], highlights: [], inclusions: [], exclusions: [], tags: [], heroBadges: [], keywords: [] })
  
  const [existingGallery, setExistingGallery] = useState<any[]>([])

  useEffect(() => {
    if (defaultValues?.gallery) {
      setExistingGallery(defaultValues.gallery)
    }
  }, [defaultValues])

  const countryId = watch('countryId')
  const stateId = watch('stateId')
  const basePrice = watch('basePrice')
  const discountP = watch('discountPercent')
  const finalPrice = Math.max(0, (Number(basePrice) || 0) * (1 - (Number(discountP) || 0) / 100))

  useEffect(() => {
    fetchCategories().then((r) => setCategories(normalizeList(r.data?.data || r.data || [])))
    fetchCountries().then((r) => setCountries(normalizeList(r.data?.data || r.data || [])))
    listFaqs({ limit: 100 }).then(r => setFaqs(normalizeList(r.data?.data || r.data || []))).catch(console.error)
  }, [])

  useEffect(() => {
    if (countryId) fetchStates(countryId).then((r) => setStates(normalizeList(r.data?.data || r.data || [])))
  }, [countryId])

  useEffect(() => {
    if (stateId) fetchCities(stateId).then((r) => setCities(normalizeList(r.data?.data || r.data || [])))
  }, [stateId])

  const handleSubmitForm = (data: PackageFormData) => {
    onSubmit(data, primaryFile, galleryFiles.length ? galleryFiles : undefined, existingGallery)
  }

  const isEditingItem = (name: DynamicListName, index: number) => editingLists[name].includes(index)
  const startEditingItem = (name: DynamicListName, index: number) => setEditingLists((prev) => ({ ...prev, [name]: prev[name].includes(index) ? prev[name] : [...prev[name], index] }))
  const stopEditingItem = (name: DynamicListName, index: number) => setEditingLists((prev) => ({ ...prev, [name]: prev[name].filter((itemIndex) => itemIndex !== index) }))
  const removeEditingItem = (name: DynamicListName, index: number) => setEditingLists((prev) => ({ ...prev, [name]: prev[name].filter((itemIndex) => itemIndex !== index).map((itemIndex) => (itemIndex > index ? itemIndex - 1 : itemIndex)) }))

  const Field = ({ name, label, type = 'text', placeholder = '', required = false }: any) => (
    <div>
      <label className="mb-2 block text-xs font-medium text-text-primary">{label}{required && ' *'}</label>
      <input type={type} {...register(name)} placeholder={placeholder} className={`input ${errors[name as keyof PackageFormData] ? 'border-danger-400' : ''}`} />
      {errors[name as keyof PackageFormData] && <p className="mt-1 text-[10px] text-danger-500">{(errors[name as keyof PackageFormData] as any)?.message}</p>}
    </div>
  )

  const Select = ({ name, label, options, required = false }: any) => (
    <div>
      <label className="mb-2 block text-xs font-medium text-text-primary">{label}{required && ' *'}</label>
      <select {...register(name)} className={`input ${errors[name as keyof PackageFormData] ? 'border-danger-400' : ''}`}>
        <option value="">Select</option>
        {options.map((o: any) => <option key={o._id || o.value} value={o._id || o.value}>{o.name || o.label}</option>)}
      </select>
      {errors[name as keyof PackageFormData] && <p className="mt-1 text-[10px] text-danger-500">{(errors[name as keyof PackageFormData] as any)?.message}</p>}
    </div>
  )

  const DynamicListField = ({ name, fields, append, remove, placeholder }: any) => {
    const values = (getValues(name) || []) as string[]
    return (
      <div className="space-y-3">
        {fields.length > 0 ? (
          fields.map((field: any, index: number) => {
            const editing = isEditingItem(name, index)
            const value = values[index] || ''
            return (
              <div key={field.id} className="flex flex-col gap-2 sm:flex-row sm:items-center">
                {editing ? (
                  <input {...register(`${name}.${index}` as any)} placeholder={placeholder} className="input flex-1" />
                ) : (
                  <div className="input flex-1 bg-surface-hover/50 text-text-secondary">{value || 'Empty'}</div>
                )}
                <div className="flex gap-2">
                  <button type="button" onClick={() => editing ? stopEditingItem(name, index) : startEditingItem(name, index)} className="btn-secondary py-2 px-3 text-xs">
                    {editing ? 'Save' : 'Edit'}
                  </button>
                  <button type="button" onClick={() => { remove(index); removeEditingItem(name, index) }} className="btn-secondary py-2 px-3 text-danger-500 hover:text-white hover:bg-danger-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )
          })
        ) : (
          <p className="text-xs text-text-tertiary p-3 border border-dashed border-surface-border rounded-xl">No items added.</p>
        )}
        <button type="button" onClick={() => { const next = values.length; append(''); startEditingItem(name, next) }} className="btn-secondary py-1.5 text-xs">
          <Plus className="w-3 h-3 mr-1" /> Add Item
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(handleSubmitForm)} className="grid grid-cols-1 gap-6 lg:grid-cols-12 max-h-[80vh] overflow-y-auto pr-2 custom-scrollbar">
      
      {/* LEFT COLUMN */}
      <div className="space-y-6 lg:col-span-7">
        <Section title="1. Basic Information">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="sm:col-span-2"><Field name="name" label="Package Name" required /></div>
            <div><Field name="slug" label="Package Slug" required /></div>
            
            <div className="sm:col-span-3"><Field name="tagline" label="Tagline" /></div>
            
            <div><Select name="categoryId" label="Category" required options={categories} /></div>
            <div className="sm:col-span-2"><Field name="destination" label="Destination" required placeholder="e.g. Kedarnath, Uttarakhand" /></div>
            
            <div><Select name="countryId" label="Country" required options={countries} /></div>
            <div><Select name="stateId" label="State" required options={states} /></div>
            <div><Select name="cityId" label="City" required options={cities} /></div>
            
            <div><Field name="durationDays" label="Duration (Days)" type="number" required /></div>
            <div><Field name="nights" label="Nights" type="number" required /></div>
            <div><Select name="difficulty" label="Difficulty" options={[{value:'Easy', name:'Easy'}, {value:'Moderate', name:'Moderate'}, {value:'Hard', name:'Hard'}]} /></div>
            
            <div className="sm:col-span-3"><Field name="groupSize" label="Group Size" placeholder="e.g. 2-12 People" /></div>
          </div>
        </Section>

        <Section title="2. Hero Section">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-xs font-medium text-text-primary">Hero Image *</label>
              <div onClick={() => primaryRef.current?.click()} className="h-40 rounded-xl border border-dashed border-surface-border bg-surface-hover/50 flex flex-col items-center justify-center cursor-pointer overflow-hidden group">
                {primaryFile ? (
                  <img src={URL.createObjectURL(primaryFile)} className="w-full h-full object-cover" alt="" />
                ) : (defaultValues as any)?.primaryImage ? (
                  <img src={(defaultValues as any).primaryImage} className="w-full h-full object-cover" alt="" />
                ) : (
                  <>
                    <Upload className="w-6 h-6 text-text-tertiary mb-2 group-hover:text-brand-500 transition-colors" />
                    <span className="text-xs font-medium text-text-secondary">Upload Hero Image</span>
                  </>
                )}
                <input ref={primaryRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && setPrimaryFile(e.target.files[0])} />
              </div>
            </div>
            <div className="space-y-4">
              <Field name="heroTitle" label="Hero Title *" />
              <Field name="heroSubtitle" label="Hero Subtitle" />
              <div>
                <label className="mb-2 block text-xs font-medium text-text-primary">Hero Badges</label>
                <input className="input" placeholder="comma separated badges" {...register('heroBadges')} onChange={(e) => {
                  // simplistic approach for comma separated parsing
                  const vals = e.target.value.split(',').map(v => v.trim()).filter(Boolean)
                  setValue('heroBadges', vals)
                }} value={(watch('heroBadges') || []).join(', ')} />
              </div>
              <Field name="heroCtaText" label="Hero CTA Text" />
            </div>
          </div>
        </Section>

        <Section title="3. Pricing & Availability">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div><Field name="currency" label="Currency *" /></div>
            <div><Field name="basePrice" label="Base Price *" type="number" /></div>
            <div><Field name="discountPercent" label="Discount (%)" type="number" /></div>
            <div>
              <label className="mb-2 block text-xs font-medium text-text-primary">Final Price *</label>
              <div className="input bg-surface-hover/30 border-dashed">{finalPrice.toLocaleString('en-IN')}</div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-6 mt-4 pt-4 border-t border-surface-border">
            <label className="flex items-center gap-2 cursor-pointer">
              <Toggle checked={watch('showBasePrice')} onChange={v => setValue('showBasePrice', v)} />
              <span className="text-xs font-medium">Show Base Price</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <Toggle checked={watch('showDiscount')} onChange={v => setValue('showDiscount', v)} />
              <span className="text-xs font-medium">Show Discount</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <Toggle checked={watch('showFinalPrice')} onChange={v => setValue('showFinalPrice', v)} />
              <span className="text-xs font-medium">Show Final Price</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer ml-auto">
              <span className="text-xs font-medium">Taxes Included</span>
              <Toggle checked={watch('taxesIncluded')} onChange={v => setValue('taxesIncluded', v)} />
            </label>
          </div>
        </Section>
      </div>

      {/* RIGHT COLUMN */}
      <div className="space-y-6 lg:col-span-5">
        
        <div className="rounded-2xl border border-surface-border bg-surface-card shadow-sm overflow-hidden">
          <div className="p-4 border-b border-surface-border flex items-center gap-2">
            <h3 className="text-sm font-semibold text-text-primary">4. Package Details</h3>
          </div>
          
          <div className="flex overflow-x-auto no-scrollbar border-b border-surface-border text-xs font-medium">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'inclusions', label: 'Inclusions' },
              { id: 'exclusions', label: 'Exclusions' },
              { id: 'itinerary', label: 'Itinerary' },
              { id: 'highlights', label: 'Highlights' },
              { id: 'stay', label: 'Stay' }
            ].map(tab => (
              <button 
                key={tab.id} type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-3 whitespace-nowrap transition-colors ${activeTab === tab.id ? 'border-b-2 border-brand-500 text-brand-500' : 'text-text-secondary hover:bg-surface-hover'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-5">
            {activeTab === 'overview' && (
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-xs font-medium text-text-primary">Overview (Short) *</label>
                  <textarea {...register('overviewShort')} rows={3} className="input resize-none" placeholder="A brief 2-3 line summary" />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-medium text-text-primary">Overview (Long) *</label>
                  <textarea {...register('overviewLong')} rows={8} className="input resize-none" placeholder="Full detailed overview of the package" />
                </div>
              </div>
            )}
            {activeTab === 'inclusions' && (
              <DynamicListField name="inclusions" fields={inclusionsFields} append={appendInclusions} remove={removeInclusions} placeholder="e.g. Breakfast included" />
            )}
            {activeTab === 'exclusions' && (
              <DynamicListField name="exclusions" fields={exclusionsFields} append={appendExclusions} remove={removeExclusions} placeholder="e.g. Personal expenses" />
            )}
            {activeTab === 'highlights' && (
              <DynamicListField name="highlights" fields={highlightsFields} append={appendHighlights} remove={removeHighlights} placeholder="e.g. Scenic mountain views" />
            )}
            {activeTab === 'stay' && (
              <div className="space-y-4">
                <Field name="stay" label="Stay/Accommodation Description" placeholder="e.g. 3 Star Hotels" />
                <Field name="meals" label="Meals Provided" placeholder="e.g. Breakfast & Dinner" />
              </div>
            )}
            {activeTab === 'itinerary' && (
              <div className="space-y-4">
                {itineraryFields.map((field, index) => (
                  <div key={field.id} className="border border-surface-border rounded-xl p-3 bg-surface-hover/30">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-brand-500">Day {index + 1}</span>
                      <button type="button" onClick={() => removeItinerary(index)} className="text-danger-500 hover:text-danger-600"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                    <div className="space-y-3">
                      <input {...register(`itinerary.${index}.title`)} placeholder="Day Title" className="input text-xs py-1.5" />
                      <input {...register(`itinerary.${index}.stay`)} placeholder="Hotel/Stay" className="input text-xs py-1.5" />
                      <input {...register(`itinerary.${index}.meals`)} placeholder="Meals" className="input text-xs py-1.5" />
                      <textarea {...register(`itinerary.${index}.description`)} rows={2} placeholder="Description" className="input text-xs py-1.5 resize-none" />
                    </div>
                  </div>
                ))}
                <button type="button" onClick={() => appendItinerary({ day: itineraryFields.length + 1, title: '' })} className="btn-secondary w-full py-2 text-xs">
                  <Plus className="w-3 h-3 mr-1" /> Add Day
                </button>
              </div>
            )}
          </div>

          <div className="border-t border-surface-border bg-surface-hover/20 p-4 space-y-3">
            {[
              { label: 'Best Time to Travel', field: 'bestTime' },
              { label: 'Transport', field: 'transport' },
              { label: 'Temperature', field: 'temperature' },
              { label: 'Clothing', field: 'clothing' },
              { label: 'Terms & Conditions', field: 'terms' },
              { label: 'Cancellation Policy', field: 'cancellation' },
              { label: 'Refund Policy', field: 'refund' },
            ].map(item => (
              <div key={item.field} className="flex flex-col gap-2 p-3 bg-surface-card rounded-xl border border-surface-border">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-text-secondary">{item.label}</span>
                </div>
                <input {...register(item.field as keyof PackageFormData)} placeholder={`Enter ${item.label}`} className="input text-xs py-1.5 border-dashed" />
              </div>
            ))}
          </div>
        </div>

        <Section title="5. Media">
          <div className="space-y-2">
            <label className="text-xs font-medium text-text-primary">Gallery Images *</label>
            <p className="text-[10px] text-text-tertiary mb-3">You can upload multiple images</p>
            <div className="flex flex-wrap gap-3">
              {existingGallery.map((img: any, i: number) => (
                <div key={`exist-${i}`} className="relative h-16 w-16 rounded-xl overflow-hidden border border-surface-border">
                  <img src={img.url || img} className="w-full h-full object-cover" alt="" />
                  <button type="button" onClick={() => setExistingGallery(p => p.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 bg-black/60 rounded p-0.5 text-white"><X className="w-3 h-3" /></button>
                </div>
              ))}
              {galleryFiles.map((f, i) => (
                <div key={i} className="relative h-16 w-16 rounded-xl overflow-hidden border border-surface-border">
                  <img src={URL.createObjectURL(f)} className="w-full h-full object-cover" alt="" />
                  <button type="button" onClick={() => setGalleryFiles(p => p.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 bg-black/60 rounded p-0.5 text-white"><X className="w-3 h-3" /></button>
                </div>
              ))}
              <div onClick={() => galleryRef.current?.click()} className="h-16 w-16 flex items-center justify-center rounded-xl border border-dashed border-surface-border hover:border-brand-500 cursor-pointer bg-surface-hover/50 text-text-tertiary">
                <Plus className="w-5 h-5" />
              </div>
              <input ref={galleryRef} type="file" multiple accept="image/*" className="hidden" onChange={e => { if(e.target.files) setGalleryFiles(p => [...p, ...Array.from(e.target.files!)]) }} />
            </div>
          </div>
        </Section>

        <Section title="6. Visibility Settings">
          <div className="grid grid-cols-2 gap-y-4 gap-x-2">
            {VISIBILITY_KEYS.map(v => (
              <div key={v.key} className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-text-secondary truncate pr-2">{v.label}</span>
                <Toggle checked={watch(v.key as keyof PackageFormData) as boolean} onChange={val => setValue(v.key as keyof PackageFormData, val)} />
              </div>
            ))}
          </div>
        </Section>

        <Section title="7. SEO Settings & FAQs">
          <div className="space-y-4">
            <Field name="metaTitle" label="Meta Title" />
            <div className="space-y-1">
              <label className="text-xs font-medium text-text-primary">Meta Description</label>
              <textarea {...register('metaDescription')} rows={3} className="input resize-none" />
            </div>
            <div>
              <label className="text-xs font-medium text-text-primary mb-1 block">Keywords</label>
              <input className="input" placeholder="comma separated" {...register('keywords')} onChange={(e) => {
                  const vals = e.target.value.split(',').map(v => v.trim()).filter(Boolean)
                  setValue('keywords', vals)
                }} value={(watch('keywords') || []).join(', ')} />
            </div>
            <div>
              <label className="text-xs font-medium text-text-primary mb-1 block">Linked FAQs</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 border border-surface-border rounded-xl bg-surface-hover/30">
                {faqs.map(faq => {
                  const selected = watch('faqId') || []
                  const isChecked = selected.includes(faq._id)
                  return (
                    <label key={faq._id} className="flex items-start gap-2 cursor-pointer p-2 rounded-lg hover:bg-surface-card border border-transparent hover:border-surface-border">
                      <input 
                        type="checkbox" 
                        className="mt-1 accent-brand-500"
                        checked={isChecked}
                        onChange={(e) => {
                          if (e.target.checked) setValue('faqId', [...selected, faq._id])
                          else setValue('faqId', selected.filter(id => id !== faq._id))
                        }}
                      />
                      <span className="text-[11px] font-medium leading-tight">{faq.question}</span>
                    </label>
                  )
                })}
              </div>
            </div>
          </div>
        </Section>

        <Section title="8. Contact & Location">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Field name="whatsapp" label="WhatsApp Number" placeholder="e.g. +91 9876543210" />
            </div>
            <div>
              <Field name="call" label="Phone Number" placeholder="e.g. +91 9876543210" />
            </div>
            <div className="sm:col-span-2">
              <Field name="address" label="Address / Meeting Point" placeholder="e.g. Triveni Ghat, Rishikesh" />
            </div>
            <div className="sm:col-span-2">
              <Field name="mapUrl" label="Google Maps URL" placeholder="e.g. https://maps.app.goo.gl/..." />
            </div>
          </div>
        </Section>

      </div>

      {/* ACTION BUTTONS */}
      <div className="lg:col-span-12 flex justify-end gap-4 pt-6 pb-12 mt-4 border-t border-surface-border">
        <button type="button" onClick={() => window.history.back()} className="btn-secondary px-6 py-2.5 rounded-xl border border-surface-border hover:bg-surface-hover font-semibold text-sm transition-all">
          Cancel
        </button>
        <button type="submit" disabled={saving} className="btn-primary px-8 py-2.5 rounded-xl bg-brand-500 text-white font-semibold text-sm hover:bg-brand-600 shadow-lg shadow-brand-500/25 transition-all disabled:opacity-50">
          {saving ? 'Saving...' : 'Save Package'}
        </button>
      </div>

    </form>
  )
}

export default PackageForm
