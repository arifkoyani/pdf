import React, { useState, useRef } from 'react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Upload, Download, Loader2, Copy, Check, FileText, Shield, Calendar, User, Key, Lock, Unlock, Square, CheckSquare, Type, List, Circle } from 'lucide-react';
import { FlipWords } from '@/components/ui/flip-words/flip-words';

const API_KEY = "arifalikoyani@gmail.com_3pAjCTcGYalMXO6wTDoN5aQZpvlHpLgbl5bJSYrvplQOGWMHHNdHRzLne0IyPsDJ";

type AppState = 'select' | 'uploading' | 'converting' | 'ready';
type Classification = {
  class: string;
};

type PdfField = {
  PageIndex: number;
  Type: string;
  FieldName: string;
  Value: string;
  Left: number;
  Top: number;
  Width: number;
  Height: number;
};

type PdfInfo = {
  PageCount: number;
  Author: string;
  Title: string;
  Producer: string;
  Subject: string;
  CreationDate: string;
  Bookmarks: string;
  Keywords: string;
  Creator: string;
  Encrypted: boolean;
  PasswordProtected: boolean;
  PageRectangle: {
    Size: string;
    Width: number;
    Height: number;
  };
  ModificationDate: string;
  EncryptionAlgorithm: string;
  PermissionPrinting: boolean;
  PermissionModifyDocument: boolean;
  PermissionContentExtraction: boolean;
  PermissionModifyAnnotations: boolean;
  PermissionFillForms: boolean;
  PermissionAccessibility: boolean;
  PermissionAssemble: boolean;
  PermissionHighQualityPrint: boolean;
  FieldsInfo?: {
    Fields: PdfField[];
  };
};

