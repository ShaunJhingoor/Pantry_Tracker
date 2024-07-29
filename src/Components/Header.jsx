import { signOut } from "firebase/auth";
import { auth } from "../firebase/config";
import { useDispatch } from "react-redux";
import { setUser } from "../store/usersSlice";
import "./Header.css"

function Header(){
    const dispatch = useDispatch
    const handleSignOut = () => {
        if(confirm("Are you sure you want to sign out?")){
            signOut(auth).then(() => {
                dispatch(setUser(null))
                }).catch((error) => {
                    console.log(error.message)
                });
        }
    }
    return(
        <div id="headerContainer">
            <button onClick={handleSignOut}>LogOut</button>
        </div>
    )
}
export default Header