import { createContext, useContext, useEffect, useState } from 'react';
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { auth, db } from '../services/firebase';
import { doc, getDoc } from 'firebase/firestore';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null); // 'admin' or 'worker'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // Check if admin or worker
        const adminRef = doc(db, 'admins', currentUser.uid);
        const adminDoc = await getDoc(adminRef);
        
        if (adminDoc.exists()) {
          setUserRole('admin');
        } else {
          // Try to get worker data
          const workerRef = doc(db, 'trabajadores', currentUser.uid);
          const workerDoc = await getDoc(workerRef);
          if (workerDoc.exists()) {
            setUserRole('worker');
          }
        }
        
        setUser(currentUser);
      } else {
        setUser(null);
        setUserRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Admin login with email and password
  const adminLogin = async (email, password) => {
    try {
      setError(null);
      const result = await signInWithEmailAndPassword(auth, email, password);
      return result.user;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Logout
  const logout = async () => {
    try {
      setError(null);
      await signOut(auth);
      setUser(null);
      setUserRole(null);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const value = {
    user,
    userRole,
    loading,
    error,
    adminLogin,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
