// ============================================
// 手写 curry 实现
// ============================================
function curry(fn){
    const that=this
    let len=fn.length    
    return function curried(){
        let argsTmp=[...arguments]
        if(argsTmp.length>=len){
            return fn.apply(that,argsTmp)
        }else{
            return (...args)=>{
                return curried(...argsTmp,...args)
            }
        }
    }
}

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

function printReport() {
    console.log('='.repeat(60));
    console.log('                  curry 测试报告');
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
        if (test.detail) console.log(`   详情: ${test.detail}`);
        console.log('');
    });
    console.log('='.repeat(60));
    if (testResults.failed === 0) console.log('🎉 所有测试全部通过！');
    else console.log(`⚠️  有 ${testResults.failed} 个测试未通过，请检查实现。`);
    console.log('='.repeat(60));
}

// 辅助:深比较(支持原始值、数组、普通对象)
function deepEqual(a, b) {
    if (a === b) return true;
    if (typeof a !== typeof b) return false;
    if (a == null || b == null) return a === b;
    if (Array.isArray(a) && Array.isArray(b)) {
        return a.length === b.length && a.every((v, i) => deepEqual(v, b[i]));
    }
    if (typeof a === 'object' && typeof b === 'object') {
        const ka = Object.keys(a), kb = Object.keys(b);
        return ka.length === kb.length && ka.every(k => deepEqual(a[k], b[k]));
    }
    return false;
}

