import { storage } from './firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

export const uploadPartPhoto = async (file, obraId, trabajadorId, date) => {
  try {
    const fileName = `${date}-${Date.now()}-${file.name}`;
    const storagePath = `partes/${obraId}/${trabajadorId}/${date}/${fileName}`;
    const storageRef = ref(storage, storagePath);
    
    // Upload the file
    await uploadBytes(storageRef, file);
    
    // Get the download URL
    const downloadURL = await getDownloadURL(storageRef);
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading photo:', error);
    throw error;
  }
};

export const deletePartPhoto = async (photoURL) => {
  try {
    const photoRef = ref(storage, photoURL);
    await deleteObject(photoRef);
  } catch (error) {
    console.error('Error deleting photo:', error);
    throw error;
  }
};
