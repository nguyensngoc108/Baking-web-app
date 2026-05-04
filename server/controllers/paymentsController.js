import Payment from '../models/Payment.js';
import Order from '../models/Order.js';

// GET /api/payments/:orderId  (Admin only)
export const getPaymentByOrder = async (req, res) => {
  try {
    const payment = await Payment.findOne({
      orderId: req.params.orderId,
      deleted: false,
    });
    if (!payment) return res.status(404).json({ message: 'Payment not found' });
    res.json(payment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/payments/:id/status  (Admin only — used to mark cash payments as received)
export const updatePaymentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['pending', 'completed', 'failed', 'refunded'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: `status must be one of: ${allowed.join(', ')}` });
    }

    const payment = await Payment.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!payment) return res.status(404).json({ message: 'Payment not found' });

    // Mirror paymentStatus on the Order
    const orderStatus = status === 'completed' ? 'paid'
      : status === 'refunded' ? 'refunded'
      : status === 'failed' ? 'failed'
      : 'unpaid';

    await Order.findByIdAndUpdate(payment.orderId, { paymentStatus: orderStatus });

    res.json(payment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
