import { useState } from "react";
import { ChevronRight } from "lucide-react";

function TreeNode({ node }) {
  const [open, setOpen] = useState(false);

  const hasChildren = node.children && node.children.length > 0;

  return (
        <li className="relative pl-4">
        {/* Tree line */}
        <span className="absolute left-0 top-2 h-full border-l-2 border-gray-300"></span>

        <div
            className="flex items-center gap-2 p-2 rounded-lg bg-white border border-blue-200 transition cursor-pointer"
            onClick={() => hasChildren && setOpen(!open)}
        >
            {hasChildren && (
            <span
            className="text-xl transform transition-transform duration-200"
            style={{ rotate: open ? "90deg" : "0deg" }}
            >
            <ChevronRight />
            </span>
            )}
            <span className="font-bold text-red-500">{node.part}</span>
        </div>

        {open && hasChildren && (
            <div className="ml-6 mt-2">
            <TreeSection nodes={node.children} />
            </div>
        )}
        </li>
  );
}

export default function TreeSection({ nodes }) {
  return (
    <section>
      <ul className="space-y-2">
        {nodes.map((node, idx) => (
          <TreeNode key={idx} node={node} />
        ))}
      </ul>
    </section>
  );
}
