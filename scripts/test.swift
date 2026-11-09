import Foundation
import JavaScriptCore

let root = URL(fileURLWithPath: #filePath).deletingLastPathComponent().deletingLastPathComponent()
let context = JSContext()!
var failed = false
context.exceptionHandler = { _, exception in
    fputs("\(exception?.toString() ?? "JavaScript error")\n", stderr)
    failed = true
}
let implementation = try String(contentsOf: root.appendingPathComponent("plugins/library-statistics/statistics.js"), encoding: .utf8)
let tests = try String(contentsOf: root.appendingPathComponent("tests/statistics.js"), encoding: .utf8)
context.evaluateScript(implementation)
let result = context.evaluateScript(tests)
if failed { exit(1) }
print(result?.toString() ?? "No result")
