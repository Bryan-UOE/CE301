import { db } from "../db.js";

export const getAllMessages = (req, res) => {
    const user_id = req.body.user_id
    console.log("MESSAGES : USER ID : " + user_id)
    const SQLquery = "SELECT users.image, inbox.id, users.username, inbox.sender_id, inbox.subject, inbox.message, inbox.date, inbox.is_read FROM inbox JOIN users ON inbox.sender_id = users.id WHERE inbox.receiver_id = ?;";
    db.query(SQLquery, [user_id], (err, data) => {
      if (err) {
        console.error('Error executing SQL query:', err);
        res.status(500).send('Internal server error');
        return;
      }
  
      const results = data;
  
      // Modify the results array to buffer the image data before converting it to base64
      const resultsWithBase64Image = results.map(user => {
        if (user.image) {
          user.image = Buffer.from(user.image, 'binary').toString('base64');
        }
        return user;
      });
  
      console.log(resultsWithBase64Image);
      res.json({ result: resultsWithBase64Image });
    });
  };

  export const sendMessage = (req, res) => {
  
    const { sender_id, receiver_id, subject, message } = req.body;
    
    const SQLquery = "INSERT INTO inbox (sender_id, receiver_id, subject, message) VALUES (?,?,?,?)";

    db.query(SQLquery, [sender_id, receiver_id, subject, message],(err, data) => {
        if (err) {
            console.error("Error sending reply message: ", err);
            res.status(500).json({ error: "Failed to send reply message" });
            return;
        }
        res.status(200).json({ message: "Reply message sent successfully" });

    })
}

export const forwardMessage = (req, res) => {
    const { sender_id, receiver_id, subject, message } = req.body;
    
    const SQLquery = "INSERT INTO inbox (sender_id, receiver_id, subject, message, is_forwarded) VALUES (?,?,?,?,1)";

    db.query(SQLquery, [sender_id, receiver_id, subject, message ],(err, data) => {
        if (err) {
            console.error("Error sending reply message: ", err);
            res.status(500).json({ error: "Failed to send reply message" });
            return;
        }
        res.status(200).json({ message: "Reply message sent successfully" });

    })
}
 
  