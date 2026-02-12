import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Home';
import ViewSnippet from './ViewSnippet';

function App() {
    return (
        <Router>
            <div className="min-h-screen bg-gray-950 text-gray-200 font-sans selection:bg-indigo-500 selection:text-white">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/view/:id" element={<ViewSnippet />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
