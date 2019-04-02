//有很多个监听者(watcher),将这些个watcher放在一个数组中[{},{}]

class Dep {
    constructor(){
        this.subs = []
    }

    addSubs(watcher){
        this.subs.push(watcher)
    }
    notify(){   //通知更新
        this.subs.forEach(watcher =>{
            watcher.update()
        })
    }
}




class Watcher {
    //订阅者订阅的是key，就是数据中的属性，因为要根据参数的不同返回不同的数据到页面
    constructor(vm,key,cb){
        this.vm = vm;
        this.key = key;
        this.cb = cb;
        //只要new一下，就会监测到第一次进入时的value值
        this.oldValue = this.getValue(this.vm, this.key);  //用一个变量保存旧值
    }
    update(){   //更新数据
        let oldValue = this.oldValue;  //将oldValue传递过来
        this.newValue = this.getValue(this.vm, this.key);   //获取新的value值
        //判断新值与旧值是否相等，如果不相等，则调用cb函数
        if(oldValue !== this.newValue){
            this.cb(this.newValue,oldValue);
            //更新完之后将新值变成下一次的旧值
            this.oldValue = this.newValue;
        }
    }
    getValue(vm,key){
        //new的时候产生的订阅者就是这里面的this，就是watcher的实例
        Dep.target = this;//将订阅者实例存到Dep.target中
        // let data = this.vm.$data[this.key];
        //当 key = hobbies.a 时
        let data = vm.$data;  //data:{name:'jeasu',hobbies:{a:'aaa'}}
        key.split('.').forEach(item =>{  //[name]  ['hobbies','a']
            data = data[item];  //{a:'aaa'}   'aaa'
            // if (item !== 'name'){
            //     console.log(data);
            // }
        });
        Dep.target = null;
        return data;
    }

}













































