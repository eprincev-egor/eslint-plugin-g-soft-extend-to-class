"use strict";

module.exports = {
    meta: {
        docs: {
            description: "Control space in for statement."
        },
        schema: [{
            enum: ["always", "never"]
        }],
        fixable: "code",
        messages: {
            oldTaskStyleNotAllowed: "BaseTask.extend() style is not allowed, please use class syntax",
            invalidTask: "BaseTask.extend() style is not allowed, cannot convert invalid syntax to class"
        }
    },
    create(context) {
        return {
            CallExpression(rootCallNode) {
                const src = context.getSourceCode();

                const isBaseTaskExtend = (
                    rootCallNode.callee && 
                    rootCallNode.callee.type == "MemberExpression" &&
                    rootCallNode.callee.property &&
                    rootCallNode.callee.property.name == "extend" &&
                    rootCallNode.callee.object &&
                    rootCallNode.callee.object.name == "BaseTask"
                );

                if ( isBaseTaskExtend ) {
                    const taskName = (
                        rootCallNode.arguments[0] &&
                        rootCallNode.arguments[0].type == "Literal" &&
                        rootCallNode.arguments[0].value
                    );

                    const isInvalidTask = (
                        !taskName ||
                        !rootCallNode.arguments[1] ||
                        rootCallNode.arguments[1].type != "ObjectExpression"
                    );

                    if ( isInvalidTask ) {
                        context.report({
                            node: rootCallNode,
                            messageId: "invalidTask"
                        });
                        return;
                    }

                    const taskProps = (
                        rootCallNode.arguments[1] &&
                        rootCallNode.arguments[1].properties
                    ) || [];

                    let taskBody = "";

                    for (let i = 0, n = taskProps.length; i < n; i++) {
                        const propNode = taskProps[i];
                        const propName = propNode.key.name;

                        if ( propNode.method ) {
                            // method arguments
                            const args = propNode.value.params;
                            const argsSrc = args.map(arg => src.getText(arg)).join(", ");

                            // method content
                            const methodBodyNode = propNode.value.body;
                            let methodBodySrc = src.getText(methodBodyNode);
                            
                            if ( methodBodySrc[0] == "{" ) {
                                methodBodySrc = methodBodySrc.slice(1, -1);
                            }
                            methodBodySrc = methodBodySrc.trim();
                            
                            // if constructor
                            if ( propName == "init" ) {
                                taskBody += [
                                    `    constructor(${argsSrc}) {`,
                                    "        super(...arguments);",
                                    "",
                                    "        " + methodBodySrc,
                                    "    }\n"
                                ].join("\n");
                            }
                            // just methods
                            else {
                                if ( i > 0 ) {
                                    taskBody += "\n";
                                }

                                taskBody += [
                                    `    ${ propName }(${argsSrc}) {`,
                                    "        " + methodBodySrc,
                                    "    }\n"
                                ].join("\n");
                            }
                        }
                        else {
                            const propValueSrc = src.getText(propNode.value);
                            
                            taskBody += `    ${ propName }() {return ${propValueSrc};}\n`;
                        }
                    }

                    context.report({
                        node: rootCallNode,
                        messageId: "oldTaskStyleNotAllowed",
                        fix(fixer) {
                            return fixer.replaceText(rootCallNode, `class ${taskName} extends BaseTask {\n${taskBody}\n}`);
                        }
                    });
                }
            }
        };
    }
};
