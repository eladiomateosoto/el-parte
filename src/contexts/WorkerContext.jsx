import { createContext, useContext, useEffect, useState } from 'react';
import { db } from '../services/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { comparePin } from '../utils/helpers';

const WorkerContext = createContext();

export const useWorker = () => {
  const context = useContext(WorkerContext);
  if (!context) {
    throw new Error('useWorker must be used within WorkerProvider');
  }
  return context;
};

export const WorkerProvider = ({ children }) => {
  const [worker, setWorker] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load worker from localStorage if exists
  useEffect(() => {
    const savedWorkerId = localStorage.getItem('workerId');
    if (savedWorkerId) {
      loadWorkerFromFirestore(savedWorkerId);
    } else {
      setLoading(false);
    }
  }, []);

  // Load worker data from Firestore
  const loadWorkerFromFirestore = async (workerId) => {
    try {
      setLoading(true);
      setError(null);
      const workerRef = doc(db, 'trabajadores', workerId);
      const workerDoc = await getDoc(workerRef);
      
      if (workerDoc.exists()) {
        const workerData = { id: workerId, ...workerDoc.data() };
        setWorker(workerData);
      } else {
        setError('Worker not found');
        localStorage.removeItem('workerId');
      }
    } catch (err) {
      setError(err.message);
      localStorage.removeItem('workerId');
    } finally {
      setLoading(false);
    }
  };

  // Authenticate worker with PIN
  const workerLogin = async (workerId, pin) => {
    try {
      setLoading(true);
      setError(null);

      const workerRef = doc(db, 'trabajadores', workerId);
      const workerDoc = await getDoc(workerRef);
      
      if (!workerDoc.exists()) {
        throw new Error('Worker not found');
      }

      const workerData = workerDoc.data();
      const isPinValid = await comparePin(pin, workerData.pin);

      if (isPinValid) {
        const worker = { id: workerId, ...workerData };
        setWorker(worker);
        localStorage.setItem('workerId', workerId);
        return worker;
      } else {
        throw new Error('Invalid PIN');
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout worker
  const logout = () => {
    setWorker(null);
    localStorage.removeItem('workerId');
  };

  const value = {
    worker,
    loading,
    error,
    workerLogin,
    loadWorkerFromFirestore,
    logout,
  };

  return <WorkerContext.Provider value={value}>{children}</WorkerContext.Provider>;
};
