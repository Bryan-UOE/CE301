import { db } from "../db.js";

// DASHBOARD QUERIES STARTS HERE
export const getProjects = (req, res) => {
  const user_id = req.body.user_id;

  if (!user_id) {
    console.error('Missing user ID');
    res.status(400).send('Bad request');
    return;
  }

  const SQLquery = "SELECT projects.id, projects.project_name, projects.description, projects.end_date, projects.status FROM projects INNER JOIN project_assignments pa ON projects.id = pa.project_id WHERE pa.user_id = ?";

  db.query(SQLquery, [user_id], (err, data) => {
    if (err) {
      console.error('Error executing SQL query:', err);
      res.status(500).send('Internal server error');
      return;
    }

    if (!data || data.length === 0) {
      console.log('No projects found for user ID:', user_id);
      res.json({ result: 0 });
      return;
    }

    const result = data;
    res.json({ result });
  });
};


export const getTotalProjectCount = (req, res) => {

  const user_id = req.body.user_id
  
  const SQLquery = "SELECT COUNT(*) FROM project_assignments WHERE user_id = ?";
  

  db.query(SQLquery, [user_id], (err, data) => {
    if (err) {
      console.error('Error executing SQL query:', err);
      res.status(500).send('Internal server error');
      return;
    }
    const count = (data && data.length > 0) ? data[0]['COUNT(*)'] : 0;
    res.json({ count });
  });
};


export const getTotalTaskCount = (req, res) => {
  const user_id = req.body.user_id;

  const SQLquery = "SELECT COUNT(*) FROM tasks WHERE user_id = ?";

  db.query(SQLquery, [user_id], (err, data) => {
    if (err) {
      console.error('Error executing SQL query:', err);
      res.status(500).send('Internal server error');
      return;
    }

    const count = (data && data.length > 0) ? data[0]['COUNT(*)'] : 0;
    res.json({ count });
  });
};


export const getWorkload = (req, res) => {
  const user_id = req.body.user_id;

  if (!user_id) {
    console.error('Missing user ID');
    res.status(400).send('Bad request');
    return;
  }

  const SQLquery = "SELECT FLOOR((estimated_hours/7) * 100) AS workload_percentage FROM tasks where user_id = ?";

  db.query(SQLquery, [user_id], (err, data) => {
    if (err) {
      console.error('Error executing SQL query:', err);
      res.status(500).send('Internal server error');
      return;
    }

    if (!data || data.length === 0) {
      console.log('No workload percentage found for user ID:', user_id);
      res.json({ result: 0 });
      return;
    }

    const result = data[0]['workload_percentage'];
    res.json({ result });
  });
};


export const getTimeSpent = (req, res) => {

  const user_id = req.body.user_id

  
  const taskQuery = "SELECT CONCAT(FLOOR(SUM(TIMESTAMPDIFF(SECOND, created_date, NOW())) / 3600), 'h ',MOD(SUM(TIMESTAMPDIFF(SECOND, created_date, NOW())), 3600) div 60, 'm') AS total_time_spent FROM tasks WHERE user_id = ? and status = 'in progress'";

  const projectQuery = "SELECT CONCAT(FLOOR(SUM(TIMESTAMPDIFF(SECOND, created_at, NOW())) / 86400), 'd ',MOD(FLOOR(SUM(TIMESTAMPDIFF(SECOND, created_at, NOW())) / 3600), 24), 'h ',MOD(SUM(TIMESTAMPDIFF(SECOND, created_at, NOW())), 3600) div 60, 'm') AS total_time_spent FROM project_assignments WHERE user_id = ?";

  db.query(taskQuery, [user_id], (err, taskData) => {
    if (err) {
      console.error('Error executing task SQL query:', err);
      res.json({ taskResult: 0, projectResult: 0 });
      return;
    }
    const taskResult = taskData[0]['total_time_spent'];
    db.query(projectQuery, [user_id], (err, projectData) => {
      if (err) {
        console.error('Error executing project SQL query:', err);
        res.json({ taskResult: 0, projectResult: 0 });
        return;
      }
      const projectResult = projectData[0]['total_time_spent'];
      res.json({ taskResult, projectResult });
    });
  });
};


export const getOverallProgress = (req, res) => {
  const user_id = req.body.user_id;
  const SQLquery = "SELECT ROW_NUMBER() OVER () AS id,COUNT(*) AS total_projects,SUM(CASE WHEN p.status = 'completed' THEN 1 ELSE 0 END) AS completed_projects,SUM(CASE WHEN p.status = 'in progress' THEN 1 ELSE 0 END) AS in_progress_projects,SUM(CASE WHEN p.start_date > NOW() THEN 1 ELSE 0 END) AS upcoming_projects FROM projects p INNER JOIN project_assignments pa ON pa.project_id = p.id WHERE pa.user_id = ?";

  db.query(SQLquery, [user_id], (err, data) => {
    if (err) {
      console.error('Error executing SQL query:', err);
      res.json({ total_projects: 0, completed_projects: 0, in_progress_projects: 0, upcoming_projects: 0 });
      return;
    }

    const result = data;
    res.json({ result });
  });
};


export const getTasks = (req, res) => {
  const user_id = req.body.user_id;
  const SQLquery = "SELECT name, due_date FROM tasks where user_id = ? and status = 'In progress' LIMIT 3";

  db.query(SQLquery, [user_id], (err, data) => {
    if (err) {
      console.error('Error executing SQL query:', err);
      res.status(500).send('Internal server error');
      return;
    }
    const result = data || []; // set result to an empty array if data is undefined or null
    res.json({ result });
  });
};


