import { storage, db } from './firebase';

export const storageService = {
  uploadProgressPhoto: async (uid: string, file: File) => {
    try {
        const timestamp = Date.now();
        // Sanitize filename to prevent issues with spaces/special characters
        const safeName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
        const storageRef = storage.ref(`progressPhotos/${uid}/${timestamp}_${safeName}`);
        
        await storageRef.put(file);
        const downloadURL = await storageRef.getDownloadURL();

        await db.collection('progressPhotos').doc(uid).collection('entries').add({
            url: downloadURL,
            timestamp,
            date: new Date().toISOString()
        });

        return downloadURL;
    } catch (error: any) {
        if (error.code === 'storage/unauthorized') {
            throw new Error("Firebase Storage Permission Denied. Go to Firebase Console > Storage > Rules and allow read/write for authenticated users.");
        }
        throw error;
    }
  },

  uploadProfilePicture: async (uid: string, file: File) => {
    try {
        const storageRef = storage.ref(`users/${uid}/profile.jpg`);
        await storageRef.put(file);
        return await storageRef.getDownloadURL();
    } catch (error: any) {
        if (error.code === 'storage/unauthorized') {
            throw new Error("Storage Permission Denied. Check Firebase Rules.");
        }
        throw error;
    }
  },

  uploadCommunityImage: async (uid: string, file: File) => {
    try {
        const timestamp = Date.now();
        const safeName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
        const storageRef = storage.ref(`community/${uid}/${timestamp}_${safeName}`);
        
        await storageRef.put(file);
        return await storageRef.getDownloadURL();
    } catch (error: any) {
        console.error("Storage upload error:", error);
        if (error.code === 'storage/unauthorized') {
             throw new Error("Storage Permission Denied. Please update Firebase Storage Rules to 'allow read, write: if request.auth != null;'");
        }
        throw error;
    }
  }
};