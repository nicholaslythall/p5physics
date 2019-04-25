// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"vector.ts":[function(require,module,exports) {
"use strict";

var __extends = this && this.__extends || function () {
  var _extendStatics = function extendStatics(d, b) {
    _extendStatics = Object.setPrototypeOf || {
      __proto__: []
    } instanceof Array && function (d, b) {
      d.__proto__ = b;
    } || function (d, b) {
      for (var p in b) {
        if (b.hasOwnProperty(p)) d[p] = b[p];
      }
    };

    return _extendStatics(d, b);
  };

  return function (d, b) {
    _extendStatics(d, b);

    function __() {
      this.constructor = d;
    }

    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
}();

Object.defineProperty(exports, "__esModule", {
  value: true
});
var sqrt = Math.sqrt;

var sq = function sq(x) {
  return x * x;
};

var cos = Math.cos;
var sin = Math.sin;

var Vector = function () {
  function Vector(x, y) {
    x = x == undefined ? 0 : x;
    y = y == undefined ? 0 : y;

    if (!isFinite(x) || !isFinite(y)) {
      var error = new VectorError("x and y must be numbers, was (" + x + ", " + y + ")");
      console.log(error.stack);
      throw error;
    }

    this.x = x;
    this.y = y;
  }

  Vector.prototype.length = function () {
    return sqrt(sq(this.x) + sq(this.y));
  };

  Vector.prototype.lengthSquared = function () {
    return sq(this.x) + sq(this.y);
  };

  Vector.prototype.neg = function () {
    return new Vector(-this.x, -this.y);
  };

  Vector.prototype.toString = function () {
    return "[" + this.x + ", " + this.y + "]";
  };

  Vector.prototype.unit = function () {
    return this.div(this.length());
  };

  Vector.prototype.add = function (other) {
    return new Vector(this.x + other.x, this.y + other.y);
  };

  Vector.prototype.sub = function (other) {
    return new Vector(this.x - other.x, this.y - other.y);
  };

  Vector.prototype.mult = function (value) {
    if (!isFinite(value)) {
      throw new VectorError("value must be finite, was " + value);
    }

    return new Vector(this.x * value, this.y * value);
  };

  Vector.prototype.div = function (value) {
    return new Vector(this.x / value, this.y / value);
  };

  Vector.prototype.dot = function (other) {
    return this.x * other.x + this.y * other.y;
  };

  Vector.prototype.cross = function (other) {
    return this.x * other.y - this.y * other.x;
  };

  Vector.prototype.crossScalar = function (s) {
    return new Vector(s * this.y, -s * this.x);
  };

  Vector.prototype.scalarCross = function (s) {
    return new Vector(-s * this.y, s * this.x);
  };

  Vector.prototype.rotate = function (theta) {
    return new Vector(this.x * cos(theta) - this.y * sin(theta), this.x * sin(theta) + this.y * cos(theta));
  };

  Vector.prototype.equals = function (other) {
    return this.x == other.x && this.y == other.y;
  };

  return Vector;
}();

exports.Vector = Vector;

var VectorError = function (_super) {
  __extends(VectorError, _super);

  function VectorError() {
    return _super !== null && _super.apply(this, arguments) || this;
  }

  return VectorError;
}(Error);
},{}],"util.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

function clamp(minimum, maximum, value) {
  return Math.min(Math.max(minimum, value), maximum);
}

exports.clamp = clamp;
var lastId = 0;

function unqiueId() {
  var id = lastId;
  lastId++;
  return id;
}

exports.unqiueId = unqiueId;
},{}],"body.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var vector_1 = require("./vector");

var util_1 = require("./util");

