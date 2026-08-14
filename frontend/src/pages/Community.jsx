import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Bell, MoreVertical, ThumbsUp, ThumbsDown, Share2, Pencil, X, Camera, Send, User } from 'lucide-react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { useUser } from '@clerk/clerk-react';
import { fetchPosts, createPost, votePost, addAnswer, API_BASE } from '../api';
import { CROP_CATALOG, cropByName } from '../utils/cropCatalog';
import { translateCrop } from '../utils/agriI18n';
import { Button } from '../components/ui/button';

const timeAgo = (ts) => {
    const s = Math.max(1, Math.floor(Date.now() / 1000 - ts));
    if (s < 60) return `${s}s`;
    if (s < 3600) return `${Math.floor(s / 60)}m`;
    if (s < 86400) return `${Math.floor(s / 3600)}h`;
    return `${Math.floor(s / 86400)}d`;
};

const imgUrl = (path) => (path?.startsWith('/') ? `${API_BASE}${path}` : path);

const PostCard = ({ post, lang, onVote, onAnswer }) => {
    const { t } = useTranslation();
    const [expanded, setExpanded] = useState(false);
    const [showAnswers, setShowAnswers] = useState(false);
    const [reply, setReply] = useState('');
    const [translated, setTranslated] = useState(null);
    const [translating, setTranslating] = useState(false);
    const crop = cropByName(post.crop);

    const translate = async () => {
        if (translated) { setTranslated(null); return; } // toggle back
        if (lang === 'en') return;
        setTranslating(true);
        try {
            const text = `${post.title}\n${post.body || ''}`.slice(0, 480);
            const res = await axios.get('https://api.mymemory.translated.net/get', {
                params: { q: text, langpair: `autodetect|${lang}` }
            });
            const out = res.data?.responseData?.translatedText;
            if (out) setTranslated(out);
        } catch (e) {
            console.error('translate failed', e);
        } finally {
            setTranslating(false);
        }
    };

    const share = () => {
        const text = `${post.title}\n${window.location.origin}/community`;
        if (navigator.share) navigator.share({ title: post.title, text }).catch(() => { });
        else navigator.clipboard?.writeText(text);
    };

    const submitReply = async () => {
        if (!reply.trim()) return;
        await onAnswer(post.id, reply.trim());
        setReply('');
    };

    return (
        <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
            {post.image && (
                <img src={imgUrl(post.image)} alt="" className="w-full h-64 object-cover" />
            )}
            <div className="p-4 space-y-3">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500">
                        <User className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                        <p className="font-semibold text-blue-600 truncate">{post.author} <span className="text-gray-500 font-normal">• {post.location}</span></p>
                        <p className="text-sm text-gray-500">{timeAgo(post.created_at)} • {crop.emoji} {translateCrop(post.crop, lang)}</p>
                    </div>
                </div>

                <div onClick={() => setExpanded(!expanded)} className="cursor-pointer">
                    <h3 className={`text-lg font-bold text-gray-900 leading-snug ${expanded ? '' : 'line-clamp-2'}`}>{post.title}</h3>
                    {post.body && <p className={`text-gray-700 mt-1 ${expanded ? '' : 'line-clamp-2'}`}>{post.body}</p>}
                    {translated && (
                        <p className="mt-2 text-gray-800 bg-blue-50 rounded-xl p-3 whitespace-pre-line">{translated}</p>
                    )}
                </div>

                <div className="flex items-center justify-between text-gray-600">
                    {lang !== 'en' ? (
                        <button onClick={translate} className="font-medium text-gray-700 hover:text-primary">
                            {translating ? '…' : translated ? t('show_original') : t('translate')}
                        </button>
                    ) : <span />}
                    <button onClick={() => setShowAnswers(!showAnswers)} className="text-gray-600 hover:text-primary">
                        {post.answers.length} {t('answers')}
                    </button>
                </div>

                <div className="border-t pt-3 flex items-center gap-6 text-gray-600">
                    <button onClick={() => onVote(post.id, 'up')} className="flex items-center gap-1.5 hover:text-green-600">
                        <ThumbsUp className="h-5 w-5" /> {post.likes}
                    </button>
                    <button onClick={() => onVote(post.id, 'down')} className="flex items-center gap-1.5 hover:text-red-500">
                        <ThumbsDown className="h-5 w-5" /> {post.dislikes}
                    </button>
                    <button onClick={share} className="ml-auto hover:text-primary">
                        <Share2 className="h-5 w-5" />
                    </button>
                </div>

                {showAnswers && (
                    <div className="border-t pt-3 space-y-3">
                        {post.answers.map(a => (
                            <div key={a.id} className="bg-gray-50 rounded-xl p-3">
                                <p className="text-sm font-semibold text-blue-600">{a.author} <span className="text-gray-400 font-normal">• {timeAgo(a.created_at)}</span></p>
                                <p className="text-sm text-gray-800 mt-0.5">{a.text}</p>
                            </div>
                        ))}
                        <div className="flex gap-2">
                            <input
                                value={reply}
                                onChange={e => setReply(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && submitReply()}
                                placeholder={t('write_answer')}
                                className="flex-1 h-10 rounded-full border border-gray-300 px-4 text-sm outline-none focus:border-primary"
                            />
                            <Button size="icon" className="rounded-full h-10 w-10" onClick={submitReply}>
                                <Send className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const AskModal = ({ onClose, onCreated, authorName }) => {
    const { t, i18n } = useTranslation();
    const lang = (i18n.language || 'en').split('-')[0];
    const [crop, setCrop] = useState('');
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [saving, setSaving] = useState(false);
    const fileRef = useRef(null);

    const submit = async () => {
        if (!title.trim() || !crop) return;
        setSaving(true);
        try {
            const fd = new FormData();
            fd.append('author', authorName);
            fd.append('crop', crop);
            fd.append('title', title);
            fd.append('body', body);
            if (file) fd.append('image', file);
            const res = await createPost(fd);
            onCreated(res.data);
            onClose();
        } catch (e) {
            console.error(e);
            alert('Failed to post. Is the backend running?');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[80] bg-black/50 flex items-end sm:items-center justify-center" onClick={onClose}>
            <div className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl p-5 space-y-4 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold">{t('ask_community')}</h2>
                    <button onClick={onClose}><X className="h-6 w-6 text-gray-500" /></button>
                </div>

                <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">{t('select_crop')}</p>
                    <div className="flex gap-3 overflow-x-auto pb-2">
                        {CROP_CATALOG.map(c => (
                            <button
                                key={c.id}
                                onClick={() => setCrop(c.name)}
                                className={`flex flex-col items-center gap-1 shrink-0 ${crop === c.name ? '' : 'opacity-70'}`}
                            >
                                <span
                                    className={`h-14 w-14 rounded-full flex items-center justify-center text-2xl border-2 ${crop === c.name ? 'border-primary' : 'border-transparent'}`}
                                    style={{ background: c.bg }}
                                >{c.emoji}</span>
                                <span className="text-[10px] text-gray-600 w-14 truncate text-center">{translateCrop(c.name, lang)}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div
                    onClick={() => fileRef.current.click()}
                    className="border-2 border-dashed border-gray-300 rounded-2xl p-4 flex items-center gap-3 cursor-pointer hover:border-primary"
                >
                    {preview
                        ? <img src={preview} alt="" className="h-16 w-16 rounded-xl object-cover" />
                        : <div className="h-16 w-16 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600"><Camera className="h-7 w-7" /></div>}
                    <p className="text-sm text-gray-600">{t('add_photo')}</p>
                    <input type="file" accept="image/*" ref={fileRef} className="hidden"
                        onChange={e => { const f = e.target.files[0]; if (f) { setFile(f); setPreview(URL.createObjectURL(f)); } }} />
                </div>

                <input
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder={t('question_title')}
                    className="w-full h-12 rounded-xl border border-gray-300 px-4 outline-none focus:border-primary"
                />
                <textarea
                    value={body}
                    onChange={e => setBody(e.target.value)}
                    placeholder={t('question_detail')}
                    rows={3}
                    className="w-full rounded-xl border border-gray-300 p-4 outline-none focus:border-primary resize-none"
                />

                <Button className="w-full h-12 rounded-full text-base" disabled={saving || !title.trim() || !crop} onClick={submit}>
                    {saving ? '…' : t('post_question')}
                </Button>
            </div>
        </div>
    );
};

const Community = () => {
    const { t, i18n } = useTranslation();
    const lang = (i18n.language || 'en').split('-')[0];
    const { user } = useUser();
    const authorName = user?.fullName || user?.firstName || 'Farmer';

    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [cropFilter, setCropFilter] = useState('');
    const [showAsk, setShowAsk] = useState(false);
    const [showAllCrops, setShowAllCrops] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetchPosts({ crop: cropFilter, q: search });
            setPosts(res.data.posts);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [cropFilter, search]);

    useEffect(() => {
        const id = setTimeout(load, search ? 300 : 0);
        return () => clearTimeout(id);
    }, [load, search]);

    const handleVote = async (id, type) => {
        try {
            const res = await votePost(id, type);
            setPosts(ps => ps.map(p => p.id === id ? { ...p, ...res.data } : p));
        } catch (e) { console.error(e); }
    };

    const handleAnswer = async (id, text) => {
        try {
            const res = await addAnswer(id, { author: authorName, text });
            setPosts(ps => ps.map(p => p.id === id ? { ...p, answers: [...p.answers, res.data] } : p));
        } catch (e) { console.error(e); }
    };

    const chips = showAllCrops ? CROP_CATALOG : CROP_CATALOG.slice(0, 8);

    return (
        <div className="pb-28 space-y-4">
            {/* Search bar */}
            <div className="flex items-center gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder={t('search_community')}
                        className="w-full h-12 rounded-full border border-gray-300 pl-12 pr-4 bg-white outline-none focus:border-primary"
                    />
                </div>
                <Bell className="h-6 w-6 text-gray-700" />
                <MoreVertical className="h-6 w-6 text-gray-700" />
            </div>

            {/* Filter chips */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-xl font-bold">{t('filter_by')}</h2>
                    <button className="text-blue-600 font-semibold" onClick={() => setShowAllCrops(!showAllCrops)}>{t('change')}</button>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1">
                    {chips.map(c => (
                        <button
                            key={c.id}
                            onClick={() => setCropFilter(cropFilter === c.name ? '' : c.name)}
                            className={`shrink-0 flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${cropFilter === c.name ? 'bg-primary text-white border-primary' : 'bg-white border-gray-300 text-gray-800'}`}
                        >
                            <span>{c.emoji}</span> {translateCrop(c.name, lang)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Feed */}
            {loading ? (
                <p className="text-center text-gray-500 py-10">…</p>
            ) : posts.length === 0 ? (
                <div className="text-center py-16 text-gray-500">
                    <p className="text-4xl mb-2">🌱</p>
                    <p>{t('no_posts')}</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {posts.map(p => (
                        <PostCard key={p.id} post={p} lang={lang} onVote={handleVote} onAnswer={handleAnswer} />
                    ))}
                </div>
            )}

            {/* Ask Community FAB */}
            <button
                onClick={() => setShowAsk(true)}
                className="fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] right-5 z-50 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full px-6 py-4 shadow-xl"
            >
                <Pencil className="h-5 w-5" /> {t('ask_community')}
            </button>

            {showAsk && <AskModal onClose={() => setShowAsk(false)} onCreated={() => load()} authorName={authorName} />}
        </div>
    );
};

export default Community;
