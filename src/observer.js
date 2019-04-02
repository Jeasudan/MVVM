
class Observer {
    constructor(data){
        this.data = data;
        this.walk(data);
    }
    //walk函数遍历数据
    walk(data){
        //判断data是否存在，它的类型是否是object，如果不是则不用遍历
        if(!data || typeof data !== 'object') return;

        //将对象变成数组，第一层遍历
        Object.keys(data).forEach( key =>{
            this.definePro(data,key,data[key])  //第一次遍历的的时候，值是初始的值
            //第二层遍历，递归调用walk函数
            this.walk(data[key]);
        });
    }
    //definePro函数做数据修改
    definePro(obj,key,value){   //value为第三方变量，存储值
        let self = this;
        let dep = new Dep();
        Object.defineProperty(obj,key,{
            get(){
                // console.log('get');
                //在用到数据的时候将数据插入到页面
                //如果这个实例存在，则调用addSubs
                if(Dep.target){
                    dep.addSubs(Dep.target);
                }
                return value;  //第一次获取的是接受到的初始值
            },
            set(newValue){
                // console.log('set');
                if(value === newValue) return; //当旧值和新值相同时，return
                value = newValue;   //set的时候传入新值，再次获取的时候获取的是新值，但是变量任是value
                if(typeof newValue === 'object'){
                    self.walk(newValue);
                }
                //数据发生更新的时候通知watcher更新页面数据
                dep.notify()
            }
        })
    }

}



































