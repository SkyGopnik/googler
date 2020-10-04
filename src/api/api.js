import io from 'socket.io-client';

const socket = io('https://googler-io.skyreglis.studio', {
  transports: ['websocket'],
  secure: true
});

export function subscribeToTimer(cb) {
  console.log('test');
  socket.once('timer', (timestamp) => cb(null, timestamp));
  socket.emit('subscribeToTimer', 1000);
}

export function userAuth(cb) {
  socket.emit('userAuth', document.location.href);
  cb();
}

export function randomRequests(cb, limit = 10, needFirstCount = false) {
  socket.once('randomRequests', (requests) => cb(requests));
  socket.emit('randomRequests', limit, needFirstCount);
}

export function checkRequest(cb, firstId, secondId, type) {
  socket.once('checkRequest', (valid, requests) => cb(valid, requests));
  socket.emit('checkRequest', firstId, secondId, type);
}
