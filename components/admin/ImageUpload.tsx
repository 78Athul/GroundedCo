'use client'

import { useState, useCallback } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import Cropper, { Area } from 'react-easy-crop'
import getCroppedImg from '@/utils/cropImage'

interface ImageUploadProps {
  currentUrl?: string
  onUpload: (url: string) => void
  folder?: string
  resetAfterUpload?: boolean
  aspect?: number
}

export default function ImageUpload({
  currentUrl,
  onUpload,
  folder = 'products',
  resetAfterUpload = false,
  aspect = 4 / 3,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState(currentUrl || '')
  const [dragOver, setDragOver] = useState(false)

  // Cropper State
  const [loadedFileUrl, setLoadedFileUrl] = useState<string | null>(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)

  const onCropComplete = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setLoadedFileUrl(URL.createObjectURL(file))
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) {
      setLoadedFileUrl(URL.createObjectURL(file))
    }
  }

  const uploadFile = useCallback(async (file: File) => {
    setUploading(true)
    try {
      const supabase = createClient()
      const ext = file.name.split('.').pop() || 'jpeg'
      const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

      const { error } = await supabase.storage
        .from('product-images')
        .upload(fileName, file, { upsert: true, contentType: file.type })

      if (error) throw error

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName)

      if (!resetAfterUpload) {
        setPreview(publicUrl)
      } else {
        setPreview('')
      }
      onUpload(publicUrl)
    } catch (err) {
      console.error('Upload failed:', err)
      alert('Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }, [folder, onUpload, resetAfterUpload])

  const saveCrop = async () => {
    if (!loadedFileUrl || !croppedAreaPixels) return

    try {
      setUploading(true)
      const croppedFile = await getCroppedImg(loadedFileUrl, croppedAreaPixels)
      if (croppedFile) {
        await uploadFile(croppedFile)
      }
    } catch (e) {
      console.error(e)
      alert('Failed to crop image')
      setUploading(false)
    } finally {
      setLoadedFileUrl(null)
    }
  }

  const cancelCrop = () => {
    setLoadedFileUrl(null)
  }

  return (
    <>
      <div
        className={`relative border-2 border-dashed rounded-2xl overflow-hidden transition-colors duration-200 ${
          dragOver ? 'border-sage bg-sage/10' : 'border-forest/20 hover:border-sage/50'
        }`}
        style={{ aspectRatio: aspect }}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        {preview && !uploading ? (
          <div className="absolute inset-0">
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
          <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer p-8">
            {uploading ? (
              <div className="flex flex-col items-center gap-2 relative z-10">
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

      {/* Fullscreen Cropper Modal */}
      {loadedFileUrl && (
        <div className="fixed inset-0 z-[100] bg-deep-obsidian flex flex-col">
          <div className="relative flex-1 w-full bg-black/50">
            <Cropper
              image={loadedFileUrl}
              crop={crop}
              zoom={zoom}
              aspect={aspect}
              onCropChange={setCrop}
              onCropComplete={onCropComplete}
              onZoomChange={setZoom}
            />
          </div>
          <div className="bg-wool-white p-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-6 pb-safe border-t border-deep-obsidian/10">
            <div className="flex items-center gap-4 w-full md:max-w-xs">
              <span className="font-sans text-deep-obsidian/50 text-xs tracking-wider uppercase">Zoom</span>
              <input
                type="range"
                value={zoom}
                min={1}
                max={3}
                step={0.1}
                aria-label="Zoom"
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full accent-forest"
              />
            </div>
            <div className="flex gap-4 w-full md:w-auto">
              <button
                onClick={cancelCrop}
                className="flex-1 md:flex-none font-sans font-bold text-forest/60 text-xs tracking-[0.2em] uppercase px-8 py-4 rounded-xl border border-forest/20 hover:bg-forest/5 hover:border-forest/40 transition-colors"
                disabled={uploading}
              >
                Cancel
              </button>
              <button
                onClick={saveCrop}
                className="flex-1 md:flex-none font-sans font-bold text-cream text-xs tracking-[0.2em] uppercase px-8 py-4 rounded-xl bg-forest hover:bg-sage hover:text-forest transition-colors"
                disabled={uploading}
              >
                {uploading ? 'Processing...' : 'Crop & Upload'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
