const express = require('express');
const router = express.Router();

const seeder = require('../../seeders/seeders')


router.post('/entries', seeder.addToDatabase)

module.exports = router;