// ============================================
// 手写 Promise.all 实现
// ============================================
function promiseAll(promises){
    let reses=new Array(promises.length).fill(null)
    let reson=null
    let cou=0
    return new Promise((resolve,reject)=>{
        if (promises.length === 0) {
            resolve(reses);
            return;
        }
        for(let i=0;i<promises.length;i++){

            const pro=promises[i]
            Promise.resolve(pro).then((res)=>{
                cou++
                reses[i]=res
                if(cou===reses.length){
                    resolve(reses)
                }
            }).catch((res)=>{
                reson=res
                reject(res)
            })
        }
    })
}

// ============================================
// 测试框架(沿用原结构)
// ============================================
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const testResults = { total: 0, passed: 0, failed: 0, tests: [] };

function addResult(name, description, passed, expected, actual, detail = '') {
    testResults.total++;
    if (passed) testResults.passed++;
    else testResults.failed++;
    testResults.tests.push({ name, description, passed, expected, actual, detail });
}

function printReport() {
    console.log('='.repeat(60));
    console.log('                 Promise.all 测试报告');
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

// 辅助:对比实际值是否与期望数组深度相等(顺序敏感)
function arrayEqual(actual, expected) {
    if (!Array.isArray(actual) || actual.length !== expected.length) return false;
    return expected.every((v, i) => actual[i] === v);
}

// ============================================
// 测试用例
// ============================================
async function runPromiseAllTests() {
    console.log('开始执行 Promise.all 测试...\n');

    // ---------- 测试1: 所有 Promise 都 resolve ----------
    const p1 = Promise.resolve(1);
    const p2 = Promise.resolve(2);
    const p3 = Promise.resolve(3);
    const r1 = await promiseAll([p1, p2, p3]);
    const passed1 = arrayEqual(r1, [1, 2, 3]);
    addResult(
        '所有 Promise 都 resolve',
        '全部成功时返回结果数组',
        passed1,
        '[1, 2, 3]',
        JSON.stringify(r1),
        passed1 ? '结果正确' : '结果错误'
    );

    // ---------- 测试2: 结果顺序与输入一致 ----------
    // 让后启动的先 resolve,验证顺序仍按输入下标
    const r2 = await promiseAll([
        sleep(60).then(() => 'slow'),
        sleep(20).then(() => 'fast'),
        sleep(40).then(() => 'mid'),
    ]);
    const passed2 = arrayEqual(r2, ['slow', 'fast', 'mid']);
    addResult(
        '结果顺序保持',
        '完成顺序不同,但结果按输入顺序排列',
        passed2,
        '["slow","fast","mid"]',
        JSON.stringify(r2),
        passed2 ? '顺序正确' : '顺序错乱'
    );

    // ---------- 测试3: 任一 reject 则整体 reject ----------
    let rejected3 = false;
    let reason3 = null;
    try {
        await promiseAll([
            Promise.resolve(1),
            Promise.reject('boom'),
            Promise.resolve(3),
        ]);
    } catch (e) {
        rejected3 = true;
        reason3 = e;
    }
    addResult(
        '任一 reject 则整体 reject',
        '存在失败项时整体 reject',
        rejected3 && reason3 === 'boom',
        'reject,reason="boom"',
        rejected3 ? `reject,reason="${reason3}"` : '未 reject',
        rejected3 && reason3 === 'boom' ? '快速失败正确' : '快速失败异常'
    );

    // ---------- 测试4: 空数组返回空数组 ----------
    const r4 = await promiseAll([]);
    addResult(
        '空数组',
        '传入空数组应 resolve 为空数组',
        Array.isArray(r4) && r4.length === 0,
        '[]',
        JSON.stringify(r4),
        Array.isArray(r4) && r4.length === 0 ? '空数组正确' : '空数组异常'
    );

    // ---------- 测试5: 非 Promise 值(数字) ----------
    const r5 = await promiseAll([1, 2, 3]);
    const passed5 = arrayEqual(r5, [1, 2, 3]);
    addResult(
        '非 Promise 值(数字)',
        '原始值应被包装并原样返回',
        passed5,
        '[1, 2, 3]',
        JSON.stringify(r5),
        passed5 ? '原始值处理正确' : '原始值处理异常'
    );

    // ---------- 测试6: 混合 Promise 与非 Promise ----------
    const r6 = await promiseAll([0, Promise.resolve(1), 2, Promise.resolve(3)]);
    const passed6 = arrayEqual(r6, [0, 1, 2, 3]);
    addResult(
        '混合 Promise 与非 Promise',
        '原始值与 Promise 混合,结果按顺序合并',
        passed6,
        '[0, 1, 2, 3]',
        JSON.stringify(r6),
        passed6 ? '混合处理正确' : '混合处理异常'
    );

    // ---------- 测试7: 并发执行(耗时约等于最慢的一个) ----------
    const start7 = Date.now();
    await promiseAll([
        sleep(50).then(() => 'a'),
        sleep(80).then(() => 'b'),
        sleep(30).then(() => 'c'),
    ]);
    const elapsed7 = Date.now() - start7;
    // 并发下总耗时应接近最慢的 80ms,而非串行的 160ms
    const passed7 = elapsed7 >= 70 && elapsed7 < 140;
    addResult(
        '并发执行',
        '总耗时接近最慢项而非串行累加',
        passed7,
        '约 70~140ms',
        `${elapsed7}ms`,
        passed7 ? '并发执行正确' : `可能串行执行(${elapsed7}ms)`
    );

    // ---------- 测试8: reject 与 resolve 交错(第一个就 reject) ----------
    let reason8 = null;
    try {
        await promiseAll([
            Promise.reject('first-fail'),
            sleep(50).then(() => 'ok'),
        ]);
    } catch (e) {
        reason8 = e;
    }
    addResult(
        '首项即 reject',
        '第一个就失败应立即 reject',
        reason8 === 'first-fail',
        'reason="first-fail"',
        `reason="${reason8}"`,
        reason8 === 'first-fail' ? '首项失败处理正确' : '首项失败处理异常'
    );

    // ---------- 测试9: 延迟 reject 也能捕获 ----------
    let reason9 = null;
    let caught9 = false;
    try {
        await promiseAll([
            sleep(30).then(() => 'ok'),
            sleep(50).then(() => { throw 'delayed-fail'; }),
        ]);
    } catch (e) {
        caught9 = true;
        reason9 = e;
    }
    addResult(
        '延迟 reject 捕获',
        '异步 reject 也能被捕获',
        caught9 && reason9 === 'delayed-fail',
        'reason="delayed-fail"',
        caught9 ? `reason="${reason9}"` : '未捕获',
        caught9 && reason9 === 'delayed-fail' ? '延迟失败捕获正确' : '延迟失败捕获异常'
    );

    // ---------- 测试10: 单个 Promise ----------
    const r10 = await promiseAll([Promise.resolve(42)]);
    addResult(
        '单个 Promise',
        '仅一个元素时正确返回单元素数组',
        arrayEqual(r10, [42]),
        '[42]',
        JSON.stringify(r10),
        arrayEqual(r10, [42]) ? '单项正确' : '单项异常'
    );

    // ---------- 测试11: 对象/数组作为 resolve 值 ----------
    const r11 = await promiseAll([
        Promise.resolve({ name: 'Alice' }),
        Promise.resolve([1, 2, 3]),
    ]);
    const passed11 = r11[0]?.name === 'Alice' &&
                     Array.isArray(r11[1]) && r11[1].length === 3;
    addResult(
        '复杂类型作为 resolve 值',
        '对象和数组作为结果正确返回',
        passed11,
        '[{name:"Alice"},[1,2,3]]',
        JSON.stringify(r11),
        passed11 ? '复杂类型正确' : '复杂类型异常'
    );

    // ---------- 测试12: 字符串等可迭代输入 ----------
    // 字符串可迭代,promiseAll 会把每个字符作为非 Promise 值
    const r12 = await promiseAll('abc');
    const passed12 = arrayEqual(r12, ['a', 'b', 'c']);
    addResult(
        '可迭代输入(字符串)',
        '字符串作为可迭代对象处理',
        passed12,
        '["a","b","c"]',
        JSON.stringify(r12),
        passed12 ? '可迭代处理正确' : '可迭代处理异常'
    );

    // ---------- 测试13: 与原生 Promise.all 行为一致性 ----------
    const input13 = [1, Promise.resolve(2), sleep(20).then(() => 3)];
    const [native13, mine13] = await Promise.all([
        Promise.all(input13),
        promiseAll([1, Promise.resolve(2), sleep(20).then(() => 3)]),
    ]);
    const passed13 = arrayEqual(native13, [1, 2, 3]) && arrayEqual(mine13, [1, 2, 3]);
    addResult(
        '与原生 Promise.all 一致性',
        '行为与原生实现保持一致',
        passed13,
        '原生 [1,2,3] / 手写 [1,2,3]',
        `原生 ${JSON.stringify(native13)} / 手写 ${JSON.stringify(mine13)}`,
        passed13 ? '行为一致' : '行为不一致'
    );

    // ---------- 测试14: thenable 对象 ----------
    // 含 then 方法的对象会被当 thenable 处理
    const thenable = { then: (resolve) => resolve('thenable-value') };
    const r14 = await promiseAll([thenable, Promise.resolve('normal')]);
    const passed14 = arrayEqual(r14, ['thenable-value', 'normal']);
    addResult(
        'thenable 对象',
        '含 then 方法的对象按 thenable 解析',
        passed14,
        '["thenable-value","normal"]',
        JSON.stringify(r14),
        passed14 ? 'thenable 处理正确' : 'thenable 处理异常'
    );

    // ---------- 测试15: 全部 reject 时取第一个失败原因 ----------
    // 三个都 reject,但 promiseAll 应捕获第一个 reject
    let reason15 = null;
    let order15 = [];
    try {
        await promiseAll([
            sleep(40).then(() => { order15.push('r3'); throw 'third'; }),
            sleep(10).then(() => { order15.push('r1'); throw 'first'; }),
            sleep(20).then(() => { order15.push('r2'); throw 'second'; }),
        ]);
    } catch (e) {
        reason15 = e;
    }
    // 最快 reject 的是 sleep(10) 的 'first'
    addResult(
        '全部 reject 取最先失败',
        '多个 reject 时取最早失败的原因',
        reason15 === 'first',
        'reason="first"',
        `reason="${reason15}"`,
        reason15 === 'first' ? '最先失败捕获正确' : '最先失败捕获异常'
    );

    printReport();
    return testResults;
}

// 执行测试
runPromiseAllTests().catch(err => {
    console.error('测试执行出错:', err);
});
