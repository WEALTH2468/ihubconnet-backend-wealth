const Notification = require("../models/notification");

exports.getNotifications = async (req, res, next) => {
    try {
        const receiverId = req.params.id;

            const notifications = await Notification.find({receiverId});
            return res.status(200).json(notifications);

    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

exports.addNotification = async (req, res, next) => {
    try{       
        const {senderId, receiverId, description, image, read, link, useRouter} = req.body;

        const newNotification = new Notification({
            senderId, receiverId, description, image, read, link, useRouter,
            time: Date.now()
        })
        await newNotification.save();
        return res.status(200).json(newNotification);
    }catch (error){
      console.error(error);
      return res.status(500).json({ message: error.message });
    }
};


exports.deleteNotification = async (req, res, next) => {
    try {    
        const{ id } = req.params;

            const deletedNotification = await Notification.findOneAndDelete({_id: id});

            return res.status(200).json(deletedNotification);
      
      } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
      }
};

exports.deleteNotifications = async (req, res, next) => {
    try {    
        const{ id } = req.params;
        await Notification.deleteMany({ receiverId: id });
        return res.status(200).json({ message: 'Notifications deleted successfully' });

      } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
      }
};