// SignUpPage.js
import React, { useState } from "react";
import "./SignUpPage.css"; 
import {auth} from "../firebase/config"
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";



function SignUpPage({ onClose }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("")
  const provider = new GoogleAuthProvider();

  const handleGoogle = (e) => {
    e.preventDefault();

    signInWithPopup(auth, provider)
      .then((result) => {
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const token = credential.accessToken;
        const user = result.user;
      }).catch((error) => {
        // Handle Errors here.
        const errorMessage = error.message;
        console.error("Google Sign-In Error:", errorMessage);
        setError("Google Sign-In Error");
      });
  };
  

  const handleSubmit = (e) => {
    e.preventDefault();
    createUserWithEmailAndPassword(auth, email, password)

    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      setError("Invalid Email or Password")
    })
  };



  return (
    <div className="signup-container">
      <button className="close-modal" onClick={onClose}>X</button>
      <h2 className="signup-title">Sign Up</h2>
      <form onSubmit={handleSubmit} className="signup-form">
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => {setEmail(e.target.value); setError("")}}
            required
            className="form-input"
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => {setPassword(e.target.value); setError("")}}
            required
            className="form-input"
          />
        </div>
        {
            error &&
        <div className="error">
            {error}
        </div>
        }
        <div id="submitButton">
        <button type="submit" className="submit-button">Submit</button>
        <button onClick={handleGoogle} className="google-button"><i className="fab fa-google"></i> Sign up with Google</button>
        </div>
      </form>
    </div>
  );
}

export default SignUpPage;
