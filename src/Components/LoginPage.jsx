import React, { useState } from "react";
import "./LoginPage.css"; 
import { signInWithEmailAndPassword, sendPasswordResetEmail, signInWithPopup, GoogleAuthProvider  } from "firebase/auth";
import {auth} from "../firebase/config"
import { useEffect } from "react";


function LoginPage({ onClose }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error,setError] = useState("")
  const provider = new GoogleAuthProvider();
  
  const handleSubmit = (e) => {
    e.preventDefault();
    signInWithEmailAndPassword(auth, email, password)

    .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        setError("Invalid Email or Password")
        console.log(errorMessage)
    });
  };


const handleGoogle = (e) => {
  e.preventDefault();

  signInWithRedirect(auth, provider);
};

// In your component or app initialization, handle the result after redirect
useEffect(() => {
  getRedirectResult(auth)
    .then((result) => {
      if (result) {
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const token = credential.accessToken;
        const user = result.user;
        // Handle user and token
      }
    }).catch((error) => {
      // Handle Errors here.
      const errorMessage = error.message;
      console.error("Google Sign-In Error:", errorMessage);
      setError("Google Sign-In Error");
    });
}, []);


  const handlePasswordReset = () => {
    const email = prompt('Please Enter Email')
    sendPasswordResetEmail(auth,email)
    alert('Email sent. Check indox for password reset')
  }

  return (
    <div className="login-container">
      <button className="close-modal" onClick={onClose}>X</button>
      <h2 className="login-title">Login</h2>
      <form onSubmit={handleSubmit} className="login-form">
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
        <button onClick={handleGoogle} className="google-button"><i className="fab fa-google"></i> Sign in with Google</button>
        </div>
        <p id="resetButton" onClick={handlePasswordReset}>Forgot Password</p>
      </form>
    </div>
  );
}

export default LoginPage;
