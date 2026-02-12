import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Copy, Check, ArrowLeft, Loader2, FileCode, Share2, Link2 } from 'lucide-react';
import { decompressCode } from './utils';

const ViewSnippet = () => {
    const { id } = useParams(); // 'id' here is actually the compressed string
    const [snippet, setSnippet] = useState<{ code: string; language: string } | null>(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);
    const [linkCopied, setLinkCopied] = useState(false);
    const [shortening, setShortening] = useState(false);
    const [shortUrl, setShortUrl] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (!id) return;

        try {
            const decompressed = decompressCode(id);
            if (decompressed) {
                setSnippet({ code: decompressed, language: 'javascript' }); // Auto-detect or default
            } else {
                setError('Invalid or corrupted snippet link.');
            }
        } catch (err) {
            setError('Failed to load snippet.');
        } finally {
            setLoading(false);
        }
    }, [id]);

    const handleCopy = () => {
        if (snippet) {
            navigator.clipboard.writeText(snippet.code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleCopyLink = () => {
        const urlToCopy = shortUrl || window.location.href; // Copy short URL if available
        navigator.clipboard.writeText(urlToCopy);
        setLinkCopied(true);
        setTimeout(() => setLinkCopied(false), 2000);
    };

    const handleShorten = async () => {
        if (shortUrl) {
            handleCopyLink();
            return;
        }

        setShortening(true);
        try {
            const currentUrl = window.location.href;
            const response = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(currentUrl)}`);
            if (response.ok) {
                const text = await response.text();
                setShortUrl(text);
                navigator.clipboard.writeText(text); // Auto copy
                setLinkCopied(true);
                setTimeout(() => setLinkCopied(false), 2000);
            } else {
                handleCopyLink(); // Fallback
            }
        } catch (err) {
            console.error("Failed to shorten", err);
            handleCopyLink();
        } finally {
            setShortening(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
                <Loader2 className="animate-spin mb-4 text-indigo-400" size={48} />
                <p className="text-gray-400 font-light tracking-wide animate-pulse">Retrieving snippet...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-center px-4 relative">
                <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-red-500/10 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
                <h1 className="text-8xl font-black text-white/5 mb-4">404</h1>
                <div className="glass-panel p-8 rounded-2xl max-w-md w-full relative z-10">
                    <p className="text-red-400 text-lg mb-8 font-medium">{error}</p>
                    <Link to="/" className="inline-flex items-center justify-center w-full gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-all font-medium">
                        <ArrowLeft size={18} />
                        Create New Snippet
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="relative min-h-screen flex flex-col items-center pt-20 pb-10 px-4">
            {/* Background Blobs (Simplified for view page) */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full filter blur-3xl opacity-50"></div>
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full filter blur-3xl opacity-50"></div>
            </div>

            <div className="w-full max-w-5xl mb-8 flex justify-between items-end">
                <div>
                    <Link to="/" className="text-gray-400 hover:text-white flex items-center gap-2 transition-colors mb-4 group">
                        <div className="p-2 rounded-lg bg-white/5 group-hover:bg-white/10 transition-colors">
                            <ArrowLeft size={16} />
                        </div>
                        <span className="font-medium text-sm">Back to Editor</span>
                    </Link>
                    <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                        <FileCode className="text-indigo-400" />
                        Snippet View
                    </h2>
                </div>

                <div className="hidden md:block text-right">
                    <p className="text-xs text-gray-500 uppercase tracking-widest font-mono mb-1">Snippet ID</p>
                    <p className="font-mono text-indigo-300 bg-indigo-500/10 px-3 py-1 rounded-md border border-indigo-500/20">{id}</p>
                </div>
            </div>

            <div className="w-full max-w-5xl glass-panel rounded-3xl p-1 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="bg-gray-950/90 rounded-[1.4rem] overflow-hidden min-h-[60vh] relative">
                    {/* Toolbar */}
                    <div className="p-4 bg-white/5 border-b border-white/5 flex justify-between items-center sticky top-0 z-10 backdrop-blur-md">
                        <div className="flex gap-2 px-2">
                            <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                            <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
                            <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={handleShorten}
                                disabled={shortening}
                                className={`
                                    flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300
                                    ${linkCopied
                                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                        : 'bg-white/5 hover:bg-white/10 text-gray-300 border border-white/5 hover:border-white/10'
                                    }
                                `}
                            >
                                {shortening ? (
                                    <Loader2 size={18} className="animate-spin" />
                                ) : linkCopied ? (
                                    <Check size={18} />
                                ) : shortUrl ? (
                                    <Link2 size={18} />
                                ) : (
                                    <Share2 size={18} />
                                )}

                                <span className="hidden sm:inline">
                                    {shortening
                                        ? 'Shortening...'
                                        : linkCopied
                                            ? 'Copied!'
                                            : shortUrl
                                                ? 'Copy Short Link'
                                                : 'Share Short Link'
                                    }
                                </span>
                            </button>

                            <button
                                onClick={handleCopy}
                                className={`
                                    flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300
                                    ${copied
                                        ? 'bg-green-500/20 text-green-400 border border-green-500/30 shadow-[0_0_15px_rgba(34,197,94,0.3)]'
                                        : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:-translate-y-0.5'
                                    }
                                `}
                            >
                                {copied ? (
                                    <>
                                        <Check size={18} />
                                        <span>Copied!</span>
                                    </>
                                ) : (
                                    <>
                                        <Copy size={18} />
                                        <span>Copy Code</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Code Content */}
                    <div className="overflow-x-auto custom-scrollbar">
                        <pre className="p-8 text-sm font-mono leading-relaxed text-gray-300">
                            <code>{snippet?.code}</code>
                        </pre>
                    </div>
                </div>
            </div>

            <div className="mt-8 text-center md:hidden">
                <p className="text-xs text-gray-500 uppercase tracking-widest font-mono mb-1">Snippet ID</p>
                <p className="font-mono text-gray-400">{id}</p>
            </div>
        </div>
    );
};

export default ViewSnippet;
