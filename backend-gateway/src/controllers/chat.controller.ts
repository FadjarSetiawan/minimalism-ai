import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { queryDb } from '../database';
import { processLLMRequest } from '../services/llm.service';

// --- MODEL CATALOG ---
const MODEL_CATALOG: { [key: string]: { name: string; provider: string; creditCost: number; systemPrompt: string } } = {
  'minimalism-flash': {
    name: 'Minimalism Flash',
    provider: 'Minimalism AI',
    creditCost: 1,
    systemPrompt: 'You are Minimalism Flash. You are spacious, highly efficient, and capable of processing large contexts with minimal overhead.'
  },
  'minimalism-fast': {
    name: 'Minimalism Fast',
    provider: 'Minimalism AI',
    creditCost: 2,
    systemPrompt: 'You are Minimalism Fast. You are ultra-efficient, direct, and deliver high-speed, structured, and accurate outputs.'
  },
  'minimalism-think': {
    name: 'Minimalism Think',
    provider: 'Minimalism AI',
    creditCost: 3,
    systemPrompt: 'You are Minimalism Think. You provide extremely detailed, deep thinking, multi-layered responses. You break down logic in <thinking> tags before answering.'
  },
  'minimalism-lite': {
    name: 'Minimalism Lite',
    provider: 'Minimalism AI',
    creditCost: 1,
    systemPrompt: 'You are Minimalism Lite. You are a lightweight, low-resource, extremely cost-effective model providing simple, clear, and direct solutions.'
  },
  'minimalism-deep': {
    name: 'Minimalism Deep',
    provider: 'Minimalism AI',
    creditCost: 3,
    systemPrompt: 'You are Minimalism Deep. You are advanced, research-oriented, witty, and perform profound analysis to produce state-of-the-art results.'
  },
  'flux-image': {
    name: 'Flux Image',
    provider: 'Black Forest Labs',
    creditCost: 5,
    systemPrompt: 'You are an image prompt enhancer. Transform user requests into detailed, photorealistic image generation prompts.'
  }
};

// --- PUBLIC: GET AVAILABLE MODELS ---
export const getAvailableModels = (req: any, res: Response) => {
  const models = Object.entries(MODEL_CATALOG).map(([id, info]) => ({
    id,
    name: info.name,
    provider: info.provider,
    creditCost: info.creditCost
  }));
  return res.json({ models });
};

// --- UNIFIED CHAT ENDPOINT ---
export const unifiedChat = async (req: AuthRequest, res: Response) => {
  try {
    const { model, prompt, skill } = req.body;
    const user = req.user;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required.' });
    }

    // Validate model - Lock all requests to minimalism-flash for now
    const modelId = 'minimalism-flash';
    const modelInfo = MODEL_CATALOG[modelId];
    if (!modelInfo) {
      return res.status(400).json({ error: `Model '${modelId}' is not available.` });
    }

    // Check credits
    const ledger = await queryDb.getLedger(user.id);
    const available = ledger ? (15 - ledger.daily_prompts_used) : 0;
    if (available < modelInfo.creditCost) {
      return res.status(403).json({ 
        error: 'Insufficient credits. Please upgrade your plan.',
        creditsRemaining: available,
        creditCost: modelInfo.creditCost
      });
    }

    // Route to LLM — For MVP, all models go through Gemini with different system prompts.
    // In production, you'd route to the actual provider APIs here.
    const reply = await processLLMRequest(modelInfo.systemPrompt, prompt, undefined, modelId, skill);

    // Deduct credits (each prompt costs creditCost units)
    for (let i = 0; i < modelInfo.creditCost; i++) {
      await queryDb.incrementPromptsUsed(user.id);
    }

    const updatedLedger = await queryDb.getLedger(user.id);

    return res.json({
      reply,
      model: modelInfo.name,
      creditsUsed: modelInfo.creditCost,
      creditsRemaining: updatedLedger ? (15 - updatedLedger.daily_prompts_used) : 0
    });
  } catch (error) {
    console.error('Unified Chat Error:', error);
    return res.status(500).json({ error: 'Failed to process chat request.' });
  }
};

// --- GET CHAT HISTORY ---
export const getChatHistory = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    const segment = req.query.segment as string || 'chat';
    const chats = await queryDb.getChats(user.id, segment);
    return res.json({ chats });
  } catch (error) {
    console.error('Get Chat History Error:', error);
    return res.status(500).json({ error: 'Failed to retrieve chat history.' });
  }
};

// --- SAVE CHAT HISTORY ---
export const saveChatHistory = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    const { id, title, segment, messages } = req.body;
    
    if (!id || !segment || !messages) {
      return res.status(400).json({ error: 'Missing required parameters (id, segment, messages).' });
    }

    const chat = await queryDb.saveChat(user.id, id, title || 'New chat', segment, messages);
    return res.json({ success: true, chat });
  } catch (error) {
    console.error('Save Chat History Error:', error);
    return res.status(500).json({ error: 'Failed to save chat session.' });
  }
};

// --- DELETE CHAT HISTORY ---
export const deleteChatHistory = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    const id = req.params.id;
    
    if (!id) {
      return res.status(400).json({ error: 'Chat ID is required.' });
    }

    await queryDb.deleteChat(user.id, id);
    return res.json({ success: true });
  } catch (error) {
    console.error('Delete Chat History Error:', error);
    return res.status(500).json({ error: 'Failed to delete chat session.' });
  }
};
