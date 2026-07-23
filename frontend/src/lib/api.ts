const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}



function getToken(): string | null {
    return localStorage.getItem("access_token");
}



async function request<T>(
    path:string,
    options: RequestInit = {}
):Promise<T>{
    const token = getToken();

    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(options.headers as Record<string, string>),

    };

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });


  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({ detail: "Request failed" }));
    throw new ApiError(res.status, errorBody.detail || `Error ${res.status}`);
  }

  if (res.status === 204) {
    return {} as T;
  }

  return res.json();
}


export const api = {
  get: <T>(path: string) => request<T>(path, { method: "GET" }),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "PUT", body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "PATCH", body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};
