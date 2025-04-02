export function logLocalStorage() {
  console.log("Checking localStorage for user data");
  const userData = localStorage.getItem("user");
  if (userData) {
    try {
      const parsedUser = JSON.parse(userData);
      console.log("User data found:", parsedUser);
      return parsedUser;
    } catch (e) {
      console.error("Error parsing user data:", e);
      return null;
    }
  } else {
    console.log("No user data found in localStorage");
    return null;
  }
}