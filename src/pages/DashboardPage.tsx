
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner";
import { Button } from '@/components/ui/button';
import { Upload, RefreshCw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/layout/Navigation';
import PhotoGrid from '@/components/photos/PhotoGrid';
import UploadModal from '@/components/photos/UploadModal';
import { useQueryClient } from '@tanstack/react-query';
import { photoApi } from '@/lib/api';
import {CognitoUserPool} from "amazon-cognito-identity-js";

export default function DashboardPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
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
          <PhotoGrid mode="active" onRefreshNeeded={handleRefresh} />
          
          {/* Upload Modal */}
          <UploadModal 
            open={uploadModalOpen} 
            onClose={() => setUploadModalOpen(false)} 
            onUploadComplete={handleRefresh}
          />
        </div>
      </main>
    </div>
  );
}
