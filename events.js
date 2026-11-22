const EventEmitter = require('events');

class AppEmitter extends EventEmitter {}
const appEvents = new AppEmitter();

appEvents.on('user:registered', (u) => console.log(`[event] New user registered: ${u.username}`));
appEvents.on('user:login',      (u) => console.log(`[event] User logged in: ${u.username}`));
appEvents.on('note:created',    (n) => console.log(`[event] Note created: "${n.title}" by ${n.owner}`));
appEvents.on('note:deleted',    (id) => console.log(`[event] Note deleted: ${id}`));

module.exports = appEvents;