// ============================================
// 手写 Promise.race 实现
// ============================================
function promiseRace(promises){
    return new Promise((resolve,reject)=>{
        for(let i=0;i<promises.length;i++){
            const curPro=promises[i]
            Promise.resolve(curPro).then(res=>resolve(res))
                .catch((err)=>reject(err))
        }
    })
}
// ============================================
// 测试框架
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
    console.log('             Promise.race 测试报告');
    console.log('='.repeat(60));
    console.log(`\n📊 统计概览:`);
    console.log(`   总测试数: ${testResults.total}`);
    console.log(`   ✅ 通过:   ${testResults.passed}`);
    console.log(`   ❌ 失败:   ${testResults.failed}`);
    console.log(`   📈 通过率: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`);
    console.log(`\n📋 详细结果:\n`);
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

// 捕获 race 结果:fulfilled 返回 {ok:true,value},rejected 返回 {ok:false,reason}
async function capture(p) {
    try {
        const v = await p;
        return { ok: true, value: v };
    } catch (e) {
        return { ok: false, reason: e };
    }
}

// ============================================
// 测试用例
// ============================================
async function runRaceTests() {
    console.log('开始执行 Promise.race 测试...\n');

    // ---------- 测试1: 第一个 fulfilled 决定结果 ----------
    const c1 = await capture(promiseRace([
        sleep(50).then(() => 'fast'),
        sleep(200).then(() => 'slow'),
    ]));
    const passed1 = c1.ok && c1.value === 'fast';
    addResult(
        '第一个 fulfilled 决定结果',
        '最快完成的 fulfilled 值作为结果',
        passed1,
        'fulfilled:"fast"',
        JSON.stringify(c1),
        passed1 ? '结果正确' : '结果错误'
    );

    // ---------- 测试2: 第一个 rejected 决定结果(reject) ----------
    const c2 = await capture(promiseRace([
        sleep(40).then(() => { throw 'fail-first'; }),
        sleep(200).then(() => 'late'),
    ]));
    const passed2 = !c2.ok && c2.reason === 'fail-first';
    addResult(
        '第一个 rejected 导致 reject',
        '最快完成的是 rejected,整体立即 reject',
        passed2,
        'rejected:"fail-first"',
        JSON.stringify(c2),
        passed2 ? '正确 reject' : '未正确 reject'
    );

    // ---------- 测试3: 快的失败先到 ----------
    const c3 = await capture(promiseRace([
        sleep(100).then(() => 'slow-ok'),
        sleep(20).then(() => { throw 'fast-fail'; }),
    ]));
    const passed3 = !c3.ok && c3.reason === 'fast-fail';
    addResult(
        '快的失败先到',
        '失败项更快完成时整体 reject',
        passed3,
        'rejected:"fast-fail"',
        JSON.stringify(c3),
        passed3 ? '正确' : '错误'
    );

    // ---------- 测试4: 快的成功先到 ----------
    const c4 = await capture(promiseRace([
        sleep(20).then(() => 'fast-ok'),
        sleep(80).then(() => { throw 'slow-fail'; }),
    ]));
    const passed4 = c4.ok && c4.value === 'fast-ok';
    addResult(
        '快的成功先到',
        '成功项更快完成时整体 fulfilled',
        passed4,
        'fulfilled:"fast-ok"',
        JSON.stringify(c4),
        passed4 ? '正确' : '错误'
    );

    // ---------- 测试5: 空数组永远 pending ----------
    const r5Promise = promiseRace([]);
    let r5Settled = false;
    let r5Result = null;
    r5Promise.then(
        (v) => { r5Settled = true; r5Result = { type: 'fulfilled', value: v }; },
        (e) => { r5Settled = true; r5Result = { type: 'rejected', reason: e }; }
    );
    await sleep(50);
    const passed5 = r5Settled === false;
    addResult(
        '空数组永不 settle',
        '空数组返回永远 pending 的 promise',
        passed5,
        'pending(50ms 后仍未 settle)',
        r5Settled ? `已 settle: ${JSON.stringify(r5Result)}` : 'pending',
        passed5 ? '空数组正确' : '空数组异常(提前 settle)'
    );

    // ---------- 测试6: 非 Promise 值(立即赢) ----------
    const c6 = await capture(promiseRace([
        42,
        sleep(30).then(() => 'late'),
    ]));
    const passed6 = c6.ok && c6.value === 42;
    addResult(
        '非 Promise 值立即赢',
        '同步原始值被包装后立即 fulfilled,快于异步项',
        passed6,
        'fulfilled:42',
        JSON.stringify(c6),
        passed6 ? '正确' : '错误'
    );

    // ---------- 测试7: 混合 Promise 与非 Promise ----------
    const c7 = await capture(promiseRace([
        0,
        Promise.resolve(1),
        Promise.reject('x'),
        sleep(10).then(() => 2),
    ]));
    const passed7 = c7.ok && c7.value === 0;
    addResult(
        '混合 Promise 与非 Promise',
        '首个同步值立即决定结果',
        passed7,
        'fulfilled:0',
        JSON.stringify(c7),
        passed7 ? '正确' : '错误'
    );

    // ---------- 测试8: 并发执行 ----------
    const start8 = Date.now();
    await capture(promiseRace([
        sleep(80).then(() => 'a'),
        sleep(50).then(() => { throw 'b-fail'; }),
        sleep(120).then(() => 'c'),
    ]));
    const elapsed8 = Date.now() - start8;
    // 最快项约 50ms 完成,远小于串行累加(250ms)
    const passed8 = elapsed8 >= 40 && elapsed8 < 110;
    addResult(
        '并发执行',
        '总耗时接近最快项而非串行累加',
        passed8,
        '约 40~110ms',
        `${elapsed8}ms`,
        passed8 ? '并发执行正确' : `可能串行(${elapsed8}ms)`
    );

    // ---------- 测试9: 单个 fulfilled ----------
    const c9 = await capture(promiseRace([Promise.resolve(42)]));
    addResult(
        '单个 fulfilled',
        '仅一个成功项时返回其值',
        c9.ok && c9.value === 42,
        'fulfilled:42',
        JSON.stringify(c9),
        c9.ok && c9.value === 42 ? '单项正确' : '单项异常'
    );

    // ---------- 测试10: 单个 rejected ----------
    const c10 = await capture(promiseRace([Promise.reject('only-fail')]));
    addResult(
        '单个 rejected 也 reject',
        '仅一个失败项时整体 reject',
        !c10.ok && c10.reason === 'only-fail',
        'rejected:"only-fail"',
        JSON.stringify(c10),
        !c10.ok && c10.reason === 'only-fail' ? '单项失败正确' : '单项失败异常'
    );

    // ---------- 测试11: 复杂类型作为值 ----------
    const c11 = await capture(promiseRace([
        Promise.resolve({ name: 'Alice' }),
        sleep(30).then(() => [1, 2, 3]),
    ]));
    const passed11 = c11.ok && c11.value?.name === 'Alice';
    addResult(
        '复杂类型作为值',
        '对象作为第一个 fulfilled 值被正确返回',
        passed11,
        'fulfilled:{name:Alice}',
        JSON.stringify(c11),
        passed11 ? '复杂类型正确' : '复杂类型异常'
    );

    // ---------- 测试12: 可迭代输入(字符串) ----------
    const c12 = await capture(promiseRace('abc'));
    const passed12 = c12.ok && c12.value === 'a';
    addResult(
        '可迭代输入(字符串)',
        '字符串作为可迭代对象,首字符立即赢',
        passed12,
        'fulfilled:"a"',
        JSON.stringify(c12),
        passed12 ? '可迭代处理正确' : '可迭代处理异常'
    );

    // ---------- 测试13: 与原生 Promise.race 一致性 ----------
    const makeInput = () => [1, Promise.resolve(2), Promise.reject('x'), sleep(20).then(() => 4)];
    // 首个同步值 1 立即决定结果,两个实现都应得到 1
    const [native13, mine13] = await Promise.all([
        capture(Promise.race(makeInput())),
        capture(promiseRace(makeInput())),
    ]);
    const passed13 = native13.ok && native13.value === 1 &&
                     mine13.ok && mine13.value === 1 &&
                     native13.value === mine13.value;
    addResult(
        '与原生 race 一致性',
        '行为与原生实现保持一致',
        passed13,
        '原生与手写结果一致(都为 fulfilled:1)',
        `原生=${JSON.stringify(native13)},手写=${JSON.stringify(mine13)}`,
        passed13 ? '行为一致' : '行为不一致'
    );

    // ---------- 测试14: thenable 对象 ----------
    const thenable = { then: (resolve) => resolve('thenable-value') };
    const c14 = await capture(promiseRace([
        thenable,
        sleep(50).then(() => 'late'),
    ]));
    const passed14 = c14.ok && c14.value === 'thenable-value';
    addResult(
        'thenable 对象',
        '含 then 方法的对象按 thenable 解析并立即赢',
        passed14,
        'fulfilled:"thenable-value"',
        JSON.stringify(c14),
        passed14 ? 'thenable 处理正确' : 'thenable 处理异常'
    );

    // ---------- 测试15: 完成时间决定结果(非输入顺序) ----------
    // 输入顺序中 rejected 在前(40ms),但 fulfilled 更快(10ms),应取 fulfilled
    const c15 = await capture(promiseRace([
        sleep(40).then(() => { throw 'slow-reject'; }),
        sleep(10).then(() => 'fast-ok'),
    ]));
    const passed15 = c15.ok && c15.value === 'fast-ok';
    addResult(
        '完成时间决定结果',
        '由谁先完成决定,而非输入顺序;更快的 fulfilled 胜出',
        passed15,
        'fulfilled:"fast-ok"',
        JSON.stringify(c15),
        passed15 ? '正确(按完成时间)' : '错误(可能按输入顺序)'
    );

    printReport();
    return testResults;
}

// 执行测试
runRaceTests().catch(err => {
    console.error('测试执行出错:', err);
});
