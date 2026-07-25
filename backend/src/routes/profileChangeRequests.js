const express = require('express');
const { protect } = require('../middleware/auth');
const { listProfileChangeRequests, reviewProfileChanges } = require('../services/profileChangeWorkflow');

const router = express.Router();

router.get('/', protect, async (req, res, next) => {
  try {
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({ success: false, message: 'Forbidden: Super admin access required' });
    }

    const payload = await listProfileChangeRequests();
    res.json({ success: true, ...payload });
  } catch (error) {
    next(error);
  }
});

router.patch('/:entityType/:entityId', protect, async (req, res, next) => {
  try {
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({ success: false, message: 'Forbidden: Super admin access required' });
    }

    const decision = req.body?.decision;
    if (!['approved', 'rejected'].includes(decision)) {
      return res.status(400).json({ success: false, message: 'Decision must be approved or rejected' });
    }

    await reviewProfileChanges({
      entityType: req.params.entityType,
      entityId: req.params.entityId,
      decision,
      reviewerUser: req.user,
    });

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
