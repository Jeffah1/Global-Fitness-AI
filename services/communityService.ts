import { db, fieldValue, auth } from './firebase';
import { Post, Comment, UserProfile, PostType } from '../types';

const POSTS_COLLECTION = 'community_posts';

export const communityService = {
  // Subscribe to posts feed (real-time)
  subscribeToPosts: (callback: (posts: Post[]) => void) => {
    return db.collection(POSTS_COLLECTION)
      .orderBy('timestamp', 'desc')
      .limit(50)
      .onSnapshot((snapshot: any) => {
        const posts = snapshot.docs.map((doc: any) => ({
          id: doc.id,
          ...doc.data()
        })) as Post[];
        callback(posts);
      }, (error) => {
        console.error("Error subscribing to posts:", error);
      });
  },

  // Create a new post
  createPost: async (user: UserProfile, content: string, type: PostType, imageUrl?: string) => {
    // Prefer UID, fallback to email if somehow missing (shouldn't happen with updated UserContext)
    const authorId = user.uid || auth.currentUser?.uid || user.email;
    
    if (!authorId) throw new Error("User ID missing");

    const newPost: Omit<Post, 'id'> = {
      authorId,
      authorName: user.name,
      authorFitnessLevel: user.fitnessLevel,
      type: type || 'Reflection',
      content,
      imageUrl: imageUrl || '',
      likes: [], // "Encourage" array
      commentsCount: 0,
      timestamp: new Date().toISOString()
    };

    await db.collection(POSTS_COLLECTION).add(newPost);
  },

  // Delete a post
  deletePost: async (postId: string) => {
    await db.collection(POSTS_COLLECTION).doc(postId).delete();
  },

  // Toggle Like (Encourage)
  toggleLike: async (postId: string, userId: string, isLiked: boolean) => {
    const postRef = db.collection(POSTS_COLLECTION).doc(postId);
    if (isLiked) {
      await postRef.update({
        likes: fieldValue.arrayRemove(userId)
      });
    } else {
      await postRef.update({
        likes: fieldValue.arrayUnion(userId)
      });
    }
  },

  // Get Comments for a post (real-time)
  subscribeToComments: (postId: string, callback: (comments: Comment[]) => void) => {
    return db.collection(POSTS_COLLECTION).doc(postId).collection('comments')
      .orderBy('timestamp', 'asc')
      .onSnapshot((snapshot: any) => {
        const comments = snapshot.docs.map((doc: any) => ({
          id: doc.id,
          ...doc.data()
        })) as Comment[];
        callback(comments);
      });
  },

  // Add Comment
  addComment: async (postId: string, user: UserProfile, text: string) => {
    const authorId = user.uid || auth.currentUser?.uid || user.email;
    const newComment: Omit<Comment, 'id'> = {
      authorId,
      authorName: user.name,
      text,
      timestamp: new Date().toISOString()
    };

    const batch = db.batch();
    const commentRef = db.collection(POSTS_COLLECTION).doc(postId).collection('comments').doc();
    const postRef = db.collection(POSTS_COLLECTION).doc(postId);

    batch.set(commentRef, newComment);
    batch.update(postRef, {
      commentsCount: fieldValue.increment(1)
    });

    await batch.commit();
  },

  // Delete Comment
  deleteComment: async (postId: string, commentId: string) => {
    const batch = db.batch();
    const commentRef = db.collection(POSTS_COLLECTION).doc(postId).collection('comments').doc(commentId);
    const postRef = db.collection(POSTS_COLLECTION).doc(postId);

    batch.delete(commentRef);
    batch.update(postRef, {
      commentsCount: fieldValue.increment(-1)
    });

    await batch.commit();
  }
};
