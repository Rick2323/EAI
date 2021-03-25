const express = require('express');
const router = express.Router();

// import routers
router.use("/corpus", require("./api/corpus"));

module.exports = router;