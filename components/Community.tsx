import React, { useState, useEffect, useRef } from 'react';
import { useGlobalContext } from '../context/GlobalContext';
import { communityService } from '../services/communityService';
import { storageService } from '../services/storageService';
import { Post, Comment, PostType } from '../types';
import { auth } from '../services/firebase';
import { Image, Send, Heart, MessageCircle, Trash2, X, Loader2, User, AlertCircle, Sparkles, HelpCircle, Trophy, Lightbulb, Quote } from 'lucide-react';

// --- SUB-COMPONENTS ---

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
                    <div key={comment.id} className="flex gap-3 text-sm animate-fade-in">
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
                    placeholder="Write a supportive reply..." 
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors placeholder-slate-500"
                />
                <button 
                    onClick={handleSend} 
                    disabled={!newComment.trim() || loading}
                    className="p-2 bg-slate-700 text-emerald-400 rounded-lg hover:bg-slate-600 disabled:opacity-50 transition-colors"
                >
                    {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                </button>
            </div>
        </div>
    );
};

const PostTypeBadge: React.FC<{ type: PostType }> = ({ type }) => {
    switch (type) {
        case 'Progress':
            return <span className="flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full border border-emerald-400/20"><Trophy size={10} /> Progress</span>;
        case 'Question':
            return <span className="flex items-center gap-1 text-xs font-bold text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded-full border border-blue-400/20"><HelpCircle size={10} /> Question</span>;
        case 'Tip':
            return <span className="flex items-center gap-1 text-xs font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20"><Lightbulb size={10} /> Tip</span>;
        case 'Reflection':
        default:
            return <span className="flex items-center gap-1 text-xs font-bold text-indigo-400 bg-indigo-400/10 px-2 py-0.5 rounded-full border border-indigo-400/20"><Quote size={10} /> Reflection</span>;
    }
}

