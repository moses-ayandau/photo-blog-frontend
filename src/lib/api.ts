
import { toast } from "sonner";
import { mockApiService } from './mockData';
import {CognitoUserPool} from "amazon-cognito-identity-js";

const API_URL = "https://photo.mscv2group2.link"; // Base API URL

// Type definitions
export interface Photo {
  id: string;
  url: string;
  thumbnail: string; // URL for thumbnail/watermarked version
  title: string;
  createdAt: string;
  isRecycled: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  pageSize: number;
  currentPage: number;
}

export interface ShareLinkResponse {
  url: string;
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
const USE_MOCK_API = true;

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
          UserPoolId: 'us-east-1_GRg49C8H6',
          ClientId: 'dhk236icjq8oclf3ll6kemlnr',
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
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    return handleApiError(error);
  }
}

// Photo management APIs
export const photoApi = USE_MOCK_API ? mockApiService : {
  // Get active photos with pagination
  getPhotos: (page = 1, limit = 20): Promise<PaginatedResponse<Photo>> => 
    apiRequest(`/images?page=${page}&limit=${limit}`),
  
  // Get recycled photos
  getRecycledPhotos: (page = 1, limit = 20): Promise<PaginatedResponse<Photo>> => 
    apiRequest(`/recycle/images?page=${page}&limit=${limit}`),
  
  // Upload a photo
  uploadPhoto: async (file: File): Promise<Photo> => {
    const formData = new FormData();
    formData.append("file", file);
    
    return apiRequest("/upload", {
      method: "POST",
      body: formData,
      headers: {}, // Let browser set content type for FormData
    });
  },
  
  // Move photo to recycle bin
  recyclePhoto: (photoId: string): Promise<void> => 
    apiRequest("/recycle/delete", {
      method: "POST",
      body: JSON.stringify({ photoId }),
    }),
  
  // Restore photo from recycle bin
  recoverPhoto: (photoId: string): Promise<void> => 
    apiRequest("/recycle/recover", {
      method: "POST",
      body: JSON.stringify({ photoId }),
    }),
  
  // Delete photo permanently
  deletePhotoForever: (photoId: string): Promise<void> => 
    apiRequest("/recycle/permanentdelete", {
      method: "POST",
      body: JSON.stringify({ photoId }),
    }),
  
  // Generate share link
  sharePhoto: (photoId: string): Promise<ShareLinkResponse> => 
    apiRequest("/share", {
      method: "POST",
      body: JSON.stringify({ photoId }),
    }),
  
  // Get shared photo by token
  getSharedPhoto: (token: string): Promise<Photo> => 
    apiRequest(`/share/${token}`),
  
  // Optional: Check service health
  checkStatus: (): Promise<{ status: string; message?: string }> => 
    apiRequest("/status"),
};

export default photoApi;
