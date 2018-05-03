declare namespace com.once.base {
    abstract class InstanceBase {
        private static CONSTRUCT_ABLE;
        constructor();
        protected static getInstance<T extends InstanceBase>(type: {
            new (): T;
        }): T;
    }
}
declare namespace com.once.utils {
    function getUid(target: any, thisObjOfTarget?: any): string;
}
declare namespace com.once.base {
    /**
   * 对象池基类
   */
    abstract class PoolBase {
        private static CONSTRUCT_ABLE;
        private static readonly DIC_POOL;
        protected _borrowed: boolean;
        constructor();
        protected static getInstance<T extends PoolBase>(type: {
            new (): T;
        }): T;
        return(): void;
    }
}
declare namespace com.once.extension {
    abstract class Method extends base.PoolBase {
        /**回调函数参数 */
        protected _args: any[] | undefined;
        /**回调函数 */
        protected _handler: Function | undefined;
        protected _handlerThisObj: any;
        constructor();
        /**执行回调 */
        excute(): void;
        /**添加额外的参数进行回调 */
        excuteWith(...args: any[]): void;
        /**回收 */
        return(): void;
        readonly thisObj: any;
        readonly handler: Function;
        readonly args: any[] | undefined;
        updateArgs(value: Array<any>): void;
    }
    class MethodUnAutoGc extends Method {
        constructor();
        static borrow(handler: Function, thisObj: any, ...args: any[]): MethodUnAutoGc;
    }
    class MethodAutoGc extends Method {
        private _excuteCount;
        private _excutedCount;
        constructor();
        static borrow(handler: Function, thisObj: any, excuteCount?: number, ...args: any[]): MethodAutoGc;
        excute(): void;
        excuteWith(...args: any[]): void;
        private readonly returnAfterExcute;
    }
}
declare namespace com.once.extension {
    /**
     * 字典类,key值为任意值,不限于字符串
     * 如果key值相同,可以传入key所属的实例对象this做为附加key,以区分同类对象不同实例
     */
    class Dictionary extends base.PoolBase {
        private static readonly TEMP_KEYS;
        private _length;
        private _record;
        constructor();
        static borrow(): Dictionary;
        /**回收 */
        return(): void;
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
        add(key: Object | any[], value: any, thisObjOfKey?: any, cover?: boolean): boolean;
        /**更新某个key的值 */
        update(key: Object | any[], value: any, thisObjOfKey?: any): void;
        /**获取对象 */
        get(key: Object | any[], thisObjOfKey?: any): any;
        /**删除一个对象*/
        del(key: Object | any[], thisObjOfKey?: any): any;
        /**清理 */
        clear(): void;
        /**按值遍历 */
        forEach(callBack: (value: any) => boolean, thisObjOfCallBack?: any): void;
        /**按Key遍历 */
        for(callBack: (key: string) => boolean, thisObjOfCallBack?: any): void;
        pop(): any;
        readonly length: number;
    }
}
declare namespace com.once.manager {
    class RenderManager extends base.InstanceBase {
        /**帧频 */
        static readonly frameRate: number;
        /**每帧消耗的时间(ms) */
        static readonly secPerFrame: number;
        private static INSTANCE;
        /**每帧回调函数列表 */
        private readonly _listEnterFrameCallBack;
        /**每帧回调函数字典(主要用于检测处理函数是否重复添加) */
        private readonly _dicEnterFrameCallBack;
        constructor();
        static readonly instance: RenderManager;
        /**
         * 注册一个帧循环回调
         * @param callback 回调函数
         * @param callbackThisObj 回调函数this指向
         * @param callbackArgs 回调函数参数
         * @param callBackImmediately 是否立即执行一次回调
         */
        on(callback: Function, callbackThisObj: any, callbackArgs?: any[], callBackImmediately?: boolean): void;
        /**
         * 删除一个帧循环回调
         * @param handler
         * @param thisObj
         */
        off(handler: Function, thisObj: any): void;
        /**
         * 轮询逻辑：每帧执行回调函数
         */
        private enterFrame();
    }
}
declare namespace com.once.manager {
    class TimerManager extends base.InstanceBase {
        private static INSTANCE;
        private static POOL;
        private _handlers;
        private _handlerMap;
        private _currFrame;
        private _enterFrameIndexNow;
        private _enterFrameIndexMax;
        constructor();
        static readonly instance: TimerManager;
        /**
         * 清理定时器
         * @param key
         * @param thisObjOfKey
         */
        off(key: Function, thisObjOfKey: any): void;
        /**
         * 定时执行一次
         * @param delay  延迟时间(单位毫秒)
         * @param handler 结束时的回调方法
         * @param handlerThisObject
         * @param handlerArgs   回调参数
         * @param callBackImmediately  是否覆盖(true:同方法多次计时，后者覆盖前者。false:同方法多次计时，不相互覆盖) callBackImmediately=true时返回回调函数本身，cover=false时，返回唯一ID，均用来作为clearTimer的参数
         */
        once(delay: number, handler: Function, handlerThisObject: any, handlerArgs?: any[], callBackImmediately?: boolean): void;
        /**
         * 定时重复执行
         * @param delay  延迟时间(单位毫秒)
         * @param handler 结束时的回调方法
         * @param handlerThisObject
         * @param handlerArgs   回调参数
         * @param callBackImmediately  是否覆盖(true:同方法多次计时，后者覆盖前者。false:同方法多次计时，不相互覆盖) callBackImmediately=true时返回回调函数本身，cover=false时，返回唯一ID，均用来作为clearTimer的参数
         */
        on(delay: number, handler: Function, handlerThisObject: any, handlerArgs?: any[], callBackImmediately?: boolean): void;
        /**
         * 定时执行一次(基于帧率)
         * @param delay  延迟时间(单位毫秒)
         * @param handler 结束时的回调方法
         * @param handlerThisObject
         * @param handlerArgs   回调参数
         * @param callBackImmediately  是否覆盖(true:同方法多次计时，后者覆盖前者。false:同方法多次计时，不相互覆盖) callBackImmediately=true时返回回调函数本身，cover=false时，返回唯一ID，均用来作为clearTimer的参数
         */
        onceByFrame(delay: number, handler: Function, handlerThisObject: any, handlerArgs?: any[], callBackImmediately?: boolean): void;
        /** 定时重复执行(基于帧率)
         * @param	delay  延迟时间(单位为帧)
         * @param	method 结束时的回调方法
         * @param	args   回调参数
         * @param	callBackImmediately  是否覆盖(true:同方法多次计时，后者覆盖前者。false:同方法多次计时，不相互覆盖)
         * @return  callBackImmediately=true时返回回调函数本身，否则返回唯一ID，均用来作为clearTimer的参数
         */
        onByFrame(delay: number, handler: Function, handlerThisObject: any, handlerArgs?: any[], callBackImmediately?: boolean): void;
        /**
         * 帧循环
         */
        private enterFrame();
        private create(useFrame, repeat, delay, handler, handlerThisObject, handlerArgs?, callBackImmediately?);
    }
}
declare namespace com.once.manager {
    class NoticeManager extends base.InstanceBase {
        private static INSTANCE;
        private _noticeMap;
        static readonly instance: NoticeManager;
        /**
         * 注册一个长期通知,直到off()关闭该通知
         * @param noticeTag
         * @param callback
         * @param callbackThisObj
         * @param callBackArgs
         */
        on(noticeTag: any, callback: Function, callbackThisObj: any, ...callBackArgs: any[]): NoticeManager;
        /**
         * 注册一个被优先处理的长期通知,直到off()关闭该通知
         * @param noticeTag
         * @param callback
         * @param callbackThisObj
         * @param callBackArgs
         */
        onPrev(noticeTag: any, callback: Function, callbackThisObj: any, ...callBackArgs: any[]): NoticeManager;
        /**
         * 注册一个一次性通知,通知一旦触发就立刻删除,以后都不会再收到该通知
         * @param noticeTag
         * @param callback
         * @param callbackThisObj
         * @param callbackArgs
         */
        once(noticeTag: any, callback: Function, callbackThisObj: any, ...callbackArgs: any[]): NoticeManager;
        /**
         * 注册一个被优先处理的一次性通知,通知一旦触发就立刻删除,以后都不会再收到该通知
         * @param noticeTag
         * @param callback
         * @param callbackThisObj
         * @param callbackArgs
         */
        oncePrev(noticeTag: any, callback: Function, callbackThisObj: any, ...callbackArgs: any[]): NoticeManager;
        /**
         * 取消一个通知的注册信息,取消后,将不再收到该通知
         * @param noticeTag
         * @param callback
         * @param Function
         * @param callbackThisObj
         */
        off(noticeTag: any, callback: Function, callbackThisObj: any): NoticeManager;
        /**
         * 取消一个被优先处理的通知,取消后,将不再收到该通知
         * @param noticeTag
         * @param callback
         * @param callbackThisObj
         */
        offPrev(noticeTag: any, callback: Function, callbackThisObj: any): NoticeManager;
        /**
         * 广播一个通知,所有注册该通知的地方都会收到,收到顺序为无序
         * @param noticeTag
         * @param args
         */
        dispatch(noticeTag: any, ...args: any[]): void;
        private dispatchExcute(uuid, handlerMap, args);
        /**
         * 注册通知
         * @param noticeTag
         * @param callback
         * @param callbackThisObj
         * @param callBackArgs
         * @param once
         * @param prev
         */
        private register(noticeTag, callback, callbackThisObj, callBackArgs, once?, prev?);
    }
}
declare namespace com.once {
    abstract class App {
        /**计时器 */
        static readonly timer: manager.TimerManager;
        /**帧管理器 */
        static readonly render: manager.RenderManager;
        /**通知管理器 */
        static readonly notice: manager.NoticeManager;
        /** App启动时间 */
        private static startTime;
        /**切换到后台需要处理的回调字典 */
        private static mapCbWhileHide;
        /**切换回前台需要处理的回调字典 */
        private static mapCbWhileShow;
        /**是否切换到了后台 */
        private static isBackground;
        /**
         * 获取从App启动到现在一共经历了多少毫秒
         */
        static readonly timePast: number;
        /** 获取当前时间(毫秒,以1970为基础) */
        static readonly nowTime: number;
        /**
         * 注册一个切换到后台的监听
         * @param callBack
         * @param callBackThisObj
         */
        static onHide(handler: Function, thisObj: any, ...args: any[]): void;
        /**
         * 取消一个切换到后台的监听
         * @param handler
         * @param thisObj
         * @param args
         */
        static offHide(handler: Function, thisObj: any): void;
        /**
         * 注册一个切换回前台的监听
         * @param callBack
         * @param callBackThisObj
         */
        static onShow(handler: Function, thisObj: any, ...args: any[]): void;
        /**
         * 取消一个切换到前台的监听
         * @param handler
         * @param thisObj
         */
        static offShow(handler: Function, thisObj: any): void;
        /**App切到后台 */
        static hide(): void;
        /**App切回前台 */
        static show(): void;
        /**App是否已经切换到后台 */
        static readonly inBackground: boolean;
    }
}
