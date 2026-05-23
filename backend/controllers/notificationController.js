import Notification from "../models/Notification.model.js";

/**
 * 📣 Helper to create notifications programmatically in controllers
 */
export const createNotification = async ({
  recipient,
  sender = null,
  type,
  priority = "medium",
  title,
  message,
  link = "",
}) => {
  try {
    const notification = await Notification.create({
      recipient,
      sender,
      type,
      priority,
      title,
      message,
      link,
    });
    return notification;
  } catch (error) {
    console.error("❌ ERROR CREATING NOTIFICATION:", error);
  }
};

/**
 * 📥 GET USER NOTIFICATIONS
 */
export const getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user.id })
      .populate("sender", "name username avatar")
      .sort({ createdAt: -1 })
      .limit(100);

    res.status(200).json({
      success: true,
      count: notifications.length,
      notifications,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 👁️ MARK AS READ
 */
export const markNotificationRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user.id },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found or unauthorized",
      });
    }

    res.status(200).json({
      success: true,
      notification,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 🧹 MARK ALL AS READ
 */
export const markAllNotificationsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user.id, isRead: false },
      { isRead: true }
    );

    res.status(200).json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 🗑️ DELETE NOTIFICATION
 */
export const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      recipient: req.user.id,
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found or unauthorized",
      });
    }

    res.status(200).json({
      success: true,
      message: "Notification deleted",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
