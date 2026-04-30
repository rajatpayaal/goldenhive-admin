import React, { useEffect, useMemo, useState } from 'react'
import {
  Briefcase,
  Camera,
  Eye,
  Gem,
  Globe2,
  ImagePlus,
  Linkedin,
  MonitorSmartphone,
  Pencil,
  Plus,
  Save,
  Settings2,
  Sparkles,
  Trash2,
  Trophy,
  Upload,
  UserRound,
} from 'lucide-react'
import { Spinner, Toggle } from '../../components/ui'

type ImageObj = { url: string; altText: string; caption: string }
type CoreValue = { title: string; description: string; iconImage: ImageObj; _newFile?: File | null }
type Stat = { label: string; value: string; icon: string }
type Leader = { name: string; designation: string; bio: string; linkedinUrl: string; twitterUrl: string; image: ImageObj; _newFile?: File | null }
type DocImage = { url: string; altText: string; caption: string; _newFile?: File | null }
type TabKey = 'hero' | 'banner' | 'mission' | 'values' | 'story' | 'gallery' | 'stats' | 'team' | 'visibility'

export type AboutUsFormData = {
  heroTitle: string
  heroSubtitle: string
  heroImage: ImageObj
  _heroNewFile?: File | null
  missionStatement: string
  visionStatement: string
  ourStoryHeading: string
  ourStoryContent: string
  bannerImages: DocImage[]
  storyImages: DocImage[]
  galleryImages: DocImage[]
  coreValues: CoreValue[]
  stats: Stat[]
  leadershipTeam: Leader[]
  visibility: {
    heroSection: boolean
    bannerSection: boolean
    missionVision: boolean
    coreValues: boolean
    ourStory: boolean
    gallery: boolean
    stats: boolean
    leadershipTeam: boolean
  }
}

const emptyImage: ImageObj = { url: '', altText: '', caption: '' }

const defaultForm: AboutUsFormData = {
  heroTitle: '',
  heroSubtitle: '',
  heroImage: { ...emptyImage },
  missionStatement: '',
  visionStatement: '',
  ourStoryHeading: '',
  ourStoryContent: '',
  bannerImages: [],
  storyImages: [],
  galleryImages: [],
  coreValues: [],
  stats: [],
  leadershipTeam: [],
  visibility: {
    heroSection: true,
    bannerSection: true,
    missionVision: true,
    coreValues: true,
    ourStory: true,
    gallery: true,
    stats: true,
    leadershipTeam: true,
  },
}

const tabs: { key: TabKey; label: string; icon: React.ElementType }[] = [
  { key: 'hero', label: 'Hero Section', icon: Sparkles },
  { key: 'banner', label: 'Banner Section', icon: ImagePlus },
  { key: 'mission', label: 'Mission & Vision', icon: Eye },
  { key: 'values', label: 'Core Values', icon: Gem },
  { key: 'story', label: 'Our Story', icon: Pencil },
  { key: 'gallery', label: 'Gallery', icon: Camera },
  { key: 'stats', label: 'Stats', icon: Trophy },
  { key: 'team', label: 'Leadership Team', icon: UserRound },
  { key: 'visibility', label: 'Visibility Settings', icon: Settings2 },
]

const statIconOptions = [
  { value: 'user', label: 'Users', icon: UserRound },
  { value: 'briefcase', label: 'Trips', icon: Briefcase },
  { value: 'globe', label: 'World', icon: Globe2 },
  { value: 'trophy', label: 'Award', icon: Trophy },
  { value: 'gem', label: 'Value', icon: Gem },
]

const visibilityRows: { key: keyof AboutUsFormData['visibility']; label: string }[] = [
  { key: 'heroSection', label: 'Hero Section' },
  { key: 'bannerSection', label: 'Banner Section' },
  { key: 'missionVision', label: 'Mission & Vision Section' },
  { key: 'coreValues', label: 'Core Values Section' },
  { key: 'ourStory', label: 'Our Story Section' },
  { key: 'gallery', label: 'Gallery Section' },
  { key: 'stats', label: 'Stats Section' },
  { key: 'leadershipTeam', label: 'Leadership Team Section' },
]

const toDocImage = (item: any): DocImage => ({
  url: item?.url || '',
  altText: item?.altText || '',
  caption: item?.caption || '',
  _newFile: null,
})

const imageSrc = (img: DocImage | (ImageObj & { _newFile?: File | null })) => {
  if (img._newFile) return URL.createObjectURL(img._newFile)
  return img.url || ''
}