var Body = function () {
  function Body(shape, density) {
    this.mass = 0;
    this.invMass = 0;
    this.inertia = 0;
    this.invInertia = 0;
    this.id = util_1.unqiueId();
    this.position = new vector_1.Vector();
    this.velocity = new vector_1.Vector();
    this.force = new vector_1.Vector();
    this.orientation = 0;
    this.angularVelocity = 0;
    this.torque = 0;
    this.shape = shape;
    this.shape.computeMass(this, density == undefined ? 0.1 : density);
    this.restitution = 0.7;
  }

  Body.prototype.applyForce = function (force) {
    this.force = this.force.add(force);
  };

  Body.prototype.applyImpulse = function (impulse, contactVector) {
    this.velocity = this.velocity.add(impulse.mult(this.invMass));
    this.angularVelocity += this.invInertia * contactVector.cross(impulse);
  };

  Body.prototype.isPointInside = function (point) {
    var bodyPoint = point.sub(this.position).rotate(-this.orientation);
    return this.shape.isInside(bodyPoint);
  };

  Body.prototype.update = function (dt) {
    this.velocity = this.velocity.add(this.force.mult(this.invMass).mult(dt));
    this.position = this.position.add(this.velocity.mult(dt));
    this.force = new vector_1.Vector();
    this.angularVelocity = this.torque * this.invInertia * dt;
    this.orientation += this.angularVelocity * dt;
    this.torque = 0;
  };

  Body.prototype.draw = function (p) {
    p.push();
    p.noFill();
    p.stroke(0);
    p.translate(this.position.x, this.position.y);
    p.rotate(this.orientation);
    this.shape.draw(p);
    p.pop();
  };

  return Body;
}();

exports.Body = Body;
},{"./vector":"vector.ts","./util":"util.ts"}],"shapes.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var vector_1 = require("./vector");

var sq = function sq(x) {
  return x * x;
};

var PI = Math.PI;
exports.SHAPE_AABB = 0;
exports.SHAPE_CIRCLE = 1;
exports.SHAPE_POLYGON = 2;
exports.SHAPE_COUNT = 3;
var SHAPE_DEBUG = true;

var AABB = function () {
  function AABB(size) {
    this.type = exports.SHAPE_AABB;
    this.size = size || new vector_1.Vector(20, 20);
  }

  AABB.prototype.draw = function (p) {
    var min = this.size.div(2);
    p.rect(min.x, min.y, this.size.x, this.size.y);
  };

  AABB.prototype.computeMass = function (body, density) {
    return this.size.x * this.size.y * density;
  };

  AABB.prototype.isInside = function (point) {
    var halfWidth = this.size.x / 2;
    var halfHeight = this.size.y / 2;
    return point.x >= -halfWidth && point.x <= halfWidth && point.y >= -halfHeight && point.y <= halfHeight;
  };

  return AABB;
}();

exports.AABB = AABB;

var Circle = function () {
  function Circle(radius) {
    this.type = exports.SHAPE_CIRCLE;
    this.radius = radius || 20;
  }

  Circle.prototype.draw = function (p) {
    p.ellipse(0, 0, this.radius);

    if (SHAPE_DEBUG) {
      p.line(0, 0, this.radius, 0);
    }
  };

  Circle.prototype.computeMass = function (body, density) {
    body.mass = PI * sq(this.radius) * density;
    body.invMass = body.mass != 0 ? 1 / body.mass : 0;
    body.inertia = body.mass * sq(this.radius);
    body.invInertia = body.inertia != 0 ? 1 / body.inertia : 0;
  };

  Circle.prototype.isInside = function (point) {
    return point.length() <= this.radius;
  };

  return Circle;
}();

exports.Circle = Circle;

