
import JpgToPdfConverter from '@/components/Image-to-pdf/Jpg-to-pdf/JpgToPdf';
import PngToPdfConverter from '@/components/Image-to-pdf/png-to-pdf/PngToPdf';
import TiffToPdfConverter from '@/components/Image-to-pdf/tiff-to-pdf/tifftopdf';
import PDFToTiffConverter from '@/components/PdfToTiff/PdfToTiff';
import { useState } from "react";

const Index = () => {
const [isOpen, setIsOpen] = useState(false);

  return (
  <>
  <nav className="bg-[#fff9f6]  dark:bg-black   border-b-[0.1px] border-[#C3C4C6]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
        <img src="/logo.png" alt="Logo" width={100} height={50} />

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-8">
            <a href="/" className="text-black dark:text-white hover:text-[#ff7726]">
              Home
            </a>
            <a href="/features" className="text-black dark:text-white hover:text-[#ff7726]">
              Features
            </a>
            <a href="/tools" className="text-black dark:text-white hover:text-[#ff7726]">
              All PDF Tools
            </a>
            <a href="/contact" className="text-black dark:text-white hover:text-[#ff7726]">
              Contact
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-black dark:text-white focus:outline-none"
          >
            ☰
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white dark:bg-black px-4 pb-3 space-y-2">
          <a href="/" className="block text-black dark:text-white hover:text-[#ff7726]">
            Home
          </a>
          <a href="/features" className="block text-black dark:text-white hover:text-[#ff7726]">
            Features
          </a>
          <a href="/tools" className="block text-black dark:text-white hover:text-[#ff7726]">
            All PDF Tools
          </a>
          <a href="/contact" className="block text-black dark:text-white hover:text-[#ff7726]">
            Contact
          </a>
        </div>
      )}
    </nav>
    <TiffToPdfConverter/>

  </>
  )
};

export default Index;
{/* <PDFConverter /> */}
{/* <PDFToTiffConverter/> */}
{/* <PngToPdfConverter/> */}
{/* <PDFToJpgConverter/> */}
{/* <PDFTowebpConverter/> */}
{/* <JpgToPdfConverter/> */}







