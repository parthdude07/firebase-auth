'use client'

import { useAuthState } from 'react-firebase-hooks/auth'
import { auth, db } from '@/app/firebase/config'
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { addDoc, collection } from 'firebase/firestore';
import { useState, useEffect } from 'react'; // Import useEffect

// This function is defined but not used in the component.
// You can remove it if it's not needed.
// async function getUserData() {
//  const userCollection = collection(db, 'users');
//  const userSnapshot = await getDocs(userCollection);
//  const userList = userSnapshot.docs.map(doc => doc.data());
//  return userList;
// }

async function addData(name, email, message) {
  try {
    const docRef = await addDoc(collection(db, "messages"), {
      name: name,
      email: email,
      message: message,
    });
    console.log("document written with ID:", docRef.id);
    return true; // FIX: Return true on success
  } catch (error) {
    console.error(error);
    return false;
  }
}

export default function Home() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const [user, loading] = useAuthState(auth);
  const router = useRouter();
  
  // Check for window to prevent server-side errors
  const userSession = typeof window !== 'undefined' ? sessionStorage.getItem('user') : null;

  // FIX: Handle redirect as a side effect
  useEffect(() => {
    if (loading) return; // Wait until auth state is loaded
    if (!user && !userSession) {
      router.push('/sign-up');
    }
  }, [user, userSession, loading, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const added = await addData(name, email, message);
    if (added) {
      setName("");
      setEmail("");
      setMessage("");
      alert("data added !!");
    } else {
      alert("Failed to add data. Please try again.");
    }
  }

  // Prevents flashing the page content before redirecting
  if (loading || (!user && !userSession)) {
    return <p>Loading...</p>;
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <button onClick={() => {
        signOut(auth);
        sessionStorage.removeItem('user');
      }}>
        Log out
      </button>

      <div>
        {/* FIX: Use onSubmit instead of action */}
        <form onSubmit={handleSubmit} className=''>
          <label htmlFor="name">input name:</label>
          <input type="text" id='name' value={name} onChange={(e) => { setName(e.target.value) }} />
          
          <label htmlFor="email">email:</label>
          <input type="text" id='email' value={email} onChange={(e) => { setEmail(e.target.value) }} />
          
          <label htmlFor="message">write your message:</label>
          {/* FIX: Correctly call setMessage in onChange */}
          <input type="text" id='message' value={message} onChange={(e) => setMessage(e.target.value)} />
          
          <button type='submit'>Submit</button>
        </form>
      </div>
    </main>
  )
}