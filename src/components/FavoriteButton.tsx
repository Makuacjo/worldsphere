import { type MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import type { FavoriteInput } from '../services/auth';

interface Props {
  fav: FavoriteInput;
  className?: string;
  size?: number;
}

/** Heart toggle. Saves to the signed-in user's favorites; if signed out, sends
 *  the visitor to /login. Safe to nest inside a Link (stops propagation). */
const FavoriteButton = ({ fav, className = '', size = 18 }: Props) => {
  const { isAuthenticated, isFavorite, toggleFavorite } = useAuth();
  const navigate = useNavigate();
  const active = isAuthenticated && isFavorite(fav.source, fav.key);

  const onClick = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) { navigate('/login'); return; }
    toggleFavorite(fav).catch(() => {});
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`fav-btn ${active ? 'is-active' : ''} ${className}`}
      aria-pressed={active}
      aria-label={active ? 'Remove from favorites' : 'Save to favorites'}
      title={isAuthenticated ? (active ? 'Saved' : 'Save') : 'Sign in to save'}
    >
      <Heart size={size} strokeWidth={2} fill={active ? 'currentColor' : 'none'} />
    </button>
  );
};

export default FavoriteButton;
