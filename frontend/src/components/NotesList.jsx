export default function NotesList({ notes, onSelect, onDelete, onAnalyze, selectedId, loading }) {
  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-slate-100 text-slate-600',
      processing: 'bg-yellow-100 text-yellow-700',
      completed: 'bg-green-100 text-green-700',
      failed: 'bg-red-100 text-red-700'
    };
    return styles[status] || styles.pending;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (notes.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
        <div className="text-slate-400 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-slate-700 mb-2">No notes yet</h3>
        <p className="text-slate-500">Upload your first lecture notes to get started</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-200">
        <h2 className="text-lg font-semibold text-slate-800">Your Notes</h2>
      </div>

      <div className="divide-y divide-slate-100">
        {notes.map((note) => (
          <div
            key={note._id}
            className={`p-4 hover:bg-slate-50 transition-colors cursor-pointer ${
              selectedId === note._id ? 'bg-primary-50' : ''
            }`}
            onClick={() => onSelect(note._id)}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-medium text-slate-800 truncate">{note.title}</h3>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusBadge(note.status)}`}>
                    {note.status}
                  </span>
                </div>
                <p className="text-sm text-slate-500 mb-2">
                  {note.fileName} • {formatDate(note.createdAt)}
                </p>
                {note.analysis?.keywords?.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {note.analysis.keywords.slice(0, 5).map((kw, i) => (
                      <span key={i} className="px-2 py-0.5 text-xs bg-slate-100 text-slate-600 rounded">
                        {kw}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                {note.status === 'pending' && (
                  <button
                    onClick={() => onAnalyze(note._id)}
                    disabled={loading}
                    className="px-3 py-1.5 text-xs font-medium bg-primary-600 text-white rounded hover:bg-primary-700 disabled:opacity-50"
                  >
                    Analyze
                  </button>
                )}
                <button
                  onClick={() => onDelete(note._id)}
                  className="px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}