// ============================================
// 测试用例
// ============================================
async function runCurryTests() {
    console.log('开始执行 curry 测试...\n');

    // 被测函数
    function sum3(a, b, c) { return a + b + c; }
    function sum2(a, b) { return a + b; }
    function sum4(a, b, c, d) { return a + b + c + d; }
    function sum5(a, b, c, d, e) { return a + b + c + d + e; }
    function join3(a, b, c) { return `${a}-${b}-${c}`; }
    function getAnswer() { return 42; }
    function double(x) { return x * 2; }
    function merge(obj, key, val) { return { ...obj, [key]: val }; }

    // ---------- 测试1: 基本逐个柯里化 ----------
    const r1 = curry(sum3)(1)(2)(3);
    addResult(
        '基本逐个柯里化',
        '每次传入一个参数,逐步收集直到执行',
        r1 === 6,
        '6',
        String(r1),
        r1 === 6 ? '逐个传参正确' : '结果错误'
    );

    // ---------- 测试2: 一次传入全部参数 ----------
    const r2 = curry(sum3)(1, 2, 3);
    addResult(
        '一次传入全部参数',
        '参数足够时立即执行,无需多次调用',
        r2 === 6,
        '6',
        String(r2),
        r2 === 6 ? '一次传参正确' : '结果错误'
    );

    // ---------- 测试3: 分批传参 ----------
    const r3a = curry(sum3)(1, 2)(3);
    const r3b = curry(sum3)(1)(2, 3);
    addResult(
        '分批传参',
        '先传部分再传剩余,两种切分方式结果一致',
        r3a === 6 && r3b === 6,
        '6',
        `${r3a}, ${r3b}`,
        r3a === 6 && r3b === 6 ? '分批传参正确' : '分批传参异常'
    );

    // ---------- 测试4: 柯里化函数多次复用 ----------
    const csum = curry(sum3);
    const r4a = csum(1)(2)(3);
    const r4b = csum(10)(20)(30);
    addResult(
        '柯里化函数多次复用',
        '同一柯里化函数可被多次独立使用,互不干扰',
        r4a === 6 && r4b === 60,
        '6, 60',
        `${r4a}, ${r4b}`,
        r4a === 6 && r4b === 60 ? '复用正确' : '复用异常'
    );

    // ---------- 测试5: 部分应用并复用 ----------
    const addOne = curry(sum3)(1);
    const r5a = addOne(2)(3);
    const r5b = addOne(4)(5);
    addResult(
        '部分应用并复用',
        '固定首参后得到的函数可重复调用',
        r5a === 6 && r5b === 10,
        '6, 10',
        `${r5a}, ${r5b}`,
        r5a === 6 && r5b === 10 ? '部分应用复用正确' : '部分应用复用异常'
    );

    // ---------- 测试6: 多参数函数(4参) ----------
    const cs = curry(sum4);
    const r6a = cs(1)(2)(3)(4);
    const r6b = cs(1, 2)(3, 4);
    const r6c = cs(1, 2, 3, 4);
    addResult(
        '多参数函数(4参)',
        '4 参函数支持逐个、分批、一次传满三种调用',
        r6a === 10 && r6b === 10 && r6c === 10,
        '10, 10, 10',
        `${r6a}, ${r6b}, ${r6c}`,
        r6a === 10 && r6b === 10 && r6c === 10 ? '多参数处理正确' : '多参数处理异常'
    );

    // ---------- 测试7: 参数过多被忽略 ----------
    const r7 = curry(sum2)(1, 2, 3);
    addResult(
        '参数过多被忽略',
        '超出形参数量的额外参数传入后,原函数仅使用前若干个',
        r7 === 3,
        '3',
        String(r7),
        r7 === 3 ? '多余参数处理正确' : '多余参数处理异常'
    );

    // ---------- 测试8: 零参数函数立即执行 ----------
    const cg = curry(getAnswer);
    const r8a = cg();
    const r8b = cg(1);
    addResult(
        '零参数函数立即执行',
        'func.length 为 0 时,任意调用都立即执行原函数',
        r8a === 42 && r8b === 42,
        '42, 42',
        `${r8a}, ${r8b}`,
        r8a === 42 && r8b === 42 ? '零参函数处理正确' : '零参函数处理异常'
    );

    // ---------- 测试9: 复杂类型作为参数 ----------
    const cm = curry(merge);
    const r9 = cm({ a: 1 })('b')(2);
    addResult(
        '复杂类型作为参数',
        '对象、字符串、数字作为参数被正确传递与合并',
        deepEqual(r9, { a: 1, b: 2 }),
        '{a:1, b:2}',
        JSON.stringify(r9),
        deepEqual(r9, { a: 1, b: 2 }) ? '复杂类型正确' : '复杂类型异常'
    );

    // ---------- 测试10: 字符串拼接(顺序保持) ----------
    const r10a = curry(join3)('a')('b')('c');
    const r10b = curry(join3)('a', 'b')('c');
    const r10c = curry(join3)('a')('b', 'c');
    addResult(
        '字符串拼接(顺序保持)',
        '参数按传入顺序拼接,三种切分方式结果一致',
        r10a === 'a-b-c' && r10b === 'a-b-c' && r10c === 'a-b-c',
        'a-b-c',
        `${r10a}, ${r10b}, ${r10c}`,
        r10a === 'a-b-c' && r10b === 'a-b-c' && r10c === 'a-b-c' ? '顺序保持正确' : '顺序保持异常'
    );

    // ---------- 测试11: 中间函数可复用 ----------
    const step = curry(sum3)(1, 2);
    const r11a = step(3);
    const r11b = step(30);
    addResult(
        '中间函数可复用',
        '收集部分参数后得到的中间函数可多次调用',
        r11a === 6 && r11b === 33,
        '6, 33',
        `${r11a}, ${r11b}`,
        r11a === 6 && r11b === 33 ? '中间函数复用正确' : '中间函数复用异常'
    );

    // ---------- 测试12: 单参数函数 ----------
    const cd = curry(double);
    const r12 = cd(5);
    addResult(
        '单参数函数',
        '单参函数首次调用即满足条件并执行',
        r12 === 10,
        '10',
        String(r12),
        r12 === 10 ? '单参函数正确' : '单参函数异常'
    );

    // ---------- 测试13: 五参数函数 ----------
    const r13a = curry(sum5)(1)(2)(3)(4)(5);
    const r13b = curry(sum5)(1, 2)(3, 4)(5);
    const r13c = curry(sum5)(1, 2, 3, 4, 5);
    addResult(
        '五参数函数',
        '5 参函数支持逐个、分批、一次传满三种调用',
        r13a === 15 && r13b === 15 && r13c === 15,
        '15, 15, 15',
        `${r13a}, ${r13b}, ${r13c}`,
        r13a === 15 && r13b === 15 && r13c === 15 ? '五参数处理正确' : '五参数处理异常'
    );

    // ---------- 测试14: 混合类型参数 ----------
    function mix(a, b, c) { return `${typeof a}:${a}|${typeof b}:${b}|${typeof c}:${c}`; }
    const r14 = curry(mix)(0)(true)('str');
    addResult(
        '混合类型参数',
        '数字、布尔、字符串混合传入,类型与值正确',
        r14 === 'number:0|boolean:true|string:str',
        'number:0|boolean:true|string:str',
        r14,
        r14 === 'number:0|boolean:true|string:str' ? '混合类型正确' : '混合类型异常'
    );

    // ---------- 测试15: 未满参时返回函数 ----------
    const partial = curry(sum3)(1);
    addResult(
        '未满参时返回函数',
        '参数不足时返回值为 function,可继续接收参数',
        typeof partial === 'function',
        'function',
        typeof partial,
        typeof partial === 'function' ? '返回函数正确' : '返回函数异常'
    );

    printReport();
    return testResults;
}

// 执行测试
runCurryTests().catch(err => {
    console.error('测试执行出错:', err);
});
