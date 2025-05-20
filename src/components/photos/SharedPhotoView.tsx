import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AlertCircle, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function SharedPhotoView() {
    const [searchParams] = useSearchParams();
    const presignedUrl = searchParams.get('url');
    const [photo, setPhoto] = useState({
        url: '',
        title: 'Shared Photo',
        loading: true,
        error: false,
        expired: false
    });
    const [expiryTime, setExpiryTime] = useState({
        timestamp: 0,
        formatted: '',
        remainingTime: ''
    });
    const [countdown, setCountdown] = useState('');

    useEffect(() => {
        // Extract and parse expiry time from the presigned URL
        if (presignedUrl) {
            try {
                // AWS presigned URLs typically contain an X-Amz-Expires parameter
                // and an X-Amz-Date parameter which together determine when the URL expires
                const url = new URL(presignedUrl);
                const expiresParam = url.searchParams.get('X-Amz-Expires');
                const dateParam = url.searchParams.get('X-Amz-Date');

                if (expiresParam && dateParam) {
                    // Parse AWS ISO8601 date format (YYYYMMDDTHHMMSSZ)
                    const year = dateParam.substring(0, 4);
                    const month = dateParam.substring(4, 6);
                    const day = dateParam.substring(6, 8);
                    const hour = dateParam.substring(9, 11);
                    const minute = dateParam.substring(11, 13);
                    const second = dateParam.substring(13, 15);

                    const startTime = new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}Z`);
                    const expiresInSeconds = parseInt(expiresParam);
                    const expiryTimestamp = startTime.getTime() + (expiresInSeconds * 1000);
                    const expiryDate = new Date(expiryTimestamp);

                    setExpiryTime({
                        timestamp: expiryTimestamp,
                        formatted: expiryDate.toLocaleString(),
                        remainingTime: formatRemainingTime(expiryTimestamp)
                    });
                } else {
                    // Fallback to default 3-hour expiry from now
                    const defaultExpiry = new Date(Date.now() + 3 * 60 * 60 * 1000);
                    setExpiryTime({
                        timestamp: defaultExpiry.getTime(),
                        formatted: defaultExpiry.toLocaleString(),
                        remainingTime: '3 hours'
                    });
                }
            } catch (error) {
                console.error("Error parsing URL expiry:", error);
                // Fallback to default expiry message
                const defaultExpiry = new Date(Date.now() + 3 * 60 * 60 * 1000);
                setExpiryTime({
                    timestamp: defaultExpiry.getTime(),
                    formatted: defaultExpiry.toLocaleString(),
                    remainingTime: '3 hours'
                });
            }
        }
    }, [presignedUrl]);

    // Set up countdown timer
    useEffect(() => {
        if (expiryTime.timestamp) {
            const timer = setInterval(() => {
                const now = Date.now();
                if (now >= expiryTime.timestamp) {
                    setCountdown('Expired');
                    clearInterval(timer);
                    // If the page is still showing the image but the countdown expires,
                    // mark it as expired to show the expired UI
                    if (!photo.expired && !photo.loading) {
                        setPhoto(prev => ({ ...prev, expired: true }));
                    }
                } else {
                    setCountdown(formatRemainingTime(expiryTime.timestamp));
                }
            }, 1000);

            return () => clearInterval(timer);
        }
    }, [expiryTime.timestamp, photo.expired, photo.loading]);

    // Format remaining time as "X hours Y minutes Z seconds"
    function formatRemainingTime(timestamp) {
        const now = Date.now();
        const difference = timestamp - now;

        if (difference <= 0) {
            return 'Expired';
        }

        const seconds = Math.floor((difference / 1000) % 60);
        const minutes = Math.floor((difference / (1000 * 60)) % 60);
        const hours = Math.floor((difference / (1000 * 60 * 60)));

        let result = '';
        if (hours > 0) result += `${hours} hour${hours > 1 ? 's' : ''} `;
        if (minutes > 0 || hours > 0) result += `${minutes} minute${minutes > 1 ? 's' : ''} `;
        result += `${seconds} second${seconds > 1 ? 's' : ''}`;

        return result;
    }

    useEffect(() => {
        const loadImage = async () => {
            if (!presignedUrl) {
                setPhoto(prev => ({ ...prev, loading: false, error: true }));
                return;
            }

            try {
                // Try to fetch the image from the presigned URL
                const response = await fetch(presignedUrl);
                console.log("Fetch photo response: ", response);

                if (!response.ok) {
                    // If response is not OK, check if it's expired (403 or 404)
                    if (response.status === 403 || response.status === 404) {
                        setPhoto(prev => ({ ...prev, loading: false, expired: true }));
                    } else {
                        setPhoto(prev => ({ ...prev, loading: false, error: true }));
                    }
                    return;
                }

                // If response is OK, get the blob
                const blob = await response.blob();
                const objectUrl = URL.createObjectURL(blob);

                setPhoto({
                    url: objectUrl,
                    title: 'Shared Photo',
                    loading: false,
                    error: false,
                    expired: false
                });
            } catch (error) {
                console.error("Error loading image:", error);
                setPhoto(prev => ({ ...prev, loading: false, error: true }));
            }
        };

        loadImage();

        // Clean up the object URL when component unmounts
        return () => {
            if (photo.url && photo.url.startsWith('blob:')) {
                URL.revokeObjectURL(photo.url);
            }
        };
    }, [presignedUrl]);

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <Card className="overflow-hidden bg-white shadow-lg rounded-lg">
                {/* Header */}
                <div className="p-6 border-b">
                    <h1 className="text-2xl font-bold ">Shared Photo</h1>
                    {!photo.expired && !photo.error && (
                        <div className="flex items-center text-gray-500 text-sm mt-1">
                            <Clock className="h-4 w-4 mr-1" />
                            <span>Expires in: </span>
                            <span className="font-medium ml-1">
                                {countdown || expiryTime.remainingTime || "3 hours"}
                            </span>
                        </div>
                    )}
                    {photo.expired && (
                        <p className="text-red-500 text-sm mt-1 flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            This shared link has expired
                        </p>
                    )}
                </div>

                {/* Content */}
                <div className="p-6">
                    {photo.loading ? (
                        <div className="flex flex-col items-center justify-center p-8">
                            <Skeleton className="h-[400px] w-full rounded-lg" />
                            <p className="mt-4 text-gray-500">Loading shared photo...</p>
                        </div>
                    ) : photo.expired ? (
                        <div className="flex flex-col items-center justify-center p-8 text-center">
                            <div className="h-20 w-20 rounded-full bg-red-50 flex items-center justify-center mb-4">
                                <AlertCircle className="h-10 w-10 text-red-500" />
                            </div>
                            <h2 className="text-xl font-semibold mb-2">Link Expired</h2>
                            <p className="text-gray-500 max-w-md">
                                This shared photo link has expired or is no longer available.
                                Shared links are valid for 3 hours from the time of creation.
                            </p>
                        </div>
                    ) : photo.error ? (
                        <div className="flex flex-col items-center justify-center p-8 text-center">
                            <div className="h-20 w-20 rounded-full bg-red-50 flex items-center justify-center mb-4">
                                <AlertCircle className="h-10 w-10 text-red-500" />
                            </div>
                            <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
                            <p className="text-gray-500 max-w-md">
                                We couldn't load this shared photo. The link might be invalid or there was an error processing your request.
                            </p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center">
                            <div className="w-full max-h-[600px] flex justify-center overflow-hidden rounded-lg">
                                <img
                                    src={photo.url}
                                    alt={photo.title}
                                    className="max-w-full max-h-[600px] object-contain rounded-md"
                                    onContextMenu={(e) => e.preventDefault()}
                                    draggable="false"
                                    style={{
                                        pointerEvents: "none",
                                        userSelect: "none",
                                        WebkitUserSelect: "none"
                                    }}
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer with branding */}
                <div className="p-6 bg-gray-50 border-t text-center">
                    <p className="text-sm text-gray-500">
                        Shared via <span className="font-semibold text-pink-500">PixPath</span>
                    </p>
                </div>
            </Card>
        </div>
    );
}
