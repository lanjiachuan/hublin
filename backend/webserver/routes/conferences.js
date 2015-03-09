'use strict';

var express = require('express');

/**
 * This router is responsible of the conferences API
 * @param {function} dependencies
 * @return {Router}
 */
module.exports = function(dependencies) {

  var controllers = require('../controllers/conferences')(dependencies);
  var middlewares = require('../middlewares/conference')(dependencies);
  var user = require('../middlewares/user')(dependencies);
  var should = require('../middlewares/should');

  var router = express.Router();

  router.get('/api/conferences/:id', middlewares.load, middlewares.lazyArchive(false), controllers.get);
  router.put('/api/conferences/:id', middlewares.checkIdForCreation, middlewares.lazyArchive(true), user.load, controllers.createAPI);
  router.get('/api/conferences/:id/members', middlewares.load, controllers.getMembers);
  router.put('/api/conferences/:id/members', middlewares.load, user.loadFromCookie, middlewares.canAddMember, controllers.addMembers);
  router.put('/api/conferences/:id/members/:mid/:field', middlewares.load, user.loadFromCookie, should.beInRequest('conference'), controllers.updateMemberField);

  return router;
};
