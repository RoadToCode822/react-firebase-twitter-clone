let db = {
  users: [
    {
      userId: 'hello',
      email: 'hello',
      handle: 'user',
      createdAt: '2019-11-23T20:44:39.040Z',
      imageUrl: 'image/dslfkjsdlf/ldskjf',
      bio: 'hello my name is mahtab',
      website: 'https://user.com',
      location: 'London, UK'
    }
  ],
  screams: [
    {
      userHandle: 'user',
      body: 'this is the scream body',
      createdAt: '2019-11-23T20:44:39.040Z',
      likeCount: 5,
      commentCount: 2
    }
  ],
  comments: [
    {
      userHandle: 'user',
      screamId: 'sldfkjsldfkjsldfj',
      body: 'nice text 123',
      createdAt: '2019-11-23T20:44:39.040Z'
    }
  ] 
};
const userDetails = {
  // Redux Data
  credentials: {
    userId: 'slskdfsldkfjslkfjdsf',
    email: 'email@email.com',
    handle: 'user',
    createdAt: '2019-11-23T20:44:39.040Z',
    imageUrl: 'image/dlsjfldkj',
    bio: 'hello, this is bio',
    website: 'https://wow.com',
    location: 'London, UK'
  },
  likes: [
    {
    userHandle: 'user',
    screamId: 'wowosdfjosdifjo'
    },
    {
      userHandle: 'user',
      screamId: 'wowosdfjosdifjo'
    }
  ]
};