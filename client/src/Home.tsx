import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Code2, Share2, AlertCircle } from 'lucide-react';
import { compressCode } from './utils';

const Home = () => {
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async () => {
        if (!code.trim()) {
            setError("Please enter some code first.");
            return;
        }
        setError('');
        setLoading(true);

        // Simulate a brief delay for UX
        setTimeout(() => {
            try {
                const compressed = compressCode(code);
                navigate(`/view/${compressed}`);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setError('Failed to process snippet.');
                setLoading(false);
            }
        }, 500);
    };

    return (
        <div className="relative min-h-screen flex flex-col items-center justify-center p-4">
            {/* Background Blobs */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-200/40 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
                <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-200/40 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-pink-200/40 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
            </div>

            <div className="w-full max-w-5xl">
                <header className="mb-12 text-center space-y-4">
                    <div className="inline-flex items-center justify-center p-4 bg-white rounded-2xl ring-1 ring-gray-200 mb-6 shadow-xl shadow-indigo-100">
                        <Code2 size={42} className="text-indigo-600" />
                    </div>
                    <h1 className="text-6xl font-black tracking-tight text-gray-900 pb-2">
                        ClipShare
                    </h1>
                    <p className="text-gray-500 text-xl font-light max-w-2xl mx-auto leading-relaxed">
                        The minimal, lightning-fast way to share code with your team. <br />
                        <span className="text-gray-400">Just paste, click, and share.</span>
                    </p>
                </header>

                <div className="glass-panel rounded-3xl p-1 shadow-2xl transition-all duration-500 hover:shadow-indigo-500/5 ring-1 ring-gray-900/5">
                    <div className="bg-white rounded-[1.4rem] overflow-hidden">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                            <div className="flex gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                                <div className="w-3 h-3 rounded-full bg-green-400"></div>
                            </div>
                            <span className="text-xs font-mono text-gray-400 uppercase tracking-widest">New Snippet</span>
                        </div>

                        <div className="relative group">
                            <textarea
                                className="w-full h-[500px] p-8 bg-transparent text-gray-800 font-mono text-sm focus:outline-none resize-none placeholder-gray-400 leading-relaxed"
                                placeholder="// Paste your code here..."
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                spellCheck={false}
                            />

                            <div className="absolute bottom-8 right-8 flex gap-4">
                                {error && (
                                    <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg animate-in fade-in slide-in-from-bottom-2">
                                        <AlertCircle size={16} />
                                        <span className="text-sm font-medium">{error}</span>
                                    </div>
                                )}

                                <button
                                    onClick={handleSubmit}
                                    disabled={loading}
                                    className={`
                                flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-sm transition-all duration-300 transform hover:scale-105 active:scale-95
                                ${loading
                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-200'
                                        }
                            `}
                                >
                                    {loading ? (
                                        <span className="flex items-center gap-2">Processing...</span>
                                    ) : (
                                        <>
                                            <span>Generate Link</span>
                                            <Share2 size={18} />
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>



                <footer className="mt-20 text-center text-gray-400 text-sm pb-8">
                    <p>&copy; {new Date().getFullYear()} ClipShare. Designed for developers.</p>
                </footer>
            </div>
        </div>
    );
};

export default Home;
