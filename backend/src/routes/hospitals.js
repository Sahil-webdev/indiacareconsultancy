const express = require('express');
const Hospital = require('../models/Hospital');
const { protect } = require('../middleware/auth');
const router = express.Router();

// GET /api/hospitals — public, with optional filters
router.get('/', async (req, res, next) => {
  try {
    const { location, department, search } = req.query;
    const filter = { isApproved: true };
    if (location) filter.location = new RegExp(location, 'i');
    if (department) filter.departments = new RegExp(department, 'i');
    if (search) filter.name = new RegExp(search, 'i');
    const hospitals = await Hospital.find(filter).sort({ rating: -1 });
    res.json({ success: true, count: hospitals.length, hospitals });
  } catch (err) { next(err); }
});

// GET /api/hospitals/:id — public
router.get('/:id', async (req, res, next) => {
  try {
    const hospital = await Hospital.findById(req.params.id).populate('doctors', 'name speciality photo rating');
    if (!hospital) return res.status(404).json({ success: false, message: 'Hospital not found' });
    res.json({ success: true, hospital });
  } catch (err) { next(err); }
});

// POST /api/hospitals — protected
router.post('/', protect, async (req, res, next) => {
  try {
    const hospital = await Hospital.create(req.body);
    res.status(201).json({ success: true, hospital });
  } catch (err) { next(err); }
});

// PATCH /api/hospitals/:id — protected
router.patch('/:id', protect, async (req, res, next) => {
  try {
    const hospital = await Hospital.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!hospital) return res.status(404).json({ success: false, message: 'Hospital not found' });
    res.json({ success: true, hospital });
  } catch (err) { next(err); }
});

// DELETE /api/hospitals/:id — protected
router.delete('/:id', protect, async (req, res, next) => {
  try {
    await Hospital.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Hospital deleted' });
  } catch (err) { next(err); }
});

module.exports = router;
