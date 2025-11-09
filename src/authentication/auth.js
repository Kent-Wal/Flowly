import { auth } from "./firebase";
import {
    createUserWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithEmailAndPassword,
    signInWithPopup,
    signOut as fbSignOut,
    sendPasswordResetEmail,
} from "firebase/auth";

// Create user with email/password
export const doCreateUserWithEmailAndPassword = async (email, password) => {
    return createUserWithEmailAndPassword(auth, email, password);
};
// Backward-compat alias for the previous misspelled export (if referenced elsewhere)
export const doCreateUseWithEmailAndPassword = doCreateUserWithEmailAndPassword;

export const doSignInWithEmailAndPassword = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
};

export const doSignInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    return result;
};

export const doSignOut = () => {
    return fbSignOut(auth);
};

export const doPasswordReset = (email) => {
    return sendPasswordResetEmail(auth, email);
};