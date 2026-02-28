import User from "../models/User.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";

/**
 * GET /api/admin/stats
 * Dashboard stats: counts, today's sales, monthly sales graph data
 */
export const getDashboardStats = async (req, res) => {
  try {
    const now = new Date();

    // ── Today boundaries ──────────────────────────────
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(todayStart);
    todayEnd.setDate(todayEnd.getDate() + 1);

    // ── Counts ────────────────────────────────────────
    const [totalUsers, totalProducts, totalOrders] = await Promise.all([
      User.countDocuments(),
      Product.countDocuments(),
      Order.countDocuments(),
    ]);

    // ── Total revenue ─────────────────────────────────
    const revenueAgg = await Order.aggregate([
      { $match: { status: { $ne: "cancelled" } } },
      { $group: { _id: null, total: { $sum: "$totalPrice" } } },
    ]);
    const totalRevenue = revenueAgg[0]?.total || 0;

    // ── Today's sales ─────────────────────────────────
    const todayAgg = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: todayStart, $lt: todayEnd },
          status: { $ne: "cancelled" },
        },
      },
      {
        $group: {
          _id: null,
          revenue: { $sum: "$totalPrice" },
          count: { $sum: 1 },
        },
      },
    ]);
    const todaySales = {
      revenue: todayAgg[0]?.revenue || 0,
      count: todayAgg[0]?.count || 0,
    };

    // ── Monthly sales (last 12 months) ────────────────
    const twelveMonthsAgo = new Date(
      now.getFullYear(),
      now.getMonth() - 11,
      1
    );
    const monthlyAgg = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: twelveMonthsAgo },
          status: { $ne: "cancelled" },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          revenue: { $sum: "$totalPrice" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    // Fill in missing months with 0
    const months = [];
    const labels = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const y = d.getFullYear();
      const m = d.getMonth() + 1;
      const found = monthlyAgg.find(
        (a) => a._id.year === y && a._id.month === m
      );
      months.push({
        label: `${labels[m - 1]} ${y}`,
        month: labels[m - 1],
        revenue: found?.revenue || 0,
        orders: found?.orders || 0,
      });
    }

    // ── Recent orders (latest 10) ─────────────────────
    const recentOrders = await Order.find({})
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    // ── Order status breakdown ────────────────────────
    const statusAgg = await Order.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);
    const ordersByStatus = {};
    statusAgg.forEach((s) => (ordersByStatus[s._id] = s.count));

    res.json({
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue,
      todaySales,
      monthlySales: months,
      recentOrders,
      ordersByStatus,
    });
  } catch (err) {
    console.error("getDashboardStats error:", err);
    res.status(500).json({ message: "Failed to fetch dashboard stats" });
  }
};

/**
 * GET /api/admin/users
 * All users (without passwords)
 */
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).sort({ createdAt: -1 }).lean();

    // Attach order count + total spent per user
    const userIds = users.map((u) => u._id);
    const orderAgg = await Order.aggregate([
      { $match: { user: { $in: userIds }, status: { $ne: "cancelled" } } },
      {
        $group: {
          _id: "$user",
          orderCount: { $sum: 1 },
          totalSpent: { $sum: "$totalPrice" },
          lastOrder: { $max: "$createdAt" },
        },
      },
    ]);

    const orderMap = {};
    orderAgg.forEach((o) => (orderMap[o._id.toString()] = o));

    const enriched = users.map((u) => {
      const stats = orderMap[u._id.toString()] || {};
      return {
        ...u,
        orderCount: stats.orderCount || 0,
        totalSpent: stats.totalSpent || 0,
        lastOrder: stats.lastOrder || null,
      };
    });

    res.json(enriched);
  } catch (err) {
    console.error("getAllUsers error:", err);
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

/**
 * DELETE /api/admin/users/:id
 */
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.role === "admin")
      return res.status(400).json({ message: "Cannot delete admin user" });
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete user" });
  }
};
