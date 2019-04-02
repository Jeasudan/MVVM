
//解析模板  翻译一遍
//1、找到模板el
class Compile {
    //vm --->  this 实例  vue 实例
    constructor(vm){
        //el 可能是字符串也可能是dom元素
        this.el =(typeof vm.$el === 'string') ? document.querySelector(vm.$el) :  vm.$el;
        //将数据和方法整体传过来
        this.vm = vm;
        this.init();
    }
    init(){
        //1、将真实dom{{}}转换成抽象dom 放进内存中--->获取{{name}}
        //这里处理防止回流操作
        let fragment = this.changeFragment();
        //2、将抽象dom解析  去除{{}} ---->获取并插入数据data
        this.compile(fragment);
        //3、将解析后的dom放进 容器vm.$el中
        this.el.appendChild(fragment);
    }
    changeFragment(){
        let fragment = document.createDocumentFragment();
        let childNodes = this.el.childNodes;  //真实dom ---是个伪数组
        // console.log(childNodes);
        //现在就是要遍历每一个节点，放入fragment中
        // 但是伪数组不能遍历，需要将它转化成真数组
        this.toArray(childNodes).forEach( node =>{
            //fragment和dom的操作一样，内置dom对象上的一个方法
            //第一个特点：如果你给fragment新增的dom在浏览器上存在，就将其剪切走
            //第二个特点：整个dom 中fragment是惟一的，有且仅有一个
            fragment.appendChild(node)
        });
        return fragment;
    }
    compile(nodes){
        let childNodes = nodes.childNodes;  //真实dom ---是个伪数组
        this.toArray(childNodes).forEach( node =>{
            // console.log(node);

            //如果你是元素节点，我们要解析 指令
            if (this.isElement(node)){
                //监测指令
                let attrs = node.attributes;
                // console.log(attrs);//得到的是Map结构数据类型
                this.toArray(attrs).forEach( attr =>{  //将map数据结构转化成array数据
                    // console.log( typeof attr);  //object类型
                    // console.dir(attr);  //dir完整输出
                    let name = attr.name;
                    //判断是不是指令 以v-开头的 startsWith
                    if (name.startsWith('v-')){
                        let key = attr.value;
                        // console.log(name, value);

                        //判断具体是哪条指令
                        // if(name === 'v-text'){
                        //     // node.innerText = this.vm.$data[key]
                        //     compileUnits['text'](node, this.vm, key);
                        // }
                        // if(name === 'v-html'){
                        //     // node.innerHTML = this.vm.$data[key]
                        //     compileUnits['html'](node, this.vm, key);
                        // }
                        // if(name === 'v-model'){  //input
                        //     // node.value = this.vm.$data[key]
                        //     compileUnits['model'](node, this.vm, key);
                        // }

                        //如果是事件  v-on:事件 = 事件名
                        let exp = name.split('-')[1];  //text html on:click
                        //判断是否为事件注册
                        if(exp.split(':')[0] === 'on'){
                            let eventType = exp.split(':')[1];
                            //判断当前事件是否存在
                            if(!this.vm.$methods[key]){
                                throw Error('not found show')
                            }
                            node.addEventListener(eventType,this.vm.$methods[key].bind(this.vm));
                        }else if (compileUnits[exp]){ //先判断是否则有这条指令，再判断具体是哪条指令
                            compileUnits[exp](node, this.vm, key);
                        }
                    }
                })
            }
            //如果你是文本节点，我们要解析 内容
            if (this.isText(node)){
                //先找到文本节点的内容
                let txt = node.textContent;
                // console.log(txt);
                //正则+replace找到双括号内容进行替换
                let reg = /\{\{(.+)\}\}/;
                //检测当前文本是否满足当前reg
                if (reg.test(txt)){
                    // node.textContent = txt.replace(reg, this.vm.$data[RegExp.$1]);
                    // //文本节点进行订阅
                    // new Watcher(this.vm,RegExp.$1,function (n,o) {
                    //     node.textContent = txt.replace(reg, n);
                    // } )
                    compileUnits['content'](node, reg, this.vm,RegExp.$1)
                    // console.log(node.textContent);
                }
            }

            //如果当前的node有文本子节点，递归处理当前的node节点
            if (node.childNodes && node.childNodes.length>0){
                this.compile(node);
            }

        });
    }
    toArray(arr){
        return [].slice.call(arr);
    }

    isElement(node){
        return (node.nodeType === 1)
    }
    isText(node){
        return (node.nodeType === 3)
    }

}

// 对象: 所有的指令
let compileUnits = {
    //文本节点
    content(node,reg,vm,key){
        let txt = node.textContent;
        node.textContent = txt.replace(reg,getValue(vm,key));
        //文本节点进行订阅
        new Watcher(vm,key,function (n,o) {
            node.textContent = txt.replace(reg, n);
        } )
    },
    //指令
    text(node,vm,key){
        // node.innerText = vm.$data[key];
        node.innerText = getValue(vm,key);
        //在首次用到数据的时候，就应该new一个watcher实例此处插入数据
        new Watcher(vm,key,function (n,o) {
            node.innerText = n;
        })
    },
    html(node,vm,key){
        // node.innerHTML = vm.$data[key];
        node.innerHTML = getValue(vm,key);
        new Watcher(vm,key,function (n,o) {
            node.innerHTML = n;
        })
    },
    //双向绑定
    model(node,vm,key){
        // node.value = vm.$data[key];
        node.value = getValue(vm,key);
        new Watcher(vm,key,function (n,o) {
            node.value = n;
        })
        
        //给当前的node添加一个监听事件，实现双向绑定
        node.addEventListener('input',function () {
            //获取当前input的新值  this.value ，赋给实例vm上的$data
            // console.log(this.value);
            vm.$data[key] = this.value;
        })
        
    }
};


function getValue(vm,key){

    let data = vm.$data;  //data:{name:'jeasu',hobbies:{a:'aaa'}}
    key.split('.').forEach(item =>{  //[name]  ['hobbies','a']
        data = data[item];  //{a:'aaa'}   'aaa'
    });
    Dep.target = null;
    return data;
}








// function 上没有this，
//函数式组件，无状态函数，不用考虑this

//引用数据地址传递，----实现双向，其实都是父到子
// props组件外更改，其实不能更改，由外部更改好再传递    states是内部生成的，在组件内更改数据





















// 注册全局指令
// bind  insert
// 全局组件





