const express = require('express');
const router = express.Router();

// const db = require('../custom_modules/db_query');
// const crypto = require('../custom_modules/crypto2');
const log = require('../custom_modules/custom_logs');
// const auth = require('../custom_modules/auth');
// const jwt = require('../custom_modules/custom_jwt');
const cRes = require('../custom_modules/custom_res');

let cPlayer = null;
const db = null;
const jwt = null;

/* GET home page. */

router.get('/api/dash',  function(req, res, next) {
    require('./api/dash')(req, res, next, db, log, cRes, jwt, cPlayer);
});
router.get('/api/search',  function(req, res, next) {
    require('./api/search')(req, res, next, db, log, cRes, jwt, cPlayer);
});
router.get('/api/play',  function(req, res, next) {
    require('./api/play')(req, res, next, db, log, cRes, jwt, cPlayer);
});
router.get('/api/download',  function(req, res, next) {
    require('./api/download')(req, res, next, db, log, cRes, jwt, cPlayer);
});

router.get('*', function(req, res, next) {
    res.render('index');
});

module.exports.init = function(_cPlayer) {
    cPlayer = _cPlayer;
    return router;
};

// module.exports = router;