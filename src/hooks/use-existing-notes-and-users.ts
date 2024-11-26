import {useState, useEffect} from "react";

const SESSION = 'challenge_surfe_sesh';
const BASE_URL = `https://challenge.surfe.com/${SESSION}`;
const USERS_URL = 'https://challenge.surfe.com/users';

export function useExistingUserAndNotes() {
  const [id, setID] = useState('');
  const [note, setNote] = useState([]);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
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
          throw new Error('Failed to load the users');
        }
        const userData = await userResponse.json();
        setUsers(userData);

        setIsLoading(false);
      } catch (err: any) {
        setError(err.message);
        setIsLoading(false);
      }
    };

    fetchSessionData();
  }, []);

  return {id, note, users, error, isLoading};
}