const express = require('express');
const router = express.Router();
const { auth, requireRole } = require('../middleware/auth');
const { getAllAssets, getAssetById, createAsset, updateAsset, deleteAsset } = require('../controllers/assetsController');

router.get('/', auth, getAllAssets);
router.get('/:id', auth, getAssetById);
router.post('/', auth, requireRole('admin'), createAsset);
router.put('/:id', auth, requireRole('admin'), updateAsset);
router.delete('/:id', auth, requireRole('admin'), deleteAsset);

module.exports = router;