import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";

// Replace these with your actual Firebase project configuration details from your Firebase console
const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Save room details and automatically generated questions to Firebase
export async function saveRoomToFirebase(roomCode, roomData) {
  try {
    await setDoc(doc(db, "stakedRooms", String(roomCode)), {
      ...roomData,
      createdAt: new Date()
    });
    return true;
  } catch (error) {
    console.error("Error saving room to Firebase:", error);
    return false;
  }
}

// Fetch room details and questions when a player joins via the WhatsApp link
export async function getRoomFromFirebase(roomCode) {
  try {
    const docRef = doc(db, "stakedRooms", String(roomCode));
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data();
    }
    return null;
  } catch (error) {
    console.error("Error fetching room from Firebase:", error);
    return null;
  }
}
