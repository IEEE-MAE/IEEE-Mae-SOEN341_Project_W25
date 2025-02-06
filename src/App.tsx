import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import Home from "./pages/Home";

// Placeholder components for Create Group and Join Group pages
const CreateGroup: React.FC = () => <div>Create Group Page (Coming Soon)</div>;
const JoinGroup: React.FC = () => <div>Join Group Page (Coming Soon)</div>;

const App: React.FC = () => {
    const [count, setCount] = useState(0);

    return (
        <Router>
            <Routes>
                {/* Home Page Route */}
                <Route path="/" element={<Home />} />

                {/* Placeholder Pages */}
                <Route path="/create-group" element={<CreateGroup />} />
                <Route path="/join-group" element={<JoinGroup />} />

                {/* Main App UI with existing functionality */}
                <Route
                    path="/vite"
                    element={
                        <>
                            <div>
                                <a href="https://vite.dev" target="_blank" rel="noopener noreferrer">
                                    <img src={viteLogo} className="logo" alt="Vite logo" />
                                </a>
                                <a href="https://react.dev" target="_blank" rel="noopener noreferrer">
                                    <img src={reactLogo} className="logo react" alt="React logo" />
                                </a>
                            </div>
                            <h1>Vite + React</h1>
                            <div className="card">
                                <button onClick={() => setCount((count) => count + 1)}>
                                    count is {count}
                                </button>
                                <p>
                                    Edit <code>src/App.tsx</code> and save to test HMR
                                </p>
                            </div>
                            <p className="read-the-docs">
                                Click on the Vite and React logos to learn more
                            </p>
                        </>
                    }
                />
            </Routes>
        </Router>
    );
};

export default App;
