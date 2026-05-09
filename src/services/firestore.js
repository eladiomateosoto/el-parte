import { db } from './firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  updateDoc,
  serverTimestamp,
  writeBatch 
} from 'firebase/firestore';
import { hashPin } from '../utils/helpers';

// ============ OBRAS ============

export const createWork = async (workData) => {
  try {
    const newWorkRef = doc(collection(db, 'obras'));
    await setDoc(newWorkRef, {
      ...workData,
      activa: true,
      creadaEn: serverTimestamp(),
    });
    return newWorkRef.id;
  } catch (error) {
    console.error('Error creating work:', error);
    throw error;
  }
};

export const getWork = async (workId) => {
  try {
    const docRef = doc(db, 'obras', workId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    console.error('Error getting work:', error);
    throw error;
  }
};

export const getActiveWorks = async () => {
  try {
    const q = query(collection(db, 'obras'), where('activa', '==', true));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error getting active works:', error);
    throw error;
  }
};

export const updateWork = async (workId, updateData) => {
  try {
    const docRef = doc(db, 'obras', workId);
    await updateDoc(docRef, updateData);
  } catch (error) {
    console.error('Error updating work:', error);
    throw error;
  }
};

// ============ TRABAJADORES ============

export const createWorker = async (workerData, pin) => {
  try {
    const hashedPin = await hashPin(pin);
    const newWorkerRef = doc(collection(db, 'trabajadores'));
    
    await setDoc(newWorkerRef, {
      ...workerData,
      pin: hashedPin,
      activo: true,
      creadoEn: serverTimestamp(),
    });
    
    return newWorkerRef.id;
  } catch (error) {
    console.error('Error creating worker:', error);
    throw error;
  }
};

export const getWorker = async (workerId) => {
  try {
    const docRef = doc(db, 'trabajadores', workerId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    console.error('Error getting worker:', error);
    throw error;
  }
};

export const getActiveWorkers = async () => {
  try {
    const q = query(collection(db, 'trabajadores'), where('activo', '==', true));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error getting active workers:', error);
    throw error;
  }
};

export const updateWorker = async (workerId, updateData) => {
  try {
    const docRef = doc(db, 'trabajadores', workerId);
    await updateDoc(docRef, updateData);
  } catch (error) {
    console.error('Error updating worker:', error);
    throw error;
  }
};

// ============ CATEGORÍAS ============

export const getActiveCategories = async () => {
  try {
    const q = query(collection(db, 'categorias'), where('activa', '==', true));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error getting categories:', error);
    throw error;
  }
};

export const createCategory = async (categoryData) => {
  try {
    const newCategoryRef = doc(collection(db, 'categorias'));
    await setDoc(newCategoryRef, {
      ...categoryData,
      activa: true,
    });
    return newCategoryRef.id;
  } catch (error) {
    console.error('Error creating category:', error);
    throw error;
  }
};

// Initialize default categories if they don't exist
export const initializeDefaultCategories = async () => {
  try {
    const q = query(collection(db, 'categorias'));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.size === 0) {
      const defaultCategories = [
        'Estructuras',
        'Paredes',
        'Solería',
        'Carpintería',
        'Instalaciones',
        'Pintura',
        'Otros',
      ];
      
      const batch = writeBatch(db);
      
      defaultCategories.forEach((categoryName) => {
        const newRef = doc(collection(db, 'categorias'));
        batch.set(newRef, {
          nombre: categoryName,
          activa: true,
        });
      });
      
      await batch.commit();
      console.log('Default categories initialized');
    }
  } catch (error) {
    console.error('Error initializing categories:', error);
  }
};

// ============ PARTES ============

export const createPart = async (partData) => {
  try {
    const newPartRef = doc(collection(db, 'partes'));
    await setDoc(newPartRef, {
      ...partData,
      creadoEn: serverTimestamp(),
    });
    return newPartRef.id;
  } catch (error) {
    console.error('Error creating part:', error);
    throw error;
  }
};

export const getPart = async (partId) => {
  try {
    const docRef = doc(db, 'partes', partId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    console.error('Error getting part:', error);
    throw error;
  }
};

export const getPartsByWork = async (workId) => {
  try {
    const q = query(collection(db, 'partes'), where('obraId', '==', workId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error getting parts by work:', error);
    throw error;
  }
};

export const getPartsByWorker = async (workerId) => {
  try {
    const q = query(collection(db, 'partes'), where('trabajadorId', '==', workerId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error getting parts by worker:', error);
    throw error;
  }
};

export const updatePart = async (partId, updateData) => {
  try {
    const docRef = doc(db, 'partes', partId);
    await updateDoc(docRef, updateData);
  } catch (error) {
    console.error('Error updating part:', error);
    throw error;
  }
};
