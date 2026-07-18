import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

const SearchBar = () => {
    const [query, setQuery] = useState('');
    const navigate = useNavigate();

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        const trimmed = query.trim();
        if (trimmed) navigate(`/search?q=${encodeURIComponent(trimmed)}`);
    };

    return (
        <form onSubmit={handleSubmit} role="search" className="d-flex">
            <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search species..."
                aria-label="Search species"
                className="form-control form-control-sm border-0"
                style={{ backgroundColor: 'var(--primary-color)', color: 'var(--text-color)', minWidth: '160px' }}
            />
        </form>
    );
};

export default SearchBar;
