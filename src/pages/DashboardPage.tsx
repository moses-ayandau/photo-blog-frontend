

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner";
import { Button } from '@/components/ui/button';
import { Upload, RefreshCw, X, Download, Share, Info } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/layout/Navigation';
import PhotoGrid from '@/components/photos/PhotoGrid';
import UploadModal from '@/components/photos/UploadModal';
import { useQueryClient } from '@tanstack/react-query';
import { photoApi, Photo } from '@/lib/api';
import {CognitoUserPool} from "amazon-cognito-identity-js";
import { Dialog, DialogContent } from '@/components/ui/dialog';

export default function DashboardPage() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [isGeneratingShareLink, setIsGeneratingShareLink] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);
  
  // Redirect to auth page if not authenticated
  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/auth');
    }
  }, [isAuthenticated, isLoading, navigate]);
  
  // Handle service status polling (optional feature)
  const [serviceStatus, setServiceStatus] = useState<{ status: string; message?: string } | null>(null);
  
  const checkServiceStatus = async () => {
    try {
      const status = await photoApi.checkStatus();
      setServiceStatus(status);
      
      if (status.status !== 'healthy') {
        toast.warning(status.message || 'There may be service disruptions');
      }
    } catch (error) {
      console.error('Failed to check service status', error);
    }
  };
  
  // Check status on mount
  React.useEffect(() => {
    //fetchData();
  }, []);
  
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await queryClient.invalidateQueries({ queryKey: ['photos'] });
      //await checkServiceStatus();
    } finally {
      setRefreshing(false);
    }
  };

  const handlePhotoClick = (photo: Photo) => {
    setSelectedPhoto(photo);
    setShareUrl('');
    setCopied(false);
  };
  
  const handleDownload = () => {
    if (!selectedPhoto) return;
    
    const link = document.createElement('a');
    link.href = selectedPhoto.url;
    link.download = selectedPhoto.title || 'downloaded-image';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Download started');
  };
  
  const handleGenerateShareLink = async () => {
    if (!selectedPhoto || !user) return;
    
    try {
      setIsGeneratingShareLink(true);
      const response = await photoApi.generateShareLink(selectedPhoto.imageKey, user.id);
      setShareUrl(response.shareUrl);
      toast.success('Share link generated! It expires in 3 hours');
    } catch (error) {
      toast.error('Failed to generate share link');
    } finally {
      setIsGeneratingShareLink(false);
    }
  };
  
  const handleCopyLink = async () => {
    if (!shareUrl) return;
    
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      
      // Reset copied state after 2 seconds
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };
  
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-1">My Photos</h1>
              <p className="text-gray-600">
                Manage and share your personal photo collection
              </p>
            </div>
            
            <div className="flex mt-4 md:mt-0 space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              
              <Button
                onClick={() => setUploadModalOpen(true)}
                className="flex items-center"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Photo
              </Button>
            </div>
          </div>
          
          {/* Service status alert */}
          {serviceStatus && serviceStatus.status !== 'healthy' && (
            <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-6">
              <div className="flex">
                <div>
                  <p className="text-sm text-amber-700">
                    {serviceStatus.message || 'There may be service disruptions at the moment. We are working on it.'}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Photo Grid */}
          <PhotoGrid 
            mode="active" 
            onRefreshNeeded={handleRefresh} 
            onPhotoClick={handlePhotoClick}
          />
          
          {/* Upload Modal */}
          <UploadModal 
            open={uploadModalOpen} 
            onClose={() => setUploadModalOpen(false)} 
            onUploadComplete={handleRefresh}
          />

          {/* Photo View Modal */}
          <Dialog open={!!selectedPhoto} onOpenChange={(open) => !open && setSelectedPhoto(null)}>
            <DialogContent className="sm:max-w-5xl p-0 overflow-hidden bg-black/95 border-gray-800 text-white">
              {selectedPhoto && (
                <div className="flex flex-col h-full">
                  {/* Top bar with close button */}
                  <div className="flex justify-between items-center p-4 border-b border-gray-800">
                    <h3 className="text-lg font-medium text-white truncate max-w-[80%]">
                      {selectedPhoto.title || "Untitled Photo"}
                    </h3>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="rounded-full text-gray-400 hover:text-white hover:bg-gray-800"
                      onClick={() => setSelectedPhoto(null)}
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                  
                  {/* Image container */}
                  <div className="flex-grow flex items-center justify-center p-4 bg-black/50">
                    <img 
                      src={selectedPhoto.url} 
                      alt={selectedPhoto.title || "Photo"} 
                      className="max-h-[70vh] max-w-full object-contain rounded-md shadow-lg"
                    />
                  </div>
                  
                  {/* Bottom action bar */}
                  <div className="p-4 border-t border-gray-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    {/* Photo info */}
                    <div className="flex items-center text-sm text-gray-400">
                      <Info className="h-4 w-4 mr-2" />
                      <span>
                        Uploaded on {new Date(selectedPhoto.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    
                    {/* Action buttons */}
                    <div className="flex items-center space-x-2 w-full sm:w-auto">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
                        onClick={handleDownload}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                      
                      {!shareUrl ? (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
                          onClick={handleGenerateShareLink}
                          disabled={isGeneratingShareLink}
                        >
                          {isGeneratingShareLink ? (
                            <span className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-gray-400 border-t-transparent"></span>
                          ) : (
                            <Share className="h-4 w-4 mr-2" />
                          )}
                          Share
                        </Button>
                      ) : (
                        <div className="flex items-center space-x-2 flex-1">
                          <input
                            type="text"
                            value={shareUrl}
                            readOnly
                            className="flex h-9 w-full rounded-md border border-gray-700 bg-gray-900 px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-400"
                          />
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className={`border-gray-700 ${copied ? 'text-green-500' : 'text-gray-300'} hover:bg-gray-800 hover:text-white`}
                            onClick={handleCopyLink}
                          >
                            {copied ? 'Copied!' : 'Copy'}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </main>
    </div>
  );
}
