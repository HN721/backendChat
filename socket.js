const socketIo = (io) => {};
//store connected users with theri room
const connectedUsers = new Map();
io.on("connection", (socket) => {
  //get user from auth
  const user = socket.handshake.auth.user;
  console.log("user connected", user?.username);
  //start join room
  socket.on("join-room", (groupId, userId) => {
    // add socket to the specified room
    socket.join(groupId);
    // store user and room in connected users map
    connectedUsers.set(socket.id, { user, groupId });
    const userInroom = Array.from(connectedUsers.values())
      .filter((user) => user.groupId === groupId)
      .map((user) => user.user);

    io.in(groupId).emit("user-in-room", userInroom);
    socket.to(groupId).emit("notification", {
      type: "USER_JOINED",
      message: `${user?.username} joined the group`,
      user: user,
    });
  });
  //end join room

  //start leave room
  socket.on("leave", (groupId) => {
    socket.leave(groupId);
    if (connectedUsers.has(socket.id)) {
      connectedUsers.delete(socket.id);
      socket.to(groupId).emit("user let", user?._id);
    }
  });
  //end leave room

  //start message
  socket.on("message", (message) => {
    socket.to(message.groupId).emit("message recevied", message);
  });
  //end message
  //discoent handler
  //trigger typing
  socket.on("disconnect", () => {
    if (connectedUsers.has(socket.id)) {
      const userData = connectedUsers.get(socket.id);
      socket.to(userData.groupId).emit("user left", user?._id);
      connectedUsers.delete(socket.id);
    }
  });
  //start typing
  socket.on("typing", ({ groupId, username }) => {
    socket.to(groupId).emit("user typing", { username });
  });
  socket.on("stop typing", ({ groupId }) => {
    socket.to(groupId).emit("user typing", { username: user?.username });
  });
  //end typing
});
module.exports = socketIo;
