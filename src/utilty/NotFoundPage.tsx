import React from 'react'
import { Link } from 'react-router-dom'

const NotFoundPage: React.FC = () => {
  return (
    <div className="page">
      <div className="card mx-auto mt-10 max-w-xl p-8 text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">404</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-100">Page not found</h1>
        <p className="mt-2 text-sm text-slate-400">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link to="/" className="btn-primary mt-6 inline-flex">
          Go to dashboard
        </Link>
      </div>
    </div>
  )
}

export default NotFoundPage
