import React, { useState, useEffect } from "react";
import { collection, query, getDocs, doc, setDoc, deleteDoc, getDoc, where } from "firebase/firestore";
import { firestore } from "../firebase/config";
import './ListPantryItems.css'; 
import { useSelector } from 'react-redux';
import { selectUser } from "../store/usersSlice"; 
import OpenAI from "openai";
import CameraComponent from "./CameraComponent";



function ListPantryItems() {
  const [pantryItems, setPantryItems] = useState([]);
  const [newItemName, setNewItemName] = useState("");
  const [newItemQuantity, setNewItemQuantity] = useState(1);
  const [newItemUnit, setNewItemUnit] = useState("Unit");
  const [units, setUnits] = useState(["Unit", "kg", "g", "L", "ml"]); 
  const [showModal, setShowModal] = useState(false);
  const [newItemExpiration, setNewItemExpiration] = useState("")
  const [showIcon, setShowIcon] = useState(false);
  const [showIcon1, setShowIcon1] = useState(false);
  const [filter, setFilter] = useState("all");
  const [editingItem, setEditingItem] = useState(null);
  const currentUser = useSelector(selectUser);
  const [showCamera, setShowCamera] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [lastApiCall, setLastApiCall] = useState(0);
  const RATE_LIMIT_INTERVAL = 10000
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey) {
    console.error("Error: OPENAI_API_KEY environment variable is missing or empty.");
  }
  
  const openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
  
 ç
  
  const handleAddUnit = () => {
    const newUnit = prompt("Enter the new unit:");
    if (newUnit && !units.includes(newUnit)) {
      setUnits([...units, newUnit]);
      setNewItemUnit(newUnit);
    }
  };
  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  const animateText = (text) => {
    const words = text.split(' ');
    return words.map((word, wordIndex) => (
      <span key={wordIndex} className="word" style={{ animationDelay: `${wordIndex * 0.5}s` }}>
        {word.split('').map((char, index) => (
          <span key={index} style={{ animationDelay: `${(wordIndex * word.length + index) * 0.1}s` }}>
            {char}
          </span>
        ))}
      </span>
    ));
  };

  const todayDate = new Date().toISOString().split('T')[0];

  const handleDateChange = (e) => {
    const selectedDate = e.target.value;
    setNewItemExpiration(selectedDate);
  };

  const formatDate = (dateString) => {
    // Split the date string into components
    const [year, month, day] = dateString.split('-')
    return `${month}/${day}/${year.slice(2)}`
  };

  const filteredItems = pantryItems.filter((item) => {
    if (filter === "expired") {
      return item.expiration && new Date(item.expiration) < new Date();
    }
    if (filter === "expiring") {
      const today = new Date();
      const expiryDate = new Date(item.expiration);
      const timeDiff = expiryDate - today;
      const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
      return daysDiff <= 30 && daysDiff > 0;
    }
    if(filter === "expiringweek"){
      const today = new Date();
      const expiryDate = new Date(item.expiration);
      const timeDiff = expiryDate - today;
      const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
      return daysDiff <= 7 && daysDiff > 0;
    }
    return true; // Default to showing all items
  });

  const handleEditClick = (item) => {
    setNewItemName(item.name);
    setNewItemQuantity(item.count || 1); // Ensure this is a number
    setNewItemUnit(item.unit || "Unit");
    setNewItemExpiration(item.expiration || "");
    setEditingItem(item); // Set the item being edited
    setShowModal(true);
  };

  const handleCapture = (imageSrc) => {
    setCapturedImage(imageSrc);
    setShowCamera(false); // Close the camera after capture
    rateLimitedMain(imageSrc)
  };
  
 
  return (
    <div className="containerPantryList">
      <h1 id="PantryHeader">{animateText("Pantry Items")}</h1>
      <div className="filter-buttons">
        <button onClick={() => setFilter("all")} className={`filter-button ${filter === "all" ? "active" : ""}`}>All</button>
        <button onClick={() => setFilter("expired")} className={`filter-button filter-button-expired-button ${filter === "expired" ? "active" : ""}`}  onMouseEnter={() => setShowIcon1(true)}
        onMouseLeave={() => setShowIcon1(false)}>
        <span className="button-text">Expired</span>
         <i className="fas fa-trash-alt button-icon"></i>
        </button>
        <button onClick={() => setFilter("expiringweek")} className={`filter-button ${filter === "expiringweek" ? "active" : ""}`}>Expiring in 1 Week</button>
        <button onClick={() => setFilter("expiring")} className={`filter-button ${filter === "expiring" ? "active" : ""}`}>Expiring in 30 Days</button>
    </div>
      <button 
        onClick={() => setShowModal(true)} 
        className="add-item-button"
        onMouseEnter={() => setShowIcon(true)}
        onMouseLeave={() => setShowIcon(false)}
        >
        <span className="button-text">Add Item</span>
        <i className="fas fa-shopping-cart button-icon"></i>
      </button>
      <div className="pantry-list-container">
        <div className="list-header">
          <div className="header-item">Item</div>
          <div className="header-quantity">Quantity</div>
        </div>
        <ul id="pantry-list">
          {filteredItems.map((item) => (
            <li key={item.id} className="pantry-list-item">
              <div className="item-name">{capitalizeFirstLetter(item.name)}</div>
              <div className="item-quantity">{item.count || 1} {item.unit || 'Unit'}</div>
              <div className="item-expiration">{item.expiration ? `Expires: ${formatDate(item.expiration)}` : 'No expiration date'}</div>
              <p className="edit-button" onClick={() => handleEditClick(item)}><i className="fas fa-pencil-alt"></i></p>
              <button className="remove-button" onClick={() => removeItem(item.id)}><i className="fas fa-trash"></i></button>
            </li>
          ))}
        </ul>
      </div>

      {showModal && (
      <div className="modalpantry">
        <div className="modal-content-pantry">
          <h2 id="modalHeader">{editingItem ? "Edit Item" : "Add Item"}</h2>
          <input
            type="text"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            placeholder="Item name"
            id="new-item-name-input"
          />
          <label>Expiration Date</label>
          <input
            type="date"
            value={newItemExpiration}
            onChange={handleDateChange}
            id="new-item-expiration-input"
            min={todayDate}
          />
          {/* <label>Units</label> */}
          <div id="unit-section">
            <input
              type="number"
              value={newItemQuantity}
              onChange={(e) => {
                const value = e.target.value;
                if (/^\d*$/.test(value)) { 
                  setNewItemQuantity(value);
                }
              }}
              placeholder="Quantity"
              min="1"
              id="new-item-quantity-input"
            />
            <select
              value={newItemUnit}
              onChange={(e) => setNewItemUnit(e.target.value)}
              id="new-item-unit-select"
            >
              {units.map((unit, index) => (
                <option key={index} value={unit}>{unit}</option>
              ))}
            </select>
            <button onClick={handleAddUnit} id="addUnitButton">Add Unit</button>
          </div>
          <button onClick={() => setShowCamera(true)} id="openCameraButton"><i className="fas fa-camera"></i></button>
          <div id="buttonsForModal">
            <button
              onClick={() => {
                if (editingItem) {
                  editItem(editingItem, newItemName, newItemQuantity, newItemUnit, newItemExpiration);
                } else {
                  addItem(newItemName, newItemQuantity, newItemUnit, newItemExpiration);
                }
              }}
              id="addItemButton"
            >
              {editingItem ? "Save Changes" : "Add"}
            </button>
            <button onClick={() => {
              resetModalState();
              setShowModal(false);
            }} id="closeItemButton">
              Close
            </button>
          </div>
          {showCamera && (
            <div className="camera-modal">
              <CameraComponent
                onCapture={handleCapture}
                onClose={() => setShowCamera(false)}
              />
            </div>
          )}
        </div>
      </div>
    )}


    </div>
  );
}

export default ListPantryItems;
