// API Fetch - handle requests
export async function fetchData<T>(url: string) : Promise<T>{
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch data from ${url} : ${response.statusText}`)
  }
  return response.json();
}