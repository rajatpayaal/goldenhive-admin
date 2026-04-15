import React, { useEffect, useRef, useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Plus, Trash2, Upload, X, Eye, EyeOff, ChevronDown, ChevronUp,
  GripVertical,
} from 'lucide-react'
import {
  fetchPackages, createPackage, updatePackage, deletePackage,
  fetchCategories, fetchCountries, fetchStates, fetchCities,
} from '../services/api.service'
import DataTable from '../components/ui/DataTable'
import Modal from '../components/ui/Modal'
import StatusBadge from '../components/ui/StatusBadge'
import { PageHeader, Spinner, ConfirmDialog, Toggle } from '../components/ui'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

// ─── Validation Schema ─────────────────────────────────────────────
const itineraryDaySchema = z.object({
  day:         z.coerce.number().min(1),
  title:       z.string().min(1, 'Title required'),
  meals:       z.string().optional(),
  stay:        z.string().optional(),
  description: z.string().optional(),
})

const schema = z.object({
  // Basic
  name:            z.string().min(2, 'Name required'),
  slug:            z.string().optional(),
  tagline:         z.string().optional(),
  destination:     z.string().min(2, 'Destination required'),
  categoryId:      z.string().min(1, 'Category required'),
  countryId:       z.string().min(1, 'Country required'),
  stateId:         z.string().optional(),
  cityId:          z.string().optional(),
  
  // Pricing/Duration
  durationDays:    z.coerce.number().min(1),
  nights:          z.coerce.number().min(0),
  basePrice:       z.coerce.number().min(0),
  discountPercent: z.coerce.number().min(0).max(100),
  currency:        z.string().default('INR'),
  
  // Tags
  tags:            z.string().optional(),
  
  // Hero
  heroTitle:       z.string().optional(),
  heroSubtitle:    z.string().optional(),
  heroBadges:      z.string().optional(),
  heroCtaText:     z.string().optional(),

  // Quick Info
  pickup:          z.string().optional(),
  drop:            z.string().optional(),
  meals:           z.string().optional(),
  stay:            z.string().optional(),
  transport:       z.string().optional(),
  difficulty:      z.string().optional(),
  timing:          z.string().optional(),
  quickDuration:   z.string().optional(),
  ageLimit:        z.string().optional(),
  bestTime:        z.string().optional(),
  groupSize:       z.string().optional(),
  language:        z.string().optional(),
  guide:           z.string().optional(),

  // Overviews
  overviewShort:   z.string().optional(),
  overviewLong:    z.string().optional(),
  
  // Location
  address:         z.string().optional(),
  mapUrl:          z.string().optional(),

  // Lists
  whyChooseUs:     z.string().optional(),
  highlights:      z.string().optional(),
  inclusions:      z.string().optional(),
  exclusions:      z.string().optional(),
  
  // Travel Info
  travelBestTime:  z.string().optional(),
  temperature:     z.string().optional(),
  clothing:        z.string().optional(),

  // Policies
  cancellation:    z.string().optional(),
  refund:          z.string().optional(),
  terms:           z.string().optional(),

  // CTA
  whatsapp:        z.string().optional(),
  call:            z.string().optional(),
  
  // SEO
  metaTitle:       z.string().optional(),
  metaDescription: z.string().optional(),
  keywords:        z.string().optional(),

  status:          z.string().default('ACTIVE'),

  itinerary: z.array(itineraryDaySchema).optional(),

  // visibility toggles
  visibilityTagline:    z.boolean().default(true),
  visibilityPricing:    z.boolean().default(true),
  visibilityStats:      z.boolean().default(true),
  visibilityHero:       z.boolean().default(true),
  visibilityGallery:    z.boolean().default(true),
  visibilityQuickInfo:  z.boolean().default(true),
  visibilityOverview:   z.boolean().default(true),
  visibilityWhyChooseUs:z.boolean().default(true),
  visibilityHighlights: z.boolean().default(true),
  visibilityInclusions: z.boolean().default(true),
  visibilityExclusions: z.boolean().default(true),
  visibilityItinerary:  z.boolean().default(true),
  visibilitySuggestions:z.boolean().default(true),
  visibilityHotelDetails:z.boolean().default(true),
  visibilityReviews:    z.boolean().default(true),
  visibilityFaq:        z.boolean().default(true),
})

