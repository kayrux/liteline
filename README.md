# Liteline - Demo version
Liteline (demo) is a simple client - server messaging app.
- Request, Reply for get and post info to the database
- Messaging uses websockets for real time messaging
- Room based conversations (create and join rooms, send message into rooms)
- Messages are stored in the database so offline users can fetch it later

## Link to project's GitHub repository  
https://github.com/kayrux/chatroom

# Testing
## Required software  
To run & test locally Node.js is required, get it here https://nodejs.org/en/download/current

## Required files  
Put the included .env file in the .../chatroom/server/ directory.

## Run the server  
**Change directory into the server directory:**
```
cd server
```

**Install required dependencies**
```
npm install
```

**Start the server on localhost:4000**
```
npm start
```


## Run the client  
**Open a separate terminal and change into client directory:**
```
cd client
```

**Install required dependencies**
```
npm install
```

**Start the client on localhost:3000**
```
npm start
```

## Features
1. Sign up to create an account.
2. Use previously created accounts to sign in.
3. Create and join previously created rooms.
4. Send messages into rooms.
5. Leave rooms they have joined.
6. View all messages previously sent in the room.
7. View room member's usernames and their status.
8. Sign out of the account.