import React, { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, Upload, Trash, ChevronDown, ChevronUp } from 'lucide-react'
import toast from 'react-hot-toast'
import DataTable from '../components/ui/DataTable'
import Modal from '../components/ui/Modal'
import { ConfirmDialog, PageHeader, Toggle, Spinner } from '../components/ui'
import { listAboutUs, createAboutUs, updateAboutUs, deleteAboutUs } from '../services/adminPanel.service'

type ImageObj = { url: string; altText: string; caption: string }

type CoreValue = { title: string; description: string; iconImage: ImageObj; _newFile?: File | null; _isExp?: boolean }
type Stat = { label: string; value: string; icon: string }
type Leader = { name: string; designation: string; bio: string; linkedinUrl: string; twitterUrl: string; image: ImageObj; _newFile?: File | null; _isExp?: boolean }
type DocImage = { url: string; altText: string; caption: string; _newFile?: File | null }

type AboutUsForm = {
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

const defaultForm: AboutUsForm = {
  heroTitle: '', heroSubtitle: '', heroImage: { ...emptyImage },
  missionStatement: '', visionStatement: '',
  ourStoryHeading: '', ourStoryContent: '',
  bannerImages: [], storyImages: [], galleryImages: [],
  coreValues: [], stats: [], leadershipTeam: [],
  visibility: {
    heroSection: true, bannerSection: true, missionVision: true,
    coreValues: true, ourStory: true, gallery: true, stats: true, leadershipTeam: true
  }
}

const SectionWrapper: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-surface-border bg-surface-card rounded-xl overflow-hidden mt-4">
      <div className="p-4 flex justify-between items-center cursor-pointer hover:bg-surface-border" onClick={() => setOpen(!open)}>
        <h3 className="text-sm font-bold text-text-secondary tracking-wider uppercase">{title}</h3>
        {open ? <ChevronUp className="w-5 h-5 text-text-tertiary" /> : <ChevronDown className="w-5 h-5 text-text-tertiary" />}
      </div>
      {open && <div className="p-4 border-t border-surface-border space-y-4">{children}</div>}
    </div>
  )
}

