const express = require('express');
const Lead = require('../models/Lead');
const { protect } = require('../middleware/auth');
const router = express.Router();

// POST /api/leads — public (patient submits consultation request)
router.post('/', async (req, res, next) => {
  try {
    const lead = await Lead.create(req.body);
    res.status(201).json({ success: true, message: 'Consultation request submitted!', lead });
  } catch (err) { next(err); }
});

// GET /api/leads — protected (staff only)
router.get('/', protect, async (req, res, next) => {
  try {
    const { status, assignedTo } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (assignedTo) filter.assignedConsultantId = assignedTo;
    const leads = await Lead.find(filter)
      .populate('assignedConsultantId', 'name email')
      .populate('recommendedDoctors', 'name speciality')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: leads.length, leads });
  } catch (err) { next(err); }
});

// GET /api/leads/:id — protected
router.get('/:id', protect, async (req, res, next) => {
  try {
    const lead = await Lead.findById(req.params.id)
      .populate('assignedConsultantId', 'name email')
      .populate('recommendedDoctors')
      .populate('recommendedHospitals');
    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });
    res.json({ success: true, lead });
  } catch (err) { next(err); }
});

// PATCH /api/leads/:id — protected (update status, add note, assign)
router.patch('/:id', protect, async (req, res, next) => {
  try {
    const lead = await Lead.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });
    res.json({ success: true, lead });
  } catch (err) { next(err); }
});

// POST /api/leads/:id/notes — add follow-up note
router.post('/:id/notes', protect, async (req, res, next) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });
    lead.followUpNotes.push({ note: req.body.note, author: req.user.id });
    await lead.save();
    res.json({ success: true, lead });
  } catch (err) { next(err); }
});

module.exports = router;
