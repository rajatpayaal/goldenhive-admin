import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import AboutUsForm from './AboutUsForm'
import { createAboutUs } from './service'

const AddAboutUsPage: React.FC = () => {
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)

  const onSubmit = async (payload: FormData) => {
    setSaving(true)
    try {
      await createAboutUs(payload)
      toast.success('About Us data committed')
      navigate('/about-us')
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <AboutUsForm saving={saving} submitLabel="Save Changes" onSubmit={onSubmit} />
    </div>
  )
}

export default AddAboutUsPage
