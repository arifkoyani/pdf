"use client"

import { useState, useRef } from "react"
import { Download, X, ImageIcon, PaintBucket, Link, MessageSquare, Mail, Phone, Wifi, Eye, EyeOff, MessageCircle, Youtube, Facebook, X as XIcon, User, Building, Briefcase, Globe, MapPin, FileText, Coins, DollarSign, Hash, File, Type } from "lucide-react"
import { FlipWords } from "../../ui/flip-words/flip-words"
import { ColorPicker } from "../../color-picker/colorpicker"
import SendPdfEmail from "../../send-email/SendEmail"
import html2canvas from 'html2canvas'

export default function GTIN8Generator() {
  const words = ["Better", "Fast", "Perfect", "GTIN-8"]
  const [gtinInput, setGtinInput] = useState("") // GTIN-8 input (7 digits)
  const [angle, setAngle] = useState("0")
  const [narrowBarWidth, setNarrowBarWidth] = useState(25) // Changed to number for slider
  const [foreColor, setForeColor] = useState("#ff550d")
  const [backColor, setBackColor] = useState("#ffffff")
  const [barcodeUrl, setBarcodeUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [toEmail, setToEmail] = useState("") // Email state for sending
  const [selectedFrame, setSelectedFrame] = useState("no-frame") // Selected frame state
  const frameRef = useRef<HTMLDivElement>(null) // Reference for the frame container
  const [inputError, setInputError] = useState("") // Input validation error

  // Frame-specific styling configurations
  const frameConfigs = {
    'no-frame': {
      container: {
        width: '240px',
        height: '240px',
        backgroundColor: 'transparent',
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center'
      },
      qrCode: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '240px',
        height: '240px'
      },
      qrImage: {
        maxWidth: '240px',
        maxHeight: '240px'
      },
      preview: {
        container: {
          width: '80px',
          height: '80px'
        },
        qrCode: {
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '80px',
          height: '80px'
        },
        qrImage: {
          maxWidth: '80px',
          maxHeight: '80px'
        }
      }
    },
    'frame.png': {
      container: {
        width: '240px',
        height: '280px',
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        backgroundColor: 'transparent',
        backgroundPosition: 'center'
      },
      qrCode: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -65%)',
        width: '195px',
        height: '195px'
      },
      qrImage: {
        maxWidth: '185px',
        maxHeight: '185px'
      },
      preview: {
        container: {
          width: '80px',
          height: '96px'
        },
        qrCode: {
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -56%)',
          width: '150px',
          height: '150px'
        },
        qrImage: {
          maxWidth: '55px',
          maxHeight: '55px'
        }
      }
    },
    'frame2.png': {
      container: {
        width: '240px',
        height: '280px',
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        backgroundColor: 'transparent',
      },
      qrCode: {
        position: 'absolute',
        top: '40%',
        left: '60%',
        transform: 'translate(-63%, -55%)',
        width: '170px',
        height: '170px'
      },
      qrImage: {
        maxWidth: '170px',
        maxHeight: '170px'
      },
      preview: {
        container: {
          width: '80px',
          height: '96px'
        },
        qrCode: {
          position: 'absolute',
          top: '40%',
          left: '60%',
          transform: 'translate(-63%, -56%)',
          width: '55px',
          height: '55px'
        },
        qrImage: {
          maxWidth: '65px',
          maxHeight: '50px'
        }
      }
    },
    'frame3.png': {
      container: {
        width: '240px',
        height: '280px',
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        backgroundColor: 'white',
            },
      qrCode: {
        position: 'absolute',
        top: '5%',
        left: '20%',
        transform: 'translate(-11%, 6%)',
        width: '185px',
        height: '185px'
      },
      qrImage: {
        maxWidth: '185px',
        maxHeight: '185px'
      },
      preview: {
        container: {
          width: '80px',
          height: '96px'
        },
        qrCode: {
          position: 'absolute',
          top: '5%',
          left: '20%',
          transform: 'translate(-11%, 8%)',
          width: '60px',
          height: '60px'
        },
        qrImage: {
          maxWidth: '62px',
          maxHeight: '62px'
        }
      }
    }
  }

  // Get current frame configuration
  const getCurrentFrameConfig = () => frameConfigs[selectedFrame] || frameConfigs['frame.png']

  const API_KEY = "arif@audeflow.com_0XUgOpxRN9iqfJFxxYUDWMnHpoP7177lWf7ESbdwV0bIvXQUQgnOwqI4aQGCev5m"

  const mapSliderToApiValue = (sliderValue: number) => {
    return Math.round((sliderValue / 100) * 70)
  }

  // GTIN-8 validation function
  const validateGTINInput = (input: string) => {
    // Remove any non-numeric characters
    const numericInput = input.replace(/\D/g, '')
    
    if (numericInput.length === 0) {
      setInputError("")
      return true
    }
    
    if (numericInput.length < 7) {
      setInputError("GTIN-8 requires exactly 7 digits")
      return false
    }
    
    if (numericInput.length > 7) {
      setInputError("GTIN-8 requires exactly 7 digits (you entered " + numericInput.length + " digits)")
      return false
    }
    
    if (!/^\d{7}$/.test(numericInput)) {
      setInputError("GTIN-8 must contain only numeric digits (0-9)")
      return false
    }
    
    setInputError("")
    return true
  }

  // Handle input change with validation
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setGtinInput(value)
    validateGTINInput(value)
  }

  // Generate GTIN-8 Barcode
  const generateGTIN8 = async () => {
    setLoading(true)
    try {
      // Validate input before generating
      if (!validateGTINInput(gtinInput)) {
        setLoading(false)
        return
      }

      const apiNarrowBarWidth = mapSliderToApiValue(narrowBarWidth)
      console.log(" Slider value:", narrowBarWidth, "API value:", apiNarrowBarWidth)
      
      // Use the 7-digit input directly (API will calculate checksum)
      const gtinValue = gtinInput.replace(/\D/g, '')
      
      console.log("GTIN-8 value:", gtinValue)

      const response = await fetch("https://api.pdf.co/v1/barcode/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": API_KEY,
        },
        body: JSON.stringify({
          name: "gtin8.png",
          value: gtinValue,
          type: "GTIN8",
          inline: true,
          async: false,
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

  const downloadGTIN8 = async () => {
    if (!barcodeUrl || !frameRef.current) return

    try {
      // If no frame is selected, download the GTIN-8 directly
      if (selectedFrame === 'no-frame') {
        const response = await fetch(barcodeUrl)
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `gtin8-no-frame-${gtinInput || "generated"}.png`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        return
      }

      // Use html2canvas to capture the frame container with the GTIN-8
      const canvas = await html2canvas(frameRef.current, {
        backgroundColor: 'transparent',
        scale: 2, // Higher quality
        useCORS: true,
        allowTaint: true,
        logging: false,
        width: frameRef.current.offsetWidth,
        height: frameRef.current.offsetHeight,
      })

      // Convert canvas to blob and download
      canvas.toBlob((blob) => {
        if (blob) {
          const url = window.URL.createObjectURL(blob)
          const a = document.createElement("a")
          a.href = url
          a.download = `gtin8-${selectedFrame.replace('.png', '')}-${gtinInput || "generated"}.png`
          document.body.appendChild(a)
          a.click()
          window.URL.revokeObjectURL(url)
          document.body.removeChild(a)
        }
      }, 'image/png')
    } catch (error) {
      console.error("Download error:", error)
      // Fallback to original method if html2canvas fails
      try {
        const response = await fetch(barcodeUrl)
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `gtin8-${gtinInput || "generated"}.png`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } catch (fallbackError) {
        console.error("Fallback download error:", fallbackError)
      }
    }
  }

  return (
    <div className="p-8 max-w-7xl mx-auto bg-[#fef0e9] shadow-2xl rounded-3xl border border-gray-100">
      {/* Header */}
      <div className="text-center space-y-2 mb-8">
        <div className="flex flex-wrap justify-center items-center mx-auto text-neutral-600 text-2xl sm:text-3xl md:text-4xl lg:text-5xl gap-2">
          Generating To
          <div className="w-[120px] sm:w-[150px] md:w-[180px] text-left">
            <FlipWords words={words} />
          </div>
        </div>
        <p className="text-gray-600">Create custom GTIN-8 barcodes for retail products</p>
      </div>

      {/* Main Content - Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-[600px]">
        {/* Left Side - Controls */}
      <div className="space-y-6">
        {/* GTIN-8 Input Section */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">
            Enter 7-digit GTIN-8 number (Your barcode will be generated automatically)
          </label>
          <input
            type="text"
            placeholder="Enter 7 digits (e.g., 1234567)"
            value={gtinInput}
            onChange={handleInputChange}
            maxLength={7}
            className={`w-full p-4 border-2 rounded-xl focus:outline-none transition-colors ${
              inputError 
                ? "border-red-300 focus:border-red-500" 
                : "border-gray-200 focus:border-[#ff550d]"
            }`}
          />
          {inputError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-700">
                <strong>Error:</strong> {inputError}
              </p>
            </div>
          )}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-700">
              <strong>GTIN-8 Format:</strong> Enter exactly 7 numeric digits (0-9). The 8th digit (checksum) will be calculated automatically.
            </p>
            <p className="text-xs text-blue-600 mt-1">
              Examples: "1234567" → GTIN-8: 12345670, "9638507" → GTIN-8: 96385074
            </p>
          </div>
        </div>

          {/* Improved Color Picker Section */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            Custom GTIN-8 Styling
            </h3>
            <div className="space-y-4 flex flex-col gap-4">
              {/* Foreground Color */}
              <div className="flex  gap-4">

              <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-700">Foreground Color</label>
                <div className="flex gap-3 items-center">
                  <div className="flex-1">

                     <ColorPicker initialColor={foreColor} onChange={setForeColor} label="" />
                  </div>
               
                </div>
              </div>
              
              {/* Background Color */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-700">Background Color</label>
                <div className="flex gap-3 items-center">
                  <div className="flex-1">
                    <ColorPicker initialColor={backColor} onChange={setBackColor} label="" />
                  </div>
                </div>
              </div>
              </div>

              
              {/* Color Preview */}
              <div className="mt-4 p-4 bg-white rounded-lg border-2 border-dashed border-gray-300">
                <div className="text-center space-y-2">
                  <p className="text-xs text-gray-500 font-medium">Color Preview</p>
                  <div className="flex justify-center">
                    <div 
                      className="w-16 h-16 rounded-lg border-2 border-gray-300 flex items-center justify-center"
                      style={{ backgroundColor: backColor }}
                    >
                      <div 
                        className="w-8 h-8 rounded-md"
                        style={{ backgroundColor: foreColor }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
        </div>

        {/* Size Slider */}
        <div className="space-y-3">
          <label className="text-sm font-semibold text-gray-700">GTIN-8 Pixel Size: {narrowBarWidth}%</label>
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

        <button
          onClick={generateGTIN8}
          disabled={loading || !gtinInput || gtinInput.length !== 7 || inputError !== ""}
          className="w-full py-4 bg-gradient-to-r from-[#ff550d] to-[#ff911d] text-white font-semibold rounded-xl hover:from-[#e6490b] hover:to-[#e6820a] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          {loading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Generating...</span>
            </div>
          ) : (
            "Generate GTIN-8 Barcode"
          )}
        </button>
        </div>

        {/* Right Side - Results */}
        <div className="bg-gradient-to-br from-gray-50 to-white  flex flex-col  rounded-2xl border border-gray-200 p-6 overflow-hidden ">
          <div className="text-center mb-6">
            <h3 className="text-xl font-semibold text-gray-800 flex items-center justify-center gap-2">
              GTIN-8 Barcode Preview
            </h3>
          </div>

          <div className="flex-1 flex items-center justify-center min-h-0">
            {!barcodeUrl ? (
              <div className="text-center space-y-4 bg-[#fef0e9]">
                <div className="w-48 h-48  rounded-2xl border-2 border-dashed border-gray-300 flex items-center justify-center mx-auto">
                  <div className="text-center space-y-3">
                    <div className="w-16 h-16 bg-gray-200 rounded-xl mx-auto flex items-center justify-center">
                      <Hash className="w-8 h-8 text-[#ff590e]" />
                    </div>
                    <div>
                      <p className="text-gray-500 font-medium">No GTIN-8 Barcode Yet</p>
                      <p className="text-xs text-gray-400">Enter 7 digits and generate</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-full h-full overflow-hidden">
                {/* Two Column Layout: GTIN-8 Left, Frame Selection Right */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 h-full items-start">
                  
                  {/* Left Side - Selected Frame Container for Screenshot */}
                  <div className="flex flex-col items-center justify-center space-y-6 p-4">
                    <div 
                      ref={frameRef}
                      className={`inline-block p-4 rounded-2xl transition-shadow duration-300 qr-frame-container flex-shrink-0 ${
                        selectedFrame === 'no-frame' 
                          ? 'shadow-none' 
                          : 'shadow-xl hover:shadow-2xl'
                      }`}
                      style={{
                        backgroundImage: selectedFrame !== 'no-frame' ? `url('/${selectedFrame}')` : 'none',
                        backgroundColor: selectedFrame === 'no-frame' ? 'transparent' : 'transparent',
                        padding: selectedFrame === 'no-frame' ? '0' : '16px',
                        ...getCurrentFrameConfig().container,
                        position: 'relative'
                      }}
                    >
                      {/* GTIN-8 positioned inside the frame */}
                      <div 
                        className="absolute inset-0   flex justify-center items-center"
                        style={getCurrentFrameConfig().qrCode}
                      >
                        <img 
                          src={barcodeUrl} 
                          alt="Generated GTIN-8 Barcode" 
                          className="w-full h-full  object-contain filter drop-shadow-sm"
                          style={getCurrentFrameConfig().qrImage}
                        />
                      </div>
                      
                     
                    </div>

                    {/* Action Buttons - Below GTIN-8 */}
                    <div className="w-full max-w-sm space-y-4">
                      <button
                        onClick={downloadGTIN8}
                        className="w-full inline-flex items-center justify-center gap-3 px-6 py-3 bg-gradient-to-r from-[#ff550d] to-[#ff911d] text-white font-semibold rounded-xl hover:from-[#e6490b] hover:to-[#e6820a] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
                      >
                        <Download className="h-5 w-5" />
                        <span>Download GTIN-8</span>
                      </button>
                      
                      {/* Email Section */}
                      <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                        <label className="text-sm font-semibold text-gray-700 block mb-3">
                          Send via Email
                        </label>
                        <div className="flex flex-col gap-3">
                          <input
                            type="email"
                            placeholder="Enter recipient email"
                            value={toEmail}
                            onChange={(e) => setToEmail(e.target.value)}
                            className="w-full border-2 border-gray-200 rounded-lg p-3 focus:border-[#ff550d] focus:outline-none transition-all duration-200 text-sm hover:border-gray-300"
                          />
                          <SendPdfEmail toEmail={toEmail} fileUrl={barcodeUrl} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Side - Frame Selection */}
                  <div className="flex flex-col items-center justify-start p-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-4">Choose Frame Style</h4>
                    <div className="flex flex-col gap-4 items-center max-w-[160px]">
                      {['no-frame', 'frame.png', 'frame2.png', 'frame3.png'].map((frameFile, index) => {
                        const frameConfig = frameConfigs[frameFile] || frameConfigs['frame.png'];
                        const frameNames = ['Normal', 'Classic', 'Modern', 'Elegant'];
                        return (
                          <div
                            key={frameFile}
                            onClick={() => setSelectedFrame(frameFile)}
                            className={`cursor-pointer p-3 rounded-xl transition-all duration-300 w-full group ${
                              selectedFrame === frameFile 
                                ? 'ring-4 ring-[#ff550d] border-2 border-[#ff911d] ring-opacity-30 bg-gradient-to-br from-[#fef0e9] to-white shadow-xl scale-105' 
                                : 'hover:bg-gradient-to-br hover:from-gray-50 hover:to-white hover:shadow-lg border border-gray-200 hover:border-gray-300 hover:scale-102 transform'
                            }`}
                          >
                            {/* Frame with GTIN-8 Preview */}
                            <div
                              className="bg-white rounded-lg border border-gray-200 mb-3 relative mx-auto shadow-sm group-hover:shadow-md transition-shadow duration-100"
                              style={{
                                backgroundImage: frameFile !== 'no-frame' ? `url('/${frameFile}')` : 'none',
                                backgroundSize: 'contain',
                                backgroundRepeat: 'no-repeat',
                                backgroundPosition: 'center',
                                backgroundColor: frameFile === 'no-frame' ? 'transparent' : 'white',
                                border: frameFile === 'no-frame' ? 'none' : '1px solid #e5e7eb',
                                ...frameConfig.preview.container
                              }}
                            >
                              {/* GTIN-8 positioned inside each frame preview */}
                              <div 
                                className="absolute inset-0 flex   items-center justify-center"
                                style={frameConfig.preview.qrCode}
                              >
                                <img 
                                  src={barcodeUrl} 
                                  alt="GTIN-8 Preview" 
                                  className="w-full h-full object-contain filter drop-shadow-sm"
                                  style={frameConfig.preview.qrImage}
                                />
                              </div>
                            </div>
                            <div className="text-center">
                              <p className={`text-xs font-semibold transition-colors duration-200 ${
                                selectedFrame === frameFile 
                                  ? 'text-[#ff550d]' 
                                  : 'text-gray-600 group-hover:text-gray-800'
                              }`}>
                                {frameNames[index]}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
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

        /* Frame container styles for better rendering */
        .qr-frame-container {
          image-rendering: -webkit-optimize-contrast;
          image-rendering: crisp-edges;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .qr-frame-container img {
          image-rendering: -webkit-optimize-contrast;
          image-rendering: crisp-edges;
          filter: contrast(1.1);
          transition: all 0.2s ease-in-out;
        }

        .qr-frame-container:hover {
          transform: translateY(-2px);
        }

        /* Smooth scaling animations */
        .hover\\:scale-102:hover {
          transform: scale(1.02);
        }

        .scale-105 {
          transform: scale(1.05);
        }
      `}</style>
    </div>
  )
}
