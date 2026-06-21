// ============================================
// 防抖函数实现
// ============================================

// ------------------ 非立即执行防抖 ------------------

function debounce(fn, delay) {
    let timer=null
    function debounced (...args){
        if(timer) {
            clearTimeout(timer)
            timer=null
        } 
        timer=setTimeout(()=>{
            fn.apply(this,args)
            timer=null
        },delay)
        return ()=>{
            if(timer){
                clearTimeout(timer)
                timer=null
            }
        }
    }
    return debounced
}

// ============================================
// 测试框架
// ============================================

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// 测试结果存储
const testResults = {
    total: 0,
    passed: 0,
    failed: 0,
    tests: []
};

// 添加测试结果
function addResult(name, description, passed, expected, actual, detail = '') {
    testResults.total++;
    if (passed) {
        testResults.passed++;
    } else {
        testResults.failed++;
    }
    
    testResults.tests.push({
        name,
        description,
        passed,
        expected,
        actual,
        detail
    });
}

// 打印分隔线
function printLine(char = '=', length = 60) {
    console.log(char.repeat(length));
}

// 打印测试结果报告
function printReport() {
    printLine();
    console.log('                    测 试 报 告');
    printLine();
    
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
        const status = test.passed ? '通过' : '失败';
        console.log(`${icon} 测试 ${index + 1}: ${test.name} [${status}]`);
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
    
    printLine();
    if (testResults.failed === 0) {
        console.log('🎉 所有测试全部通过！');
    } else {
        console.log(`⚠️  有 ${testResults.failed} 个测试未通过，请检查实现。`);
    }
    printLine();
}

// ============================================
// 测试用例
// ============================================

