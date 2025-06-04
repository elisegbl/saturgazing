'use client';


import { useEffect, useState } from 'react';

// Reusable component for rendering suggestions
function SuggestionList({ items, onSelect, formatItem }) {
  return (
    <ul className="mb-4 bg-white shadow-md rounded-lg border p-4 max-h-48 overflow-auto font-sans">
      {items.map((item, index) => (
        <li
          key={index}
          className="py-2 text-sm text-gray-700 cursor-pointer hover:bg-pink-100 transition-colors"
          onClick={() => onSelect(item)}
        >
          {formatItem ? formatItem(item) : item}
        </li>
      ))}
    </ul>
  );
}

export default function Home() {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchMode, setSearchMode] = useState('text');
  const [searchText, setSearchText] = useState('');
  const [searchAuthor, setSearchAuthor] = useState('');
  const [searchTag, setSearchTag] = useState('');

  const [suggestedAuthors, setSuggestedAuthors] = useState([]);
  const [suggestedTags, setSuggestedTags] = useState([]);

  useEffect(() => {
    const fetchQuotes = async () => {
      try {
        const response = await fetch('/api/quotes');
        if (!response.ok) throw new Error('Failed to fetch quotes');
        const data = await response.json();
        setQuotes(data);
      } catch (error) {
        console.error('Fetch quotes error:', error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchQuotes();
  }, []);

  const normalize = (str) => (str || '').toLowerCase();

  const filteredQuotes = quotes.filter(({ text = '', author = '', tags = [] }) => {
    const nText = normalize(text);
    const nAuthor = normalize(author);
    const nTags = Array.isArray(tags) ? tags.map(normalize) : [];

    if (searchMode === 'text') return nText.includes(normalize(searchText));
    if (searchMode === 'author') return nAuthor.includes(normalize(searchAuthor));
    if (searchMode === 'tag') return nTags.some(tag => tag === normalize(searchTag));
    return true;
  });

  const handleAuthorSearch = (e) => {
    const query = e.target.value;
    setSearchAuthor(query);

    const normalizedQuery = normalize(query);
    const uniqueAuthors = Array.from(new Set(quotes.map(q => q.author).filter(Boolean)));

    const filtered = uniqueAuthors.filter(author =>
      normalize(author).includes(normalizedQuery)
    );

    setSuggestedAuthors(filtered);
  };

  const handleTagSearch = (e) => {
    const query = e.target.value;
    setSearchTag(query);

    const normalizedQuery = normalize(query);
    const tagCounts = {};

    if (Array.isArray(quotes)) {
      quotes.forEach(({ tags }) => {
        if (!Array.isArray(tags)) return;
        tags.forEach(tag => {
          const nTag = normalize(tag);
          if (nTag.includes(normalizedQuery)) {
            tagCounts[nTag] = (tagCounts[nTag] || 0) + 1;
          }
        });
      });
    }

    const suggestions = Object.entries(tagCounts).map(([tag, count]) => ({ tag, count }));
    setSuggestedTags(suggestions);
  };

  const handleSearchInput = (e) => {
    if (searchMode === 'author') {
      handleAuthorSearch(e);
    } else if (searchMode === 'tag') {
      handleTagSearch(e);
    } else {
      setSearchText(e.target.value);
    }
  };

  const getSearchValue = () => {
    if (searchMode === 'author') return searchAuthor;
    if (searchMode === 'tag') return searchTag;
    return searchText;
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-pink-50 py-12 px-4 font-sans">
      <div className="w-full max-w-3xl p-6 bg-white rounded-lg shadow-lg">
        <div className="mb-6 p-6 rounded-xl bg-pink-700 text-white text-center font-bold text-2xl leading-snug">
          a gathering of voices across space and time,<br />
          together illuminating our hearts&apos<br />
          unchanging joys and curiosities!
          <span className="relative inline-block ml-2">
            <div className="inline-block group">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-white cursor-pointer"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z" />
              </svg>
              <div
                className="absolute z-10 w-80 text-sm font-normal text-left p-4 bg-white text-pink-800 rounded-lg shadow-lg opacity-0 pointer-events-none transition-opacity duration-300 -top-2 left-8 group-hover:opacity-100 group-hover:pointer-events-auto text-justify"
              >
                  on the surface, this is a growing database of poems i&apos;ve collected over the years!<br /><br />
                  beneath that, this is me serving my compulsion for archival (the alternative is that i go on worrying about the poems becoming irretrievably lost in my gallery) (OCR is unreliable sometimes)<br /><br />
                  the tags reveal a lot about how i read certain texts lol so if the correlation is unclear (ex. “why is this tagged as hope...”) just know it&apos;s probably some self-constructed narrative 🤣
                  always wished i could search through my collection not just by Text but by Feeling so this is kind of my solution for that (might not be the most optimal) (kindly advise) (the price i pay is the time i spend manually tagging each quote LOL but i just charge it to time spent revisiting them)
              </div>
            </div>
          </span>
        </div>

        <div className="flex items-center mb-6">
          <input
            type="text"
            placeholder={`Search by ${searchMode}`}
            className="border border-pink-400 p-3 w-full rounded-l-lg focus:ring-2 focus:ring-pink-400 text-black"
            value={getSearchValue()}
            onChange={handleSearchInput}
          />
          <select
            className="border border-pink-400 p-3 rounded-r-lg focus:ring-2 focus:ring-pink-400 ml-2 text-black"
            value={searchMode}
            onChange={(e) => {
              setSearchMode(e.target.value);
              setSearchText('');
              setSearchAuthor('');
              setSearchTag('');
              setSuggestedAuthors([]);
              setSuggestedTags([]);
            }}
          >
            <option value="text">Text</option>
            <option value="author">Author</option>
            <option value="tag">Tag</option>
          </select>
        </div>

        {searchMode === 'author' && suggestedAuthors.length > 0 && (
          <SuggestionList
            items={suggestedAuthors}
            onSelect={(author) => {
              setSearchAuthor(author);
              setSuggestedAuthors([]);
            }}
          />
        )}

        {searchMode === 'tag' && suggestedTags.length > 0 && (
          <SuggestionList
            items={suggestedTags}
            onSelect={({ tag }) => {
              setSearchTag(tag);
              setSuggestedTags([]);
            }}
            formatItem={({ tag, count }) => `${tag} (${count} ${count === 1 ? 'quote' : 'quotes'})`}
          />
        )}

        {loading && (
          <p className="text-center text-xl text-pink-700 font-semibold">Loading quotes...</p>
        )}

        {!loading && filteredQuotes.length === 0 && (
          <p className="text-center text-pink-900 mt-6">No quotes found.</p>
        )}

        <div className="flex flex-col gap-6 mt-6 font-sans">
          {filteredQuotes.map((quote) => (
            <div
              key={quote.id || Math.random()}
              className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <p className="text-lg text-pink-900 whitespace-pre-wrap">{quote.text}</p>
              <p className="mt-2 text-sm font-semibold text-pink-900">
                {quote.source ? `${quote.source} by ` : 'by '}
                {quote.author}
              </p>
              {Array.isArray(quote.tags) && quote.tags.length > 0 && (
                <div className="mt-2 text-xs text-gray-500 italic">
                  Tags: {quote.tags.join(', ')}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
