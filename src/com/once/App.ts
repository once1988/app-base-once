/// <reference path="manager/TimerManager.ts" />
/// <reference path="manager/RenderManager.ts" />
/// <reference path="manager/NoticeManager.ts" />
/// <reference path="extension/Dictionary.ts" />
/// <reference path="extension/Method.ts" />

namespace com.once {
  export abstract class App {
    /**计时器 */
    static readonly timer: manager.TimerManager = manager.TimerManager.instance
    /**帧管理器 */
    static readonly render: manager.RenderManager = manager.RenderManager.instance
    /**通知管理器 */
    static readonly notice: manager.NoticeManager = manager.NoticeManager.instance
    /** App启动时间 */
    private static startTime: number = Date.now()
    // /** date实例 */
    // private static date: Date = new Date()
    /**切换到后台需要处理的回调字典 */
    private static mapCbWhileHide: extension.Dictionary = extension.Dictionary.borrow()
    /**切换回前台需要处理的回调字典 */
    private static mapCbWhileShow: extension.Dictionary = extension.Dictionary.borrow()
    /**是否切换到了后台 */
    private static isBackground: boolean = false

    /**
     * 获取从App启动到现在一共经历了多少毫秒
     */
    static get timePast(): number {
      return Date.now() - App.startTime
    }
    /** 获取当前时间(毫秒,以1970为基础) */
    static get nowTime(): number {
      return Date.now()
    }


    /**
     * 注册一个切换到后台的监听
     * @param callBack
     * @param callBackThisObj
     */
    static onHide(handler: Function, thisObj: any, ...args: any[]): void {
      let method: extension.MethodUnAutoGc = App.mapCbWhileHide.get(handler, thisObj)
      if (method == null) {
        method = extension.MethodUnAutoGc.borrow(handler, thisObj)
        method.updateArgs(args)
        App.mapCbWhileHide.add(handler, method)
      }
    }
    /**
     * 取消一个切换到后台的监听
     * @param handler
     * @param thisObj
     * @param args
     */
    static offHide(handler: Function, thisObj: any): void {
      let method: extension.MethodUnAutoGc = App.mapCbWhileHide.del(handler, thisObj)
      if (method != null) {
        method.return()
      }
    }
    /**
     * 注册一个切换回前台的监听
     * @param callBack
     * @param callBackThisObj
     */
    static onShow(handler: Function, thisObj: any, ...args: any[]): void {
      let method: extension.MethodUnAutoGc = App.mapCbWhileShow.get(handler, thisObj)
      if (method == null) {
        method = extension.MethodUnAutoGc.borrow(handler, thisObj)
        method.updateArgs(args)
        App.mapCbWhileShow.add(handler, method)
      }
    }
    /**
     * 取消一个切换到前台的监听
     * @param handler
     * @param thisObj
     */
    static offShow(handler: Function, thisObj: any): void {
      let method: extension.MethodUnAutoGc = App.mapCbWhileShow.del(handler, thisObj)
      if (method != null) {
        method.return()
      }
    }
    /**App切到后台 */
    static hide(): void {
      if (!App.isBackground) {
        App.isBackground = true
        App.mapCbWhileHide.forEach((callBack: extension.MethodUnAutoGc): boolean => {
          callBack.excute()
          return true
        })
      }
    }
    /**App切回前台 */
    static show(): void {
      if (App.isBackground) {
        App.isBackground = false
        App.mapCbWhileShow.forEach((callBack: extension.MethodUnAutoGc): boolean => {
          callBack.excute()
          return true
        })
      }
    }
    /**App是否已经切换到后台 */
    static get inBackground(): boolean {
      return App.isBackground
    }
  }

}
