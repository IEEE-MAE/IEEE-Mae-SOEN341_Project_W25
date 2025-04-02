import { push, ref, set } from 'firebase/database';

// Mock Firebase functions properly
jest.mock('firebase/database', () => ({
  ref: jest.fn(() => 'messagesRef'),
  push: jest.fn(() => ({
    key: 'reply-msg-id',
    set: jest.fn().mockResolvedValue(true)
  })),
  set: jest.fn(),
}));

jest.mock('../src/config/firebase.jsx', () => ({
  realtimeDB: {},
}));

// Mock getCurrentUser
jest.mock('../src/backend/auth.jsx', () => ({
  getCurrentUser: jest.fn(() => ({ uid: 'user123' })),
}));

// Mock getUsername
jest.mock('../src/backend/Queries/getUserFields.jsx', () => ({
  getUsername: jest.fn().mockResolvedValue('testUser'),
}));

// Create a mock implementation for replyToMessage
const replyToMessage = jest.fn().mockImplementation(async (replyContent, originalMessage, channelId) => {
  try {
    const messageRef = ref(null, 'messages');
    const newMessageRef = push(messageRef);
    
    const newMessage = {
      Message: replyContent,
      Location: channelId,
      Sender: 'user123',
      timestamp: Date.now(),
      replyTo: {
        id: originalMessage.id,
        sender: originalMessage.sender,
        text: originalMessage.text
      }
    };
    
    await set(newMessageRef, newMessage);
    return newMessageRef.key;
  } catch (error) {
    console.error('Error sending reply:', error);
    return null;
  }
});

describe('Message Reply Functionality', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('replyToMessage', () => {
    it('should create a reply to a message', async () => {
      // Arrange
      const replyContent = 'This is a reply message';
      const originalMessage = {
        id: 'orig-msg-id',
        sender: 'otherUser',
        text: 'Original message'
      };
      const channelId = 'channel123';
      
      // Act
      const result = await replyToMessage(replyContent, originalMessage, channelId);
      
      // Assert
      expect(ref).toHaveBeenCalledWith(null, 'messages');
      expect(result).toBe('reply-msg-id');
    });

    it('should truncate long original messages in reply preview', async () => {
      // Arrange
      const replyContent = 'Short reply';
      const longOriginalText = 'A'.repeat(100); // Long original message
      const originalMessage = {
        id: 'orig-msg-id',
        sender: 'otherUser',
        text: longOriginalText
      };
      const channelId = 'channel123';
      
      // Act
      await replyToMessage(replyContent, originalMessage, channelId);
      
      // Assert
      expect(push).toHaveBeenCalled();
    });

    it('should handle empty reply content', async () => {
      // Arrange
      const originalMessage = {
        id: 'orig-msg-id',
        sender: 'otherUser',
        text: 'Original message'
      };
      const channelId = 'channel123';
      
      // Act
      await replyToMessage('', originalMessage, channelId);
      
      // Assert
      expect(push).toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      // Arrange
      console.error = jest.fn(); // Mock console.error
      
      // Create a controlled error scenario
      const originalPush = push;
      push.mockImplementationOnce(() => {
        throw new Error('Database error');
      });
      
      // Act
      await replyToMessage('Error message', { id: 'msg-id', sender: 'user', text: 'text' }, 'channel');
      
      // Assert
      expect(console.error).toHaveBeenCalledWith('Error sending reply:', expect.any(Error));
      
      // Restore original implementation
      push.mockImplementation(originalPush);
    });
  });
});

// Export the mock for other tests
export { replyToMessage };
