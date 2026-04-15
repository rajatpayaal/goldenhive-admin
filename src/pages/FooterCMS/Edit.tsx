import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { PageHeader, Spinner } from '../../components/ui'
import FooterForm, { FooterFormData } from './FooterForm'
import { getFooterById, updateFooter } from './service'
import { fetchCategories, fetchPackages } from '../../services/api.service'

const EditFooterCMSPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [item, setItem] = useState<any>(null)
  const [categories, setCategories] = useState<any[]>([])
  const [packages, setPackages] = useState<any[]>([])

  useEffect(() => {
    Promise.all([fetchCategories(), fetchPackages({ limit: 500 })])
      .then(([catRes, pkgRes]) => {
        const catData = catRes.data?.data || catRes.data
        const pkgData = pkgRes.data?.data || pkgRes.data
        setCategories(catData?.items || catData || [])
        setPackages(pkgData?.items || pkgData || [])
      })
      .catch(() => toast.error('Failed to load categories/packages'))
  }, [])

  useEffect(() => {
    if (!id) return
    setLoading(true)
    getFooterById(id)
      .then((res) => {
        const payload = res.data?.data || res.data
        setItem(payload)
      })
      .catch((err: any) => {
        toast.error(err.response?.data?.message || 'Failed to load footer')
        navigate('/footer')
      })
      .finally(() => setLoading(false))
  }, [id, navigate])

  const defaultValues = useMemo<Partial<FooterFormData>>(() => {
    if (!item) return {}
    return {
      languageCode: item.languageCode || 'en',
      regionCode: item.regionCode || 'GLOBAL',
      isActive: Boolean(item.isActive ?? true),
      visibility: {
        seoLinkTabs: Boolean(item.visibility?.seoLinkTabs ?? true),
        footerColumns: Boolean(item.visibility?.footerColumns ?? true),
        branding: Boolean(item.visibility?.branding ?? true),
        qrCode: Boolean(item.visibility?.qrCode ?? true),
      },
      branding: {
        description: item.branding?.description || item.brandingText || '',
        copyrightText: item.branding?.copyrightText || '',
        isActive: Boolean(item.branding?.isActive ?? true),
        _logoUrl: item.branding?.logoUrl || '',
      },
      qrCode: {
        title: item.qrCode?.title || '',
        subtitle: item.qrCode?.subtitle || '',
        link: item.qrCode?.link || '',
        isActive: Boolean(item.qrCode?.isActive ?? true),
        _imageUrl: item.qrCode?.imageUrl || '',
      },
      footerColumns: (item.footerColumns || []).map((col: any) => ({
        title: col.title || '',
        isActive: Boolean(col.isActive ?? true),
        items: (col.items || []).map((itm: any) => ({
          label: itm.label || '',
          url: itm.url || itm.slug || '',
          icon: itm.icon || '',
          textColor: itm.textColor || '',
          isExternal: Boolean(itm.isExternal ?? false),
          isActive: Boolean(itm.isActive ?? true),
        })),
      })),
      seoLinkTabs: (item.seoLinkTabs || []).map((tab: any) => ({
        categoryId: tab.categoryId?._id || tab.categoryId || '',
        packageIds: (tab.packageIds || []).map((p: any) => p?._id || p),
        isActive: Boolean(tab.isActive ?? true),
      })),
    }
  }, [item])

  const onSubmit = async (payload: FormData) => {
    if (!id) return
    const languageCode = String(payload.get('languageCode') || '').trim()
    const regionCode = String(payload.get('regionCode') || '').trim()

    if (!languageCode || !regionCode) {
      toast.error('Language and region are required')
      return
    }

    setSaving(true)
    try {
      await updateFooter(id, payload)
      toast.success('Footer updated')
      navigate('/footer')
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.response?.data?.error || 'Failed to save footer')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <PageHeader
          title="Edit Configuration"
          subtitle="Loading footer profile..."
          breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Footer CMS', href: '/footer' }, { label: 'Edit' }]}
        />
        <div className="rounded-3xl border border-surface-border bg-surface-card p-8 text-center shadow-sm">
          <Spinner size="lg" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        title="Edit Configuration"
        subtitle="Update locale, links, and branding blocks"
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Footer CMS', href: '/footer' }, { label: 'Edit' }]}
      />
      <div className="rounded-3xl border border-surface-border bg-surface-card p-4 shadow-sm">
        <FooterForm
          defaultValues={defaultValues}
          categories={categories}
          packages={packages}
          saving={saving}
          submitLabel="Save Profile"
          onSubmit={onSubmit}
        />
      </div>
    </div>
  )
}

export default EditFooterCMSPage
