class Vue {
    constructor(options){
        //三种数据
        this.$el = options.el;  //容器app，制定了模板template
        this.$data = options.data;  //数据
        this.$methods = options.methods;  //方法

        //当更改数据的时候，网页内容没有没有马上改变
        //数据劫持------观察者模式
        new Observer(this.$data);



        //有了数据之后，开始解析模板
        new Compile(this);
    }
}

//全局注册自定义指令
Vue.directive = function (str,fn) {
    //判断fn是对象还是函数，
    //如果是对象，逐个执行

    compileUnits[str] = function(){
        fn['bind'] && fn['bind']();
        //insert
    };
};


























