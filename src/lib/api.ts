const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5173';

// You can organize your API calls by feature
export const aiApi = {
  // Pet-related endpoints
  pets: {
    async recommend(preferences: any) {
      try {
        const response = await fetch(`${API_BASE_URL}/recommend-pets`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(preferences),
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(errorData?.detail || `HTTP error! status: ${response.status}`);
        }
        
        return response.json();
      } catch (error) {
        console.error('Recommend API Error:', error);
        throw error;
      }
    },

    async findMatches(image: File) {
      try {
        const formData = new FormData();
        formData.append('uploaded_file', image);
        
        // Add file validation
        const validImageTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        if (!validImageTypes.includes(image.type)) {
          throw new Error('Please upload a valid image file (JPEG, PNG)');
        }

        // Add size validation (e.g., max 5MB)
        const maxSize = 5 * 1024 * 1024; // 5MB in bytes
        if (image.size > maxSize) {
          throw new Error('Image size should be less than 5MB');
        }

        const response = await fetch(`${API_BASE_URL}/find-matching-pets`, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          // Handle specific error messages from backend
          if (errorData?.detail?.includes('PIL')) {
            throw new Error('Server configuration error. Please try again later.');
          }
          throw new Error(errorData?.detail || `Failed to process image (Status: ${response.status})`);
        }

        return response.json();
      } catch (error) {
        console.error('Find Matches API Error:', error);
        throw error;
      }
    }
  },

  // You can add more API categories here
  // tts: { ... },
  // imageProcessing: { ... },

  // Add map-related interfaces
  map: {
    // Reports
    async getReports() {
      try {
        const response = await fetch(`${API_BASE_URL}/reports`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      } catch (error) {
        console.error('Get Reports Error:', error);
        throw error;
      }
    },

    async submitReport(report: Report) {
      try {
        const response = await fetch(`${API_BASE_URL}/reports`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(report),
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      } catch (error) {
        console.error('Submit Report Error:', error);
        throw error;
      }
    },

    async updateReport(id: number, status: string) {
      try {
        const response = await fetch(`${API_BASE_URL}/reports/${id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status }),
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      } catch (error) {
        console.error('Update Report Error:', error);
        throw error;
      }
    },

    // Shelters
    async getShelters() {
      try {
        const response = await fetch(`${API_BASE_URL}/shelters`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      } catch (error) {
        console.error('Get Shelters Error:', error);
        throw error;
      }
    },

    async submitShelter(shelter: Shelter) {
      try {
        const response = await fetch(`${API_BASE_URL}/shelters`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(shelter),
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      } catch (error) {
        console.error('Submit Shelter Error:', error);
        throw error;
      }
    },

    // Deliveries
    async getDeliveries() {
      try {
        const response = await fetch(`${API_BASE_URL}/deliveries`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      } catch (error) {
        console.error('Get Deliveries Error:', error);
        throw error;
      }
    },

    async submitDelivery(delivery: Delivery) {
      try {
        const response = await fetch(`${API_BASE_URL}/deliveries`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(delivery),
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      } catch (error) {
        console.error('Submit Delivery Error:', error);
        throw error;
      }
    },

    async updateDelivery(id: number, status: string) {
      try {
        const response = await fetch(`${API_BASE_URL}/deliveries/${id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status }),
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      } catch (error) {
        console.error('Update Delivery Error:', error);
        throw error;
      }
    },
  },
};

// Add your map-related interfaces
export interface Report {
  id?: number;
  lat: number;
  lng: number;
  description: string;
  township: string;
  petType: 'lost' | 'injured';
  status: string;
  pending: string;
  invoice_num: number;
}

export interface Shelter {
  id: number;
  name: string;
  lat: number;
  lng: number;
  contact: string;
}

export interface Delivery {
  id: number;
  lat: number;
  lng: number;
  shelterId: number;
  invoiceNum: number[];
  status: string;
  shopName: string[];
  driverName: string;
  driverContact: string;
} 