// ALL PROJECTS STARTS HERE:

export const getAllProjects = (req, res) => {
  const SQLquery = "SELECT * FROM projects";

  db.query(SQLquery, (err, data) => {
    if (err) {
      console.error('Error executing SQL query:', err);
      res.status(500).send('Internal server error');
      return;
    }
    const result = data || [];
    res.json({ result });
  });
};

export const getAssignedUsers = (req, res) => {
  const project_id = req.body.project.id;
  console.log(JSON.stringify(project_id))
  const SQLquery = "SELECT u.image FROM users u INNER JOIN project_assignments pa ON pa.user_id = u.id WHERE pa.project_id = ?;";

  db.query(SQLquery, [project_id], (err, data) => {
    if (err) {
      console.error('Error executing SQL query:', err);
      res.status(500).send('Internal server error');
      return;
    }

    const result = data.map((row) => {
      const imageBuffer = row.image;
      const base64Image = imageBuffer.toString('base64');
      return { ...row, image: base64Image };
    });

    res.json({ result });
  });
};

export const getDetailsComments = (req, res) => {
  const project_id = req.body.project.id;
 
  const SQLquery = "SELECT projectcomments.id, projectcomments.project_id, projectcomments.user_id, projectcomments.comment_text, projectcomments.created_date, users.image FROM projectcomments JOIN users ON projectcomments.user_id = users.id WHERE projectcomments.project_id = ? order by created_date;";

  db.query(SQLquery, [project_id], (err, data) => {
    if (err) {
      console.error('Error executing SQL query:', err);
      res.status(500).send('Internal server error');
      return;
    }
    const result = data.map((row) => {
      const imageBuffer = row.image;
      const base64Image = imageBuffer.toString('base64');
      return { ...row, image: base64Image };
    });

    res.json({ result });
  });
};

export const newComment = (req, res) => {
  const project_id = req.body.project.id;
  const user_id = req.body.user_id;
  const comment_text = req.body.comment_text
 
  const SQLquery = "INSERT INTO projectcomments (project_id, user_id, comment_text) VALUES (?,?,?);";

  db.query(SQLquery, [project_id, user_id, comment_text], (err, data) => {
    if (err) {
      console.error('Error executing SQL query:', err);
      res.status(500).send('Internal server error');
      return;
    }
    const result = data || [];
    res.json({ result });
  });
};

export const getProjectUpdates = (req, res) => {
  const project_id = req.body.project.id;

  const SQLquery = "SELECT pu.*, u.image FROM controlsync.projectupdates pu JOIN users u ON pu.user_id = u.id WHERE project_id = ? ORDER BY created_date DESC LIMIT 4;";

  db.query(SQLquery, [project_id], (err, data) => {
    if (err) {
      console.error('Error executing SQL query:', err);
      res.status(500).send('Internal server error');
      return;
    }

    const result = data.map((row) => {
      const imageBuffer = row.image;
      const base64Image = imageBuffer.toString('base64');
      return { ...row, image: base64Image };
    });
    // const result = data || [];
    res.json({ result });
  });

};

export const newProject = (req, res) => {

  const {project_name, start_date,end_date, description, budget, planned_hours} = req.body
  console.log("LOGGING BODY: " + JSON.stringify(req.body))
 
  const SQLquery = "INSERT INTO projects (project_name, start_date,end_date, description, budget, planned_hours) VALUES (?,?,?,?,?,?)";

  db.query(SQLquery, [project_name, start_date,end_date, description, budget, planned_hours ], (err, data) => {
    if (err) {
      console.error('Error executing SQL query:', err);
      res.status(500).send('Internal server error');
      return;
    }
    const result = data || [];
    res.json({ result });
  });

};

export const getUnassignedUsers = (req, res) => {

  const project_id = req.body.project_id; 
  console.log("LOGGING BODY: " + JSON.stringify(req.body))
 
  const SQLquery = "SELECT id,username,image FROM users WHERE id NOT IN (SELECT user_id FROM project_assignments WHERE project_id = ?);";

  db.query(SQLquery, [project_id], (err, data) => {
    if (err) {
      console.error('Error executing SQL query:', err);
      res.status(500).send('Internal server error');
      return;
    }
    const result = data.map((row) => {
      if (!row.image) {
        return { id: row.id, username: row.username };
      }
  
      const imageBuffer = row.image;
      const base64Image = imageBuffer.toString("base64");
      return { ...row, image: base64Image };
    });

    res.json({ result });
  });
};

export const assignUsers = (req, res) => {
  const { project_id, user_id } = req.body;
  console.log("LOGGING BODY: " + JSON.stringify(req.body));

  if (!Array.isArray(user_id)) {
    res.status(400).json({ error: 'Invalid user IDs provided' });
    return;
  }

  const SQLquery = "INSERT INTO project_assignments (project_id, user_id) VALUES (?, ?)";
  const values = [];

  if (Array.isArray(user_id) && user_id.length > 0) {
    user_id.forEach(user_id => {
      values.push([project_id, user_id]);
    });
  }

  if (values.length === 0) {
    res.status(400).json({ error: 'No user IDs provided' });
    return;
  }

  values.forEach((value) => {
    db.query(SQLquery, value, (err, data) => {
      if (err) {
        console.error('Error executing SQL query:', err);
        res.status(500).json({ error: 'Internal server error' });
        return;
      }
    });
  });

  res.json({ success: true, message: 'Users assigned successfully' });
};








