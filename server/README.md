# Server (Express + socket.io)

### `server.js`

- creates express server
- creates web socket

### config

- `db.js` - define database information

### models

- `index.js` - connect to database and define sequelize models
- [https://sequelize.org/docs/v6/core-concepts/model-basics/](https://sequelize.org/docs/v6/core-concepts/model-basics/)

### routes

- defines API path and corresponding callback function

### controllers

- process request
- make query to database
    - [https://sequelize.org/docs/v6/core-concepts/model-querying-basics/](https://sequelize.org/docs/v6/core-concepts/model-querying-basics/)
- send response

### middleware

- `authMiddleware.js` - make sure request is authorized

### utils

- `generateToken.js` - generate jwt and attach as cookie

### socket

- listens client socket events and broadcast to users (case dependent)
- [https://socket.io/docs/v4/server-socket-instance/](https://socket.io/docs/v4/server-socket-instance/)


# Database (Postgres SQL)

## users

- `uid` (PK): uuid, not null, `DEFAULT gen_random_uuid()`
- `username`: text, unique, not null
- `password`: text
- `rooms`: bigint[]

## chatrooms

- `id` (PK): bigint, not null, `DEFAULT CAST(100000 + floor(random() * 900000) AS bigint)`
- `name`: text
- `owner`: uuid, not null
- `members`: uuid[]

## messages

- `id` (PK): uuid, not null, `DEFAULT gen_random_uuid()`
- `timestamp`: timestamp with time zone, not null, DEFAULT CURRENT_TIMESTAMP
- `room`: bigint, not null
- `sender`: uuid, not null
- `message`: text

# In-memory Storage (Redis) - Future Improvement

- [https://socket.io/docs/v4/broadcasting-events/](https://socket.io/docs/v4/broadcasting-events/)
- [https://dev.to/leoantony72/distributed-chat-application-22oo](https://dev.to/leoantony72/distributed-chat-application-22oo)
- [https://github.com/bisakhmondal/Distributed-Chat-Application/tree/master](https://github.com/bisakhmondal/Distributed-Chat-Application/tree/master)