"use strict";
var __extends = (this && this.__extends) || (function () {
  var extendStatics = Object.setPrototypeOf ||
    ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
    function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
  return function (d, b) {
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
})();
var com;
(function (com) {
  var once;
  (function (once) {
    var base;
    (function (base) {
      var InstanceBase = (function () {
        function InstanceBase() {
          if (!InstanceBase.CONSTRUCT_ABLE) {
            throw new Error('单例类,请不要直接实例化,通过静态属性instance访问');
          }
          InstanceBase.CONSTRUCT_ABLE = false;
        }
        InstanceBase.getInstance = function (type) {
          InstanceBase.CONSTRUCT_ABLE = true;
          return new type();
        };
        InstanceBase.CONSTRUCT_ABLE = false;
        return InstanceBase;
      }());
      base.InstanceBase = InstanceBase;
    })(base = once.base || (once.base = {}));
  })(once = com.once || (com.once = {}));
})(com || (com = {}));
var com;
(function (com) {
  var once;
  (function (once) {
    var utils;
    (function (utils) {
      var UUID = 0;
      function getUid(target, thisObjOfTarget) {
        if (target != null) {
          if (target.constructor === String || target.constructor === Number) {
            return target;
          }
          if (target['com.once.uid'] == null) {
            UUID++;
            Object.defineProperty(target, 'com.once.uid', {
              value: 'com.once.uid' + UUID,
              writable: false,
              configurable: false,
              enumerable: false,
            });
          }
          if (thisObjOfTarget != null) {
            if (thisObjOfTarget['com.once.uid'] == null) {
              UUID++;
              Object.defineProperty(thisObjOfTarget, 'com.once.uid', {
                value: 'com.once.uid' + UUID,
                writable: false,
                configurable: false,
                enumerable: false,
              });
            }
            return thisObjOfTarget['com.once.uid'] + '_' + target['com.once.uid'];
          }
          return target['com.once.uid'];
        }
        throw new Error('uid生成失败');
      }
      utils.getUid = getUid;
    })(utils = once.utils || (once.utils = {}));
  })(once = com.once || (com.once = {}));
})(com || (com = {}));
var com;
(function (com) {
  var once;
  (function (once) {
    var base;
    (function (base) {
      var PoolBase = (function () {
        function PoolBase() {
          this._borrowed = false;
          if (!PoolBase.CONSTRUCT_ABLE) {
            throw new Error('该对象受自身的对象池管理,请用静态方法"borrow()"实例化对象,实例的"return()"方法回收对象');
          }
          PoolBase.CONSTRUCT_ABLE = false;
        }
        PoolBase.getInstance = function (type) {
          var uid = once.utils.getUid(type);
          var pool = PoolBase.DIC_POOL[uid];
          if (pool == null) {
            pool = [];
            PoolBase.DIC_POOL[uid] = pool;
          }
          var target = pool.pop();
          if (target == null) {
            PoolBase.CONSTRUCT_ABLE = true;
            target = new type();
          }
          target._borrowed = true;
          return target;
        };
        PoolBase.prototype.return = function () {
          if (this._borrowed) {
            this._borrowed = false;
            var cls = this['constructor'];
            var uid = once.utils.getUid(cls);
            var pool = PoolBase.DIC_POOL[uid];
            if (pool != null) {
              pool.push(this);
            }
          }
        };
        PoolBase.CONSTRUCT_ABLE = false;
        PoolBase.DIC_POOL = {};
        return PoolBase;
      }());
      base.PoolBase = PoolBase;
    })(base = once.base || (once.base = {}));
  })(once = com.once || (com.once = {}));
})(com || (com = {}));
var com;
(function (com) {
  var once;
  (function (once) {
    var extension;
    (function (extension) {
      var Method = (function (_super) {
        __extends(Method, _super);
        function Method() {
          return _super.call(this) || this;
        }
        Method.prototype.excute = function () {
          if (!this._borrowed) {
            throw new Error('!borrowed');
          }
          this._handler.apply(this._handlerThisObj, this._args);
        };
        Method.prototype.excuteWith = function () {
          var args = [];
          for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
          }
          if (!this._borrowed) {
            throw new Error('!borrowed');
          }
          this._handler.apply(this._handlerThisObj, this._args.concat(args));
        };
        Method.prototype.return = function () {
          if (this._borrowed) {
            this._handler = undefined;
            if (this._args != null) {
              this._args.length = 0;
            }
            this._args = undefined;
            this._handlerThisObj = null;
            _super.prototype.return.call(this);
          }
        };
        Object.defineProperty(Method.prototype, "thisObj", {
          get: function () {
            return this._handlerThisObj;
          },
          enumerable: true,
          configurable: true
        });
        Object.defineProperty(Method.prototype, "handler", {
          get: function () {
            return this._handler;
          },
          enumerable: true,
          configurable: true
        });
        Object.defineProperty(Method.prototype, "args", {
          get: function () {
            return this._args;
          },
          enumerable: true,
          configurable: true
        });
        Method.prototype.updateArgs = function (value) {
          if (this._borrowed) {
            this._args = value.concat();
          }
        };
        return Method;
      }(once.base.PoolBase));
      extension.Method = Method;
      var MethodUnAutoGc = (function (_super) {
        __extends(MethodUnAutoGc, _super);
        function MethodUnAutoGc() {
          return _super.call(this) || this;
        }
        MethodUnAutoGc.borrow = function (handler, thisObj) {
          var args = [];
          for (var _i = 2; _i < arguments.length; _i++) {
            args[_i - 2] = arguments[_i];
          }
          var method = once.base.PoolBase.getInstance(MethodUnAutoGc);
          method._handler = handler;
          method._args = args;
          method._handlerThisObj = thisObj;
          return method;
        };
        return MethodUnAutoGc;
      }(Method));
      extension.MethodUnAutoGc = MethodUnAutoGc;
      var MethodAutoGc = (function (_super) {
        __extends(MethodAutoGc, _super);
        function MethodAutoGc() {
          var _this = _super.call(this) || this;
          _this._excuteCount = 0;
          _this._excutedCount = 0;
          return _this;
        }
        MethodAutoGc.borrow = function (handler, thisObj, excuteCount) {
          if (excuteCount === void 0) { excuteCount = 1; }
          var args = [];
          for (var _i = 3; _i < arguments.length; _i++) {
            args[_i - 3] = arguments[_i];
          }
          var method = once.base.PoolBase.getInstance(MethodAutoGc);
          method._excuteCount = excuteCount;
          method._handler = handler;
          method._handlerThisObj = thisObj;
          method._excutedCount = 0;
          method._args = args;
          return method;
        };
        MethodAutoGc.prototype.excute = function () {
          if (this.returnAfterExcute) {
            _super.prototype.excute.apply(this);
            this.return();
          }
          else {
            _super.prototype.excute.apply(this);
          }
        };
        MethodAutoGc.prototype.excuteWith = function () {
          var args = [];
          for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
          }
          if (this.returnAfterExcute) {
            _super.prototype.excuteWith.apply(this, args);
            this.return();
          }
          else {
            _super.prototype.excuteWith.apply(this, args);
          }
        };
        Object.defineProperty(MethodAutoGc.prototype, "returnAfterExcute", {
          get: function () {
            if (this._excuteCount > 0) {
              this._excutedCount++;
              if (this._excutedCount > this._excuteCount) {
                throw new Error('endless loop!  may be you need "MethodUnAutoGc" to Replace "MethodAutoGc"');
              }
              else if (this._excutedCount === this._excuteCount) {
                return true;
              }
              return false;
            }
            return true;
          },
          enumerable: true,
          configurable: true
        });
        return MethodAutoGc;
      }(Method));
      extension.MethodAutoGc = MethodAutoGc;
    })(extension = once.extension || (once.extension = {}));
  })(once = com.once || (com.once = {}));
})(com || (com = {}));
var com;
(function (com) {
  var once;
  (function (once) {
    var extension;
    (function (extension) {
      var Dictionary = (function (_super) {
        __extends(Dictionary, _super);
        function Dictionary() {
          var _this = _super.call(this) || this;
          _this._length = 0;
          _this._record = {};
          return _this;
        }
        Dictionary.borrow = function () {
          return once.base.PoolBase.getInstance(Dictionary);
        };
        Dictionary.prototype.return = function () {
          if (this._borrowed) {
            this.clear();
            _super.prototype.return.call(this);
          }
        };
        Dictionary.prototype.add = function (key, value, thisObjOfKey, cover) {
          if (cover === void 0) { cover = false; }
          if (value == null || key == null) {
            return false;
          }
          if (key instanceof Array) {
            if (key.length > 1) {
              var keySub = key.shift();
              var dicSub = this.get(keySub, thisObjOfKey);
              if (dicSub == null) {
                dicSub = Dictionary.borrow();
                this.add(keySub, dicSub, thisObjOfKey);
              }
              return dicSub.add(key, value, thisObjOfKey, cover);
            }
            else {
              return this.add(key.pop(), value, thisObjOfKey, cover);
            }
          }
          else {
            var added = false;
            var uid = (key.constructor === String || key.constructor === Number) ? key.toString() : once.utils.getUid(key, thisObjOfKey);
            var valueOld = this._record[uid];
            if (valueOld == null) {
              this._record[uid] = value;
              this._length++;
              added = true;
            }
            else if (cover && value !== valueOld) {
              if (valueOld.constructor === Dictionary) {
                valueOld.return();
              }
              else if (valueOld instanceof extension.Method) {
                valueOld.return();
              }
              this._record[uid] = value;
              added = true;
            }
            return added;
          }
        };
        Dictionary.prototype.update = function (key, value, thisObjOfKey) {
          if (key != null) {
            if (key instanceof Array) {
              if (key.length > 1) {
                var dicSub = this.get(key.shift(), thisObjOfKey);
                if (dicSub != null) {
                  dicSub.update(key, value, thisObjOfKey);
                }
              }
              else {
                this.update(key.pop(), value, thisObjOfKey);
              }
            }
            else {
              var uid = once.utils.getUid(key, thisObjOfKey);
              if (this._record[uid] != null) {
                this._record[uid] = value;
              }
            }
          }
        };
        Dictionary.prototype.get = function (key, thisObjOfKey) {
          if (key != null) {
            if (key instanceof Array) {
              if (key.length > 1) {
                var dicSub = this.get(key.shift());
                if (dicSub != null) {
                  return dicSub.get(key);
                }
                else {
                  return null;
                }
              }
              else {
                return this.get(key.shift());
              }
            }
            else {
              var uid = (key.constructor === String || key.constructor === Number) ? key.toString() : once.utils.getUid(key, thisObjOfKey);
              return this._record[uid];
            }
          }
          return null;
        };
        Dictionary.prototype.del = function (key, thisObjOfKey) {
          if (key != null) {
            if (key instanceof Array) {
              if (key.length > 1) {
                var dicSub = this.del(key.shift(), thisObjOfKey);
                if (dicSub != null) {
                  var valueSub = dicSub.del(key, thisObjOfKey);
                  dicSub.return();
                  return valueSub;
                }
              }
              else {
                return this.del(key.pop(), thisObjOfKey);
              }
            }
            else {
              var uid = (key.constructor === String || key.constructor === Number) ? key.toString() : once.utils.getUid(key, thisObjOfKey);
              var value = this._record[uid];
              delete this._record[uid];
              if (value != null) {
                this._length--;
              }
              return value;
            }
          }
          return null;
        };
        Dictionary.prototype.clear = function () {
          var uid;
          var value;
          for (uid in this._record) {
            value = this._record[uid];
            delete this._record[uid];
            if (value.constructor === Dictionary) {
              value.return();
            }
          }
          this._length = 0;
        };
        Dictionary.prototype.forEach = function (callBack, thisObjOfCallBack) {
          var key;
          var value;
          for (key in this._record) {
            value = this._record[key];
            if (!callBack.apply(thisObjOfCallBack, [value])) {
              return;
            }
          }
        };
        Dictionary.prototype.for = function (callBack, thisObjOfCallBack) {
          var key;
          for (key in this._record) {
            if (!callBack.apply(thisObjOfCallBack, [key])) {
              return;
            }
          }
        };
        Dictionary.prototype.pop = function () {
          var key;
          for (key in this._record) {
            return this.del(key);
          }
        };
        Object.defineProperty(Dictionary.prototype, "length", {
          get: function () {
            return this._length;
          },
          enumerable: true,
          configurable: true
        });
        Dictionary.TEMP_KEYS = [];
        return Dictionary;
      }(once.base.PoolBase));
      extension.Dictionary = Dictionary;
    })(extension = once.extension || (once.extension = {}));
  })(once = com.once || (com.once = {}));
})(com || (com = {}));
var com;
(function (com) {
  var once;
  (function (once) {
    var manager;
    (function (manager) {
      var RenderManager = (function (_super) {
        __extends(RenderManager, _super);
        function RenderManager() {
          var _this = _super.call(this) || this;
          _this._listEnterFrameCallBack = [];
          _this._dicEnterFrameCallBack = once.extension.Dictionary.borrow();
          setInterval(function () {
            _this.enterFrame();
          }, RenderManager.secPerFrame);
          return _this;
        }
        Object.defineProperty(RenderManager, "instance", {
          get: function () {
            return RenderManager.INSTANCE || (RenderManager.INSTANCE = once.base.InstanceBase.getInstance(RenderManager));
          },
          enumerable: true,
          configurable: true
        });
        RenderManager.prototype.on = function (callback, callbackThisObj, callbackArgs, callBackImmediately) {
          if (callBackImmediately === void 0) { callBackImmediately = true; }
          if (this._dicEnterFrameCallBack.get(callback, callbackThisObj) == null) {
            var method = once.extension.MethodUnAutoGc.borrow(callback, callbackThisObj);
            if (callbackArgs != null) {
              method.updateArgs(callbackArgs);
            }
            this._dicEnterFrameCallBack.add(callback, method, callbackThisObj);
            this._listEnterFrameCallBack.push(method);
          }
          if (callBackImmediately) {
            callback.apply(callbackThisObj, callbackArgs);
          }
        };
        RenderManager.prototype.off = function (handler, thisObj) {
          var _this = this;
          var method = this._dicEnterFrameCallBack.del(handler, thisObj);
          if (method == null) {
            var temp_1;
            this._dicEnterFrameCallBack.for(function (mapKey) {
              temp_1 = _this._dicEnterFrameCallBack.get(mapKey);
              if (temp_1.handler === handler && temp_1.thisObj === thisObj) {
                _this._dicEnterFrameCallBack.del(mapKey);
                method = temp_1;
                return false;
              }
              return true;
            });
          }
          if (method != null) {
            method.return();
            this._listEnterFrameCallBack.splice(this._listEnterFrameCallBack.indexOf(method), 1);
          }
        };
        RenderManager.prototype.enterFrame = function () {
          this._listEnterFrameCallBack.forEach(function (callBack) {
            callBack.excute();
          });
        };
        RenderManager.frameRate = 60;
        RenderManager.secPerFrame = 1000 / RenderManager.frameRate;
        return RenderManager;
      }(once.base.InstanceBase));
      manager.RenderManager = RenderManager;
    })(manager = once.manager || (once.manager = {}));
  })(once = com.once || (com.once = {}));
})(com || (com = {}));
var com;
(function (com) {
  var once;
  (function (once) {
    var manager;
    (function (manager) {
      var TimerManager = (function (_super) {
        __extends(TimerManager, _super);
        function TimerManager() {
          var _this = _super.call(this) || this;
          _this._handlers = new Array();
          _this._handlerMap = once.extension.Dictionary.borrow();
          _this._currFrame = 0.0;
          _this._enterFrameIndexNow = 0;
          _this._enterFrameIndexMax = 0;
          manager.RenderManager.instance.on(_this.enterFrame, _this);
          return _this;
        }
        Object.defineProperty(TimerManager, "instance", {
          get: function () {
            return TimerManager.INSTANCE || (TimerManager.INSTANCE = once.base.InstanceBase.getInstance(TimerManager));
          },
          enumerable: true,
          configurable: true
        });
        TimerManager.prototype.off = function (key, thisObjOfKey) {
          var _this = this;
          if (key == null) {
            return;
          }
          var handler = this._handlerMap.del(key, thisObjOfKey);
          if (handler == null) {
            var temp_2;
            this._handlerMap.for(function (handlerKey) {
              temp_2 = _this._handlerMap.get(handlerKey);
              if (temp_2.handler === key && temp_2.handlerThisObject === thisObjOfKey) {
                _this._handlerMap.del(handlerKey);
                handler = temp_2;
                return false;
              }
              return true;
            });
          }
          if (handler != null) {
            var delIndex = this._handlers.indexOf(handler);
            if (delIndex > -1) {
              this._handlers.splice(delIndex, 1);
              this._enterFrameIndexMax--;
              if (this._enterFrameIndexNow > 0) {
                this._enterFrameIndexNow--;
              }
            }
            handler.clear();
            TimerManager.POOL.push(handler);
          }
        };
        TimerManager.prototype.once = function (delay, handler, handlerThisObject, handlerArgs, callBackImmediately) {
          if (callBackImmediately === void 0) { callBackImmediately = false; }
          this.create(false, false, delay, handler, handlerThisObject, handlerArgs, callBackImmediately);
        };
        TimerManager.prototype.on = function (delay, handler, handlerThisObject, handlerArgs, callBackImmediately) {
          if (callBackImmediately === void 0) { callBackImmediately = false; }
          this.create(false, true, delay, handler, handlerThisObject, handlerArgs, callBackImmediately);
        };
        TimerManager.prototype.onceByFrame = function (delay, handler, handlerThisObject, handlerArgs, callBackImmediately) {
          if (callBackImmediately === void 0) { callBackImmediately = false; }
          this.create(true, false, delay, handler, handlerThisObject, handlerArgs, callBackImmediately);
        };
        TimerManager.prototype.onByFrame = function (delay, handler, handlerThisObject, handlerArgs, callBackImmediately) {
          if (callBackImmediately === void 0) { callBackImmediately = false; }
          this.create(true, true, delay, handler, handlerThisObject, handlerArgs, callBackImmediately);
        };
        TimerManager.prototype.enterFrame = function () {
          var handler;
          var handlerThisObject;
          var args;
          var t;
          var timerHandler;
          this._currFrame++;
          this._enterFrameIndexMax = this._handlers.length;
          for (this._enterFrameIndexNow = 0; this._enterFrameIndexNow < this._enterFrameIndexMax; this._enterFrameIndexNow++) {
            timerHandler = this._handlers[this._enterFrameIndexNow];
            t = timerHandler.userFrame ? this._currFrame : once.App.timePast;
            if (t >= timerHandler.exeTime) {
              handler = timerHandler.handler;
              handlerThisObject = timerHandler.handlerThisObject;
              args = timerHandler.handlerArgs;
              if (timerHandler.repeat) {
                while (t >= timerHandler.exeTime && timerHandler.repeat) {
                  if (timerHandler.handlerThisObject == null) {
                    break;
                  }
                  timerHandler.exeTime += timerHandler.delay;
                  handler.apply(handlerThisObject, args);
                }
              }
              else {
                this.off(timerHandler.handler, handlerThisObject);
                handler.apply(handlerThisObject, args);
              }
            }
          }
        };
        TimerManager.prototype.create = function (useFrame, repeat, delay, handler, handlerThisObject, handlerArgs, callBackImmediately) {
          if (callBackImmediately === void 0) { callBackImmediately = false; }
          this.off(handler, handlerThisObject);
          var timerHandler = TimerManager.POOL.length > 0 ? TimerManager.POOL.pop() : new TimerHandler();
          timerHandler.userFrame = useFrame;
          timerHandler.repeat = repeat;
          timerHandler.delay = delay;
          timerHandler.handler = handler;
          timerHandler.handlerArgs = handlerArgs;
          timerHandler.handlerThisObject = handlerThisObject;
          timerHandler.exeTime = delay + (useFrame ? this._currFrame : once.App.timePast);
          this._handlers.push(timerHandler);
          this._handlerMap.add(handler, timerHandler, handlerThisObject);
          if (callBackImmediately) {
            timerHandler.excute();
          }
        };
        TimerManager.POOL = new Array();
        return TimerManager;
      }(once.base.InstanceBase));
      manager.TimerManager = TimerManager;
      var TimerHandler = (function () {
        function TimerHandler() {
          this.delay = 0;
          this.repeat = false;
          this.userFrame = false;
          this.exeTime = 0;
        }
        TimerHandler.prototype.clear = function () {
          this.handler = undefined;
          this.handlerThisObject = null;
          this.handlerArgs = undefined;
        };
        TimerHandler.prototype.excute = function () {
          if (this.handler != null) {
            this.handler.apply(this.handlerThisObject, this.handlerArgs);
          }
        };
        return TimerHandler;
      }());
    })(manager = once.manager || (once.manager = {}));
  })(once = com.once || (com.once = {}));
})(com || (com = {}));
var com;
(function (com) {
  var once;
  (function (once_1) {
    var manager;
    (function (manager) {
      var NoticeManager = (function (_super) {
        __extends(NoticeManager, _super);
        function NoticeManager() {
          var _this = _super !== null && _super.apply(this, arguments) || this;
          _this._noticeMap = once_1.extension.Dictionary.borrow();
          return _this;
        }
        Object.defineProperty(NoticeManager, "instance", {
          get: function () {
            return NoticeManager.INSTANCE || (NoticeManager.INSTANCE = once_1.base.InstanceBase.getInstance(NoticeManager));
          },
          enumerable: true,
          configurable: true
        });
        NoticeManager.prototype.on = function (noticeTag, callback, callbackThisObj) {
          var callBackArgs = [];
          for (var _i = 3; _i < arguments.length; _i++) {
            callBackArgs[_i - 3] = arguments[_i];
          }
          return this.register(noticeTag, callback, callbackThisObj, callBackArgs);
        };
        NoticeManager.prototype.onPrev = function (noticeTag, callback, callbackThisObj) {
          var callBackArgs = [];
          for (var _i = 3; _i < arguments.length; _i++) {
            callBackArgs[_i - 3] = arguments[_i];
          }
          return this.register(noticeTag, callback, callbackThisObj, callBackArgs, false, true);
        };
        NoticeManager.prototype.once = function (noticeTag, callback, callbackThisObj) {
          var callbackArgs = [];
          for (var _i = 3; _i < arguments.length; _i++) {
            callbackArgs[_i - 3] = arguments[_i];
          }
          return this.register(noticeTag, callback, callbackThisObj, callbackArgs, true);
        };
        NoticeManager.prototype.oncePrev = function (noticeTag, callback, callbackThisObj) {
          var callbackArgs = [];
          for (var _i = 3; _i < arguments.length; _i++) {
            callbackArgs[_i - 3] = arguments[_i];
          }
          return this.register(noticeTag, callback, callbackThisObj, callbackArgs, true, true);
        };
        NoticeManager.prototype.off = function (noticeTag, callback, callbackThisObj) {
          var callBackMap = this._noticeMap.get(noticeTag);
          if (callBackMap != null) {
            var handler = callBackMap.del(callback, callbackThisObj);
            if (handler != null) {
              handler.return();
            }
          }
          return this;
        };
        NoticeManager.prototype.offPrev = function (noticeTag, callback, callbackThisObj) {
          var uuid = once_1.utils.getUid(noticeTag);
          return this.off('prev' + uuid, callback, callbackThisObj);
        };
        NoticeManager.prototype.dispatch = function (noticeTag) {
          var args = [];
          for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
          }
          var uid = once_1.utils.getUid(noticeTag);
          var handlerMap = this._noticeMap.get('prev' + uid);
          if (handlerMap != null) {
            this.dispatchExcute('prev' + uid, handlerMap, args);
          }
          handlerMap = this._noticeMap.get(uid);
          if (handlerMap) {
            this.dispatchExcute(uid, handlerMap, args);
          }
        };
        NoticeManager.prototype.dispatchExcute = function (uuid, handlerMap, args) {
          handlerMap.forEach(function (handler) {
            handler.excute(args, handlerMap);
            return true;
          }, this);
          if (handlerMap.length === 0) {
            this._noticeMap.del(uuid);
            handlerMap.return();
          }
        };
        NoticeManager.prototype.register = function (noticeTag, callback, callbackThisObj, callBackArgs, once, prev) {
          if (once === void 0) { once = false; }
          if (prev === void 0) { prev = false; }
          var uuid = prev ? 'prev' + once_1.utils.getUid(noticeTag) : once_1.utils.getUid(noticeTag);
          var callBackMap = this._noticeMap.get(uuid);
          if (callBackMap == null) {
            callBackMap = once_1.extension.Dictionary.borrow();
            this._noticeMap.add(uuid, callBackMap);
          }
          else if (callBackMap.get(callback, callbackThisObj) != null) {
            return this;
          }
          var handler = Handler.borrow().update(callback, callbackThisObj, callBackArgs, once);
          callBackMap.add(callback, handler, callbackThisObj);
          return this;
        };
        return NoticeManager;
      }(once_1.base.InstanceBase));
      manager.NoticeManager = NoticeManager;
      var Handler = (function (_super) {
        __extends(Handler, _super);
        function Handler() {
          var _this = _super !== null && _super.apply(this, arguments) || this;
          _this._once = false;
          return _this;
        }
        Handler.borrow = function () {
          return once_1.base.PoolBase.getInstance(Handler);
        };
        Handler.prototype.update = function (callback, callbackThisObj, args, once) {
          this._callBack = callback;
          this._callBackThisObj = callbackThisObj;
          this._args = args;
          this._once = once;
          return this;
        };
        Handler.prototype.return = function () {
          if (this._borrowed) {
            this._callBack = undefined;
            this._callBackThisObj = null;
            this._args = undefined;
            _super.prototype.return.call(this);
          }
        };
        Handler.prototype.excute = function (args, mapContainer) {
          var _this = this;
          if (this._once) {
            if (mapContainer.del(this._callBack, this._callBackThisObj) == null) {
              mapContainer.for(function (key) {
                if (mapContainer.get(key) === _this) {
                  mapContainer.del(key);
                  return false;
                }
                return true;
              });
            }
          }
          this._callBack.apply(this._callBackThisObj, this._args != null ? this._args.concat(args) : args);
          if (this._once) {
            this.return();
          }
        };
        return Handler;
      }(once_1.base.PoolBase));
    })(manager = once_1.manager || (once_1.manager = {}));
  })(once = com.once || (com.once = {}));
})(com || (com = {}));
var com;
(function (com) {
  var once;
  (function (once) {
    var App = (function () {
      function App() {
      }
      Object.defineProperty(App, "timePast", {
        get: function () {
          return Date.now() - App.startTime;
        },
        enumerable: true,
        configurable: true
      });
      Object.defineProperty(App, "nowTime", {
        get: function () {
          return Date.now();
        },
        enumerable: true,
        configurable: true
      });
      App.onHide = function (handler, thisObj) {
        var args = [];
        for (var _i = 2; _i < arguments.length; _i++) {
          args[_i - 2] = arguments[_i];
        }
        var method = App.mapCbWhileHide.get(handler, thisObj);
        if (method == null) {
          method = once.extension.MethodUnAutoGc.borrow(handler, thisObj);
          method.updateArgs(args);
          App.mapCbWhileHide.add(handler, method);
        }
      };
      App.offHide = function (handler, thisObj) {
        var method = App.mapCbWhileHide.del(handler, thisObj);
        if (method != null) {
          method.return();
        }
      };
      App.onShow = function (handler, thisObj) {
        var args = [];
        for (var _i = 2; _i < arguments.length; _i++) {
          args[_i - 2] = arguments[_i];
        }
        var method = App.mapCbWhileShow.get(handler, thisObj);
        if (method == null) {
          method = once.extension.MethodUnAutoGc.borrow(handler, thisObj);
          method.updateArgs(args);
          App.mapCbWhileShow.add(handler, method);
        }
      };
      App.offShow = function (handler, thisObj) {
        var method = App.mapCbWhileShow.del(handler, thisObj);
        if (method != null) {
          method.return();
        }
      };
      App.hide = function () {
        if (!App.isBackground) {
          App.isBackground = true;
          App.mapCbWhileHide.forEach(function (callBack) {
            callBack.excute();
            return true;
          });
        }
      };
      App.show = function () {
        if (App.isBackground) {
          App.isBackground = false;
          App.mapCbWhileShow.forEach(function (callBack) {
            callBack.excute();
            return true;
          });
        }
      };
      Object.defineProperty(App, "inBackground", {
        get: function () {
          return App.isBackground;
        },
        enumerable: true,
        configurable: true
      });
      App.timer = once.manager.TimerManager.instance;
      App.render = once.manager.RenderManager.instance;
      App.notice = once.manager.NoticeManager.instance;
      App.startTime = Date.now();
      App.mapCbWhileHide = once.extension.Dictionary.borrow();
      App.mapCbWhileShow = once.extension.Dictionary.borrow();
      App.isBackground = false;
      return App;
    }());
    once.App = App;
  })(once = com.once || (com.once = {}));
})(com || (com = {}));
module.exports = com
