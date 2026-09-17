"use client";

import { useEffect, useState } from "react";
import { ReactFlow, Background, Controls, type Node, type Edge, } from "@xyflow/react";
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

  function analyzeFolder() {
    setSelectedFile(null);

    fetch(
      `http://127.0.0.1:8000/analyze?folder=${encodeURIComponent(folder)}`
    )
      .then((response) => response.json())
      .then((result) => {
        setData(result);
      });
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
            graph={data.dependency_graph} 
            files={data.project}
            onSelectFile={setSelectedFile}
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
          const fileName = file.file.split("/").pop();
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
}: 
{
  graph: Graph;
  files: FileInfo[];
  onSelectFile: (file: FileInfo)=>void;
}) 
{
  const nodes: Node[] = graph.nodes.map((node, index) => ({
    id: node.id,

    position: {
      x: 100 + index * 180,
      y: 180,
    },

    data: {
      label: node.id,
    },

    style: {
      background: "#73849c",
      color: "#bbcad8",
      border: "1px #232527",
      borderRadius: "8px",
      padding: "12px",
      fontSize: "14px"
    },
  }));

  const edges: Edge[] = graph.edges.map((edge, index) => ({
    id: `edge-${index}`,
    source: edge.source,
    target: edge.target,
  }));

  return (
    <div className="h-[500px] overflow-hidden rounded-lg border border-white/10 bg-white/5">
      <div className="border-b border-white/10 px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
          Codebase Graph
        </p>
      </div>

      <div className="h-[450px]">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          fitView
          onNodeClick={(_, node) => {
            const matchingFile = files.find(
              (file) =>file.file.split("/").pop() === node.id
            );

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