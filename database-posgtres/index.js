const { Client } = require('pg');
console.log('Initializing client');
console.log('This is the database url', process.env.DATABASE_URL);
const client = new Client({
  connectionString: process.env.DATABASE_URL || 'postgres://rngo@localhost:5432/fb_database'
});

client.connect();
console.log('CLIENT HERE...', client);
module.exports = {
  getAllUsers: (callback) => {
    client.query('SELECT * FROM users;', (err, res) => {
      if (err) callback(err, null);
      callback(null, res.rows);
    });
  },
  createPost: (username, text, callback) => {
    // console.log('This is my client', client);
    let queryStr =
      `INSERT INTO posts (post_text, user_id)
      VALUES ('${text}', (SELECT id FROM users WHERE username = '${username}'))`;
    console.log('This is my query string', queryStr);
    client.query(queryStr, (err, res) => {
      if (err) {
        callback(err, null);
      } else {
        console.log('Posting!');
        callback(null, res.rows);
      }
      // client.end();
    });
  },
  likePost: (username, friendname, text, callback) => {
    let queryStr = 
    `INSERT INTO user_posts_liked (user_id, post_id) 
    VALUES ((SELECT id FROM users WHERE username = '${username}'), 
    (SELECT posts.id FROM posts INNER JOIN users ON users.id = 
      posts.user_id AND posts.post_text = 
      '${text}' AND posts.user_id = 
      (SELECT id FROM users WHERE username = '${friendname}')))`;
      console.log('This is my queryStr', queryStr);
      console.log('In DB', username);
      console.log('In DB', friendname);
      console.log('In DB', text);
    client.query(queryStr, (err, res) => {
      if (err) {
        callback(err, null);
      } else {
        console.log('Liking post!');
        callback(null, res.rows);
      }
    })
  },
  searchSomeone: (name, callback) => {
    const queryStr = `SELECT * FROM users WHERE username LIKE '%${name}%';`; // selects all names that begin with searched query
    client.query(queryStr, (err, res) => {
      if (err) {
        console.log('error inside searchSomeone', err);
        callback(err, null);
      } else {
        callback(null, res.rows);
      }
    });
  },
  getAllPosts: (callback) => {
    let queryStr = 'SELECT posts.*, users.first_name, users.last_name FROM posts INNER JOIN users ON users.id = posts.user_id ORDER BY id DESC';
    client.query(queryStr, (err, res) => {
      if (err) {
        console.log('Error', err);
        callback(err, null);
      } else {
        // console.log('Got all posts!!!!');
        callback(null, res.rows);
      }
    });
  },
  //find select username
  getUser: (username, callback) => {
    console.log('in db getUser, looking for', username)
    client.query(`SELECT * FROM users WHERE username='${username}';`, (err, res) => {
      if (err) {
        console.log('Error', err)
        callback(err, null);
      } else {  
        console.log('searched for user in db')
        callback(null, res.rows);
      }  
    });
  },
  //add user to db
  addUser: (userData, callback) => {
    console.log('in db addUser start......', userData)
    client.query(`INSERT INTO users (username, first_name, last_name, picture_url) VALUES ('${userData.username}', '${userData.firstName}', '${userData.lastName}', '${userData.pictureUrl}');`, (err, res) => {
      if (err) {
        console.log('Error', err)
        callback(err, null);
      } else {  
        console.log('added user in db!')
        callback(null, res.rows);
      }
    });
  },      
  getUserPosts: (username, callback) => {
    // var queryStr = `SELECT posts.*, users.* FROM posts INNER JOIN users ON posts.user_id = users.id WHERE users.id = (SELECT users.id FROM users WHERE users.username = ${username})`;
    // var queryStr = `SELECT posts.*, users.first_name, users.last_name FROM posts INNER JOIN users ON users.id = posts.user_id ORDER BY id DESC`;
    var query = {
      text: 'SELECT posts.*, users.* FROM posts INNER JOIN users ON posts.user_id = users.id WHERE users.id = (SELECT users.id FROM users WHERE users.username = $1) ORDER BY posts.id DESC',
      values: [username]
    };
    client.query(query, (err, res) => {
      if (err) {
        console.log('error...', err);
        callback(err, null);
      } else {
        callback(null, res.rows);
      }
    });
  },
  addFriend: (username, friendToAdd, callback) => {
    console.log('adding friend...');
    var queryOne = `INSERT INTO user_friends (username, friend_id) VALUES ('${username}', (SELECT id FROM users WHERE username = '${friendToAdd}'))`;
    var queryTwo = `INSERT INTO user_friends (username, friend_id) VALUES ('${friendToAdd}', (SELECT id FROM users WHERE username = '${username}'))`;
    client.query(queryOne, (err, res) => {
      if (err) {
        console.log('Error', err)
        callback(err, null);
      } else {  
        console.log('successfully added one permutation of friends');
        client.query(queryTwo, (err, res) => {
          if (err) {
            console.log('Error', err)
            callback(err, null);
          } else {  
            console.log('successfully added both permutations of friends');
            callback(null, res.rows);
          }  
        });
      }  
    });
  },
  getFriendsList: (username, callback) => {
    console.log('in db getFriendsList')
    let queryStr = `SELECT users.* FROM users INNER JOIN user_friends ON (user_friends.friend_id = users.id) WHERE user_friends.username = '${username}';`
    client.query(queryStr, (err, res) => {
      if (err) {
        console.log('Error', err)
        callback(err, null);
      } else {  
        console.log('friends list from db...')
        callback(null, res.rows);
      }  
    });
  },
}

// client.query('SELECT table_schema,table_name FROM information_schema.tables;', (err, res) => {
//   if (err) throw err;
//   for (let row of res.rows) {
//     console.log(JSON.stringify(row));
//   }
//   client.end();
// });