var Polygon = function () {
  function Polygon(verts) {
    if (!Array.isArray(verts)) {
      throw "PolygonError: verts must be an array";
    }

    if (verts.length < 3) {
      throw "PolygonError: verts must contain at least 3 vertices";
    }

    this.type = exports.SHAPE_POLYGON;
    this.vertices = verts;
    this.normals = [];

    for (var i = 0; i < this.vertexCount; i++) {
      var face = this.vertices[(i + 1) % this.vertexCount].sub(this.vertices[i]);
      var normal = new vector_1.Vector(-face.y, face.x).unit();
      this.normals.push(normal);
    }
  }

  Polygon.rect = function (w, h) {
    var halfWidth = w / 2;
    var halfHeight = h / 2;
    return new Polygon([new vector_1.Vector(halfWidth, halfHeight), new vector_1.Vector(halfWidth, -halfHeight), new vector_1.Vector(-halfWidth, -halfHeight), new vector_1.Vector(-halfWidth, halfHeight)]);
  };

  Object.defineProperty(Polygon.prototype, "vertexCount", {
    get: function get() {
      return this.vertices.length;
    },
    enumerable: true,
    configurable: true
  });

  Polygon.prototype.computeMass = function (body, density) {
    var c = new vector_1.Vector();
    var area = 0;
    var I = 0;
    var inv3 = 1 / 3;

    for (var i = 0; i < this.vertices.length; i++) {
      var p1 = this.vertices[i];
      var p2 = this.vertices[(i + 1) % this.vertices.length];
      var D = p2.cross(p1);
      var triangleArea = 0.5 * D;
      area += triangleArea;
      var weight = triangleArea * inv3;
      var intx2 = sq(p1.x) + p1.x * p2.x + sq(p2.x);
      var inty2 = sq(p1.y) + p1.y * p2.y + sq(p2.y);
      I += 0.25 * inv3 * D * (intx2 + inty2);
    }

    body.mass = density * area;
    body.invMass = body.mass != 0 ? 1 / body.mass : 0;
    body.inertia = I * density;
    body.invInertia = body.inertia != 0 ? 1 / body.inertia : 0;
  };

  Polygon.prototype.draw = function (p) {
    p.push();
    p.beginShape();

    for (var _i = 0, _a = this.vertices; _i < _a.length; _i++) {
      var v = _a[_i];
      p.vertex(v.x, v.y);
    }

    p.endShape(p.CLOSE);
    p.pop();
  };

  Polygon.prototype.getSupport = function (direction) {
    var bestProjection = -Number.MAX_VALUE;
    var bestVertex = this.vertices[0];

    for (var i = 0; i < this.vertexCount; i++) {
      var vertex = this.vertices[i];
      var projection = vertex.dot(direction);

      if (projection > bestProjection) {
        bestVertex = vertex;
        bestProjection = projection;
      }
    }

    return bestVertex;
  };

  Polygon.prototype.isInside = function (point) {
    for (var i = 0; i < this.vertices.length; i++) {
      var s = this.normals[i].dot(point.sub(this.vertices[i]));

      if (s > 0) {
        return false;
      }
    }

    return true;
  };

  return Polygon;
}();

exports.Polygon = Polygon;
},{"./vector":"vector.ts"}],"collision_circle_circle.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var vector_1 = require("./vector");

var sq = function sq(x) {
  return x * x;
};

var sqrt = Math.sqrt;

var CollisionCircleCircle = function () {
  function CollisionCircleCircle() {}

  CollisionCircleCircle.prototype.handleCollision = function (manifold, a, b) {
    var A = a.shape;
    var B = b.shape;
    var normal = b.position.sub(a.position);
    var dist_sqr = normal.lengthSquared();
    var radius = A.radius + B.radius;

    if (dist_sqr >= sq(radius)) {
      manifold.contactCount = 0;
      return;
    }

    var distance = sqrt(dist_sqr);
    manifold.contactCount = 1;

    if (distance == 0.0) {
      manifold.penetration = A.radius;
      manifold.normal = new vector_1.Vector(1, 0);
      manifold.contacts[0] = a.position;
    } else {
      manifold.penetration = radius - distance;
      manifold.normal = normal.div(distance);
      manifold.contacts[0] = manifold.normal.mult(A.radius).add(a.position);
    }
  };

  return CollisionCircleCircle;
}();

exports.CollisionCircleCircle = CollisionCircleCircle;
},{"./vector":"vector.ts"}],"collision_circle_polygon.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var EPSILON = 0.0001;

var sq = function sq(x) {
  return x * x;
};

