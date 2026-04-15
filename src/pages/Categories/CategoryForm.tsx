import React from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

const schema = z.object({
  name: z.string().min(1, 'Name required'),
  slug: z.string().optional(),
  parentId: z.string().nullable().optional(),
  sortOrder: z.coerce.number().default(1),
  isActive: z.boolean().default(true),
})

type CategoryFormData = z.infer<typeof schema>

const CategoryForm: React.FC<{
  defaultValues?: Partial<CategoryFormData>
  onSubmit: (data: CategoryFormData) => void
  saving: boolean
}> = ({ defaultValues, onSubmit, saving }) => {
  const { register, handleSubmit, formState: { errors } } = useForm<CategoryFormData>({
    resolver: zodResolver(schema),
    defaultValues: { sortOrder: 1, isActive: true, ...defaultValues },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label className="mb-2 block text-sm font-medium text-text-primary">Category Name *</label>
        <input
          {...register('name')}
          placeholder="e.g. Hill Stations"
          className={`w-full rounded-2xl border border-surface-border bg-surface-card/90 px-4 py-3 text-sm text-text-primary outline-none transition focus:border-brand-400 focus:ring-1 focus:ring-brand-400/30 ${errors.name ? 'border-red-400 focus:ring-red-400/30' : ''}`}
        />
        {errors.name && <p className="mt-2 text-xs text-danger-500">{errors.name.message}</p>}
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-text-primary">Slug (auto-generated if blank)</label>
        <input
          {...register('slug')}
          placeholder="hill-stations"
          className="w-full rounded-2xl border border-surface-border bg-surface-card/90 px-4 py-3 text-sm text-text-primary outline-none transition focus:border-brand-400 focus:ring-1 focus:ring-brand-400/30"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-text-primary">Sort Order</label>
          <input
            type="number"
            {...register('sortOrder')}
            className="w-full rounded-2xl border border-surface-border bg-surface-card/90 px-4 py-3 text-sm text-text-primary outline-none transition focus:border-brand-400 focus:ring-1 focus:ring-brand-400/30"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-text-primary">Status</label>
          <select
            {...register('isActive', { setValueAs: (v) => v === 'true' || v === true })}
            className="w-full rounded-2xl border border-surface-border bg-surface-card/90 px-4 py-3 text-sm text-text-primary outline-none transition focus:border-brand-400 focus:ring-1 focus:ring-brand-400/30"
          >
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center justify-center rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Save Category'}
        </button>
      </div>
    </form>
  )
}

export type { CategoryFormData }
export default CategoryForm
