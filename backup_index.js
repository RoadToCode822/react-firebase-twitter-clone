const functions = require('firebase-functions');
const admin = require('firebase-admin');
const app = require('express')();

admin.initializeApp({
  credential: admin.credential.cert(require('../keys/admin.json'))
});

const config = {
  apiKey: "AIzaSyDE-BbjYOnBkkLHTNu0XY-kIrAh9VamWPI",
  authDomain: "socialape-14fe5.firebaseapp.com",
  databaseURL: "https://socialape-14fe5.firebaseio.com",
  projectId: "socialape-14fe5",
  storageBucket: "socialape-14fe5.appspot.com",
  messagingSenderId: "312800449869",
  appId: "1:312800449869:web:bbfd241b8032a628ead304",
  measurementId: "G-M55T9TXKNL"
};

const firebase = require('firebase');
firebase.initializeApp(config);

const db = admin.firestore();

app.get('/screams', (req, res) => {
  db
    .collection('screams')
    .orderBy('createdAt', 'desc')
    .get()
    .then((data) => {
      let screams = [];
      data.forEach((doc) => {
        screams.push({
          screamId: doc.id,
          userHandle: doc.data().userHandle,
          createdAt: new data().createdAt,
          commentCount: doc.data().commentCount,
          likeCount: doc.data().likeCount
        });
      });
      return res.json(screams);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: err.code });
    });
})

const FBAuth = (req, res, next) => {
  let idToken;
  if(req.headers.authorization && req.headers.authorization.startsWith('Bearer ')){
    idToken = req.headers.authorization.split('Bearer ')[1];
  } else {
    console.error('No token found')
    return res.status(403).json({ error: 'Unauthorized'});
  }

  admin.auth().verifyIdToken(idToken)
  .then(decodedToken => {
    req.user = decodedToken;
    return db.collection('users')
      .where('userId', '==', req.user.uid)
      .limit(1)
      .get()
  })
  .then(data => {
    req.user.handle = data.docs[0].data().handle;
    return next();
  })
  .catch(err => {
    console.error('Error while verifying token ', err);
    return res.status(403).json(err);
  })
}

//Post one scream
app.post('/scream', FBAuth, (req, res) => {
  const newScream = {
    body: req.body.body,
    userHandle: req.user.handle,
    createdAt: new Date().toISOString()
  };

  db
    .collection('screams')
    .add(newScream)
    .then((doc) => {
      res.json({ message: `Document ${doc.id} created successfully` })
    })
    .catch((err) => {
      res.status(500).json({ error: 'something went wrong'});
      console.error(err);
    })
});

const isEmail = (email) => {
  const regEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if(email.match(regEx)) return true;
  else return false;
}

const isEmpty = (string) => {
  if(string.trim() == '') return true;
  else return false;
}

//Signup route
app.post('/signup', (req, res) => {
  const newUser = {
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    handle: req.body.handle,
  };

  let errors = {};

  if(isEmpty(newUser.email)) {
    errors.email = 'Must not be empty.'
  } else if(!isEmail(newUser.email)){
    errors.email = 'Must be a valid email address'
  }

  if(isEmpty(newUser.password)) errors.password = 'Must not be empty';
  if(newUser.password !== newUser.confirmPassword) errors.confirmPassword = 'Passwords must match';
  if(isEmpty(newUser.handle)) errors.handle = 'Must not be empty';

  if(Object.keys(errors).length > 0) return res.status(400).json(errors);

  // Validate data
  let token, userId;
  db
  .doc(`/users/${newUser.handle}`).get()
  .then(doc => {
    if(doc.exists){
      return res.status(400).json({ handle: 'This handle is already taken' });
    } else {
      return firebase
      .auth()
      .createUserWithEmailAndPassword(newUser.email, newUser.password)
    }
  })
  .then(data => {
    userId = data.user.uid;
    return data.user.getIdToken();
  })
  .then(idToken => {
    token = idToken;
    const userCredentials = {
      handle: newUser.handle,
      email: newUser.email,
      createdAt: new Date().toISOString(),
      userId
    };
    return db.doc(`/users/${newUser.handle}`).set(userCredentials);
  })
  .then(() => {
    return res.status(201).json({ token })
  })
  .catch(err => {
    console.error(err);
    if(err.code === 'auth/email-already-in-use'){
      return res.status(400).json({ email: 'Email is already in use.'});
    } else {
      return res.status(500).json({ error: err.code });
    }    
  }); 
});

//Login route
app.post('/login', (req,res) => {
  const user = {
    email: req.body.email,
    password: req.body.password
  };

  let errors = {};

  if(isEmpty(user.email)) errors.email = 'Must not be empty'
  if(isEmpty(user.password)) errors.password = 'Must not be empty'

  if(Object.keys(errors).length > 0) return res.status(400).json(errors);

  firebase.auth().signInWithEmailAndPassword(user.email, user.password)
  .then(data => {
    return data.user.getIdToken();
  }).
  then(token => {
    return res.json({ token });
  })
  .catch((err) => {
    console.error(err);
    if(err.code === 'auth/wrong-password'){
      return res
      .status(403)
      .json({ general: 'Wrong credentials. Please try again.'});
    } else return res.status(500).json({ error: err.code });
  });
});

exports.api = functions.https.onRequest(app);