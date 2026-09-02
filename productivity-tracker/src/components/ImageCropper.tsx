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
 <div className="bg-brand-dark rounded-xl w-full max-w-2xl overflow-hidden flex flex-col h-[80vh] shadow-neo-input">
 <div className="p-4 border-b flex justify-between items-center">
 <h3 className="font-semibold text-lg">Adjust Cover Image</h3>
 <button onClick={onCancel} className="text-brand-light/50 hover:text-brand-light border-2 border-brand-900 shadow-neo active:translate-x-[2px] active:translate-y-[2px] active:shadow-neo-sm font-bold ">Cancel</button>
 </div>
 <div className="relative flex-1 bg-black">
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
 <div className="p-4 border-t bg-brand-darker flex items-center justify-between shadow-neo-input">
 <input
 type="range"
 value={zoom}
 min={1}
 max={3}
 step={0.1}
 aria-labelledby="Zoom"
 onChange={(e) => setZoom(Number(e.target.value))}
 className="w-48 border-2 border-brand-900 shadow-neo-input "
 />
 <button onClick={generateCroppedImage} className="px-6 py-2 bg-brand-700 text-white rounded-lg font-medium hover:bg-brand-500 border-2 border-brand-900 shadow-neo active:translate-x-[2px] active:translate-y-[2px] active:shadow-neo-sm font-bold "
 >
 Apply Crop
 </button>
 </div>
 </div>
 </div>
 )
}

