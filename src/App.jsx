import React, { useEffect, useState } from 'react';
import "./reset.css";
import LandingPage from './Components/landingPage';
import Home from "./Components/Home";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { selectUser } from "./store/usersSlice";
import { useDispatch, useSelector } from "react-redux";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase/config";
import { setUser } from "./store/usersSlice";

function App() {
  const user = useSelector(selectUser);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true); // Initialize to true to show the loading state initially

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        dispatch(setUser({ id: user.uid, email: user.email }));
      } else {
        dispatch(setUser(null));
      }
      setLoading(false); // Set loading to false after the auth state is determined
    });

    // Cleanup subscription on component unmount
    return () => unsubscribe();
  }, [dispatch]);

  if (loading) {
    return <div>Loading...</div>; // Or any other loading component
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={user?.currentUser ? <Home /> : <LandingPage />} />
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;
