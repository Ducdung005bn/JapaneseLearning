import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { getFontSizeClass } from "../Other/SettingMenu.jsx";

function TreeNode({ node, setting }) {
  const [open, setOpen] = useState(false);

  const hasChildren = node.children && node.children.length > 0;

  return (
    <li className="relative pl-3 py-0">
      {/* Tree line */}
      <span className="absolute left-0 top-1 h-full border-l-2 border-gray-300"></span>

      <div
        className="flex items-center gap-1 px-2 py-1 rounded-md bg-white border border-blue-100 transition cursor-pointer"
        onClick={() => hasChildren && setOpen(!open)}
      >
        {hasChildren && (
          <span
            className={`${getFontSizeClass(setting.fontSize, "medium")} transform transition-transform duration-200`}
            style={{ rotate: open ? "90deg" : "0deg" }}
          >
            <ChevronRight />
          </span>
        )}
        <span className={`${getFontSizeClass(setting.fontSize, "medium")} font-bold text-red-500`}>{node.part}</span>
      </div>

      {open && hasChildren && (
        <div className="ml-5 mt-1">
          <TreeSection nodes={node.children} setting={setting} />
        </div>
      )}
    </li>
  );
}

export default function TreeSection({ nodes, setting }) {
  return (
    <section>
      <ul className="space-y-1">
        {nodes.map((node, idx) => (
          <TreeNode key={idx} node={node} setting={setting} />
        ))}
      </ul>
    </section>
  );
}
