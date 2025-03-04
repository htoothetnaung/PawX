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

  // ...
};