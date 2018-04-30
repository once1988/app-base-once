/// <reference path="../utils/UIDManager.ts" />

namespace com.once.base {
  /**
 * 对象池基类
 */
  export abstract class PoolBase {
    private static CONSTRUCT_ABLE: boolean = false
    private static readonly DIC_POOL: any = {}
    protected _borrowed: boolean = false

    constructor() {
      if (!PoolBase.CONSTRUCT_ABLE) {
        throw new Error('该对象受自身的对象池管理,请用静态方法"borrow()"实例化对象,实例的"return()"方法回收对象')
      }
      PoolBase.CONSTRUCT_ABLE = false
    }
    protected static getInstance<T extends PoolBase>(type: { new(): T }): T {
      let uid: string = utils.getUid(type)
      let pool: Array<T> = PoolBase.DIC_POOL[uid]
      if (pool == null) {
        pool = []
        PoolBase.DIC_POOL[uid] = pool
      }
      let target: T | undefined = pool.pop()
      if (target == null) {
        PoolBase.CONSTRUCT_ABLE = true
        target = new type()
      }
      target._borrowed = true
      return target
    }

    return(): void {
      if (this._borrowed) {
        this._borrowed = false
        let cls: any = this['constructor']
        let uid: string = utils.getUid(cls)
        let pool: Array<PoolBase> = PoolBase.DIC_POOL[uid]
        if (pool != null) {
          pool.push(this)
        }
      }
    }
  }
}
