/// <reference path="../base/InstanceBase.ts" />
/// <reference path="../extension/Dictionary.ts" />
/// <reference path="RenderManager.ts" />


namespace com.once.manager {
  export class TimerManager extends base.InstanceBase {
    private static INSTANCE: TimerManager
    private static POOL: Array<TimerHandler> = new Array<TimerHandler>()

    private _handlers: Array<TimerHandler> = new Array<TimerHandler>()
    private _handlerMap: extension.Dictionary = extension.Dictionary.borrow()

    private _currFrame: number = 0.0

    private _enterFrameIndexNow: number = 0
    private _enterFrameIndexMax: number = 0
    constructor() {
      super()
      RenderManager.instance.on(this.enterFrame, this)
    }

    static get instance(): TimerManager {
      return TimerManager.INSTANCE || (TimerManager.INSTANCE = base.InstanceBase.getInstance(TimerManager))
    }
    /**
     * 清理定时器
     * @param key
     * @param thisObjOfKey
     */
    off(key: Function, thisObjOfKey: any): void {
      if (key == null) {
        return
      }
      let handler: TimerHandler = this._handlerMap.del(key, thisObjOfKey)
      if (handler == null) {
        let temp: TimerHandler
        this._handlerMap.for((handlerKey: string): boolean => {
          temp = this._handlerMap.get(handlerKey)
          if (temp.handler === key && temp.handlerThisObject === thisObjOfKey) {
            this._handlerMap.del(handlerKey)
            handler = temp
            return false
          }
          return true
        })
      }
      if (handler != null) {
        let delIndex: number = this._handlers.indexOf(handler)
        if (delIndex > -1) {
          this._handlers.splice(delIndex, 1)
          this._enterFrameIndexMax--
          if (this._enterFrameIndexNow > 0) {
            this._enterFrameIndexNow--
          }
        }
        handler.clear()
        TimerManager.POOL.push(handler)
      }
    }
    /**
     * 定时执行一次
     * @param delay  延迟时间(单位毫秒)
     * @param handler 结束时的回调方法
     * @param handlerThisObject
     * @param handlerArgs   回调参数
     * @param callBackImmediately  是否覆盖(true:同方法多次计时，后者覆盖前者。false:同方法多次计时，不相互覆盖) callBackImmediately=true时返回回调函数本身，cover=false时，返回唯一ID，均用来作为clearTimer的参数
     */
    once(delay: number, handler: Function, handlerThisObject: any, handlerArgs?: any[], callBackImmediately: boolean = false): void {
      this.create(false, false, delay, handler, handlerThisObject, handlerArgs, callBackImmediately)
    }

    /**
     * 定时重复执行
     * @param delay  延迟时间(单位毫秒)
     * @param handler 结束时的回调方法
     * @param handlerThisObject
     * @param handlerArgs   回调参数
     * @param callBackImmediately  是否覆盖(true:同方法多次计时，后者覆盖前者。false:同方法多次计时，不相互覆盖) callBackImmediately=true时返回回调函数本身，cover=false时，返回唯一ID，均用来作为clearTimer的参数
     */
    on(delay: number, handler: Function, handlerThisObject: any, handlerArgs?: any[], callBackImmediately: boolean = false): void {
      this.create(false, true, delay, handler, handlerThisObject, handlerArgs, callBackImmediately)
    }

    /**
     * 定时执行一次(基于帧率)
     * @param delay  延迟时间(单位毫秒)
     * @param handler 结束时的回调方法
     * @param handlerThisObject
     * @param handlerArgs   回调参数
     * @param callBackImmediately  是否覆盖(true:同方法多次计时，后者覆盖前者。false:同方法多次计时，不相互覆盖) callBackImmediately=true时返回回调函数本身，cover=false时，返回唯一ID，均用来作为clearTimer的参数
     */
    onceByFrame(delay: number, handler: Function, handlerThisObject: any, handlerArgs?: any[], callBackImmediately: boolean = false): void {
      this.create(true, false, delay, handler, handlerThisObject, handlerArgs, callBackImmediately)
    }

    /** 定时重复执行(基于帧率)
     * @param	delay  延迟时间(单位为帧)
     * @param	method 结束时的回调方法
     * @param	args   回调参数
     * @param	callBackImmediately  是否覆盖(true:同方法多次计时，后者覆盖前者。false:同方法多次计时，不相互覆盖)
     * @return  callBackImmediately=true时返回回调函数本身，否则返回唯一ID，均用来作为clearTimer的参数
     */
    onByFrame(delay: number, handler: Function, handlerThisObject: any, handlerArgs?: any[], callBackImmediately: boolean = false): void {
      this.create(true, true, delay, handler, handlerThisObject, handlerArgs, callBackImmediately)
    }
    /**
     * 帧循环
     */
    private enterFrame(): void {
      let handler: Function
      let handlerThisObject: any
      let args: any[]
      let t: number
      let timerHandler: TimerHandler
      this._currFrame++
      this._enterFrameIndexMax = this._handlers.length
      for (this._enterFrameIndexNow = 0; this._enterFrameIndexNow < this._enterFrameIndexMax; this._enterFrameIndexNow++) {
        timerHandler = this._handlers[this._enterFrameIndexNow]
        t = timerHandler.userFrame ? this._currFrame : App.timePast
        if (t >= timerHandler.exeTime) {
          handler = <Function>timerHandler.handler
          handlerThisObject = timerHandler.handlerThisObject
          args = <any[]>timerHandler.handlerArgs
          if (timerHandler.repeat) {
            while (t >= timerHandler.exeTime && timerHandler.repeat) {
              if (timerHandler.handlerThisObject == null) {
                break
              }
              timerHandler.exeTime += timerHandler.delay
              handler.apply(handlerThisObject, args)
            }
          } else {
            this.off(<Function>timerHandler.handler, handlerThisObject)
            handler.apply(handlerThisObject, args)
          }
        }
      }
    }

    private create(useFrame: boolean, repeat: boolean, delay: number, handler: Function, handlerThisObject: any, handlerArgs?: any[], callBackImmediately: boolean = false): void {
      this.off(handler, handlerThisObject)
      let timerHandler: TimerHandler = TimerManager.POOL.length > 0 ? <TimerHandler>TimerManager.POOL.pop() : new TimerHandler()
      timerHandler.userFrame = useFrame
      timerHandler.repeat = repeat
      timerHandler.delay = delay
      timerHandler.handler = handler
      timerHandler.handlerArgs = <any[]>handlerArgs
      timerHandler.handlerThisObject = handlerThisObject
      timerHandler.exeTime = delay + (useFrame ? this._currFrame : App.timePast)
      this._handlers.push(timerHandler)
      this._handlerMap.add(handler, timerHandler, handlerThisObject)
      if (callBackImmediately) {
        timerHandler.excute()
      }
    }
  }

  class TimerHandler {
    /**执行间隔*/
    delay: number = 0
    /**是否重复执行*/
    repeat: boolean = false
    /**是否用帧率*/
    userFrame: boolean = false
    /**执行时间*/
    exeTime: number = 0
    /**处理方法*/
    handler: Function | undefined
    /**处理方法回调参数 */
    handlerArgs: any[] | undefined
    /**处理方法this */
    handlerThisObject: any

    /**清理*/
    clear(): void {
      this.handler = undefined
      this.handlerThisObject = null
      this.handlerArgs = undefined
    }

    excute(): void {
      if (this.handler != null) {
        this.handler.apply(this.handlerThisObject, this.handlerArgs)
      }
    }
  }
}
