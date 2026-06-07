"use client";
import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';
import styles from './SearchableSelect.module.css';

/**
 * SearchableSelect — dropdown dengan search/filter
 * Props:
 *   options: [{ id, label, sub?, color? }]
 *   value: selected id
 *   onChange: (id) => void
 *   placeholder: string
 *   emptyText: string (shown when no results)
 */
export default function SearchableSelect({ options = [], value, onChange, placeholder = 'Pilih...', emptyText = 'Tidak ada hasil', isMulti = false }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  const valArray = isMulti ? (Array.isArray(value) ? value : []) : [value];
  const selectedItems = options.filter(o => valArray.some(v => String(v) === String(o.id)));

  const filtered = query.trim()
    ? options.filter(o =>
        o.label.toLowerCase().includes(query.toLowerCase()) ||
        (o.sub || '').toLowerCase().includes(query.toLowerCase())
      )
    : options;

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
  }, [open]);

  const handleSelect = (id) => {
    if (isMulti) {
      const isSelected = valArray.some(v => String(v) === String(id));
      const newVal = isSelected
        ? valArray.filter(v => String(v) !== String(id))
        : [...valArray, id];
      onChange(newVal);
      // keep dropdown open for multi select
    } else {
      onChange(id);
      setOpen(false);
      setQuery('');
    }
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange(isMulti ? [] : '');
    setQuery('');
  };

  return (
    <div className={styles.wrap} ref={containerRef}>
      {/* ── Trigger button ── */}
      <button
        type="button"
        className={`${styles.trigger} ${open ? styles.triggerOpen : ''}`}
        onClick={() => setOpen(p => !p)}
      >
        <span className={styles.triggerContent}>
          {selectedItems.length > 0 ? (
            <span className={styles.selectedDisplay}>
              {isMulti ? (
                <span className={styles.selectedLabel}>
                  {selectedItems.length <= 2 
                    ? selectedItems.map(i => i.label).join(', ') 
                    : `${selectedItems[0].label}, ${selectedItems[1].label} (+${selectedItems.length - 2} lainnya)`
                  }
                </span>
              ) : (
                <>
                  {selectedItems[0].color && (
                    <span className={styles.colorDot} style={{ background: selectedItems[0].color }} />
                  )}
                  <span className={styles.selectedLabel}>{selectedItems[0].label}</span>
                  {selectedItems[0].sub && <span className={styles.selectedSub}>{selectedItems[0].sub}</span>}
                </>
              )}
            </span>
          ) : (
            <span className={styles.placeholder}>{placeholder}</span>
          )}
        </span>
        <span className={styles.triggerIcons}>
          {selectedItems.length > 0 && (
            <span className={styles.clearBtn} onClick={handleClear}>
              <X size={12} strokeWidth={3} />
            </span>
          )}
          <ChevronDown size={15} strokeWidth={2.5} className={open ? styles.chevronUp : ''} />
        </span>
      </button>

      {/* ── Dropdown panel ── */}
      {open && (
        <div className={styles.panel}>
          {/* Search input */}
          <div className={styles.searchBox}>
            <Search size={14} strokeWidth={2.5} className={styles.searchIcon} />
            <input
              ref={inputRef}
              type="text"
              className={styles.searchInput}
              placeholder="Ketik untuk mencari..."
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
            {query && (
              <button type="button" className={styles.clearQuery} onClick={() => setQuery('')}>
                <X size={11} strokeWidth={3} />
              </button>
            )}
          </div>

          {/* Options list */}
          <ul className={styles.list}>
            {filtered.length === 0 ? (
              <li className={styles.empty}>{emptyText}</li>
            ) : (
              filtered.map(opt => (
                <li key={opt.id}>
                    <button
                      type="button"
                      className={`${styles.option} ${valArray.some(v => String(v) === String(opt.id)) ? styles.optionSelected : ''}`}
                      onClick={() => handleSelect(opt.id)}
                    >
                      {opt.color && (
                        <span className={styles.optionColor} style={{ background: opt.color }} />
                      )}
                      <span className={styles.optionTexts}>
                        <span className={styles.optionLabel}>{opt.label}</span>
                        {opt.sub && <span className={styles.optionSub}>{opt.sub}</span>}
                      </span>
                      {valArray.some(v => String(v) === String(opt.id)) && (
                        <span className={styles.checkMark}>✓</span>
                      )}
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
