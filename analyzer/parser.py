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

def get_classes(tree):
    classes = []
    for node in ast.walk(tree):
        if isinstance(node, ast.ClassDef):
            classes.append(node.name)
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
    return {
        "file": str(file_path),
        "functions": get_function_details(tree),
        "classes": get_classes(tree),
        "imports": get_imports(tree),
    }

