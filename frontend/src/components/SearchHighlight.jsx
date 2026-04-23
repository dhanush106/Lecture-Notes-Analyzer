import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Search, X, ChevronUp, ChevronDown, Hash } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import apiClient from '../services/apiClient';

export default function SearchHighlight({ content, noteId }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [matches, setMatches] = useState([]);
  const [currentMatch, setCurrentMatch] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const inputRef = useRef(null);
  const matchRefs = useRef([]);

  const debouncedSearch = useCallback(async (query, id) => {
    if (query.length < 2 || !id) return;
    
    setIsSearching(true);
    try {
      const response = await apiClient.get(`/notes/${id}/search`, { params: { q: query } });
      const data = response.data;
      if (data.success) {
        setMatches(data.data.matches);
        setCurrentMatch(0);
        setShowResults(true);
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.length >= 2) {
        debouncedSearch(searchQuery, noteId);
      } else {
        setMatches([]);
        setShowResults(false);
      }
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [searchQuery, noteId, debouncedSearch]);

  const highlightedContent = useMemo(() => {
    if (matches.length === 0 || !searchQuery) {
      return content;
    }

    const parts = [];
    let lastIndex = 0;
    const queryLower = searchQuery.toLowerCase();
    const contentLower = content.toLowerCase();
    
    matches.forEach((match) => {
      const pos = match.position;
      if (pos > lastIndex) {
        parts.push({
          type: 'text',
          content: content.slice(lastIndex, pos)
        });
      }
      parts.push({
        type: 'match',
        content: content.slice(pos, pos + searchQuery.length),
        index: parts.length
      });
      lastIndex = pos + searchQuery.length;
    });
    
    if (lastIndex < content.length) {
      parts.push({
        type: 'text',
        content: content.slice(lastIndex)
      });
    }

    return parts;
  }, [content, matches, searchQuery]);

  const scrollToMatch = (index) => {
    setCurrentMatch(index);
    if (matchRefs.current[index]) {
      matchRefs.current[index].scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setMatches([]);
    setShowResults(false);
    setCurrentMatch(0);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (matches.length > 0) {
        scrollToMatch((currentMatch + 1) % matches.length);
      }
    }
    if (e.key === 'Escape') {
      clearSearch();
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      scrollToMatch(Math.min(currentMatch + 1, matches.length - 1));
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      scrollToMatch(Math.max(currentMatch - 1, 0));
    }
  };

  const handleSelectMatch = (index) => {
    setCurrentMatch(index);
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search in content... (Enter to navigate)"
              className="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                         focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none 
                         dark:bg-gray-800 dark:text-white transition-colors"
              disabled={isSearching}
            />
            {isSearching && (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity }}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 border-2 border-primary-400 border-t-transparent rounded-full"
              />
            )}
          </div>
          
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              title="Clear search"
            >
              <X size={20} />
            </button>
          )}
        </div>

        <AnimatePresence>
          {showResults && matches.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 max-h-64 overflow-y-auto z-10"
            >
              <div className="sticky top-0 px-4 py-2 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Found {matches.length} matches
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => scrollToMatch(Math.max(0, currentMatch - 1))}
                    disabled={currentMatch === 0}
                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded disabled:opacity-50"
                  >
                    <ChevronUp size={16} />
                  </button>
                  <span className="text-sm text-gray-500">
                    {currentMatch + 1} / {matches.length}
                  </span>
                  <button
                    onClick={() => scrollToMatch(Math.min(matches.length - 1, currentMatch + 1))}
                    disabled={currentMatch === matches.length - 1}
                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded disabled:opacity-50"
                  >
                    <ChevronDown size={16} />
                  </button>
                </div>
              </div>
              
              <div className="py-2">
                {matches.map((match, index) => (
                  <button
                    key={index}
                    onClick={() => handleSelectMatch(index)}
                    className={`w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                      index === currentMatch ? 'bg-primary-50 dark:bg-primary-900/30' : ''
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <span className="flex-shrink-0 w-6 h-6 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center text-xs font-medium text-gray-500">
                        {index + 1}
                      </span>
                      <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                        {match.context}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="relative">
        <div className="absolute top-2 right-2 px-2 py-1 bg-white/90 dark:bg-gray-800/90 rounded text-xs text-gray-500 flex items-center gap-1">
          <Hash size={12} />
          {matches.length > 0 ? `${matches.length} matches` : content.split(/\s+/).length + ' words'}
        </div>
        
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 max-h-96 overflow-y-auto">
          {Array.isArray(highlightedContent) ? (
            <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
              {highlightedContent.map((part, index) =>
                part.type === 'match' ? (
                  <mark
                    key={index}
                    ref={(el) => (matchRefs.current[index] = el)}
                    className={`bg-yellow-200 dark:bg-yellow-600 px-0.5 rounded cursor-pointer hover:bg-yellow-300 dark:hover:bg-yellow-500 transition-colors ${
                      index === currentMatch ? 'ring-2 ring-primary-500' : ''
                    }`}
                    onClick={() => setCurrentMatch(index)}
                  >
                    {part.content}
                  </mark>
                ) : (
                  <span key={index}>{part.content}</span>
                )
              )}
            </div>
          ) : (
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
              {highlightedContent}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}