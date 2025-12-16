import { storage, db } from './firebase';

export const storageService = {
  uploadProgressPhoto: async (uid: string, file: File) => {
    const timestamp = Date.now();
    const storageRef = storage.ref(`progressPhotos/${uid}/${timestamp}.jpg`);
    
    // Upload file
    await storageRef.put(file);
    const downloadURL = await storageRef.getDownloadURL();

    // Save metadata to Firestore
    await db.collection('progressPhotos').doc(uid).collection('entries').add({
      url: downloadURL,
      timestamp,
      date: new Date().toISOString()
    });

    return downloadURL;
  },

  uploadProfilePicture: async (uid: string, file: File) => {
    const storageRef = storage.ref(`users/${uid}/profile.jpg`);
    
    // Upload file
    await storageRef.put(file);
    const downloadURL = await storageRef.getDownloadURL();
    
    return downloadURL;
  },

  uploadCommunityImage: async (uid: string, file: File) => {
    const timestamp = Date.now();
    const storageRef = storage.ref(`community/${uid}/${timestamp}_${file.name}`);
    await storageRef.put(file);
    return await storageRef.getDownloadURL();
  }
};
