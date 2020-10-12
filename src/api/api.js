import io from 'socket.io-client';

const socket = io('https://googler-io.skyreglis.studio', {
  transports: ['websocket'],
  secure: true
});

export function game(cb, type) {
  if (socket.connected) {
    socket.once('game', (params) => cb(params));
    socket.emit('game', type);
  } else {
    throw Error('Connection error');
  }
}

export function record(cb) {
  socket.once('record', (record) => cb(record));
  socket.emit('record');
}

export function ranking(cb, friends, limit) {
  if (socket.connected) {
    socket.once('ranking', (ranking) => cb(ranking));
    socket.emit('ranking', friends, limit);
  } else {
    throw Error('Connection error');
  }
}

export function userAuth(cb) {
  socket.once('userAuth', (valid) => cb(valid));
  socket.emit('userAuth', document.location.href);
}

export function reconnect() {
  socket.once('reconnectUser', (score) => console.log(score));
  socket.emit('reconnectUser');
}

export function randomRequests(cb, limit = 10, needFirstCount = false) {
  if (socket.connected) {
    socket.once('randomRequests', (requests) => cb(requests));
    socket.emit('randomRequests', limit, needFirstCount);
  } else {
    throw Error('Connection error');
  }
}

export function checkRequest(cb, firstId, secondId, type) {
  if (socket.connected) {
    socket.once('checkRequest', (valid, requests) => cb(valid, requests));
    socket.emit('checkRequest', firstId, secondId, type);
  } else {
    throw Error('Connection error');
  }
}

export function checkUserGroupMember(cb) {
  if (socket.connected) {
    socket.once('checkUserGroupMember', (isMember) => cb(isMember));
    socket.emit('checkUserGroupMember');
  } else {
    throw Error('Connection error');
  }
}

socket.on('connect', () => {
  console.log('WSS connected');
});

socket.on('reconnect', () => {
  // reconnectCount += 1;
  //
  // if (reconnectCount > 5) {
  //   socket.disconnect();
  // }

  console.log('WSS reconnected');

  userAuth(() => {
    reconnect();
  });
});

socket.on('disconnect', () => {
  console.log('WSS disconnected');
});
