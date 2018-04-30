namespace com.once.utils {
  let UUID: number = 0
  export function getUid(target: any, thisObjOfTarget?: any): string {
    if (target != null) {
      if (target.constructor === String || target.constructor === Number) {
        return target as string
      }
      if (target['com.once.uid'] == null) {
        UUID++
        Object.defineProperty(target, 'com.once.uid', {
          value: 'com.once.uid' + UUID,
          writable: false,
          configurable: false,
          enumerable: false,
        })
      }
      if (thisObjOfTarget != null) {
        if (thisObjOfTarget['com.once.uid'] == null) {
          UUID++
          Object.defineProperty(thisObjOfTarget, 'com.once.uid', {
            value: 'com.once.uid' + UUID,
            writable: false,
            configurable: false,
            enumerable: false,
          })
        }
        return thisObjOfTarget['com.once.uid'] + '_' + target['com.once.uid']
      }
      return target['com.once.uid']
    }
    throw new Error('uid生成失败')
  }
}
