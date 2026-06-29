// ============================================
// 手写 bind 实现
// ============================================
Function.prototype.myBind = function (context, ...args) {
    const fn = this;
    const bound = function (...innerArgs) {
        const isNew = this instanceof bound;
        return fn.apply(isNew ? this : context, [...args, ...innerArgs]);
    };
    if (fn.prototype) bound.prototype = Object.create(fn.prototype);
    return bound;
};




// ============================================
// 测试框架
// ============================================
const testResults = { total: 0, passed: 0, failed: 0, tests: [] };

function addResult(name, description, passed, expected, actual, detail = '') {
    testResults.total++;
    if (passed) testResults.passed++;
    else testResults.failed++;
    testResults.tests.push({ name, description, passed, expected, actual, detail });
}

function printLine(char = '=', length = 60) {
    console.log(char.repeat(length));
}

function printReport() {
    printLine();
    console.log('                    bind 方法测试报告');
    printLine();
    console.log(`\n📊 统计概览:`);
    console.log(`   总测试数: ${testResults.total}`);
    console.log(`   ✅ 通过:   ${testResults.passed}`);
    console.log(`   ❌ 失败:   ${testResults.failed}`);
    console.log(`   📈 通过率: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`);
    console.log(`\n📋 详细结果:\n`);
    testResults.tests.forEach((test, index) => {
        const icon = test.passed ? '✅' : '❌';
        const status = test.passed ? '通过' : '失败';
        console.log(`${icon} 测试 ${index + 1}: ${test.name} [${status}]`);
        console.log(`   描述: ${test.description}`);
        if (!test.passed) {
            console.log(`   期望: ${test.expected}`);
            console.log(`   实际: ${test.actual}`);
        }
        if (test.detail) console.log(`   详情: ${test.detail}`);
        console.log('');
    });
    printLine();
    if (testResults.failed === 0) console.log('🎉 所有测试全部通过！');
    else console.log(`⚠️  有 ${testResults.failed} 个测试未通过，请检查实现。`);
    printLine();
}