const Card: React.FC<{ title: string; subtitle?: string; action?: React.ReactNode; children: React.ReactNode; className?: string }> = ({
  title,
  subtitle,
  action,
  children,
  className = '',
}) => (
  <section className={`rounded-lg border border-surface-border bg-surface-card p-4 shadow-sm sm:p-5 ${className}`}>
    <div className="mb-5 flex flex-col items-start justify-between gap-3 sm:flex-row">
      <div>
        <h3 className="text-base font-bold text-text-primary">{title}</h3>
        {subtitle && <p className="mt-1 text-xs text-text-secondary">{subtitle}</p>}
      </div>
      {action && <div className="w-full sm:w-auto">{action}</div>}
    </div>
    {children}
  </section>
)

const SmallIcon = ({ type }: { type?: string }) => {
  const cls = "h-5 w-5"
  if (type === 'briefcase') return <Briefcase className={cls} />
  if (type === 'globe') return <Globe2 className={cls} />
  if (type === 'trophy') return <Trophy className={cls} />
  if (type === 'gem') return <Gem className={cls} />
  return <UserRound className={cls} />
}

const ImageTile = ({
  img,
  onChange,
  onRemove,
  compact = false,
}: {
  img: DocImage | (ImageObj & { _newFile?: File | null })
  onChange: (v: any) => void
  onRemove?: () => void
  compact?: boolean
}) => {
  const src = imageSrc(img)
  return (
    <div className={`relative overflow-hidden rounded-lg border border-surface-border bg-surface-hover ${compact ? 'h-28' : 'h-44'}`}>
      <label className="block h-full cursor-pointer">
        {src ? (
          <img src={src} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-text-tertiary">
            <Upload className="h-6 w-6" />
            <span className="text-xs font-semibold">Upload image</span>
          </div>
        )}
        <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && onChange({ _newFile: e.target.files[0] })} />
      </label>
      <div className="absolute bottom-2 left-2 rounded-full bg-black/60 p-1.5 text-white shadow">
        <Pencil className="h-3.5 w-3.5" />
      </div>
      {onRemove && (
        <button type="button" className="absolute right-2 top-2 rounded-full bg-danger-500 p-1 text-white shadow" onClick={onRemove}>
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  )
}

const ImageMeta = ({ img, onChange }: { img: ImageObj; onChange: (v: Partial<ImageObj>) => void }) => (
  <div className="space-y-3 rounded-lg bg-surface-hover p-4">
    <h4 className="text-sm font-bold text-text-primary">Image Meta</h4>
    <div>
      <label className="label">Alt Text</label>
      <input className="input" value={img.altText || ''} onChange={(e) => onChange({ altText: e.target.value })} />
    </div>
    <div>
      <label className="label">Caption</label>
      <input className="input" value={img.caption || ''} onChange={(e) => onChange({ caption: e.target.value })} />
    </div>
  </div>
)

interface AboutUsFormProps {
  defaultValues?: Partial<AboutUsFormData>
  saving: boolean
  submitLabel?: string
  onSubmit: (payload: FormData) => Promise<void>
}

const AboutUsForm: React.FC<AboutUsFormProps> = ({ defaultValues, saving, submitLabel = 'Save Changes', onSubmit }) => {
  const normalized = useMemo<AboutUsFormData>(() => {
    const v = defaultValues || {}
    return {
      ...defaultForm,
      ...v,
      heroImage: { ...emptyImage, ...(v.heroImage || {}) },
      bannerImages: (v.bannerImages || []).map(toDocImage),
      storyImages: (v.storyImages || []).map(toDocImage),
      galleryImages: (v.galleryImages || []).map(toDocImage),
      coreValues: (v.coreValues || []).map((x: any) => ({
        title: x?.title || '',
        description: x?.description || '',
        iconImage: { ...emptyImage, ...(x?.iconImage || {}) },
        _newFile: null,
      })),
      stats: (v.stats || []).map((x: any) => ({ label: x?.label || '', value: x?.value || '', icon: x?.icon || 'user' })),
      leadershipTeam: (v.leadershipTeam || []).map((x: any) => ({
        name: x?.name || '',
        designation: x?.designation || '',
        bio: x?.bio || '',
        linkedinUrl: x?.linkedinUrl || '',
        twitterUrl: x?.twitterUrl || '',
        image: { ...emptyImage, ...(x?.image || {}) },
        _newFile: null,
      })),
      visibility: { ...defaultForm.visibility, ...(v.visibility || {}) },
      _heroNewFile: null,
    }
  }, [defaultValues])

  const [form, setForm] = useState<AboutUsFormData>(normalized)
  const [activeTab, setActiveTab] = useState<TabKey>('hero')

  useEffect(() => {
    setForm(normalized)
  }, [normalized])

  const addImageArray = (fd: FormData, collection: DocImage[], metaKey: string, fileKey: string) => {
    fd.append(metaKey, JSON.stringify(collection.map((x) => ({ url: x.url, altText: x.altText, caption: x.caption }))))
    collection.forEach((x) => {
      if (x._newFile) fd.append(fileKey, x._newFile)
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const fd = new FormData()
    fd.append('heroTitle', form.heroTitle)
    fd.append('heroSubtitle', form.heroSubtitle)
    fd.append('missionStatement', form.missionStatement)
    fd.append('visionStatement', form.visionStatement)
    fd.append('ourStoryHeading', form.ourStoryHeading)
    fd.append('ourStoryContent', form.ourStoryContent)
    fd.append('heroImageMeta', JSON.stringify({ altText: form.heroImage.altText, caption: form.heroImage.caption }))
    if (form._heroNewFile) fd.append('heroImage', form._heroNewFile)
    addImageArray(fd, form.bannerImages, 'bannerImagesMeta', 'bannerImages')
    addImageArray(fd, form.storyImages, 'storyImagesMeta', 'storyImages')
    addImageArray(fd, form.galleryImages, 'galleryImagesMeta', 'galleryImages')
    fd.append('coreValues', JSON.stringify(form.coreValues.map((x) => ({ title: x.title, description: x.description, iconImage: x.iconImage }))))
    form.coreValues.forEach((x) => {
      if (x._newFile) fd.append('coreValueIconImages', x._newFile)
    })
    fd.append('stats', JSON.stringify(form.stats))
    fd.append(
      'leadershipTeam',
      JSON.stringify(form.leadershipTeam.map((x) => ({ name: x.name, designation: x.designation, bio: x.bio, linkedinUrl: x.linkedinUrl, twitterUrl: x.twitterUrl, image: x.image })))
    )
    form.leadershipTeam.forEach((x) => {
      if (x._newFile) fd.append('leadershipImages', x._newFile)
    })
    fd.append('visibilityHeroSection', String(form.visibility.heroSection))
    fd.append('visibilityBannerSection', String(form.visibility.bannerSection))
    fd.append('visibilityMissionVision', String(form.visibility.missionVision))
    fd.append('visibilityCoreValues', String(form.visibility.coreValues))
    fd.append('visibilityOurStory', String(form.visibility.ourStory))
    fd.append('visibilityGallery', String(form.visibility.gallery))
    fd.append('visibilityStats', String(form.visibility.stats))
    fd.append('visibilityLeadershipTeam', String(form.visibility.leadershipTeam))
    await onSubmit(fd)
  }

  const addDocImage = (key: 'bannerImages' | 'storyImages' | 'galleryImages') => {
    setForm((p) => ({ ...p, [key]: [...p[key], { ...emptyImage, _newFile: null }] }))
  }

  const updateDocImage = (key: 'bannerImages' | 'storyImages' | 'galleryImages', idx: number, value: any) => {
    const arr = [...form[key]]
    arr[idx] = value._newFile ? { ...arr[idx], _newFile: value._newFile } : { ...arr[idx], ...value }
    setForm((p) => ({ ...p, [key]: arr }))
  }

  const removeDocImage = (key: 'bannerImages' | 'storyImages' | 'galleryImages', idx: number) => {
    setForm((p) => ({ ...p, [key]: p[key].filter((_, i) => i !== idx) }))
  }

  const renderVisibility = () => (
    <Card title="Visibility Settings" subtitle="Show or hide sections on About Us page">
      <div className="divide-y divide-surface-border">
        {visibilityRows.map((row) => (
          <div key={row.key} className="flex items-center justify-between gap-4 py-3">
            <span className="text-sm font-semibold text-text-secondary">{row.label}</span>
            <Toggle checked={form.visibility[row.key]} onChange={(v) => setForm((p) => ({ ...p, visibility: { ...p.visibility, [row.key]: v } }))} />
          </div>
        ))}
      </div>
    </Card>
  )

  const updateStat = (idx: number, value: Partial<Stat>) => {
    const arr = [...form.stats]
    arr[idx] = { ...arr[idx], ...value }
    setForm((p) => ({ ...p, stats: arr }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="flex flex-col gap-4 rounded-lg border border-surface-border bg-surface-card p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-primary-500/10 px-3 py-1 text-xs font-bold text-primary-600">
            <MonitorSmartphone className="h-3.5 w-3.5" /> Responsive CMS
          </div>
          <h2 className="text-xl font-bold text-text-primary sm:text-2xl">About Us Management</h2>
          <p className="text-sm text-text-secondary">Dashboard / About Us</p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:flex">
          <button type="button" className="btn-secondary justify-center">
            <Eye className="h-4 w-4" /> Preview
          </button>
          <button type="submit" className="btn-primary justify-center" disabled={saving}>
            {saving ? <Spinner size="sm" /> : <Save className="h-4 w-4" />} {submitLabel}
          </button>
        </div>
      </div>

      <div className="rounded-lg border border-surface-border bg-surface-card p-2">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-9">
          {tabs.map((tab) => (
            <button key={tab.key} type="button" onClick={() => setActiveTab(tab.key)} className={`flex min-h-12 items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-bold transition ${
              activeTab === tab.key ? 'bg-primary-500 text-white shadow-sm' : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'
            }`}>
              <tab.icon className="h-4 w-4 shrink-0" />
              <span className="truncate">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_440px]">
        <div className="space-y-5">
          {activeTab === 'hero' && (
            <Card title="Hero Section" subtitle="Manage hero section content">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="label">Hero Title *</label>
                  <input className="input" value={form.heroTitle} onChange={(e) => setForm((p) => ({ ...p, heroTitle: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Hero Subtitle</label>
                  <input className="input" value={form.heroSubtitle} onChange={(e) => setForm((p) => ({ ...p, heroSubtitle: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Hero Image *</label>
                  <ImageTile
                    img={{ ...form.heroImage, _newFile: form._heroNewFile }}
                    onChange={(v) => setForm((p) => ({ ...p, _heroNewFile: v._newFile }))}
                  />
                </div>
                <ImageMeta img={form.heroImage} onChange={(v) => setForm((p) => ({ ...p, heroImage: { ...p.heroImage, ...v } }))} />
              </div>
            </Card>
          )}

          {activeTab === 'banner' && (
            <Card title="Banner Section" subtitle="Manage banner images" action={<button type="button" className="btn-primary btn-sm w-full justify-center sm:w-auto" onClick={() => addDocImage('bannerImages')}><Plus className="h-4 w-4" /> Add Banner Image</button>}>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {form.bannerImages.map((img, idx) => (
                  <div key={idx} className="space-y-3">
                    <ImageTile img={img} compact onChange={(v) => updateDocImage('bannerImages', idx, v)} onRemove={() => removeDocImage('bannerImages', idx)} />
                    <ImageMeta img={img} onChange={(v) => updateDocImage('bannerImages', idx, v)} />
                  </div>
                ))}
              </div>
            </Card>
          )}

          {activeTab === 'mission' && (
            <Card title="Mission & Vision" subtitle="Manage mission and vision statements">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="label">Mission Statement *</label>
                  <textarea className="input h-44 resize-none" value={form.missionStatement} onChange={(e) => setForm((p) => ({ ...p, missionStatement: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Vision Statement *</label>
                  <textarea className="input h-44 resize-none" value={form.visionStatement} onChange={(e) => setForm((p) => ({ ...p, visionStatement: e.target.value }))} />
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'values' && (
            <Card title="Core Values" subtitle="Add and manage core values" action={<button type="button" className="btn-primary btn-sm w-full justify-center sm:w-auto" onClick={() => setForm((p) => ({ ...p, coreValues: [...p.coreValues, { title: '', description: '', iconImage: { ...emptyImage } }] }))}><Plus className="h-4 w-4" /> Add Core Value</button>}>
              <div className="grid gap-4 lg:grid-cols-2">
                {form.coreValues.map((cv, idx) => (
                  <div key={idx} className="grid gap-4 rounded-lg border border-surface-border p-4 sm:grid-cols-[96px,1fr] lg:grid-cols-[96px,1fr,36px]">
                    <ImageTile img={{ ...cv.iconImage, _newFile: cv._newFile }} compact onChange={(v) => {
                      const arr = [...form.coreValues]
                      if (v._newFile) arr[idx]._newFile = v._newFile
                      else arr[idx].iconImage = { ...arr[idx].iconImage, ...v }
                      setForm((p) => ({ ...p, coreValues: arr }))
                    }} />
                    <div className="grid gap-3 md:grid-cols-2">
                      <div>
                        <label className="label">Title *</label>
                        <input className="input" value={cv.title} onChange={(e) => {
                          const arr = [...form.coreValues]
                          arr[idx].title = e.target.value
                          setForm((p) => ({ ...p, coreValues: arr }))
                        }} />
                      </div>
                      <div>
                        <label className="label">Description *</label>
                        <textarea className="input h-20 resize-none" value={cv.description} onChange={(e) => {
                          const arr = [...form.coreValues]
                          arr[idx].description = e.target.value
                          setForm((p) => ({ ...p, coreValues: arr }))
                        }} />
                      </div>
                    </div>
                    <button type="button" className="inline-flex items-center justify-center rounded-lg border border-danger-500/20 p-2 text-danger-500 sm:col-span-2 lg:col-span-1 lg:border-0" onClick={() => setForm((p) => ({ ...p, coreValues: p.coreValues.filter((_, i) => i !== idx) }))}>
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {activeTab === 'story' && (
            <Card title="Our Story" subtitle="Manage story content and images" action={<button type="button" className="btn-primary btn-sm w-full justify-center sm:w-auto" onClick={() => addDocImage('storyImages')}><ImagePlus className="h-4 w-4" /> Add Images</button>}>
              <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(280px,420px)]">
                <div className="space-y-4">
                  <div>
                    <label className="label">Story Heading *</label>
                    <input className="input" value={form.ourStoryHeading} onChange={(e) => setForm((p) => ({ ...p, ourStoryHeading: e.target.value }))} />
                  </div>
                  <div>
                    <label className="label">Story Content *</label>
                    <textarea className="input h-48 resize-none" value={form.ourStoryContent} onChange={(e) => setForm((p) => ({ ...p, ourStoryContent: e.target.value }))} />
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {form.storyImages.map((img, idx) => (
                    <ImageTile key={idx} img={img} compact onChange={(v) => updateDocImage('storyImages', idx, v)} onRemove={() => removeDocImage('storyImages', idx)} />
                  ))}
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'gallery' && (
            <Card title="Gallery" subtitle="Manage gallery images" action={<button type="button" className="btn-primary btn-sm w-full justify-center sm:w-auto" onClick={() => addDocImage('galleryImages')}><ImagePlus className="h-4 w-4" /> Add Images</button>}>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {form.galleryImages.map((img, idx) => (
                  <ImageTile key={idx} img={img} compact onChange={(v) => updateDocImage('galleryImages', idx, v)} onRemove={() => removeDocImage('galleryImages', idx)} />
                ))}
              </div>
            </Card>
          )}

          {activeTab === 'stats' && (
            <Card title="Our Stats" subtitle="Manage statistics" action={<button type="button" className="btn-primary btn-sm w-full justify-center sm:w-auto" onClick={() => setForm((p) => ({ ...p, stats: [...p.stats, { label: '', value: '', icon: 'user' }] }))}><Plus className="h-4 w-4" /> Add Stat</button>}>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {form.stats.map((st, idx) => (
                  <div key={idx} className="rounded-lg border border-surface-border p-4 text-center">
                    <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-success-100 text-success-600">
                      <SmallIcon type={st.icon} />
                    </div>
                    <input className="input mb-2 text-center text-xl font-bold" placeholder="5000+" value={st.value} onChange={(e) => updateStat(idx, { value: e.target.value })} />
                    <input className="input mb-3 text-center" placeholder="Happy Customers" value={st.label} onChange={(e) => updateStat(idx, { label: e.target.value })} />
                    <div className="grid grid-cols-5 gap-1">
                      {statIconOptions.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          title={option.label}
                          onClick={() => updateStat(idx, { icon: option.value })}
                          className={`flex h-9 items-center justify-center rounded-lg border transition ${
                            st.icon === option.value ? 'border-primary-500 bg-primary-500 text-white' : 'border-surface-border bg-surface-card text-text-secondary hover:bg-surface-hover'
                          }`}
                        >
                          <option.icon className="h-4 w-4" />
                        </button>
                      ))}
                    </div>
                    <button type="button" className="mt-3 text-danger-500" onClick={() => setForm((p) => ({ ...p, stats: p.stats.filter((_, i) => i !== idx) }))}>
                      <Trash2 className="mx-auto h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {activeTab === 'team' && (
            <Card title="Leadership Team" subtitle="Manage leadership team members" action={<button type="button" className="btn-primary btn-sm w-full justify-center sm:w-auto" onClick={() => setForm((p) => ({ ...p, leadershipTeam: [...p.leadershipTeam, { name: '', designation: '', bio: '', linkedinUrl: '', twitterUrl: '', image: { ...emptyImage } }] }))}><Plus className="h-4 w-4" /> Add Member</button>}>
              <div className="space-y-4">
                {form.leadershipTeam.map((lt, idx) => (
                  <div key={idx} className="grid gap-4 rounded-lg border border-surface-border p-4 md:grid-cols-[120px,1fr] lg:grid-cols-[120px,1fr,36px]">
                    <ImageTile img={{ ...lt.image, _newFile: lt._newFile }} compact onChange={(v) => {
                      const arr = [...form.leadershipTeam]
                      if (v._newFile) arr[idx]._newFile = v._newFile
                      setForm((p) => ({ ...p, leadershipTeam: arr }))
                    }} />
                    <div className="grid gap-3 md:grid-cols-2">
                      <input className="input font-bold" placeholder="Name" value={lt.name} onChange={(e) => {
                        const arr = [...form.leadershipTeam]
                        arr[idx].name = e.target.value
                        setForm((p) => ({ ...p, leadershipTeam: arr }))
                      }} />
                      <input className="input" placeholder="Designation" value={lt.designation} onChange={(e) => {
                        const arr = [...form.leadershipTeam]
                        arr[idx].designation = e.target.value
                        setForm((p) => ({ ...p, leadershipTeam: arr }))
                      }} />
                      <textarea className="input h-24 resize-none md:col-span-2" placeholder="Bio" value={lt.bio} onChange={(e) => {
                        const arr = [...form.leadershipTeam]
                        arr[idx].bio = e.target.value
                        setForm((p) => ({ ...p, leadershipTeam: arr }))
                      }} />
                      <input className="input" placeholder="LinkedIn URL" value={lt.linkedinUrl} onChange={(e) => {
                        const arr = [...form.leadershipTeam]
                        arr[idx].linkedinUrl = e.target.value
                        setForm((p) => ({ ...p, leadershipTeam: arr }))
                      }} />
                      <input className="input" placeholder="Twitter URL" value={lt.twitterUrl} onChange={(e) => {
                        const arr = [...form.leadershipTeam]
                        arr[idx].twitterUrl = e.target.value
                        setForm((p) => ({ ...p, leadershipTeam: arr }))
                      }} />
                    </div>
                    <button type="button" className="inline-flex items-center justify-center rounded-lg border border-danger-500/20 p-2 text-danger-500 md:col-span-2 lg:col-span-1 lg:border-0" onClick={() => setForm((p) => ({ ...p, leadershipTeam: p.leadershipTeam.filter((_, i) => i !== idx) }))}>
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {activeTab === 'visibility' && renderVisibility()}
        </div>

        <div className="space-y-5">
          {activeTab !== 'visibility' && renderVisibility()}
          <Card title="Quick Preview" subtitle="Current About Us summary">
            <div className="space-y-4">
              <div className="rounded-lg bg-surface-hover p-4">
                <p className="text-xs font-bold uppercase text-text-tertiary">Hero</p>
                <p className="mt-1 text-lg font-bold text-text-primary">{form.heroTitle || 'Golden Hive Travels'}</p>
                <p className="text-sm text-text-secondary">{form.heroSubtitle || 'Explore the world with us'}</p>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="rounded-lg border border-surface-border p-3"><Camera className="mx-auto h-5 w-5 text-primary-500" /><p className="mt-1 text-lg font-bold">{form.galleryImages.length}</p><p className="text-xs text-text-secondary">Gallery</p></div>
                <div className="rounded-lg border border-surface-border p-3"><Gem className="mx-auto h-5 w-5 text-success-600" /><p className="mt-1 text-lg font-bold">{form.coreValues.length}</p><p className="text-xs text-text-secondary">Values</p></div>
                <div className="rounded-lg border border-surface-border p-3"><Linkedin className="mx-auto h-5 w-5 text-primary-500" /><p className="mt-1 text-lg font-bold">{form.leadershipTeam.length}</p><p className="text-xs text-text-secondary">Leaders</p></div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </form>
  )
}

export default AboutUsForm
