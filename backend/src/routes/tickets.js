const express = require('express');
const router = express.Router();
const { auth, requireRole } = require('../middleware/auth');
const { getAllTickets, getTicketById, createTicket, updateTicket, deleteTicket, getTicketStats, submitResolution, approveResolution } = require('../controllers/ticketsController');

router.get('/stats', auth, getTicketStats);
router.get('/', auth, getAllTickets);
router.get('/:id', auth, getTicketById);
router.post('/', auth, requireRole('admin', 'technician'), createTicket);
router.post('/:id/resolve', auth, requireRole('admin', 'technician'), submitResolution);
router.post('/:id/approve', auth, requireRole('admin'), approveResolution);
router.put('/:id', auth, requireRole('admin', 'technician'), updateTicket);
router.delete('/:id', auth, requireRole('admin'), deleteTicket);

module.exports = router;