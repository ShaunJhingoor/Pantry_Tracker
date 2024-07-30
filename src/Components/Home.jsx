import Header from "./Header"
import "./Home.css"
import ListPantryItems from "./ListPantryItems"
function Home(){
    return (
        <div id="ProduceSection">
        <Header/>
       <ListPantryItems/>
        <h1 style={{ fontSize: '5rem', color: 'red' }}>Hi</h1>
        </div>
      
    )
}

export default Home