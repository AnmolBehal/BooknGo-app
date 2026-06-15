import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../config/firebase';
import { collection, doc, setDoc, deleteDoc, onSnapshot, query } from 'firebase/firestore';
import { useAuth } from './AuthContext';
import { toast } from 'react-toastify';

const WishlistContext = createContext(null);

export const useWishlist = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within <WishlistProvider>');
  return ctx;
};

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setWishlist([]);
      setLoading(false);
      return;
    }

    const q = query(collection(db, `users/${user.uid}/wishlist`));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items = [];
        snapshot.forEach((doc) => {
          items.push({ id: doc.id, ...doc.data() });
        });
        setWishlist(items);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching wishlist:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const isInWishlist = (itemId) => {
    return wishlist.some((item) => item.id === String(itemId));
  };

  const toggleWishlist = async (item) => {
    if (!user) {
      toast.info('Please log in to save to your wishlist.');
      return;
    }

    const itemId = String(item.id);
    const itemRef = doc(db, `users/${user.uid}/wishlist`, itemId);

    try {
      if (isInWishlist(itemId)) {
        await deleteDoc(itemRef);
        toast.success('Removed from wishlist');
      } else {
        // Standardize payload so UI doesn't crash
        const payload = {
          id: itemId,
          type: item.type || 'unknown',
          title: item.title || item.name || 'Untitled',
          subtitle: item.subtitle || item.overview || '',
          image: item.image || item.poster_path || item.thumbnail_url || item.logo || null,
          price: item.price || 0,
          savedAt: new Date().toISOString(),
        };
        await setDoc(itemRef, payload);
        toast.success('Added to wishlist');
      }
    } catch (error) {
      console.error('Error updating wishlist:', error);
      toast.error('Failed to update wishlist');
    }
  };

  return (
    <WishlistContext.Provider value={{ wishlist, loading, toggleWishlist, isInWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};
