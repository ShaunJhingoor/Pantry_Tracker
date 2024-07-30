import { collection, query, getDocs, doc, setDoc, deleteDoc} from "firebase/firestore";
import { useEffect } from "react";
import { firestore } from "../firebase/config";

function ListPantryItems() {
    const readPantry = async () => {
        const q = query(collection(firestore, "Pantry"));
        const snapshot = await getDocs(q);

        snapshot.forEach((doc) => {
            console.log(doc.id);
            // name: doc.id count: ...doc.data()
        });
        
    };
    useEffect(() => {
        readPantry()
    }, []);

  const addItem = async(item) => {
    const docRef = doc(collection(firestore, 'Pantry'), item)
    await setDoc(docRef, {}) 
     //const docsnap = awaig getDoc(docRef)
     //if (docsnap.exist){ 
        //const {count} = docSnap.data()
        //await setDoc(docRef, {count: count + 1})
    //  }else{
        // setDoc(docRef, {count: 1}) adds a count field to the item
    // }
    await readPantry()
  }

  const removeItem = async(item) => {
    const docRef = doc(collection(firestore, 'Pantry'), item)
    //const docsnap = await getDoc(docref)
    //if(docsnap.esists()){
        // const {count} = docsnap.data()
        // if(count ===1){
            // await deleteDoc(docref)
        // }else{
            // await setDoc(docRef, {count: count - 1})
        // }
    // }
    await deleteDoc(docRef, {})
    await readPantry()
  }

  return <div>Check the console for pantry items.</div>;
}

export default ListPantryItems;
