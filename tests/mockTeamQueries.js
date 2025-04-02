// Mock implementations for teamQueries

export const getAllTeamMembers = jest.fn().mockImplementation(async (teamId) => {
  if (!teamId) return [];
  
  return [
    { id: 'user1', data: () => ({ username: 'user1', team: teamId }) },
    { id: 'user2', data: () => ({ username: 'user2', team: teamId }) },
  ];
});

export const getTeamAdmins = jest.fn().mockImplementation(async (teamId) => {
  if (!teamId) return [];
  
  return ['admin1', 'admin2'];
});
