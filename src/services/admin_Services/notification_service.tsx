// notificationService.ts
import axios from "axios";

const BASE_URL = "https://loan-backend-qnj0.onrender.com/api/v1/notification_route";

/**
 * Service for handling notification-related API requests
 */
const NotificationService = {
  /**
   * Send a new notification
   */
  sendNotification: async (notificationData: any): Promise<any> => {
    try {
      const response = await axios.post(`${BASE_URL}/create`, notificationData, {
        headers: {
          Authorization: `Bearer ${getAdminAuthToken()}`,
          'Content-Type': 'application/json'
        },
      });
      console.log (response.data)
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        throw error.response?.data?.message || "Failed to send notification";
      } else {
        throw "An unexpected error occurred";
      }
    }
  },
};

/**
 * Helper function to get the admin auth token
 */
const getAdminAuthToken = (): string | null => {
  return localStorage.getItem("adminToken");
};

export default NotificationService;