Date: 4-Feb-2025 
Total duration of meeting: 1h30
Participants: Yara, Malcolm, Maelle, Abu, Alex, Cami

- Malcolm did the UI for the login page in HTML and CSS
- We can use bootstrap library for formatting CSS (prebuilt items)
- Using Projects tab on Github to track issues progress

### Discussion About Login Roles: 
- every Admin is a member, not every member is an admin
- Team has channels (can only be created by Admins)
- SuperAdmins and Admins of teams can add members, create channels, make members admins
- you can only DM people in the same team (not in all the app)
- user can only be part of ONE team (becomes their entire team)
- UI flow: login/signup -> homepage add/create team screen -> teampage for admin//member

                   signup/login
                         |
          see all teams // create team
 request to join a team // become SuperAdmin of team
become member of a team // accept/deny members to the team


## Post meeting actionables:
- Camila is going to create the signup and authentication (backend) and integrate it with the UI Malcolm did + check if we can add fields to user
- Malcolm will make the login UI (just email and password, no username)
- Yara is making a home page with "create team" and "join team" as well as the teampage UI (admin and member)
- Alex will make backend that creates and add teams 
- Mae will make a UI flow diagram for reference + work with Alex on database architecture and functions
- Abu will make diagram on how many databases we need + how to link them + work with Alex database architecture and functions

