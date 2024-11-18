const initSocketIO = require('./websocket');

const sendMessageNotification = (senderId, receiverId, message) => {
    const { getUser, emitNotification } = initSocketIO();
  const receiverSocket = getUser(receiverId); // Get receiver's socket
  if (receiverSocket) {
    emitNotification(receiverSocket, {
      senderId,
      receiverId,
      content: message.content,
      files: message.files,
      status: 'received' // Assuming you want to mark the message as received on the receiver's side
    });
  } else {
    console.log(`User ${receiverId} is not connected`);
  }
};

module.exports = {
  sendMessageNotification
};
