import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./usersSlice"

export default configureStore({
    reducer: {
        users: userReducer
    }
})