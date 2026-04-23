export default function NoteDetail({ note, onClose }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden h-fit sticky top-4">
      <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
        <h2 className="font-semibold text-slate-800">Note Details</h2>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="p-6 space-y-6">
        <div>
          <h3 className="text-sm font-medium text-slate-500 mb-1">Title</h3>
          <p className="text-slate-800 font-medium">{note.title}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-medium text-slate-500 mb-1">File</h3>
            <p className="text-slate-700 text-sm">{note.fileName}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-slate-500 mb-1">Type</h3>
            <p className="text-slate-700 text-sm uppercase">{note.fileType}</p>
          </div>
        </div>

        {note.analysis?.summary && (
          <div>
            <h3 className="text-sm font-medium text-slate-500 mb-2">Summary</h3>
            <div className="p-4 bg-slate-50 rounded-lg">
              <p className="text-slate-700 text-sm leading-relaxed">{note.analysis.summary}</p>
            </div>
          </div>
        )}

        {note.analysis?.keywords?.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-slate-500 mb-2">Keywords</h3>
            <div className="flex flex-wrap gap-2">
              {note.analysis.keywords.map((kw, i) => (
                <span key={i} className="px-3 py-1 text-sm bg-primary-100 text-primary-700 rounded-full">
                  {kw}
                </span>
              ))}
            </div>
          </div>
        )}

        {note.analysis?.questions?.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-slate-500 mb-2">Generated Questions</h3>
            <div className="space-y-2">
              {note.analysis.questions.map((q, i) => (
                <div key={i} className="p-3 bg-slate-50 rounded-lg border-l-2 border-primary-500">
                  <p className="text-slate-700 text-sm">{q}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {note.analysis?.wordCount && (
          <div>
            <h3 className="text-sm font-medium text-slate-500 mb-1">Word Count</h3>
            <p className="text-2xl font-bold text-primary-600">{note.analysis.wordCount}</p>
          </div>
        )}

        <div>
          <h3 className="text-sm font-medium text-slate-500 mb-1">Original Content</h3>
          <div className="p-4 bg-slate-50 rounded-lg max-h-48 overflow-y-auto">
            <p className="text-slate-600 text-sm whitespace-pre-wrap">
              {note.originalContent?.substring(0, 500)}
              {note.originalContent?.length > 500 && '...'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}