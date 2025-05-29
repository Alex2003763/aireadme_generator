import React from 'react';
import ReactMarkdown from 'react-markdown';
// @ts-expect-error Problem with esm.sh type resolution for remark-gfm in this specific setup.
// See https://github.com/remarkjs/remark-gfm/issues/95 for related discussions on ESM and types.
// The runtime import should work due to the import map.
import remarkGfm from 'remark-gfm';

interface GeneratedPreviewProps {
  markdown: string;
}

const GeneratedPreview: React.FC<GeneratedPreviewProps> = ({ markdown }) => {
  if (!markdown) {
    return (
      <div className="text-slate-400 italic p-4 border border-dashed border-slate-700 rounded-md min-h-[200px] flex items-center justify-center">
        Your README preview will appear here once generated.
      </div>
    );
  }

  return (
    <div className="markdown-preview prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none prose-invert">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {markdown}
      </ReactMarkdown>
    </div>
  );
};

export default GeneratedPreview;