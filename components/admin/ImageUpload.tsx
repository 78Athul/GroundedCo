'use client'

import { useState, useCallback } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'

interface ImageUploadProps {
  currentUrl?: string
  onUpload: (url: string) => void
  folder?: string
}

export default function ImageUpload({ currentUrl, onUpload, folder = 'products' }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState(currentUrl || '')
  const [dragOver, setDragOver] = useState(false)

  const uploadFile = useCallback(async (file: File) => {
    setUploading(true)
    try {
      const supabase = createClient()
      const ext = file.name.split('.').pop()
      const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

      const { error } = await supabase.storage
        .from('product-images')
        .upload(fileName, file, { upsert: true })

      if (error) throw error

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName)

      setPreview(publicUrl)
      onUpload(publicUrl)
    } catch (err) {
      console.error('Upload failed:', err)
      alert('Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }, [folder, onUpload])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) uploadFile(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) uploadFile(file)
  }

  return (
    <div
      className={`relative border-2 border-dashed rounded-2xl overflow-hidden transition-colors duration-200 ${
        dragOver ? 'border-sage bg-sage/10' : 'border-forest/20 hover:border-sage/50'
      }`}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
    >
      {preview ? (
        <div className="relative aspect-[4/3]">
          <Image
            src={preview}
            alt="Product preview"
            fill
            className="object-cover"
            sizes="300px"
          />
          <div className="absolute inset-0 bg-forest/60 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
            <label className="cursor-pointer font-sans font-bold text-cream text-xs tracking-[0.2em] uppercase bg-cream/20 backdrop-blur-sm px-6 py-3 rounded-xl hover:bg-cream/30 transition-colors">
              Replace
              <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            </label>
          </div>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center cursor-pointer aspect-[4/3] p-8">
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-2 border-sage/30 border-t-sage rounded-full animate-spin" />
              <span className="font-sans text-forest/50 text-xs tracking-wide">Uploading…</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-center">
              <span className="text-3xl text-forest/30">+</span>
              <span className="font-sans font-bold text-forest/50 text-xs tracking-[0.15em] uppercase">
                Drop image or click
              </span>
              <span className="font-sans text-forest/30 text-xs">PNG, JPG up to 5MB</span>
            </div>
          )}
          <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
        </label>
      )}
    </div>
  )
}
