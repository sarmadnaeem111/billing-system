import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [shopData, setShopData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Register new shop
  function registerShop(email, password, shopDetails) {
    return createUserWithEmailAndPassword(auth, email, password)
      .then(userCredential => {
        const user = userCredential.user;
        
        // Store shop details in Firestore
        return setDoc(doc(db, 'shops', user.uid), {
          ...shopDetails,
          userEmail: email,
          createdAt: new Date().toISOString()
        }).then(() => user);
      });
  }

  // Sign in existing user
  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  // Sign out
  function logout() {
    return signOut(auth);
  }

  // Fetch shop data from Firestore
  function getShopData(userId) {
    return getDoc(doc(db, 'shops', userId))
      .then(shopDoc => {
        if (shopDoc.exists()) {
          const data = shopDoc.data();
          setShopData(data);
          return data;
        } else {
          return null;
        }
      });
  }
  
  // Update shop data
  function updateShopData(updatedData) {
    if (!currentUser) return Promise.reject(new Error('No user logged in'));
    
    return updateDoc(doc(db, 'shops', currentUser.uid), updatedData)
      .then(() => {
        // Update local state with new data
        setShopData(prevData => ({
          ...prevData,
          ...updatedData
        }));
        return true;
      });
  }

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user) {
        getShopData(user.uid)
          .finally(() => {
            setLoading(false);
          });
      } else {
        setShopData(null);
        setLoading(false);
      }
    });
    
    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    shopData,
    registerShop,
    login,
    logout,
    getShopData,
    updateShopData
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
} 
