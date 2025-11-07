'use client'

import React, { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { X, Upload, Star, GripVertical, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface ImageItem {
  id: string
  url: string
  isPrimary: boolean
}

interface ImageManagerProps {
  images: ImageItem[]
  onImagesChange: (images: ImageItem[]) => void
  displayType: 'carousel' | 'static'
  onDisplayTypeChange: (type: 'carousel' | 'static') => void
}

export default function ImageManager({
  images,
  onImagesChange,
  displayType,
  onDisplayTypeChange
}: ImageManagerProps) {
  const [imageUrl, setImageUrl] = useState('')
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleAddImage = () => {
    if (!imageUrl.trim()) return

    const newImage: ImageItem = {
      id: `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      url: imageUrl.trim(),
      isPrimary: images.length === 0 // First image is primary by default
    }

    onImagesChange([...images, newImage])
    setImageUrl('')
  }

  const handleRemoveImage = (id: string) => {
    const updatedImages = images.filter(img => img.id !== id)
    // If we removed the primary image, make the first one primary
    if (images.find(img => img.id === id)?.isPrimary && updatedImages.length > 0) {
      updatedImages[0].isPrimary = true
    }
    onImagesChange(updatedImages)
  }

  const handleSetPrimary = (id: string) => {
    const updatedImages = images.map(img => ({
      ...img,
      isPrimary: img.id === id
    }))
    onImagesChange(updatedImages)
  }

  const handleMoveImage = (fromIndex: number, toIndex: number) => {
    const updatedImages = [...images]
    const [moved] = updatedImages.splice(fromIndex, 1)
    updatedImages.splice(toIndex, 0, moved)
    onImagesChange(updatedImages)
  }

  // Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index)
    setIsDragging(true)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/html', index.toString())
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverIndex(index)
  }

  const handleDragLeave = () => {
    setDragOverIndex(null)
  }

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    if (draggedIndex !== null && draggedIndex !== dropIndex) {
      handleMoveImage(draggedIndex, dropIndex)
    }
    setDraggedIndex(null)
    setDragOverIndex(null)
    setIsDragging(false)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
    setDragOverIndex(null)
    setIsDragging(false)
  }

  // File Upload Handlers
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    Array.from(files).forEach((file) => {
      if (file.type.startsWith('image/')) {
        // Create a data URL for the image
        const reader = new FileReader()
        reader.onloadend = () => {
          const dataUrl = reader.result as string
          const newImage: ImageItem = {
            id: `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            url: dataUrl,
            isPrimary: images.length === 0
          }
          onImagesChange([...images, newImage])
        }
        reader.readAsDataURL(file)
      }
    })

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleDropFiles = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    const files = e.dataTransfer.files
    if (!files || files.length === 0) return

    Array.from(files).forEach((file) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onloadend = () => {
          const dataUrl = reader.result as string
          const newImage: ImageItem = {
            id: `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            url: dataUrl,
            isPrimary: images.length === 0
          }
          onImagesChange([...images, newImage])
        }
        reader.readAsDataURL(file)
      }
    })
  }

  const handleDragOverFiles = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  return (
    <div className="space-y-4">
      {/* Display Type Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Display Type
        </label>
        <div className="flex gap-2">
          <Button
            variant={displayType === 'carousel' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => onDisplayTypeChange('carousel')}
            className="flex-1"
          >
            <ImageIcon size={16} className="mr-2" />
            Carousel
          </Button>
          <Button
            variant={displayType === 'static' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => onDisplayTypeChange('static')}
            className="flex-1"
          >
            <ImageIcon size={16} className="mr-2" />
            Static Grid
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {displayType === 'carousel' 
            ? 'Images will be shown in a carousel slider' 
            : 'Images will be displayed in a static grid'}
        </p>
      </div>

      {/* Add Image Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Add Images
        </label>
        
        {/* Drag and Drop Zone */}
        <div
          onDrop={handleDropFiles}
          onDragOver={handleDragOverFiles}
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-400 transition-colors mb-3"
        >
          <Upload size={32} className="mx-auto text-gray-400 mb-2" />
          <p className="text-sm text-gray-600 mb-1">
            Drag and drop images here, or
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="mt-2"
          >
            <Upload size={16} className="mr-2" />
            Browse Files
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        {/* URL Input */}
        <div className="flex gap-2">
          <input
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleAddImage()
              }
            }}
            placeholder="Or paste image URL here"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <Button variant="outline" onClick={handleAddImage} disabled={!imageUrl.trim()}>
            <Upload size={16} className="mr-2" />
            Add URL
          </Button>
        </div>
      </div>

      {/* Images List */}
      {images.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-gray-700">
            Images ({images.length})
          </p>
          <div className="space-y-2">
            {images.map((image, index) => (
              <motion.div
                key={image.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ 
                  opacity: draggedIndex === index ? 0.5 : 1,
                  y: 0,
                  scale: dragOverIndex === index ? 1.02 : 1
                }}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, index)}
                onDragEnd={handleDragEnd}
                className={`flex items-center gap-3 p-3 border rounded-lg transition-all bg-white ${
                  dragOverIndex === index
                    ? 'border-primary-500 border-2 shadow-md'
                    : draggedIndex === index
                    ? 'border-gray-300 opacity-50'
                    : 'border-gray-200 hover:border-primary-300'
                } ${isDragging ? 'cursor-move' : ''}`}
              >
                {/* Drag Handle */}
                <div className="cursor-move text-gray-400 hover:text-gray-600">
                  <GripVertical size={20} />
                </div>

                {/* Image Preview */}
                <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
                  <img
                    src={image.url}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none'
                    }}
                  />
                  {image.isPrimary && (
                    <div className="absolute top-1 right-1 bg-primary-600 rounded-full p-1">
                      <Star size={12} className="text-white fill-current" />
                    </div>
                  )}
                </div>

                {/* Image Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {image.isPrimary ? 'Primary Image' : `Image ${index + 1}`}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{image.url}</p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {!image.isPrimary && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSetPrimary(image.id)}
                      title="Set as primary"
                    >
                      <Star size={14} />
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemoveImage(image.id)}
                    className="text-red-600 hover:text-red-700 hover:border-red-300"
                    title="Remove image"
                  >
                    <X size={14} />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {images.length === 0 && (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <ImageIcon size={48} className="mx-auto text-gray-400 mb-3" />
          <p className="text-sm text-gray-600">No images added yet</p>
          <p className="text-xs text-gray-500 mt-1">Add image URLs to display them</p>
        </div>
      )}
    </div>
  )
}

