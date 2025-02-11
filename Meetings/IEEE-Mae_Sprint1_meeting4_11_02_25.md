Date: 11 Feb 2025
Participants: Abu, Alex, Yara, Mae, Mac, Cami

## Meeting notes
- are acceptance tests automatic or manual? is the continuous integration pipeline the same as unit testing?
- make UI layout (basic) of every page, popup and interface so that backend can understand what to work on, Figma w/annotations
- Abu is doing backend (manages traffic and controls information flow - no need for concurrency) with Mongo - makes website scalable, for messages specifically
- Cami and Alex are doing database - reorganize implementation of Sprint 1
- Frontend -> Mongo -> Firebase from Sprint 2 onwards
- We have an idea of how to implement direct messaging: flesh out with more detail
- overflow from sprint 1: adding channel to user document (Alex is currently working on it); getting the id of the user being added to a channel, so it's added to that channel's doc 
- defined fourth feaure: editing texts after sending them

## Done in meeting
- Defined User Stories for Sprint 2

## Post-meeting actionables 
- ask about continuous integration & acceptance testing
- need to decide if we're using javascript or typescript (decide by 12/feb/2025)
- Cami will fix US and tasks for Sprint 1

### For friday:
- Abu will make an explanation of backend code from Sprint 1
- Alex and Cami will flesh out implementation of messaging (DM and Channels)
- Mae will design admin functionalities, create channel, accept request, logout, delete and edit message
- Mac will make team page user and channel assets + superadmin functionality and redo look of login/signup
- Yara will design how direct messaging and channel messaging will look 