// ============================================
// 测试用例
// ============================================
function runTests() {
    console.log('开始执行 bind 方法测试...\n');

    // ---------- 测试1: 基本 this 绑定 ----------
    const obj1 = { name: 'Alice' };
    function greet(prefix) { return `${prefix}, ${this.name}`; }
    const bound1 = greet.myBind(obj1, 'Hello');
    const r1 = bound1();
    addResult(
        '基本 this 绑定',
        '函数 this 指向传入对象',
        r1 === 'Hello, Alice',
        'Hello, Alice',
        r1,
        r1 === 'Hello, Alice' ? 'this 绑定正确' : 'this 绑定错误'
    );

    // ---------- 测试2: this 固定性 ----------
    const obj2a = { name: 'Alice' };
    const obj2b = { name: 'Bob', method: greet.myBind(obj2a, 'Hi') };
    const r2 = obj2b.method();
    addResult(
        'this 固定性',
        '绑定后即使挂到其他对象上调用,this 仍指向原绑定对象',
        r2 === 'Hi, Alice',
        'Hi, Alice',
        r2,
        r2 === 'Hi, Alice' ? 'this 固定正确' : 'this 被改变'
    );

    // ---------- 测试3: 预设参数(柯里化) ----------
    function add3(a, b, c) { return a + b + c; }
    const addTen = add3.myBind(null, 10);
    const r3 = addTen(20, 30);
    addResult(
        '预设参数(柯里化)',
        'bind 时预设首个参数',
        r3 === 60,
        '60',
        String(r3),
        r3 === 60 ? '预设参数生效' : '预设参数错误'
    );

    // ---------- 测试4: 调用时追加参数 ----------
    const partial = add3.myBind(null, 1, 2);
    const r4 = partial(3);
    addResult(
        '调用时追加参数',
        '预设参数与调用参数合并',
        r4 === 6,
        '6',
        String(r4),
        r4 === 6 ? '参数合并正确' : '参数合并错误'
    );

    // ---------- 测试5: 参数顺序 ----------
    function concat5(a, b, c, d) { return [a, b, c, d].join('-'); }
    const ordered = concat5.myBind(null, 'P1', 'P2');
    const r5 = ordered('C1', 'C2');
    addResult(
        '参数顺序',
        '预设参数在前,调用参数在后',
        r5 === 'P1-P2-C1-C2',
        'P1-P2-C1-C2',
        r5,
        r5 === 'P1-P2-C1-C2' ? '参数顺序正确' : '参数顺序错误'
    );

    // ---------- 测试6: 多个预设 + 多个调用参数 ----------
    function sum6(...nums) { return nums.reduce((a, b) => a + b, 0); }
    const sumBase = sum6.myBind(null, 1, 2, 3);
    const r6 = sumBase(4, 5, 6);
    addResult(
        '多参数合并',
        '多个预设参数与多个调用参数合并',
        r6 === 21,
        '21',
        String(r6),
        r6 === 21 ? '多参数合并正确' : '多参数合并错误'
    );

    // ---------- 测试7: new 构造调用忽略绑定 this ----------
    function Person(name, age) {
        this.name = name;
        this.age = age;
    }
    Person.prototype.greet = function () { return 'Hi, ' + this.name; };
    const BoundPerson = Person.myBind({ name: 'FakeContext' }, 'DefaultName');
    const p = new BoundPerson(18);
    addResult(
        'new 调用忽略绑定 this',
        '作为构造函数时 this 指向实例,而非绑定的 context',
        p.name === 'DefaultName',
        'name === DefaultName',
        `name === ${p.name}`,
        p.name === 'DefaultName' ? '构造调用正确' : '使用了绑定 this'
    );

    // ---------- 测试8: new 时预设参数与调用参数合并 ----------
    addResult(
        'new 参数合并',
        'new 调用时预设参数与传入参数合并',
        p.age === 18,
        'age === 18',
        `age === ${p.age}`,
        p.age === 18 ? '参数合并正确' : '参数合并错误'
    );

    // ---------- 测试9: 原型链方法继承 ----------
    const r9 = p.greet();
    addResult(
        '原型链方法继承',
        'new 出的实例能访问原函数原型上的方法',
        r9 === 'Hi, DefaultName',
        'Hi, DefaultName',
        r9,
        r9 === 'Hi, DefaultName' ? '原型链正确' : '原型链断裂'
    );

    // ---------- 测试10: 返回新函数,原函数不受影响 ----------
    function origFn() { return this.name; }
    const context10 = { name: 'Ctx' };
    const bound10 = origFn.myBind(context10);
    addResult(
        '原函数不受影响',
        'bind 返回新函数,直接调用原函数 this 不变',
        typeof bound10 === 'function' && bound10 !== origFn,
        'bound 是新函数且不等于原函数',
        `typeof bound = ${typeof bound10}, 相等=${bound10 === origFn}`,
        typeof bound10 === 'function' && bound10 !== origFn ? '返回新函数正确' : '返回值异常'
    );

    // ---------- 测试11: 多次独立调用各自独立 ----------
    let log11 = [];
    const counter = (function () {
        let n = 0;
        return function (tag) { log11.push(`${tag}:${++n}`); };
    })();
    const bound11 = counter.myBind(null);
    bound11('A');
    bound11('B');
    bound11('C');
    addResult(
        '多次独立调用',
        '返回的函数可重复调用且互不干扰',
        log11.join(',') === 'A:1,B:2,C:3',
        'A:1,B:2,C:3',
        log11.join(','),
        log11.join(',') === 'A:1,B:2,C:3' ? '多次调用正常' : '调用异常'
    );

    // ---------- 测试12: 与原生 bind 一致性对比 ----------
    function compare(a, b) { return `${this.tag}-${a}-${b}`; }
    const ctx12 = { tag: 'X' };
    const native = compare.bind(ctx12, 'n1');
    const mine = compare.myBind(ctx12, 'm1');
    const rn = native('n2');
    const rm = mine('m2');
    // 两者结构一致:都为 `${tag}-${预设}-${调用}`
    const consistent = rn === 'X-n1-n2' && rm === 'X-m1-m2';
    addResult(
        '与原生 bind 一致性',
        '行为模式与原生 bind 保持一致',
        consistent,
        '原生: X-n1-n2 / 手写: X-m1-m2',
        `原生: ${rn} / 手写: ${rm}`,
        consistent ? '行为一致' : '行为不一致'
    );

    printReport();
    return testResults;
}

// ============================================
// 执行测试
// ============================================
runTests();