var CollisionCirclePolygon = function () {
  function CollisionCirclePolygon() {}

  CollisionCirclePolygon.prototype.handleCollision = function (manifold, circleBody, polygonBody) {
    var circle = circleBody.shape;
    var polygon = polygonBody.shape;
    manifold.contactCount = 0;
    var center = circleBody.position.sub(polygonBody.position).rotate(-polygonBody.orientation);
    var separation = -Number.MAX_VALUE;
    var faceNormal = 0;

    for (var i = 0; i < polygon.vertexCount; i++) {
      var s = polygon.normals[i].dot(center.sub(polygon.vertices[i]));

      if (s > circle.radius) {
        return;
      }

      if (s > separation) {
        separation = s;
        faceNormal = i;
      }
    }

    var v1 = polygon.vertices[faceNormal];
    var v2 = polygon.vertices[(faceNormal + 1) % polygon.vertexCount];

    if (separation < EPSILON) {
      manifold.contactCount = 1;
      manifold.normal = polygon.normals[faceNormal].rotate(polygonBody.orientation).neg();
      manifold.contacts[0] = manifold.normal.mult(circle.radius).add(circleBody.position);
      manifold.penetration = circle.radius - separation;
      return;
    }

    var dot1 = center.sub(v1).dot(v2.sub(v1));
    var dot2 = center.sub(v2).dot(v1.sub(v2));
    manifold.penetration = circle.radius - separation;

    if (dot1 <= 0.0) {
      if (v1.sub(center).lengthSquared() > sq(circle.radius)) {
        return;
      }

      manifold.contactCount = 1;
      manifold.normal = v1.sub(center).rotate(polygonBody.orientation).unit();
      manifold.contacts[0] = v1.rotate(polygonBody.orientation).add(polygonBody.position);
    } else if (dot2 <= 0.0) {
      if (v2.sub(center).lengthSquared() > sq(circle.radius)) {
        return;
      }

      manifold.contactCount = 1;
      manifold.normal = v2.sub(center).rotate(polygonBody.orientation).unit();
      manifold.contacts[0] = v2.rotate(polygonBody.orientation).add(polygonBody.position);
    } else {
      var n = polygon.normals[faceNormal];

      if (center.sub(v1).dot(n) > circle.radius) {
        return;
      }

      manifold.contactCount = 1;
      manifold.normal = n.rotate(polygonBody.orientation).neg();
      manifold.contacts[0] = circleBody.position.add(manifold.normal.mult(circle.radius));
    }
  };

  return CollisionCirclePolygon;
}();

exports.CollisionCirclePolygon = CollisionCirclePolygon;

var CollisionPolygonCircle = function () {
  function CollisionPolygonCircle() {
    this.handler = new CollisionCirclePolygon();
  }

  CollisionPolygonCircle.prototype.handleCollision = function (manifold, polygon, circle) {
    this.handler.handleCollision(manifold, circle, polygon);
    manifold.normal = manifold.normal.neg();
  };

  return CollisionPolygonCircle;
}();

exports.CollisionPolygonCircle = CollisionPolygonCircle;
},{}],"collision_polygon_polygon.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var vector_1 = require("./vector");

var BIAS_RELATIVE = 0.95;
var BIAS_ABSOLUTE = 0.01;

function gt(a, b) {
  return a >= b * BIAS_RELATIVE + a * BIAS_ABSOLUTE;
}

