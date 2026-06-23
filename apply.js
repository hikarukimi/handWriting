Function.prototype.myApply=function(that,args){
    if(!(this instanceof Function)){
        throw new TypeError('Function.myApply must be called on a function')
    }
    if(!(typeof that==='object')|| !that){
        that=global
    }
    const fnKey=Symbol('fn')
    that[fnKey]=this
    const res=that[fnKey](...(args??[]))
    delete that[fnKey]
    return res
}
// ============================================
// apply 方法测试用例
// ============================================

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
    console.log('                    apply 方法测试报告');
    console.log('='.repeat(60));
    console.log(`\n📊 统计概览:`);
    console.log(`   总测试数: ${testResults.total}`);
    console.log(`   ✅ 通过:   ${testResults.passed}`);
    console.log(`   ❌ 失败:   ${testResults.failed}`);
    console.log(`   📈 通过率: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`);

    console.log(`\n📋 详细结果:\n`);

    testResults.tests.forEach((test, index) => {
        const icon = test.passed ? '✅' : '❌';
        console.log(`${icon} 测试${index + 1}: ${test.name}`);
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

function runApplyTests() {
    console.log('开始执行 apply 方法测试...\n');

    // ---------- 测试1: 基本功能 - this 指向正确 ----------
    let capturedThis = null;
    const fn1 = function() { capturedThis = this; };
    const obj1 = { name: 'testObject' };

    fn1.myApply(obj1);

    addResult(
        '基本功能 - this指向正确',
        'apply应将函数的this绑定到传入的上下文对象',
        capturedThis === obj1,
        'this === obj1',
        capturedThis === obj1 ? 'this指向正确' : 'this指向错误',
        capturedThis === obj1 ? 'this绑定正常' : 'this绑定异常'
    );

    // ---------- 测试2: 参数传递完整 ----------
    let capturedArgs = null;
    const fn2 = function(...args) { capturedArgs = args; };
    const obj2 = {};

    fn2.myApply(obj2, ['arg1', 'arg2', { key: 'value' }]);

    const argsMatch = capturedArgs &&
                      capturedArgs.length === 3 &&
                      capturedArgs[0] === 'arg1' &&
                      capturedArgs[1] === 'arg2' &&
                      capturedArgs[2]?.key === 'value';

    addResult(
        '参数传递完整',
        'apply应以数组形式传递所有参数',
        argsMatch,
        '参数: ["arg1", "arg2", {key:"value"}]',
        `参数: ${JSON.stringify(capturedArgs)}`,
        argsMatch ? '参数传递正确' : '参数传递有误'
    );

    // ---------- 测试3: 返回值正确 ----------
    const fn3 = function(a, b) { return a + b; };
    const obj3 = {};

    const result3 = fn3.myApply(obj3, [3, 5]);

    addResult(
        '返回值正确',
        'apply应返回原函数的执行结果',
        result3 === 8,
        '返回值 === 8',
        `返回值 === ${result3}`,
        result3 === 8 ? '返回值正确' : '返回值错误'
    );

    // ---------- 测试4: 无上下文时默认window ----------
    let globalCaptured = null;
    const fn4 = function() { globalCaptured = this; };

    fn4.myApply(null);

    const isGlobal = globalCaptured === globalThis;

    addResult(
        '无上下文时默认window',
        '传入null时this应指向全局对象',
        isGlobal,
        'this === globalThis',
        `this === ${globalCaptured === globalThis ? 'globalThis' : '其他对象'}`,
        isGlobal ? '默认指向全局对象' : '未指向全局对象'
    );

    // ---------- 测试5: undefined作为上下文 ----------
    let undefinedCaptured = null;
    const fn5 = function() { undefinedCaptured = this; };

    fn5.myApply(undefined);

    const isGlobal5 = undefinedCaptured === globalThis;

    addResult(
        'undefined作为上下文',
        '传入undefined时this应指向全局对象',
        isGlobal5,
        'this === globalThis',
        `this === ${undefinedCaptured === globalThis ? 'globalThis' : '其他对象'}`,
        isGlobal5 ? 'undefined处理正常' : 'undefined处理异常'
    );

    // ---------- 测试6: 无参数调用 ----------
    let callCount = 0;
    const fn6 = function() { callCount++; };
    const obj6 = {};

    fn6.myApply(obj6);

    addResult(
        '无参数调用',
        '不传参数数组时应正常执行',
        callCount === 1,
        '执行1次',
        `执行${callCount}次`,
        callCount === 1 ? '无参数调用正常' : '无参数调用异常'
    );

    // ---------- 测试7: 属性不污染上下文对象 ----------
    const obj7 = { existing: 'value' };
    const fn7 = function() { return this.existing; };

    fn7.myApply(obj7);
    const keys7 = Object.keys(obj7);

    addResult(
        '属性不污染上下文对象',
        '调用后应删除临时添加的函数属性',
        keys7.length === 1 && keys7[0] === 'existing',
        '对象仅含原有属性',
        `对象属性: ${JSON.stringify(keys7)}`,
        keys7.length === 1 ? '属性清理正常' : '属性清理失败'
    );

    // ---------- 测试8: 非函数调用报错 ----------
    let errorThrown = false;
    try {
        // 模拟通过 call 等方式以非函数调用
        const notAFunction = {};
        Function.prototype.myApply.call(notAFunction, null, []);
    } catch (e) {
        errorThrown = e instanceof TypeError;
    }

    addResult(
        '非函数调用报错',
        '调用对象不是函数时应抛出TypeError',
        errorThrown,
        '抛出TypeError',
        errorThrown ? '已抛出TypeError' : '未抛出错误',
        errorThrown ? '类型校验正常' : '类型校验缺失'
    );


    // ---------- 测试10: 对象方法借用 ----------
    const obj10 = {
        x: 10,
        getX() { return this.x; }
    };
    const obj10B = { x: 99 };

    const result10 = obj10.getX.myApply(obj10B);

    addResult(
        '对象方法借用',
        '借用其他对象的方法并绑定新上下文',
        result10 === 99,
        '返回值 === 99',
        `返回值 === ${result10}`,
        result10 === 99 ? '方法借用正常' : '方法借用异常'
    );

    // ---------- 测试11: 多次调用独立性 ----------
    let count = 0;
    const fn11 = function() { count++; };
    const obj11 = {};

    fn11.myApply(obj11);
    fn11.myApply(obj11);
    fn11.myApply(obj11);

    addResult(
        '多次调用独立性',
        '多次调用应互不影响，各自独立执行',
        count === 3,
        '执行3次',
        `执行${count}次`,
        count === 3 ? '多次调用正常' : '多次调用异常'
    );

    // ---------- 测试12: 数组方法借用 ----------
    const arrayLike12 = { 0: 'a', 1: 'b', 2: 'c', length: 3 };

    // 借用 Array.prototype.push
    Array.prototype.push.myApply(arrayLike12, ['d']);

    const pushOk = arrayLike12.length === 4 && arrayLike12[3] === 'd';

    addResult(
        '数组方法借用',
        '借用Array.prototype.push操作类数组对象',
        pushOk,
        'length===4, [3]==="d"',
        `length===${arrayLike12.length}, [3]==="${arrayLike12[3]}"`,
        pushOk ? '数组方法借用正常' : '数组方法借用异常'
    );

    // ---------- 测试13: 空数组作为参数 ----------
    let capturedArgs13 = null;
    const fn13 = function(...args) { capturedArgs13 = args; };
    const obj13 = {};

    fn13.myApply(obj13, []);

    addResult(
        '空数组作为参数',
        '传入空数组时函数应无参数执行',
        Array.isArray(capturedArgs13) && capturedArgs13.length === 0,
        '参数为空数组',
        `参数: ${JSON.stringify(capturedArgs13)}`,
        capturedArgs13?.length === 0 ? '空数组处理正常' : '空数组处理异常'
    );

    // ---------- 测试14: 嵌套对象上下文访问 ----------
    const obj14 = {
        user: {
            name: 'Alice',
            age: 25
        },
        getInfo(greeting) {
            return `${greeting}, ${this.user.name} is ${this.user.age}`;
        }
    };
    const obj14B = {
        user: { name: 'Bob', age: 30 }
    };

    const result14 = obj14.getInfo.myApply(obj14B, ['Hello']);

    addResult(
        '嵌套对象上下文访问',
        'this应正确绑定到嵌套结构的新上下文',
        result14 === 'Hello, Bob is 30',
        '返回 "Hello, Bob is 30"',
        `返回 "${result14}"`,
        result14 === 'Hello, Bob is 30' ? '嵌套上下文正常' : '嵌套上下文异常'
    );

    // ---------- 测试15: this内部访问属性并修改 ----------
    const obj15 = { count: 0 };
    const fn15 = function(n) { this.count += n; };

    fn15.myApply(obj15, [5]);
    fn15.myApply(obj15, [10]);

    addResult(
        'this内部访问属性并修改',
        '函数内通过this修改上下文对象属性',
        obj15.count === 15,
        'obj.count === 15',
        `obj.count === ${obj15.count}`,
        obj15.count === 15 ? '属性修改正常' : '属性修改异常'
    );

    // 打印测试报告
    printReport();

    return testResults;
}

// 执行测试
runApplyTests();
