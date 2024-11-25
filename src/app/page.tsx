"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { debounce } from 'lodash';

const SESSION = 'challenge_surfe_sesh';
const BASE_URL = `https://challenge.surfe.com/${SESSION}`;
const USERS_URL = 'https://challenge.surfe.com/users';

export default function Home() {
  const [note, setNote] = useState('');
  const [ID, setID] = useState(null);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch the existing notes and users
  useEffect(() => {
    // Fetch the initial note - GET
    const fetchSessionData = async () => {
      try {
        setLoading(true);

        // Existing Notes
        const response = await fetch(`${BASE_URL}/notes`);
        if (response.ok) {
          const noteData = await response.json();
          if (noteData.length > 0) {
            const latestNote = noteData[noteData.length - 1];
            setNote(latestNote.body);
            setID(latestNote.id);
          }
        }

        // Existing Users
        const userResponse = await fetch(USERS_URL);
        if (!userResponse.ok) {
          throw new Error('Failed to load the users');
        }
        const userData = await userResponse.json();
        setUsers(userData);

        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchSessionData();
  }, []);

  // Debounced function for save note with fetch
  const savedNote = useCallback(
    debounce(async (body: string) => {
      try {
        let response;

        if (ID !== null) {
          // Update the existing note
          response = await fetch(`${BASE_URL}/notes/${ID}`, {
            method: "PUT",
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({body}),
          });
        } else {
          response = await fetch(`${BASE_URL}/notes`, {
            method: "POST",
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({body})
          })

          if(response.ok) {
            const newNote = await response.json();
            setID(newNote.id);
          }
        }

        if(!response.ok) {
          throw new Error('Failed to save the note')
        }
      } catch (err) {
        console.error('Save error:', err);
      }
    }, 500),
    [ID]
  )

  const handleNoteChange = (e: { target: { value: string; }; }) => {
    const newNote = e.target.value;
    setNote(newNote);
    savedNote(newNote);
    
    // Detect mention @
    const words = newNote.split(/\s+/);
    const lastWord = words[words.length - 1];
    
    if (lastWord.startsWith('@')) {
      const searchWord = lastWord.slice(1).toLowerCase();
      const filteredUsers = users
        .filter(user =>
          user && user.first_name &&
          user.first_name.toLowerCase().includes(searchWord)
        ).slice();      
      setFilteredUsers(filteredUsers);
    } else {
      setFilteredUsers([]);
    }
  }

  const handleMention = (user) => {
    
    if (!user || !user.first_name) return;

    const noteWords = note.split(' ');
    noteWords[noteWords.length - 1] = `@${user.first_name} `;
    const newNote = noteWords.join(' ')

    setNote(newNote);
    setFilteredUsers([]);
    savedNote(newNote);
  }
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="mt-24">
      <main className="container mx-auto min-h-screen">
        <div className="relative w-96 bg-white rounded-lg p-6">
          <h2 className="text-3xl font-bold text-gray-900">Note Title</h2>
          <p className="text-sm text-gray-600">Last update: 22 Nov 2024</p>
          <textarea
            value={note}
            onChange={handleNoteChange}
            className="w-full h-44 p-2 text-gray-950 border rounded-md mt-6"
            placeholder="Start typing here... Use @ to mention users"
          ></textarea>
          {filteredUsers.length > 0 && (
            <div className="border rounded-md mt-1 h-44 overflow-scroll">
              {filteredUsers.map(user => (
                <div
                  key={user?.id || Math.random()}
                  className="text-gray-800 px-2 py-1 hover:bg-gray-100 cursor-pointer capitalize"
                  onClick={() => user?.first_name && handleMention(user)}
                >
                  {user.first_name}
                </div>
              ))}
            </div>
          )}
          <div className="w-full flex justify-between mt-12">
            <div className="flex gap-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide text-gray-600 cursor-pointer lucide-type"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" x2="15" y1="20" y2="20"/><line x1="12" x2="12" y1="4" y2="20"/></svg>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide text-gray-600 cursor-pointer lucide-list"><path d="M3 12h.01"/><path d="M3 18h.01"/><path d="M3 6h.01"/><path d="M8 12h13"/><path d="M8 18h13"/><path d="M8 6h13"/></svg>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide text-gray-600 cursor-pointer lucide-image"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide text-gray-600 cursor-pointer lucide-file-pen-line"><path d="m18 5-2.414-2.414A2 2 0 0 0 14.172 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2"/><path d="M21.378 12.626a1 1 0 0 0-3.004-3.004l-4.01 4.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z"/><path d="M8 18h1"/></svg>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide text-gray-600 cursor-pointer lucide-trash-2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
          </div>
        </div>
      </main>
    </div>
  );
}
