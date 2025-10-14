import { useUserStore } from "@/stores/UserStore";
import { server } from "@/utils/server";
import { useCallback, useMemo } from "react";
import { LoginApiRespone } from "@/types/User.type";

type ErrorAPI = {
  error: {
    message: string;
    details: string[];
  };
};

export function useAPI() {
  const { setUser } = useUserStore();

  const baseUrl = server.baseUrl;
  const headers = useMemo(
    () => new Headers({ "Content-Type": "application/json" }),
    []
  );

  const setToken = useCallback(
    (token: string) => {
      headers.set("Authorization", "Bearer " + token);
    },
    [headers]
  );

  const intercepterResponse = useCallback(
    async (response: Response) => {
      if (response.status === 401) {
        const res = await fetch(baseUrl + "/api/user/refresh-token", {
          credentials: "include",
        });
        if (!res.ok) {
          const errorAPI = await res.json();
          throw new Error(errorAPI.message || "Error: No Message");
        }

        const data: LoginApiRespone = await res.json();
        setUser(data.data);
        setToken(data.token);
      }
    },
    [baseUrl, setUser, setToken]
  );

  const request = useCallback(
    async (endpoint: string, options: RequestInit) => {
      const res = await fetch(baseUrl + endpoint, {
        ...options,
        headers,
      });

      if (!res.ok) {
        await intercepterResponse(res);
        const errorAPI : ErrorAPI = await res.json();
        throw new Error(errorAPI.error.details[0]|| "API Error");
      }

      return await res.json();
    },
    [baseUrl, headers, intercepterResponse]
  );

  const get = useCallback(
    (endpoint: string, options: RequestInit = {}) => {
      return request(endpoint, { ...options, method: "GET" });
    },
    [request]
  );

  const post = useCallback(
    (endpoint: string, body: unknown, options: RequestInit = {}) => {
      return request(endpoint, {
        ...options,
        method: "POST",
        body: JSON.stringify(body),
      });
    },
    [request]
  );

  return { get, post, setToken };
}
