import React from 'react'
import { Spinner } from '../components/ui'

const Loader: React.FC = () => (
  <div className="flex min-h-[60vh] items-center justify-center">
    <Spinner size="lg" />
  </div>
)

export default Loader
