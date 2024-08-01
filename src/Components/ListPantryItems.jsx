import React, { useState, useEffect } from "react";
import { collection, query, getDocs, doc, setDoc, deleteDoc, getDoc, where } from "firebase/firestore";
import { firestore } from "../firebase/config";
import './ListPantryItems.css'; 
import { useSelector } from 'react-redux';
import { selectUser } from "../store/usersSlice"; 
// import OpenAI from "openai";
// const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
// if (!apiKey) {
//   console.error("Error: OPENAI_API_KEY environment variable is missing or empty.");
// }

// const openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
function ListPantryItems() {
  const [pantryItems, setPantryItems] = useState([]);
  const [newItemName, setNewItemName] = useState("");
  const [newItemQuantity, setNewItemQuantity] = useState(1);
  const [newItemUnit, setNewItemUnit] = useState("Unit");
  const [units, setUnits] = useState(["Unit", "kg", "g", "L", "ml"]); // Default units
  const [showModal, setShowModal] = useState(false);
  const [newItemExpiration, setNewItemExpiration] = useState("")
  const [showIcon, setShowIcon] = useState(false);
  const [showIcon1, setShowIcon1] = useState(false);
  const [filter, setFilter] = useState("all");
  const [editingItem, setEditingItem] = useState(null);
  const currentUser = useSelector(selectUser);

  const [response, setResponse] = useState("");

  // useEffect(() => {
  //   const fetchData = async () => {
  // //   
  // //     const completion = await openai.chat.completions.create({
  // //       model: "gpt-3.5-turbo",
  // //       messages: [
  // //         { 
  // //           role: "user", 
  // //           message: {
  // //             type: "text",
  // //             text:"You are a helpful assistant."
  // //           }, 
  // //       }],
  // //     });

  // //     console.log("Completion response:", completion); 
  // //     setResponse(completion.choices[0]);
   
  // // }

  // // fetchData();
  // // const completion = await openai.chat.completions.create({
  // //     model: "gpt-4-vision-preview",
  // //     messages: [
  // //       { 
  // //         role: "user", 
  // //         message: {
  // //           type: "text",
  // //           text:"describe this image"
  // //         }, 
  // //       },
  // //       {
  // //         type:"image_url",
  // //         image_url:{
  // //           url:"any image url",
  // //           detail: "low" 
  // //           //resize the image 
  // //         }
  // //       }
  // //   ],
  // //     max_tokens:1000,
  // //     model: "gpt-4-vision-preview"
  // //   });

  // //   console.log("Completion response:", completion); 
  // //   setResponse(completion.choices[0]);

  // // }
//   const completion = await openai.chat.completions.create({
//     model: "gpt-4-vision-preview",
//     messages: [
//       { 
//         role: "user", 
//         message: {
//           type: "text",
//           text:"describe this image"
//         }, 
//       },
//       {
//         type:"image_url",
//         image_url:{
//           url:"any image url",
//           detail: "low" 
//           //resize the image 
//         }
//       }
//   ],
//     max_tokens:1000,
//     model: "gpt-4-vision-preview"
//   });

//   console.log("Completion response:", completion); 
//   setResponse(completion.choices[0]);

// }
// fetchData();
//   }, []);

  const readPantry = async () => {
    const q = query(collection(firestore, "Users", currentUser.currentUser.id, "Pantry"));
    const snapshot = await getDocs(q);
    const items = [];

    snapshot.forEach((doc) => {
      items.push({ id: doc.id, ...doc.data() });
    });

    setPantryItems(items);
  };

  useEffect(() => {
    readPantry();
  }, [currentUser]);

  const resetModalState = () => {
    setNewItemName("");
    setNewItemQuantity(1);
    setNewItemUnit("Unit");
    setNewItemExpiration("");
    setEditingItem(null);
  };
  const addItem = async (item, quantity, unit, expiration) => {
    try {
      const pantryCollectionRef = collection(firestore, 'Users', currentUser.currentUser.id, 'Pantry');
      
      
      const quantityNumber = Number(quantity);
      if (isNaN(quantityNumber)) {
        console.error("Invalid quantity value:", quantity);
        return;
      }
  
      // Use a combination of item name and unit to create a unique ID
      const docId = `${item.toLowerCase()}_${unit.toLowerCase()}_${expiration.toLowerCase()}`;
  
      
      const q = query(pantryCollectionRef, where("__name__", "==", docId));
      const snapshot = await getDocs(q);
  
      if (!snapshot.empty) {
        const docSnap = snapshot.docs[0];
        const docRef = docSnap.ref;
        const data = docSnap.data();
        const currentCount = Number(data.count) || 0;
        const newCount = currentCount + quantityNumber;
  
        await setDoc(docRef, { count: newCount, expiration }, { merge: true });
      } else {
        await setDoc(doc(pantryCollectionRef, docId), { name: item, count: quantityNumber, unit, expiration });
      }
  
      // Reset state and close modal
      resetModalState()
      setShowModal(false);
  
      // Refresh the pantry items
      await readPantry();
    } catch (error) {
      console.error("Error adding item:", error);
    }
  };
  
  const editItem = async (itemId, newName, newQuantity, newUnit, newExpiration) => {
    try {
      const pantryCollectionRef = collection(firestore, 'Users', currentUser.currentUser.id, 'Pantry');
      const quantityNumber = Number(newQuantity);
  
      if (isNaN(quantityNumber) || quantityNumber <= 0) {
        console.error("Invalid quantity value:", newQuantity);
        return;
      }
      
      const q = query(pantryCollectionRef, where("__name__", "==", itemId.id)); 
    
      const snapshot = await getDocs(q);
    
      
        const docSnap = snapshot.docs[0];
     
        const docRef = docSnap.ref;
        const data = docSnap.data();
        const originalDocId = data.originalDocId; 
        
        const newDocId = `${newName.toLowerCase()}_${newUnit.toLowerCase()}_${newExpiration.toLowerCase()}`;
  
        
        await setDoc(docRef, { 
            count: quantityNumber, 
            unit: newUnit, 
            expiration: newExpiration,
            name: newName,
            originalDocId: newDocId
          }, { merge: true });
     
  
      // Reset state and close modal
      resetModalState()
      setShowModal(false);
      // Refresh the pantry items
      await readPantry();
    } catch (error) {
      console.error("Error editing item:", error);
    } finally {
      // Ensure editingItem is cleared regardless of success or failure
      resetModalState()
      setShowModal(false);
    }
  };
  
  const removeItem = async (item) => {
    try {
      const docRef = doc(collection(firestore, 'Users', currentUser.currentUser.id, 'Pantry'), item);

      const docSnap = await getDoc(docRef);
  
      if (docSnap.exists()) {
        await deleteDoc(docRef);
        await readPantry();
      } else {
        console.log("Document does not exist.");
      }
    } catch (error) {
      console.error("Error removing item:", error);
    }
  };
  
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
          <span key={index} style={{ animationDelay: `${(wordIndex * word.length + index) * 0.05}s` }}>
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
  // console.log(response)
  return (
    <div className="containerPantryList">
      <h1 id="PantryHeader">{animateText("Pantry Items")}</h1>
      <p>{response}</p>
      <div className="filter-buttons">
        <button onClick={() => setFilter("all")} className={`filter-button ${filter === "all" ? "active" : ""}`}>All</button>
        <button onClick={() => setFilter("expired")} className={`filter-button filter-button-expired-button ${filter === "expired" ? "active" : ""}`}  onMouseEnter={() => setShowIcon1(true)}
        onMouseLeave={() => setShowIcon1(false)}>
        <span className="button-text">Expired</span>
         <i className="fas fa-trash-alt button-icon"></i>
        </button>
        <button onClick={() => setFilter("expiring")} className={`filter-button ${filter === "expiring" ? "active" : ""}`}>Expiring 30 Days</button>
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
              <button className="remove-button" onClick={() => removeItem(item.id)}>Remove</button>
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
            <input
                type="date"
                value={newItemExpiration}
                onChange={handleDateChange}
                id="new-item-expiration-input"
                min={todayDate}
            />
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
            <div id="buttonsForModal">
                <button
                onClick={() => {
                    if (editingItem) {
                    editItem(editingItem,newItemName, newItemQuantity, newItemUnit, newItemExpiration);
                    } else {
                    addItem(newItemName, newItemQuantity, newItemUnit, newItemExpiration);
                    }
                }}
                id="addItemButton"
                >
                {editingItem ? "Save Changes" : "Add"}
                </button>
                <button onClick={() =>  {
                    resetModalState();
                    setShowModal(false);
                }} id="closeItemButton">
                    Close
                </button>
            </div>
            </div>
        </div>
        )}

    </div>
  );
}

export default ListPantryItems;