var CollisionPolygonPolygon = function () {
  function CollisionPolygonPolygon() {}

  CollisionPolygonPolygon.prototype.handleCollision = function (manifold, a, b) {
    var shapeA = a.shape;
    var shapeB = b.shape;
    manifold.contactCount = 0;
    var faceA = [0];
    var penetrationA = this.findAxisLeastPenetration(faceA, shapeA, a, shapeB, b);

    if (penetrationA >= 0) {
      return;
    }

    var faceB = [0];
    var penetrationB = this.findAxisLeastPenetration(faceB, shapeB, b, shapeA, a);

    if (penetrationB >= 0) {
      return;
    }

    var referenceIndex;
    var flip;
    var referencePoly;
    var referenceBody;
    var incidentPoly;
    var incidentBody;

    if (gt(penetrationA, penetrationB)) {
      referencePoly = shapeA;
      referenceBody = a;
      incidentPoly = shapeB;
      incidentBody = b;
      referenceIndex = faceA[0];
      flip = false;
    } else {
      referencePoly = shapeB;
      referenceBody = b;
      incidentPoly = shapeA;
      incidentBody = a;
      referenceIndex = faceB[0];
      flip = true;
    }

    var incidentFace = [new vector_1.Vector(), new vector_1.Vector()];
    this.findIncidentFace(incidentFace, referencePoly, referenceBody, incidentPoly, incidentBody, referenceIndex);
    var v1 = referencePoly.vertices[referenceIndex];
    var v2 = referencePoly.vertices[(referenceIndex + 1) % referencePoly.vertexCount];
    v1 = v1.rotate(referenceBody.orientation).add(referenceBody.position);
    v2 = v2.rotate(referenceBody.orientation).add(referenceBody.position);
    var sidePlaneNormal = v2.sub(v1).unit();
    var referenceFaceNormal = new vector_1.Vector(sidePlaneNormal.y, -sidePlaneNormal.x);
    var refC = referenceFaceNormal.dot(v1);
    var negSide = -sidePlaneNormal.dot(v1);
    var posSide = sidePlaneNormal.dot(v2);
    var clip1 = this.clip(sidePlaneNormal.neg(), negSide, incidentFace);

    if (clip1 < 2) {
      return;
    }

    var clip2 = this.clip(sidePlaneNormal, posSide, incidentFace);

    if (clip2 < 2) {
      return;
    }

    if (flip) {
      manifold.normal = referenceFaceNormal;
    } else {
      manifold.normal = referenceFaceNormal.neg();
    }

    var cp = 0;
    var penetration = referenceFaceNormal.dot(incidentFace[0]) - refC;

    if (penetration > 0) {
      manifold.contacts[cp] = incidentFace[0];
      manifold.penetration = penetration;
      cp++;
    } else {
      manifold.penetration = 0;
    }

    penetration = referenceFaceNormal.dot(incidentFace[1]) - refC;

    if (penetration > 0) {
      manifold.contacts[cp] = incidentFace[1];
      manifold.penetration += penetration;
      cp++;
      manifold.penetration /= cp;
    }

    manifold.contactCount = cp;
  };

  CollisionPolygonPolygon.prototype.findAxisLeastPenetration = function (faceIndex, polyA, bodyA, polyB, bodyB) {
    var bestDistance = -Number.MAX_VALUE;
    var bestIndex = 0;

    for (var i = 0; i < polyA.vertexCount; i++) {
      var normal = polyA.normals[i];
      var worldNormal = normal.rotate(bodyA.orientation);
      var bSpaceNormal = worldNormal.rotate(-bodyB.orientation);
      var support = polyB.getSupport(bSpaceNormal.neg());
      var bSpaceVertex = polyA.vertices[i].rotate(bodyA.orientation).add(bodyA.position).sub(bodyB.position).rotate(-bodyB.orientation);
      var dot = bSpaceNormal.dot(support.sub(bSpaceVertex));

      if (dot > bestDistance) {
        bestDistance = dot;
        bestIndex = i;
      }
    }

    faceIndex[0] = bestIndex;
    return bestDistance;
  };

  CollisionPolygonPolygon.prototype.findIncidentFace = function (v, refPoly, refBody, incPoly, incBody, referenceIndex) {
    var referenceNormal = refPoly.normals[referenceIndex];
    referenceNormal = referenceNormal.rotate(refBody.orientation).rotate(-incBody.orientation);
    var incidentFace = 0;
    var minDot = Number.MAX_VALUE;

    for (var i = 0; i < incPoly.vertexCount; i++) {
      var dot = referenceNormal.dot(incPoly.normals[i]);

      if (dot < minDot) {
        minDot = dot;
        incidentFace = i;
      }
    }

    v[0] = incPoly.vertices[incidentFace].rotate(incBody.orientation).add(incBody.position);
    incidentFace = (incidentFace + 1) % incPoly.vertexCount;
    v[1] = incPoly.vertices[incidentFace].rotate(incBody.orientation).add(incBody.position);
  };

  CollisionPolygonPolygon.prototype.clip = function (n, c, face) {
    var sp = 0;
    var out = [face[0], face[1]];
    var d1 = n.dot(face[0]) - c;
    var d2 = n.dot(face[1]) - c;

    if (d1 <= 0) {
      out[sp] = face[0];
      sp += 1;
    }

    if (d2 <= 0) {
      out[sp] = face[1];
      sp += 1;
    }

    if (d1 * d2 < 0) {
      var a = d1 / (d1 - d2);
      out[sp] = face[1].sub(face[0]).mult(a).add(face[0]);
      sp += 1;
    }

    face[0] = out[0];
    face[1] = out[1];

    if (sp == 3) {
      throw "ClipError: sp == 3";
    }

    return sp;
  };

  return CollisionPolygonPolygon;
}();

