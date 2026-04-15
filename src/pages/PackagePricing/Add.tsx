import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { PageHeader } from '../../components/ui'
import PackagePricingForm, { PricingFormData } from './PackagePricingForm'
import { createPackagePricing, fetchPackages, fetchVehicles } from './service'

const AddPackagePricingPage: React.FC = () => {
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)
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

  const onSubmit = async (form: PricingFormData) => {
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

      await createPackagePricing(payload)
      toast.success('Pricing created')
      navigate('/package-pricing')
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.response?.data?.error || 'Validation Failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader title="Create Pricing Rule" subtitle="Add a new package pricing rule" breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Package Pricing', href: '/package-pricing' }, { label: 'Create' }]} />
      <div className="rounded-3xl border border-surface-border bg-surface-card p-4 shadow-sm">
        <PackagePricingForm packages={packages} vehicles={vehicles} saving={saving} onSubmit={onSubmit} />
      </div>
    </div>
  )
}

export default AddPackagePricingPage
