
import React, { useState, useRef } from 'react';
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, Image, X } from 'lucide-react';

// New API endpoint for uploads
const API_ENDPOINT = 'https://mdsmku45ph.execute-api.eu-central-1.amazonaws.com/Prod/upload/';

interface UploadModalProps {
  open: boolean;
  onClose: () => void;
  onUploadComplete: () => void;
}

export default function UploadModal({ open, onClose, onUploadComplete }: UploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleNewFile(e.dataTransfer.files[0]);
    }
  };
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleNewFile(e.target.files[0]);
    }
  };
  
  const handleNewFile = (selectedFile: File) => {
    // Check file type
    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(selectedFile.type.toLowerCase())) {
      toast.error('Please upload a valid image file (JPEG or PNG)');
      return;
    }
    
    // Check file size (10MB limit)
    if (selectedFile.size > 10 * 1024 * 1024) {
      toast.error('File size exceeds 10MB limit');
      return;
    }
    
    setFile(selectedFile);
    // Set title as filename (without extension) as default
    const fileName = selectedFile.name.replace(/\.[^/.]+$/, '');
    setTitle(fileName);
  };
  
  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file to upload');
      return;
    }
    
    if (!firstName.trim()) {
      toast.error('First name is required');
      return;
    }
    
    if (!lastName.trim()) {
      toast.error('Last name is required');
      return;
    }
    
    if (!email.trim()) {
      toast.error('Email is required');
      return;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }
    
    try {
      setIsUploading(true);
      
      // Read file as ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();
      
      // Convert ArrayBuffer to Base64
      const base64Content = arrayBufferToBase64(arrayBuffer);
      
      // Get file extension
      const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
      
      // Prepare payload
      const payload = {
        firstName,
        lastName,
        email,
        image: base64Content,
        contentType: file.type,
        fileExtension
      };
      
      // Send to API
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        throw new Error('Upload failed: ' + response.statusText);
      }
      
      const data = await response.json();
      
      // Get the image URL from the response
      const imageUrl = data.url || data.fileUrl;
      
      toast.success('Photo uploaded successfully!');
      onUploadComplete();
      handleClose();
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload photo');
    } finally {
      setIsUploading(false);
    }
  };
  
  // Helper function to convert ArrayBuffer to Base64
  const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  };
  
  const handleClose = () => {
    setFile(null);
    setTitle('');
    setFirstName('');
    setLastName('');
    setEmail('');
    setIsUploading(false);
    onClose();
  };
  
  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload new photo</DialogTitle>
          <DialogDescription>
            Upload a new photo to your collection. Supported formats: JPEG, PNG (Max: 10MB)
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {!file ? (
            <div
              className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
                dragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary hover:bg-gray-50'
              }`}
              onClick={() => inputRef.current?.click()}
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
            >
              <div className="flex flex-col items-center justify-center">
                <Upload className="h-10 w-10 text-gray-400 mb-2" />
                <p className="text-sm font-medium">
                  Drag & drop your photo here, or click to browse
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  JPEG or PNG, max 10MB
                </p>
              </div>
              <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          ) : (
            <div className="relative">
              <div className="rounded-lg overflow-hidden">
                <img
                  src={URL.createObjectURL(file)}
                  alt="Upload preview"
                  className="w-full h-48 object-cover"
                />
              </div>
              <button
                type="button"
                onClick={() => setFile(null)}
                className="absolute top-2 right-2 bg-black/60 rounded-full p-1 text-white hover:bg-black/80"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Remove</span>
              </button>
              
              <div className="mt-4 space-y-3">
                <div>
                  <Label htmlFor="title" className="text-sm text-gray-700">
                    Title
                  </Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter a title for your photo"
                    className="mt-1"
                  />
                </div>
                
                {/* New fields for first name, last name, and email */}
                <div>
                  <Label htmlFor="firstName" className="text-sm text-gray-700">
                    First Name
                  </Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Enter your first name"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="lastName" className="text-sm text-gray-700">
                    Last Name
                  </Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Enter your last name"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="email" className="text-sm text-gray-700">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isUploading}>
            Cancel
          </Button>
          <Button onClick={handleUpload} disabled={!file || isUploading}>
            {isUploading ? 'Uploading...' : 'Upload Photo'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
