// services/user_Services/notifications_service.ts
import axios from "axios";

const BASE_URL = "https://loan-backend-qnj0.onrender.com/api/v1/notification_route";

/**
 * Service for handling notification-related API requests
 */
const NotificationService = {
  /**
   * Get all notifications for the current user
   */
  getAllNotifications: async (): Promise<any> => {
    try {
      const response = await axios.get(`${BASE_URL}/getall`, {
        headers: {
          Authorization: `Bearer ${getUserAuthToken()}`,
          'Content-Type': 'application/json'
        },
      });
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        throw error.response?.data?.message || "Failed to fetch notifications";
      } else {
        throw "An unexpected error occurred";
      }
    }
  },

  /**
   * Get a specific notification by its ID
   * @param notificationId The ID of the notification to retrieve
   */
  getNotificationById: async (notificationId: string): Promise<any> => {
    try {
      const response = await axios.get(`${BASE_URL}/get/${notificationId}`, {
        headers: {
          Authorization: `Bearer ${getUserAuthToken()}`,
          'Content-Type': 'application/json'
        },
      });
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        throw error.response?.data?.message || "Failed to fetch notification";
      } else {
        throw "An unexpected error occurred";
      }
    }
  },

  /**
   * Get user details by ID
   * @param userId The ID of the user to retrieve
   */
  getUserById: async (userId: string): Promise<any> => {
    try {
      const response = await axios.get(
        `https://loan-backend-qnj0.onrender.com/api/v1/user_route/get/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${getUserAuthToken()}`,
            'Content-Type': 'application/json'
          },
        }
      );
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        throw error.response?.data?.message || "Failed to fetch user details";
      } else {
        throw "An unexpected error occurred";
      }
    }
  }
};

/**
 * Helper function to get the user auth token
 */
const getUserAuthToken = (): string | null => {
  return localStorage.getItem("userToken"); // Changed from adminToken to userToken
};

export default NotificationService;