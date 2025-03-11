Participants: Mae, Alex, Cami, Abu, Mac, Yara
Date: 11-Mar-2025
Start time: 3pm
End time: 4pm

## Meeting notes
- need to look into why realtime database queries aren't working
- Sprint 3 is heavy on backend and DB so we're redestributing tasks

### Frontend
- make sidebar to display all users in a team (status + last seen)
- make messages align on the left/right
- make "inaccessible" channel view
- add "request to join" button for private channels

### Backend
- all members can see all channels, can only open those which are accessible to them
- admin can create channels which are accessible to all members (default) - bool when 'create channel'
- requests and invites will be handled via DM messaging with a new flag "isRequest/isInvite" to join channels

### Fourth feature
- can teams be our fourth feature?
- if not, we could have users be able to edit their own messages

## Post-meeting actionables
- ask TA the following:
  - Can we have teams be our fourth feature?
  - How do private channels work? Can a normal (non-admin) user create them? Then what's the point of having admin permissions?
 
