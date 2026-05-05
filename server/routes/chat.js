import express from 'express';
import { getChatResponse } from '../services/chatService.js';

const router = express.Router();

// POST /api/chat - Send message to chatbot
router.post('/', async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || message.trim() === '') {
      return res.status(400).json({ 
        error: 'Message cannot be empty' 
      });
    }

    // Get response from Hugging Face with RAG
    const result = await getChatResponse(message);

    res.json({
      userMessage: message,
      botResponse: result.response,
      success: result.success
    });
  } catch (error) {
    console.error('Chat API Error:', error);
    res.status(500).json({ 
      error: 'Failed to process chat message',
      details: error.message 
    });
  }
});

export default router;