type FormData = z.infer<typeof schema>

const VISIBILITY_KEYS = [
  { key: 'visibilityTagline',   label: 'Tagline' },
  { key: 'visibilityPricing',   label: 'Pricing Block' },
  { key: 'visibilityStats',     label: 'Package Stats' },
  { key: 'visibilityHero',      label: 'Hero Banner' },
  { key: 'visibilityGallery',   label: 'Image Gallery' },
  { key: 'visibilityQuickInfo', label: 'Quick Info Grid' },
  { key: 'visibilityOverview',  label: 'Overview Text' },
  { key: 'visibilityWhyChooseUs',label: 'Why Choose Us' },
  { key: 'visibilityHighlights',label: 'Highlights' },
  { key: 'visibilityInclusions',label: 'Inclusions/Exclusions' },
  { key: 'visibilityItinerary', label: 'Itinerary' },
  { key: 'visibilitySuggestions',label: 'Related Packages' },
  { key: 'visibilityHotelDetails',label:'Hotel Details' },
  { key: 'visibilityReviews',   label: 'Reviews' },
  { key: 'visibilityFaq',       label: 'FAQs' },
] as const

// ─── Section Wrapper ───────────────────────────────────────────────
const Section: React.FC<{ title: string; children: React.ReactNode; collapsible?: boolean }> = ({
  title, children, collapsible = false,
}) => {
  const [open, setOpen] = useState(!collapsible)
  return (
    <div className="form-section">
      <div
        className={`flex items-center justify-between ${collapsible ? 'cursor-pointer' : ''}`}
        onClick={() => collapsible && setOpen(!open)}
      >
        <h4 className="text-sm font-bold text-slate-200">{title}</h4>
        {collapsible && (open ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />)}
      </div>
      {open && children}
    </div>
  )
}

