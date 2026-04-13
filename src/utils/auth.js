const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

// ✅ Get user
export const getUser = () => {
  const user = localStorage.getItem("user");

  if (!user || user === "undefined") return null;

  try {
    return JSON.parse(user);
  } catch {
    return null;
  }
};

// ✅ Get office id
export const getOfficeId = () => {
  const user = getUser();
  return user?.office_id || null;
};

// ✅ Logout
export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("lastActivity");

  window.location.href = "/login";
};

// ✅ Update activity (called on user actions)
export const updateActivity = () => {
  localStorage.setItem("lastActivity", Date.now());
};

// ✅ Check session expiry
export const checkSession = () => {
  const lastActivity = localStorage.getItem("lastActivity");

  if (!lastActivity) {
    logout(); // ✅ force logout
    return;
  }

  const now = Date.now();

  if (now - lastActivity > SESSION_TIMEOUT) {
    logout();
  }
};