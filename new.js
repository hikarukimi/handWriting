// ============================================
// 手写 new 函数（news）
// ============================================
function news(fn,...args){
    let obj={}
    obj.__proto__=fn.prototype
    let res=fn.apply(obj,args)
    return typeof res === '[object Object]'||typeof res === 'function'?res:obj
}

// ============================================
// news 函数测试用例
// ============================================

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// 测试结果存储
const testResults = {
    total: 0,
    passed: 0,
    failed: 0,
    tests: []
};

function addResult(name, description, passed, expected, actual, detail = '') {
    testResults.total++;
    if (passed) testResults.passed++;
    else testResults.failed++;

    testResults.tests.push({ name, description, passed, expected, actual, detail });
}

function printReport() {
    console.log('='.repeat(60));
    console.log('                   new 函 数 测 试 报 告');
    console.log('='.repeat(60));
    console.log(`
📊 统计概览:`);
    console.log(`   总测试数: ${testResults.total}`);
    console.log(`   ✅ 通过:   ${testResults.passed}`);
    console.log(`   ❌ 失败:   ${testResults.failed}`);
    console.log(`   📈 通过率: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`);

    console.log(`
📋 详细结果:
`);

    testResults.tests.forEach((test, index) => {
        const icon = test.passed ? '✅' : '❌';
        console.log(`${icon} 测试 ${index + 1}: ${test.name}`);
        console.log(`   描述: ${test.description}`);

        if (!test.passed) {
            console.log(`   期望: ${test.expected}`);
            console.log(`   实际: ${test.actual}`);
        }

        if (test.detail) {
            console.log(`   详情: ${test.detail}`);
        }
        console.log('');
    });

    console.log('='.repeat(60));
    if (testResults.failed === 0) {
        console.log('🎉 所有测试全部通过！');
    } else {
        console.log(`⚠️  有 ${testResults.failed} 个测试未通过，请检查实现。`);
    }
    console.log('='.repeat(60));
}

// ============================================
// 测试用例
// ============================================

