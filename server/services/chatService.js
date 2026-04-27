import axios from 'axios';
import Cake from '../models/Cake.js';

const HF_API_KEY = process.env.HUGGING_FACE_API_KEY;
const HF_MODEL = 'mistralai/Mistral-7B-Instruct-v0.1';
const HF_API_URL = `https://api-inference.huggingface.co/models/${HF_MODEL}`;

// Get all cakes for RAG context
async function getAllCakesContext() {
  try {
    const cakes = await Cake.find({});
    return cakes.map(cake => 
      `- ${cake.name}: $${cake.price}, Ingredients: ${cake.ingredients?.join(', ') || 'Not specified'}, Description: ${cake.description || 'Delicious cake'}`
    ).join('\n');
  } catch (error) {
    console.error('Error fetching cakes:', error);
    return 'No cakes available';
  }
}

// Build context-aware prompt with RAG
async function buildRAGPrompt(userMessage) {
  const cakesContext = await getAllCakesContext();
  
  const systemPrompt = `You are a helpful bakery assistant. You help customers find the perfect cake based on their preferences, allergies, and dietary needs.

Available Cakes:
${cakesContext}

Instructions:
- If customer mentions allergies or dietary needs, recommend cakes without those ingredients
- Be helpful and friendly
- Suggest the best seller cakes when asked
- For allergies, always check ingredients carefully
- Keep responses concise and helpful`;

  return `${systemPrompt}\n\nCustomer: ${userMessage}\nAssistant:`;
}

// Call Hugging Face API with RAG context
export async function getChatResponse(userMessage) {
  try {
    if (!HF_API_KEY) {
      return { response: 'API key not configured. Please set HUGGING_FACE_API_KEY.' };
    }

    // Build RAG prompt with cake context
    const prompt = await buildRAGPrompt(userMessage);

    // Call Hugging Face API
    const response = await axios.post(
      HF_API_URL,
      {
        inputs: prompt,
        parameters: {
          max_new_tokens: 200,
          temperature: 0.7,
        }
      },
      {
        headers: {
          Authorization: `Bearer ${HF_API_KEY}`,
          'Content-Type': 'application/json',
        }
      }
    );

    // Extract generated text
    const generatedText = response.data[0]?.generated_text || '';
    
    // Extract assistant response (after "Assistant:")
    const assistantResponse = generatedText.split('Assistant:').pop()?.trim() || 'Sorry, I could not generate a response.';

    return { 
      response: assistantResponse,
      success: true 
    };
  } catch (error) {
    console.error('Hugging Face API Error:', error.message);
    
    // Fallback response if API fails
    return {
      response: 'Our AI assistant is temporarily unavailable. Please try again later or contact support.',
      success: false,
      error: error.message
    };
  }
}
