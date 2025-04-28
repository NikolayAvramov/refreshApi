import express from 'express';
import { sendOrderConfirmationEmail } from '../services/emailService.js';
import { getDataFromFile, saveDataToFile } from '../services/dataService.js';
import authenticateToken from '../middleware/authentication.js';

const router = express.Router();

// Create a new order
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { items, totalAmount, shippingAddress } = req.body;
    const userId = req.user.userId;

    // Get user data to get email
    const users = await getDataFromFile('user');
    const user = users.find(u => u.id === userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Create order object
    const order = {
      id: Date.now(), // Simple ID generation
      userId,
      items,
      totalAmount,
      shippingAddress,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    // Save order to file
    let orders = await getDataFromFile('order') || [];
    orders.push(order);
    await saveDataToFile('order', orders);

    // Send confirmation email
    const emailSent = await sendOrderConfirmationEmail(user.email, {
      items,
      totalAmount,
      orderId: order.id
    });

    if (!emailSent) {
      console.log('Failed to send confirmation email');
    }

    res.status(201).json({
      message: 'Order created successfully',
      order,
      emailSent
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Error creating order' });
  }
});

export default router; 