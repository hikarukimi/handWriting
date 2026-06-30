// ============================================
// 手写 Promise.allSettled 实现
// ============================================
function promiseAllSettled(promises){

    let resArr=new Array(promises.length).fill(null)
    let count=0
    return new Promise((resolve)=>{
        if(promises.length===0){
            resolve(resArr)
        }
        for(let i=0;i<promises.length;i++){
            const curPro=promises[i]
            Promise.resolve(curPro).then((res)=>{
                resArr[i]={ status: 'fulfilled', value: res }
                count++
            }).catch((res)=>{
                resArr[i]={ status: 'rejected', reason: res }
                count++
            }).finally(()=>{
                if(count===promises.length){
                    resolve(resArr)
                }
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
    console.log('             Promise.allSettled 测试报告');
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

// 辅助:对比 allSettled 结果数组是否与期望一致
// expected 元素形如 {status:'fulfilled',value:1} 或 {status:'rejected',reason:'x'}
function settledEqual(actual, expected) {
    if (!Array.isArray(actual) || actual.length !== expected.length) return false;
    return expected.every((exp, i) => {
        const act = actual[i];
        if (!act || act.status !== exp.status) return false;
        if (exp.status === 'fulfilled') return act.value === exp.value;
        return act.reason === exp.reason;
    });
}

// ============================================
// 测试用例
// ============================================
async function runAllSettledTests() {
    console.log('开始执行 Promise.allSettled 测试...\n');

    // ---------- 测试1: 全部 fulfilled ----------
    const r1 = await promiseAllSettled([
        Promise.resolve(1),
        Promise.resolve(2),
        Promise.resolve(3),
    ]);
    const passed1 = settledEqual(r1, [
        { status: 'fulfilled', value: 1 },
        { status: 'fulfilled', value: 2 },
        { status: 'fulfilled', value: 3 },
    ]);
    addResult(
        '全部 fulfilled',
        '所有成功时每个元素为 fulfilled',
        passed1,
        '[{fulfilled,1},{fulfilled,2},{fulfilled,3}]',
        JSON.stringify(r1),
        passed1 ? '结果正确' : '结果错误'
    );

    // ---------- 测试2: 全部 rejected ----------
    const r2 = await promiseAllSettled([
        Promise.reject('err1'),
        Promise.reject('err2'),
    ]);
    const passed2 = settledEqual(r2, [
        { status: 'rejected', reason: 'err1' },
        { status: 'rejected', reason: 'err2' },
    ]);
    addResult(
        '全部 rejected 也 resolve',
        '全失败时整体仍 resolve,不 reject',
        passed2,
        '[{rejected,err1},{rejected,err2}]',
        JSON.stringify(r2),
        passed2 ? '永不拒绝正确' : '发生了 reject'
    );

    // ---------- 测试3: 混合 fulfilled 与 rejected ----------
    const r3 = await promiseAllSettled([
        Promise.resolve('ok'),
        Promise.reject('bad'),
        Promise.resolve(42),
    ]);
    const passed3 = settledEqual(r3, [
        { status: 'fulfilled', value: 'ok' },
        { status: 'rejected', reason: 'bad' },
        { status: 'fulfilled', value: 42 },
    ]);
    addResult(
        '混合成功与失败',
        '成功失败交错,各自记录状态',
        passed3,
        '[{fulfilled,ok},{rejected,bad},{fulfilled,42}]',
        JSON.stringify(r3),
        passed3 ? '混合处理正确' : '混合处理异常'
    );

    // ---------- 测试4: 结果顺序与输入一致 ----------
    const r4 = await promiseAllSettled([
        sleep(60).then(() => 'slow'),
        sleep(20).then(() => { throw 'fast-fail'; }),
        sleep(40).then(() => 'mid'),
    ]);
    const passed4 = settledEqual(r4, [
        { status: 'fulfilled', value: 'slow' },
        { status: 'rejected', reason: 'fast-fail' },
        { status: 'fulfilled', value: 'mid' },
    ]);
    addResult(
        '结果顺序保持',
        '完成顺序不同,但结果按输入顺序排列',
        passed4,
        '[{fulfilled,slow},{rejected,fast-fail},{fulfilled,mid}]',
        JSON.stringify(r4),
        passed4 ? '顺序正确' : '顺序错乱'
    );

    // ---------- 测试5: 空数组 ----------
    const r5 = await promiseAllSettled([]);
    addResult(
        '空数组',
        '传入空数组应 resolve 为空数组',
        Array.isArray(r5) && r5.length === 0,
        '[]',
        JSON.stringify(r5),
        Array.isArray(r5) && r5.length === 0 ? '空数组正确' : '空数组异常'
    );

    // ---------- 测试6: 非 Promise 值(数字) ----------
    const r6 = await promiseAllSettled([1, 2, 3]);
    const passed6 = settledEqual(r6, [
        { status: 'fulfilled', value: 1 },
        { status: 'fulfilled', value: 2 },
        { status: 'fulfilled', value: 3 },
    ]);
    addResult(
        '非 Promise 值',
        '原始值被包装为 fulfilled',
        passed6,
        '[{fulfilled,1},{fulfilled,2},{fulfilled,3}]',
        JSON.stringify(r6),
        passed6 ? '原始值处理正确' : '原始值处理异常'
    );

    // ---------- 测试7: 混合 Promise 与非 Promise ----------
    const r7 = await promiseAllSettled([0, Promise.resolve(1), Promise.reject('x'), 2]);
    const passed7 = settledEqual(r7, [
        { status: 'fulfilled', value: 0 },
        { status: 'fulfilled', value: 1 },
        { status: 'rejected', reason: 'x' },
        { status: 'fulfilled', value: 2 },
    ]);
    addResult(
        '混合 Promise 与非 Promise',
        '原始值与 Promise 混合,各自记录',
        passed7,
        '[{fulfilled,0},{fulfilled,1},{rejected,x},{fulfilled,2}]',
        JSON.stringify(r7),
        passed7 ? '混合处理正确' : '混合处理异常'
    );

    // ---------- 测试8: 并发执行 ----------
    const start8 = Date.now();
    await promiseAllSettled([
        sleep(50).then(() => 'a'),
        sleep(80).then(() => { throw 'b-fail'; }),
        sleep(30).then(() => 'c'),
    ]);
    const elapsed8 = Date.now() - start8;
    const passed8 = elapsed8 >= 70 && elapsed8 < 140;
    addResult(
        '并发执行',
        '总耗时接近最慢项而非串行累加',
        passed8,
        '约 70~140ms',
        `${elapsed8}ms`,
        passed8 ? '并发执行正确' : `可能串行(${elapsed8}ms)`
    );

    // ---------- 测试9: 单个 fulfilled ----------
    const r9 = await promiseAllSettled([Promise.resolve(42)]);
    addResult(
        '单个 fulfilled',
        '仅一个成功项时返回单元素数组',
        settledEqual(r9, [{ status: 'fulfilled', value: 42 }]),
        '[{fulfilled,42}]',
        JSON.stringify(r9),
        settledEqual(r9, [{ status: 'fulfilled', value: 42 }]) ? '单项正确' : '单项异常'
    );

    // ---------- 测试10: 单个 rejected ----------
    const r10 = await promiseAllSettled([Promise.reject('only-fail')]);
    addResult(
        '单个 rejected 也 resolve',
        '仅一个失败项时整体仍 resolve',
        settledEqual(r10, [{ status: 'rejected', reason: 'only-fail' }]),
        '[{rejected,only-fail}]',
        JSON.stringify(r10),
        settledEqual(r10, [{ status: 'rejected', reason: 'only-fail' }]) ? '单项失败正确' : '单项失败异常'
    );

    // ---------- 测试11: 复杂类型作为值 ----------
    const r11 = await promiseAllSettled([
        Promise.resolve({ name: 'Alice' }),
        Promise.reject([1, 2, 3]),
        Promise.resolve({ name: 'Bob' }),
    ]);
    const passed11 = r11[0]?.status === 'fulfilled' && r11[0].value?.name === 'Alice' &&
                     r11[1]?.status === 'rejected' && Array.isArray(r11[1].reason) &&
                     r11[2]?.status === 'fulfilled' && r11[2].value?.name === 'Bob';
    addResult(
        '复杂类型作为值/原因',
        '对象和数组作为 value 或 reason 正确保存',
        passed11,
        'fulfilled:{name:Alice} / rejected:[1,2,3] / fulfilled:{name:Bob}',
        JSON.stringify(r11),
        passed11 ? '复杂类型正确' : '复杂类型异常'
    );

    // ---------- 测试12: 可迭代输入(字符串) ----------
    const r12 = await promiseAllSettled('abc');
    const passed12 = settledEqual(r12, [
        { status: 'fulfilled', value: 'a' },
        { status: 'fulfilled', value: 'b' },
        { status: 'fulfilled', value: 'c' },
    ]);
    addResult(
        '可迭代输入(字符串)',
        '字符串作为可迭代对象处理',
        passed12,
        '[{fulfilled,"a"},{fulfilled,"b"},{fulfilled,"c"}]',
        JSON.stringify(r12),
        passed12 ? '可迭代处理正确' : '可迭代处理异常'
    );

    // ---------- 测试13: 与原生 allSettled 一致性 ----------
    const makeInput = () => [1, Promise.resolve(2), Promise.reject('x'), sleep(20).then(() => 4)];
    const [native13, mine13] = await Promise.all([
        Promise.allSettled(makeInput()),
        promiseAllSettled(makeInput()),
    ]);
    const passed13 = settledEqual(native13, [
        { status: 'fulfilled', value: 1 },
        { status: 'fulfilled', value: 2 },
        { status: 'rejected', reason: 'x' },
        { status: 'fulfilled', value: 4 },
    ]) && settledEqual(mine13, native13);
    addResult(
        '与原生 allSettled 一致性',
        '行为与原生实现保持一致',
        passed13,
        '原生与手写结果一致',
        `一致=${settledEqual(native13, mine13)}`,
        passed13 ? '行为一致' : '行为不一致'
    );

    // ---------- 测试14: thenable 对象 ----------
    const thenable = { then: (resolve) => resolve('thenable-value') };
    const r14 = await promiseAllSettled([thenable, Promise.reject('plain-fail')]);
    const passed14 = settledEqual(r14, [
        { status: 'fulfilled', value: 'thenable-value' },
        { status: 'rejected', reason: 'plain-fail' },
    ]);
    addResult(
        'thenable 对象',
        '含 then 方法的对象按 thenable 解析',
        passed14,
        '[{fulfilled,thenable-value},{rejected,plain-fail}]',
        JSON.stringify(r14),
        passed14 ? 'thenable 处理正确' : 'thenable 处理异常'
    );

    // ---------- 测试15: 等待所有完成(含慢失败) ----------
    // 验证即使有快速失败,也会等待最慢的那个完成后才 resolve
    const settledOrder15 = [];
    const start15 = Date.now();
    await promiseAllSettled([
        sleep(80).then(() => { settledOrder15.push('done-80'); return 'slow-ok'; }),
        sleep(10).then(() => { throw 'fast-fail'; }),
    ]);
    const elapsed15 = Date.now() - start15;
    // 必须等 80ms 的完成,而非 10ms 失败就返回
    const passed15 = elapsed15 >= 70 && settledOrder15.length === 1;
    addResult(
        '等待所有完成',
        '即使早期失败也等待最慢项完成',
        passed15,
        '耗时约 80ms,慢项已完成',
        `${elapsed15}ms,慢项完成=${settledOrder15.length === 1}`,
        passed15 ? '等待全部完成正确' : `提前返回(${elapsed15}ms)`
    );

    printReport();
    return testResults;
}

// 执行测试
runAllSettledTests().catch(err => {
    console.error('测试执行出错:', err);
});
