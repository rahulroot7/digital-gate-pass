const admin = require('./firebase');

const sendFcmNotification = async (tokens = [], title, body, data = {}) => {
  if (!Array.isArray(tokens) || tokens.length === 0) {
    throw new Error('No FCM tokens provided');
  }
  const message = {
    notification: { title, body },
    data,
  };
  try {
    const response = await admin.messaging().sendEachForMulticast({
      tokens,
      ...message,
    });

    console.log('FCM response:', response.successCount + ' messages were sent successfully');
    return response;
  } catch (error) {
    console.error('Error sending FCM:', error);
    throw error;
  }
};

module.exports = sendFcmNotification;
