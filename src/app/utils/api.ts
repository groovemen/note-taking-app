/**
 * Generic data fetching utility with error handling
 * 
 * @template T - Expected response type
 * @param {string} url - Endpoint URL for data retrieval
 * @returns {Promise<T>} Parsed JSON response
 * @throws {Error} If network request fails
 */

export async function fetchData<T>(url: string) : Promise<T>{
  const response = await fetch(url);

  // Comprehensive error handling for failed requests
  if (!response.ok) {
    throw new Error(`Failed to fetch data from ${url} : ${response.statusText}`)
  }

  return response.json();
}