import React, { useState, useEffect } from "react";
import { collection, query, getDocs, doc, setDoc, deleteDoc, getDoc } from "firebase/firestore";
import { firestore } from "../firebase/config";
import './ListPantryItems.css'; // Import the CSS file
import { useSelector } from 'react-redux';
import { selectUser } from "../store/usersSlice"; 

function ListPantryItems() {
  const [pantryItems, setPantryItems] = useState([]);
  const [newItemName, setNewItemName] = useState("");
  const [newItemQuantity, setNewItemQuantity] = useState(1);
  const [newItemUnit, setNewItemUnit] = useState("Unit");
  const [units, setUnits] = useState(["Unit", "kg", "g", "L", "ml"]); // Default units
  const [showModal, setShowModal] = useState(false);

  const currentUser = useSelector(selectUser);

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
    console.log(currentUser.currentUser)
  }, [currentUser]);

  const addItem = async (item, quantity, unit) => {
    const docRef = doc(collection(firestore, 'Users', currentUser.currentUser.id, 'Pantry'), item);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const { count } = docSnap.data();
      await setDoc(docRef, { count: count + quantity, unit });
    } else {
      await setDoc(docRef, { count: quantity, unit });
    }

    setNewItemName("");
    setNewItemQuantity(1);
    setNewItemUnit("Unit");
    setShowModal(false);
    await readPantry();
  };

  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, 'Users', currentUser.uid, 'Pantry'), item);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const { count } = docSnap.data();
      if (count === 1) {
        await deleteDoc(docRef);
      } else {
        await setDoc(docRef, { count: count - 1 });
      }
    }

    await readPantry();
  };

  const handleAddUnit = () => {
    const newUnit = prompt("Enter the new unit:");
    if (newUnit && !units.includes(newUnit)) {
      setUnits([...units, newUnit]);
      setNewItemUnit(newUnit);
    }
  };

  return (
    <div className="containerPantryList">
      <h1>Pantry Items</h1>
      <button onClick={() => setShowModal(true)} className="add-item-button">Add Item</button>
      <div className="pantry-list-container">
        <div className="list-header">
          <div className="header-item">Item</div>
          <div className="header-quantity">Quantity</div>
        </div>
        <ul id="pantry-list">
          {pantryItems.map((item) => (
            <li key={item.id} className="pantry-list-item">
              <div className="item-name">{item.id}</div>
              <div className="item-quantity">{item.count || 1} {item.unit || 'Unit'}</div>
              <button className="remove-button" onClick={() => removeItem(item.id)}>Remove</button>
            </li>
          ))}
        </ul>
      </div>

      {showModal && (
        <div className="modalpantry">
          <div className="modal-content-pantry">
            <h2 id="modalHeader">Add Item</h2>
            <input
              type="text"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder="Item name"
              id="new-item-name-input"
            />
            <div id="unit-section">
            <input
              type="number"
              value={newItemQuantity}
              onChange={(e) => setNewItemQuantity(e.target.value)}
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
              <button onClick={() => addItem(newItemName, newItemQuantity, newItemUnit)} id="addItemButton">Add</button>
              <button onClick={() => setShowModal(false)} id="closeItemButton">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ListPantryItems;
