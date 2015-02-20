'use strict';

var expect = require('chai').expect;
var mockery = require('mockery');

describe('The conference middleware', function() {
  var dependencies;

  before(function() {
    dependencies = {};
  });

  it('load should set req.conference when id is set', function(done) {
    var result = {
      creator: 234
    };
    var conference = {
      get: function(id, callback) {
        return callback(null, result);
      }
    };
    mockery.registerMock('../../core/conference', conference);
    var controller = this.helpers.requireBackend('webserver/middlewares/conference')(dependencies);
    var req = {
      params: {
        id: 123
      }
    };
    var resp = {};
    var next = function() {
      expect(req.conference).to.exist;
      expect(req.conference).to.deep.equal(result);
      done();
    };
    controller.load(req, resp, next);
  });

  it('loadWithAttendees should set req.conference when id is set', function(done) {
    var result = {
      creator: 234
    };
    var conference = {
      loadWithAttendees: function(id, callback) {
        return callback(null, result);
      }
    };
    mockery.registerMock('../../core/conference', conference);
    var controller = this.helpers.requireBackend('webserver/middlewares/conference')(dependencies);
    var req = {
      params: {
        id: 123
      }
    };
    var resp = {};
    var next = function() {
      expect(req.conference).to.exist;
      expect(req.conference).to.deep.equal(result);
      done();
    };
    controller.loadWithAttendees(req, resp, next);
  });

  it('canJoin should send back HTTP 400 when user is not set in request', function(done) {
    mockery.registerMock('../../core/conference', {});
    var middleware = this.helpers.requireBackend('webserver/middlewares/conference')(dependencies).canJoin;
    var req = {
      conference: {}
    };
    var res = {
      json: function(code) {
        expect(code).to.equal(400);
        done();
      }
    };
    var next = function() {};
    middleware(req, res, next);
  });

  it('canJoin should send back HTTP 400 when conference is not set in request', function(done) {
    mockery.registerMock('../../core/conference', {});
    var middleware = this.helpers.requireBackend('webserver/middlewares/conference')(dependencies).canJoin;
    var req = {
      user: {}
    };
    var res = {
      json: function(code) {
        expect(code).to.equal(400);
        done();
      }
    };
    var next = function() {};
    middleware(req, res, next);
  });

  it('canJoin should send back HTTP 500 when conference module sends back error', function(done) {
    mockery.registerMock('../../core/conference', {
      userCanJoinConference: function(conference, user, callback) {
        return callback(new Error());
      }
    });

    var middleware = this.helpers.requireBackend('webserver/middlewares/conference')(dependencies).canJoin;
    var req = {
      user: {},
      conference: {}
    };
    var res = {
      json: function(code) {
        expect(code).to.equal(500);
        done();
      }
    };
    var next = function() {};
    middleware(req, res, next);
  });

  it('canJoin should send back HTTP 403 when conference module sends back false', function(done) {
    mockery.registerMock('../../core/conference', {
      userCanJoinConference: function(conference, user, callback) {
        return callback(null, false);
      }
    });

    var middleware = this.helpers.requireBackend('webserver/middlewares/conference')(dependencies).canJoin;
    var req = {
      user: {},
      conference: {}
    };
    var res = {
      json: function(code) {
        expect(code).to.equal(403);
        done();
      }
    };
    var next = function() {};
    middleware(req, res, next);
  });

  it('canJoin should call next when user can join the conference', function(done) {
    mockery.registerMock('../../core/conference', {
      userCanJoinConference: function(cofnference, user, callback) {
        return callback(null, true);
      }
    });

    var middleware = this.helpers.requireBackend('webserver/middlewares/conference')(dependencies).canJoin;
    var req = {
      user: {},
      conference: {}
    };
    middleware(req, {}, done);
  });

  it('isAdmin should send back HTTP 400 when user is not set in request', function(done) {
    mockery.registerMock('../../core/conference', {});
    var middleware = this.helpers.requireBackend('webserver/middlewares/conference')(dependencies).isAdmin;
    var req = {
      conference: {}
    };
    var res = {
      json: function(code) {
        expect(code).to.equal(400);
        done();
      }
    };
    var next = function() {};
    middleware(req, res, next);
  });

  it('isAdmin should send back HTTP 400 when conference is not set in request', function(done) {
    mockery.registerMock('../../core/conference', {});
    var middleware = this.helpers.requireBackend('webserver/middlewares/conference')(dependencies).isAdmin;
    var req = {
      user: {}
    };
    var res = {
      json: function(code) {
        expect(code).to.equal(400);
        done();
      }
    };
    var next = function() {};
    middleware(req, res, next);
  });

  it('isAdmin should send back HTTP 500 when conference module sends back error', function(done) {
    mockery.registerMock('../../core/conference', {
      userIsConferenceCreator: function(conference, user, callback) {
        return callback(new Error());
      }
    });

    var middleware = this.helpers.requireBackend('webserver/middlewares/conference')(dependencies).isAdmin;
    var req = {
      user: {},
      conference: {}
    };
    var res = {
      json: function(code) {
        expect(code).to.equal(500);
        done();
      }
    };
    var next = function() {};
    middleware(req, res, next);
  });

  it('isAdmin should send back HTTP 403 when conference module sends back false', function(done) {
    mockery.registerMock('../../core/conference', {
      userIsConferenceCreator: function(conference, user, callback) {
        return callback(null, false);
      }
    });

    var middleware = this.helpers.requireBackend('webserver/middlewares/conference')(dependencies).isAdmin;
    var req = {
      user: {},
      conference: {}
    };
    var res = {
      json: function(code) {
        expect(code).to.equal(403);
        done();
      }
    };
    var next = function() {};
    middleware(req, res, next);
  });

  it('isAdmin should call next when user is admin of the conference', function(done) {
    mockery.registerMock('../../core/conference', {
      userIsConferenceCreator: function(conference, user, callback) {
        return callback(null, true);
      }
    });

    var middleware = this.helpers.requireBackend('webserver/middlewares/conference')(dependencies).isAdmin;
    var req = {
      user: {},
      conference: {}
    };
    middleware(req, {}, done);
  });

  describe('canAddAttendee function', function() {
    it('should send back HTTP 400 when user is not set in request', function(done) {
      mockery.registerMock('../../core/conference', {});
      var middleware = this.helpers.requireBackend('webserver/middlewares/conference')(dependencies).canAddAttendee;
      var req = {
        conference: {}
      };
      var res = {
        json: function(code) {
          expect(code).to.equal(400);
          done();
        }
      };
      middleware(req, res);
    });

    it('should send back HTTP 400 when conference is not set in request', function(done) {
      mockery.registerMock('../../core/conference', {});
      var middleware = this.helpers.requireBackend('webserver/middlewares/conference')(dependencies).canAddAttendee;
      var req = {
        user: {}
      };
      var res = {
        json: function(code) {
          expect(code).to.equal(400);
          done();
        }
      };
      middleware(req, res);
    });

    it('should send back HTTP 500 when conference#userIsConferenceCreator fails', function(done) {
      mockery.registerMock('../../core/conference', {
        userIsConferenceCreator: function(conference, user, callback) {
          return callback(new Error());
        }
      });

      var middleware = this.helpers.requireBackend('webserver/middlewares/conference')(dependencies).canAddAttendee;
      var req = {
        user: {},
        conference: {}
      };
      var res = {
        json: function(code) {
          expect(code).to.equal(500);
          done();
        }
      };
      middleware(req, res);
    });

    it('should call next when conference#userIsConferenceCreator returns true', function(done) {
      mockery.registerMock('../../core/conference', {
        userIsConferenceCreator: function(conference, user, callback) {
          return callback(null, true);
        }
      });

      var middleware = this.helpers.requireBackend('webserver/middlewares/conference')(dependencies).canAddAttendee;
      var req = {
        user: {},
        conference: {}
      };
      var res = {
        json: function() {
          done(new Error());
        }
      };
      middleware(req, res, done);
    });

    it('should send back HTTP 403 when conference#userIsConferenceCreator returns false ' +
      'and userIsConferenceAttendee return false', function(done) {
      mockery.registerMock('../../core/conference', {
        userIsConferenceCreator: function(conference, user, callback) {
          return callback(null, false);
        },
        userIsConferenceAttendee: function(conference, user, callback) {
          return callback(null, false);
        }
      });

      var middleware = this.helpers.requireBackend('webserver/middlewares/conference')(dependencies).canAddAttendee;
      var req = {
        user: {},
        conference: {}
      };
      var res = {
        json: function(code) {
          expect(code).to.equal(403);
          done();
        }
      };
      middleware(req, res);
    });

    it('should send back HTTP 500 when conference#userIsConferenceCreator returns false ' +
      'and userIsConferenceAttendee fails', function(done) {
      mockery.registerMock('../../core/conference', {
        userIsConferenceCreator: function(conference, user, callback) {
          return callback(null, false);
        },
        userIsConferenceAttendee: function(conference, user, callback) {
          return callback(new Error());
        }
      });

      var middleware = this.helpers.requireBackend('webserver/middlewares/conference')(dependencies).canAddAttendee;
      var req = {
        user: {},
        conference: {}
      };
      var res = {
        json: function(code) {
          expect(code).to.equal(500);
          done();
        }
      };
      middleware(req, res);
    });

    it('should call next when conference#userIsConferenceCreator returns false ' +
      'and userIsConferenceAttendee return true', function(done) {
      mockery.registerMock('../../core/conference', {
        userIsConferenceCreator: function(conference, user, callback) {
          return callback(null, false);
        },
        userIsConferenceAttendee: function(conference, user, callback) {
          return callback(null, true);
        }
      });

      var middleware = this.helpers.requireBackend('webserver/middlewares/conference')(dependencies).canAddAttendee;
      var req = {
        user: {},
        conference: {}
      };
      var res = {
        json: function(code) {
          done(new Error());
        }
      };
      middleware(req, res, done);
    });
  });
});