"use client";
import React, { useState, useEffect, useCallback } from "react";
import { debounce } from "lodash";
import Link from "next/link";
import NoteFooter from "./components/note-footer";

const SESSION = 'challenge_surfe_sesh';
const BASE_URL = `https://challenge.surfe.com/${SESSION}`;
const USERS_URL = 'https://challenge.surfe.com/users';

interface Users {
  id: number;
  first_name: string;
}

interface UseExistingNotesAndUsersProps {
  setID: React.Dispatch<React.SetStateAction<number | null>>;
  setNote: React.Dispatch<React.SetStateAction<string>>;
}

// use-existing-notes-and-users
function useExistingNotesAndUsers({
  setID,
  setNote,
}: UseExistingNotesAndUsersProps) {
  const [users, setUsers] = useState<Users[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch the initial note - GET
    const fetchSessionData = async () => {
      try {
        setIsLoading(true);

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
          throw new Error("Failed to load the users");
        }
        const userData = await userResponse.json();
        setUsers(userData);

        setIsLoading(false);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);  // Safe access to 'message'
        } else {
          setError("An unknown error occurred");
        }
        setIsLoading(false);
      }
    };

    fetchSessionData();
  }, []);

  return { users, error, isLoading };
}

export default function Home() {
  const [ID, setID] = useState<number | null>(null);
  const [note, setNote] = useState("");
  const [filteredUsers, setFilteredUsers] = useState<Users[]>([]);

  // Fetch the existing notes and users
  const { users, error, isLoading } = useExistingNotesAndUsers({
    setID,
    setNote,
  });

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

  const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newNote = e.target.value;
    setNote(newNote);
    savedNote(newNote);

    // Detect mention @
    const words = newNote.split(/\s+/);
    const lastWord = words[words.length - 1];

    if (lastWord.startsWith("@")) {
      const searchWord = lastWord.slice(1).toLowerCase();
      const filteredUsers = users
        .filter(
          (user: Users) =>
            user &&
            user.first_name &&
            user.first_name.toLowerCase().includes(searchWord)
        )
        .slice(0, 10);
      setFilteredUsers(filteredUsers);
    } else {
      setFilteredUsers([]);
    }
  };

  const handleMention = (user: Users) => {
    if (!user || !user.first_name) return;

    const noteWords = note.split(" ");
    noteWords[noteWords.length - 1] = `@${user.first_name} `;
    const newNote = noteWords.join(" ");

    setNote(newNote);
    setFilteredUsers([]);
    savedNote(newNote);
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="mt-24">
      <main className="container mx-auto min-h-screen">
        <h1 className="text-3xl font-semibold text-center mb-8">
          Note-taking App
        </h1>
        <div className="relative w-96 bg-white rounded-lg p-6 m-auto">
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
