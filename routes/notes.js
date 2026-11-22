const express = require('express');
const Note = require('../models/Note');
const User = require('../models/User');
const { authenticate, authorize } = require('../middleware/auth');
const appEvents = require('../events');

const router = express.Router();
router.use(authenticate); // every route below is protected

// Create
router.post('/notes', async (req, res) => {
  const { title, content } = req.body;
  if (!title || !content) return res.status(400).json({ message: 'title and content required' });
  const note = await Note.create({ title, content, owner: req.user.id });
  appEvents.emit('note:created', note);
  res.status(201).json(note);
});

// Read all (only my notes)
router.get('/notes', async (req, res) => {
  res.json(await Note.find({ owner: req.user.id }));
});

// Read one
router.get('/notes/:id', async (req, res) => {
  const note = await Note.findOne({ _id: req.params.id, owner: req.user.id });
  if (!note) return res.status(404).json({ message: 'Note not found' });
  res.json(note);
});

// Update
router.put('/notes/:id', async (req, res) => {
  const note = await Note.findOneAndUpdate(
    { _id: req.params.id, owner: req.user.id },
    { title: req.body.title, content: req.body.content },
    { new: true, runValidators: true }
  );
  if (!note) return res.status(404).json({ message: 'Note not found' });
  res.json(note);
});

// Delete
router.delete('/notes/:id', async (req, res) => {
  const note = await Note.findOneAndDelete({ _id: req.params.id, owner: req.user.id });
  if (!note) return res.status(404).json({ message: 'Note not found' });
  appEvents.emit('note:deleted', note._id);
  res.json({ message: 'Note deleted' });
});

// RBAC demo: admin only
router.get('/admin/users', authorize('admin'), async (req, res) => {
  res.json(await User.find().select('-password'));
});

module.exports = router;