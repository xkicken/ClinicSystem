import { useContext } from "react";
import { AuthContext } from "./authContextObject.js";

export const useAuth = () => useContext(AuthContext);