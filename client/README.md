# Client (React)

## Routes

- “/" - `LandingPage`
- “/chatroom/*" - `ChatPage` (authenticated user only, non-authenticated user will be redirect to login page)
    - `LeftSidebar` - always visible
    - “/chatroom" - `WelcomeChat` - shown when no room selected
    - “/chatroom/:roomCode" - `ChatRoom`

## React Components

### `LandingPage`

- `Authenticator` - control signup & signin tabs
    - `Signin` - form
    - `Signup` - form

### `ChatPage`

- `ProtectedRoute` - check if authenticated user
- `LeftSidebar`
    - `Room` - clickable to join room
    - `UserSettings` - include username change
        - `Signout` - button, reset all states upon logout
    - `JoinRoom` - enter room code to join a room
    - `CreateRoom` - enter a room name to create a room
- `WelcomeChat`
- `ChatRoom`
    - `ChatBox`
        - `Message`
    - `RightSidebar`
        - `Member`
        - `RoomSettings`
            - `LeaveRoom` - leave current room
            - `DeleteRoom` - delete current room (owner only)
        - `ShareRoom` - copy room code

### other

- `Loader` - spinner & backdrop when fetching data
- `Toast` - shows system messages

## Redux Toolkit

### `store`

- `reducerProxy` - reset all store states if action type is RESET
    - [https://redux-toolkit.js.org/rtk-query/api/created-api/api-slice-utils](https://redux-toolkit.js.org/rtk-query/api/created-api/api-slice-utils)

### `rootReducer`

- combines all the slices

### State management (slices)

- Files
    - `userSlice` (save in localStorage)
        - `userInfo`
            - `uid`
            - `username`
            - `rooms`
    - `roomSlice` (save in localStorage)
        - `roomInfo`
            - `roomCode`
            - `roomName`
            - `owner`
            - `members`
        - `onlineMembers` - array
    - `messageSlice` (save in localStorage)
        - `messages` - array
    - `notificationSlice`
        - `content` - message to user
        - `color` - `Toast` color
        - `autoDismiss` - time to auto close `Toast`, null if no auto closure
        - `open` - whether to open `Toast` or not
- Usage
    
    Get state
    
    ```jsx
    import { useSelector } from "react-redux";
    
    const { userInfo } = useSelector((state) => state.user);
    const { roomInfo, onlineMembers } = useSelector((state) => state.room);
    const { messages } = useSelector((state) => state.message);
    const { content, color, autoDismiss, open } = useSelector(
        (state) => state.notification
      );
    ```
    
    Set state
    
    ```jsx
    import { useDispatch } from "react-redux";
    
    import { setRoomInfo } from "../../store/room/roomSlice";
    dispatch(setRoomInfo(newData));
    ```
    

### API endpoints

Documentation: [https://redux-toolkit.js.org/rtk-query/overview](https://redux-toolkit.js.org/rtk-query/overview)

- Tags
    - **The `providesTags` property for the `query` endpoint is used to provide the tag names to caches**
    - **The `invalidatesTags` property for the `mutation` endpoint is used to remove them from caches**.
        
        [https://code.pieces.app/blog/an-overview-of-redux-rtk-query#:~:text=The providesTags property for the,to remove them from caches](https://code.pieces.app/blog/an-overview-of-redux-rtk-query#:~:text=The%20providesTags%20property%20for%20the,to%20remove%20them%20from%20caches).
        
- Files
    - `apiSlice`
        - `userApiSlice`
            - `register`
            - `login`
            - `logout`
            - `getUser`
            - `updateUser`
        - `roomApiSlice`
            - `createRoom`
            - `joinRoom`
            - `leaveRoom`
            - `deleteRoom`
            - `getRoom`
        - `messageApiSlice`
            - `addMessage`
            - `getMessagesByRoom`
- Usage
    
    Mutation
    
    ```jsx
    import { useJoinRoomMutation } from "../../store/room/roomApiSlice";
    
    const [joinRoom, { isLoading }] = useJoinRoomMutation();
    
    try {
      const roomData = await joinRoom({ roomCode }).unwrap();
    } catch (err) {
      console.log(err);
    }
    ```
    
    - [https://redux-toolkit.js.org/rtk-query/usage/mutations](https://redux-toolkit.js.org/rtk-query/usage/mutations)
    
    Query
    
    ```jsx
    import { useGetUserQuery } from "../store/user/userApiSlice";
    
    // skip is used for conditional fetching (see below documentation link)
    const { data, isGetUserLoading } = useGetUserQuery(null, { skip });
    
    useEffect(() => {
    	if (!isGetUserLoading && data) {
    	  dispatch(setUserInfo({ ...data }));
    	}
    }, [data, isGetUserLoading]);
    ```
    
    - [https://redux-toolkit.js.org/rtk-query/usage/queries](https://redux-toolkit.js.org/rtk-query/usage/queries)
    - [https://redux-toolkit.js.org/rtk-query/usage/conditional-fetching](https://redux-toolkit.js.org/rtk-query/usage/conditional-fetching)
    - [https://mattclaffey.medium.com/5-reasons-why-data-handling-is-easier-with-redux-toolkit-rtk-query-d7dd53d07a74](https://mattclaffey.medium.com/5-reasons-why-data-handling-is-easier-with-redux-toolkit-rtk-query-d7dd53d07a74)
    

## Socket

```jsx
// CreateRoom
- socket.emit("joinRoom")
- setRoomInfo(res)

// JoinRoom
- socket.emit("joinRoom")
- setRoomInfo(res)

// Room
- socket.emit("joinRoom")
- setRoomInfo(res)

// DeleteRoom
- socket.emit("deleteRoom")
- setRoomInfo(null)

// LeaveRoom
- socket.emit("leaveRoom")
- setRoomInfo(null)

// ChatBox
- socket.emit("message")
- setMessage([ ...messages, newMessage ])

// ChatPage
- socket.connect()
- socket.on("connect_error")
- socket.on("connect")
- socket.emit("online")
- socket.on("online")
- socket.on("joinRoom")
- socket.on("leftRoom")
- socket.on("deletedRoom")
- socket.on("message")
- socket.on("updateUsername")
```

- [https://socket.io/docs/v3/emit-cheatsheet/](https://socket.io/docs/v3/emit-cheatsheet/)
- [https://socket.io/docs/v4/client-socket-instance/](https://socket.io/docs/v4/client-socket-instance/)