// ─── Package Form ──────────────────────────────────────────────────
const PackageForm: React.FC<{
  defaultValues?: Partial<FormData>
  onSubmit: (data: FormData, primaryImage?: File, gallery?: File[]) => Promise<void>
  saving: boolean
}> = ({ defaultValues, onSubmit, saving }) => {
  const {
    register, handleSubmit, watch, setValue, control,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { 
      durationDays: 1, nights: 0, basePrice: 0, discountPercent: 0, currency: 'INR', status: 'ACTIVE', itinerary: [], ...defaultValues 
    },
  })

  const { fields, append, remove, move } = useFieldArray({ control, name: 'itinerary' })

  const [primaryFile, setPrimaryFile] = useState<File>()
  const [galleryFiles, setGalleryFiles] = useState<File[]>([])
  const primaryRef = useRef<HTMLInputElement>(null)
  const galleryRef = useRef<HTMLInputElement>(null)

  const [categories, setCategories]   = useState<any[]>([])
  const [countries, setCountries]     = useState<any[]>([])
  const [states, setStates]           = useState<any[]>([])
  const [cities, setCities]           = useState<any[]>([])

  const countryId = watch('countryId')
  const stateId   = watch('stateId')
  const basePrice = watch('basePrice')
  const discountP = watch('discountPercent')
  const finalPrice = Math.max(0, (Number(basePrice) || 0) * (1 - (Number(discountP) || 0) / 100))

  useEffect(() => { fetchCategories().then(r => setCategories(r.data?.data || r.data?.items || [])) }, [])
  useEffect(() => { fetchCountries().then(r => setCountries(r.data?.data || r.data?.items || [])) }, [])
  useEffect(() => {
    if (countryId) fetchStates(countryId).then(r => setStates(r.data?.data || r.data?.items || []))
  }, [countryId])
  useEffect(() => {
    if (stateId) fetchCities(stateId).then(r => setCities(r.data?.data || r.data?.items || []))
  }, [stateId])

  const handleSubmitForm = (data: FormData) => {
    onSubmit(data, primaryFile, galleryFiles.length ? galleryFiles : undefined)
  }

  const F = ({ name, label, type = 'text', placeholder = '' }: any) => (
    <div>
      <label className="label">{label}</label>
      <input
        type={type}
        {...register(name)}
        placeholder={placeholder}
        className={`input ${(errors as any)[name] ? 'input-error' : ''}`}
      />
      {(errors as any)[name] && <p className="text-red-400 text-xs mt-1">{(errors as any)[name]?.message}</p>}
    </div>
  )

  const TA = ({ name, label, rows = 3, placeholder = '' }: any) => (
    <div>
      <label className="label">{label}</label>
      <textarea
        {...register(name)}
        rows={rows}
        placeholder={placeholder}
        className="input resize-none"
      />
    </div>
  )

  const Select = ({ name, label, options, required }: any) => (
    <div>
      <label className="label">{label}{required && ' *'}</label>
      <select {...register(name)} className={`input ${(errors as any)[name] ? 'input-error' : ''}`}>
        <option value="">Select {label}</option>
        {options.map((o: any) => <option key={o._id || o.value} value={o._id || o.value}>{o.name || o.label}</option>)}
      </select>
      {(errors as any)[name] && <p className="text-red-400 text-xs mt-1">{(errors as any)[name]?.message}</p>}
    </div>
  )

  return (
    <form onSubmit={handleSubmit(handleSubmitForm)} className="space-y-4 max-h-[75vh] overflow-y-auto pr-2 custom-scrollbar">
      {/* Basic Info */}
      <Section title="Basic Information">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <F name="name" label="Package Name *" placeholder="e.g. Shimla Manali Delight" />
          <F name="slug" label="URL Slug (Optional)" placeholder="e.g. shimla-manali-delight" />
          <F name="destination" label="Destination *" placeholder="e.g. Shimla, Manali" />
          <F name="tagline" label="Tagline" placeholder="A short catchy line" />
          <Select name="categoryId" label="Category" required options={categories} />
          <Select name="countryId" label="Country" required options={countries} />
          <Select name="stateId" label="State" options={states} />
          <Select name="cityId" label="City" options={cities} />
          <F name="tags" label="Search Tags (Comma config)" placeholder="hill station, couples" />
          <Select name="status" label="Status" options={[
            { value: 'ACTIVE', name: 'Active' },
            { value: 'INACTIVE', name: 'Inactive' },
            { value: 'DRAFT', name: 'Draft' },
          ]} />
        </div>
      </Section>

      {/* Duration & Pricing */}
      <Section title="Duration & Pricing" collapsible>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <F name="durationDays" label="Duration (Days)" type="number" />
          <F name="nights" label="Nights" type="number" />
          <F name="currency" label="Currency" placeholder="INR, USD" />
          <div>
            <label className="label">Base Price</label>
            <input type="number" {...register('basePrice')} className="input" />
          </div>
          <div>
            <label className="label">Discount (%)</label>
            <input type="number" {...register('discountPercent')} className="input" />
          </div>
          <div>
            <label className="label">Final Price (Auto)</label>
            <div className="input bg-surface-border/30 text-emerald-400 font-bold">
              {watch('currency')} {finalPrice.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
            </div>
          </div>
        </div>
      </Section>

      {/* Hero Banner Area */}
      <Section title="Hero Banner Configuration" collapsible>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <F name="heroTitle" label="Hero Title Overlay" placeholder="e.g. The Ultimate Getaway" />
            <F name="heroSubtitle" label="Hero Subtitle" placeholder="e.g. Unwind in nature" />
            <F name="heroBadges" label="Hero Badges (Comma Config)" placeholder="Best Seller, 20% Off" />
            <F name="heroCtaText" label="Hero CTA Button" placeholder="Book Now for ₹25,000" />
         </div>
      </Section>

      {/* Images */}
      <Section title="Media Artifacts">
        <div className="space-y-4">
          <div>
            <label className="label">Primary Catalog Image</label>
            <div
              onClick={() => primaryRef.current?.click()}
              className="border-2 border-dashed border-surface-border rounded-xl p-6 text-center cursor-pointer hover:border-brand-500/50 transition-colors"
            >
              {primaryFile ? (
                <img src={URL.createObjectURL(primaryFile)} alt="Primary" className="h-32 object-cover rounded-lg mx-auto" />
              ) : (
                <div className="flex flex-col items-center gap-2 text-slate-500">
                  <Upload className="w-6 h-6" />
                  <span className="text-xs">Select Primary Presentation Image</span>
                </div>
              )}
              <input ref={primaryRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && setPrimaryFile(e.target.files[0])} />
            </div>
          </div>

          <div>
            <label className="label">Carousel / Gallery Images</label>
            <div
              onClick={() => galleryRef.current?.click()}
              className="border-2 border-dashed border-surface-border rounded-xl p-4 cursor-pointer hover:border-brand-500/50 transition-colors"
            >
              {galleryFiles.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {galleryFiles.map((f, i) => (
                    <div key={i} className="relative">
                      <img src={URL.createObjectURL(f)} alt="" className="h-16 w-16 object-cover rounded-lg" />
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setGalleryFiles(prev => prev.filter((_, j) => j !== i)) }}
                        className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center"
                      >
                        <X className="w-2.5 h-2.5 text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-slate-500">
                  <Upload className="w-5 h-5" />
                  <span className="text-xs">Attach supplementary media for carousel</span>
                </div>
              )}
              <input ref={galleryRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => e.target.files && setGalleryFiles(prev => [...prev, ...Array.from(e.target.files!)])} />
            </div>
          </div>
        </div>
      </Section>

      {/* Quick Info */}
      <Section title="Quick Info Grid (Stats)" collapsible>
         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <F name="pickup" label="Pickup Location" />
            <F name="drop" label="Drop Location" />
            <F name="meals" label="Meals Provided" />
            <F name="stay" label="Stay Rating" />
            <F name="transport" label="Transport Mode" />
            <F name="difficulty" label="Difficulty Level" />
            <F name="timing" label="Timing" />
            <F name="quickDuration" label="UI Duration Label" />
            <F name="ageLimit" label="Age Bounds" />
            <F name="bestTime" label="Best Months to Go" />
            <F name="groupSize" label="Group Size limit" />
            <F name="language" label="Primary Language" />
            <F name="guide" label="Tour Guide Available" />
         </div>
      </Section>

      {/* Extended Descriptions */}
      <Section title="Description Overviews" collapsible>
        <div className="space-y-4">
          <TA name="overviewShort" label="Abstract Summary (Short)" rows={2} />
          <TA name="overviewLong" label="Body Synopsis (Long)" rows={4} />
        </div>
      </Section>

      {/* Bullet Lists */}
      <Section title="Bullet Lists (Comma Configured)" collapsible>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TA name="whyChooseUs" label="Why Choose Us?" placeholder="Best prices, Trusted network, Local guides" rows={2} />
            <TA name="highlights" label="Key Highlights" placeholder="Bonfire, Scuba Diving, Jet Skiing" rows={2} />
            <TA name="inclusions" label="Inclusions" rows={3} />
            <TA name="exclusions" label="Exclusions" rows={3} />
         </div>
      </Section>

      {/* Itinerary Builder */}
      <Section title="Day-By-Day Itinerary Mapper" collapsible>
        <div className="space-y-3">
          {fields.map((field, index) => (
            <div key={field.id} className="bg-surface border border-surface-border rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2">
                <GripVertical className="w-4 h-4 text-slate-600 cursor-grab" />
                <span className="text-xs font-bold text-brand-400">Chronological Day {index + 1}</span>
                <button type="button" onClick={() => remove(index)} className="ml-auto btn-icon btn-danger btn-sm">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="label">Itinerary Title *</label>
                  <input {...register(`itinerary.${index}.title`)} placeholder="e.g. Arrival at Goa Airport" className="input" />
                </div>
                <div>
                  <label className="label">Meals Handled</label>
                  <input {...register(`itinerary.${index}.meals`)} placeholder="e.g. Breakfast, Dinner" className="input" />
                </div>
                <div>
                  <label className="label">Stay Details</label>
                  <input {...register(`itinerary.${index}.stay`)} placeholder="Hotel check-in details" className="input" />
                </div>
                <div className="md:col-span-2">
                  <label className="label">Action Log / Description</label>
                  <textarea {...register(`itinerary.${index}.description`)} rows={2} className="input resize-none" />
                </div>
              </div>
            </div>
          ))}
          <button type="button" onClick={() => append({ day: fields.length + 1, title: '', meals: '', stay: '', description: '' })} className="btn-secondary btn-sm w-full">
            <Plus className="w-4 h-4" /> Add Next Itinerary Node
          </button>
        </div>
      </Section>

      <Section title="Location & Weather" collapsible>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <TA name="address" label="Real-World Address" rows={2} />
           <TA name="mapUrl" label="iFrame src / Map URL" rows={2} />
           <F name="travelBestTime" label="Recommended Time of Year" />
           <F name="temperature" label="Average Temperature Range" />
           <F name="clothing" label="Clothing Advised" />
        </div>
      </Section>

      <Section title="Fine Print Policies" collapsible>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <TA name="cancellation" label="Cancellation Restrictions" rows={3} />
           <TA name="refund" label="Refund Protocol" rows={3} />
           <TA name="terms" label="Legal Terms" rows={3} />
        </div>
      </Section>

      {/* CTA */}
      <Section title="Action & SEO Directives" collapsible>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <F name="whatsapp" label="WhatsApp Phone Dial" placeholder="+91..." />
          <F name="call" label="Direct Phone Dial" placeholder="+91..." />
          <F name="metaTitle" label="Override SEO Meta Title" />
          <TA name="metaDescription" label="Custom DOM Meta Description" rows={2} />
          <F name="keywords" label="DOM Keywords (Comma config)" />
        </div>
      </Section>

      {/* Visibility */}
      <Section title="DOM Node Rendering (Visibility Controls)" collapsible>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 border border-white/5 rounded-xl bg-black/20">
          {VISIBILITY_KEYS.map(({ key, label }) => (
            <label key={key} className="flex items-center gap-3 cursor-pointer">
              <Toggle
                checked={Boolean(watch(key as any))}
                onChange={(v) => setValue(key as any, v)}
              />
              <span className="text-[10px] uppercase font-bold text-slate-300 tracking-wider leading-none mt-[2px]">{label}</span>
            </label>
          ))}
        </div>
      </Section>

      {/* Submit */}
      <div className="flex justify-end gap-3 pt-6 border-t border-white/10 mt-6 pb-12">
        <button type="submit" disabled={saving} className="btn-primary w-full md:w-auto">
          {saving ? <Spinner size="sm" /> : <><Plus className="w-4 h-4" /> Save Package Build</>}
        </button>
      </div>
    </form>
  )
}

