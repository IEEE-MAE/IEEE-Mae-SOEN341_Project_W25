import SignUp from "./components/SignUp.jsx";
import LogIn from "./components/LogIn.jsx";
import JoinTeam from "./components/JoinTeam";
import CreateTeam from "./components/CreateTeam.jsx";
import {BrowserRouter as Router, Routes, Route} from "react-router-dom";
import {AnimatePresence} from "framer-motion";
import TeamPage from "./components/TeamPage";
import Channels from "./components/Channels.tsx";
import LandingPage from "./components/LandingPage.tsx";
import Iridescence from "./assets/Iridescence.jsx";

function AnimatedRoutes(){
    return(
        <AnimatePresence mode="sync">
            <Routes>
                <Route path="/SignUp" element={<SignUp />} />
                <Route path="/" element={<LandingPage />} />
                <Route path="/LogIn" element={<LogIn />} />
                <Route path="/JoinTeam" element={<JoinTeam />} />
                <Route path="/CreateTeam" element={<CreateTeam />} />
                <Route path="/TeamPage" element={<TeamPage />} />
                <Route path="/Channels" element={<Channels />} />
            </Routes>
        </AnimatePresence>
    )
}

function App() {
    return (
        <Router>
            <Iridescence color={[0.15, 0.08, 0.3]} speed={0.5} amplitude={0.4} />
            <AnimatedRoutes />
        </Router>
    );
}

export default App;