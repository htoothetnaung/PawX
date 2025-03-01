'use client';

import { useState, useRef, useEffect } from 'react';
import { aiApi } from '@/lib/api';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageWithFallback } from '@/components/ui/image-with-fallback';
import { PLACEHOLDER_IMAGE, API_BASE_URL } from '@/lib/constants';

export default function AIPage() {
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showStreamlit, setShowStreamlit] = useState(false); // State to toggle visibility

  const streamlitAppUrl = "https://pet-image-analyzer.streamlit.app/?embedded=true";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData(e.currentTarget);
      const preferences = {
        Type: formData.get('Type'),
        Gender: formData.get('Gender'),
        'Age(months)': parseInt(formData.get('Age')?.toString() || '0'),
        MaturitySize: formData.get('MaturitySize'),
        FurLength: formData.get('FurLength'),
        Fee: parseInt(formData.get('Fee')?.toString() || '0'),
        Color1_Name: formData.get('Color1_Name'),
      };
      
      if (!preferences.Type || !preferences.Gender || !preferences.MaturitySize) {
        setError('Please fill in all required fields');
        return;
      }

      const data = await aiApi.pets.recommend(preferences);
      setResults(data);
    } catch (err) {
      console.error('Error details:', err);
      setError(err instanceof Error ? err.message : 'Failed to get recommendations');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      console.log('Starting image upload:', file.name);
      const data = await aiApi.pets.findMatches(file);
      console.log('Received response:', data);
      setResults(data);
    } catch (err) {
      console.error('Image upload error:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } finally {
      setLoading(false);
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-center">Our AI Models</h1>
      <p className="text-center text-gray-600 mb-4">
        Our Recommendation model is designed to help you find the perfect pet for your family.
      </p>
      <p className="text-center text-gray-600 mb-4">
        Our Matching model is designed to help you find your lost pets in our shelter database.
      </p>

      {/* Button to Toggle Streamlit App Link with Debug */}
      <div className="text-center mb-6">
        <Button
          onClick={() => {
            console.log("Toggling showStreamlit to:", !showStreamlit);
            setShowStreamlit(!showStreamlit);
          }}
        >
          {showStreamlit ? 'Hide Image Analyzer' : 'Show Pet Image Analyzer'}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Pet Recommendations Form */}
        <Card className="p-4">
          <h2 className="text-xl font-semibold mb-4">Get Pet Recommendations</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Pet Type</label>
              <Select name="Type">
                <SelectTrigger>
                  <SelectValue placeholder="Select pet type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Dog">Dog</SelectItem>
                  <SelectItem value="Cat">Cat</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Gender</label>
              <Select name="Gender">
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Age (months)</label>
              <Input 
                name="Age" 
                type="number"
                min="0"
                placeholder="Age in months"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Maturity Size</label>
              <Select name="MaturitySize">
                <SelectTrigger>
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Small">Small</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Large">Large</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Fur Length</label>
              <Select name="FurLength">
                <SelectTrigger>
                  <SelectValue placeholder="Select fur length" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Short">Short</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Long">Long</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Fee</label>
              <Input 
                name="Fee" 
                type="number"
                min="0"
                placeholder="Maximum fee"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Color</label>
              <Select name="Color1_Name">
                <SelectTrigger>
                  <SelectValue placeholder="Select color" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Black">Black</SelectItem>
                  <SelectItem value="White">White</SelectItem>
                  <SelectItem value="Brown">Brown</SelectItem>
                  <SelectItem value="Golden">Golden</SelectItem>
                  <SelectItem value="Gray">Gray</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" disabled={loading}>
              {loading ? 'Processing...' : 'Get Recommendations'}
            </Button>
          </form>
        </Card>

        {/* Pet Matching Upload */}
        <Card className="p-4">
          <h2 className="text-xl font-semibold mb-4">Find Matching Pets</h2>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Upload a pet image to find similar pets in our database
            </p>
            <form className="space-y-4">
              <div className="flex flex-col items-center gap-4">
                <div className="relative w-96"> {/* Increased to w-96 (384px) */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileChange}
                    accept="image/jpeg,image/png,image/jpg"
                    disabled={loading}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="flex flex-col items-center justify-center w-full h-48 px-4 transition bg-white border-2 border-gray-300 border-dashed rounded-md appearance-none cursor-pointer hover:border-gray-400 focus:outline-none" // Increased to h-48 (192px)
                  >
                    {imagePreview ? (
                      <div className="relative w-full h-full">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-full object-contain rounded-md"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            setImagePreview(null);
                            setSelectedFile(null);
                            if (fileInputRef.current) {
                              fileInputRef.current.value = '';
                            }
                          }}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-1 text-center">
                        <svg
                          className="mx-auto h-12 w-12 text-gray-400"
                          stroke="currentColor"
                          fill="none"
                          viewBox="0 0 48 48"
                          aria-hidden="true"
                        >
                          <path
                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <div className="flex text-sm text-gray-600">
                          <span className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-primary-dark focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary">
                            Upload a file
                          </span>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                      </div>
                    )}
                  </label>
                </div>

                <Button 
                  type="button" 
                  disabled={loading || !selectedFile}
                  onClick={() => selectedFile && handleImageUpload(selectedFile)}
                  className="w-96" // Increased to w-96 (384px)
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Processing...
                    </div>
                  ) : (
                    'Find Matching Pets'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </Card>

        {/* Error Display */}
        {error && (
          <Card className="p-4 bg-red-50 border-red-200 col-span-2">
            <div className="text-red-600">
              <h3 className="font-semibold">Error</h3>
              <p>{error}</p>
            </div>
          </Card>
        )}

        {/* Loading State */}
        {loading && (
          <Card className="p-4 col-span-2">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              <span className="ml-2">Processing...</span>
            </div>
          </Card>
        )}

        {/* Results Display */}
        {results && (
          <Card className="p-4 col-span-2">
            <h2 className="text-xl font-semibold mb-4">Results</h2>
            {results.recommendations ? (
              <div className="grid gap-4 md:grid-cols-3">
                {results.recommendations.map((pet: any, index: number) => (
                  <Card key={index} className="p-4">
                    <div className="relative h-48 mb-4">
                      <ImageWithFallback
                        src={pet.images?.[0] || `${API_BASE_URL}/images/${pet.image_url?.split('/').pop()}`}
                        alt={pet.name || 'Pet'}
                        fallbackSrc={PLACEHOLDER_IMAGE}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-semibold">{pet.name || 'Unknown'}</h3>
                      <p className="text-sm text-gray-600">Breed: {pet.breed || 'Unknown'}</p>
                      <p className="text-sm text-gray-600">Type: {pet.type || 'Unknown'}</p>
                      <p className="text-sm text-gray-600">Gender: {pet.gender || 'Unknown'}</p>
                      <p className="text-sm text-gray-600">Age: {pet.age || 0} months</p>
                      <p className="text-sm text-gray-600">Color: {pet.color || 'Unknown'}</p>
                      <p className="text-sm text-gray-600">Size: {pet.maturity_size || 'Unknown'}</p>
                      <p className="text-sm text-gray-600">Fur: {pet.fur_length || 'Unknown'}</p>
                      <p className="text-sm text-gray-600">Health: {pet.health || 'Unknown'}</p>
                      {pet.similarity !== undefined && (
                        <p className="text-sm font-semibold mt-2">
                          Match: {(pet.similarity * 100).toFixed(1)}%
                        </p>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            ) : results.matches ? (
              <div className="grid gap-4 md:grid-cols-3">
                {results.matches.map((pet: any, index: number) => (
                  <Card key={index} className="p-4">
                    <div className="relative h-48 mb-4">
                      <ImageWithFallback
                        src={`${API_BASE_URL}/images/${pet.image_url.split('/').pop()}`}
                        alt={pet.name || 'Pet'}
                        fallbackSrc={PLACEHOLDER_IMAGE}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-semibold">{pet.name || 'Unknown'}</h3>
                      <p className="text-sm text-gray-200">Breed: {pet.breed || 'Unknown'}</p>
                      <p className="text-sm text-gray-600">Type: {pet.type || 'Unknown'}</p>
                      <p className="text-sm text-gray-600">Gender: {pet.gender || 'Unknown'}</p>
                      <p className="text-sm text-gray-600">Age: {pet.age || 0} months</p>
                      <p className="text-sm text-gray-600">Color: {pet.color || 'Unknown'}</p>
                      <p className="text-sm text-gray-600">Size: {pet.maturity_size || 'Unknown'}</p>
                      <p className="text-sm text-gray-600">Fur: {pet.fur_length || 'Unknown'}</p>
                      <p className="text-sm text-gray-600">Health: {pet.health || 'Unknown'}</p>
                      {pet.similarity !== undefined && (
                        <p className="text-sm font-semibold mt-2">
                          Match: {(pet.similarity * 100).toFixed(1)}%
                        </p>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center p-4">
                <p className="text-gray-600">{results.message}</p>
                <Button 
                  className="mt-4"
                  onClick={() => {
                    setResults(null);
                    setSelectedFile(null);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = '';
                    }
                  }}
                >
                  Try Again
                </Button>
              </div>
            )}
          </Card>
        )}

        {/* Streamlit App Iframe (Shown only when toggled) */}
        {showStreamlit && (
          <Card className="mt-6 p-0 col-span-2" style={{ border: 'none', boxShadow: 'none' }}>
            <div className="w-full">
              <iframe
                src={streamlitAppUrl}
                width="100%"
                height="1000px"
                className="border-0"
                title="Pet Image Analyzer"
                style={{ margin: 0, padding: 0 }}
              ></iframe>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}