// ─── Packages Page ─────────────────────────────────────────────────
const PackagesPage: React.FC = () => {
  const [packages, setPackages] = useState<any[]>([])
  const [loading, setLoading]   = useState(true)
  const [page, setPage]         = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch]     = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing]   = useState<any>(null)
  const [saving, setSaving]     = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const loadPackages = () => {
    setLoading(true)
    fetchPackages({ page, limit: 10, search: search || undefined })
      .then((res) => {
        const d = res.data?.data || res.data
        setPackages(d?.items || [])
        setTotalPages(d?.totalPages || 1)
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadPackages() }, [page, search])

  const flattenArray = (arr: any) => {
      if (!arr || !Array.isArray(arr)) return ''
      return JSON.stringify(arr)
  }

  const handleSubmit = async (data: any, primaryImage?: File, gallery?: File[]) => {
    setSaving(true)
    try {
      const fd = new FormData()

      // Flatten form data into FormData mapping exactly to backend payload builder `buildPackagePayload`
      const payloadKeys = Object.keys(data)
      payloadKeys.forEach(k => {
         // arrays
         if (['tags', 'heroBadges', 'whyChooseUs', 'highlights', 'inclusions', 'exclusions', 'keywords'].includes(k)) {
             try {
                 const arr = (data[k] || '').split(',').map((s: string) => s.trim()).filter(Boolean)
                 fd.append(k, JSON.stringify(arr))
             } catch {
                 fd.append(k, '[]')
             }
         } else if (k === 'itinerary') {
             fd.append(k, JSON.stringify(data[k]))
         } else if (typeof data[k] === 'boolean') {
             fd.append(k, data[k] ? 'true' : 'false')
         } else if (data[k] !== undefined && data[k] !== '') {
             fd.append(k, String(data[k]))
         }
      })

      // Backend explicitly expects these naming conversions for `pricing.` object
      const fp = Math.max(0, (Number(data.basePrice) || 0) * (1 - (Number(data.discountPercent) || 0) / 100))
      fd.append('finalPrice', String(fp))
      fd.append('pricingBasePrice', String(data.basePrice))
      fd.append('pricingDiscountPercent', String(data.discountPercent))
      fd.append('pricingFinalPrice', String(fp))

      if (primaryImage) fd.append('primaryImage', primaryImage)
      if (gallery) gallery.forEach((f) => fd.append('gallery', f))

      if (editing) {
        await updatePackage(editing._id, fd)
        toast.success('Package rules updated!')
      } else {
        await createPackage(fd)
        toast.success('Generated new Package layout!')
      }
      setModalOpen(false)
      setEditing(null)
      loadPackages()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to apply package rules')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      await deletePackage(deleteId)
      toast.success('Package permanently disconnected')
      setDeleteId(null)
      loadPackages()
    } catch { toast.error('Failed to unlink record') }
    finally { setDeleting(false) }
  }

  const columns = [
    {
      header: 'Component Registry',
      render: (r: any) => (
        <div className="flex items-center gap-3">
          {r.images?.primary?.url && (
            <img src={r.images.primary.url} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
          )}
          <div>
            <p className="font-semibold text-sm text-slate-100">{r.basic?.name}</p>
            <p className="text-xs text-brand-400 font-medium">{r.packageCode}</p>
          </div>
        </div>
      ),
    },
    { header: 'Destination Node', render: (r: any) => <span className="text-slate-400">{r.basic?.destination}</span> },
    { header: 'Cycle',    render: (r: any) => <span>{r.basic?.durationDays}D/{r.basic?.nights}N</span> },
    {
      header: 'Valuation',
      render: (r: any) => (
        <div>
          <p className="font-bold text-emerald-400">{r.basic?.currency} {(r.basic?.finalPrice || 0).toLocaleString()}</p>
          {r.basic?.discount > 0 && (
            <p className="text-xs text-slate-500 line-through">{r.basic?.currency} {(r.basic?.basePrice || 0).toLocaleString()}</p>
          )}
        </div>
      ),
    },
    { header: 'Pipeline Status',  render: (r: any) => <StatusBadge status={r.meta?.status || 'ACTIVE'} type="package" /> },
    {
      header: 'Actions',
      render: (r: any) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => { 
                const mapped = {
                    name:            r.basic?.name,
                    slug:            r.basic?.slug,
                    categoryId:      String(r.categoryId?._id || r.categoryId || ''),
                    countryId:       String(r.countryId?._id  || r.countryId  || ''),
                    stateId:         String(r.stateId?._id    || r.stateId    || ''),
                    cityId:          String(r.cityId?._id     || r.cityId     || ''),
                    tagline:         r.basic?.tagline,
                    destination:     r.basic?.destination,
                    durationDays:    r.basic?.durationDays,
                    nights:          r.basic?.nights,
                    basePrice:       r.basic?.basePrice,
                    discountPercent: r.basic?.discount,
                    currency:        r.basic?.currency || 'INR',
                    tags:            (r.basic?.tags || []).join(', '),
                    
                    heroTitle:       r.hero?.title,
                    heroSubtitle:    r.hero?.subtitle,
                    heroBadges:      (r.hero?.badges || []).join(', '),
                    heroCtaText:     r.hero?.ctaText,
                    
                    pickup:          r.quickInfo?.pickup,
                    drop:            r.quickInfo?.drop,
                    meals:           r.quickInfo?.meals,
                    stay:            r.quickInfo?.stay,
                    transport:       r.quickInfo?.transport,
                    difficulty:      r.quickInfo?.difficulty,
                    timing:          r.quickInfo?.timing,
                    quickDuration:   r.quickInfo?.duration,
                    ageLimit:        r.quickInfo?.ageLimit,
                    bestTime:        r.quickInfo?.bestTime,
                    groupSize:       r.quickInfo?.groupSize,
                    language:        r.quickInfo?.language,
                    guide:           r.quickInfo?.guide,

                    overviewShort:   r.overview?.short,
                    overviewLong:    r.overview?.long,
                    address:         r.location?.address,
                    mapUrl:          r.location?.mapUrl,
                    
                    whyChooseUs:     (r.whyChooseUs || []).join(', '),
                    highlights:      (r.highlights || []).join(', '),
                    inclusions:      (r.inclusions || []).join(', '),
                    exclusions:      (r.exclusions || []).join(', '),
                    
                    travelBestTime:  r.travelInfo?.bestTime,
                    temperature:     r.travelInfo?.temperature,
                    clothing:        r.travelInfo?.clothing,
                    
                    cancellation:    r.policies?.cancellation,
                    refund:          r.policies?.refund,
                    terms:           r.policies?.terms,

                    whatsapp:        r.cta?.whatsapp,
                    call:            r.cta?.call,
                    metaTitle:       r.seo?.metaTitle,
                    metaDescription: r.seo?.metaDescription,
                    keywords:        (r.seo?.keywords || []).join(', '),

                    status:          r.meta?.status || 'ACTIVE',
                    itinerary:       r.itinerary || [],
                    
                    visibilityTagline:      Boolean(r.visibility?.tagline ?? true),
                    visibilityPricing:      Boolean(r.visibility?.pricing ?? true),
                    visibilityStats:        Boolean(r.visibility?.stats ?? true),
                    visibilityHero:         Boolean(r.visibility?.hero ?? true),
                    visibilityGallery:      Boolean(r.visibility?.gallery ?? true),
                    visibilityQuickInfo:    Boolean(r.visibility?.quickInfo ?? true),
                    visibilityOverview:     Boolean(r.visibility?.overview ?? true),
                    visibilityWhyChooseUs:  Boolean(r.visibility?.whyChooseUs ?? true),
                    visibilityHighlights:   Boolean(r.visibility?.highlights ?? true),
                    visibilityInclusions:   Boolean(r.visibility?.inclusions ?? true),
                    visibilityExclusions:   Boolean(r.visibility?.exclusions ?? true),
                    visibilityItinerary:    Boolean(r.visibility?.itinerary ?? true),
                    visibilitySuggestions:  Boolean(r.visibility?.suggestions ?? true),
                    visibilityHotelDetails: Boolean(r.visibility?.hotelDetails ?? true),
                    visibilityReviews:      Boolean(r.visibility?.reviews ?? true),
                    visibilityFaq:          Boolean(r.visibility?.faq ?? true),
                }
                setEditing({ _id: r._id, ...mapped })
                setModalOpen(true) 
            }}
            className="btn-secondary btn-sm"
          >Edit Logic</button>
          <button onClick={() => setDeleteId(r._id)} className="btn-danger btn-sm"><Trash2 className="w-3.5 h-3.5" /></button>
        </div>
      ),
    },
  ]

  return (
    <div className="page">
      <PageHeader
        title="Package Registry"
        subtitle="Full schema access over dynamic package data models."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Packages' }]}
        action={
          <button className="btn-primary" onClick={() => { setEditing(null); setModalOpen(true) }}>
            <Plus className="w-4 h-4" /> Instantiate New Package
          </button>
        }
      />

      <div className="card p-4 flex items-center gap-3">
        <input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          placeholder="Query package namespace..."
          className="input max-w-xs"
        />
      </div>

      <DataTable
        columns={columns}
        data={packages}
        loading={loading}
        keyExtractor={(r: any) => r._id}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        emptyMessage="No packages located in database payload."
      />

      <Modal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditing(null) }}
        title={editing ? 'System Configuration: Edit Package' : 'System Configuration: Create Package'}
        size="2xl"
      >
         <div className="mb-4 bg-blue-500/10 border border-blue-500/20 p-3 rounded-lg flex items-center gap-3 text-sm text-blue-200">
            <span className="font-bold uppercase tracking-wider text-[10px] bg-blue-500/20 py-0.5 px-2 rounded">Notice</span>
            Schema uses comma-separated configuration fields for arrays (Tags, Highlights, Restrictions).
         </div>

        <PackageForm
          defaultValues={editing || undefined}
          onSubmit={handleSubmit}
          saving={saving}
        />
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteId)}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        title="Terminate Database Reference?"
        message="This will completely unbind the package from the client database."
        confirmLabel="Terminate"
        loading={deleting}
      />
    </div>
  )
}

export default PackagesPage
