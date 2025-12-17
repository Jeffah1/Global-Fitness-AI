import React, { useState, useEffect, useRef } from 'react';
import { useGlobalContext } from '../context/GlobalContext';
import { communityService } from '../services/communityService';
import { storageService } from '../services/storageService';
import { Post, Comment } from '../types';
import { auth } from '../services/firebase';
import { Image, Send, Heart, MessageCircle, Trash2, X, Upload, Loader2, MoreVertical, User } from 'lucide-react';

const CommentSection: React.FC<{ postId: string; currentUserId: string }> = ({ postId, currentUserId }) => {
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(false);
    const { user } = useGlobalContext();
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const unsubscribe = communityService.subscribeToComments(postId, setComments);
        return () => unsubscribe();
    }, [postId]);

    const handleSend = async () => {
        if (!newComment.trim() || !user) return;
        setLoading(true);
        try {
            await communityService.addComment(postId, user, newComment);
            setNewComment('');
            bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (commentId: string) => {
        if (window.confirm("Delete this comment?")) {
            await communityService.deleteComment(postId, commentId);
        }
    };

    return (
        <div className="mt-4 pt-4 border-t border-slate-700/50">
            <div className="max-h-60 overflow-y-auto space-y-3 mb-4 pr-2 scrollbar-thin">
                {comments.map(comment => (
                    <div key={comment.id} className="flex gap-3 text-sm">
                        <div className="font-bold text-slate-300 whitespace-nowrap">{comment.authorName}:</div>
                        <div className="flex-1 text-slate-400 break-words group relative">
                            {comment.text}
                            {comment.authorId === currentUserId && (
                                <button 
                                    onClick={() => handleDelete(comment.id)}
                                    className="absolute right-0 top-0 opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition-opacity p-1"
                                >
                                    <Trash2 size={12} />
                                </button>
                            )}
                        </div>
                    </div>
                ))}
                <div ref={bottomRef} />
            </div>
            <div className="flex gap-2">
                <input 
                    type="text" 
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Write a comment..." 
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                />
                <button 
                    onClick={handleSend} 
                    disabled={!newComment.trim() || loading}
                    className="p-2 bg-emerald-500 text-slate-900 rounded-lg hover:bg-emerald-600 disabled:opacity-50 transition-colors"
                >
                    {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                </button>
            </div>
        </div>
    );
};

const PostCard: React.FC<{ post: Post }> = ({ post }) => {
    const { user } = useGlobalContext();
    // Prefer UID matching, fallback to email matching (legacy)
    const currentUserId = user?.uid || auth.currentUser?.uid || user?.email || ''; 
    
    const isOwner = post.authorId === currentUserId || post.authorId === user?.email;
    const isLiked = post.likes.includes(currentUserId);
    
    const [showComments, setShowComments] = useState(false);

    const toggleLike = () => {
        if (!user) return;
        communityService.toggleLike(post.id, currentUserId, isLiked);
    };

    const handleDeletePost = async () => {
        if (window.confirm("Are you sure you want to delete this post? This cannot be undone.")) {
            await communityService.deletePost(post.id);
        }
    };

    return (
        <div className="bg-slate-800 rounded-2xl border border-slate-700 p-5 shadow-lg animate-fade-in mb-6">
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-slate-900 font-bold text-lg">
                        {post.authorName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h3 className="font-bold text-white text-sm">{post.authorName}</h3>
                        <p className="text-xs text-slate-400">{post.authorFitnessLevel} • {new Date(post.timestamp).toLocaleDateString()}</p>
                    </div>
                </div>
                {isOwner && (
                    <button 
                        onClick={handleDeletePost}
                        className="text-slate-500 hover:text-red-400 p-2 rounded-full hover:bg-red-500/10 transition-colors active:scale-95"
                        title="Delete Post"
                    >
                        <Trash2 size={18} />
                    </button>
                )}
            </div>

            <p className="text-slate-200 mb-4 whitespace-pre-wrap leading-relaxed">{post.content}</p>

            {post.imageUrl && (
                <div className="mb-4 rounded-xl overflow-hidden border border-slate-700 bg-slate-900">
                    <img src={post.imageUrl} alt="Post content" className="w-full h-auto max-h-[500px] object-cover" />
                </div>
            )}

            <div className="flex items-center gap-6 text-sm text-slate-400 pt-2">
                <button 
                    onClick={toggleLike}
                    className={`flex items-center gap-2 transition-colors ${isLiked ? 'text-red-400' : 'hover:text-white'}`}
                >
                    <Heart size={20} fill={isLiked ? 'currentColor' : 'none'} />
                    <span>{post.likes.length}</span>
                </button>
                <button 
                    onClick={() => setShowComments(!showComments)}
                    className={`flex items-center gap-2 transition-colors hover:text-white ${showComments ? 'text-emerald-400' : ''}`}
                >
                    <MessageCircle size={20} />
                    <span>{post.commentsCount}</span>
                </button>
            </div>

            {showComments && <CommentSection postId={post.id} currentUserId={currentUserId} />}
        </div>
    );
};

export const Community: React.FC = () => {
    const { user } = useGlobalContext();
    const [posts, setPosts] = useState<Post[]>([]);
    const [newPostText, setNewPostText] = useState('');
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isPosting, setIsPosting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const unsubscribe = communityService.subscribeToPosts(setPosts);
        return () => unsubscribe();
    }, []);

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const clearImage = () => {
        setSelectedImage(null);
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleCreatePost = async () => {
        if ((!newPostText.trim() && !selectedImage) || !user) return;

        setIsPosting(true);
        try {
            let imageUrl = '';
            if (selectedImage) {
                // Use UID for folder path if available, otherwise fallback (riskier but backwards compatible)
                const uid = user.uid || auth.currentUser?.uid || 'anonymous';
                imageUrl = await storageService.uploadCommunityImage(uid, selectedImage);
            }

            await communityService.createPost(user, newPostText, imageUrl);
            
            // Reset form
            setNewPostText('');
            clearImage();
        } catch (error: any) {
            console.error("Failed to post", error);
            // Display exact error to help debugging (e.g. Permission Denied)
            alert(`Failed to create post. ${error.message || error.code || "Please check Firebase Rules."}`);
        } finally {
            setIsPosting(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto pb-12 animate-fade-in">
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-white">Community Feed</h2>
                <p className="text-slate-400">Share your journey, ask questions, and get inspired.</p>
            </div>

            {/* Create Post Widget */}
            <div className="bg-slate-800 rounded-2xl border border-slate-700 p-5 shadow-xl mb-8">
                <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-slate-400 flex-shrink-0">
                        <User size={20} />
                    </div>
                    <div className="flex-1 space-y-4">
                        <textarea
                            value={newPostText}
                            onChange={(e) => setNewPostText(e.target.value)}
                            placeholder="What's on your mind? Share progress or ask a question..."
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 outline-none resize-none min-h-[100px] transition-all"
                        />
                        
                        {imagePreview && (
                            <div className="relative rounded-xl overflow-hidden border border-slate-700 inline-block group">
                                <img src={imagePreview} alt="Preview" className="h-32 w-auto object-cover" />
                                <button 
                                    onClick={clearImage}
                                    className="absolute top-2 right-2 bg-black/60 text-white p-1 rounded-full hover:bg-red-500 transition-colors"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        )}

                        <div className="flex justify-between items-center pt-2">
                            <button 
                                onClick={() => fileInputRef.current?.click()}
                                className="flex items-center gap-2 text-slate-400 hover:text-emerald-400 transition-colors text-sm font-bold px-3 py-2 rounded-lg hover:bg-emerald-500/10"
                            >
                                <Image size={18} />
                                Add Photo
                            </button>
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                className="hidden" 
                                accept="image/*"
                                onChange={handleImageSelect}
                            />
                            
                            <button 
                                onClick={handleCreatePost}
                                disabled={isPosting || (!newPostText.trim() && !selectedImage)}
                                className="bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-700 disabled:text-slate-500 text-slate-900 font-bold px-6 py-2 rounded-xl transition-all shadow-lg shadow-emerald-500/20 disabled:shadow-none flex items-center gap-2 active:scale-95"
                            >
                                {isPosting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                                Post
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Feed */}
            {posts.length === 0 ? (
                <div className="text-center py-12 bg-slate-800/50 rounded-2xl border border-slate-700 border-dashed">
                    <p className="text-slate-500">No posts yet. Be the first to share!</p>
                </div>
            ) : (
                posts.map(post => (
                    <PostCard key={post.id} post={post} />
                ))
            )}
        </div>
    );
};