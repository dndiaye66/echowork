import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Star, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { companyService } from '../services/companyService';

const SearchAutocomplete = ({ placeholder = "Rechercher une entreprise..." }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  const handleSearch = useCallback(async (searchQuery) => {
    setLoading(true);
    setError(null);
    try {
      const data = await companyService.searchAutocomplete(searchQuery, 10);
      setResults(data);
      setShowDropdown(true);
      setSelectedIndex(-1);
    } catch (error) {
      console.error('Error searching companies:', error);
      setError('Erreur lors de la recherche. Veuillez réessayer.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounce search
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (query.length >= 2) {
        handleSearch(query);
      } else {
        setResults([]);
        setShowDropdown(false);
        setError(null);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(delayDebounceFn);
  }, [query, handleSearch]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectCompany = (company) => {
    setQuery('');
    setShowDropdown(false);
    navigate(`/companies/${company.slug}`);
  };

  const handleKeyDown = (e) => {
    if (!showDropdown || results.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => 
          prev < results.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < results.length) {
          handleSelectCompany(results[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowDropdown(false);
        setSelectedIndex(-1);
        break;
      default:
        break;
    }
  };

  const dropdownId = 'search-autocomplete-listbox';

  return (
    <div className="relative w-full max-w-md" ref={searchRef}>
      <div className="relative">
        <input
          type="text"
          placeholder={placeholder}
          className="text-white border-2 border-white rounded-lg w-full pr-14 bg-transparent focus:outline-none px-4 py-4 text-base sm:text-lg"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (results.length > 0) {
              setShowDropdown(true);
            }
          }}
          role="combobox"
          aria-label="Rechercher des entreprises"
          aria-autocomplete="list"
          aria-expanded={showDropdown}
          aria-controls={dropdownId}
          aria-activedescendant={
            selectedIndex >= 0 ? `search-result-${selectedIndex}` : undefined
          }
        />
        <span className="absolute inset-y-0 right-0 pr-2 flex items-center">
          <Search className="text-white bg-red-600 rounded-full p-2" size={40} aria-hidden="true" />
        </span>
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <div
          id={dropdownId}
          className="absolute z-50 w-full mt-2 bg-white rounded-lg shadow-2xl max-h-96 overflow-y-auto"
          role="listbox"
        >
          {loading ? (
            <div className="p-4 text-center text-gray-500">
              Recherche en cours...
            </div>
          ) : error ? (
            <div className="p-4 text-center text-red-500" role="alert">
              {error}
            </div>
          ) : results.length > 0 ? (
            <ul className="py-2">
              {results.map((company, index) => (
                <li
                  key={company.id}
                  id={`search-result-${index}`}
                  role="option"
                  aria-selected={index === selectedIndex}
                  className={`px-4 py-3 cursor-pointer transition-colors ${
                    index === selectedIndex
                      ? 'bg-red-100'
                      : 'hover:bg-gray-100'
                  }`}
                  onClick={() => handleSelectCompany(company)}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  <div className="flex items-start gap-3">
                    {company.imageUrl && (
                      <img
                        src={company.imageUrl}
                        alt={`Logo de ${company.name}`}
                        className="w-12 h-12 object-cover rounded"
                      />
                    )}
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 text-sm">
                        {company.name}
                      </p>
                      <p className="text-xs text-gray-600 flex items-center gap-1">
                        <MapPin size={12} aria-hidden="true" />
                        {company.ville || company.adresse || 'N/A'}
                      </p>
                      {company.category && (
                        <p className="text-xs text-red-600 font-medium">
                          {company.category.name}
                        </p>
                      )}
                      {company.averageRating > 0 && (
                        <div className="flex items-center gap-1 mt-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={12}
                              aria-hidden="true"
                              className={
                                i < Math.round(company.averageRating)
                                  ? 'fill-red-600 text-red-600'
                                  : 'text-gray-300'
                              }
                            />
                          ))}
                          <span className="text-xs text-gray-600 ml-1">
                            ({company.reviewCount} avis)
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4 text-center text-gray-500">
              Aucun résultat trouvé
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchAutocomplete;
