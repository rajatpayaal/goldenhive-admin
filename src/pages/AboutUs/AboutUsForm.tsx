import React, { useEffect, useMemo, useState } from 'react'
import { ChevronDown, ChevronUp, Plus, Trash, Upload } from 'lucide-react'
import { Spinner, Toggle } from '../../components/ui'

type ImageObj = { url: string; altText: string; caption: string }
type CoreValue = { title: string; description: string; iconImage: ImageObj; _newFile?: File | null }
type Stat = { label: string; value: string; icon: string }
type Leader = { name: string; designation: string; bio: string; linkedinUrl: string; twitterUrl: string; image: ImageObj; _newFile?: File | null }
type DocImage = { url: string; altText: string; caption: string; _newFile?: File | null }

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

const createDummyFile = () => new File([''], 'empty.txt', { type: 'text/plain' })

const toDocImage = (item: any): DocImage => ({
  url: item?.url || '',
  altText: item?.altText || '',
  caption: item?.caption || '',
  _newFile: null,
})

const SectionWrapper: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => {
  const [open, setOpen] = useState(false)
  return (
    <div className="mt-4 overflow-hidden rounded-xl border border-surface-border bg-surface-card">
      <div className="flex cursor-pointer items-center justify-between p-4 hover:bg-surface-border" onClick={() => setOpen((v) => !v)}>
        <h3 className="text-sm font-bold uppercase tracking-wider text-text-secondary">{title}</h3>
        {open ? <ChevronUp className="h-5 w-5 text-text-tertiary" /> : <ChevronDown className="h-5 w-5 text-text-tertiary" />}
      </div>
      {open && <div className="space-y-4 border-t border-surface-border p-4">{children}</div>}
    </div>
  )
}

const ImageUploader = ({
  img,
  onChange,
}: {
  img: DocImage | (ImageObj & { _newFile?: File | null })
  onChange: (v: any) => void
}) => (
  <div className="flex items-start gap-4">
    <label className="relative flex h-24 w-24 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded border border-surface-border bg-surface-card p-1">
      {img._newFile ? (
        <img src={URL.createObjectURL(img._newFile)} className="h-full w-full object-cover" />
      ) : img.url ? (
        <img src={img.url} className="h-full w-full object-cover" />
      ) : (
        <Upload className="h-6 w-6 text-text-tertiary" />
      )}
      <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && onChange({ _newFile: e.target.files[0] })} />
    </label>
    <div className="flex-1 space-y-2">
      <input className="input text-xs" placeholder="Alt Text" value={img.altText || ''} onChange={(e) => onChange({ altText: e.target.value })} />
      <input className="input text-xs" placeholder="Caption" value={img.caption || ''} onChange={(e) => onChange({ caption: e.target.value })} />
    </div>
  </div>
)

interface AboutUsFormProps {
  defaultValues?: Partial<AboutUsFormData>
  saving: boolean
  submitLabel?: string
  onSubmit: (payload: FormData) => Promise<void>
}

