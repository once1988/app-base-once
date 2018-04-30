/// <reference path="../base/PoolBase.ts" />

namespace com.once.extension {
  export abstract class Method extends base.PoolBase {
    /**回调函数参数 */
    protected _args: any[] | undefined
    /**回调函数 */
    protected _handler: Function | undefined
    protected _handlerThisObj: any
    constructor() {
      super()
    }
    /**执行回调 */
    excute(): void {
      if (!this._borrowed) {
        throw new Error('!borrowed')
      }
      (<Function>this._handler).apply(this._handlerThisObj, this._args)
    }
    /**添加额外的参数进行回调 */
    excuteWith(...args: any[]): void {
      if (!this._borrowed) {
        throw new Error('!borrowed')
      }
      (<Function>this._handler).apply(this._handlerThisObj, (<any[]>this._args).concat(args))
    }
    /**回收 */
    return(): void {
      if (this._borrowed) {
        this._handler = undefined
        if (this._args != null) {
          this._args.length = 0
        }
        this._args = undefined
        this._handlerThisObj = null
        super.return()
      }
    }

    get thisObj(): any {
      return this._handlerThisObj
    }

    get handler(): Function {
      return (<Function>this._handler)
    }

    get args(): any[] | undefined {
      return this._args
    }

    updateArgs(value: Array<any>): void {
      if (this._borrowed) {
        this._args = value.concat()
      }
    }
  }

  export class MethodUnAutoGc extends Method {
    constructor() {
      super()
    }

    static borrow(handler: Function, thisObj: any, ...args: any[]): MethodUnAutoGc {
      let method: MethodUnAutoGc = base.PoolBase.getInstance(MethodUnAutoGc)
      method._handler = handler
      method._args = args
      method._handlerThisObj = thisObj
      return method
    }
  }

  export class MethodAutoGc extends Method {
    private _excuteCount: number = 0
    private _excutedCount: number = 0
    constructor() {
      super()
    }
    static borrow(handler: Function, thisObj: any, excuteCount: number = 1, ...args: any[]): MethodAutoGc {
      const method: MethodAutoGc = base.PoolBase.getInstance(MethodAutoGc)
      method._excuteCount = excuteCount
      method._handler = handler
      method._handlerThisObj = thisObj
      method._excutedCount = 0
      method._args = args
      return method
    }

    excute(): void {
      if (this.returnAfterExcute) {
        super.excute.apply(this)
        this.return()
      } else {
        super.excute.apply(this)
      }
    }

    excuteWith(...args: any[]): void {
      if (this.returnAfterExcute) {
        super.excuteWith.apply(this, args)
        this.return()
      } else {
        super.excuteWith.apply(this, args)
      }
    }

    private get returnAfterExcute(): boolean {
      if (this._excuteCount > 0) {
        this._excutedCount++
        if (this._excutedCount > this._excuteCount) {
          throw new Error('endless loop!  may be you need "MethodUnAutoGc" to Replace "MethodAutoGc"')
        } else if (this._excutedCount === this._excuteCount) {
          return true
        }
        return false
      }
      return true
    }
  }

}
