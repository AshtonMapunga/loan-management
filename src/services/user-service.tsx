import axios from "axios";

const BASE_URL = "http://localhost:5050/api/v1/user_route";

const UserService = {
  /**
   * Fetches all users from the backend
   * @returns {Promise} Promise containing user data
   * @throws {Error} When authentication fails or other errors occur
   */
  getAllUsers: async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Authentication required - No token found");
    }

    try {
      const response = await axios.get(`${BASE_URL}/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        throw new Error("Session expired - Please login again");
      }
      throw new Error(error.response?.data?.message || "Failed to fetch users");
    }
  }
};

export default UserService;