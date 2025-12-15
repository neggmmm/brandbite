import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { useLocation } from "react-router-dom";
import io from "socket.io-client";

const NotificationContext = createContext(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    hasMore: true,
    loading: false,
  });

  const socketRef = useRef(null);
  const location = useLocation();

  const BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
  const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || BASE_URL;

  /* =========================
     FETCH NOTIFICATIONS
  ========================== */
  const fetchNotifications = useCallback(
    async (page = 1, append = false) => {
      try {
        setPagination(prev => ({ ...prev, loading: true }));

        const res = await fetch(
          `${BASE_URL}/api/notifications?page=${page}&limit=${pagination.limit}`,
          { credentials: "include" }
        );

        if (!res.ok) throw new Error("Fetch failed");

        const json = await res.json();

        if (json?.notifications) {
          const normalized = json.notifications.map(n => ({
            ...n,
            id: n._id || n.id,
          }));

          setNotifications(prev => {
            const updated = append
              ? [...prev, ...normalized]
              : normalized;

            setUnreadCount(updated.filter(n => !n.isRead).length);
            return updated;
          });

          setPagination(prev => ({
            ...prev,
            page,
            hasMore: json.pagination?.hasMore ?? false,
            loading: false,
          }));
        }
      } catch (err) {
        console.error("Failed to fetch notifications", err);
        setPagination(prev => ({ ...prev, loading: false }));
      }
    },
    [BASE_URL, pagination.limit]
  );

  /* =========================
     SOCKET + INITIAL LOAD
  ========================== */
  useEffect(() => {
    if (!location.pathname.startsWith("/admin")) return;

    // Initial fetch
    fetchNotifications(1, false);

    // Create socket ONCE
    if (socketRef.current) return;

    const socket = io(SOCKET_URL, {
      withCredentials: true,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("joinAdmin");
    });

    socket.on("notification", notification => {
      const currentPath = window.location.pathname;
      const isOnReviews = currentPath === "/admin/reviews";
      const isOnRewards = currentPath === "/admin/reward-orders";

      const shouldIgnore =
        (notification.type === "review" && isOnReviews) ||
        (notification.type === "reward" && isOnRewards);

      if (shouldIgnore) return;

      const newNotification = {
        id: notification._id || notification.id,
        title: notification.title || "New Notification",
        message: notification.message || "",
        type: notification.type,
        createdAt: notification.createdAt || new Date(),
        isRead: false,
        reviewId: notification.reviewId,
        rewardId: notification.rewardId,
      };

      setNotifications(prev => {
        const exists = prev.some(n => n.id === newNotification.id);
        if (exists) return prev;

        const updated = [newNotification, ...prev];
        setUnreadCount(updated.filter(n => !n.isRead).length);
        return updated;
      });
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.off("notification");
        socketRef.current.off("connect");
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [location.pathname, fetchNotifications, SOCKET_URL]);

  /* =========================
     MARK AS READ
  ========================== */
  const markAsRead = notificationId => {
    setNotifications(prev => {
      const updated = prev.map(n =>
        n.id === notificationId ? { ...n, isRead: true } : n
      );
      setUnreadCount(updated.filter(n => !n.isRead).length);
      return updated;
    });

    fetch(`${BASE_URL}/api/notifications/${notificationId}/read`, {
      method: "PATCH",
      credentials: "include",
    }).catch(err =>
      console.error("Failed to mark notification as read", err)
    );
  };

  /* =========================
     MARK ALL AS READ
  ========================== */
  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, isRead: true }))
    );
    setUnreadCount(0);

    notifications
      .filter(n => !n.isRead)
      .forEach(n => {
        fetch(`${BASE_URL}/api/notifications/${n.id}/read`, {
          method: "PATCH",
          credentials: "include",
        }).catch(() => {});
      });
  };

  /* =========================
     LOAD MORE
  ========================== */
  const loadMoreNotifications = () => {
    if (!pagination.loading && pagination.hasMore) {
      fetchNotifications(pagination.page + 1, true);
    }
  };

  /* =========================
     CLEAR
  ========================== */
  const clearNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        hasUnread: unreadCount > 0,
        pagination,
        markAsRead,
        markAllAsRead,
        clearNotifications,
        loadMoreNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
