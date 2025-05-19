/* eslint-disable @typescript-eslint/no-explicit-any */

import { toast } from "sonner";
import { mockApiService } from './mockData';
import {CognitoUserPool} from "amazon-cognito-identity-js";
const API_URL = "https://photo.mscv2group2.link";  // Base API URL

// Type definitions
export interface Photo {
  id: string;
  url: string;
  thumbnail: string; // URL for thumbnail/watermarked version
  title: string;
  status: string;
  imageKey: string;
  createdAt: string;
  isRecycled: boolean;
  userId: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  pageSize: number;
  currentPage: number;
}

export interface ShareLinkResponse {
  presignedUrl: string;
  expiresAt: string;
}

// API error handling
const handleApiError = (error: any) => {
  console.error("API Error:", error);
  const message = error.message || "Something went wrong";
  toast.error(message);
  return Promise.reject(error);
};

// Toggle this to use mock data instead of real API
const USE_MOCK_API = false;

// API request helper with auth headers
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  try {
    // Get auth token (would be implemented with AWS Amplify Auth)
    // const token = await Auth.currentSession().then(session => session.getIdToken().getJwtToken());
    let token = ""; // Temporary placeholder
      const poolData = {
        UserPoolId: "us-east-1_Mrdz7CtUr",
        ClientId: "3mdokkab5ojqn4nuce6pd7n88s",
        };

      const userPool = new CognitoUserPool(poolData);
      const currentUser = userPool.getCurrentUser();
      if (currentUser) {
          currentUser.getSession((err, session) => {
              if (err) {
                  console.error('Session error:', err);
              } else {
                  console.log('Session valid:', session.isValid());
                  console.log('ID token:', session.getIdToken().getJwtToken());
                  token = session.getIdToken().getJwtToken();
              }
          });
      }
    const headers = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    };
    
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `API error: ${response.status}`);
    }
    
    return data;
  } catch (error) {
    return handleApiError(error);
  }
}

// Photo management APIs
export const photoApi = USE_MOCK_API ? mockApiService : {
  // Get active photos with pagination
  getPhotos: (page = 1, limit = 20, userId?: string): Promise<PaginatedResponse<Photo>> =>
      apiRequest(`/users/${userId}/images/active?page=${page}&limit=${limit}`),

  // Get recycled photos/users/{userId}/images/deleted
  getRecycledPhotos: (page = 1, limit = 20, userId?: string): Promise<PaginatedResponse<Photo>> => 
    apiRequest(`/users/${userId}/images/deleted?page=${page}&limit=${limit}`),
  
  // Upload a photo
  uploadPhoto: async (payload: any): Promise<Photo> => {
    return apiRequest("/upload", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  // Move photo to recycle bin
  recyclePhoto: (imageKey: string, userId: string): Promise<void> => 
    apiRequest(`/images/${imageKey}/delete?userId=${userId}`, {
      method: "POST",
      body: JSON.stringify({ imageKey }),
    }),
  
  // Restore photo from recycle bin
  recoverPhoto: (imageKey: string): Promise<void> => 
    apiRequest(`images/${imageKey}/restore`, {
      method: "POST",
      body: JSON.stringify({ imageKey }),
    }),
  
  // Delete photo permanently
  deletePhotoForever: (imageKey: string): Promise<void> => 
    apiRequest(`/images/${imageKey}/permanent-delete`, {
      method: "DELETE",
      body: JSON.stringify({ imageKey }),
    }),
  
  // Generate share link
  sharePhoto: (imageKey: string): Promise<ShareLinkResponse> => 
    apiRequest("/images/share", {
      method: "POST",
      body: JSON.stringify({imageKey}),
    }),
  
  // Get shared photo by token
  getSharedPhoto: (token: string): Promise<Photo> => 
    apiRequest(`/share/${token}`),
  
  // Optional: Check service health
  checkStatus: (): Promise<{ status: string; message?: string }> => 
    apiRequest("/status"),
};

export default photoApi;