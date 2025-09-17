"use client"

import { useState } from "react"
import { Download, X, ImageIcon } from "lucide-react"
import { FlipWords } from "../ui/flip-words/flip-words"
import { ColorPicker } from "../color-picker/colorpicker"

export default function BarcodeGenerator() {
  const words = ["Better", "Fast", "Perfect", "QRCODE"]
  const [value, setValue] = useState("")
  const [angle, setAngle] = useState("0")
  const [narrowBarWidth, setNarrowBarWidth] = useState(20) // Changed to number for slider
  const [foreColor, setForeColor] = useState("#ff550d")
  const [backColor, setBackColor] = useState("#ffffff")
  const [barcodeUrl, setBarcodeUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [decorationImageUrl, setDecorationImageUrl] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0) // Added upload progress
  const [uploading, setUploading] = useState(false) // Added uploading state

  const API_KEY = "arif@audeflow.com_0XUgOpxRN9iqfJFxxYUDWMnHpoP7177lWf7ESbdwV0bIvXQUQgnOwqI4aQGCev5m"

  const mapSliderToApiValue = (sliderValue: number) => {
    return Math.round((sliderValue / 100) * 70)
  }

  const removeUploadedImage = () => {
    setFile(null)
    setDecorationImageUrl(null)
  }

  // Upload image to PDF.co with progress
  const uploadImage = async () => {
    if (!file) return null
    setUploading(true)
    setUploadProgress(0)

    const formData = new FormData()
    formData.append("file", file)

    try {
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 100)

      const res = await fetch("https://api.pdf.co/v1/file/upload", {
        method: "POST",
        headers: { "x-api-key": API_KEY },
        body: formData,
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      const data = await res.json()
      if (data && data.url) {
        setDecorationImageUrl(data.url)
        return data.url
      }
      return null
    } catch (error) {
      console.error("Upload error:", error)
      return null
    } finally {
      setUploading(false)
      setTimeout(() => setUploadProgress(0), 1000)
    }
  }

  // Generate barcode
  const generateBarcode = async () => {
    setLoading(true)
    try {
      let uploadedUrl = decorationImageUrl
      if (file && !uploadedUrl) {
        uploadedUrl = await uploadImage()
      }

      const apiNarrowBarWidth = mapSliderToApiValue(narrowBarWidth)
      console.log(" Slider value:", narrowBarWidth, "API value:", apiNarrowBarWidth)
      console.log("this is value", value)

      const response = await fetch("https://api.pdf.co/v1/barcode/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": API_KEY,
        },
        body: JSON.stringify({
          name: "barcode.png",
          value,
          type: "QRCode",
          inline: true,
          async: false,
          decorationImage: uploadedUrl || undefined,
          profiles: JSON.stringify({
            Angle: Number(angle),
            NarrowBarWidth: 30,
            ForeColor: foreColor,
            BackColor: backColor,
          }),
        }),
      })

      const data = await response.json()
      if (data.url) {
        setBarcodeUrl(data.url)
      }
    } catch (err) {
      console.error("Error:", err)
    } finally {
      setLoading(false)
    }
  }

  const downloadBarcode = async () => {
    if (!barcodeUrl) return

    try {
      const response = await fetch(barcodeUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `barcode-${value || "generated"}.png`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error("Download error:", error)
    }
  }

  return (
    <div className="p-8 max-w-2xl mx-auto bg-white shadow-2xl rounded-3xl space-y-6 border border-gray-100">
      <div className="text-center space-y-2">
        <div className="flex flex-wrap justify-center items-center mx-auto text-neutral-600 text-2xl sm:text-3xl md:text-4xl lg:text-5xl gap-2">
          Generating To
          <div className="w-[120px] sm:w-[150px] md:w-[180px] text-left">
            <FlipWords words={words} />
          </div>
        </div>
        <p className="text-gray-600">Create custom QR codes with logo images</p>
      </div>

      <div className="space-y-6">
        {/* Barcode Value */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">
            Enter your website, text or drop a file here (Your QR Code will be generated automatically)
          </label>
          <textarea
            placeholder="Enter text, URL, or any content to encode..."
            value={value}
            onChange={(e) => setValue(e.target.value)}
            rows={3}
            className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-[#ff550d] focus:outline-none transition-colors resize-none"
          />
        </div>

        {/* Color Picker */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ColorPicker initialColor={foreColor} onChange={setForeColor} label="Foreground Color (QR Code)" />
          <ColorPicker initialColor={backColor} onChange={setBackColor} label="Background Color" />
        </div>

        {/* Size Slider */}
        <div className="space-y-3">
          <label className="text-sm font-semibold text-gray-700">Barcode Pixel Size: {narrowBarWidth}%</label>
          <div className="px-2">
            <input
              type="range"
              min="0"
              max="100"
              value={narrowBarWidth}
              onChange={(e) => setNarrowBarWidth(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              style={{
                background: `linear-gradient(to right, #ff550d 0%, #ff911d ${narrowBarWidth}%, #e5e7eb ${narrowBarWidth}%, #e5e7eb 100%)`,
              }}
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Small</span>
              <span>Large</span>
            </div>
          </div>
        </div>

        {/* Angle */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">Rotation Angle</label>
          <select
            value={angle}
            onChange={(e) => setAngle(e.target.value)}
            className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-[#ff550d] focus:outline-none transition-colors"
          >
            <option value="0">0° (Normal)</option>
            <option value="1">90° (Right)</option>
            <option value="2">180° (Upside down)</option>
            <option value="3">270° (Left)</option>
          </select>
        </div>

        {/* Upload Decoration Image */}
        <div className="space-y-3">
          <label className="text-sm font-semibold text-gray-700">Logo Image (Optional)</label>

          {!file && !decorationImageUrl && (
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-[#ff550d] transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <ImageIcon className="mx-auto h-12 w-12 text-[#ff550d] mb-4" />
                <p className="text-gray-600">Click to upload a logo image</p>
                <p className="text-sm text-gray-400 mt-1">PNG, JPG up to 10MB</p>
              </label>
            </div>
          )}

          {(file || decorationImageUrl) && (
            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <ImageIcon className="h-8 w-8 text-[#ff550d]" />
                  <div>
                    <p className="font-medium text-gray-900">{file ? file.name : "Uploaded Image"}</p>
                    <p className="text-sm text-gray-500">{decorationImageUrl ? "Ready to use" : "Ready to upload"}</p>
                  </div>
                </div>
                <button
                  onClick={removeUploadedImage}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {uploading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-[#ff550d] to-[#ff911d] h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <button
          onClick={generateBarcode}
          disabled={loading || !value}
          className="w-full py-4 bg-gradient-to-r from-[#ff550d] to-[#ff911d] text-white font-semibold rounded-xl hover:from-[#e6490b] hover:to-[#e6820a] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          {loading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Generating...</span>
            </div>
          ) : (
            "Generate QR Code"
          )}
        </button>

        {barcodeUrl && (
          <div className="bg-gray-50 rounded-xl p-6 text-center space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Generated QR Code</h3>
            <div className="bg-white p-4 rounded-lg inline-block shadow-sm">
              <img src={barcodeUrl || "/placeholder.svg"} alt="Generated barcode" className="max-w-full h-auto" />
            </div>
            <button
              onClick={downloadBarcode}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-[#ff550d] to-[#ff911d] text-white font-semibold rounded-lg hover:from-[#e6490b] hover:to-[#e6820a] transition-colors shadow-md hover:shadow-lg"
            >
              <Download className="h-5 w-5" />
              <span>Download QR Code</span>
            </button>
          </div>
        )}
      </div>

      <style>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #ff550d, #ff911d);
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #ff550d, #ff911d);
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
      `}</style>
    </div>
  )
}
