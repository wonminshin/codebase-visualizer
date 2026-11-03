"use client";
import dagre from "@dagrejs/dagre";
import { useEffect, useState } from "react";
import { ReactFlow, Background, Controls, Position, type Node, type Edge, } from "@xyflow/react";
import "@xyflow/react/dist/style.css";

type Summary = {
  files: number;
  functions: number;
  classes: number;
  methods: number;
};

type FunctionInfo = {
  name: string;
  line: number;
  calls: string[];
};

type MethodInfo = {
  name: string;
  line: number;
  calls: string[];
};

type ClassInfo = {
  name: string;
  line: number;
  methods: MethodInfo[];
};

type FileInfo = {
  file: string;
  functions: FunctionInfo[];
  classes: ClassInfo[];
  imports: string[];
};

type AnalysisData = {
  summary: Summary;
  project: FileInfo[];
  dependency_graph: Graph;
  call_graph: Graph;
};

type GraphNode = {
  id: string;
  type: string;
};

type GraphEdge = {
  source: string;
  target: string;
};

type Graph = {
  nodes: GraphNode[];
  edges: GraphEdge[];
};

export default function Home() {
  const [data, setData] = useState<AnalysisData | null>(null);
  const [selectedFile, setSelectedFile] = useState<FileInfo | null>(null);
  const [folder, setFolder] =useState("analyzer/sample");
  const [error, setError] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const [graphType, setGraphType] = useState<"dependency" | "call">("dependency");

  async function analyzeFolder() {
    if (!folder.trim()) {
      setError("Please enter a folder.");
      return;
    }

    setError("");
    setSelectedFile(null);

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/analyze?folder=${encodeURIComponent(folder)}`
      );

      const result = await response.json();

      if (!response.ok) {
        setError(result.detail || "Unable to analyze folder.");
        return;
      }

      setData(result);
    } catch {
      setError("Could not connect to the CodeLens backend.");
    }
  }
  async function analyzeGithub() {
    if (!repoUrl.trim()) {
      setError("Please enter a GitHub repository URL.");
      return;
    }

    setError("");
    setSelectedFile(null);

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/analyze-github?repo_url=${encodeURIComponent(repoUrl)}`
      );

      const result = await response.json();

      if (!response.ok) {
        setError(result.detail || "Unable to analyze repository.");
        return;
      }

      setData(result);
    } catch {
      setError("Could not connect to the CodeLens backend.");
    }
  }

  useEffect(() => {
    fetch("http://127.0.0.1:8000/analyze?folder=analyzer/sample")
      .then((response) => response.json())
      .then((result) => {
        setData(result);
      });
  }, []);

  if (!data) {
    return <main className="p-8">Analyzing repository...</main>;
  }

  return (
    <main className="min-h-screen bg-[#0d1117] text-white">

      {/* Header */}
      <header className="border-b border-white/10 px-8 py-5">
        <h1 className="text-xl font-semibold">
          CodeLens
        </h1>

        <p className="text-sm text-gray-400">
          AI-powered codebase explorer
        </p>
      </header>
      <div className="px-8 pt-8">
        <p className="mb-2 text-sm text-gray-400">
          Analyze a GitHub repository
        </p>

        <div className="flex gap-3">
          <input
            type="text"
            value={repoUrl}
            onChange={(event) => setRepoUrl(event.target.value)}
            placeholder="https://github.com/username/repository"
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none"
          />

          <button
            onClick={analyzeGithub}
            className="rounded-lg bg-white px-5 py-3 text-sm font-medium text-black hover:bg-gray-200"
          >
            Analyze GitHub
          </button>
        </div>

        {error && (
          <p className="mt-2 ml-4 text-sm text-red-400">
            {error}
          </p>
        )}
      </div>
      <div className="px-8 pt-8">
        <p className="mb-2 text-sm text-gray-400">
          Analyze a codebase
        </p>
        <div className="flex gap-3">
          <input
            type="text"
            value={folder}
            onChange={(event) => setFolder(event.target.value)}
            placeholder="Enter folder path"
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none"
          />

          <button
            onClick={analyzeFolder}
            className="rounded-lg bg-white px-5 py-3 text-sm font-medium text-black hover:bg-gray-200"
          >
            Analyze
          </button>
        </div>
      </div>
      {error && (
        <p className="mt-2 ml-10 text-sm text-red-400">
          {error}
        </p>
      )}

      <div className="p-8">

        <h2 className="mb-5 text-lg font-medium">
          Repository Overview
        </h2>

        {/* Summary cards */}
        <div className="grid grid-cols-4 gap-4">

          <StatCard
            label="Files"
            value={data.summary.files}
          />

          <StatCard
            label="Functions"
            value={data.summary.functions}
          />

          <StatCard
            label="Classes"
            value={data.summary.classes}
          />

          <StatCard
            label="Methods"
            value={data.summary.methods}
          />

        </div>
        <div className="mt-8 grid grid-cols-[250px_1fr_300px] gap-4">

          <Explorer
            files={data.project}
            selectedFile={selectedFile}
            onSelectFile={setSelectedFile}
          />
          <DependencyGraph
            graph={
              graphType === "dependency"
                ? data.dependency_graph
                : data.call_graph
            }
            files={data.project}
            onSelectFile={setSelectedFile}
            graphType={graphType}
            setGraphType={setGraphType}
          />
          <Inspector file={selectedFile} />
        </div>

      </div>
    </main>
  );
}


function StatCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-5">
      <p className="text-sm text-gray-400">
        {label}
      </p>

      <p className="mt-2 text-2xl font-semibold">
        {value}
      </p>
    </div>
  );
}

function Explorer({
  files,
  selectedFile,
  onSelectFile,
}: {
  files: FileInfo[];
  selectedFile: FileInfo | null;
  onSelectFile: (file: FileInfo) => void;
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-4">
      <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-400">
        Explorer
      </p>

      <div className="space-y-1">
        {files.map((file) => {
          const fileName = file.file;
          const isSelected = selectedFile?.file === file.file;

          return (
            <button
              key={file.file}
              onClick={() => onSelectFile(file)}
              className={`block w-full rounded px-2 py-2 text-left text-sm ${
                isSelected
                  ? "bg-white/10 text-white"
                  : "text-gray-300 hover:bg-white/5"
              }`}
            >
              ▸ {fileName}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Inspector({ file }: { file: FileInfo | null }) {
  if (!file) {
    return (
      <div className="rounded-lg border border-white/10 bg-white/5 p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
          Inspector
        </p>

        <p className="mt-4 text-sm text-gray-500">
          Select a file to inspect it.
        </p>
      </div>
    );
  }

  const fileName = file.file.split("/").pop();

  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
        Inspector
      </p>

      <h2 className="mt-4 font-semibold">
        {fileName}
      </h2>

      <div className="mt-6">
        <p className="text-xs uppercase text-gray-500">
          Imports
        </p>

        {file.imports.length > 0 ? (
          file.imports.map((item) => (
            <p key={item} className="mt-2 text-sm text-gray-300">
              {item}
            </p>
          ))
        ) : (
          <p className="mt-2 text-sm text-gray-600">None</p>
        )}
      </div>

      <div className="mt-6">
        <p className="text-xs uppercase text-gray-500">
          Functions
        </p>

        {file.functions.length > 0 ? (
          file.functions.map((func) => (
            <p key={func.name} className="mt-2 text-sm text-gray-300">
              {func.name}() · line {func.line}
            </p>
          ))
        ) : (
          <p className="mt-2 text-sm text-gray-600">None</p>
        )}
      </div>

      <div className="mt-6">
        <p className="text-xs uppercase text-gray-500">
          Classes
        </p>

        {file.classes.length > 0 ? (
          file.classes.map((classInfo) => (
            <div key={classInfo.name} className="mt-2">
              <p className="text-sm text-gray-300">
                {classInfo.name} · line {classInfo.line}
              </p>

              {classInfo.methods.map((method) => (
                <p
                  key={method.name}
                  className="ml-3 mt-1 text-xs text-gray-500"
                >
                  ↳ {method.name}() · line {method.line}
                </p>
              ))}
            </div>
          ))
        ) : (
          <p className="mt-2 text-sm text-gray-600">None</p>
        )}
      </div>
    </div>
  );
}

function DependencyGraph({
  graph,
  files,
  onSelectFile,
  graphType,
  setGraphType,
}: {
  graph: GraphData;
  files: FileInfo[];
  onSelectFile: (file: FileInfo) => void;
  graphType: "dependency" | "call";
  setGraphType: (type: "dependency" | "call") => void;
}) 
{
  const connectedNodeIds = new Set(
    graph.edges.flatMap((edge) => [edge.source, edge.target])
  );

  const visibleGraphNodes =
    graphType === "dependency"
      ? graph.nodes.filter((node) => connectedNodeIds.has(node.id))
      : graph.nodes;

  const initialNodes: Node[] = visibleGraphNodes.map((node) => ({
    id: node.id,

    sourcePosition: Position.Right,
    targetPosition: Position.Left,
    position: {
      x: 0,
      y: 0,
    },

    data: {
      label: node.id.split("/").pop(),
    },

    style: {
      background: "#161b22",
      color: "#f0f6fc",
      border: "1px solid #30363d",
      borderRadius: "8px",
      padding: "12px",
      fontSize: "14px",
      fontWeight: 500,
    },
  }));

  const initialEdges: Edge[] = graph.edges.map((edge, index) => ({
    id: `edge-${index}`,
    source: edge.source,
    target: edge.target,
    type: "smoothstep",
    animated: false,
    style: {
      stroke: "#64748b",
      strokeWidth: 2,
    },
  }));

const {
  nodes,
  edges,
} = getLayoutedElements(initialNodes, initialEdges);
  return (
    <div className="h-[500px] overflow-hidden rounded-lg border border-white/10 bg-white/5">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
          Codebase Graph
        </p>

        <div className="flex gap-2">
          <button
            onClick={() => setGraphType("dependency")}
            className={`rounded-md px-3 py-1.5 text-xs ${
              graphType === "dependency"
                ? "bg-white text-black"
                : "bg-white/10 text-gray-400"
            }`}
          >
            Dependencies
          </button>

          <button
            onClick={() => setGraphType("call")}
            className={`rounded-md px-3 py-1.5 text-xs ${
              graphType === "call"
                ? "bg-white text-black"
                : "bg-white/10 text-gray-400"
            }`}
          >
            Function Calls
          </button>
        </div>
      </div>
      <div className="h-[450px] w-full">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          fitView
          onNodeClick={(_, node) => {
            const filePath = node.id.split("::")[0];
            const matchingFile = files.find((file) => file.file === filePath);
            if (matchingFile) {
              onSelectFile(matchingFile);
            }
          }}
        >
          <Background />
          <Controls />
        </ReactFlow>
      </div>
    </div>
  );
}

function getLayoutedElements(
  nodes: Node[],
  edges: Edge[]
) {
  const dagreGraph = new dagre.graphlib.Graph();

  dagreGraph.setDefaultEdgeLabel(() => ({}));

  dagreGraph.setGraph({
    rankdir: "LR",
    nodesep: 100,
    ranksep: 180,
  });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, {
      width: 180,
      height: 60,
    });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const position = dagreGraph.node(node.id);

    return {
      ...node,
      position: {
        x: position.x - 90,
        y: position.y - 30,
      },
    };
  });

  return {
    nodes: layoutedNodes,
    edges,
  };
}