async function runNewsTests() {
    console.log('开始执行 new 函数测试...\n');

    // ---------- 测试1: 基本实例创建 ----------
    function Person1(name) { this.name = name; }
    const p1 = news(Person1, 'Tom');

    addResult(
        '基本实例创建',
        '能通过构造函数创建实例对象',
        p1 instanceof Person1 && p1.name === 'Tom',
        '实例属于Person1且name==="Tom"',
        `instanceof:${p1 instanceof Person1}, name:${p1.name}`,
        (p1 instanceof Person1 && p1.name === 'Tom') ? '实例创建正常' : '实例创建异常'
    );

    // ---------- 测试2: 原型方法访问 ----------
    function Animal1() {}
    Animal1.prototype.speak = function () { return 'I can speak'; };
    const a1 = news(Animal1);

    addResult(
        '原型方法访问',
        '实例能访问构造函数原型上的方法',
        a1.speak() === 'I can speak',
        'a1.speak() === "I can speak"',
        `a1.speak() === "${a1.speak()}"`,
        a1.speak() === 'I can speak' ? '原型方法访问正常' : '原型方法访问异常'
    );

    // ---------- 测试3: 构造函数参数传递 ----------
    function Calculator1(x, y) { this.sum = x + y; this.product = x * y; }
    const c1 = news(Calculator1, 3, 4);

    const paramOk = c1.sum === 7 && c1.product === 12;
    addResult(
        '构造函数参数传递',
        '多参数正确传入构造函数',
        paramOk,
        'sum=7, product=12',
        `sum=${c1.sum}, product=${c1.product}`,
        paramOk ? '参数传递正常' : '参数传递异常'
    );

    // ---------- 测试4: this属性赋值 ----------
    function Point1(x, y) { this.x = x; this.y = y; this.distance = Math.sqrt(x * x + y * y); }
    const pt1 = news(Point1, 3, 4);

    addResult(
        'this属性赋值',
        '构造函数内this赋值的属性挂在实例上',
        pt1.x === 3 && pt1.y === 4 && pt1.distance === 5,
        'x=3, y=4, distance=5',
        `x=${pt1.x}, y=${pt1.y}, distance=${pt1.distance}`,
        (pt1.x === 3 && pt1.y === 4 && pt1.distance === 5) ? 'this赋值正常' : 'this赋值异常'
    );

    // ---------- 测试5: 构造函数返回对象时使用返回值 ----------
    function Factory1() {
        this.ignored = true;
        return { fromReturn: true, custom: 'object' };
    }
    const f1 = news(Factory1);

    addResult(
        '构造函数返回对象',
        '构造函数return对象时，news返回该对象',
        f1.fromReturn === true && f1.ignored === undefined,
        '返回对象{fromReturn:true, ignored:undefined}',
        `fromReturn:${f1.fromReturn}, ignored:${f1.ignored}`,
        (f1.fromReturn === true && f1.ignored === undefined) ? '返回对象处理正常' : '返回对象处理异常'
    );

    // ---------- 测试6: 构造函数返回基本类型时忽略返回值 ----------
    function ReturnPrimitive1() {
        this.value = 42;
        return 'stringReturnValue'; // 基本类型，应被忽略
    }
    const r1 = news(ReturnPrimitive1);

    addResult(
        '构造函数返回基本类型',
        'return基本类型时应被忽略，返回新实例',
        r1 instanceof ReturnPrimitive1 && r1.value === 42,
        '返回实例且value===42',
        `instanceof:${r1 instanceof ReturnPrimitive1}, value:${r1.value}`,
        (r1 instanceof ReturnPrimitive1 && r1.value === 42) ? '基本类型返回忽略正常' : '基本类型返回忽略异常'
    );

    // ---------- 测试7: 构造函数返回null时返回实例 ----------
    function ReturnNull1() {
        this.real = true;
        return null;
    }
    const n1 = news(ReturnNull1);

    addResult(
        '构造函数返回null',
        'return null时应返回新实例（typeof null为object但不算对象）',
        n1 instanceof ReturnNull1 && n1.real === true,
        '返回实例且real===true',
        `instanceof:${n1 instanceof ReturnNull1}, real:${n1.real}`,
        (n1 instanceof ReturnNull1 && n1.real === true) ? 'null返回处理正常' : 'null返回处理异常'
    );

    // ---------- 测试8: instanceof检测 ----------
    function Vehicle1() {}
    Vehicle1.prototype.drive = function () { return 'driving'; };
    const v1 = news(Vehicle1);

    addResult(
        'instanceof检测',
        '实例通过instanceof检测',
        v1 instanceof Vehicle1 && Object.getPrototypeOf(v1) === Vehicle1.prototype,
        'v1 instanceof Vehicle1 且原型指向构造函数prototype',
        `instanceof:${v1 instanceof Vehicle1}, 原型一致:${Object.getPrototypeOf(v1) === Vehicle1.prototype}`,
        (v1 instanceof Vehicle1 && Object.getPrototypeOf(v1) === Vehicle1.prototype) ? 'instanceof正常' : 'instanceof异常'
    );

    // ---------- 测试9: constructor指向正确 ----------
    function Gadget1() {}
    const g1 = news(Gadget1);

    addResult(
        'constructor指向正确',
        '实例的constructor指向构造函数本身',
        g1.constructor === Gadget1,
        'g1.constructor === Gadget1',
        `g1.constructor === ${g1.constructor?.name}`,
        g1.constructor === Gadget1 ? 'constructor指向正常' : 'constructor指向异常'
    );

    // ---------- 测试10: 无参数构造函数 ----------
    function Config1() { this.defaultValue = 'default'; }
    Config1.prototype.getType = function () { return 'config'; };
    const cfg1 = news(Config1);

    addResult(
        '无参数构造函数',
        '不传参时也能正常创建实例',
        cfg1.defaultValue === 'default' && cfg1.getType() === 'config',
        'defaultValue==="default" 且 getType()==="config"',
        `defaultValue:${cfg1.defaultValue}, getType:${cfg1.getType()}`,
        (cfg1.defaultValue === 'default' && cfg1.getType() === 'config') ? '无参构造正常' : '无参构造异常'
    );

    // ---------- 测试11: 多实例相互隔离 ----------
    function Counter1() {
        if (!Counter1.shared) Counter1.shared = 0;
        this.id = ++Counter1.shared;
    }
    Counter1.prototype.tag = 'counter';

    const x1 = news(Counter1);
    const x2 = news(Counter1);
    x1.extra = 'onlyX1';

    const isolated = x1.id !== x2.id && x2.extra === undefined && x1.tag === x2.tag;
    addResult(
        '多实例相互隔离',
        '多个实例的实例属性互不影响，但共享原型',
        isolated,
        'id不同, extra不共享, tag共享',
        `x1.id=${x1.id}, x2.id=${x2.id}, x2.extra=${x2.extra}, tag一致:${x1.tag === x2.tag}`,
        isolated ? '实例隔离正常' : '实例隔离异常'
    );

    // ---------- 测试12: 原型引用属性共享 ----------
    function List1() {}
    List1.prototype.items = []; // 原型上的引用类型

    const la = news(List1);
    const lb = news(List1);
    la.items.push('a');

    addResult(
        '原型引用属性共享',
        '原型上的引用类型属性被所有实例共享',
        lb.items.length === 1 && lb.items[0] === 'a' && la.items === lb.items,
        'lb.items包含["a"]且与la.items同引用',
        `lb.items=${JSON.stringify(lb.items)}, 同引用:${la.items === lb.items}`,
        (lb.items.length === 1 && la.items === lb.items) ? '引用共享正常' : '引用共享异常'
    );

    // ---------- 测试13: 构造函数返回函数时使用返回值 ----------
    function FunctionFactory1() {
        this.discarded = true;
        return function () { return 'returnedFunction'; };
    }
    const ff1 = news(FunctionFactory1);

    addResult(
        '构造函数返回函数',
        'return函数时，news应返回该函数',
        typeof ff1 === 'function' && ff1() === 'returnedFunction',
        '返回函数且调用结果为"returnedFunction"',
        `typeof:${typeof ff1}, 调用结果:${typeof ff1 === 'function' ? ff1() : 'N/A'}`,
        (typeof ff1 === 'function' && ff1() === 'returnedFunction') ? '返回函数处理正常' : '返回函数处理异常'
    );

    // ---------- 测试14: 原型链继承（多层） ----------
    function Shape1() { this.shape = 'shape'; }
    Shape1.prototype.getShape = function () { return this.shape; };

    function Circle1(r) {
        Shape1.call(this); // 借用构造
        this.r = r;
    }
    Circle1.prototype = Object.create(Shape1.prototype);
    Circle1.prototype.constructor = Circle1;
    Circle1.prototype.area = function () { return Math.PI * this.r * this.r; };

    const circle1 = news(Circle1, 5);

    const inheritOk = circle1 instanceof Circle1 &&
                      circle1 instanceof Shape1 &&
                      circle1.area() === Math.PI * 25 &&
                      circle1.getShape() === 'shape';
    addResult(
        '原型链继承（多层）',
        'news创建的实例能正确参与原型链继承',
        inheritOk,
        'instanceof Circle1且Shape1, area=25π, getShape="shape"',
        `Circle1:${circle1 instanceof Circle1}, Shape1:${circle1 instanceof Shape1}, area=${circle1.area()}`,
        inheritOk ? '原型链继承正常' : '原型链继承异常'
    );

    // ---------- 测试15: 与原生new行为一致性对比 ----------
    function Compare1(a, b) {
        this.a = a;
        this.b = b;
    }
    Compare1.prototype.sum = function () { return this.a + this.b; };

    const nativeInstance = new Compare1(10, 20);
    const newsInstance = news(Compare1, 10, 20);

    const consistent =
        nativeInstance.a === newsInstance.a &&
        nativeInstance.b === newsInstance.b &&
        nativeInstance.sum() === newsInstance.sum() &&
        Object.getPrototypeOf(nativeInstance) === Object.getPrototypeOf(newsInstance) &&
        nativeInstance.constructor === newsInstance.constructor;

    addResult(
        '与原生new行为一致性对比',
        'news与原生new在同等输入下结果一致',
        consistent,
        '属性、方法、原型、constructor全部一致',
        `a:${nativeInstance.a === newsInstance.a}, sum:${nativeInstance.sum() === newsInstance.sum()}, 原型:${Object.getPrototypeOf(nativeInstance) === Object.getPrototypeOf(newsInstance)}`,
        consistent ? '与原生new一致' : '与原生new存在差异'
    );

    // 打印测试报告
    printReport();

    return testResults;
}

// 执行测试
runNewsTests().catch(err => {
    console.error('测试执行出错:', err);
});
