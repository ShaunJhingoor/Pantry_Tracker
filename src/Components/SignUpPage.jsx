// SignUpPage.js
import React, { useState } from "react";
import "./SignUpPage.css"; 
import {auth} from "../firebase/config"
import { createUserWithEmailAndPassword } from "firebase/auth";

function SignUpPage({ onClose }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("")

  const handleSubmit = (e) => {
    e.preventDefault();
    createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // Signed up 
      const user = userCredential.user;
    //   console.log(user)
      // ...
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      setError("Invalid Email or Password")
      // ..
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
        </div>
      </form>
    </div>
  );
}

export default SignUpPage;
