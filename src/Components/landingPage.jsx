// Home.js
import React, { useState } from "react";
import "./landingPage.css";
import LoginPage from "./LoginPage";
import SignUpPage from "./SignUpPage";


function LandingPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState(""); 




  const openModal = (type) => {
    setModalType(type);
    setIsModalOpen(true);
  };
  const closeModal = () => setIsModalOpen(false);

  return (
    <div id="OusideHome">
      <div className="paper-container">
        <div className="paper-content">
          <h1 id="title">Welcome to Pantry Track</h1>
          <p id="description">
            Have you ever been to the grocery store and forgot your list or what
            you are picking up? Then this app is for you!
          </p>
          <div className="button-container">
            <button id="sign-up-button" onClick={() => openModal("signup")}>Sign Up</button>
            <button id="login-button" onClick={() => openModal("login")}>Login</button>
          </div>
        </div>
      </div>
      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            {modalType === "login" ? (
              <LoginPage onClose={closeModal} />
            ) : (
              <SignUpPage onClose={closeModal} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default LandingPage;
