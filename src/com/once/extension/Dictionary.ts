/// <reference path="../base/PoolBase.ts" />
/// <reference path="../extension/Method.ts" />
/// <reference path="../utils/UIDManager.ts" />

namespace com.once.extension {
  /**
   * 字典类,key值为任意值,不限于字符串
   * 如果key值相同,可以传入key所属的实例对象this做为附加key,以区分同类对象不同实例
   */
  export class Dictionary extends base.PoolBase {
    private static readonly TEMP_KEYS: any[] = []
    private _length: number = 0
    private _record: any = {}

    constructor() {
      super()
    }

    static borrow(): Dictionary {
      return base.PoolBase.getInstance(Dictionary)
    }
    /**回收 */
    return(): void {
      if (this._borrowed) {
        this.clear()
        super.return()
      }
    }
    /**
     *
     * @param key
     * @param value
     * @param thisObjOfKey
     * @param cover
     *
     * @example
     *    let dic: Dictionary = Dictionary.borrow()
     * 1.以基础数据类型为key存储：
     *    dic.add('name', 'Dictionary')
     * 2.以复杂数据类型为key存储:
     *    let obj: PlayerInfo = new PlayerInfo()
     *    dic.add(obj, obj, obj)
     * 3.以多个key确定唯一性存储
     *    dic.add(Dictionary.createKeys(0, 1), '坐标(0, 1)')
     */
    add(key: Object | any[], value: any, thisObjOfKey?: any, cover: boolean = false): boolean {
      if (value == null || key == null) {
        return false
      }
      if (key instanceof Array) {
        if (key.length > 1) {
          const keySub: any = key.shift()
          let dicSub: Dictionary = this.get(keySub, thisObjOfKey)
          if (dicSub == null) {
            dicSub = Dictionary.borrow()
            this.add(keySub, dicSub, thisObjOfKey)
          }
          return dicSub.add(key, value, thisObjOfKey, cover)
        } else {
          return this.add(key.pop(), value, thisObjOfKey, cover)
        }
      } else {
        let added: boolean = false
        let uid: string = (key.constructor === String || key.constructor === Number) ? key.toString() : utils.getUid(key, thisObjOfKey)
        let valueOld: any = this._record[uid]
        if (valueOld == null) {
          this._record[uid] = value
          this._length++
          added = true
        } else if (cover && value !== valueOld) {
          if (valueOld.constructor === Dictionary) {
            (valueOld as Dictionary).return()
          } else if (valueOld instanceof Method) {
            (valueOld as Method).return()
          }
          this._record[uid] = value
          added = true
        }
        return added
      }
    }
    /**更新某个key的值 */
    update(key: Object | any[], value: any, thisObjOfKey?: any): void {
      if (key != null) {
        if (key instanceof Array) {
          if (key.length > 1) {
            const dicSub: Dictionary = this.get(key.shift(), thisObjOfKey)
            if (dicSub != null) {
              dicSub.update(key, value, thisObjOfKey)
            }
          } else {
            this.update(key.pop(), value, thisObjOfKey)
          }
        } else {
          let uid: string = utils.getUid(key, thisObjOfKey)

          if (this._record[uid] != null) {
            this._record[uid] = value
          }
        }
      }
    }
    /**获取对象 */
    get(key: Object | any[], thisObjOfKey?: any): any {
      if (key != null) {
        if (key instanceof Array) {
          if (key.length > 1) {
            const dicSub: Dictionary = this.get(key.shift())
            if (dicSub != null) {
              return dicSub.get(key)
            } else {
              return null
            }
          } else {
            return this.get(key.shift())
          }
        } else {
          let uid: string = (key.constructor === String || key.constructor === Number) ? key.toString() : utils.getUid(key, thisObjOfKey)
          return this._record[uid]
        }
      }
      return null
    }
    /**删除一个对象*/
    del(key: Object | any[], thisObjOfKey?: any): any {
      if (key != null) {
        if (key instanceof Array) {
          if (key.length > 1) {
            let dicSub: Dictionary = this.del(key.shift(), thisObjOfKey)
            if (dicSub != null) {
              const valueSub: any = dicSub.del(key, thisObjOfKey)
              dicSub.return()
              return valueSub
            }
          } else {
            return this.del(key.pop(), thisObjOfKey)
          }
        } else {
          let uid: string = (key.constructor === String || key.constructor === Number) ? key.toString() : utils.getUid(key, thisObjOfKey)
          let value: any = this._record[uid]
          delete this._record[uid]
          if (value != null) {
            this._length--
          }
          return value
        }
      }
      return null
    }
    /**清理 */
    clear(): void {
      let uid: string
      let value: any
      for (uid in this._record) {
        value = this._record[uid]
        delete this._record[uid]
        if (value.constructor === Dictionary) {
          (value as Dictionary).return()
        }
      }
      this._length = 0
    }
    /**按值遍历 */
    forEach(callBack: (value: any) => boolean, thisObjOfCallBack?: any): void {
      let key: string
      let value: any
      for (key in this._record) {
        value = this._record[key]
        if (!callBack.apply(thisObjOfCallBack, [value])) {
          return
        }
      }
    }
    /**按Key遍历 */
    for(callBack: (key: string) => boolean, thisObjOfCallBack?: any): void {
      let key: string
      for (key in this._record) {
        if (!callBack.apply(thisObjOfCallBack, [key])) {
          return
        }
      }
    }

    pop(): any {
      let key: string
      for (key in this._record) {
        return this.del(key)
      }
    }

    get length(): number {
      return this._length
    }
  }

}
