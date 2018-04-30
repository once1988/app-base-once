/// <reference path="../base/InstanceBase.ts" />
/// <reference path="../base/PoolBase.ts" />
/// <reference path="../extension/Dictionary.ts" />
/// <reference path="../utils/UIDManager.ts" />


namespace com.once.manager {
  export class NoticeManager extends base.InstanceBase {
    private static INSTANCE: NoticeManager

    private _noticeMap: extension.Dictionary = extension.Dictionary.borrow()

    static get instance(): NoticeManager {
      return NoticeManager.INSTANCE || (NoticeManager.INSTANCE = base.InstanceBase.getInstance(NoticeManager))
    }

    /**
     * 注册一个长期通知,直到off()关闭该通知
     * @param noticeTag
     * @param callback
     * @param callbackThisObj
     * @param callBackArgs
     */
    on(noticeTag: any, callback: Function, callbackThisObj: any, ...callBackArgs: any[]): NoticeManager {
      return this.register(noticeTag, callback, callbackThisObj, callBackArgs)
    }
    /**
     * 注册一个被优先处理的长期通知,直到off()关闭该通知
     * @param noticeTag
     * @param callback
     * @param callbackThisObj
     * @param callBackArgs
     */
    onPrev(noticeTag: any, callback: Function, callbackThisObj: any, ...callBackArgs: any[]): NoticeManager {
      return this.register(noticeTag, callback, callbackThisObj, callBackArgs, false, true)
    }
    /**
     * 注册一个一次性通知,通知一旦触发就立刻删除,以后都不会再收到该通知
     * @param noticeTag
     * @param callback
     * @param callbackThisObj
     * @param callbackArgs
     */
    once(noticeTag: any, callback: Function, callbackThisObj: any, ...callbackArgs: any[]): NoticeManager {
      return this.register(noticeTag, callback, callbackThisObj, callbackArgs, true)
    }
    /**
     * 注册一个被优先处理的一次性通知,通知一旦触发就立刻删除,以后都不会再收到该通知
     * @param noticeTag
     * @param callback
     * @param callbackThisObj
     * @param callbackArgs
     */
    oncePrev(noticeTag: any, callback: Function, callbackThisObj: any, ...callbackArgs: any[]): NoticeManager {
      return this.register(noticeTag, callback, callbackThisObj, callbackArgs, true, true)
    }
    /**
     * 取消一个通知的注册信息,取消后,将不再收到该通知
     * @param noticeTag
     * @param callback
     * @param Function
     * @param callbackThisObj
     */
    off(noticeTag: any, callback: Function, callbackThisObj: any): NoticeManager {
      let callBackMap = this._noticeMap.get(noticeTag)
      if (callBackMap != null) {
        let handler: Handler = callBackMap.del(callback, callbackThisObj)
        if (handler != null) {
          handler.return()
        }
      }
      return this
    }
    /**
     * 取消一个被优先处理的通知,取消后,将不再收到该通知
     * @param noticeTag
     * @param callback
     * @param callbackThisObj
     */
    offPrev(noticeTag: any, callback: Function, callbackThisObj: any): NoticeManager {
      const uuid: string = utils.getUid(noticeTag)
      return this.off('prev' + uuid, callback, callbackThisObj)
    }
    /**
     * 广播一个通知,所有注册该通知的地方都会收到,收到顺序为无序
     * @param noticeTag
     * @param args
     */
    dispatch(noticeTag: any, ...args: any[]): void {
      let uid: string = utils.getUid(noticeTag)
      let handlerMap: extension.Dictionary = this._noticeMap.get('prev' + uid)
      if (handlerMap != null) {
        this.dispatchExcute('prev' + uid, handlerMap, args)
      }
      handlerMap = this._noticeMap.get(uid)
      if (handlerMap) {
        this.dispatchExcute(uid, handlerMap, args)
      }
    }
    private dispatchExcute(uuid: string, handlerMap: extension.Dictionary, args: any[]): void {
      handlerMap.forEach((handler: Handler): boolean => {
        handler.excute(args, handlerMap)
        return true
      }, this)
      if (handlerMap.length === 0) {
        this._noticeMap.del(uuid)
        handlerMap.return()
      }
    }
    /**
     * 注册通知
     * @param noticeTag
     * @param callback
     * @param callbackThisObj
     * @param callBackArgs
     * @param once
     * @param prev
     */
    private register(noticeTag: any, callback: Function, callbackThisObj: any, callBackArgs: any[], once: boolean = false, prev: boolean = false): NoticeManager {
      const uuid: string = prev ? 'prev' + utils.getUid(noticeTag) : utils.getUid(noticeTag)
      let callBackMap: extension.Dictionary = this._noticeMap.get(uuid)
      if (callBackMap == null) {
        callBackMap = extension.Dictionary.borrow()
        this._noticeMap.add(uuid, callBackMap)
      } else if (callBackMap.get(callback, callbackThisObj) != null) {
        return this
      }
      let handler: Handler = Handler.borrow().update(callback, callbackThisObj, callBackArgs, once)
      callBackMap.add(callback, handler, callbackThisObj)
      return this
    }
  }


  class Handler extends base.PoolBase {
    private _callBack: Function | undefined
    private _callBackThisObj: any
    private _args: any[] | undefined
    private _once: boolean = false
    static borrow(): Handler {
      return base.PoolBase.getInstance(Handler)
    }

    update(callback: Function, callbackThisObj: any, args: any[], once: boolean): Handler {
      this._callBack = callback
      this._callBackThisObj = callbackThisObj
      this._args = args
      this._once = once
      return this
    }

    return(): void {
      if (this._borrowed) {
        this._callBack = undefined
        this._callBackThisObj = null
        this._args = undefined
        super.return()
      }
    }
    /**
     * @return 是否回收到对象池
     */
    excute(args: any[], mapContainer: extension.Dictionary): void {
      if (this._once) {
        if (mapContainer.del(<Function>this._callBack, this._callBackThisObj) == null) {
          mapContainer.for((key: string): boolean => {
            if (mapContainer.get(key) === this) {
              mapContainer.del(key)
              return false
            }
            return true
          })
        }
      }
      (<Function>this._callBack).apply(this._callBackThisObj, this._args != null ? this._args.concat(args) : args)
      if (this._once) {
        this.return()
      }
    }
  }
}
