/// <reference path="../base/InstanceBase.ts" />
/// <reference path="../extension/Method.ts" />
/// <reference path="../extension/Dictionary.ts" />

namespace com.once.manager {
  export class RenderManager extends base.InstanceBase {
    /**帧频 */
    static readonly frameRate: number = 60
    /**每帧消耗的时间(ms) */
    static readonly secPerFrame: number = 1000 / RenderManager.frameRate
    private static INSTANCE: RenderManager
    /**每帧回调函数列表 */
    private readonly _listEnterFrameCallBack: Array<extension.MethodUnAutoGc> = []
    /**每帧回调函数字典(主要用于检测处理函数是否重复添加) */
    private readonly _dicEnterFrameCallBack: extension.Dictionary = extension.Dictionary.borrow()

    constructor() {
      super()
      // 启动轮询
      setInterval(() => {
        this.enterFrame()
      }, RenderManager.secPerFrame)
    }

    static get instance(): RenderManager {
      return RenderManager.INSTANCE || (RenderManager.INSTANCE = base.InstanceBase.getInstance(RenderManager))
    }
    /**
     * 注册一个帧循环回调
     * @param callback 回调函数
     * @param callbackThisObj 回调函数this指向
     * @param callbackArgs 回调函数参数
     * @param callBackImmediately 是否立即执行一次回调
     */
    on(callback: Function, callbackThisObj: any, callbackArgs?: any[], callBackImmediately: boolean = true): void {
      if (this._dicEnterFrameCallBack.get(callback, callbackThisObj) == null) {
        const method: extension.MethodUnAutoGc = extension.MethodUnAutoGc.borrow(callback, callbackThisObj)
        if (callbackArgs != null) {
          method.updateArgs(callbackArgs)
        }
        this._dicEnterFrameCallBack.add(callback, method, callbackThisObj)
        this._listEnterFrameCallBack.push(method)
      }
      if (callBackImmediately) {
        callback.apply(callbackThisObj, callbackArgs)
      }
    }
    /**
     * 删除一个帧循环回调
     * @param handler
     * @param thisObj
     */
    off(handler: Function, thisObj: any): void {
      let method: extension.MethodUnAutoGc = this._dicEnterFrameCallBack.del(handler, thisObj)
      if (method == null) {
        let temp: extension.MethodUnAutoGc
        this._dicEnterFrameCallBack.for((mapKey: string): boolean => {
          temp = this._dicEnterFrameCallBack.get(mapKey)
          if (temp.handler === handler && temp.thisObj === thisObj) {
            this._dicEnterFrameCallBack.del(mapKey)
            method = temp
            return false
          }
          return true
        })
      }
      if (method != null) {
        method.return()
        this._listEnterFrameCallBack.splice(this._listEnterFrameCallBack.indexOf(method), 1)
      }
    }
    /**
     * 轮询逻辑：每帧执行回调函数
     */
    private enterFrame(): void {
      this._listEnterFrameCallBack.forEach((callBack: extension.MethodUnAutoGc): void => {
        callBack.excute()
      })
    }
  }
}