exports.CollisionPolygonPolygon = CollisionPolygonPolygon;
},{"./vector":"vector.ts"}],"collisions.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var vector_1 = require("./vector");

var shapes_1 = require("./shapes");

var collision_circle_circle_1 = require("./collision_circle_circle");

var collision_circle_polygon_1 = require("./collision_circle_polygon");

var collision_polygon_polygon_1 = require("./collision_polygon_polygon");

var CR = [null, null, null, null, new collision_circle_circle_1.CollisionCircleCircle(), new collision_circle_polygon_1.CollisionCirclePolygon(), null, new collision_circle_polygon_1.CollisionPolygonCircle(), new collision_polygon_polygon_1.CollisionPolygonPolygon()];
var min = Math.min;
var max = Math.max;
var PENETRATION_ALLOWANCE = 0.05;
var PENETRATION_CORRECTION = 0.4;

var Manifold = function () {
  function Manifold(a, b) {
    this.a = a;
    this.b = b;
    this.penetration = 0;
    this.normal = new vector_1.Vector();
    this.contacts = [];
    this.contactCount = 0;
    this.e = 0;
    this.df = 0;
    this.sf = 0;
  }

  Manifold.prototype.solve = function () {
    var aShape = this.a.shape.type;
    var bShape = this.b.shape.type;
    var handler = CR[aShape * shapes_1.SHAPE_COUNT + bShape];

    if (handler !== null) {
      handler.handleCollision(this, this.a, this.b);
    } else {
      throw new Error("No handler for types " + aShape + " and " + bShape);
    }
  };

  Manifold.prototype.initialize = function () {
    this.e = min(this.a.restitution, this.b.restitution);

    for (var i = 0; i < this.contacts.length; i++) {
      var ra = this.contacts[i].sub(this.a.position);
      var rb = this.contacts[i].sub(this.b.position);
      var rv = this.b.velocity.add(rb.scalarCross(this.b.angularVelocity)).sub(this.a.velocity).sub(ra.scalarCross(this.a.angularVelocity));

      if (rv.lengthSquared() < new vector_1.Vector(0, 4).mult(1 / 30).lengthSquared() + 0.0001) {
        this.e = 0;
      }
    }
  };

  Manifold.prototype.applyImpulse = function () {
    var a = this.a;
    var b = this.b;

    if (a.invMass === 0 && b.invMass === 0) {
      print("here");
      a.velocity = new vector_1.Vector();
      b.velocity = new vector_1.Vector();
    }

    for (var i = 0; i < this.contacts.length; i++) {
      var ra = this.contacts[i].sub(this.a.position);
      var rb = this.contacts[i].sub(this.b.position);
      var rv = this.b.velocity.add(rb.scalarCross(this.b.angularVelocity)).sub(this.a.velocity).sub(ra.scalarCross(this.a.angularVelocity));
      var contactVelocity = rv.dot(this.normal);

      if (contactVelocity > 0) {
        return;
      }

      var raCrossN = ra.cross(this.normal);
      var rbCrossN = rb.cross(this.normal);
      var invMassSum = a.invMass + b.invMass + raCrossN * raCrossN * a.invInertia + rbCrossN * rbCrossN * b.invInertia;
      var j = -(1.0 + this.e) * contactVelocity;
      j /= invMassSum;
      j /= this.contacts.length;
      var impulse = this.normal.mult(j);
      a.applyImpulse(impulse.neg(), ra);
      b.applyImpulse(impulse, rb);
    }
  };

  Manifold.prototype.positionalCorrection = function () {
    var correction = max(this.penetration - PENETRATION_ALLOWANCE, 0) / (this.a.invMass + this.b.invMass) * PENETRATION_CORRECTION;
    this.a.position = this.a.position.add(this.normal.mult(-this.a.invMass * correction));
    this.b.position = this.b.position.add(this.normal.mult(this.b.invMass * correction));
  };

  return Manifold;
}();

