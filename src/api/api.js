import io from 'socket.io-client';

const socket = io('https://googler-io.skyreglis.studio', {
  transports: ['websocket'],
  secure: true
});

export function game(cb, type) {
  socket.once('game', (params) => cb(params));
  socket.emit('game', type);
}

export function record(cb) {
  socket.once('record', (record) => cb(record));
  socket.emit('record');
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
  socket.once('randomRequests', (requests) => cb(requests));
  socket.emit('randomRequests', limit, needFirstCount);
}

export function checkRequest(cb, firstId, secondId, type) {
  socket.once('checkRequest', (valid, requests) => cb(valid, requests));
  socket.emit('checkRequest', firstId, secondId, type);
}

socket.on('connect', () => {
  console.log('WSS connected');
});

socket.on('reconnect', () => {
  console.log('WSS reconnected');

  userAuth(() => {
    reconnect();
  });
});

socket.on('disconnect', () => {
  console.log('WSS disconnected');
});