async function runTests() {
    console.log('开始执行防抖函数测试...\n');
    
    // ---------- 测试1: 基本防抖功能 ----------
    let callCount = 0;
    let lastArg = null;
    const fn1 = (arg) => { callCount++; lastArg = arg; };
    const debounce1 = debounce(fn1, 50);
    
    debounce1('a');
    debounce1('b');
    debounce1('c');
    await sleep(100);
    
    addResult(
        '基本防抖功能',
        '多次触发只执行最后一次',
        callCount === 1 && lastArg === 'c',
        '执行1次，参数为"c"',
        `执行${callCount}次，参数为"${lastArg}"`,
        callCount === 1 ? '执行次数正确' : '执行次数错误'
    );
    
    // ---------- 测试2: 重新计时机制 ----------
    callCount = 0;
    const fn2 = () => { callCount++; };
    const debounce2 = debounce(fn2, 100);
    
    debounce2();
    await sleep(50);
    debounce2(); // 重新计时
    await sleep(50);
    debounce2(); // 再次重新计时
    
    let passed2 = callCount === 0;
    await sleep(150);
    passed2 = passed2 && callCount === 1;
    
    addResult(
        '重新计时机制',
        '每次触发重置延迟时间',
        passed2,
        '150ms内不执行，最终执行1次',
        `${callCount}次执行`,
        passed2 ? '重新计时机制正常' : '计时机制异常'
    );
    
    // ---------- 测试3: this 指向正确 ----------
    let capturedThis = null;
    const fn3 = function() { capturedThis = this; };
    const debounce3 = debounce(fn3, 50);
    const obj = { name: 'testObject', method: debounce3 };
    
    obj.method();
    await sleep(100);
    
    addResult(
        'this 指向正确',
        '确保函数上下文正确绑定',
        capturedThis && capturedThis.name === 'testObject',
        'this.name === "testObject"',
        capturedThis ? `this.name === "${capturedThis.name}"` : 'this为null',
        capturedThis?.name === 'testObject' ? 'this指向正确' : 'this指向错误'
    );
    
    // ---------- 测试4: 参数传递完整 ----------
    let capturedArgs = null;
    const fn4 = (...args) => { capturedArgs = args; };
    const debounce4 = debounce(fn4, 50);
    
    debounce4('arg1', 'arg2', { key: 'value' }, [1, 2, 3]);
    await sleep(100);
    
    const argsMatch = capturedArgs && 
                      capturedArgs[0] === 'arg1' && 
                      capturedArgs[1] === 'arg2' && 
                      capturedArgs[2]?.key === 'value' &&
                      Array.isArray(capturedArgs[3]) &&
                      capturedArgs[3].length === 3;
    
    addResult(
        '参数传递完整',
        '确保所有参数正确传递',
        argsMatch,
        '参数: ["arg1", "arg2", {key:"value"}, [1,2,3]]',
        `参数: ${JSON.stringify(capturedArgs)}`,
        argsMatch ? '参数数量和类型正确' : '参数传递有误'
    );
    
    // ---------- 测试5: 高频调用合并 ----------
    callCount = 0;
    lastArg = null;
    const fn5 = (arg) => { callCount++; lastArg = arg; };
    const debounce5 = debounce(fn5, 80);
    
    // 快速连续调用10次
    for (let i = 0; i < 10; i++) {
        debounce5(`call-${i}`);
    }
    await sleep(150);
    
    addResult(
        '高频调用合并',
        '极短时间内多次调用只执行最后一次',
        callCount === 1 && lastArg === 'call-9',
        '执行1次，参数为"call-9"',
        `执行${callCount}次，参数为"${lastArg}"`,
        callCount === 1 ? '高频合并正常' : '高频合并失败'
    );
    
    // ---------- 测试6: 防抖函数返回值（取消函数）----------
    callCount = 0;
    const fn6 = () => { callCount++; };
    const debounce6 = debounce(fn6, 100);
    
    const cancelFn = debounce6();
    const hasCancelFunction = typeof cancelFn === 'function';
    
    // 测试取消功能
    debounce6();
    cancelFn(); // 取消第一次的定时器（虽然可能已经执行，但测试返回值类型）
    
    await sleep(150);
    
    addResult(
        '返回值类型检查',
        '防抖函数应返回取消函数',
        hasCancelFunction,
        '返回值为 function 类型',
        `返回值为 ${typeof cancelFn} 类型`,
        hasCancelFunction ? '返回值类型正确' : '应返回取消函数'
    );
    
    // ---------- 测试7: 按钮提交场景 ----------
    callCount = 0;
    const fn7 = () => { callCount++; };
    const debounce7 = debounce(fn7, 100);
    
    // 模拟疯狂点击
    for (let i = 0; i < 20; i++) {
        debounce7();
    }
    await sleep(150);
    
    addResult(
        '按钮提交场景',
        '防重复提交，只执行最后一次',
        callCount === 1,
        '执行1次',
        `执行${callCount}次`,
        callCount === 1 ? '防重复提交有效' : '防重复提交失效'
    );
    
    // ---------- 测试8: 输入框搜索场景 ----------
    const searches = [];
    const fn8 = (query) => { searches.push(query); };
    const debounce8 = debounce(fn8, 50);
    
    debounce8('h');
    await sleep(20);
    debounce8('he');
    await sleep(20);
    debounce8('hel');
    await sleep(20);
    debounce8('hell');
    await sleep(20);
    debounce8('hello');
    await sleep(100);
    
    addResult(
        '输入框搜索场景',
        '连续输入只搜索最后一次',
        searches.length === 1 && searches[0] === 'hello',
        '搜索1次，关键词为"hello"',
        `搜索${searches.length}次，关键词为"${searches[0] || 'undefined'}"`,
        searches[0] === 'hello' ? '搜索防抖正常' : '搜索防抖异常'
    );
    
    // ---------- 测试9: 滚动事件降频 ----------
    callCount = 0;
    const fn9 = () => { callCount++; };
    const debounce9 = debounce(fn9, 50);
    
    // 模拟高频滚动（每10ms一次，共20次）
    for (let i = 0; i < 20; i++) {
        setTimeout(() => debounce9(), i * 10);
    }
    await sleep(300);
    
    addResult(
        '滚动事件降频',
        '高频滚动事件防抖',
        callCount <= 5,
        '执行次数 ≤ 5',
        `执行${callCount}次`,
        callCount <= 5 ? '降频有效' : '降频不足'
    );
    
    // ---------- 测试10: resize 窗口调整 ----------
    callCount = 0;
    const fn10 = () => { callCount++; };
    const debounce10 = debounce(fn10, 100);
    
    debounce10({ width: 800 });
    await sleep(30);
    debounce10({ width: 810 });
    await sleep(30);
    debounce10({ width: 820 });
    await sleep(30);
    debounce10({ width: 830 });
    await sleep(150);
    
    addResult(
        'resize 窗口调整',
        '窗口调整防抖',
        callCount === 1,
        '执行1次',
        `执行${callCount}次`,
        callCount === 1 ? 'resize防抖正常' : 'resize防抖异常'
    );
    
    // ---------- 测试11: 取消功能（使用返回的取消函数）----------
    callCount = 0;
    const fn11 = () => { callCount++; };
    const debounce11 = debounce(fn11, 100);
    
    const cancel = debounce11(); // 获取取消函数
    cancel(); // 立即取消
    await sleep(150);
    
    addResult(
        '取消功能',
        '使用返回的取消函数手动取消',
        callCount === 0,
        '执行0次',
        `执行${callCount}次`,
        callCount === 0 ? '取消功能正常' : '取消功能失效'
    );
    
    // ---------- 测试12: 多次独立调用序列 ----------
    callCount = 0;
    const results12 = [];
    const fn12 = (id) => { callCount++; results12.push(id); };
    const debounce12 = debounce(fn12, 50);
    
    debounce12('A');
    await sleep(100); // 第一次执行
    debounce12('B');
    await sleep(100); // 第二次执行
    debounce12('C');
    await sleep(100); // 第三次执行
    
    const passed12 = callCount === 3 && 
                     results12[0] === 'A' && 
                     results12[1] === 'B' && 
                     results12[2] === 'C';
    
    addResult(
        '多次独立调用序列',
        '间隔超过delay的调用应独立执行',
        passed12,
        '执行3次，顺序为[A,B,C]',
        `执行${callCount}次，顺序为[${results12.join(',')}]`,
        passed12 ? '独立调用序列正常' : '调用序列异常'
    );
    
    // ---------- 测试13: 边界 - delay为0 ----------
    callCount = 0;
    const fn13 = () => { callCount++; };
    const debounce13 = debounce(fn13, 0);
    
    debounce13();
    debounce13();
    debounce13();
    await sleep(50);
    
    // delay为0时，所有调用都会立即执行（setTimeout 0）
    // 但由于是同步代码，前两次会被清除，只执行最后一次
    addResult(
        '边界 - delay为0',
        '极端延迟参数处理',
        callCount === 1,
        '执行1次（最后一次）',
        `执行${callCount}次`,
        `delay为0，实际执行${callCount}次`
    );
    
    // ---------- 测试14: 边界 - 同步连续调用 ----------
    callCount = 0;
    lastArg = null;
    const fn14 = (arg) => { callCount++; lastArg = arg; };
    const debounce14 = debounce(fn14, 50);
    
    debounce14('sync1');
    debounce14('sync2');
    debounce14('sync3');
    debounce14('sync4');
    debounce14('sync5');
    await sleep(100);
    
    addResult(
        '边界 - 同步连续调用',
        '同步代码块中的多次调用',
        callCount === 1 && lastArg === 'sync5',
        '执行1次，参数为"sync5"',
        `执行${callCount}次，参数为"${lastArg}"`,
        callCount === 1 ? '同步调用合并正常' : '同步调用合并异常'
    );
    
    // ---------- 测试15: 边界 - 长时间间隔调用 ----------
    callCount = 0;
    const fn15 = () => { callCount++; };
    const debounce15 = debounce(fn15, 50);
    
    debounce15();
    await sleep(100); // 超过delay
    debounce15();
    await sleep(100); // 超过delay
    debounce15();
    await sleep(100);
    
    addResult(
        '边界 - 长时间间隔调用',
        '超过delay的间隔调用应独立执行',
        callCount === 3,
        '执行3次',
        `执行${callCount}次`,
        callCount === 3 ? '独立调用执行正常' : '独立调用执行异常'
    );
    
    // ---------- 测试16: 对象方法上下文保持 ----------
    const obj16 = {
        value: 42,
        getValue() { return this.value; }
    };
    
    let methodResult = null;
    const debounce16 = debounce(function() {
        methodResult = this.getValue();
    }, 50);
    
    obj16.debouncedMethod = debounce16;
    obj16.debouncedMethod();
    await sleep(100);
    
    addResult(
        '对象方法上下文保持',
        '作为对象方法调用时保持this指向',
        methodResult === 42,
        'this.getValue() === 42',
        `this.getValue() === ${methodResult}`,
        methodResult === 42 ? '方法上下文保持正确' : '方法上下文丢失'
    );
    
    // 打印测试报告
    printReport();
    
    return testResults;
}

// ============================================
// 执行测试
// ============================================

// 运行测试（在支持 async/await 的环境中执行）
runTests().then(results => {
    // 可以通过返回值获取详细结果
    // console.log(results);
}).catch(err => {
    console.error('测试执行出错:', err);
});
