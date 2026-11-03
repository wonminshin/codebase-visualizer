import ast


def parse_file(file_path):
    with open(file_path, "r", encoding="utf-8") as file:
        source_code = file.read()
    return ast.parse(source_code)


def get_functions(tree):
    functions = []
    for node in ast.walk(tree):
        if isinstance(node, ast.FunctionDef):
            functions.append(node.name)

    return functions

def get_class_details(tree):
    classes = []

    for node in tree.body:
        if isinstance(node, ast.ClassDef):
            methods = []

            for child in node.body:
                if isinstance(child, ast.FunctionDef):
                    calls = []
                    for call_node in ast.walk(child):
                        if isinstance(call_node, ast.Call):
                            if isinstance(call_node.func, ast.Name):
                                calls.append(call_node.func.id)
                            elif isinstance(call_node.func, ast.Attribute):
                                calls.append(call_node.func.attr)
                    methods.append({
                        "name": child.name,
                        "line": child.lineno,
                        "calls": calls
                    })
            classes.append({
                "name": node.name,
                "line": node.lineno,
                "methods": methods
            })

    return classes

def get_imports(tree):
    imports = []
    for node in ast.walk(tree):
        if isinstance(node, ast.Import):
            for name in node.names:
                imports.append(name.name)
        elif isinstance(node, ast.ImportFrom):
            imports.append(node.module)

    return imports

def get_function_calls(tree):
    calls = []
    for node in ast.walk(tree):
        if isinstance(node, ast.Call):
            if isinstance(node.func, ast.Name):
                calls.append(node.func.id)
            elif isinstance(node.func, ast.Attribute):
                calls.append(node.func.attr)

    return calls

def get_function_details(tree):
    functions = []

    for node in tree.body:
        if isinstance(node, ast.FunctionDef):
            calls = []

            for child in ast.walk(node):
                if isinstance(child, ast.Call):

                    if isinstance(child.func, ast.Name):
                        calls.append(child.func.id)

                    elif isinstance(child.func, ast.Attribute):
                        calls.append(child.func.attr)

            functions.append({
                "name": node.name,
                "line": node.lineno,
                "calls": calls
            })

    return functions

def analyze_file(file_path):
    tree = parse_file(file_path)

    with open(file_path, "r", encoding="utf-8") as file:
        source_code = file.read()

    return {
        "file": str(file_path),
        "functions": get_function_details(tree),
        "classes": get_class_details(tree),
        "imports": get_imports(tree),
        "source_code": source_code
    }

