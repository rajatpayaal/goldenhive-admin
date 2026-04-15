import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { PageHeader, Spinner } from '../../components/ui'
import PackagePricingForm, { PricingFormData } from './PackagePricingForm'
import { fetchPackagePricingById, fetchPackages, fetchVehicles, updatePackagePricing } from './service'

const EditPackagePricingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [item, setItem] = useState<any>(null)
  const [packages, setPackages] = useState<any[]>([])
  const [vehicles, setVehicles] = useState<any[]>([])

  useEffect(() => {
    Promise.all([fetchPackages({ limit: 100 }), fetchVehicles()])
      .then(([resPkg, resVeh]) => {
        setPackages(resPkg.data?.data?.items || resPkg.data?.items || resPkg.data?.data || resPkg.data || [])
        setVehicles(resVeh.data?.data?.items || resVeh.data?.items || resVeh.data?.data || resVeh.data || [])
      })
      .catch(() => toast.error('Failed to load packages/vehicles'))
  }, [])

  useEffect(() => {
    if (!id) return
    setLoading(true)
    fetchPackagePricingById(id)
      .then((res) => {
        const payload = res.data?.data || res.data
        setItem(payload)
      })
      .catch(() => {
        toast.error('Failed to load pricing')
        navigate('/package-pricing')
      })
      .finally(() => setLoading(false))
  }, [id, navigate])

  const defaultValues = useMemo<Partial<PricingFormData>>(
    () => ({
      packageId: typeof item?.packageId === 'object' ? item?.packageId?._id || '' : item?.packageId || '',
      vehicleId: typeof item?.vehicleId === 'object' ? item?.vehicleId?._id || '' : item?.vehicleId || '',
      pax: item?.pax || 2,
      pricePerPerson: item?.pricePerPerson || 0,
      totalPrice: item?.totalPrice !== undefined ? item.totalPrice : '',
      discountPercent: item?.discountPercent || 0,
      finalPricePerPerson: item?.finalPricePerPerson !== undefined ? item.finalPricePerPerson : '',
      isBestDeal: Boolean(item?.isBestDeal ?? false),
      isActive: Boolean(item?.isActive ?? true),
    }),
    [item]
  )

  const onSubmit = async (form: PricingFormData) => {
    if (!id) return
    if (!form.packageId || !form.vehicleId || !form.pax || !form.pricePerPerson) {
      toast.error('Please fill required fields (Package, Vehicle, Pax, Price Per Person)')
      return
    }

    setSaving(true)
    try {
      const payload: any = {
        packageId: form.packageId,
        vehicleId: form.vehicleId,
        pax: Number(form.pax),
        pricePerPerson: Number(form.pricePerPerson),
        discountPercent: Number(form.discountPercent),
        isBestDeal: form.isBestDeal,
        isActive: form.isActive,
      }
      if (form.totalPrice !== '') payload.totalPrice = Number(form.totalPrice)
      if (form.finalPricePerPerson !== '') payload.finalPricePerPerson = Number(form.finalPricePerPerson)

      await updatePackagePricing(id, payload)
      toast.success('Pricing updated')
      navigate('/package-pricing')
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.response?.data?.error || 'Validation Failed')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <PageHeader title="Edit Pricing Rule" subtitle="Loading pricing details..." breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Package Pricing', href: '/package-pricing' }, { label: 'Edit' }]} />
        <div className="rounded-3xl border border-surface-border bg-surface-card p-8 text-center shadow-sm">
          <Spinner size="lg" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader title="Edit Pricing Rule" subtitle="Update package pricing settings" breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Package Pricing', href: '/package-pricing' }, { label: 'Edit' }]} />
      <div className="rounded-3xl border border-surface-border bg-surface-card p-4 shadow-sm">
        <PackagePricingForm defaultValues={defaultValues} packages={packages} vehicles={vehicles} saving={saving} onSubmit={onSubmit} />
      </div>
    </div>
  )
}

export default EditPackagePricingPage
