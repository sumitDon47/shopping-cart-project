import axios from "axios";
import Order from "../models/Order.js";

/**
 * POST /api/payment/khalti/initiate
 * Initiate Khalti e-payment for an order
 */
export const initiateKhaltiPayment = async (req, res) => {
  try {
    const KHALTI_SECRET_KEY = process.env.KHALTI_SECRET_KEY;
    const KHALTI_GATEWAY_URL = process.env.KHALTI_GATEWAY_URL || "https://a.khalti.com/api/v2";

    if (!KHALTI_SECRET_KEY) {
      return res.status(500).json({ message: "Khalti secret key is not configured" });
    }

    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({ message: "Order ID is required" });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Verify ownership
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (order.isPaid) {
      return res.status(400).json({ message: "Order is already paid" });
    }

    // Khalti expects amount in paisa (1 NPR = 100 paisa)
    const amountInPaisa = Math.round(order.totalPrice * 100);

    const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";

    const payload = {
      return_url: `${CLIENT_ORIGIN}/payment/khalti/callback`,
      website_url: CLIENT_ORIGIN,
      amount: amountInPaisa,
      purchase_order_id: order._id.toString(),
      purchase_order_name: `Order #${order._id.toString().slice(-8).toUpperCase()}`,
      customer_info: {
        name: req.user.name,
        email: req.user.email,
      },
    };

    const response = await axios.post(
      `${KHALTI_GATEWAY_URL}/epayment/initiate/`,
      payload,
      {
        headers: {
          Authorization: `Key ${KHALTI_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    // Store the pidx on the order for later verification
    order.paymentResult = {
      ...order.paymentResult,
      pidx: response.data.pidx,
      status: "initiated",
    };
    await order.save();

    res.json({
      payment_url: response.data.payment_url,
      pidx: response.data.pidx,
    });
  } catch (err) {
    console.error("Khalti initiate error:", err.response?.data || err.message);
    const detail = err.response?.data?.detail
      || err.response?.data?.message
      || err.message
      || "Failed to initiate Khalti payment";
    res.status(500).json({
      message: detail,
      ...(process.env.NODE_ENV === "development" && { debug: err.response?.data }),
    });
  }
};

/**
 * POST /api/payment/khalti/verify
 * Verify Khalti payment after callback
 */
export const verifyKhaltiPayment = async (req, res) => {
  try {
    const KHALTI_SECRET_KEY = process.env.KHALTI_SECRET_KEY;
    const KHALTI_GATEWAY_URL = process.env.KHALTI_GATEWAY_URL || "https://a.khalti.com/api/v2";

    const { pidx, orderId } = req.body;

    if (!pidx || !orderId) {
      return res.status(400).json({ message: "pidx and orderId are required" });
    }

    // Lookup payment with Khalti
    const response = await axios.post(
      `${KHALTI_GATEWAY_URL}/epayment/lookup/`,
      { pidx },
      {
        headers: {
          Authorization: `Key ${KHALTI_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const paymentData = response.data;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Verify the amount matches (Khalti returns amount in paisa)
    const expectedAmount = Math.round(order.totalPrice * 100);
    if (paymentData.total_amount !== expectedAmount) {
      return res.status(400).json({
        message: "Payment amount mismatch",
        expected: expectedAmount,
        received: paymentData.total_amount,
      });
    }

    // Check payment status
    if (paymentData.status === "Completed") {
      order.isPaid = true;
      order.paidAt = new Date();
      order.paymentResult = {
        pidx: paymentData.pidx,
        transactionId: paymentData.transaction_id,
        status: paymentData.status,
        amount: paymentData.total_amount,
        paidVia: "khalti",
      };
      await order.save();

      return res.json({
        success: true,
        message: "Payment verified successfully",
        order,
      });
    } else {
      order.paymentResult = {
        pidx: paymentData.pidx,
        status: paymentData.status,
        paidVia: "khalti",
      };
      await order.save();

      return res.status(400).json({
        success: false,
        message: `Payment not completed. Status: ${paymentData.status}`,
        status: paymentData.status,
      });
    }
  } catch (err) {
    console.error("Khalti verify error:", err.response?.data || err.message);
    res.status(500).json({
      message: err.response?.data?.detail || "Failed to verify payment",
    });
  }
};
