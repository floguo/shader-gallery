'use client'

import dynamic from 'next/dynamic'

const ShaderGallery = dynamic(() => import('./shader-gallery'), {
  ssr: false,
  loading: () => <div>Loading shader gallery...</div>
})

export default function ShaderGalleryWrapper() {
  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <ShaderGallery />
    </div>
  )
} 