import express from 'express';
import {
  createSession,
  getSessions,
  getMessages,
  deleteSession,
  streamChatCompletion,
} from '../controllers/chatController.js';

const router = express.Router();

router.post('/sessions', createSession);
router.get('/sessions', getSessions);
router.get('/sessions/:sessionId/messages', getMessages);
router.delete('/sessions/:sessionId', deleteSession);
router.post('/completions/stream', streamChatCompletion);

export default router;
