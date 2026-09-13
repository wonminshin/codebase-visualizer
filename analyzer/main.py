from pathlib import Path
import json
from analyzer.parser import analyze_file

def analyze_project(folder):
    files = Path(folder).rglob("*.py")
    project = []

    for file in files:
        result = analyze_file(file)
        project.append(result)
    return project

def build_dependency_graph(project_data):
    nodes = []
    edges = []
    file_names = {
        item["file"].split("/")[-1].replace(".py", "")
        for item in project_data
    }

    for item in project_data:
        source_file = item["file"].split("/")[-1]
        nodes.append({
            "id": source_file,
            "type": "file"
        })
        for imported_module in item["imports"]:
            imported_root = imported_module.split(".")[0]
            if imported_root in file_names:
                edges.append({
                    "source": source_file,
                    "target": imported_root + ".py"
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
        file_name = item["file"].split("/")[-1]

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



