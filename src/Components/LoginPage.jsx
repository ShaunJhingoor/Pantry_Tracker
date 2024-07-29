import React, { useState } from "react";
import "./LoginPage.css"; 
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import {auth} from "../firebase/config"


function LoginPage({ onClose }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error,setError] = useState("")
  
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
        </div>
        <p id="resetButton" onClick={handlePasswordReset}>Forgot Password</p>
      </form>
    </div>
  );
}

export default LoginPage;
