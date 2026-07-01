// ============================================
// 手写 Promise.prototype.finally 实现
// ============================================

Promise.prototype.myFinally = function (callback) {
    return this.then((res)=>{
        return Promise.resolve(callback()).then(_=>res)
    }).catch((err)=>{
        return Promise.resolve(callback()).then(()=>{throw err})
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
    console.log('              Promise.finally 测试报告');
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

// ============================================
// 测试用例
// ============================================
async function runFinallyTests() {
    console.log('开始执行 Promise.finally 测试...\n');

    // ---------- 测试1: resolve 时执行 finally ----------
    let executed1 = false;
    await Promise.resolve(1).myFinally(() => { executed1 = true; });
    addResult(
        'resolve 时执行 finally',
        '成功态下 finally 回调应被执行',
        executed1,
        'executed === true',
        `executed === ${executed1}`,
        executed1 ? '执行正常' : '未执行'
    );

    // ---------- 测试2: reject 时也执行 finally ----------
    let executed2 = false;
    try {
        await Promise.reject('err').myFinally(() => { executed2 = true; });
    } catch (e) { /* 吞掉,只验证 executed2 */ }
    addResult(
        'reject 时也执行 finally',
        '失败态下 finally 回调应被执行',
        executed2,
        'executed === true',
        `executed === ${executed2}`,
        executed2 ? '执行正常' : '未执行'
    );

    // ---------- 测试3: finally 不接收参数 ----------
    let receivedArgs = ['placeholder'];
    await Promise.resolve('value').myFinally(function () {
        receivedArgs = [...arguments];
    });
    addResult(
        'finally 不接收参数',
        'finally 回调不应收到 value 或 reason',
        Array.isArray(receivedArgs) && receivedArgs.length === 0,
        'arguments.length === 0',
        `arguments = ${JSON.stringify(receivedArgs)}`,
        receivedArgs.length === 0 ? '无参数正确' : '错误地传入了参数'
    );

    // ---------- 测试4: resolve 值透传(回调返回值被忽略) ----------
    const r4 = await Promise.resolve(42).myFinally(() => 'should-be-ignored');
    addResult(
        'resolve 值透传',
        '回调返回值应被忽略,原值透传',
        r4 === 42,
        '结果 === 42',
        `结果 === ${r4}`,
        r4 === 42 ? '透传正确' : '透传错误'
    );

    // ---------- 测试5: reject reason 透传 ----------
    let reason5 = null;
    try {
        await Promise.reject('orig-reason').myFinally(() => 'ignored');
    } catch (e) {
        reason5 = e;
    }
    addResult(
        'reject reason 透传',
        '失败态下原 reason 应透传,不被回调影响',
        reason5 === 'orig-reason',
        'reason === "orig-reason"',
        `reason === "${reason5}"`,
        reason5 === 'orig-reason' ? '透传正确' : '透传错误'
    );

    // ---------- 测试6: 回调抛错覆盖原 resolve 值 ----------
    let reason6 = null;
    try {
        await Promise.resolve(1).myFinally(() => { throw 'finally-throws'; });
    } catch (e) {
        reason6 = e;
    }
    addResult(
        '回调抛错覆盖 resolve 值',
        '成功态回调抛错时,整体变为失败并用新错误',
        reason6 === 'finally-throws',
        'reason === "finally-throws"',
        `reason === "${reason6}"`,
        reason6 === 'finally-throws' ? '覆盖正确' : '覆盖错误'
    );

    // ---------- 测试7: 回调抛错覆盖原 reject reason ----------
    let reason7 = null;
    try {
        await Promise.reject('orig').myFinally(() => { throw 'new-reason'; });
    } catch (e) {
        reason7 = e;
    }
    addResult(
        '回调抛错覆盖 reject reason',
        '失败态回调抛错时,用新错误覆盖原 reason',
        reason7 === 'new-reason',
        'reason === "new-reason"',
        `reason === "${reason7}"`,
        reason7 === 'new-reason' ? '覆盖正确' : '覆盖错误'
    );

    // ---------- 测试8: 回调返回 rejected Promise 覆盖原值 ----------
    let reason8 = null;
    try {
        await Promise.resolve(1).myFinally(() => Promise.reject('rej-promise'));
    } catch (e) {
        reason8 = e;
    }
    addResult(
        '回调返回 rejected Promise',
        '返回的 rejected Promise 应覆盖原 resolve 值',
        reason8 === 'rej-promise',
        'reason === "rej-promise"',
        `reason === "${reason8}"`,
        reason8 === 'rej-promise' ? '覆盖正确' : '覆盖错误'
    );

    // ---------- 测试9: 回调返回 fulfilled Promise 不影响透传 ----------
    const r9 = await Promise.resolve(1).myFinally(() => Promise.resolve(999));
    addResult(
        '回调返回 fulfilled Promise',
        '返回的 fulfilled Promise 不应影响原值透传',
        r9 === 1,
        '结果 === 1',
        `结果 === ${r9}`,
        r9 === 1 ? '透传正确' : '被返回值污染'
    );

    // ---------- 测试10: 等待异步回调完成 ----------
    const start10 = Date.now();
    const r10 = await Promise.resolve('data').myFinally(() => sleep(60));
    const elapsed10 = Date.now() - start10;
    addResult(
        '等待异步回调完成',
        '回调返回 Promise 时应等待其完成再透传',
        r10 === 'data' && elapsed10 >= 50,
        '透传 data 且耗时 ≥ 50ms',
        `结果="${r10}", 耗时=${elapsed10}ms`,
        (r10 === 'data' && elapsed10 >= 50) ? '等待正确' : '等待异常'
    );

    // ---------- 测试11: 链式返回 Promise ----------
    const p11 = Promise.resolve(1).myFinally(() => {});
    addResult(
        '链式返回 Promise',
        'finally 应返回新的 Promise 以支持链式',
        p11 instanceof Promise && p11 !== Promise.resolve(1),
        '返回 Promise 实例',
        `instanceof Promise === ${p11 instanceof Promise}`,
        (p11 instanceof Promise) ? '返回类型正确' : '返回类型异常'
    );

    // ---------- 测试12: finally 后继续 then ----------
    const r12 = await Promise.resolve(10)
        .myFinally(() => {})
        .then(v => v * 2);
    addResult(
        'finally 后继续 then',
        'finally 之后可继续 then 链',
        r12 === 20,
        '结果 === 20',
        `结果 === ${r12}`,
        r12 === 20 ? '链式 then 正常' : '链式 then 异常'
    );

    // ---------- 测试13: finally 后继续 catch ----------
    let reason13 = null;
    try {
        await Promise.reject('boom')
            .myFinally(() => {})
            .catch(e => { reason13 = e; });
    } catch (e) { /* catch 已处理 */ }
    addResult(
        'finally 后继续 catch',
        '失败态下 finally 之后可继续 catch',
        reason13 === 'boom',
        'reason === "boom"',
        `reason === "${reason13}"`,
        reason13 === 'boom' ? '链式 catch 正常' : '链式 catch 异常'
    );

    // ---------- 测试14: 多个 finally 串联都执行 ----------
    const order14 = [];
    await Promise.resolve(1)
        .myFinally(() => order14.push('f1'))
        .myFinally(() => order14.push('f2'))
        .myFinally(() => order14.push('f3'));
    addResult(
        '多个 finally 串联',
        '串联的多个 finally 应按顺序执行',
        order14.join(',') === 'f1,f2,f3',
        '顺序 f1,f2,f3',
        `顺序 ${order14.join(',')}`,
        order14.join(',') === 'f1,f2,f3' ? '串联正确' : '串联异常'
    );

    // ---------- 测试15: 与原生 finally 一致性 ----------
    const makeCase = () => Promise.resolve(5).finally(() => { throw 'x'; });
    const makeMine = () => Promise.resolve(5).myFinally(() => { throw 'x'; });
    let nativeReason = null, mineReason = null;
    try { await makeCase(); } catch (e) { nativeReason = e; }
    try { await makeMine(); } catch (e) { mineReason = e; }
    const passed15 = nativeReason === 'x' && mineReason === 'x';
    addResult(
        '与原生 finally 一致性',
        '回调抛错行为与原生实现一致',
        passed15,
        '原生/手写均 reject "x"',
        `原生="${nativeReason}", 手写="${mineReason}"`,
        passed15 ? '行为一致' : '行为不一致'
    );

    printReport();
    return testResults;
}

// 执行测试
runFinallyTests().catch(err => {
    console.error('测试执行出错:', err);
});