const AboutUsForm: React.FC<AboutUsFormProps> = ({ defaultValues, saving, submitLabel = 'Save', onSubmit }) => {
  const normalized = useMemo<AboutUsFormData>(() => {
    const v = defaultValues || {}
    return {
      ...defaultForm,
      ...v,
      heroImage: {
        ...emptyImage,
        ...(v.heroImage || {}),
      },
      bannerImages: (v.bannerImages || []).map(toDocImage),
      storyImages: (v.storyImages || []).map(toDocImage),
      galleryImages: (v.galleryImages || []).map(toDocImage),
      coreValues: (v.coreValues || []).map((x: any) => ({
        title: x?.title || '',
        description: x?.description || '',
        iconImage: {
          ...emptyImage,
          ...(x?.iconImage || {}),
        },
        _newFile: null,
      })),
      stats: (v.stats || []).map((x: any) => ({ label: x?.label || '', value: x?.value || '', icon: x?.icon || '' })),
      leadershipTeam: (v.leadershipTeam || []).map((x: any) => ({
        name: x?.name || '',
        designation: x?.designation || '',
        bio: x?.bio || '',
        linkedinUrl: x?.linkedinUrl || '',
        twitterUrl: x?.twitterUrl || '',
        image: { ...emptyImage, ...(x?.image || {}) },
        _newFile: null,
      })),
      visibility: {
        ...defaultForm.visibility,
        ...(v.visibility || {}),
      },
      _heroNewFile: null,
    }
  }, [defaultValues])

  const [form, setForm] = useState<AboutUsFormData>(normalized)

  useEffect(() => {
    setForm(normalized)
  }, [normalized])

  const addImageArray = (fd: FormData, collection: DocImage[], metaKey: string, fileKey: string) => {
    fd.append(metaKey, JSON.stringify(collection.map((x) => ({ url: x.url, altText: x.altText, caption: x.caption }))))
    collection.forEach((x) => fd.append(fileKey, x._newFile || createDummyFile()))
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

    fd.append('stats', JSON.stringify(form.stats))

    addImageArray(fd, form.bannerImages, 'bannerImagesMeta', 'bannerImages')
    addImageArray(fd, form.storyImages, 'storyImagesMeta', 'storyImages')
    addImageArray(fd, form.galleryImages, 'galleryImagesMeta', 'galleryImages')

    fd.append(
      'coreValues',
      JSON.stringify(
        form.coreValues.map((x) => ({
          title: x.title,
          description: x.description,
          iconImage: { url: x.iconImage.url, altText: x.iconImage.altText, caption: x.iconImage.caption },
        }))
      )
    )
    form.coreValues.forEach((x) => fd.append('coreValueIconImages', x._newFile || createDummyFile()))

    fd.append(
      'leadershipTeam',
      JSON.stringify(
        form.leadershipTeam.map((x) => ({
          name: x.name,
          designation: x.designation,
          bio: x.bio,
          linkedinUrl: x.linkedinUrl,
          twitterUrl: x.twitterUrl,
          image: { url: x.image.url, altText: x.image.altText, caption: x.image.caption },
        }))
      )
    )
    form.leadershipTeam.forEach((x) => fd.append('leadershipImages', x._newFile || createDummyFile()))

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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="rounded-xl border border-surface-border bg-surface-card p-4">
        <h3 className="mb-3 border-b border-surface-border pb-2 text-xs font-bold text-text-tertiary">Component Rendering Visibility</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
          {Object.keys(form.visibility).map((key) => (
            <label key={key} className="flex cursor-pointer items-center gap-2">
              <Toggle
                checked={(form.visibility as any)[key]}
                onChange={(v) => setForm((p) => ({ ...p, visibility: { ...p.visibility, [key]: v } }))}
              />
              <span className="text-xs uppercase tracking-wider text-text-secondary">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
            </label>
          ))}
        </div>
      </div>

      <SectionWrapper title="1. Hero Banner">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="label">Hero Title Overlay</label>
            <input className="input" value={form.heroTitle} onChange={(e) => setForm((p) => ({ ...p, heroTitle: e.target.value }))} />
          </div>
          <div>
            <label className="label">Hero Subtitle</label>
            <input className="input" value={form.heroSubtitle} onChange={(e) => setForm((p) => ({ ...p, heroSubtitle: e.target.value }))} />
          </div>
          <div className="md:col-span-2">
            <label className="label">Hero Primary Background</label>
            <ImageUploader
              img={{ ...form.heroImage, _newFile: form._heroNewFile }}
              onChange={(v) => {
                if (v._newFile) setForm((p) => ({ ...p, _heroNewFile: v._newFile }))
                else setForm((p) => ({ ...p, heroImage: { ...p.heroImage, ...v } }))
              }}
            />
          </div>
        </div>
      </SectionWrapper>

      <SectionWrapper title="2. Mission & Vision Directives">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="label">Mission Statement Block</label>
            <textarea className="input h-32 resize-none" value={form.missionStatement} onChange={(e) => setForm((p) => ({ ...p, missionStatement: e.target.value }))} />
          </div>
          <div>
            <label className="label">Vision Statement Block</label>
            <textarea className="input h-32 resize-none" value={form.visionStatement} onChange={(e) => setForm((p) => ({ ...p, visionStatement: e.target.value }))} />
          </div>
        </div>
      </SectionWrapper>

      <SectionWrapper title="3. Value Engine (Core Values)">
        <button type="button" className="btn-secondary btn-sm mb-4" onClick={() => setForm((p) => ({ ...p, coreValues: [...p.coreValues, { title: '', description: '', iconImage: { ...emptyImage } }] }))}>
          <Plus className="w-4" /> Add Value Index
        </button>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {form.coreValues.map((cv, idx) => (
            <div key={idx} className="relative rounded border border-surface-border bg-surface-card p-4">
              <button type="button" className="absolute right-2 top-2 text-danger-500 hover:text-danger-400" onClick={() => setForm((p) => ({ ...p, coreValues: p.coreValues.filter((_, i) => i !== idx) }))}>
                <Trash className="h-4 w-4" />
              </button>
              <div className="space-y-3 pr-6">
                <input className="input text-sm font-bold" placeholder="Value Title" value={cv.title} onChange={(e) => {
                  const arr = [...form.coreValues]
                  arr[idx].title = e.target.value
                  setForm((p) => ({ ...p, coreValues: arr }))
                }} />
                <textarea className="input h-16 resize-none text-xs" placeholder="Description" value={cv.description} onChange={(e) => {
                  const arr = [...form.coreValues]
                  arr[idx].description = e.target.value
                  setForm((p) => ({ ...p, coreValues: arr }))
                }} />
                <ImageUploader img={{ ...cv.iconImage, _newFile: cv._newFile }} onChange={(v) => {
                  const arr = [...form.coreValues]
                  if (v._newFile) arr[idx]._newFile = v._newFile
                  else arr[idx].iconImage = { ...arr[idx].iconImage, ...v }
                  setForm((p) => ({ ...p, coreValues: arr }))
                }} />
              </div>
            </div>
          ))}
        </div>
      </SectionWrapper>

      <SectionWrapper title="4. Company Story Narrative">
        <div className="space-y-4">
          <input className="input" placeholder="Our Journey Heading" value={form.ourStoryHeading} onChange={(e) => setForm((p) => ({ ...p, ourStoryHeading: e.target.value }))} />
          <textarea className="input h-32 resize-none" placeholder="Long form content..." value={form.ourStoryContent} onChange={(e) => setForm((p) => ({ ...p, ourStoryContent: e.target.value }))} />
          <div>
            <div className="mb-2 flex items-end justify-between">
              <label className="label mb-0">Story Context Images Array</label>
              <button type="button" className="btn-secondary btn-sm" onClick={() => setForm((p) => ({ ...p, storyImages: [...p.storyImages, { ...emptyImage, _newFile: null }] }))}>
                <Plus className="w-3" /> Add Map
              </button>
            </div>
            <div className="space-y-2">
              {form.storyImages.map((img, idx) => (
                <div key={idx} className="relative rounded border border-surface-border bg-surface-card p-2 pr-10">
                  <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 text-danger-500 hover:text-danger-400" onClick={() => setForm((p) => ({ ...p, storyImages: p.storyImages.filter((_, i) => i !== idx) }))}>
                    <Trash className="w-4" />
                  </button>
                  <ImageUploader img={img} onChange={(v) => {
                    const a = [...form.storyImages]
                    if (v._newFile) a[idx]._newFile = v._newFile
                    else a[idx] = { ...a[idx], ...v }
                    setForm((p) => ({ ...p, storyImages: a }))
                  }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </SectionWrapper>

      <SectionWrapper title="5. Leadership Engine">
        <button type="button" className="btn-secondary btn-sm mb-4" onClick={() => setForm((p) => ({ ...p, leadershipTeam: [...p.leadershipTeam, { name: '', designation: '', bio: '', linkedinUrl: '', twitterUrl: '', image: { ...emptyImage } }] }))}>
          <Plus className="w-4" /> Add Executive
        </button>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {form.leadershipTeam.map((lt, idx) => (
            <div key={idx} className="relative rounded border border-surface-border bg-surface-card p-4">
              <button type="button" className="absolute right-2 top-2 text-danger-500 hover:text-danger-400" onClick={() => setForm((p) => ({ ...p, leadershipTeam: p.leadershipTeam.filter((_, i) => i !== idx) }))}>
                <Trash className="h-4 w-4" />
              </button>
              <div className="space-y-3 pr-6">
                <div className="flex gap-2">
                  <input className="input text-sm" placeholder="Name" value={lt.name} onChange={(e) => {
                    const a = [...form.leadershipTeam]
                    a[idx].name = e.target.value
                    setForm((p) => ({ ...p, leadershipTeam: a }))
                  }} />
                  <input className="input text-sm" placeholder="Designation" value={lt.designation} onChange={(e) => {
                    const a = [...form.leadershipTeam]
                    a[idx].designation = e.target.value
                    setForm((p) => ({ ...p, leadershipTeam: a }))
                  }} />
                </div>
                <textarea className="input h-16 resize-none text-xs" placeholder="Biography Block" value={lt.bio} onChange={(e) => {
                  const a = [...form.leadershipTeam]
                  a[idx].bio = e.target.value
                  setForm((p) => ({ ...p, leadershipTeam: a }))
                }} />
                <div className="flex gap-2">
                  <input className="input text-xs" placeholder="LinkedIn URL" value={lt.linkedinUrl} onChange={(e) => {
                    const a = [...form.leadershipTeam]
                    a[idx].linkedinUrl = e.target.value
                    setForm((p) => ({ ...p, leadershipTeam: a }))
                  }} />
                  <input className="input text-xs" placeholder="Twitter URL" value={lt.twitterUrl} onChange={(e) => {
                    const a = [...form.leadershipTeam]
                    a[idx].twitterUrl = e.target.value
                    setForm((p) => ({ ...p, leadershipTeam: a }))
                  }} />
                </div>
                <ImageUploader img={{ ...lt.image, _newFile: lt._newFile }} onChange={(v) => {
                  const a = [...form.leadershipTeam]
                  if (v._newFile) a[idx]._newFile = v._newFile
                  else a[idx].image = { ...a[idx].image, ...v }
                  setForm((p) => ({ ...p, leadershipTeam: a }))
                }} />
              </div>
            </div>
          ))}
        </div>
      </SectionWrapper>

      <SectionWrapper title="6. Global Stats Mapping">
        <button type="button" className="btn-secondary btn-sm mb-4" onClick={() => setForm((p) => ({ ...p, stats: [...p.stats, { label: '', value: '', icon: '' }] }))}>
          <Plus className="w-4" /> Add Stat Array
        </button>
        <div className="grid grid-cols-1 gap-2">
          {form.stats.map((st, idx) => (
            <div key={idx} className="flex flex-col gap-2 rounded border border-surface-border bg-surface-hover p-2 sm:flex-row sm:items-center">
              <input className="input sm:w-1/3" placeholder="Label" value={st.label} onChange={(e) => {
                const a = [...form.stats]
                a[idx].label = e.target.value
                setForm((p) => ({ ...p, stats: a }))
              }} />
              <input className="input sm:w-1/3" placeholder="Value" value={st.value} onChange={(e) => {
                const a = [...form.stats]
                a[idx].value = e.target.value
                setForm((p) => ({ ...p, stats: a }))
              }} />
              <input className="input flex-1" placeholder="Icon string" value={st.icon} onChange={(e) => {
                const a = [...form.stats]
                a[idx].icon = e.target.value
                setForm((p) => ({ ...p, stats: a }))
              }} />
              <button type="button" className="mx-2 text-danger-500 hover:text-danger-400" onClick={() => setForm((p) => ({ ...p, stats: p.stats.filter((_, i) => i !== idx) }))}>
                <Trash className="w-4" />
              </button>
            </div>
          ))}
        </div>
      </SectionWrapper>

      <SectionWrapper title="7. Banner & Gallery Array Engine">
        <div className="space-y-6">
          <div>
            <div className="mb-2 flex items-end justify-between">
              <label className="label mb-0 text-brand-400">Marketing Banner Images</label>
              <button type="button" className="btn-secondary btn-sm" onClick={() => setForm((p) => ({ ...p, bannerImages: [...p.bannerImages, { ...emptyImage, _newFile: null }] }))}>
                <Plus className="w-3" /> Insert
              </button>
            </div>
            <div className="space-y-2">
              {form.bannerImages.map((img, idx) => (
                <div key={idx} className="relative rounded border border-surface-border bg-surface-card p-2 pr-10">
                  <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 text-danger-500" onClick={() => setForm((p) => ({ ...p, bannerImages: p.bannerImages.filter((_, i) => i !== idx) }))}>
                    <Trash className="w-4" />
                  </button>
                  <ImageUploader img={img} onChange={(v) => {
                    const a = [...form.bannerImages]
                    if (v._newFile) a[idx]._newFile = v._newFile
                    else a[idx] = { ...a[idx], ...v }
                    setForm((p) => ({ ...p, bannerImages: a }))
                  }} />
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-surface-border pt-4">
            <div className="mb-2 flex items-end justify-between">
              <label className="label mb-0 text-warning-500">Grid Gallery Engine</label>
              <button type="button" className="btn-secondary btn-sm" onClick={() => setForm((p) => ({ ...p, galleryImages: [...p.galleryImages, { ...emptyImage, _newFile: null }] }))}>
                <Plus className="w-3" /> Insert
              </button>
            </div>
            <div className="space-y-2">
              {form.galleryImages.map((img, idx) => (
                <div key={idx} className="relative rounded border border-surface-border bg-surface-card p-2 pr-10">
                  <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 text-danger-500" onClick={() => setForm((p) => ({ ...p, galleryImages: p.galleryImages.filter((_, i) => i !== idx) }))}>
                    <Trash className="w-4" />
                  </button>
                  <ImageUploader img={img} onChange={(v) => {
                    const a = [...form.galleryImages]
                    if (v._newFile) a[idx]._newFile = v._newFile
                    else a[idx] = { ...a[idx], ...v }
                    setForm((p) => ({ ...p, galleryImages: a }))
                  }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </SectionWrapper>

      <div className="flex justify-end border-t border-surface-border pt-4">
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? <Spinner size="sm" /> : submitLabel}
        </button>
      </div>
    </form>
  )
}

export default AboutUsForm
