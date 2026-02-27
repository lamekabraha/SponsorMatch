'use client';

import { useState, useRef, useEffect } from 'react';

const CHECK_ICON = (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-full fill-Black" viewBox="0 0 520 520">
    <path
      d="M79.423 240.755a47.529 47.529 0 0 0-36.737 77.522l120.73 147.894a43.136 43.136 0 0 0 36.066 16.009c14.654-.787 27.884-8.626 36.319-21.515L486.588 56.773a6.13 6.13 0 0 1 .128-.2c2.353-3.613 1.59-10.773-3.267-15.271a13.321 13.321 0 0 0-19.362 1.343q-.135.166-.278.327L210.887 328.736a10.961 10.961 0 0 1-15.585.843l-83.94-76.386a47.319 47.319 0 0 0-31.939-12.438z"
      data-name="7-Check"
    />
  </svg>
);

const CHEVRON_ICON = (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-3 fill-Black inline ml-2" viewBox="0 0 24 24">
    <path
      fillRule="evenodd"
      d="M11.99997 18.1669a2.38 2.38 0 0 1-1.68266-.69733l-9.52-9.52a2.38 2.38 0 1 1 3.36532-3.36532l7.83734 7.83734 7.83734-7.83734a2.38 2.38 0 1 1 3.36532 3.36532l-9.52 9.52a2.38 2.38 0 0 1-1.68266.69734z"
      clipRule="evenodd"
    />
  </svg>
);

export interface FocusAreaOption {
  id: string;
  label: string;
  checked?: boolean;
}

interface FocusAreaDropdownProps {
  options?: FocusAreaOption[];
  label?: string;
  name?: string;
}

const DEFAULT_OPTIONS: FocusAreaOption[] = [
  { id: 'sports', label: 'Sports' },
  { id: 'education', label: 'Education' },
  { id: 'health', label: 'Health' },
  { id: 'arts-culture', label: 'Arts & Culture' },
  { id: 'environment', label: 'Environment' },
  { id: 'technology', label: 'Technology' },
  { id: 'community', label: 'Community Development' },
];

export default function FocusAreaDropdown({
  options = DEFAULT_OPTIONS,
  label = 'Dropdown menu with checkbox',
  name = 'focusAreas',
}: FocusAreaDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOptions, setSelectedOptions] = useState<Set<string>>(
    () => new Set(options.filter((o) => o.checked).map((o) => o.id))
  );
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleOption = (id: string) => {
    setSelectedOptions((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const displayLabel =
    selectedOptions.size > 0
      ? `${Array.from(selectedOptions)
          .map((id) => options.find((o) => o.id === id)?.label)
          .filter(Boolean)
          .join(', ')}`
      : label;

  return (
    <div ref={dropdownRef} className="relative w-max">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="px-5 py-2.5 rounded-sm text-Black text-sm font-medium cursor-pointer border-0 outline-0 bg-Yellow hover:bg-Yellow/90"
      >
        {displayLabel}
        {CHEVRON_ICON}
      </button>

      {isOpen && (
        <ul className="absolute block shadow-lg bg-White py-2 px-2 z-[1000] min-w-full w-max rounded-sm max-h-96 overflow-auto top-full left-0 mt-1">
          <li className="mb-2">
            <input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-4 py-2 w-full rounded-sm text-Black text-sm font-medium border border-Black outline-0 bg-White focus:bg-transparent focus:border-Black"
            />
          </li>
          {filteredOptions.map((option) => (
            <li
              key={option.id}
              onClick={() => toggleOption(option.id)}
              className="py-2.5 px-4 hover:bg-Yellow/20 rounded-sm text-Black text-sm font-medium cursor-pointer"
            >
              <div className="flex items-center">
                <input
                  id={`${name}-${option.id}`}
                  type="checkbox"
                  className="hidden peer"
                  checked={selectedOptions.has(option.id)}
                  readOnly
                />
                <label
                  htmlFor={`${name}-${option.id}`}
                  className="relative mr-3 flex items-center justify-center p-1 peer-checked:before:hidden before:block before:absolute before:w-full before:h-full before:bg-White w-5 h-5 cursor-pointer bg-Yellow border border-Black rounded-sm overflow-hidden"
                >
                  {CHECK_ICON}
                </label>
                {option.label}
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Hidden inputs for form submission */}
      {Array.from(selectedOptions).map((id) => (
        <input key={id} type="hidden" name={name} value={id} />
      ))}
    </div>
  );
}
