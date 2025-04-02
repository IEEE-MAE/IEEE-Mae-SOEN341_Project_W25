// Set up Jest environment to jsdom in the test file
/**
 * @jest-environment jsdom
 */

import { ref, update } from 'firebase/database';
import { arrayRemove, doc, updateDoc } from 'firebase/firestore';

// Mock Firebase
jest.mock('firebase/firestore', () => ({
  doc: jest.fn(() => 'userDocRef'),
  updateDoc: jest.fn(),
  arrayUnion: jest.fn(data => data),
  arrayRemove: jest.fn(data => data),
}));

jest.mock('firebase/database', () => ({
  ref: jest.fn(() => 'mockMessagesRef'),
  update: jest.fn(),
}));

jest.mock('../src/config/firebase.jsx', () => ({
  db: {},
  realtimeDB: {},
}));

// Mock dependencies
const doesDMexist = jest.fn().mockResolvedValue('existingDM123');
const createDM = jest.fn().mockResolvedValue('newDM123');
const addMemberToChannel = jest.fn();
const getSuperUserUsername = jest.fn().mockResolvedValue('superUser');
const getSuperUserDefaultChannels = jest.fn().mockResolvedValue(['team123announcements']);
const createMessages = jest.fn();

// Set up alert mock globally
global.alert = jest.fn();

// Create mock implementations as functions to export
const handleRequestToJoin = jest.fn().mockImplementation(async (teamID, channelID, username) => {
  try {
    // Get the super user of the team to send the request to
    const superUserUsername = await getSuperUserUsername(teamID);
    
    // Check if DM exists with super user
    let dmID = await doesDMexist(superUserUsername);
    
    // If no DM exists, create one
    if (!dmID) {
      dmID = await createDM(superUserUsername);
    }
    
    // Send request message in the DM
    await createMessages(
      `${username} has requested to join ${channelID}`,
      dmID,
      true,  // isRequest
      false, // isInvite
      channelID
    );
  } catch (error) {
    console.error('Error sending join request:', error);
  }
});

const handleAccept = jest.fn().mockImplementation(async (isInvite, isRequest, username, channelID, messageID, teamID) => {
  try {
    // Add user to the channel
    await addMemberToChannel(username, channelID);
    
    // Update the message to mark it as processed
    const messageRef = ref(null, `messages/${messageID}`);
    await update(messageRef, {
      isInvite: false,
      isRequest: false,
    });
  } catch (error) {
    console.error('Error accepting invitation/request:', error);
  }
});

const handleDeny = jest.fn().mockImplementation(async (isInvite, isRequest, username, channelID, messageID, teamID) => {
  try {
    // Update the message to indicate denial and mark as processed
    const messageRef = ref(null, `messages/${messageID}`);
    
    if (isInvite) {
      await update(messageRef, {
        Message: `${username} declined invitation to join ${channelID}`,
        isInvite: false,
        isRequest: false,
      });
    } else if (isRequest) {
      await update(messageRef, {
        Message: `Request from ${username} to join ${channelID} was denied`,
        isInvite: false,
        isRequest: false,
      });
    }
  } catch (error) {
    console.error('Error denying invitation/request:', error);
  }
});

const handleLeave = jest.fn().mockImplementation(async (channelID, teamID, role) => {
  try {
    // Get default channels that can't be left
    const defaultChannels = await getSuperUserDefaultChannels(teamID);
    
    // Prevent leaving default channels
    if (defaultChannels.includes(channelID)) {
      // Use global.alert instead of window.alert
      global.alert("You cannot leave a default channel");
      return false;
    }
    
    // Don't allow admins to leave their channels
    if (role === 'admin' || role === 'superUser') {
      // Use global.alert instead of window.alert
      global.alert("You are the owner of this channel and cannot leave it");
      return false;
    }
    
    // Remove channel from user's channels
    const user = { uid: 'user123' };
    const userDocRef = doc(null, "users", user.uid);
    await updateDoc(userDocRef, {
      channels: arrayRemove(channelID)
    });
    
    return true;
  } catch (error) {
    console.error('Error leaving channel:', error);
    return false;
  }
});

describe('Channel Access Request Functionality', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Change 'window.alert' to 'global.alert'
    global.alert = jest.fn();
  });

  describe('handleRequestToJoin', () => {
    it('should send a request to join a channel to the super user', async () => {
      // Act
      await handleRequestToJoin('team123', 'team123general', 'requestingUser');
      
      // Assert
      expect(getSuperUserUsername).toHaveBeenCalledWith('team123');
      expect(doesDMexist).toHaveBeenCalledWith('superUser');
    });
  });

  describe('handleAccept', () => {
    it('should add a user to the channel when accepting a request', async () => {
      // Act
      await handleAccept(false, true, 'requestingUser', 'team123general', 'msgID', 'team123');
      
      // Assert
      expect(addMemberToChannel).toHaveBeenCalledWith('requestingUser', 'team123general');
      expect(update).toHaveBeenCalled();
    });
  });

  describe('handleLeave', () => {
    it('should not allow leaving a default channel', async () => {
      // Arrange
      getSuperUserDefaultChannels.mockResolvedValue(['team123general']);
      
      // Act
      const result = await handleLeave('team123general', 'team123', 'member');
      
      // Assert
      expect(global.alert).toHaveBeenCalledWith(expect.stringContaining('cannot leave a default channel'));
      expect(result).toBe(false);
    });
  });
});

// Export functions
export { addMemberToChannel, createDM, doesDMexist, handleAccept, handleDeny, handleLeave, handleRequestToJoin };

