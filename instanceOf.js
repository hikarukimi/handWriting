// ============================================
// 手写 instanceof 函数（myInstanceof）
// ============================================
function myInstanceof(left, right) {
    if (left === null || (typeof left !== 'object' && typeof left !== 'function')) {
        return false;
    }
    let target = right.prototype; 
    let temp = Object.getPrototypeOf(left);
    while (temp) {
        if (temp === target) {
            return true;
        }
        temp = Object.getPrototypeOf(temp);
    }
    return false;
}
// ============================================
// myInstanceof 函数测试用例
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
    console.log('             myInstanceof 函 数 测 试 报 告');
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

async function runInstanceofTests() {
    console.log('开始执行 myInstanceof 函数测试...\n');

    // ---------- 测试1: 基本类型返回 false ----------
    const primStr = myInstanceof('hello', String);
    const primNum = myInstanceof(123, Number);
    const primBool = myInstanceof(true, Boolean);

    const primOk = primStr === false && primNum === false && primBool === false;
    addResult(
        '基本类型返回 false',
        'string/number/boolean 等基本类型 instanceof 对应包装类应返回 false',
        primOk,
        '全部为 false',
        `string:${primStr}, number:${primNum}, boolean:${primBool}`,
        primOk ? '基本类型处理正常' : '基本类型处理异常'
    );

    // ---------- 测试2: 对象与直接构造函数 ----------
    function Person1(name) { this.name = name; }
    const p1 = new Person1('Tom');
    const directOk = myInstanceof(p1, Person1) === true;

    addResult(
        '对象与直接构造函数',
        '实例 instanceof 自身构造函数应返回 true',
        directOk,
        'myInstanceof(p1, Person1) === true',
        `结果:${myInstanceof(p1, Person1)}`,
        directOk ? '直接构造函数判断正常' : '直接构造函数判断异常'
    );

    // ---------- 测试3: 原型链继承关系 ----------
    function Shape1() { this.shape = 'shape'; }
    function Circle1(r) { Shape1.call(this); this.r = r; }
    Circle1.prototype = Object.create(Shape1.prototype);
    Circle1.prototype.constructor = Circle1;

    const circle1 = new Circle1(5);
    const inheritOk = myInstanceof(circle1, Shape1) === true && myInstanceof(circle1, Circle1) === true;

    addResult(
        '原型链继承关系',
        '子类实例 instanceof 父类应返回 true',
        inheritOk,
        'instanceof Circle1 与 Shape1 均为 true',
        `Circle1:${myInstanceof(circle1, Circle1)}, Shape1:${myInstanceof(circle1, Shape1)}`,
        inheritOk ? '原型链继承判断正常' : '原型链继承判断异常'
    );

    // ---------- 测试4: 非原型链上的构造函数 ----------
    function Animal1() {}
    function Car1() {}
    const a1 = new Animal1();

    const notRelated = myInstanceof(a1, Car1) === false;

    addResult(
        '非原型链上的构造函数',
        '实例 instanceof 无关构造函数应返回 false',
        notRelated,
        'myInstanceof(a1, Car1) === false',
        `结果:${myInstanceof(a1, Car1)}`,
        notRelated ? '无关构造函数判断正常' : '无关构造函数判断异常'
    );

    // ---------- 测试5: 所有对象 instanceof Object ----------
    const objInst = myInstanceof({}, Object);
    const arrInst = myInstanceof([], Object);
    const fnInst = myInstanceof(function () {}, Object);

    const allObjOk = objInst === true && arrInst === true && fnInst === true;

    addResult(
        '所有对象 instanceof Object',
        '普通对象、数组、函数 instanceof Object 均应返回 true',
        allObjOk,
        '全部为 true',
        `object:${objInst}, array:${arrInst}, function:${fnInst}`,
        allObjOk ? 'Object 根对象判断正常' : 'Object 根对象判断异常'
    );

    // ---------- 测试6: 函数 instanceof Function ----------
    function greet1() {}
    const fnIsFunction = myInstanceof(greet1, Function) === true;
    const fnIsObject = myInstanceof(greet1, Object) === true;

    const funcOk = fnIsFunction && fnIsObject;

    addResult(
        '函数 instanceof Function',
        '函数 instanceof Function 与 Object 均应返回 true',
        funcOk,
        'Function:true, Object:true',
        `Function:${myInstanceof(greet1, Function)}, Object:${myInstanceof(greet1, Object)}`,
        funcOk ? '函数类型判断正常' : '函数类型判断异常'
    );

    // ---------- 测试7: 数组 instanceof Array ----------
    const arr1 = [1, 2, 3];
    const arrIsArray = myInstanceof(arr1, Array) === true;
    const arrIsNotObject = myInstanceof(arr1, Object) === true;

    const arrOk = arrIsArray && arrIsNotObject;

    addResult(
        '数组 instanceof Array',
        '数组 instanceof Array 与 Object 均应返回 true',
        arrOk,
        'Array:true, Object:true',
        `Array:${myInstanceof(arr1, Array)}, Object:${myInstanceof(arr1, Object)}`,
        arrOk ? '数组类型判断正常' : '数组类型判断异常'
    );

    // ---------- 测试8: 多层原型链继承 ----------
    function Grand1() { this.g = 'grand'; }
    function Parent1() { Grand1.call(this); this.p = 'parent'; }
    function Child1() { Parent1.call(this); this.c = 'child'; }
    Parent1.prototype = Object.create(Grand1.prototype);
    Parent1.prototype.constructor = Parent1;
    Child1.prototype = Object.create(Parent1.prototype);
    Child1.prototype.constructor = Child1;

    const child1 = new Child1();
    const multiOk = myInstanceof(child1, Child1) &&
                    myInstanceof(child1, Parent1) &&
                    myInstanceof(child1, Grand1) &&
                    myInstanceof(child1, Object);

    addResult(
        '多层原型链继承',
        '三层继承中，实例 instanceof 每一层构造函数均应返回 true',
        multiOk,
        'Child1、Parent1、Grand1、Object 均为 true',
        `Child1:${myInstanceof(child1, Child1)}, Parent1:${myInstanceof(child1, Parent1)}, Grand1:${myInstanceof(child1, Grand1)}, Object:${myInstanceof(child1, Object)}`,
        multiOk ? '多层继承判断正常' : '多层继承判断异常'
    );

    // ---------- 测试9: null 值处理 ----------
    const nullResult = myInstanceof(null, Object);

    addResult(
        'null 值处理',
        'null instanceof 任何构造函数应返回 false',
        nullResult === false,
        'false',
        `结果:${nullResult}`,
        nullResult === false ? 'null 处理正常' : 'null 处理异常'
    );

    // ---------- 测试10: undefined 值处理 ----------
    const undefResult = myInstanceof(undefined, Object);

    addResult(
        'undefined 值处理',
        'undefined instanceof 任何构造函数应返回 false',
        undefResult === false,
        'false',
        `结果:${undefResult}`,
        undefResult === false ? 'undefined 处理正常' : 'undefined 处理异常'
    );

    // ---------- 测试11: Object.create(null) 创建的无原型对象 ----------
    const noProto = Object.create(null);
    const noProtoResult = myInstanceof(noProto, Object);

    addResult(
        'Object.create(null) 无原型对象',
        '无原型链的对象 instanceof Object 应返回 false',
        noProtoResult === false,
        'false',
        `结果:${noProtoResult}`,
        noProtoResult === false ? '无原型对象处理正常' : '无原型对象处理异常'
    );

    // ---------- 测试12: Symbol / BigInt 基本类型 ----------
    const symResult = myInstanceof(Symbol('s'), Symbol);
    const bigResult = typeof BigInt !== 'undefined'
        ? myInstanceof(BigInt(1), BigInt)
        : false; // 兼容不支持 BigInt 的环境

    const primSymbolOk = symResult === false && bigResult === false;

    addResult(
        'Symbol / BigInt 基本类型',
        'Symbol 与 BigInt 基本类型 instanceof 对应类型应返回 false',
        primSymbolOk,
        '全部为 false',
        `symbol:${symResult}, bigint:${bigResult}`,
        primSymbolOk ? 'Symbol/BigInt 处理正常' : 'Symbol/BigInt 处理异常'
    );

    // ---------- 测试13: 包装对象（new String / new Number） ----------
    const wrappedStr = myInstanceof(new String('abc'), String);
    const wrappedNum = myInstanceof(new Number(123), Number);
    const wrappedBool = myInstanceof(new Boolean(true), Boolean);

    const wrappedOk = wrappedStr === true && wrappedNum === true && wrappedBool === true;

    addResult(
        '包装对象判断',
        'new String/new Number/new Boolean instanceof 对应类型应返回 true',
        wrappedOk,
        '全部为 true',
        `String:${wrappedStr}, Number:${wrappedNum}, Boolean:${wrappedBool}`,
        wrappedOk ? '包装对象判断正常' : '包装对象判断异常'
    );

    // ---------- 测试14: 内置类型（Date / RegExp / Error） ----------
    const dateInst = myInstanceof(new Date(), Date);
    const regInst = myInstanceof(/abc/, RegExp);
    const errInst = myInstanceof(new Error('oops'), Error);

    const builtinOk = dateInst === true && regInst === true && errInst === true;

    addResult(
        '内置类型判断',
        'Date / RegExp / Error 实例 instanceof 对应类型应返回 true',
        builtinOk,
        '全部为 true',
        `Date:${dateInst}, RegExp:${regInst}, Error:${errInst}`,
        builtinOk ? '内置类型判断正常' : '内置类型判断异常'
    );

    // ---------- 测试15: 与原生 instanceof 行为一致性对比 ----------
    function Compare1(a, b) { this.a = a; this.b = b; }
    function SubCompare1() { Compare1.apply(this, arguments); }
    SubCompare1.prototype = Object.create(Compare1.prototype);
    SubCompare1.prototype.constructor = SubCompare1;

    const nativeInst = new SubCompare1(1, 2);

    const cases = [
        { left: nativeInst, right: SubCompare1 },
        { left: nativeInst, right: Compare1 },
        { left: nativeInst, right: Object },
        { left: nativeInst, right: Array },
        { left: 'str', right: String },
        { left: null, right: Object },
        { left: [], right: Array },
        { left: [], right: Object }
    ];

    const consistent = cases.every(c => myInstanceof(c.left, c.right) === (c.left instanceof c.right));

    addResult(
        '与原生 instanceof 行为一致性对比',
        'myInstanceof 与原生 instanceof 在多种输入下结果完全一致',
        consistent,
        '所有对比用例结果一致',
        `对比用例数:${cases.length}, 一致:${consistent}`,
        consistent ? '与原生 instanceof 一致' : '与原生 instanceof 存在差异'
    );

    // 打印测试报告
    printReport();

    return testResults;
}

// 执行测试
runInstanceofTests().catch(err => {
    console.error('测试执行出错:', err);
});
