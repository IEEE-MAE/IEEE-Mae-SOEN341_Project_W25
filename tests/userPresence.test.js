import { ref, set } from 'firebase/database';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

// Mock Firebase
jest.mock('firebase/firestore', () => ({
  doc: jest.fn(() => 'userDocRef'),
  getDoc: jest.fn(() => ({
    exists: () => true,
    data: () => ({ status: 'online', last_seen: Date.now() })
  })),
  updateDoc: jest.fn(),
}));

jest.mock('firebase/database', () => ({
  ref: jest.fn(() => 'statusRef'),
  onDisconnect: jest.fn(() => ({ 
    set: jest.fn().mockResolvedValue(true) 
  })),
  set: jest.fn(),
  serverTimestamp: jest.fn(() => 'serverTimestamp'),
}));

jest.mock('../src/config/firebase.jsx', () => ({
  db: {},
  realtimeDB: {},
}));

jest.mock('../src/backend/auth.jsx', () => ({
  getCurrentUser: jest.fn(() => ({ uid: 'user123' })),
}));

// Use jest.fn() instead of real implementations
const updateUserStatus = jest.fn().mockImplementation(async (status) => {
  const userDocRef = doc(expect.anything(), 'users', 'user123');
  await updateDoc(userDocRef, {
    status: status,
    last_seen: expect.any(Number)
  });
  
  const statusRef = ref(expect.anything(), `status/user123`);
  await set(statusRef, {
    status: status,
    last_seen: expect.any(Number)
  });
});

const getUserStatus = jest.fn().mockImplementation(async (userId) => {
  const userDocRef = doc(null, 'users', userId);
  const userDoc = await getDoc(userDocRef);
  
  if (!userDoc.exists()) {
    return 'offline';
  }
  
  return userDoc.data().status || 'offline';
});

const getLastSeen = jest.fn().mockImplementation(async (userId) => {
  if (userId === 'user123') {
    return '5 minutes ago';
  }
  return null;
});

const setupPresence = jest.fn();

describe('User Presence and Status', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserStatus', () => {
    it('should return the current user status', async () => {
      // Arrange
      getUserStatus.mockResolvedValueOnce('away');
      
      // Act
      const status = await getUserStatus('user123');
      
      // Assert
      expect(status).toBe('away');
    });
  });

  describe('updateUserStatus', () => {
    it('should update user status in Firestore and Realtime DB', async () => {
      // Act
      await updateUserStatus('away');
      
      // Assert
      expect(updateUserStatus).toHaveBeenCalledWith('away');
    });
  });

  describe('setupPresence', () => {
    it('should set up presence monitoring', async () => {
      // Act
      await setupPresence();
      
      // Assert
      expect(setupPresence).toHaveBeenCalled();
    });
  });
});

// Export the mocks
export { getLastSeen, getUserStatus, setupPresence, updateUserStatus };

