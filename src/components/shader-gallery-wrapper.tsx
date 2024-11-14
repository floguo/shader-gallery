'use client'

import dynamic from 'next/dynamic'

const ShaderGallery = dynamic(() => import('@/components/shader-gallery'), {
  ssr: false,
  loading: () => <div>Loading...</div>
})

export default function ShaderGalleryWrapper() {
  return <ShaderGallery />
} 