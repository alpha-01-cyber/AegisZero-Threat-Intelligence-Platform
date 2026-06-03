// Mohid Umer, M Ahsan, M Saim
// 23i-2130, 23i-2117, 23i-2119
// firebase.ts

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, User, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, updateDoc, enableIndexedDbPersistence } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Enable offline persistence
if (typeof window !== 'undefined') {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code == 'failed-precondition') {
      console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
    } else if (err.code == 'unimplemented') {
      console.warn('The current browser does not support all of the features required to enable persistence');
    }
  });
}

export { auth, db, storage };

// User profile interface
export interface UserProfile {
  uid: string;
  email: string;
  username: string;
  country?: string | null;
  countryCode?: string | null;
  logoURL?: string | null;
  createdAt: Date;
  updatedAt: Date;
  photoURL?: string | null;
}

/**
 * Sign up a new user with email and password
 */
export async function signupUser(email: string, password: string, username: string): Promise<User> {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Create user profile in Firestore
    const userProfile: UserProfile = {
      uid: user.uid,
      email: user.email || email,
      username: username || 'Analyst',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await setDoc(doc(db, 'users', user.uid), userProfile);

    return user;
  } catch (error: any) {
    console.error('Error signing up:', error);
    throw new Error(error.message || 'Failed to sign up');
  }
}

/**
 * Login an existing user with email and password
 */
export async function loginUser(email: string, password: string): Promise<User> {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error: any) {
    console.error('Error logging in:', error);
    throw new Error(error.message || 'Failed to log in');
  }
}

/**
 * Logout the current user
 */
export async function logoutUser(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error: any) {
    console.error('Error logging out:', error);
    throw new Error(error.message || 'Failed to log out');
  }
}

/**
 * Get user profile data from Firestore
 */
export async function getUserData(uid: string): Promise<UserProfile | null> {
  try {
    console.log('🔥 Firestore: Fetching user data for', uid);
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      const data = userDoc.data() as UserProfile;
      console.log('🔥 Firestore: User data retrieved:', data);
      return data;
    }
    console.log('🔥 Firestore: No user document found');
    return null;
  } catch (error: any) {
    console.error('🔥 Firestore: Error getting user data:', error);
    // If offline, try to return null instead of throwing to allow UI to render with basic auth info
    if (error.code === 'unavailable' || error.message?.includes('offline')) {
      console.warn('Client is offline, returning null profile.');
      return null;
    }
    throw new Error(error.message || 'Failed to get user data');
  }
}



/**
 * Update user profile in Firestore
 */
export async function updateUserProfile(uid: string, updates: Partial<UserProfile>): Promise<void> {
  try {
    const userRef = doc(db, 'users', uid);
    const dataToSave = {
      ...updates,
      updatedAt: new Date(),
    };

    console.log('🔥 Firestore: Saving to users/' + uid, dataToSave);

    // Use setDoc with merge: true to create the document if it doesn't exist
    await setDoc(userRef, dataToSave, { merge: true });

    console.log('🔥 Firestore: Save completed successfully');
  } catch (error: any) {
    console.error('🔥 Firestore: Error updating user profile:', error);
    throw new Error(error.message || 'Failed to update profile');
  }
}

/**
 * Change user password
 */
export async function changeUserPassword(currentPassword: string, newPassword: string): Promise<void> {
  try {
    const user = auth.currentUser;
    if (!user || !user.email) {
      throw new Error('No user is currently logged in');
    }

    // Re-authenticate user before changing password
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);

    // Update password
    await updatePassword(user, newPassword);
  } catch (error: any) {
    console.error('Error changing password:', error);
    if (error.code === 'auth/wrong-password') {
      throw new Error('Current password is incorrect');
    }
    throw new Error(error.message || 'Failed to change password');
  }
}

/**
 * Upload user logo to Firebase Storage
 */
export async function uploadUserLogo(uid: string, file: File): Promise<string> {
  try {
    const storageRef = ref(storage, `user-logos/${uid}/${file.name}`);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error: any) {
    console.error('Error uploading logo:', error);
    throw new Error(error.message || 'Failed to upload logo');
  }
}
