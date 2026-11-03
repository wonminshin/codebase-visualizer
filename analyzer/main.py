from pathlib import Path
import json
from analyzer.parser import analyze_file

def analyze_project(folder):
    root = Path(folder).resolve()

    files = root.rglob("*.py")
    project = []

    for file in files:
        result = analyze_file(file)

        # Convert absolute path to path relative to project root
        result["file"] = file.relative_to(root).as_posix()

        project.append(result)

    return project

def build_dependency_graph(project_data):
    nodes = []
    edges = []

    module_map = {}

    # Build a map of module names -> file paths
    for item in project_data:
        file_path = item["file"]

        # analyzer/parser.py -> analyzer.parser
        module_name = file_path.replace("/", ".").removesuffix(".py")

        # analyzer/__init__.py -> analyzer
        if module_name.endswith(".__init__"):
            module_name = module_name.removesuffix(".__init__")

        module_map[module_name] = file_path

        nodes.append({
            "id": file_path,
            "type": "file"
        })

    # Build edges
    for item in project_data:
        source_file = item["file"]

        for imported_module in item["imports"]:
            if not isinstance(imported_module, str) or not imported_module:
                continue
            target_file = None

            # First try the full module name
            if imported_module in module_map:
                target_file = module_map[imported_module]

            # If that fails, try matching a module in the same folder
            else:
                source_folder = Path(source_file).parent

                if str(source_folder) == ".":
                    local_module = imported_module
                else:
                    local_module = (
                        source_folder.as_posix().replace("/", ".")
                        + "."
                        + imported_module
                    )

                if local_module in module_map:
                    target_file = module_map[local_module]

            if target_file:
                edges.append({
                    "source": source_file,
                    "target": target_file
                })

    return {
        "nodes": nodes,
        "edges": edges
    }
def build_call_graph(project_data):
    nodes = []
    edges = []

    symbol_map = build_symbol_map(project_data)

    for item in project_data:
        file_name = item["file"]

        # 1. Add top-level function nodes
        for function in item["functions"]:
            function_name = function["name"]

            nodes.append({
                "id": f"{file_name}::{function_name}",
                "type": "function"
            })

        # 2. Add class + method nodes
        for class_info in item["classes"]:
            class_name = class_info["name"]

            nodes.append({
                "id": f"{file_name}::{class_name}",
                "type": "class"
            })

            for method in class_info["methods"]:
                method_name = method["name"]

                nodes.append({
                    "id": f"{file_name}::{class_name}::{method_name}",
                    "type": "method"
                })

        # 3. Build edges from top-level functions
        for function in item["functions"]:
            function_name = function["name"]

            source_id = f"{file_name}::{function_name}"

            for called_name in function["calls"]:

                if called_name in symbol_map:
                    target = symbol_map[called_name]

                    if target["type"] == "function":
                        target_id = f'{target["file"]}::{called_name}'

                    elif target["type"] == "class":
                        target_id = f'{target["file"]}::{called_name}'

                    elif target["type"] == "method":
                        target_id = (
                            f'{target["file"]}::'
                            f'{target["class"]}::'
                            f'{called_name}'
                        )

                    edges.append({
                        "source": source_id,
                        "target": target_id
                    })
        # 4. Build edges from methods
        for class_info in item["classes"]:
            class_name = class_info["name"]

            for method in class_info["methods"]:
                method_name = method["name"]

                source_id = f"{file_name}::{class_name}::{method_name}"

                for called_name in method["calls"]:

                    if called_name in symbol_map:
                        target = symbol_map[called_name]

                        if target["type"] == "function":
                            target_id = f'{target["file"]}::{called_name}'

                        elif target["type"] == "class":
                            target_id = f'{target["file"]}::{called_name}'

                        elif target["type"] == "method":
                            target_id = (
                                f'{target["file"]}::'
                                f'{target["class"]}::'
                                f'{called_name}'
                            )

                        edges.append({
                            "source": source_id,
                            "target": target_id
                        })

    return {
        "nodes": nodes,
        "edges": edges
    }

def build_symbol_map(project_data):
    symbol_map = {}

    for item in project_data:
        file_name = item["file"].split("/")[-1]
        #Top-level functions
        for function in item["functions"]:
            symbol_map[function["name"]] = {
                "file": file_name,
                "type": "function"
            }
        # Classes
        for class_info in item["classes"]:
            class_name = class_info["name"]
            symbol_map[class_name] = {
                "file": file_name,
                "type": "class"
            }
            # Methods inside each class
            for method in class_info["methods"]:
                symbol_map[method["name"]] = {
                    "file": file_name,
                    "class": class_name,
                    "type": "method"
                }
    return symbol_map

def build_summary(project_data):
    file_count = len(project_data)

    function_count = 0
    class_count = 0
    method_count = 0

    for item in project_data:
        function_count += len(item["functions"])
        class_count += len(item["classes"])

        for class_info in item["classes"]:
            method_count += len(class_info["methods"])

    return {
        "files": file_count,
        "functions": function_count,
        "classes": class_count,
        "methods": method_count
    }

project = analyze_project("sample")
call_graph = build_call_graph(project)

print(json.dumps(call_graph, indent=2))