const PostCard: React.FC<{ post: Post }> = ({ post }) => {
    const { user } = useGlobalContext();
    const currentUserId = user?.uid || auth.currentUser?.uid || user?.email || ''; 
    const isOwner = post.authorId === currentUserId || post.authorId === user?.email;
    const isLiked = post.likes.includes(currentUserId);
    const [showComments, setShowComments] = useState(false);

    // Calculate time relative
    const timeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
        
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + "y ago";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + "mo ago";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + "d ago";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + "h ago";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + "m ago";
        return "Just now";
    };

    const toggleLike = () => {
        if (!user) return;
        communityService.toggleLike(post.id, currentUserId, isLiked);
    };

    const handleDeletePost = async () => {
        if (window.confirm("Delete this post?")) {
            await communityService.deletePost(post.id);
        }
    };

    return (
        <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 shadow-sm animate-fade-in mb-6 hover:border-slate-600 transition-colors">
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-600 flex items-center justify-center text-slate-300 font-bold text-sm border border-slate-600">
                        {post.authorName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="font-bold text-white text-sm">{post.authorName}</h3>
                            <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-700">
                                {post.authorFitnessLevel}
                            </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">{timeAgo(post.timestamp)}</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-2">
                    <PostTypeBadge type={post.type || 'Reflection'} />
                    {isOwner && (
                        <button 
                            onClick={handleDeletePost}
                            className="text-slate-600 hover:text-red-400 p-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
                        >
                            <Trash2 size={14} />
                        </button>
                    )}
                </div>
            </div>

            {/* Content */}
            <p className="text-slate-200 mb-4 whitespace-pre-wrap leading-relaxed text-[15px]">{post.content}</p>

            {post.imageUrl && (
                <div className="mb-4 rounded-xl overflow-hidden border border-slate-700 bg-slate-900">
                    <img src={post.imageUrl} alt="Post content" className="w-full h-auto max-h-[500px] object-cover" />
                </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-6 pt-3 border-t border-slate-700/50">
                <button 
                    onClick={toggleLike}
                    className={`flex items-center gap-2 text-sm font-medium transition-all px-3 py-1.5 rounded-lg ${
                        isLiked 
                        ? 'text-pink-400 bg-pink-500/10' 
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                    }`}
                >
                    <Heart size={16} fill={isLiked ? 'currentColor' : 'none'} />
                    <span>{post.likes.length > 0 ? `${post.likes.length} Encourage` : 'Encourage'}</span>
                </button>
                <button 
                    onClick={() => setShowComments(!showComments)}
                    className={`flex items-center gap-2 text-sm font-medium transition-all px-3 py-1.5 rounded-lg ${
                        showComments
                        ? 'text-emerald-400 bg-emerald-500/10'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                    }`}
                >
                    <MessageCircle size={16} />
                    <span>{post.commentsCount > 0 ? `${post.commentsCount} Reply` : 'Reply'}</span>
                </button>
            </div>

            {showComments && <CommentSection postId={post.id} currentUserId={currentUserId} />}
        </div>
    );
};

// --- MAIN COMPONENT ---

export const Community: React.FC = () => {
    const { user } = useGlobalContext();
    const [posts, setPosts] = useState<Post[]>([]);
    const [newPostText, setNewPostText] = useState('');
    const [selectedType, setSelectedType] = useState<PostType | null>(null);
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isPosting, setIsPosting] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const unsubscribe = communityService.subscribeToPosts(setPosts);
        return () => unsubscribe();
    }, []);

    const prompts = [
        { type: 'Progress', label: 'I made progress...', icon: <Trophy size={14} />, placeholder: "Share a win, big or small. What did you achieve today?" },
        { type: 'Question', label: 'I’m struggling with...', icon: <HelpCircle size={14} />, placeholder: "Stuck on something? Ask the community for advice." },
        { type: 'Reflection', label: 'A thought I had...', icon: <Quote size={14} />, placeholder: "Reflect on your journey. What's on your mind?" },
        { type: 'Tip', label: 'Today I learned...', icon: <Lightbulb size={14} />, placeholder: "Share a tip or trick that helped you recently." },
    ];

    const handlePromptClick = (type: PostType, placeholder: string) => {
        setSelectedType(type);
        if (!newPostText) {
            // Optional: Pre-fill text based on type if desired, currently just setting placeholder/state
        }
    };

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedImage(file);
            setImagePreview(URL.createObjectURL(file));
            setErrorMsg(null);
        }
    };

    const clearImage = () => {
        setSelectedImage(null);
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleCreatePost = async () => {
        if ((!newPostText.trim() && !selectedImage) || !user) return;
        if (!selectedType) {
            setErrorMsg("Please choose a post topic.");
            return;
        }

        setIsPosting(true);
        setErrorMsg(null);

        try {
            let imageUrl = '';
            if (selectedImage) {
                const uid = user.uid || auth.currentUser?.uid || 'anonymous';
                imageUrl = await storageService.uploadCommunityImage(uid, selectedImage);
            }

            await communityService.createPost(user, newPostText, selectedType, imageUrl);
            
            // Reset form
            setNewPostText('');
            setSelectedType(null);
            clearImage();
        } catch (error: any) {
            console.error("Failed to post", error);
            setErrorMsg(error.message || "Failed to create post.");
        } finally {
            setIsPosting(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto pb-12 animate-fade-in">
            <div className="mb-8 text-center md:text-left">
                <h2 className="text-3xl font-bold text-white mb-2">Community Space</h2>
                <p className="text-slate-400">A supportive place to share real progress and encourage others.</p>
            </div>

            {/* Guided Composer */}
            <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 shadow-xl mb-8">
                {!selectedType ? (
                    <div className="space-y-4">
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Start a conversation</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {prompts.map((prompt) => (
                                <button
                                    key={prompt.type}
                                    onClick={() => handlePromptClick(prompt.type as PostType, prompt.placeholder)}
                                    className="flex items-center gap-3 p-4 bg-slate-900 border border-slate-700 hover:border-emerald-500/50 hover:bg-slate-700/50 rounded-xl transition-all text-left group active:scale-[0.98]"
                                >
                                    <div className={`p-2 rounded-full bg-slate-800 group-hover:bg-white text-slate-400 group-hover:text-slate-900 transition-colors`}>
                                        {prompt.icon}
                                    </div>
                                    <span className="font-medium text-slate-300 group-hover:text-white">{prompt.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="animate-fade-in">
                        <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center gap-2">
                                <PostTypeBadge type={selectedType} />
                                <span className="text-sm text-slate-500">New Post</span>
                            </div>
                            <button onClick={() => setSelectedType(null)} className="text-slate-500 hover:text-white">
                                <X size={16} />
                            </button>
                        </div>
                        
                        <div className="flex gap-4">
                             <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 flex-shrink-0">
                                <User size={20} />
                            </div>
                            <div className="flex-1 space-y-4">
                                <textarea
                                    value={newPostText}
                                    onChange={(e) => setNewPostText(e.target.value)}
                                    placeholder={prompts.find(p => p.type === selectedType)?.placeholder}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 outline-none resize-none min-h-[120px] transition-all text-[15px] leading-relaxed"
                                    autoFocus
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

                                {errorMsg && (
                                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-center gap-2 text-red-400 text-sm">
                                        <AlertCircle size={16} />
                                        {errorMsg}
                                    </div>
                                )}

                                <div className="flex justify-between items-center pt-2">
                                    <button 
                                        onClick={() => fileInputRef.current?.click()}
                                        className="flex items-center gap-2 text-slate-400 hover:text-emerald-400 transition-colors text-sm font-bold px-3 py-2 rounded-lg hover:bg-emerald-500/10"
                                    >
                                        <Image size={18} />
                                        <span className="hidden sm:inline">Add Photo</span>
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
                                        Share
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Feed */}
            {posts.length === 0 ? (
                <div className="text-center py-16 bg-slate-800/30 rounded-3xl border border-slate-700/50 border-dashed animate-fade-in">
                    <Sparkles className="mx-auto text-slate-600 mb-4" size={40} />
                    <h3 className="text-xl font-bold text-white mb-2">This is a space for real journeys.</h3>
                    <p className="text-slate-400 max-w-sm mx-auto mb-6">Be the first to share yours — even small steps matter.</p>
                    
                    {/* Mock Examples */}
                    <div className="max-w-sm mx-auto opacity-50 pointer-events-none select-none blur-[1px] transform scale-95">
                        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 mb-4">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-8 h-8 rounded-full bg-slate-600"></div>
                                <div className="h-3 w-24 bg-slate-700 rounded"></div>
                            </div>
                            <div className="h-3 w-full bg-slate-700 rounded mb-2"></div>
                            <div className="h-3 w-2/3 bg-slate-700 rounded"></div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    {posts.map(post => (
                        <PostCard key={post.id} post={post} />
                    ))}
                </div>
            )}
        </div>
    );
};
