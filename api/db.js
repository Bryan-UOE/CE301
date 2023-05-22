import mysql from "mysql2";

export const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "040119sql",
  database: "controlsync"
});

try {
  db.connect((error) => {
    if (error) {
      throw error;
    }
    console.log("Connected to the database.");
  });
} catch (error) {
  console.error("Error connecting to the database:", error);
}
