namespace com.once.base {
  export abstract class InstanceBase {
    private static CONSTRUCT_ABLE: boolean = false
    constructor() {
      if (!InstanceBase.CONSTRUCT_ABLE) {
        throw new Error('单例类,请不要直接实例化,通过静态属性instance访问')
      }
      InstanceBase.CONSTRUCT_ABLE = false
    }

    protected static getInstance<T extends InstanceBase>(type: { new(): T }): T {
      InstanceBase.CONSTRUCT_ABLE = true
      return new type()
    }
  }
}
