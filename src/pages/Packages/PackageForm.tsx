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
  tags: z.string().optional(),
  heroTitle: z.string().optional(),
  heroSubtitle: z.string().optional(),
  heroBadges: z.string().optional(),
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
  whyChooseUs: z.string().optional(),
  highlights: z.string().optional(),
  inclusions: z.string().optional(),
  exclusions: z.string().optional(),
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
  keywords: z.string().optional(),
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
    <div className="space-y-4 rounded-3xl border border-surface-border bg-surface-card/80 p-5 shadow-sm">
      <div className={`flex items-center justify-between ${collapsible ? 'cursor-pointer' : ''}`} onClick={() => collapsible && setOpen(!open)}>
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

export const buildPackageFormData = (data: PackageFormData, primaryImage?: File, gallery?: File[]) => {
  const fd = new FormData()
  const keys = Object.keys(data) as Array<keyof PackageFormData>

  keys.forEach((k) => {
    const value = data[k]
    if (['tags', 'heroBadges', 'whyChooseUs', 'highlights', 'inclusions', 'exclusions', 'keywords'].includes(k as string)) {
      const arr = String(value || '').split(',').map((item) => item.trim()).filter(Boolean)
      fd.append(k as string, JSON.stringify(arr))
    } else if (k === 'itinerary') {
      fd.append('itinerary', JSON.stringify(value || []))
    } else if (typeof value === 'boolean') {
      fd.append(k as string, value ? 'true' : 'false')
    } else if (value !== undefined && value !== '') {
      fd.append(k as string, String(value))
    }
  })

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
  tags: toCommaList(r.basic?.tags),
  heroTitle: r.hero?.title,
  heroSubtitle: r.hero?.subtitle,
  heroBadges: toCommaList(r.hero?.badges),
  heroCtaText: r.hero?.ctaText,
  pickup: r.quickInfo?.pickup,
  drop: r.quickInfo?.drop,
  meals: r.quickInfo?.meals,
  stay: r.quickInfo?.stay,
  transport: r.quickInfo?.transport,
  difficulty: r.quickInfo?.difficulty,
  timing: r.quickInfo?.timing,
  quickDuration: r.quickInfo?.duration,
  ageLimit: r.quickInfo?.ageLimit,
  bestTime: r.quickInfo?.bestTime,
  groupSize: r.quickInfo?.groupSize,
  language: r.quickInfo?.language,
  guide: r.quickInfo?.guide,
  overviewShort: r.overview?.short,
  overviewLong: r.overview?.long,
  address: r.location?.address,
  mapUrl: r.location?.mapUrl,
  whyChooseUs: toCommaList(r.whyChooseUs),
  highlights: toCommaList(r.highlights),
  inclusions: toCommaList(r.inclusions),
  exclusions: toCommaList(r.exclusions),
  travelBestTime: r.travelInfo?.bestTime,
  temperature: r.travelInfo?.temperature,
  clothing: r.travelInfo?.clothing,
  cancellation: r.policies?.cancellation,
  refund: r.policies?.refund,
  terms: r.policies?.terms,
  whatsapp: r.cta?.whatsapp,
  call: r.cta?.call,
  metaTitle: r.seo?.metaTitle,
  metaDescription: r.seo?.metaDescription,
  keywords: toCommaList(r.seo?.keywords),
  status: r.meta?.status || 'ACTIVE',
  itinerary: r.itinerary || [],
  visibilityTagline: Boolean(r.visibility?.tagline ?? true),
  visibilityPricing: Boolean(r.visibility?.pricing ?? true),
  visibilityStats: Boolean(r.visibility?.stats ?? true),
  visibilityHero: Boolean(r.visibility?.hero ?? true),
  visibilityGallery: Boolean(r.visibility?.gallery ?? true),
  visibilityQuickInfo: Boolean(r.visibility?.quickInfo ?? true),
  visibilityOverview: Boolean(r.visibility?.overview ?? true),
  visibilityWhyChooseUs: Boolean(r.visibility?.whyChooseUs ?? true),
  visibilityHighlights: Boolean(r.visibility?.highlights ?? true),
  visibilityInclusions: Boolean(r.visibility?.inclusions ?? true),
  visibilityExclusions: Boolean(r.visibility?.exclusions ?? true),
  visibilityItinerary: Boolean(r.visibility?.itinerary ?? true),
  visibilitySuggestions: Boolean(r.visibility?.suggestions ?? true),
  visibilityHotelDetails: Boolean(r.visibility?.hotelDetails ?? true),
  visibilityReviews: Boolean(r.visibility?.reviews ?? true),
  visibilityFaq: Boolean(r.visibility?.faq ?? true),
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
      itinerary: [],
      ...defaultValues,
    },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'itinerary' })
  const [primaryFile, setPrimaryFile] = useState<File>()
  const [galleryFiles, setGalleryFiles] = useState<File[]>([])
  const primaryRef = useRef<HTMLInputElement>(null)
  const galleryRef = useRef<HTMLInputElement>(null)
  const [categories, setCategories] = useState<any[]>([])
  const [countries, setCountries] = useState<any[]>([])
  const [states, setStates] = useState<any[]>([])
  const [cities, setCities] = useState<any[]>([])

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
    <form onSubmit={handleSubmit(handleSubmitForm)} className="space-y-4 max-h-[75vh] overflow-y-auto pr-2 custom-scrollbar">
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
          <Field name="tags" label="Search Tags (Comma config)" placeholder="hill station, couples" />
          <Select name="status" label="Status" options={[{ value: 'ACTIVE', name: 'Active' }, { value: 'INACTIVE', name: 'Inactive' }, { value: 'DRAFT', name: 'Draft' }]} />
        </div>
      </Section>

      <Section title="Duration & Pricing" collapsible>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field name="heroTitle" label="Hero Title Overlay" placeholder="e.g. The Ultimate Getaway" />
          <Field name="heroSubtitle" label="Hero Subtitle" placeholder="e.g. Unwind in nature" />
          <Field name="heroBadges" label="Hero Badges (Comma Config)" placeholder="Best Seller, 20% Off" />
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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
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

      <Section title="Bullet Lists (Comma Configured)" collapsible>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextArea name="whyChooseUs" label="Why Choose Us?" placeholder="Best prices, Trusted network, Local guides" rows={2} />
          <TextArea name="highlights" label="Key Highlights" placeholder="Bonfire, Scuba Diving, Jet Skiing" rows={2} />
          <TextArea name="inclusions" label="Inclusions" rows={3} />
          <TextArea name="exclusions" label="Exclusions" rows={3} />
        </div>
      </Section>

      <Section title="Day-By-Day Itinerary Mapper" collapsible>
        <div className="space-y-3">
          {fields.map((field, index) => (
            <div key={field.id} className="bg-surface border border-surface-border rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2">
                <GripVertical className="w-4 h-4 cursor-grab text-text-tertiary" />
                <span className="text-xs font-bold text-brand-400">Chronological Day {index + 1}</span>
                <button type="button" onClick={() => remove(index)} className="ml-auto inline-flex h-9 w-9 items-center justify-center rounded-xl bg-danger-500 text-white transition hover:bg-danger-400">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
          <button type="button" onClick={() => append({ day: fields.length + 1, title: '', meals: '', stay: '', description: '' })} className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-surface-border bg-surface-card px-4 py-3 text-sm font-semibold text-text-primary transition hover:bg-surface-hover">
            <Plus className="w-4 h-4" /> Add Next Itinerary Node
          </button>
        </div>
      </Section>

      <Section title="Location & Weather" collapsible>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextArea name="address" label="Real-World Address" rows={2} />
          <TextArea name="mapUrl" label="iFrame src / Map URL" rows={2} />
          <Field name="travelBestTime" label="Recommended Time of Year" />
          <Field name="temperature" label="Average Temperature Range" />
          <Field name="clothing" label="Clothing Advised" />
        </div>
      </Section>

      <Section title="Fine Print Policies" collapsible>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextArea name="cancellation" label="Cancellation Restrictions" rows={3} />
          <TextArea name="refund" label="Refund Protocol" rows={3} />
          <TextArea name="terms" label="Legal Terms" rows={3} />
        </div>
      </Section>

      <Section title="Action & SEO Directives" collapsible>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field name="whatsapp" label="WhatsApp Phone Dial" placeholder="+91..." />
          <Field name="call" label="Direct Phone Dial" placeholder="+91..." />
          <Field name="metaTitle" label="Override SEO Meta Title" />
          <TextArea name="metaDescription" label="Custom DOM Meta Description" rows={2} />
          <Field name="keywords" label="DOM Keywords (Comma config)" />
        </div>
      </Section>

      <Section title="DOM Node Rendering (Visibility Controls)" collapsible>
        <div className="grid grid-cols-1 gap-4 rounded-xl border border-surface-border bg-surface-card p-4 sm:grid-cols-2 md:grid-cols-4">
          {VISIBILITY_KEYS.map(({ key, label }) => (
            <label key={key} className="flex items-center gap-3 cursor-pointer">
              <Toggle checked={Boolean(watch(key as any))} onChange={(v) => setValue(key as any, v)} />
              <span className="mt-[2px] text-[10px] font-bold uppercase tracking-wider leading-none text-text-secondary">{label}</span>
            </label>
          ))}
        </div>
      </Section>

      <div className="mt-6 flex flex-col gap-3 border-t border-surface-border pb-12 pt-6 md:flex-row md:justify-end">
        <button type="submit" disabled={saving} className="inline-flex w-full items-center justify-center rounded-xl bg-brand-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-400 disabled:cursor-not-allowed disabled:opacity-60 md:w-auto">
          {saving ? 'Saving…' : 'Save Package Build'}
        </button>
      </div>
    </form>
  )
}

export type { PackageFormData }
export default PackageForm
