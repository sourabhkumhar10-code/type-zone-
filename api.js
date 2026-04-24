(function () {
  const STORAGE_KEYS = {
    token: "tz_auth_token",
    user: "tz_current_user",
  };

  const configuredBase = window.TYPEZONE_API_BASE || "http://localhost:3001";
  const base =
    configuredBase.endsWith("/api") || configuredBase.endsWith("/api/")
      ? configuredBase.replace(/\/$/, "")
      : `${configuredBase.replace(/\/$/, "")}/api`;

  const parseUser = (value) => {
    if (!value) return null;
    try {
      return JSON.parse(value);
    } catch (err) {
      console.warn("Failed to parse stored user", err);
      return null;
    }
  };

  const getSession = () => {
    const token = localStorage.getItem(STORAGE_KEYS.token) || null;
    const user = parseUser(localStorage.getItem(STORAGE_KEYS.user));
    if (!token || !user) {
      return { token: null, user: null };
    }
    return { token, user };
  };

  const saveSession = (token, user) => {
    localStorage.setItem(STORAGE_KEYS.token, token);
    localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
  };

  const clearSession = () => {
    localStorage.removeItem(STORAGE_KEYS.token);
    localStorage.removeItem(STORAGE_KEYS.user);
  };

  const apiRequest = async (path, options = {}) => {
    const { method = "GET", body, headers = {}, auth = false } = options;
    const request = {
      method,
      headers: {
        ...headers,
      },
    };

    if (body !== undefined) {
      request.headers["Content-Type"] =
        request.headers["Content-Type"] || "application/json";
      request.body = typeof body === "string" ? body : JSON.stringify(body);
    }

    if (auth) {
      const { token } = getSession();
      if (!token) {
        const error = new Error("Authentication required");
        error.code = "AUTH_REQUIRED";
        throw error;
      }
      request.headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${base}${path}`, request);
    const data =
      response.headers.get("content-type")?.includes("application/json")
        ? await response.json()
        : null;

    if (!response.ok) {
      const message = data?.error || response.statusText || "Request failed";
      const error = new Error(message);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  };

  window.tzApi = {
    API_BASE: base,
    apiRequest,
    getSession,
    saveSession,
    clearSession,
  };
})();