const AboutUsPage: React.FC = () => {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState<AboutUsForm>(defaultForm)
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const load = () => {
    setLoading(true)
    listAboutUs().then(r => setItems(r.data?.data || r.data || [])).finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const openCreate = () => {
    if (items.length > 0) {
      toast.error('About Us document already exists. Only one singleton is allowed. Edit the existing one.')
      return
    }
    setEditing(null); setForm(defaultForm); setModalOpen(true)
  }

  const openEdit = (item: any) => {
    setEditing(item)
    setForm({
      heroTitle: item.heroTitle || '', heroSubtitle: item.heroSubtitle || '',
      heroImage: item.heroImage || { ...emptyImage },
      missionStatement: item.missionStatement || '', visionStatement: item.visionStatement || '',
      ourStoryHeading: item.ourStoryHeading || '', ourStoryContent: item.ourStoryContent || '',
      bannerImages: (item.bannerImages || []).map((x: any) => ({ ...x })),
      storyImages: (item.storyImages || []).map((x: any) => ({ ...x })),
      galleryImages: (item.galleryImages || []).map((x: any) => ({ ...x })),
      coreValues: (item.coreValues || []).map((x: any) => ({ ...x, _isExp: false })),
      stats: (item.stats || []).map((x: any) => ({ ...x })),
      leadershipTeam: (item.leadershipTeam || []).map((x: any) => ({ ...x, _isExp: false })),
      visibility: {
        heroSection: item.visibility?.heroSection ?? true,
        bannerSection: item.visibility?.bannerSection ?? true,
        missionVision: item.visibility?.missionVision ?? true,
        coreValues: item.visibility?.coreValues ?? true,
        ourStory: item.visibility?.ourStory ?? true,
        gallery: item.visibility?.gallery ?? true,
        stats: item.visibility?.stats ?? true,
        leadershipTeam: item.visibility?.leadershipTeam ?? true,
      }
    })
    setModalOpen(true)
  }

  // To solve multer's array indexing desync: Create dummy padding files for untouched indexes.
  const createDummyFile = () => new File([""], "empty.txt", { type: "text/plain" })

  const save = async () => {
    setSaving(true)
    try {
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

      const addImageArray = (collection: DocImage[], metaKey: string, fileKey: string) => {
        fd.append(metaKey, JSON.stringify(collection.map(x => ({ url: x.url, altText: x.altText, caption: x.caption }))))
        collection.forEach(x => fd.append(fileKey, x._newFile || createDummyFile()))
      }

      addImageArray(form.bannerImages, 'bannerImagesMeta', 'bannerImages')
      addImageArray(form.storyImages, 'storyImagesMeta', 'storyImages')
      addImageArray(form.galleryImages, 'galleryImagesMeta', 'galleryImages')

      fd.append('coreValues', JSON.stringify(form.coreValues.map(x => ({ title: x.title, description: x.description, iconImage: { url: x.iconImage.url, altText: x.iconImage.altText, caption: x.iconImage.caption } }))))
      form.coreValues.forEach(x => fd.append('coreValueIconImages', x._newFile || createDummyFile()))

      fd.append('leadershipTeam', JSON.stringify(form.leadershipTeam.map(x => ({ name: x.name, designation: x.designation, bio: x.bio, linkedinUrl: x.linkedinUrl, twitterUrl: x.twitterUrl, image: { url: x.image.url, altText: x.image.altText, caption: x.image.caption } }))))
      form.leadershipTeam.forEach(x => fd.append('leadershipImages', x._newFile || createDummyFile()))

      fd.append('visibilityHeroSection', String(form.visibility.heroSection))
      fd.append('visibilityBannerSection', String(form.visibility.bannerSection))
      fd.append('visibilityMissionVision', String(form.visibility.missionVision))
      fd.append('visibilityCoreValues', String(form.visibility.coreValues))
      fd.append('visibilityOurStory', String(form.visibility.ourStory))
      fd.append('visibilityGallery', String(form.visibility.gallery))
      fd.append('visibilityStats', String(form.visibility.stats))
      fd.append('visibilityLeadershipTeam', String(form.visibility.leadershipTeam))

      if (editing?._id) await updateAboutUs(editing._id, fd)
      else await createAboutUs(fd)

      toast.success('About Us data committed')
      setModalOpen(false); load()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save')
    } finally { setSaving(false) }
  }

  const remove = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      await deleteAboutUs(deleteId)
      toast.success('Document deleted')
      setDeleteId(null); load()
    } catch { toast.error('Failed to delete') }
    finally { setDeleting(false) }
  }

  const ImageUploader = ({ img, onChange }: { img: DocImage | ImageObj & { _newFile?: File | null }; onChange: (v: any) => void }) => (
    <div className="flex gap-4 items-start">
      <label className="cursor-pointer border border-surface-border rounded bg-surface-card p-1 w-24 h-24 flex items-center justify-center relative overflow-hidden shrink-0">
        {img._newFile ? <img src={URL.createObjectURL(img._newFile)} className="w-full h-full object-cover" /> :
         img.url ? <img src={img.url} className="w-full h-full object-cover" /> :
         <Upload className="w-6 h-6 text-text-tertiary" />}
        <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && onChange({ _newFile: e.target.files[0] })} />
      </label>
      <div className="flex-1 space-y-2">
        <input className="input text-xs" placeholder="Alt Text" value={img.altText || ''} onChange={e => onChange({ altText: e.target.value })} />
        <input className="input text-xs" placeholder="Caption" value={img.caption || ''} onChange={e => onChange({ caption: e.target.value })} />
      </div>
    </div>
  )

  const columns = [
    { header: 'Hero Title', render: (r: any) => <span className="font-bold text-text-secondary">{r.heroTitle}</span> },
    { header: 'Mission Length', render: (r: any) => <span className="text-text-tertiary">{(r.missionStatement || '').length} chars</span> },
    { header: 'Config Nodes', render: (r: any) => (
      <div className="text-xs text-brand-400">
        {r.coreValues?.length || 0} Values, {r.leadershipTeam?.length || 0} Leaders, {r.stats?.length || 0} Stats
      </div>
    )},
    { header: 'Actions', render: (r: any) => (
      <div className="flex gap-2">
        <button className="btn-secondary btn-sm" onClick={() => openEdit(r)}><Pencil className="w-3.5 h-3.5" /></button>
        <button className="btn-danger btn-sm" onClick={() => setDeleteId(r._id)}><Trash2 className="w-3.5 h-3.5" /></button>
      </div>
    )}
  ]

  return (
    <div className="page">
      <PageHeader title="About Us CMS" subtitle="Complete schema builder for the About Us application component" breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'About Us' }]} />
      
      {items.length === 0 && (
        <div className="mb-4">
          <button className="btn-primary" onClick={openCreate}><Plus className="w-4 h-4" /> Instantiate Master Document</button>
        </div>
      )}

      <DataTable columns={columns} data={items} loading={loading} keyExtractor={(r: any) => r._id} emptyMessage="No About Us record found in registry." />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="About Us Blueprint Array" size="full" footer={
        <>
          <button className="btn-secondary" onClick={() => setModalOpen(false)}>Close</button>
          <button className="btn-primary" disabled={saving} onClick={save}>{saving ? <Spinner size="sm" /> : 'Serialize Logic to Backend'}</button>
        </>
      }>
        <div className="max-h-[75vh] overflow-y-auto pr-3 space-y-4">

          {/* Visibility Matrix */}
          <div className="p-4 border border-surface-border rounded-xl bg-surface-card">
            <h3 className="text-xs font-bold text-text-tertiary mb-3 border-b border-surface-border pb-2">Component Rendering Visibility</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.keys(form.visibility).map(key => (
                <label key={key} className="flex items-center gap-2 cursor-pointer">
                  <Toggle checked={(form.visibility as any)[key]} onChange={v => setForm(p => ({ ...p, visibility: { ...p.visibility, [key]: v } }))} />
                  <span className="text-xs uppercase tracking-wider text-text-secondary">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                </label>
              ))}
            </div>
          </div>

          <SectionWrapper title="1. Hero Banner">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                 <label className="label">Hero Title Overlay</label>
                 <input className="input" value={form.heroTitle} onChange={e => setForm(p => ({ ...p, heroTitle: e.target.value }))} />
              </div>
              <div>
                 <label className="label">Hero Subtitle</label>
                 <input className="input" value={form.heroSubtitle} onChange={e => setForm(p => ({ ...p, heroSubtitle: e.target.value }))} />
              </div>
              <div className="md:col-span-2">
                 <label className="label">Hero Primary Background</label>
                 <ImageUploader img={{ ...form.heroImage, _newFile: form._heroNewFile }} onChange={(v) => {
                    if (v._newFile) setForm(p => ({ ...p, _heroNewFile: v._newFile }))
                    else setForm(p => ({ ...p, heroImage: { ...p.heroImage, ...v } }))
                 }} />
              </div>
            </div>
          </SectionWrapper>

          <SectionWrapper title="2. Mission & Vision Directives">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                   <label className="label">Mission Statement Block</label>
                   <textarea className="input h-32 resize-none" value={form.missionStatement} onChange={e => setForm(p => ({ ...p, missionStatement: e.target.value }))} />
                </div>
                <div>
                   <label className="label">Vision Statement Block</label>
                   <textarea className="input h-32 resize-none" value={form.visionStatement} onChange={e => setForm(p => ({ ...p, visionStatement: e.target.value }))} />
                </div>
             </div>
          </SectionWrapper>

          <SectionWrapper title="3. Value Engine (Core Values)">
             <button className="btn-secondary btn-sm mb-4" onClick={() => setForm(p => ({ ...p, coreValues: [...p.coreValues, { title: '', description: '', iconImage: { ...emptyImage }, _isExp: true }] }))}><Plus className="w-4" /> Add Value Index</button>
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
               {form.coreValues.map((cv, idx) => (
                 <div key={idx} className="border border-surface-border bg-surface-card rounded p-4 relative">
                   <button className="absolute top-2 right-2 text-danger-500 hover:text-danger-400" onClick={() => setForm(p => ({ ...p, coreValues: p.coreValues.filter((_, i) => i !== idx) }))}><Trash className="w-4 h-4" /></button>
                   <div className="space-y-3 pr-6">
                      <input className="input text-sm font-bold" placeholder="Value Title" value={cv.title} onChange={e => { const arr = [...form.coreValues]; arr[idx].title = e.target.value; setForm(p => ({ ...p, coreValues: arr })) }} />
                      <textarea className="input text-xs h-16 resize-none" placeholder="Description" value={cv.description} onChange={e => { const arr = [...form.coreValues]; arr[idx].description = e.target.value; setForm(p => ({ ...p, coreValues: arr })) }} />
                      <ImageUploader img={{ ...cv.iconImage, _newFile: cv._newFile }} onChange={(v) => { 
                         const arr = [...form.coreValues]
                         if (v._newFile) arr[idx]._newFile = v._newFile
                         else arr[idx].iconImage = { ...arr[idx].iconImage, ...v }
                         setForm(p => ({ ...p, coreValues: arr }))
                      }} />
                   </div>
                 </div>
               ))}
             </div>
          </SectionWrapper>

          <SectionWrapper title="4. Company Story Narrative">
             <div className="space-y-4">
                <input className="input" placeholder="Our Journey Heading" value={form.ourStoryHeading} onChange={e => setForm(p => ({ ...p, ourStoryHeading: e.target.value }))} />
                <textarea className="input h-32 resize-none" placeholder="Long form content..." value={form.ourStoryContent} onChange={e => setForm(p => ({ ...p, ourStoryContent: e.target.value }))} />
                <div>
                   <div className="flex justify-between items-end mb-2">
                      <label className="label mb-0">Story Context Images Array</label>
                      <button className="btn-secondary btn-sm" onClick={() => setForm(p => ({ ...p, storyImages: [...p.storyImages, { ...emptyImage }] }))}><Plus className="w-3" /> Add Map</button>
                   </div>
                   <div className="space-y-2">
                     {form.storyImages.map((img, idx) => (
                       <div key={idx} className="relative bg-surface-card p-2 rounded border border-surface-border pr-10">
                         <button className="absolute right-2 top-1/2 -translate-y-1/2 text-danger-500 hover:text-danger-400" onClick={() => setForm(p => ({ ...p, storyImages: p.storyImages.filter((_, i) => i !== idx) }))}><Trash className="w-4" /></button>
                         <ImageUploader img={img} onChange={(v) => { const a = [...form.storyImages]; if (v._newFile) a[idx]._newFile = v._newFile; else a[idx] = { ...a[idx], ...v }; setForm(p => ({ ...p, storyImages: a })) }} />
                       </div>
                     ))}
                   </div>
                </div>
             </div>
          </SectionWrapper>

          <SectionWrapper title="5. Leadership Engine">
             <button className="btn-secondary btn-sm mb-4" onClick={() => setForm(p => ({ ...p, leadershipTeam: [...p.leadershipTeam, { name: '', designation: '', bio: '', linkedinUrl: '', twitterUrl: '', image: { ...emptyImage }, _isExp: true }] }))}><Plus className="w-4" /> Add Executive</button>
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
               {form.leadershipTeam.map((lt, idx) => (
                 <div key={idx} className="border border-surface-border bg-surface-card rounded p-4 relative">
                   <button className="absolute top-2 right-2 text-danger-500 hover:text-danger-400" onClick={() => setForm(p => ({ ...p, leadershipTeam: p.leadershipTeam.filter((_, i) => i !== idx) }))}><Trash className="w-4 h-4" /></button>
                   <div className="space-y-3 pr-6">
                      <div className="flex gap-2">
                        <input className="input text-sm" placeholder="Name" value={lt.name} onChange={e => { const a = [...form.leadershipTeam]; a[idx].name = e.target.value; setForm(p => ({ ...p, leadershipTeam: a })) }} />
                        <input className="input text-sm" placeholder="Designation" value={lt.designation} onChange={e => { const a = [...form.leadershipTeam]; a[idx].designation = e.target.value; setForm(p => ({ ...p, leadershipTeam: a })) }} />
                      </div>
                      <textarea className="input text-xs h-16 resize-none" placeholder="Biography Block" value={lt.bio} onChange={e => { const a = [...form.leadershipTeam]; a[idx].bio = e.target.value; setForm(p => ({ ...p, leadershipTeam: a })) }} />
                      <div className="flex gap-2">
                        <input className="input text-xs" placeholder="LinkedIn URL" value={lt.linkedinUrl} onChange={e => { const a = [...form.leadershipTeam]; a[idx].linkedinUrl = e.target.value; setForm(p => ({ ...p, leadershipTeam: a })) }} />
                        <input className="input text-xs" placeholder="Twitter URL" value={lt.twitterUrl} onChange={e => { const a = [...form.leadershipTeam]; a[idx].twitterUrl = e.target.value; setForm(p => ({ ...p, leadershipTeam: a })) }} />
                      </div>
                      <ImageUploader img={{ ...lt.image, _newFile: lt._newFile }} onChange={(v) => { 
                         const a = [...form.leadershipTeam]
                         if (v._newFile) a[idx]._newFile = v._newFile
                         else a[idx].image = { ...a[idx].image, ...v }
                         setForm(p => ({ ...p, leadershipTeam: a }))
                      }} />
                   </div>
                 </div>
               ))}
             </div>
          </SectionWrapper>

          <SectionWrapper title="6. Global Stats Mapping">
             <button className="btn-secondary btn-sm mb-4" onClick={() => setForm(p => ({ ...p, stats: [...p.stats, { label: '', value: '', icon: '' }] }))}><Plus className="w-4" /> Add Stat Array</button>
             <div className="grid grid-cols-1 gap-2">
               {form.stats.map((st, idx) => (
                 <div key={idx} className="flex gap-2 items-center bg-black/40 p-2 rounded border border-white/5">
                    <input className="input w-1/3" placeholder="Label (e.g. Clients)" value={st.label} onChange={e => { const a = [...form.stats]; a[idx].label = e.target.value; setForm(p => ({ ...p, stats: a })) }} />
                    <input className="input w-1/3" placeholder="Value (e.g. 10k+)" value={st.value} onChange={e => { const a = [...form.stats]; a[idx].value = e.target.value; setForm(p => ({ ...p, stats: a })) }} />
                    <input className="input flex-1" placeholder="Icon string" value={st.icon} onChange={e => { const a = [...form.stats]; a[idx].icon = e.target.value; setForm(p => ({ ...p, stats: a })) }} />
                    <button className="text-red-500 hover:text-red-400 mx-2" onClick={() => setForm(p => ({ ...p, stats: p.stats.filter((_, i) => i !== idx) }))}><Trash className="w-4" /></button>
                 </div>
               ))}
             </div>
          </SectionWrapper>

          <SectionWrapper title="7. Banner & Gallery Array Engine">
             <div className="space-y-6">
               <div>
                 <div className="flex justify-between items-end mb-2">
                    <label className="label mb-0 text-brand-400">Marketing Banner Images</label>
                    <button className="btn-secondary btn-sm" onClick={() => setForm(p => ({ ...p, bannerImages: [...p.bannerImages, { ...emptyImage }] }))}><Plus className="w-3" /> Insert</button>
                 </div>
                 <div className="space-y-2">
                   {form.bannerImages.map((img, idx) => (
                     <div key={idx} className="relative bg-surface-card p-2 rounded border border-surface-border pr-10">
                       <button className="absolute right-2 top-1/2 -translate-y-1/2 text-danger-500" onClick={() => setForm(p => ({ ...p, bannerImages: p.bannerImages.filter((_, i) => i !== idx) }))}><Trash className="w-4" /></button>
                       <ImageUploader img={img} onChange={(v) => { const a = [...form.bannerImages]; if (v._newFile) a[idx]._newFile = v._newFile; else a[idx] = { ...a[idx], ...v }; setForm(p => ({ ...p, bannerImages: a })) }} />
                     </div>
                   ))}
                 </div>
               </div>
               
               <div className="border-t border-white/10 pt-4">
                 <div className="flex justify-between items-end mb-2">
                    <label className="label mb-0 text-amber-400">Grid Gallery Engine</label>
                    <button className="btn-secondary btn-sm" onClick={() => setForm(p => ({ ...p, galleryImages: [...p.galleryImages, { ...emptyImage }] }))}><Plus className="w-3" /> Insert</button>
                 </div>
                 <div className="space-y-2">
                   {form.galleryImages.map((img, idx) => (
                     <div key={idx} className="relative bg-surface-card p-2 rounded border border-surface-border pr-10">
                       <button className="absolute right-2 top-1/2 -translate-y-1/2 text-danger-500" onClick={() => setForm(p => ({ ...p, galleryImages: p.galleryImages.filter((_, i) => i !== idx) }))}><Trash className="w-4" /></button>
                       <ImageUploader img={img} onChange={(v) => { const a = [...form.galleryImages]; if (v._newFile) a[idx]._newFile = v._newFile; else a[idx] = { ...a[idx], ...v }; setForm(p => ({ ...p, galleryImages: a })) }} />
                     </div>
                   ))}
                 </div>
               </div>
             </div>
          </SectionWrapper>

        </div>
      </Modal>

      <ConfirmDialog open={Boolean(deleteId)} onCancel={() => setDeleteId(null)} onConfirm={remove} title="Destroy Record" message="Executing this drops all arrays and unmounts the About Us mapping permanently." loading={deleting} />
    </div>
  )
}

export default AboutUsPage
