const express = require('express');
const pool = require('../config/db');
const router = express.Router();
const { auth, requireRole } = require('../middleware/auth');
const { getAllAssets, getAssetById, createAsset, updateAsset, deleteAsset } = require('../controllers/assetsController');

router.get('/', auth, getAllAssets);
router.get('/types', auth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM asset_types WHERE organization_id = $1 ORDER BY name',
      [req.user.org_id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});
router.get('/:id', auth, getAssetById);
router.post('/', auth, requireRole('admin'), createAsset);
router.put('/:id', auth, requireRole('admin'), updateAsset);
router.delete('/:id', auth, requireRole('admin'), deleteAsset);

module.exports = router;