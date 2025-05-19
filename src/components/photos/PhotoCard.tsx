import React, { useState } from 'react';
import { toast } from "sonner";
import { useNavigate } from 'react-router-dom';
import { Trash2, Share, Recycle, Copy, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Photo, photoApi } from '@/lib/api';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

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
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRecovering, setIsRecovering] = useState(false);
  const [isPermanentDeleting, setIsPermanentDeleting] = useState(false);

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setShareDialogOpen(true);
    setIsGeneratingLink(true);
    setShareUrl('');
    setCopied(false);
    
    try {
      const response = await photoApi.sharePhoto(photo.imageKey);
      console.log("Share link response:", response);
      
      const presignedUrl = response?.presignedUrl;
      
      const baseUrl = window.location.origin;
      const customShareUrl = `${baseUrl}/shared-photo?url=${encodeURIComponent(presignedUrl)}`;
      
      setShareUrl(customShareUrl);
      setIsGeneratingLink(false);
    } catch (error) {
      setIsGeneratingLink(false);
      toast.error("Failed to generate share link");
      setShareDialogOpen(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Link copied to clipboard! It expires in 3 hours");
      
      // Reset copied state after 2 seconds
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      toast.error("Failed to copy link");
    }
  };

  const handleCloseDialog = () => {
    setShareDialogOpen(false);
    setShareUrl('');
    setCopied(false);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      await photoApi.recyclePhoto(photo.imageKey, photo.userId);
      toast.success("Photo moved to recycle bin");
      if (onDeleted) onDeleted();
    } catch (error) {
      toast.error("Failed to move photo to recycle bin");
    }
  };

  const handleRecover = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      await photoApi.recoverPhoto(photo.imageKey, photo.userId);
      toast.success("Photo recovered successfully");
      if (onRecovered) onRecovered();
    } catch (error) {
      toast.error("Failed to recover photo");
    }
  };

  const handlePermanentDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      await photoApi.deletePhotoForever(photo.imageKey, photo.userId);
      toast.success("Photo permanently deleted");
      if (onPermanentDelete) onPermanentDelete();
    } catch (error) {
      toast.error("Failed to delete photo permanently");
    }
  };

  // Determine aspect ratio class based on image dimensions (could be dynamic)
  const aspectRatioClass = Math.random() > 0.5 ? "aspect-[3/4]" : Math.random() > 0.5 ? "aspect-square" : "aspect-[4/3]";

  return (
    <>
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
                    <DropdownMenuItem 
                      onClick={handleDelete} 
                      className="cursor-pointer text-red-500 focus:text-red-500"
                      disabled={isDeleting}
                    >
                      {isDeleting ? (
                        <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-red-500 border-t-transparent"></span>
                      ) : (
                        <Trash2 className="mr-2 h-4 w-4" />
                      )}
                      <span>Move to Recycle Bin</span>
                    </DropdownMenuItem>
                  </>
                )}
                
                {photo.status === "inactive" && (
                  <>
                    <DropdownMenuItem 
                      onClick={handleRecover} 
                      className="cursor-pointer"
                      disabled={isRecovering}
                    >
                      {isRecovering ? (
                        <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                      ) : (
                        <Recycle className="mr-2 h-4 w-4" />
                      )}
                      <span>Recover Photo</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={handlePermanentDelete} 
                      className="cursor-pointer text-red-500 focus:text-red-500"
                      disabled={isPermanentDeleting}
                    >
                      {isPermanentDeleting ? (
                        <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-red-500 border-t-transparent"></span>
                      ) : (
                        <Trash2 className="mr-2 h-4 w-4" />
                      )}
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
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <span className="h-4 w-4 mr-1 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                  ) : (
                    <Trash2 className="h-4 w-4 mr-1" />
                  )}
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
                  disabled={isRecovering}
                >
                  {isRecovering ? (
                    <span className="h-4 w-4 mr-1 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                  ) : (
                    <Recycle className="h-4 w-4 mr-1" />
                  )}
                  Recover
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white/20 hover:bg-white/40 text-white border-none"
                  onClick={handlePermanentDelete}
                  disabled={isPermanentDeleting}
                >
                  {isPermanentDeleting ? (
                    <span className="h-4 w-4 mr-1 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                  ) : (
                    <Trash2 className="h-4 w-4 mr-1" />
                  )}
                  Delete
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Share Link Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share Photo</DialogTitle>
          </DialogHeader>
          
          {isGeneratingLink ? (
            <div className="flex flex-col items-center justify-center py-6">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              <p className="mt-4 text-sm text-gray-500">Generating share link...</p>
            </div>
          ) : (
            <div className="flex flex-col space-y-4">
              <div className="flex items-center p-1">
                <img 
                  src={photo.url} 
                  alt={photo.title || "Photo"} 
                  className="h-16 w-16 rounded-md object-cover mr-3" 
                />
                <div>
                  <h4 className="font-medium">{photo.title || "Shared Photo"}</h4>
                  <p className="text-sm text-gray-500">Link expires in 3 hours</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="grid flex-1 gap-2">
                  <Input
                    readOnly
                    value={shareUrl}
                    className="h-9"
                  />
                </div>
                <Button type="submit" size="sm" onClick={handleCopyLink} className="px-3">
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          )}
          
          <DialogFooter className="sm:justify-between">
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Close
              </Button>
            </DialogClose>
            {!isGeneratingLink && (
              <Button type="button" onClick={handleCopyLink}>
                {copied ? "Copied!" : "Copy Link"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
