from pathlib import Path
import json
from parser import analyze_file

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

        for function in item["functions"]:
            nodes.append({
                "id": f"{file_name}::{function}",
                "type": "function"
            })

        for class_name in item["classes"]:
            nodes.append({
                "id": f"{file_name}::{class_name}",
                "type": "class"
            })

    return {
        "nodes": nodes,
        "edges": edges
    }

def get_project_symbols(project_data):
    symbols = set()

    for item in project_data:
        for function in item["functions"]:
            symbols.add(function)

        for class_name in item["classes"]:
            symbols.add(class_name)

    return symbols

def build_symbol_map(project_data):
    symbol_map = {}

    for item in project_data:
        file_name = item["file"].split("/")[-1]

        for function in item["functions"]:
            symbol_map[function] = file_name

        for class_name in item["classes"]:
            symbol_map[class_name] = file_name

    return symbol_map

project = analyze_project("sample")
'''graph = build_dependency_graph(project)
symbols = get_project_symbols(project)
symbol_map = build_symbol_map(project)
print(symbol_map)
print(symbols)
print(json.dumps(graph, indent=2))'''
#call_graph = build_call_graph(project)
print(json.dumps(project,indent=2))


