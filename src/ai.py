from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
import uvicorn
import pandas as pd
import numpy as np
import os
import cv2
import h5py
from tensorflow.keras.applications.vgg16 import VGG16, preprocess_input
from tensorflow.keras.preprocessing.image import load_img, img_to_array
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer

app = FastAPI()

# Load the dataset globally
try:
    data = pd.read_csv("input/cleaned_data.csv")
    print(f"Successfully loaded data with {len(data)} records")
    
    # Check if images directory exists
    if not os.path.exists("input/images"):
        print("Warning: input/images directory not found!")
        os.makedirs("input/images", exist_ok=True)
    
    # Check first few image paths
    sample_paths = data['image_paths'].head()
    for path in sample_paths:
        # Convert string representation of list to actual list
        paths = eval(path) if isinstance(path, str) else path
        for img_path in paths:
            if not os.path.exists(img_path):
                print(f"Warning: Image not found: {img_path}")
            else:
                print(f"Found image: {img_path}")

except Exception as e:
    print(f"Error loading CSV file: {e}")
    raise

# Allow CORS for Streamlit frontend
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["http://localhost:5173"],
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# Allow CORS for next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve images from a directory
IMAGE_FOLDER = "input/images"

# Preprocessing pipeline
def preprocess_data(data, user_preferences):
    features = ['Type', 'Age(months)', 'Gender', 'MaturitySize', 'FurLength', 'Fee', 'Color1_Name']
    numeric_features = ['Age(months)', 'Fee']
    categorical_features = ['Type', 'Gender', 'MaturitySize', 'FurLength', 'Color1_Name', 'Fee']

    preprocessor = ColumnTransformer(
        transformers=[
            ('num', StandardScaler(), numeric_features),
            ('cat', OneHotEncoder(handle_unknown='ignore'), categorical_features)
        ]
    )

    X_preprocessed = preprocessor.fit_transform(data[features])
    user_input = pd.DataFrame([user_preferences])
    user_input_encoded = preprocessor.transform(user_input)

    return X_preprocessed, user_input_encoded

# API endpoint for serving images
@app.get("/images/{image_name}")
async def get_image(image_name: str):
    image_path = os.path.join(IMAGE_FOLDER, image_name)
    if os.path.exists(image_path):
        return FileResponse(image_path)
    return {"error": "Image not found"}


# API endpoint for recommendations
@app.post("/recommend-pets")
async def recommend_pets(user_preferences: dict):
    data = load_data()
    X_preprocessed, user_input_encoded = preprocess_data(data, user_preferences)
    similarity_scores = cosine_similarity(user_input_encoded, X_preprocessed)[0]
    data['Similarity'] = similarity_scores

    # Filter top recommendations
    top_recommendations = data[
        (data['Gender'] == user_preferences['Gender']) & 
        (data['Type'] == user_preferences['Type']) & 
        (data['MaturitySize'] == user_preferences['MaturitySize']) &
        (data['FurLength'] == user_preferences['FurLength']) &  
        (data['Color1_Name'] == user_preferences['Color1_Name']) &  
        (data['Similarity'] > 0.7)
    ].sort_values('Similarity', ascending=False)

    # Prepare response
    recommendations = []
    for _, pet in top_recommendations.iterrows():
        valid_images = []
        
        if isinstance(pet['image_paths'], str):
            image_paths = pet['image_paths'].strip("[]").replace("'", "").split(", ")
            for image_path in image_paths:
                image_name = os.path.basename(image_path)
                valid_images.append(f"http://localhost:8000/images/{image_name}")  # Updated URL
        
        if valid_images:
            recommendations.append({
                "name": pet['Name'],
                "breed": pet['Breed1_Name'],
                "similarity": float(pet['Similarity']),
                "type": pet['Type'],
                "gender": pet['Gender'],
                "age": int(pet['Age(months)']),
                "color": pet['Color1_Name'],
                "maturity_size": pet['MaturitySize'],
                "fur_length": pet['FurLength'],
                "fee": float(pet['Fee']),
                "health": pet['Health'],
                "images": valid_images[:3]  # Limit to 3 images
            })

    return {"recommendations": recommendations}





