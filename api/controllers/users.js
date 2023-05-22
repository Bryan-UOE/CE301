import { db } from "../db.js";
import sharp from "sharp"

export const getAllUsers = (req, res) => {
  const sql = `SELECT id,username FROM users`;
  db.query(sql, (error, results) => {
    if (error) {
      console.log(error);
      return;
    }
    res.status(200).send(results);
  });
}

export const getUsers = (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const offset = (page - 1) * pageSize;
  
    const query = `SELECT e.id, e.username, e.email, e.image, e.role, d.department_name FROM users e LEFT JOIN departments d ON e.department_id = d.department_id LIMIT ${pageSize} OFFSET ${offset};`;
  
    db.query(query, (error, results) => {
      if (error) {
        console.log(error);
        res.status(500).send('Server Error');
      } else {
        const countQuery = 'SELECT COUNT(*) AS count FROM users';
        db.query(countQuery, (countError, countResults) => {
          if (countError) {
            console.log(countError);
            res.status(500).send('Server Error');
          } else {
            const count = countResults[0].count;
            const totalPages = Math.ceil(count / pageSize);
  
            // Modify the results array to convert the image buffer to base64
            const resultsWithBase64Image = results.map(user => {
              if (user.image) {
                user.image = user.image.toString('base64');
              }
              return user;
            });
  
            res.send({
              result: resultsWithBase64Image,
              count: count,
              totalPages: totalPages
            });
          }
        });
      }
    });
  };


  export const updateUser = (req, res) => {
    const id = req.params.id;
    const { username, email, role, department_name, image } = req.body || {};
  
    console.log("DATA", req.body);
  
    if (!username || !email || !role || !department_name) {
      return res.status(400).json({ message: 'Required fields cannot be empty.' });
    }
  
    let sql, params;
    
    if (image && image !== 'undefined') {
      let imageBuffer = Buffer.from(image.replace(/^data:image\/\w+;base64,/, ''), 'base64');
      try {
        sharp(imageBuffer, { input: 'png' })
          .resize(200, 200) 
          .toBuffer((err, buffer) => {
            if (err) {
              console.log(err);
              return res.status(500).json({ message: 'Error updating user.' });
            }
            params = [username, email, role, department_name, buffer, id];
            sql = `UPDATE users
                   SET username=?, email=?, role=?,
                       department_id=(SELECT department_id FROM departments WHERE department_name=?),
                       image=?
                   WHERE id=?`;
            executeUpdate(sql, params);
          });
      } catch (err) {
        console.log(err);
        return res.status(500).json({ message: 'Error updating user.' });
      }
    } else {
      params = [username, email, role, department_name, id];
      sql = `UPDATE users
             SET username=?, email=?, role=?,
                 department_id=(SELECT department_id FROM departments WHERE department_name=?)
             WHERE id=?`;
      executeUpdate(sql, params);
    }
  
    function executeUpdate(sql, params) {
      db.query(sql, params, (error, results) => {
        if (error) {
          console.log(error);
          return res.status(500).json({ message: 'Error updating user.' });
        }
        return res.status(200).json({ message: 'User updated successfully.' });
      });
    }
  };
  
  
  export const getDepartments = (req, res) => {
    const sql = `SELECT * FROM departments`;
    db.query(sql, (error, results) => {
      if (error) {
        console.log(error);
        return;
      }
      res.status(200).send(results);
    });
  }

  export const deleteUser = (req, res) => {
    const id = req.body.id;
    console.log(id);
    const sql = 'DELETE FROM users WHERE id = ?';
    db.query(sql, [id], (error, results) => {
      if (error) {
        console.log(error);
        res.status(500).send(error);
        return;
      }
      res.status(200).send(results);
    });
  };
  

  
  
  
  
  
