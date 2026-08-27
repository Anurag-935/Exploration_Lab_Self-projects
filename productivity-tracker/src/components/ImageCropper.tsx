import { useState, useCallback } from "react"
import Cropper from "react-easy-crop"

type Point = { x: number; y: number }
type Area = { width: number; height: number; x: number; y: number }

type Props = {
  imageSrc: string
  onCropDone: (croppedBlob: Blob) => void
  onCancel: () => void
}

export default function ImageCropper({ imageSrc, onCropDone, onCancel }: Props) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)

  const onCropComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  const generateCroppedImage = async () => {
    if (!croppedAreaPixels) return

    const image = new Image()
    image.src = imageSrc
    await new Promise((resolve) => (image.onload = resolve))

    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = croppedAreaPixels.width
    canvas.height = croppedAreaPixels.height

    ctx.drawImage(
      image,
      croppedAreaPixels.x,
      croppedAreaPixels.y,
      croppedAreaPixels.width,
      croppedAreaPixels.height,
      0,
      0,
      croppedAreaPixels.width,
      croppedAreaPixels.height
    )

    canvas.toBlob((blob) => {
      if (blob) onCropDone(blob)
    }, "image/jpeg", 0.9)
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl overflow-hidden flex flex-col h-[80vh]">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="font-semibold text-lg">Adjust Cover Image</h3>
          <button onClick={onCancel} className="text-gray-500 hover:text-gray-900">Cancel</button>
        </div>
        <div className="relative flex-1 bg-gray-900">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={21 / 9}
            onCropChange={setCrop}
            onCropComplete={onCropComplete}
            onZoomChange={setZoom}
          />
        </div>
        <div className="p-4 border-t bg-gray-50 flex items-center justify-between">
          <input
            type="range"
            value={zoom}
            min={1}
            max={3}
            step={0.1}
            aria-labelledby="Zoom"
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-48"
          />
          <button
            onClick={generateCroppedImage}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
          >
            Apply Crop
          </button>
        </div>
      </div>
    </div>
  )
}
