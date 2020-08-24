'use strict';
const open = require('open');
const express = require('express');
const app = express();
app.use(express.static('./'));
app.listen(8001, async ()=> {
  console.log('vr gui started http://localhost:8001/');
  await open('http://localhost:8001/');
});