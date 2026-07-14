import { readFileSync } from "fs";
import { join } from "path";

export const metadata = {
  title: "Lapangin API Documentation",
  description: "Complete API reference for the Lapangin booking platform.",
};

function loadEndpoints(): string[][] {
  try {
    const specPath = join(process.cwd(), "docs", "openapi.yaml");
    const spec = readFileSync(specPath, "utf-8");
    // Lightweight parse: extract path lines from YAML
    const endpoints: string[][] = [];
    const lines = spec.split("\n");
    let currentTag = "";
    let currentMethod = "";
    let currentPath = "";
    let currentSummary = "";

    for (const line of lines) {
      const tagMatch = line.match(/^\s+tags:\s*\[(.+)\]/);
      if (tagMatch) currentTag = tagMatch[1];

      const methodMatch = line.match(/^\s{4}(get|post|put|patch|delete):\s*$/);
      if (methodMatch) {
        currentMethod = methodMatch[1].toUpperCase();
      }

      const pathMatch = line.match(/^  (\/api\/.+):$/);
      if (pathMatch) {
        currentPath = pathMatch[1];
      }

      const summaryMatch = line.match(/^\s+summary:\s+(.+)$/);
      if (summaryMatch && currentMethod && currentPath) {
        currentSummary = summaryMatch[1];
        endpoints.push([currentMethod, currentPath, currentTag, currentSummary]);
        currentMethod = "";
        currentSummary = "";
      }
    }

    return endpoints;
  } catch {
    return [];
  }
}

export default function ApiDocsPage() {
  const endpoints = loadEndpoints();

  const groups: Record<string, string[][]> = {};
  for (const ep of endpoints) {
    const tag = ep[2] || "Other";
    (groups[tag] ??= []).push(ep);
  }

  const tagOrder = ["Auth", "Public", "Customer", "Owner", "Admin"];
  const orderedTags = [
    ...tagOrder.filter((t) => t in groups),
    ...Object.keys(groups).filter((t) => !tagOrder.includes(t)),
  ];

  const methodColors: Record<string, string> = {
    GET: "bg-blue-100 text-blue-800",
    POST: "bg-emerald-100 text-emerald-800",
    PUT: "bg-amber-100 text-amber-800",
    PATCH: "bg-orange-100 text-orange-800",
    DELETE: "bg-red-100 text-red-800",
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-2 text-3xl font-bold text-slate-900">
          Lapangin API Reference
        </h1>
        <p className="mb-8 text-slate-600">
          {endpoints.length} endpoints across {orderedTags.length} groups.
          Full OpenAPI 3.0 spec available at{" "}
          <code className="rounded bg-slate-200 px-1.5 py-0.5 text-sm">
            docs/openapi.yaml
          </code>
        </p>

        {orderedTags.map((tag) => (
          <section key={tag} className="mb-10">
            <h2 className="mb-4 text-xl font-semibold text-slate-800">
              {tag}
            </h2>
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Method</th>
                    <th className="px-4 py-3">Path</th>
                    <th className="px-4 py-3">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(groups[tag] ?? []).map((ep, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold ${methodColors[ep[0]] ?? "bg-slate-100 text-slate-800"}`}
                        >
                          {ep[0]}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-700">
                        {ep[1]}
                      </td>
                      <td className="px-4 py-3 text-slate-600">{ep[3]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