exports.Manifold = Manifold;
},{"./vector":"vector.ts","./shapes":"shapes.ts","./collision_circle_circle":"collision_circle_circle.ts","./collision_circle_polygon":"collision_circle_polygon.ts","./collision_polygon_polygon":"collision_polygon_polygon.ts"}],"sketch.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var vector_1 = require("./vector");

var body_1 = require("./body");

var shapes_1 = require("./shapes");

var collisions_1 = require("./collisions");

exports.sketch = function (p) {
  var fps = 60;
  var dt = 1 / fps;
  var frameStart = 0;
  var accumulator = 0;
  var bodies = [];
  var gravity = new vector_1.Vector(0, 100);
  var mouseBody;

  function testScene() {
    mouseBody = new body_1.Body(shapes_1.Polygon.rect(60, 60));
    mouseBody.position = new vector_1.Vector(0, p.height / 2);
    mouseBody.applyImpulse(new vector_1.Vector(0, 10), new vector_1.Vector(0, 0));
    bodies.push(mouseBody);
    var circle2 = new body_1.Body(shapes_1.Polygon.rect(p.width, 50), 0);
    circle2.position = new vector_1.Vector(p.width / 2, p.height / 2 + 200);
    bodies.push(circle2);
  }

  function randomScene() {
    var width = p.width;
    var height = p.height;
    var random = p.random;
    var wall = new body_1.Body(shapes_1.Polygon.rect(width, 50), 0);
    wall.position = new vector_1.Vector(width / 2, height - 25);
    bodies.push(wall);
    wall = new body_1.Body(shapes_1.Polygon.rect(width, 50), 0);
    wall.position = new vector_1.Vector(width / 2, 25);
    bodies.push(wall);
    wall = new body_1.Body(shapes_1.Polygon.rect(50, height), 0);
    wall.position = new vector_1.Vector(25, height / 2);
    bodies.push(wall);
    wall = new body_1.Body(shapes_1.Polygon.rect(50, height), 0);
    wall.position = new vector_1.Vector(width - 25, height / 2);
    bodies.push(wall);

    for (var i = 0; i < 20; i++) {
      var position = new vector_1.Vector(random(100, width - 200), random(100, height - 200));
      var shape = void 0;
      var r = random(2) | 0;

      if (r == 0) {
        shape = new shapes_1.Circle(random(25, 50));
      } else {
        shape = shapes_1.Polygon.rect(random(50, 100), random(50, 100));
      }

      var body = new body_1.Body(shape);
      body.position = position;
      var velocity = new vector_1.Vector(random(-80, 80), random(-80, 80));
      body.velocity = velocity;
      bodies.push(body);
    }
  }

  p.setup = function () {
    p.ellipseMode(p.RADIUS);
    p.createCanvas(p.windowWidth, p.windowHeight);
    p.frameRate(fps);
    randomScene();
  };

  p.draw = function () {
    p.background(220);
    var currentTime = p.millis() / 1000;
    accumulator += currentTime - frameStart;
    frameStart = currentTime;

    while (accumulator > dt) {
      updatePhysics(dt);
      accumulator -= dt;
    }

    bodies.forEach(function (body) {
      body.draw(p);
    });
  };

  var springBody = null;
  var springPos = null;

  function updatePhysics(dt) {
    var contacts = [];

    for (var i = 0; i < bodies.length; i++) {
      var a = bodies[i];

      for (var j = i + 1; j < bodies.length; j++) {
        var b = bodies[j];

        if (a.invMass == 0 && b.invMass == 0) {
          continue;
        }

        var manifold = new collisions_1.Manifold(a, b);
        manifold.solve();

        if (manifold.contactCount > 0) {
          contacts.push(manifold);
        }
      }
    }

    if (p.mouseIsPressed) {
      var mouse = new vector_1.Vector(p.mouseX, p.mouseY);

      if (springBody == null) {
        for (var i = 0; i < bodies.length; i++) {
          var body = bodies[i];

          if (body.isPointInside(mouse)) {
            springBody = body;
            springPos = mouse.sub(body.position).rotate(-body.orientation);
            break;
          }
        }
      }
    } else {
      springBody = null;
    }

    if (springBody !== null && springPos !== null) {
      var pos = springBody.position;
      var a = springPos.rotate(springBody.orientation).add(springBody.position);
      var delta = new vector_1.Vector(p.mouseX, p.mouseY).sub(a);
      var force = delta.mult(100);
      var damping = springBody.velocity.mult(50);
      springBody.applyImpulse(force.sub(damping), a.sub(springBody.position));
      p.push();
      p.noFill();
      p.stroke("#FF0");
      p.line(a.x, a.y, p.mouseX, p.mouseY);
      p.ellipse(a.x, a.y, 10);
      p.pop();
    }

    for (var i = 0; i < bodies.length; i++) {
      var body = bodies[i];

      if (body.invMass === 0) {
        continue;
      }

      var dts = dt * 0.5;
      body.velocity = body.velocity.add(body.force.mult(body.invMass * dts));
      body.velocity = body.velocity.add(gravity.mult(dts));
      body.angularVelocity += body.torque * body.invInertia * dts;
    }

    for (var i = 0; i < contacts.length; i++) {
      contacts[i].initialize();
    }

    for (var j = 0; j < 10; j++) {
      for (var i = 0; i < contacts.length; i++) {
        contacts[i].applyImpulse();
      }
    }

    for (var i = 0; i < bodies.length; i++) {
      var body = bodies[i];

      if (body.invMass === 0.0) {
        continue;
      }

      body.position = body.position.add(body.velocity.mult(dt));
      body.orientation += body.angularVelocity * dt;
      var dts = dt * 0.5;
      body.velocity = body.velocity.add(body.force.mult(body.invMass * dts));
      body.velocity = body.velocity.add(gravity.mult(dts));
      body.angularVelocity += body.torque * body.invInertia * dts;
    }

    for (var i = 0; i < contacts.length; i++) {
      contacts[i].positionalCorrection();
    }

    for (var i = 0; i < bodies.length; i++) {
      var body = bodies[i];
      body.force.x = 0;
      body.force.y = 0;
      body.torque = 0;
    }
  }
};
},{"./vector":"vector.ts","./body":"body.ts","./shapes":"shapes.ts","./collisions":"collisions.ts"}],"../node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}

