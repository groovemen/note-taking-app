import {useState, useEffect} from "react";
import { fetchData } from "../app/utils/api";

const SESSION = 'challenge_surfe_sesh';
const BASE_URL = `https://challenge.surfe.com/${SESSION}`;
const USERS_URL = 'https://challenge.surfe.com/users';

// Type deffinition for Users
interface Users {
  id: number;
  first_name: string;
}

export function useExistingData() {
  // State management
  const [id, setID] = useState<number | null>(null);
  const [note, setNote] = useState<string>("");
  const [users, setUsers] = useState<Users[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch initial data when component mounts
  useEffect(() => {
    const fetchSessionData = async () => {
      try {
        // Set loading state before data retrieval
        setIsLoading(true);

        // Retrieve existing notes for the current session
        const notes = await fetchData<{ id: number; body: string }[]>(
          `${BASE_URL}/notes`
        );
        
        // Populate note data if existing notes are found
        if (notes.length > 0) {
          const latestNote = notes[notes.length - 1];
          setNote(latestNote.body);
          setID(latestNote.id);
        }

        // Fetch Users list for collaborative features
        const users = await fetchData<Users[]>(USERS_URL);
        setUsers(users);

        setIsLoading(false);
      } catch (err: unknown) {
        // Error handling
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred");
        }
        setIsLoading(false);
      }
    };

    // Executes data fetching
    fetchSessionData();
  }, []); // Ensure single execution on component mount

  // Return states and setters for component integration
  return { id, note, users, error, isLoading, setID, setNote };
}