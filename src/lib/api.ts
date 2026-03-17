// // src/lib/api.ts

// export async function apiFetch<T = any>(
//   endpoint: string,
//   options?: RequestInit
// ): Promise<T> {
//   const baseUrl = "https://ctbackend.crobstacle.com";
//   const url = endpoint.startsWith("http")
//     ? endpoint
//     : `${baseUrl}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

//   // Attach token
//   const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

//   const headers: HeadersInit = {
//     "Content-Type": "application/json",
//     ...(token ? { Authorization: `Bearer ${token}` } : {}),
//     ...(options?.headers as {}), // Merge custom headers if any
//   };

//   const response = await fetch(url, { ...options, headers });

//   // Global 401 handling
//   if (response.status === 401) {
//     localStorage.removeItem("token");
//     alert("Session expired. Please log in again.");
//     window.location.href = "/login";
//     throw new Error("Unauthorized");
//   }

//   // Basic error handling
//   if (!response.ok) {
//     const message = await response.text();
//     throw new Error(`API error: ${message}`);
//   }

//   // Parse and return JSON
//   return response.json();
// }


// src/lib/api.ts

export async function apiFetch<T = unknown>(
  endpoint: string,
  options?: RequestInit & { headers?: HeadersInit }
): Promise<T> {
  const baseUrl = "https://ctbackend.crobstacle.com";
  const url = endpoint.startsWith("http")
    ? endpoint
    : `${baseUrl}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

  // Attach token
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options?.headers ?? {}), // Merge custom headers
  };

  const response = await fetch(url, { ...options, headers });

  // Global 401 handling
  if (response.status === 401) {
    localStorage.removeItem("token");
    alert("Session expired. Please log in again.");
    window.location.href = "/login";
    throw new Error("Unauthorized");
  }

  // Basic error handling
  if (!response.ok) {
    const message = await response.text();
    throw new Error(`API error: ${message}`);
  }

  // Parse and return JSON
  return response.json() as Promise<T>;
}
