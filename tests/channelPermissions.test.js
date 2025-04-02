import { collection, getDocs, query, updateDoc, where } from 'firebase/firestore';
import addMemberToChannel from '../src/backend/addMemberToChannel.jsx';
import { isUserInChannel, userInTeam } from '../src/backend/Queries/basicqueryUsers.jsx';

// Mock Firebase functions
jest.mock('firebase/firestore', () => ({
  doc: jest.fn(() => 'mockDocRef'),
  updateDoc: jest.fn(),
  arrayUnion: jest.fn(val => val),
  collection: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  getDocs: jest.fn(),
}));

// Mock user query functions
jest.mock('../src/backend/Queries/basicqueryUsers.jsx', () => ({
  isUserInChannel: jest.fn(),
  userInTeam: jest.fn(),
}));

// Mock Firebase config
jest.mock('../src/config/firebase.jsx', () => ({
  db: {},
}));

describe('Channel Permissions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('addMemberToChannel', () => {
    it('should add a user to a channel successfully', async () => {
      // Arrange
      const username = 'testUser';
      const channelID = 'team123general';
      
      userInTeam.mockResolvedValue(true);
      isUserInChannel.mockResolvedValue(false);
      
      const mockUser = { ref: 'user-doc-ref' };
      const mockQuerySnapshot = {
        empty: false,
        docs: [mockUser]
      };
      
      collection.mockReturnValue('users-collection');
      where.mockReturnValue('username-condition');
      query.mockReturnValue('users-query');
      getDocs.mockResolvedValue(mockQuerySnapshot);
      
      // Act
      await addMemberToChannel(username, channelID);
      
      // Assert
      expect(userInTeam).toHaveBeenCalledWith(username);
      expect(isUserInChannel).toHaveBeenCalledWith(username, channelID);
      expect(updateDoc).toHaveBeenCalledWith('user-doc-ref', {
        channels: 'team123general'
      });
    });

    it('should not add a user who is already in the channel', async () => {
      // Arrange
      const username = 'testUser';
      const channelID = 'team123general';
      
      userInTeam.mockResolvedValue(true);
      isUserInChannel.mockResolvedValue(true);
      
      console.log = jest.fn(); // Mock console.log
      
      // Act
      await addMemberToChannel(username, channelID);
      
      // Assert
      expect(userInTeam).toHaveBeenCalledWith(username);
      expect(isUserInChannel).toHaveBeenCalledWith(username, channelID);
      expect(console.log).toHaveBeenCalledWith('user is already in channel, can\'t add to channel');
      expect(updateDoc).not.toHaveBeenCalled();
    });

    it('should not add a user from a different team', async () => {
      // Arrange
      const username = 'testUser';
      const channelID = 'team123general';
      
      userInTeam.mockResolvedValue(false);
      
      console.log = jest.fn(); // Mock console.log
      
      // Act
      await addMemberToChannel(username, channelID);
      
      // Assert
      expect(userInTeam).toHaveBeenCalledWith(username);
      expect(console.log).toHaveBeenCalledWith('users do not belong to the same team, can\'t add to channel');
      expect(isUserInChannel).not.toHaveBeenCalled();
      expect(updateDoc).not.toHaveBeenCalled();
    });

    it('should handle user not found case', async () => {
      // Arrange
      const username = 'nonexistentUser';
      const channelID = 'team123general';
      
      userInTeam.mockResolvedValue(true);
      isUserInChannel.mockResolvedValue(false);
      
      const mockQuerySnapshot = {
        empty: true,
        docs: []
      };
      
      collection.mockReturnValue('users-collection');
      where.mockReturnValue('username-condition');
      query.mockReturnValue('users-query');
      getDocs.mockResolvedValue(mockQuerySnapshot);
      
      console.log = jest.fn(); // Mock console.log
      
      // Act
      await addMemberToChannel(username, channelID);
      
      // Assert
      expect(console.log).toHaveBeenCalledWith('No user found with username:', username);
      expect(updateDoc).not.toHaveBeenCalled();
    });

    it('should handle database errors gracefully', async () => {
      // Arrange
      const username = 'testUser';
      const channelID = 'team123general';
      
      userInTeam.mockResolvedValue(true);
      isUserInChannel.mockResolvedValue(false);
      
      collection.mockReturnValue('users-collection');
      where.mockReturnValue('username-condition');
      query.mockReturnValue('users-query');
      getDocs.mockRejectedValue(new Error('Database connection error'));
      
      console.error = jest.fn(); // Mock console.error
      
      // Act
      await addMemberToChannel(username, channelID);
      
      // Assert
      expect(console.error).toHaveBeenCalledWith('Error adding user to channel:', expect.any(Error));
      expect(updateDoc).not.toHaveBeenCalled();
    });
  });
});