module.bundle.Module = Module;
var checkedAssets, assetsToAccept;
var parent = module.bundle.parent;

if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "52281" + '/');

  ws.onmessage = function (event) {
    checkedAssets = {};
    assetsToAccept = [];
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      var handled = false;
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          var didAccept = hmrAcceptCheck(global.parcelRequire, asset.id);

          if (didAccept) {
            handled = true;
          }
        }
      }); // Enable HMR for CSS by default.

      handled = handled || data.assets.every(function (asset) {
        return asset.type === 'css' && asset.generated.js;
      });

      if (handled) {
        console.clear();
        data.assets.forEach(function (asset) {
          hmrApply(global.parcelRequire, asset);
        });
        assetsToAccept.forEach(function (v) {
          hmrAcceptRun(v[0], v[1]);
        });
      } else {
        window.location.reload();
      }
    }

    if (data.type === 'reload') {
      ws.close();

      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);

  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID; // html encode message and stack trace

  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];

      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAcceptCheck(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAcceptCheck(bundle.parent, id);
  }

  if (checkedAssets[id]) {
    return;
  }

  checkedAssets[id] = true;
  var cached = bundle.cache[id];
  assetsToAccept.push([bundle, id]);

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAcceptCheck(global.parcelRequire, id);
  });
}

function hmrAcceptRun(bundle, id) {
  var cached = bundle.cache[id];
  bundle.hotData = {};

  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });

    return true;
  }
}
},{}]},{},["../node_modules/parcel-bundler/src/builtins/hmr-runtime.js","sketch.ts"], null)
//# sourceMappingURL=/sketch.3938edfb.js.map