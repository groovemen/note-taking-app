"use client";
import React, { useState, useCallback } from "react";
import { debounce } from "lodash";
import NoteFooter from "./components/note-footer";
import { useExistingData } from "@/hooks/use-existing-notes-and-users";

const SESSION = 'challenge_surfe_sesh';
const BASE_URL = `https://challenge.surfe.com/${SESSION}`;

interface Users {
  id: number;
  first_name: string;
}

export default function Home() {
  // Integrate custom data management hook
  const { id, note, users, error, isLoading, setID, setNote } = useExistingData();

  // State management for user filtering during mentions
  const [filteredUsers, setFilteredUsers] = useState<Users[]>([]);
  const [lastUpdated, setLastUpdated] = useState();

  // Optimized note saving with debounce to reduce unnecessary network calls
  const savedNote = useCallback(
    debounce(async (body: string) => {
      try {
        // Dynamically determine API endpoint and method
        const url = id ? `${BASE_URL}/notes/${id}` : `${BASE_URL}/notes/`;
        const method = id ? "PUT" : "POST";

        const response = await (fetch(url, {
          method,
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify({body})
        }))

        // Validate save operation
        if(!response.ok) {
          throw new Error('Failed to save the note')
        }

        // Update note ID for new entries
        if (!id) {
          const newNote = await response.json();
          setID(newNote.id);
        }
      } catch (err) {
        console.error("Save error:", err);
      }
    }, 500),
    [id]
  )

  const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newNote = e.target.value;

    // Trigger note update and autosave
    setNote(newNote);
    savedNote(newNote);

    // Dynamic user mention filtering
    const words = newNote.split(/\s+/);
    const lastWord = words[words.length - 1];

    if (lastWord.startsWith("@")) {
      const searchWord = lastWord.slice(1).toLowerCase();
      const filteredUsers = users
        .filter(
          (user: Users) =>
            user.first_name.toLowerCase().includes(searchWord)
        )
        .slice(0, 10);
      setFilteredUsers(filteredUsers);
    } else {
      setFilteredUsers([]);
    }
  };

  // Insert selected user mention into the note
  const handleMention = (user: {first_name: string}) => {
    const noteWords = note.split(" ");
    noteWords[noteWords.length - 1] = `@${user.first_name} `;
    const newNote = noteWords.join(" ");

    // Update note with mention and save
    setNote(newNote);
    setFilteredUsers([]);
    savedNote(newNote);
  };

  // Handle loading and error states
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  const today = new Date();
  const day = today.getDate();
  const month = today.getMonth() + 1;
  const year = today.getFullYear();

  const latestUpdated = `${day}/${month}/${year}`

  return (
    <div className="mt-24">
      <main className="container mx-auto min-h-screen">
        <h1 className="text-3xl font-semibold text-center mb-8">
          Note-taking App
        </h1>
        <div className="relative w-96 bg-white rounded-lg p-6 m-auto">
          <h2 className="text-3xl font-bold text-gray-900">Note Title</h2>
          <p className="text-sm text-gray-600">Last update: {latestUpdated}</p>
          <textarea
            value={note}
            onChange={handleNoteChange}
            className="w-full h-44 p-2 text-gray-950 border rounded-md mt-6"
            placeholder="Start typing here... Use @ to mention users"
          ></textarea>
          {filteredUsers.length > 0 && (
            <div className="border rounded-md mt-1 h-44 overflow-scroll">
              {filteredUsers.map((user) => (
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
          <NoteFooter />
        </div>
      </main>
    </div>
  );
}
