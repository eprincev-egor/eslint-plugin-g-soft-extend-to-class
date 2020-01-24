"use strict";

let rule = require("../../../lib/rules/g-soft-extend-to-class");
let RuleTester = require("eslint").RuleTester;

let ruleTester = new RuleTester({ 
    parserOptions: { 
        ecmaVersion: 2018, 
        sourceType: "module" 
    } 
});

ruleTester.run("g-soft-extend-to-class", rule, {

    valid: [
        {
            code: "class Test {}"
        },
        {
            code: "Hello.extend('X', {})"
        },
        {
            code: "BaseTask.some('MyTask', {})"
        }
    ],

    invalid: [
        {
            code: `
BaseTask.extend("MyTask", {
    async preload() {
        await x();
    }
})
            `.trim(),
            output: `
class MyTask extends BaseTask {
    async preload() {
        await x();
    }

}
            `.trim(),
            errors: [
                { messageId: "oldTaskStyleNotAllowed" }
            ]
        },
        {
            code: `
BaseTask.extend("MyTask", {
    a() {},
    b() {}
})
            `.trim(),
            output: `
class MyTask extends BaseTask {
    a() {
        
    }

    b() {
        
    }

}
            `.trim(),
            errors: [
                { messageId: "oldTaskStyleNotAllowed" }
            ]
        },
        {
            code: `
BaseTask.extend("MyTask", {
    elems: ["a", "b"],
    is: ["sea"]
})
            `.trim(),
            output: `
class MyTask extends BaseTask {
    elems() {return ["a", "b"];}
    is() {return ["sea"];}

}
            `.trim(),
            errors: [
                { messageId: "oldTaskStyleNotAllowed" }
            ]
        },
        {
            code: `
BaseTask.extend("MyTask", {
    init(x) {
        this.x = x;
    }
})
            `.trim(),
            output: `
class MyTask extends BaseTask {
    constructor(x) {
        super(...arguments);

        this.x = x;
    }

}
            `.trim(),
            errors: [
                { messageId: "oldTaskStyleNotAllowed" }
            ]
        },
        {
            code: `
BaseTask.extend("MyTask", {
    onRenderGrid(x, y = 1) {
        this.elems.grid;
    }
})
                    `.trim(),
            output: `
class MyTask extends BaseTask {
    onRenderGrid(x, y = 1) {
        this.elems.grid;
    }

}
                    `.trim(),
            errors: [
                { messageId: "oldTaskStyleNotAllowed" }
            ]
        },
        {
            code: `
BaseTask.extend("MyTask", {
    onRenderGrid() {
        this.elems.grid;
    }
})
            `.trim(),
            output: `
class MyTask extends BaseTask {
    onRenderGrid() {
        this.elems.grid;
    }

}
            `.trim(),
            errors: [
                { messageId: "oldTaskStyleNotAllowed" }
            ]
        },
        {
            code: `
BaseTask.extend("MyTask", {
    init(params) {
        this.params = params;
    }
})
            `.trim(),
            output: `
class MyTask extends BaseTask {
    constructor(params) {
        super(...arguments);

        this.params = params;
    }

}
            `.trim(),
            errors: [
                { messageId: "oldTaskStyleNotAllowed" }
            ]
        },
        {
            code: "BaseTask.extend('ChildTask')",
            errors: [
                { messageId: "invalidTask" }
            ]
        },
        {
            code: "BaseTask.extend(1, 2)",
            errors: [
                { messageId: "invalidTask" }
            ]
        },
        {
            code: "BaseTask.extend('ChildTask', {})",
            output:  `
class ChildTask extends BaseTask {

}
                        `.trim(),
            errors: [
                { messageId: "oldTaskStyleNotAllowed" }
            ]
        }
    ]
});