const PdfFormsInfoReader = () => {
  const words = ["PDF", "Forms", "Analyzer", "Extractor"];
  const [state, setState] = useState<AppState>('select');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFileUrl, setUploadedFileUrl] = useState('');
  const [pdfInfo, setPdfInfo] = useState<PdfInfo | null>(null);
  const [classifications, setClassifications] = useState<Classification[]>([]);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      uploadFile(file);
    }
  };

  const uploadFile = async (file: File) => {
    setState('uploading');
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const uploadInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(uploadInterval);
            return 90;
          }
          return prev + Math.random() * 15;
        });
      }, 100);

      const response = await fetch('https://api.pdf.co/v1/file/upload', {
        method: 'POST',
        headers: {
          'x-api-key': API_KEY,
        },
        body: formData,
      });

      const data = await response.json();

      clearInterval(uploadInterval);
      setUploadProgress(100);

      if (data.error === false) {
        setUploadedFileUrl(data.url);
        setTimeout(() => {
          processDocument(data.url);
        }, 500);
      } else {
        setState('select');
        setUploadProgress(0);
      }
    } catch (error) {
      setState('select');
      setUploadProgress(0);
    }
  };

  const processDocument = async (fileUrl: string) => {
    setState('converting');

    try {
      // Call both endpoints simultaneously
      const [classifierResponse, infoResponse] = await Promise.all([
        // Document Classifier
        fetch('https://api.pdf.co/v1/pdf/classifier', {
          method: 'POST',
          headers: {
            'x-api-key': API_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url: fileUrl,
            async: false,
            inline: true,
            password: "",
            profiles: ""
          }),
        }),
        // PDF Form Fields Info Extractor
        fetch('https://api.pdf.co/v1/pdf/info/fields', {
          method: 'POST',
          headers: {
            'x-api-key': API_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url: fileUrl,
            inline: true,
            async: false
          }),
        })
      ]);

      const classifierData = await classifierResponse.json();
      const infoData = await infoResponse.json();

      if (classifierData.error === false && infoData.error === false) {
        setClassifications(classifierData.body?.classes || []);
        setPdfInfo(infoData.info);
        setState('ready');
      } else {
        setState('select');
      }
    } catch (error) {
      setState('select');
    }
  };

  const copyToClipboard = async () => {
    try {
      const infoText = JSON.stringify(pdfInfo, null, 2);
      await navigator.clipboard.writeText(infoText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString;
    }
  };

  const getEncryptionStatus = (encrypted: boolean) => {
    return encrypted ? (
      <span className="text-red-600 flex items-center gap-1">
        <Lock className="w-4 h-4" /> Encrypted
      </span>
    ) : (
      <span className="text-green-600 flex items-center gap-1">
        <Unlock className="w-4 h-4" /> Not Encrypted
      </span>
    );
  };

  const getPermissionIcon = (hasPermission: boolean) => {
    return hasPermission ? (
      <span className="text-green-600">✓</span>
    ) : (
      <span className="text-red-600">✗</span>
    );
  };

  const getFieldTypeIcon = (type: string) => {
    switch (type) {
      case 'CheckBox':
        return <CheckSquare className="w-4 h-4 text-blue-600" />;
      case 'EditBox':
        return <Type className="w-4 h-4 text-green-600" />;
      case 'RadioButton':
        return <Circle className="w-4 h-4 text-purple-600" />;
      case 'ComboBox':
        return <List className="w-4 h-4 text-orange-600" />;
      default:
        return <Square className="w-4 h-4 text-gray-600" />;
    }
  };

  const getFieldValueDisplay = (type: string, value: string) => {
    if (type === 'CheckBox') {
      return value === 'True' ? 'Checked' : 'Unchecked';
    }
    return value || '(Empty)';
  };

  const resetConverter = () => {
    setState('select');
    setUploadProgress(0);
    setUploadedFileUrl('');
    setPdfInfo(null);
    setClassifications([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-[calc(100vh-84px)] bg-gradient-subtle flex flex-col items-center justify-center px-6 py-8">
      <Card className="w-full max-w-6xl p-8 shadow-elegant border-0 bg-white/80 backdrop-blur-sm">
        <div className="text-center space-y-1">
          {/* Header */}
          <div className="space-y-4">
            <div className='pb-8'>
              <div className="h-[4rem] flex justify-center items-center px-4">
                <div className="flex flex-wrap justify-center py-1 items-center mx-auto text-neutral-600 dark:text-neutral-400 
                text-2xl sm:text-3xl md:text-4xl lg:text-5xl gap-2">PDF Forms
                  <div className="w-[120px] sm:w-[150px] md:w-[180px] text-left">
                    <FlipWords words={words} />
                  </div>
                </div>
              </div>
              <p className="text-muted-foreground text-lg">Analyze PDF form fields and extract detailed metadata</p>
            </div>
          </div>

          {/* Content Area */}
          <div className="space-y-6">
            {state === 'select' && (
              <div
                className="border-2 flex items-center p-4 space-x-4 shadow-lg rounded-xl px-12 hover:border-primary/50 transition-all transform hover:scale-105 transition-all duration-600 text-lg cursor-pointer bg-[#f16625]"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-8 h-8 mx-auto text-white" />
                <h3 className="text-xl font-semibold text-white">
                  Choose PDF File
                </h3>
                <p className="text-white">
                  Click here to select your PDF file
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            )}

            {state === 'uploading' && (
              <div className="space-y-4">
                <div className="w-full max-w-md mx-auto">
                  <Progress value={uploadProgress} className="h-4" />
                  <p className="text-sm text-muted-foreground mt-2 text-center">
                    {Math.round(uploadProgress)}% uploaded
                  </p>
                </div>
              </div>
            )}

            {state === 'converting' && (
              <div className="flex flex-col items-center space-y-4">
                <Loader2 className="w-16 h-16 text-primary animate-spin" />
                <p className="text-muted-foreground">Analyzing PDF form fields...</p>
              </div>
            )}

            {state === 'ready' && pdfInfo && (
              <div className="space-y-6">
                {/* Document Classifier Results */}
                {classifications.length > 0 && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-blue-900 mb-2">📄 Document Classifier - AI Recognition</h3>
                    <div className="flex flex-wrap gap-2">
                      {classifications.map((classification, index) => (
                        <span
                          key={index}
                          className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                        >
                          {classification.class}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* PDF Info Results */}
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      PDF Form Fields Analysis
                    </h3>
                    <Button
                      onClick={copyToClipboard}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      {copied ? 'Copied!' : 'Copy Info'}
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Basic Information */}
                    <div className="bg-gray-50 p-6 rounded-lg border">
                      <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Document Details
                      </h4>
                      <div className="space-y-3">
                        <InfoRow label="Title" value={pdfInfo.Title} />
                        <InfoRow label="Author" value={pdfInfo.Author} icon={<User className="w-4 h-4" />} />
                        <InfoRow label="Subject" value={pdfInfo.Subject} />
                        <InfoRow label="Keywords" value={pdfInfo.Keywords || 'None'} />
                        <InfoRow label="Page Count" value={pdfInfo.PageCount.toString()} />
                        <InfoRow label="Form Fields" value={`${pdfInfo.FieldsInfo?.Fields?.length || 0} fields detected`} />
                      </div>
                    </div>

                    {/* Security Info */}
                    <div className="bg-gray-50 p-6 rounded-lg border">
                      <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        Security & Permissions
                      </h4>
                      <div className="space-y-3">
                        <InfoRow label="Encrypted" value={getEncryptionStatus(pdfInfo.Encrypted)} />
                        <InfoRow label="Password Protected" value={getEncryptionStatus(pdfInfo.PasswordProtected)} />
                        <InfoRow label="Encryption Algorithm" value={pdfInfo.EncryptionAlgorithm} />
                        <InfoRow label="Fill Forms" value={getPermissionIcon(pdfInfo.PermissionFillForms)} />
                        <InfoRow label="Content Extraction" value={getPermissionIcon(pdfInfo.PermissionContentExtraction)} />
                        <InfoRow label="Modify Annotations" value={getPermissionIcon(pdfInfo.PermissionModifyAnnotations)} />
                      </div>
                    </div>
                  </div>

                  {/* Form Fields Details */}
                  {pdfInfo.FieldsInfo?.Fields && pdfInfo.FieldsInfo.Fields.length > 0 && (
                    <div className="bg-gray-50 p-6 rounded-lg border">
                      <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
                        <List className="w-4 h-4" />
                        Form Fields Details ({pdfInfo.FieldsInfo.Fields.length} fields)
                      </h4>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-gray-100">
                              <th className="px-4 py-2 text-left">Page</th>
                              <th className="px-4 py-2 text-left">Type</th>
                              <th className="px-4 py-2 text-left">Field Name</th>
                              <th className="px-4 py-2 text-left">Value</th>
                              <th className="px-4 py-2 text-left">Position</th>
                              <th className="px-4 py-2 text-left">Size</th>
                            </tr>
                          </thead>
                          <tbody>
                            {pdfInfo.FieldsInfo.Fields.map((field, index) => (
                              <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                                <td className="px-4 py-2 font-mono">{field.PageIndex}</td>
                                <td className="px-4 py-2">
                                  <div className="flex items-center gap-2">
                                    {getFieldTypeIcon(field.Type)}
                                    {field.Type}
                                  </div>
                                </td>
                                <td className="px-4 py-2 font-mono text-xs break-all">
                                  {field.FieldName}
                                </td>
                                <td className="px-4 py-2">
                                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                                    {getFieldValueDisplay(field.Type, field.Value)}
                                  </span>
                                </td>
                                <td className="px-4 py-2 font-mono text-xs">
                                  {field.Left.toFixed(1)}x{field.Top.toFixed(1)}
                                </td>
                                <td className="px-4 py-2 font-mono text-xs">
                                  {field.Width.toFixed(1)}x{field.Height.toFixed(1)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Field Type Summary */}
                  {pdfInfo.FieldsInfo?.Fields && (
                    <div className="bg-gray-50 p-6 rounded-lg border">
                      <h4 className="font-semibold text-lg mb-4">Field Type Summary</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {Object.entries(
                          pdfInfo.FieldsInfo.Fields.reduce((acc, field) => {
                            acc[field.Type] = (acc[field.Type] || 0) + 1;
                            return acc;
                          }, {} as Record<string, number>)
                        ).map(([type, count]) => (
                          <div key={type} className="bg-white p-3 rounded-lg border text-center">
                            <div className="flex justify-center mb-2">
                              {getFieldTypeIcon(type)}
                            </div>
                            <div className="text-lg font-semibold">{count}</div>
                            <div className="text-sm text-gray-600">{type}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <Button
                  onClick={resetConverter}
                  variant="outline"
                  className="mt-4"
                >
                  Analyze Another PDF
                </Button>
              </div>
            )}
          </div>
        </div>
      </Card>

      <div className="flex flex-col items-center justify-center w-full mt-8 max-w-6xl">
        <h2 className="text-2xl font-semibold mb-4 text-center">
          📄 PDF Forms Field Analyzer
        </h2>

        <p className="text-muted-foreground text-lg text-center max-w-2xl mb-6">
          Extract and analyze fillable form fields from PDF documents. Discover checkboxes, 
          text fields, radio buttons, and combo boxes with their properties, values, and positions.
        </p>

        {/* FAQ Section */}
        <div className="w-full max-w-6xl py-6 px-4 rounded-2xl" style={{ backgroundColor: "#fef0e9" }}>
          <h3 className="text-xl font-bold text-center mb-3">
            Why Analyze PDF Form Fields?
          </h3>
          <p className="text-lg text-center max-w-2xl mx-auto text-neutral-700">
            Understanding form field structure is essential for PDF automation, 
            data extraction, form processing, and digital transformation projects.
          </p>
        </div>
      </div>
    </div>
  );
};

// Helper component for info rows
const InfoRow = ({ label, value, icon }: { label: string; value: React.ReactNode; icon?: React.ReactNode }) => (
  <div className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
    <span className="text-sm font-medium text-gray-600 flex items-center gap-1">
      {icon}
      {label}:
    </span>
    <span className="text-sm text-gray-800 font-mono">{value}</span>
  </div>
);

export default PdfFormsInfoReader;