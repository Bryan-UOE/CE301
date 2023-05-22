import { db } from "../db.js";
import fs from 'fs'

export const getPost = (req, res) => {
  const sql =
    'SELECT fp.*, u.image AS user_image, COUNT(pl.id) AS like_count FROM feed_posts fp JOIN users u ON fp.user_id = u.id LEFT JOIN post_likes pl ON fp.id = pl.post_id GROUP BY fp.id order by created_date desc;';
  db.query(sql, (err, results) => {
    if (err) {
      throw err;
    } else {
      const resultWithoutImage = results;

     
      const likeCount = resultWithoutImage.length > 0 ? resultWithoutImage[0].like_count : 0;

    
      const resultsWithBase64Image = resultWithoutImage.map((post) => {
        if (post.image) {
          post.image = Buffer.from(post.image, 'binary').toString('base64');
        }
        if (post.user_image) {
          post.user_image = Buffer.from(post.user_image, 'binary').toString('base64');
        }
        return post;
      });

      res.json({ posts: resultsWithBase64Image, like_count: likeCount });
    }
  });
};
  
  

export const newPost = (req, res) => {
  const { user_id, title, content } = req.body;
  const image = req.file;

  if (image) {
    const imageBuffer = fs.readFileSync(image.path);

    const sql = 'INSERT INTO feed_posts (user_id, title, image, content) VALUES (?, ?, ?, ?)';
    db.query(sql, [user_id, title, imageBuffer, content], (err, results) => {
      if (err) throw err;
      res.json(results);
    });
  } else {
    console.log('No image provided');
    // Handle the case when no image is provided
  }
};



  export const getComments = (req, res) => {
    const sql = 'SELECT post_comments.post_id, post_comments.comment_text, users.username, users.image AS user_image FROM post_comments INNER JOIN users ON post_comments.user_id = users.id order by created_date';
    db.query(sql, (err, results) => {
      if (err) {
        throw err;
      } else {
        
        const resultsWithBase64Image = results.map(comment => {
          if (comment.user_image) {
            comment.user_image = Buffer.from(comment.user_image, 'binary').toString('base64');
          }
          return comment;
        });
  

        res.json({ comments: resultsWithBase64Image });
      }
    });
};


  export const getLikes = (req, res) => {
    const sql = 'SELECT * FROM post_likes';
    db.query(sql, (err, results) => {
      if (err) {
        throw err;
      } else {
  
        res.json({ results });
      }
    });
  };

  export const getLikesById = (req, res) => {
    const { userId } = req.body;
    console.log("USER ID: " + userId);
  
    const sql = 'SELECT post_id FROM post_likes WHERE user_id = ?';
    db.query(sql, [userId], (err, results) => {
      if (err) {
        throw err;
      } else {
        console.log(results);
        res.json({ postsLikedByUser: results });
      }
    });
  };
  

  export const postComments = (req, res) => {
    const {user_id, post_id, comment_text} = req.body;

    const sql = 'INSERT INTO post_comments (user_id, post_id, comment_text) VALUES (?,?,?)';
    db.query(sql, [user_id, post_id, comment_text],(err, results) => {
      if (err) {
        throw err;
      } else {
  
        res.json({ results });
      }
    });
  };


  export const likePost = (req, res) => {
  const { postId, userId } = req.body; 

  // Check if the user has already liked the post
  db.query('SELECT * FROM post_likes WHERE post_id = ? AND user_id = ?', [postId, userId], (error, results) => {

    if (error) {
      console.error('Error executing query:', error);
      return res.status(500).json({ error: 'Failed to execute query' });
    }

    if (results.length > 0) {
    console.log("Check if user liked post: " + results)
      // Delete the like if the user has already liked the post
      db.query('DELETE FROM post_likes WHERE post_id = ? AND user_id = ?', [postId, userId], (error) => {
        if (error) {
          console.error('Error executing query:', error);
          return res.status(500).json({ error: 'Failed to execute query' });
        }
        res.json({ message: 'Like removed successfully' });
      });
    } else {
      // Insert a new like if the user has not liked the post
      db.query('INSERT INTO post_likes (post_id, user_id) VALUES (?, ?)', [postId, userId], (error) => {
        if (error) {
          console.error('Error executing query:', error);
          return res.status(500).json({ error: 'Failed to execute query' });
        }
        res.json({ message: 'Like added successfully' });
      });
    }
  });
};

  
