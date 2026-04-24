// auth.js — super simple auth using localStorage (demo only)

const ensureApi = () => {
  if (!window.tzApi) {
    throw new Error("API client missing. Did you include api.js?");
  }
  return window.tzApi;
};

function getCurrentUser() {
  try {
    return ensureApi().getSession().user;
  } catch {
    return null;
  }
}

function getAuthToken() {
  try {
    return ensureApi().getSession().token;
  } catch {
    return null;
  }
}

async function loginUser({ username, password }) {
  const api = ensureApi();
  const trimmedUsername = String(username || "").trim();
  if (!trimmedUsername || !password) {
    throw new Error("Username and password are required");
  }

  const payload = await api.apiRequest("/auth/login", {
    method: "POST",
    body: { username: trimmedUsername, password },
  });

  api.saveSession(payload.token, payload.user);
  return payload.user;
}

async function registerUser({ username, email, fullName, password }) {
  const api = ensureApi();
  const trimmedUsername = String(username || "").trim();
  const trimmedEmail = String(email || "").trim();
  const trimmedFullName = String(fullName || "").trim();

  if (!trimmedUsername || !trimmedEmail || !trimmedFullName || !password) {
    throw new Error("All fields are required");
  }

  const payload = await api.apiRequest("/auth/register", {
    method: "POST",
    body: {
      username: trimmedUsername,
      email: trimmedEmail,
      fullName: trimmedFullName,
      password,
    },
  });

  api.saveSession(payload.token, payload.user);
  return payload.user;
}

function logoutUser() {
  try {
    ensureApi().clearSession();
  } catch {
    // ignore
  }
}

function userKey(suffix) {
  const user = getCurrentUser();
  return `${suffix}_${user ? user.username : "guest"}`;
}

async function requestPasswordReset(email) {
  const api = ensureApi();
  const trimmedEmail = String(email || "").trim();
  if (!trimmedEmail) {
    throw new Error("Email is required");
  }

  // Server will (for demo) return a token. Production should email the token instead.
  const payload = await api.apiRequest("/auth/forgot", {
    method: "POST",
    body: { email: trimmedEmail },
  });

  return payload;
}

async function resetPassword({ token, password }) {
  const api = ensureApi();
  if (!token || !password) {
    throw new Error("Token and new password are required");
  }

  const payload = await api.apiRequest("/auth/reset", {
    method: "POST",
    body: { token, password },
  });

  // If the server returns token and user, save session
  if (payload && payload.token && payload.user) {
    api.saveSession(payload.token, payload.user);
  }

  return payload;
}