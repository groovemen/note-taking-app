import {useState, useEffect} from "react";
import { fetchData } from "../app/utils/api";

const SESSION = 'challenge_surfe_sesh';
const BASE_URL = `https://challenge.surfe.com/${SESSION}`;
const USERS_URL = 'https://challenge.surfe.com/users';

interface Users {
  id: number;
  first_name: string;
}

export function useExistingData() {
  const [id, setID] = useState<number | null>(null);
  const [note, setNote] = useState<string>("");
  const [users, setUsers] = useState<Users[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchSessionData = async () => {
      try {
        setIsLoading(true);

        // Fetch the Existing Notes
        const notes = await fetchData<{ id: number; body: string }[]>(
          `${BASE_URL}/notes`
        );

        if (notes.length > 0) {
          const latestNote = notes[notes.length - 1];
          setNote(latestNote.body);
          setID(latestNote.id);
        }

        // Fetch the Existing Users
        const users = await fetchData<Users[]>(USERS_URL);
        setUsers(users);

        setIsLoading(false);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred");
        }
        setIsLoading(false);
      }
    };

    fetchSessionData();
  }, []);

  return { id, note, users, error, isLoading, setID, setNote };
}