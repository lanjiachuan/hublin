'use strict';

var expect = require('chai').expect;
var mockery = require('mockery');
var logger = require('../../../fixtures/logger-noop');
var q = require('q');

describe('The conference middleware', function() {
  var dependencies;

  before(function() {
    dependencies = function(name) {
      if (name === 'logger') {
        return logger();
      }
    };
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
      var middleware = this.helpers.requireBackend('webserver/middlewares/conference')(dependencies).canAddMember;
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
      var middleware = this.helpers.requireBackend('webserver/middlewares/conference')(dependencies).canAddMember;
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

    it('should send back HTTP 500 when conference#userIsConferenceMember fails', function(done) {
      mockery.registerMock('../../core/conference', {
        userIsConferenceMember: function(conference, user, callback) {
          return callback(new Error());
        }
      });

      var middleware = this.helpers.requireBackend('webserver/middlewares/conference')(dependencies).canAddMember;
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

    it('should call next when conference#userIsConferenceMember returns true', function(done) {
      mockery.registerMock('../../core/conference', {
        userIsConferenceMember: function(conference, user, callback) {
          return callback(null, true);
        }
      });

      var middleware = this.helpers.requireBackend('webserver/middlewares/conference')(dependencies).canAddMember;
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

    it('should send back HTTP 403 when conference#userIsConferenceMember returns false ' , function(done) {
      mockery.registerMock('../../core/conference', {
        userIsConferenceMember: function(conference, user, callback) {
          return callback(null, false);
        }
      });

      var middleware = this.helpers.requireBackend('webserver/middlewares/conference')(dependencies).canAddMember;
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
  });
  describe('lazyArchive middleware', function() {
    describe('initialized with loadFirst to true', function() {
      it('should call conference.get with req.params.id', function(done) {
        mockery.registerMock('../../core/conference', {
          get: function(id, callback) {
            expect(id).to.equal('conf1');
            done();
          }
        });

        var middleware = this.helpers.requireBackend('webserver/middlewares/conference')(dependencies).lazyArchive(true);
        var req = {params: {id: 'conf1'}};
        middleware(req, {}, function() {});
      });
      it('should call next() if conference is not found', function(done) {
        mockery.registerMock('../../core/conference', {
          get: function(id, callback) {
            callback();
          }
        });

        var middleware = this.helpers.requireBackend('webserver/middlewares/conference')(dependencies).lazyArchive(true);
        var req = {params: {id: 'conf1'}};
        middleware(req, {}, function() {done();});
      });
      it('should call next() if conference.get returns an error', function(done) {
        mockery.registerMock('../../core/conference', {
          get: function(id, callback) {
            callback(new Error('Test'));
          }
        });

        var middleware = this.helpers.requireBackend('webserver/middlewares/conference')(dependencies).lazyArchive(true);
        var req = {params: {id: 'conf1'}};
        middleware(req, {}, function() {done();});
      });
      it('should call conference.isActive() if conference.get returns a conference', function(done) {
        mockery.registerMock('../../core/conference', {
          get: function(id, callback) {
            callback(null, {_id: 'conf1'});
          },
          isActive: function(conf) { done(); return q(true); }
        });

        var middleware = this.helpers.requireBackend('webserver/middlewares/conference')(dependencies).lazyArchive(true);
        var req = {params: {id: 'conf1'}};
        middleware(req, {}, function() {});
      });
      it('should call conference.isActive() if conference.get returns a conference', function(done) {
        mockery.registerMock('../../core/conference', {
          get: function(id, callback) {
            callback(null, {_id: 'conf1'});
          },
          isActive: function(conf) { done(); return q(true); }
        });

        var middleware = this.helpers.requireBackend('webserver/middlewares/conference')(dependencies).lazyArchive(true);
        var req = {params: {id: 'conf1'}};
        middleware(req, {}, function() {});
      });
      it('should call conference.archive() if conference.isActive returns false', function(done) {
        var conf = {_id: 'conf1'};
        mockery.registerMock('../../core/conference', {
          get: function(id, callback) {
            callback(null, conf);
          },
          isActive: function(conf) { return q(false); },
          archive: function(conf) {
            expect(conf).to.deep.equal(conf);
            done();
            return q(true);
          }
        });

        var middleware = this.helpers.requireBackend('webserver/middlewares/conference')(dependencies).lazyArchive(true);
        var req = {params: {id: 'conf1'}};
        middleware(req, {}, function() {});
      });
      it('should send back an error if something skrewed up in the process', function(done) {
        var conf = {_id: 'conf1'};
        mockery.registerMock('../../core/conference', {
          get: function(id, callback) {
            callback(null, conf);
          },
          isActive: function(conf) { return q(false); },
          archive: function(conf) {
            return q.reject(new Error('test error'));
          }
        });

        var middleware = this.helpers.requireBackend('webserver/middlewares/conference')(dependencies).lazyArchive(true);
        var req = {params: {id: 'conf1'}};
        var res = {
          json: function(code, details) {
            expect(code).to.equal(500);
            expect(details).to.deep.equal({error: {code: 500, message: 'Server Error', details: 'test error'}});
            done();
          }
        };
        middleware(req, res, function() {});
      });
    });
    describe('initialized with loadFirst to true', function() {
      it('should call next() if req.conference is not defined', function(done) {
        mockery.registerMock('../../core/conference', {});

        var middleware = this.helpers.requireBackend('webserver/middlewares/conference')(dependencies).lazyArchive(false);
        var req = {};
        var res = {};
        middleware(req, res, done);
      });
      it('should not delete req.conference if conference is still active', function(done) {
        var conf = {_id: 'conf1'};
        mockery.registerMock('../../core/conference', {
          isActive: function(conf) { return q(true); }
        });

        var middleware = this.helpers.requireBackend('webserver/middlewares/conference')(dependencies).lazyArchive(false);
        var req = {conference: conf};
        var res = {};
        middleware(req, res, function() {
          expect(req.conference).to.deep.equal(conf);
          done();
        });
      });
      it('should delete req.conference if conference is not active', function(done) {
        var conf = {_id: 'conf1'};
        mockery.registerMock('../../core/conference', {
          isActive: function(conf) { return q(false); },
          archive: function(conf) {
            return q(true);
          }
        });

        var middleware = this.helpers.requireBackend('webserver/middlewares/conference')(dependencies).lazyArchive(false);
        var req = {conference: conf};
        var res = {};
        middleware(req, res, function() {
          expect(req).to.not.have.property('conference');
          done();
        });
      });
    });
  });

  describe('addUserOrCreate function', function() {
    describe('when conference is not created', function() {

      it('should create it and fill request', function(done) {
        var name = 'MyConf';
        var user = {id: 'me@yubl.in', objectType: 'email'};

        mockery.registerMock('../../core/conference', {
          get: function(id, callback) {
            return callback(null, null);
          },
          create: function(conf, callback) {
            return callback(null, conf);
          }
        });

        var middleware = this.helpers.requireBackend('webserver/middlewares/conference')(dependencies).addUserOrCreate;
        var req = {params: {id: name}, user: user};
        var res = {};

        middleware(req, res, function() {
          expect(req.conference).to.exists;
          expect(req.conference._id).to.equal(name);
          expect(req.user).to.deep.equal(user);
          expect(req.created).to.be.true;
          done();
        });
      });

    });

    describe('when conference is already created', function() {
      it('should add current user to the conference', function(done) {
        var name = 'MyConf';
        var conference = {_id: name, members: []};
        var user = {id: 'me@yubl.in', objectType: 'email'};
        var userId = 123456789;

        mockery.registerMock('../../core/conference', {
          addUser: function(conf, user, callback) {
            return callback();
          },
          getMember: function(conf, user, callback) {
            user._id = userId;
            return callback(null, user);
          }
        });

        var middleware = this.helpers.requireBackend('webserver/middlewares/conference')(dependencies).addUserOrCreate;
        var req = {conference: conference, params: {id: name}, user: user};
        var res = {};

        middleware(req, res, function() {
          expect(req.user).to.exist;
          expect(req.user._id).to.exist;
          expect(req.user._id).to.equal(userId);
          done();
        });

      });
    });
  });
});
