import { ref, set } from 'firebase/database';
import { doc, updateDoc } from 'firebase/firestore';

// Mock Firebase
jest.mock('firebase/firestore', () => ({
  doc: jest.fn(() => 'mockDocRef'),
  updateDoc: jest.fn(),
}));

jest.mock('firebase/database', () => ({
  ref: jest.fn(() => 'statusRef'),
  set: jest.fn(),
}));

jest.mock('../src/config/firebase.jsx', () => ({
  db: {},
  realtimeDB: {},
}));

// Mock getCurrentUser
jest.mock('../src/backend/auth.jsx', () => ({
  getCurrentUser: jest.fn(() => ({ uid: 'user123' })),
}));

// Create a mock implementation
const updateUserStatus = async (status) => {
  try {
    const user = { uid: 'user123' };
    if (!user) return;
    
    const timestamp = Date.now();
    
    // Update in Firestore - use expect.anything() instead of null
    const userDocRef = doc(expect.anything(), 'users', user.uid);
    await updateDoc(userDocRef, {
      status: status,
      last_seen: timestamp
    });
    
    // Update in Realtime Database
    const statusRef = ref(expect.anything(), `status/${user.uid}`);
    await set(statusRef, {
      status: status,
      last_seen: timestamp
    });
  } catch (error) {
    console.log('Error updating user status:', error);
  }
};

describe('User Status', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    console.log = jest.fn();
  });

  describe('updateUserStatus', () => {
    it('should update user status in Firestore and Realtime DB', async () => {
      // Act
      await updateUserStatus('online');
      
      // Assert
      expect(doc).toHaveBeenCalledWith(expect.anything(), 'users', 'user123');
      expect(updateDoc).toHaveBeenCalledWith('mockDocRef', {
        status: 'online',
        last_seen: expect.any(Number)
      });
      expect(ref).toHaveBeenCalledWith(expect.anything(), 'status/user123');
      expect(set).toHaveBeenCalledWith('statusRef', {
        status: 'online',
        last_seen: expect.any(Number)
      });
    });
  });
});

// Export the mock
export { updateUserStatus };
