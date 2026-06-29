const express = require('express');
const Doctor = require('../models/Doctor');
const { protect } = require('../middleware/auth');
const router = express.Router();

// GET /api/doctors — public, with optional filters
router.get('/', async (req, res, next) => {
  try {
    const { speciality, location, gender, consultationType, search } = req.query;
    const filter = { isApproved: true };
    if (speciality) filter.speciality = new RegExp(speciality, 'i');
    if (location) filter.location = new RegExp(location, 'i');
    if (gender) filter.gender = gender;
    if (consultationType) filter.consultationType = consultationType;
    if (search) filter.$or = [
      { name: new RegExp(search, 'i') },
      { speciality: new RegExp(search, 'i') },
    ];
    const doctors = await Doctor.find(filter).sort({ rating: -1 });
    res.json({ success: true, count: doctors.length, doctors });
  } catch (err) { next(err); }
});

// GET /api/doctors/:id — public
router.get('/:id', async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });
    res.json({ success: true, doctor });
  } catch (err) { next(err); }
});

// POST /api/doctors — protected (admin/consultant)
router.post('/', protect, async (req, res, next) => {
  try {
    const doctor = await Doctor.create(req.body);
    res.status(201).json({ success: true, doctor });
  } catch (err) { next(err); }
});

// PATCH /api/doctors/:id — protected
router.patch('/:id', protect, async (req, res, next) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });
    res.json({ success: true, doctor });
  } catch (err) { next(err); }
});

// DELETE /api/doctors/:id — protected (admin only)
router.delete('/:id', protect, async (req, res, next) => {
  try {
    await Doctor.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Doctor deleted' });
  } catch (err) { next(err); }
});

module.exports = router;
