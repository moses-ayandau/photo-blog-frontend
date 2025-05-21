

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner";
import { Button } from '@/components/ui/button';
import { Upload, RefreshCw, Info } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/layout/Navigation';
import PhotoGrid from '@/components/photos/PhotoGrid';
import UploadModal from '@/components/photos/UploadModal';
import { useQueryClient } from '@tanstack/react-query';
import { photoApi, Photo } from '@/lib/api';
import { Dialog, DialogContent } from '@/components/ui/dialog';

export default function DashboardPage() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

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
      setTimeout(async () => {
        await queryClient.invalidateQueries({ queryKey: ['photos'] });
      },4000)
      //await checkServiceStatus();
    } finally {
      setRefreshing(false);
    }
  };

  const handlePhotoClick = (photo: Photo) => {
    setSelectedPhoto(photo);
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
          <Dialog
            open={!!selectedPhoto}
            onOpenChange={(open) => {
              if (!open) setSelectedPhoto(null);
            }}
          >
            <DialogContent className="max-w-xl 2xl:max-w-2xl p-0 overflow-hidden bg-white rounded-lg shadow-xl">
              {selectedPhoto && (
                <div className="flex flex-col h-full">
                  {/* Top bar with close button */}
                  <div className="flex justify-between items-center p-4 bg-white border-b">
                    <h3 className="text-lg font-medium text-gray-800 truncate max-w-[80%]">
                      {selectedPhoto.title || "Untitled Photo"}
                    </h3>
                  </div>
                  {/* Image container */}
                  <div className="flex-grow flex items-center justify-center p-6 bg-gray-50">
                    <img
                      src={selectedPhoto.url}
                      alt={selectedPhoto.title || "Photo"}
                      className="max-h-[70vh] max-w-full object-contain rounded-md shadow-md"
                    />
                  </div>

                  {/* Bottom action bar */}
                  <div className="p-4 bg-white border-t flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    {/* Photo info */}
                    <div className="flex items-center text-sm text-gray-600">
                      <Info className="h-4 w-4 mr-2 text-blue-400" />
                      <span>
                        Uploaded on {new Date(selectedPhoto.processedDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
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
