function throttle(fn, time) {
    let timer=null
    function throttled(...args){
        if(timer){
            return
        }
        timer=setTimeout(()=>{
            fn.apply(this,args)
            timer=null
        },time)
        return ()=>{
            clearTimeout(timer)
            timer=null
        }
    }
    return throttled
}



// ============================================
// 节流函数测试用例
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
    console.log('                    节 流 函 数 测 试 报 告');
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

async function runThrottleTests() {
    console.log('开始执行节流函数测试...\n');

    // ---------- 测试1: 基本节流功能 ----------
    let callCount = 0;
    const fn1 = () => { callCount++; };
    const throttle1 = throttle(fn1, 100);
    
    throttle1(); // 第一次，设置定时器
    throttle1(); // 第二次，被忽略
    throttle1(); // 第三次，被忽略
    
    await sleep(150);
    
    addResult(
        '基本节流功能',
        '在冷却期内多次调用只执行一次',
        callCount === 1,
        '执行1次',
        `执行${callCount}次`,
        callCount === 1 ? '节流正常' : '节流失效'
    );

    // ---------- 测试2: 冷却期后恢复执行 ----------
    callCount = 0;
    const fn2 = () => { callCount++; };
    const throttle2 = throttle(fn2, 50);
    
    throttle2(); // 执行
    await sleep(100); // 等待冷却结束
    throttle2(); // 再次执行
    await sleep(100); // 等待冷却结束
    throttle2(); // 第三次执行
    await sleep(100); // 等待冷却结束
    
    addResult(
        '冷却期后恢复执行',
        '超过time间隔后再次调用应执行',
        callCount === 3,
        '执行3次',
        `执行${callCount}次`,
        callCount === 3 ? '冷却恢复正常' : '冷却恢复异常'
    );

    // ---------- 测试3: this指向正确 ----------
    let capturedThis = null;
    const fn3 = function() { capturedThis = this; };
    const throttle3 = throttle(fn3, 50);
    const obj3 = { name: 'testObject', method: throttle3 };
    
    obj3.method();
    await sleep(100);
    
    addResult(
        'this指向正确',
        '确保函数上下文正确绑定',
        capturedThis && capturedThis.name === 'testObject',
        'this.name === "testObject"',
        capturedThis ? `this.name === "${capturedThis.name}"` : 'this为null',
        capturedThis?.name === 'testObject' ? 'this指向正确' : 'this指向错误'
    );

    // ---------- 测试4: 参数传递完整 ----------
    let capturedArgs = null;
    const fn4 = (...args) => { capturedArgs = args; };
    const throttle4 = throttle(fn4, 50);
    
    throttle4('arg1', 'arg2', { key: 'value' });
    await sleep(100);
    
    const argsMatch = capturedArgs && 
                      capturedArgs.length === 3 &&
                      capturedArgs[0] === 'arg1' &&
                      capturedArgs[1] === 'arg2' &&
                      capturedArgs[2]?.key === 'value';
    
    addResult(
        '参数传递完整',
        '确保所有参数正确传递',
        argsMatch,
        '参数: ["arg1", "arg2", {key:"value"}]',
        `参数: ${JSON.stringify(capturedArgs)}`,
        argsMatch ? '参数传递正确' : '参数传递有误'
    );

    // ---------- 测试5: 高频连续调用 ----------
    callCount = 0;
    const timestamps = [];
    const fn5 = () => { 
        callCount++; 
        timestamps.push(Date.now());
    };
    const throttle5 = throttle(fn5, 100);
    
    // 在200ms内快速调用10次
    for (let i = 0; i < 10; i++) {
        throttle5();
        await sleep(15); // 每15ms调用一次
    }
    await sleep(150);
    
    // 预期：第一次立即设置定时器，100ms后执行；之后每次间隔都小于100ms，所以只执行2次左右
    addResult(
        '高频连续调用',
        '高频调用下控制执行频率',
        callCount >= 1 && callCount <= 3,
        '执行1-3次',
        `执行${callCount}次`,
        callCount <= 3 ? '节流有效' : '节流不足'
    );

    // ---------- 测试6: 滚动事件模拟 ----------
    callCount = 0;
    const scrollPositions = [];
    const fn6 = (pos) => { 
        callCount++;
        scrollPositions.push(pos);
    };
    const throttle6 = throttle(fn6, 50);
    
    // 模拟高频滚动事件
    for (let i = 0; i < 20; i++) {
        throttle6(i * 10);
        await sleep(10); // 每10ms触发一次
    }
    await sleep(100);
    
    addResult(
        '滚动事件模拟',
        '模拟窗口滚动事件节流',
        callCount <= 5,
        '执行次数 ≤ 5',
        `执行${callCount}次`,
        callCount <= 5 ? '滚动节流有效' : '滚动节流不足'
    );

    // ---------- 测试7: resize事件模拟 ----------
    callCount = 0;
    const fn7 = () => { callCount++; };
    const throttle7 = throttle(fn7, 100);
    
    // 快速调整窗口大小
    throttle7({ width: 800 });
    throttle7({ width: 810 });
    throttle7({ width: 820 });
    await sleep(50);
    throttle7({ width: 830 });
    await sleep(150);
    
    addResult(
        'resize事件模拟',
        '窗口resize事件节流',
        callCount <= 2,
        '执行次数 ≤ 2',
        `执行${callCount}次`,
        callCount <= 2 ? 'resize节流正常' : 'resize节流异常'
    );

    // ---------- 测试8: 搜索按钮防重复点击 ----------
    callCount = 0;
    const fn8 = () => { callCount++; };
    const throttle8 = throttle(fn8, 500); // 500ms冷却
    
    // 模拟用户疯狂点击搜索按钮
    for (let i = 0; i < 10; i++) {
        throttle8();
    }
    await sleep(600);
    
    addResult(
        '搜索按钮防重复点击',
        '防止按钮被频繁点击',
        callCount === 1,
        '执行1次',
        `执行${callCount}次`,
        callCount === 1 ? '防重复点击有效' : '防重复点击失效'
    );

    // ---------- 测试9: 取消功能 ----------
    callCount = 0;
    const fn9 = () => { callCount++; };
    const throttle9 = throttle(fn9, 100);
    
    throttle9(); // 设置定时器
    throttle9.cancel(); // 取消
    await sleep(150);
    
    addResult(
        '取消功能',
        '支持手动取消待执行函数',
        callCount === 0,
        '执行0次',
        `执行${callCount}次`,
        callCount === 0 ? '取消功能正常' : '取消功能失效'
    );

    // ---------- 测试10: 多次独立调用序列 ----------
    callCount = 0;
    const results10 = [];
    const fn10 = (id) => { callCount++; results10.push(id); };
    const throttle10 = throttle(fn10, 50);
    
    throttle10('A');
    await sleep(100); // 超过time
    throttle10('B');
    await sleep(100); // 超过time
    throttle10('C');
    await sleep(100);
    
    const passed10 = callCount === 3 && 
                     results10[0] === 'A' && 
                     results10[1] === 'B' && 
                     results10[2] === 'C';
    
    addResult(
        '多次独立调用序列',
        '间隔超过time的调用应独立执行',
        passed10,
        '执行3次，顺序为[A,B,C]',
        `执行${callCount}次，顺序为[${results10.join(',')}]`,
        passed10 ? '独立调用序列正常' : '调用序列异常'
    );

    // ---------- 测试11: 边界 - time为0 ----------
    callCount = 0;
    const fn11 = () => { callCount++; };
    const throttle11 = throttle(fn11, 0);
    
    throttle11();
    throttle11();
    throttle11();
    await sleep(50);
    
    // time为0时，setTimeout(..., 0)会异步执行，但同步代码中timer一直存在
    addResult(
        '边界 - time为0',
        '极端时间参数处理',
        callCount >= 1,
        '执行次数 ≥ 1',
        `执行${callCount}次`,
        `time为0，实际执行${callCount}次`
    );

    // ---------- 测试12: 边界 - 同步连续调用 ----------
    callCount = 0;
    let lastArg = null;
    const fn12 = (arg) => { callCount++; lastArg = arg; };
    const throttle12 = throttle(fn12, 50);
    
    throttle12('first');
    throttle12('second');  // 被忽略
    throttle12('third');   // 被忽略
    
    await sleep(100);
    
    addResult(
        '边界 - 同步连续调用',
        '同步代码块中的多次调用只执行第一次',
        callCount === 1 && lastArg === 'first',
        '执行1次，参数为"first"',
        `执行${callCount}次，参数为"${lastArg}"`,
        callCount === 1 ? '同步节流正常' : '同步节流异常'
    );

    // ---------- 测试13: 实时搜索输入优化 ----------
    const searchQueries = [];
    const fn13 = (query) => { searchQueries.push(query); };
    const throttle13 = throttle(fn13, 80);
    
    // 模拟用户输入：快速输入"hello"
    const inputSequence = ['h', 'he', 'hel', 'hell', 'hello'];
    for (const query of inputSequence) {
        throttle13(query);
        await sleep(30); // 快速输入
    }
    await sleep(100);
    
    // 节流模式下，只有第一次会触发（或间隔超过80ms的）
    addResult(
        '实时搜索输入优化',
        '搜索输入节流，减少请求次数',
        searchQueries.length <= 2,
        '搜索次数 ≤ 2',
        `搜索${searchQueries.length}次`,
        searchQueries.length <= 2 ? '搜索节流有效' : '搜索节流不足'
    );

    // ---------- 测试14: 游戏帧率控制模拟 ----------
    callCount = 0;
    const frameTimes = [];
    const fn14 = () => { 
        callCount++;
        frameTimes.push(Date.now());
    };
    const throttle14 = throttle(fn14, 33); // 约30fps
    
    // 模拟60fps的游戏循环调用节流函数（实际游戏循环通常是持续调用）
    const startTime = Date.now();
    while (Date.now() - startTime < 200) {
        throttle14();
        await sleep(16); // 约60fps的调用频率
    }
    await sleep(50);
    
    // 200ms内，30fps应该执行约6-7次
    addResult(
        '游戏帧率控制模拟',
        '控制更新频率，约30fps',
        callCount >= 4 && callCount <= 8,
        '执行4-8次',
        `执行${callCount}次`,
        (callCount >= 4 && callCount <= 8) ? '帧率控制正常' : '帧率控制异常'
    );

    // ---------- 测试15: 对象方法上下文保持 ----------
    const obj15 = {
        value: 100,
        getValue() { return this.value; }
    };
    
    let methodResult = null;
    const throttle15 = throttle(function() {
        methodResult = this.getValue();
    }, 50);
    
    obj15.throttledMethod = throttle15;
    obj15.throttledMethod();
    await sleep(100);
    
    addResult(
        '对象方法上下文保持',
        '作为对象方法调用时保持this指向',
        methodResult === 100,
        'this.getValue() === 100',
        `this.getValue() === ${methodResult}`,
        methodResult === 100 ? '方法上下文保持正确' : '方法上下文丢失'
    );

    // 打印测试报告
    printReport();
    
    return testResults;
}

// 执行测试
runThrottleTests().catch(err => {
    console.error('测试执行出错:', err);
});
