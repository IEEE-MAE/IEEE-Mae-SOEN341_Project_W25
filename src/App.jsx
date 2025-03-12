import SignUp from "./components/SignUp.jsx";
import LogIn from "./components/LogIn.jsx";
import JoinTeam from "./components/JoinTeam";
import CreateTeam from "./components/CreateTeam.jsx";
import {BrowserRouter as Router, Routes, Route} from "react-router-dom";
import {AnimatePresence} from "framer-motion";
import Channels from "./components/Channels.jsx";
import LandingPage from "./components/LandingPage.jsx";
import Iridescence from "./assets/Iridescence.jsx";
import TeamPage from "./components/TeamPage.jsx";
import { ref, set, query, orderByChild, equalTo, onValue } from 'firebase/database';
import {realtimeDB} from "./config/firebase.jsx";

function AnimatedRoutes(){
//     const usersRef = ref(realtimeDB, 'users');
//     set(usersRef, {
//         user1: { name: 'Alice', team: 'alpha' },
//         user2: { name: 'Bob', team: 'alpha' },
//         user3: { name: 'Charlie', team: 'alpha' },
//         user4: { name: 'David', team: 'gamma' }
//     }).then(() => {
//         console.log("Test data written successfully!");
//     }).catch((error) => {
//         console.error("Error writing test data:", error);
//     });
//
// // 3. Query the data using `orderByChild('team')` and `equalTo('alpha')`
//     const q = query(usersRef, orderByChild('team'), equalTo('alpha'));
//
//     onValue(q, (snapshot) => {
//         if (snapshot.exists()) {
//             console.log('Query Result for team "alpha":', snapshot.val());
//         } else {
//             console.log('No users found for team "alpha".');
//         }
//     });
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