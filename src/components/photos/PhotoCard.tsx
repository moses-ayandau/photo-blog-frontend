
import React from 'react';
import { toast } from "sonner";
import { useNavigate } from 'react-router-dom';
import { Trash2, Share, Recycle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Photo, photoApi } from '@/lib/api';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface PhotoCardProps {
  photo: Photo;
  onDeleted?: () => void;
  onRecovered?: () => void;
  onPermanentDelete?: () => void;
}

export default function PhotoCard({ 
  photo, 
  onDeleted, 
  onRecovered, 
  onPermanentDelete 
}: PhotoCardProps) {
  const navigate = useNavigate();

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      const response = await photoApi.sharePhoto(photo.imageKey);
      console.log("Share link response:", response);
      
      // Create full shareable URL
      const shareUrl = response?.presignedUrl;
      
      // Copy URL to clipboard
      await navigator.clipboard.writeText(shareUrl);
    
      
      toast.success(`Link copied to clipboard! Expires in 3 hours`);
    } catch (error) {
      toast.error("Failed to generate share link");
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      await photoApi.recyclePhoto(photo.id);
      toast.success("Photo moved to recycle bin");
      if (onDeleted) onDeleted();
    } catch (error) {
      toast.error("Failed to move photo to recycle bin");
    }
  };

  const handleRecover = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      await photoApi.recoverPhoto(photo.id);
      toast.success("Photo recovered successfully");
      if (onRecovered) onRecovered();
    } catch (error) {
      toast.error("Failed to recover photo");
    }
  };

  const handlePermanentDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      await photoApi.deletePhotoForever(photo.id);
      toast.success("Photo permanently deleted");
      if (onPermanentDelete) onPermanentDelete();
    } catch (error) {
      toast.error("Failed to delete photo permanently");
    }
  };

  // Determine aspect ratio class based on image dimensions (could be dynamic)
  const aspectRatioClass = Math.random() > 0.5 ? "aspect-[3/4]" : Math.random() > 0.5 ? "aspect-square" : "aspect-[4/3]";

  return (
    <div className={`photo-card ${photo.status === "inactive" ? 'recycled' : ''} animate-fade-in`}>
      <div className={aspectRatioClass}>
        <img 
          src={photo.url}
          alt={photo.title || "Photo"} 
          className="object-cover w-full h-full rounded-xl"
        />
      </div>
      
      <div className="card-overlay">
        <div className="flex justify-between items-center">
          <h3 className="text-white font-medium truncate">{photo.title}</h3>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full bg-black/30 hover:bg-black/50 text-white h-8 w-8">
                <span className="sr-only">Open menu</span>
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4">
                  <path d="M3.625 7.5C3.625 8.12132 3.12132 8.625 2.5 8.625C1.87868 8.625 1.375 8.12132 1.375 7.5C1.375 6.87868 1.87868 6.375 2.5 6.375C3.12132 6.375 3.625 6.87868 3.625 7.5ZM8.625 7.5C8.625 8.12132 8.12132 8.625 7.5 8.625C6.87868 8.625 6.375 8.12132 6.375 7.5C6.375 6.87868 6.87868 6.375 7.5 6.375C8.12132 6.375 8.625 6.87868 8.625 7.5ZM13.625 7.5C13.625 8.12132 13.1213 8.625 12.5 8.625C11.8787 8.625 11.375 8.12132 11.375 7.5C11.375 6.87868 11.8787 6.375 12.5 6.375C13.1213 6.375 13.625 6.87868 13.625 7.5Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                </svg>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {photo.status === "active" && (
                <>
                  <DropdownMenuItem onClick={handleShare} className="cursor-pointer">
                    <Share className="mr-2 h-4 w-4" />
                    <span>Share</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDelete} className="cursor-pointer text-red-500 focus:text-red-500">
                    <Trash2 className="mr-2 h-4 w-4" />
                    <span>Move to Recycle Bin</span>
                  </DropdownMenuItem>
                </>
              )}
              
              {photo.status === "inactive" && (
                <>
                  <DropdownMenuItem onClick={handleRecover} className="cursor-pointer">
                    <Recycle className="mr-2 h-4 w-4" />
                    <span>Recover Photo</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handlePermanentDelete} className="cursor-pointer text-red-500 focus:text-red-500">
                    <Trash2 className="mr-2 h-4 w-4" />
                    <span>Delete Permanently</span>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div className="flex mt-2">
          {photo.status === "active" && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="mr-2 bg-white/20 hover:bg-white/40 text-white border-none"
                onClick={handleShare}
              >
                <Share className="h-4 w-4 mr-1" />
                Share
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                className="bg-white/20 hover:bg-white/40 text-white border-none"
                onClick={handleDelete}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Recycle
              </Button>
            </>
          )}
          
          {photo.status === "inactive" && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="mr-2 bg-white/20 hover:bg-white/40 text-white border-none"
                onClick={handleRecover}
              >
                <Recycle className="h-4 w-4 mr-1" />
                Recover
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                className="bg-white/20 hover:bg-white/40 text-white border-none"
                onClick={handlePermanentDelete}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
