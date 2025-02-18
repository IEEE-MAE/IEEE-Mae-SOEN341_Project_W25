Date: 18-Feb-2025
Participants: Mac, Yara, Mae, Alex, Abu, Cami

## Meeting Notes
- we are redesigning the DB architecture. Changing from User, Team, Channel collections to only User
- now user can only create team or to join the team an admin must add you
- making a new page to display direct messages

DB Collections:

  users:
  - username
  - team
  - role
  - channels[]
  - dms[]
  
  messages:
  - message
  - location
  - sender

## Post-Meeting Actionables
- Backend (Abu) will research implementation of Django as an intermediary for messages
- DB (Cami and Alex) will digitalize new architecture + what features will be in each page
- Frontend (Yara, Mac, Mae) will research how to load more messages, will correct UI to fit new implementation
