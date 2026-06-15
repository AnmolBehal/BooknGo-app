// ─── Firestore Service ───
// CRUD helpers for bookings, custom_inventory, and user profiles.

import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';

// ════════════════════════════════════════════════════════════════════════════════
// Bookings
// ════════════════════════════════════════════════════════════════════════════════

/**
 * Create a new booking after checkout.
 * @param {object} bookingData - { uid, items, totalPrice, paymentMethod, ... }
 * @returns {string} The new document ID.
 */
export async function createBooking(bookingData) {
  const ref = await addDoc(collection(db, 'bookings'), {
    ...bookingData,
    status:    'confirmed',
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

/**
 * Fetch all bookings for a user, newest first.
 * @param {string} uid
 */
export async function getUserBookings(uid) {
  const q = query(
    collection(db, 'bookings'),
    where('uid', '==', uid)
  );
  const snap = await getDocs(q);
  
  // Sort on client-side to avoid needing a Firestore composite index
  const bookings = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  
  return bookings.sort((a, b) => {
    const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
    const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
    return timeB - timeA;
  });
}

/**
 * Fetch ALL bookings (admin use).
 */
export async function getAllBookings() {
  const q = query(collection(db, 'bookings'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}


// ════════════════════════════════════════════════════════════════════════════════
// Custom Inventory (Admin)
// ════════════════════════════════════════════════════════════════════════════════

/**
 * Add a custom movie/event/etc. to the admin inventory.
 * @param {object} item - { type, title, description, price, image, ... }
 */
export async function addInventoryItem(item) {
  const ref = await addDoc(collection(db, 'custom_inventory'), {
    ...item,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

/**
 * Fetch all custom inventory items.
 * @param {string} [type] - Optional filter by vertical type.
 */
export async function getInventoryItems(type) {
  let q;
  if (type) {
    q = query(
      collection(db, 'custom_inventory'),
      where('type', '==', type),
      orderBy('createdAt', 'desc')
    );
  } else {
    q = query(collection(db, 'custom_inventory'), orderBy('createdAt', 'desc'));
  }
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/**
 * Update an existing inventory item.
 */
export async function updateInventoryItem(docId, updates) {
  await updateDoc(doc(db, 'custom_inventory', docId), {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Delete an inventory item.
 */
export async function deleteInventoryItem(docId) {
  await deleteDoc(doc(db, 'custom_inventory', docId));
}


// ════════════════════════════════════════════════════════════════════════════════
// User Profiles
// ════════════════════════════════════════════════════════════════════════════════

export async function getUserProfile(uid) {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function updateUserProfile(uid, updates) {
  await updateDoc(doc(db, 'users', uid), {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

export async function getAllUsers() {
  const snap = await getDocs(collection(db, 'users'));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}
