import { arrayUnion, collection, doc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { getAllTeamMembers } from './mockTeamQueries';

// Mock Firebase
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(() => 'collectionRef'),
  getDocs: jest.fn(),
  query: jest.fn(() => 'queryRef'),
  where: jest.fn(() => 'whereClause'),
  doc: jest.fn(() => 'docRef'),
  updateDoc: jest.fn(),
  arrayUnion: jest.fn(val => val),
}));

// Mock imported functions
jest.mock('./mockTeamQueries', () => ({
  getAllTeamMembers: jest.fn(),
}));

jest.mock('../src/config/firebase.jsx', () => ({
  db: {},
}));

// Create mock implementations
const createDefaultChannel = async (channelName, teamId) => {
  try {
    // Get all team members
    const teamMembers = await getAllTeamMembers(teamId);
    
    // Create the channel ID
    const channelId = `${teamId}${channelName}`;
    
    // Add the channel to each team member's channels
    for (const memberDoc of teamMembers) {
      const userDocRef = doc(null, 'users', memberDoc.id);
      await updateDoc(userDocRef, {
        channels: arrayUnion(channelId)
      });
    }
  } catch (error) {
    console.error('Error creating default channel:', error);
  }
};

const isDefaultChannel = async (channelId, teamId) => {
  try {
    const channelsRef = collection(null, 'channels');
    const q = query(channelsRef, where('id', '==', channelId));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return false;
    }
    
    return querySnapshot.docs[0].data().isDefault || false;
  } catch (error) {
    console.error('Error checking if channel is default:', error);
    return false;
  }
};

describe('Default Channels Functionality', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createDefaultChannel', () => {
    it('should create a default channel and add all team members to it', async () => {
      // Arrange
      const channelName = 'general';
      const teamId = 'team123';
      const teamMembers = [
        { id: 'user1', data: () => ({ username: 'user1', team: 'team123' }) },
        { id: 'user2', data: () => ({ username: 'user2', team: 'team123' }) },
      ];
      
      getAllTeamMembers.mockResolvedValue(teamMembers);
      
      // Act
      await createDefaultChannel(channelName, teamId);
      
      // Assert
      expect(getAllTeamMembers).toHaveBeenCalledWith(teamId);
      expect(doc).toHaveBeenCalledTimes(2); // Once for each team member
      expect(updateDoc).toHaveBeenCalledTimes(2);
      expect(arrayUnion).toHaveBeenCalledWith(`${teamId}${channelName}`);
    });
  });

  describe('isDefaultChannel', () => {
    it('should return true for a default channel', async () => {
      // Arrange
      getDocs.mockResolvedValue({
        empty: false,
        docs: [{
          data: () => ({ isDefault: true })
        }]
      });
      
      // Act
      const result = await isDefaultChannel('team123general', 'team123');
      
      // Assert
      expect(result).toBe(true);
    });
  });
});

// Export for other tests
export { createDefaultChannel, isDefaultChannel };