# Load pre-trained model (VGG16)
model = VGG16(include_top=False, input_shape=(224, 224, 3))

def extract_features(image_path):
    """Extract features using VGG16 model."""
    img = load_img(image_path, target_size=(224, 224))
    img_array = img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0)
    img_array = preprocess_input(img_array)
    features = model.predict(img_array)
    return features.flatten()

def generate_features_file(image_folder="input/images", output_file="found_pet_features.h5"):
    """Generate features file from images."""
    file_paths = []
    features_list = []
    
    # Get all image files
    for filename in os.listdir(image_folder):
        if filename.lower().endswith(('.png', '.jpg', '.jpeg')):
            image_path = os.path.join(image_folder, filename)
            try:
                features = extract_features(image_path)
                file_paths.append(image_path)
                features_list.append(features)
            except Exception as e:
                print(f"Error processing {filename}: {e}")
    
    # Save to H5 file
    with h5py.File(output_file, "w") as f:
        f.create_dataset("file_paths", data=[path.encode('utf-8') for path in file_paths])
        f.create_dataset("features", data=features_list)
    
    return file_paths, features_list

def load_features_from_hdf5(file="found_pet_features.h5"):
    """Load features from an HDF5 file."""
    with h5py.File(file, "r") as f:
        found_pets = list(f["file_paths"])
        found_pet_features = list(f["features"])

    # Decode bytes for file_paths and convert features to arrays
    found_pets = [pet.decode('utf-8') for pet in found_pets]
    found_pet_features = [np.array(features) for features in found_pet_features]

    return found_pets, found_pet_features

# Add this debug check before using the features
if not os.path.exists("found_pet_features.h5"):
    print("Error: found_pet_features.h5 file not found!")
    # Generate the features file
    print("Generating features file...")
    found_pets, found_pet_features = generate_features_file()
else:
    print("Loading existing features file...")
    found_pets, found_pet_features = load_features_from_hdf5()

def load_data():
    global data
    return data

@app.post("/find-matching-pets")
async def find_matching_pets(uploaded_file: UploadFile = File(...)):
    print("=== Starting find_matching_pets endpoint ===")
    print(f"Received file: {uploaded_file.filename}")
    
    try:
        # Save uploaded image
        lost_pet_image_path = "input/lost_pet_image.jpg"
        print(f"Attempting to save file to: {lost_pet_image_path}")
        
        # Read and save the file
        contents = await uploaded_file.read()
        print(f"File read successfully, size: {len(contents)} bytes")
        
        with open(lost_pet_image_path, "wb") as f:
            f.write(contents)
        print("File saved successfully")
        
        # Extract features from the uploaded lost pet image
        print("Extracting features from uploaded image...")
        lost_pet_features = extract_features(lost_pet_image_path)
        print("Features extracted successfully")

        # Calculate similarity
        similarities = [cosine_similarity([lost_pet_features], [features])[0][0] for features in found_pet_features]
        sorted_indices = np.argsort(similarities)[::-1][:3]
        top_matches = [(found_pets[i], similarities[i]) for i in sorted_indices]

        results = []
        for pet_path, similarity in top_matches:
            pet_index = found_pets.index(pet_path)
            pet_details = data.iloc[pet_index]
            results.append({
                "name": pet_details['Name'],
                "breed": pet_details['Breed1_Name'],
                "type": pet_details['Type'],
                "gender": pet_details['Gender'],
                "age": int(pet_details['Age(months)']),
                "color": pet_details['Color1_Name'],
                "maturity_size": pet_details['MaturitySize'],
                "fur_length": pet_details['FurLength'],
                "health": pet_details['Health'],
                "image_url": f"http://localhost:8000/images/{os.path.basename(pet_path)}",
                "similarity": float(similarity)
            })
        
        return {"matches": results}

    except Exception as e:
        print(f"ERROR in find_matching_pets: {str(e)}")
        print(f"Error type: {type(e)}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=str(e))


# Run the API
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
