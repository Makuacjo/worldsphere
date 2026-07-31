import { useState, type MouseEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useAuth } from '../context/auth';
import type { FavoriteInput } from '../services/auth';
import { notify } from '../utils/notifications';

interface Props { fav: FavoriteInput; className?: string; size?: number; }
const FavoriteButton = ({ fav, className = '', size = 18 }: Props) => {
  const { isAuthenticated, isFavorite, toggleFavorite, queueFavoriteAfterAuth } = useAuth();
  const navigate = useNavigate(); const location = useLocation(); const [pending,setPending]=useState(false);
  const active = isAuthenticated && isFavorite(fav.source, fav.key);
  const onClick = async (event: MouseEvent) => {
    event.preventDefault(); event.stopPropagation();
    if (!isAuthenticated) {
      const returnTo=`${location.pathname}${location.search}${location.hash}`;
      queueFavoriteAfterAuth(fav,returnTo); navigate('/login',{state:{from:returnTo}}); return;
    }
    if(pending)return; setPending(true);
    try { await toggleFavorite(fav); notify(active?'Removed from favorites.':'Added to favorites.'); }
    catch(err){notify(err instanceof Error?err.message:'Could not update favorites.','error');}
    finally{setPending(false)}
  };
  return <button type="button" onClick={onClick} disabled={pending} className={`fav-btn ${active?'is-active':''} ${className}`} aria-pressed={active} aria-label={active?'Remove from favorites':'Add to favorites'} title={active?'Remove from favorites':'Add to favorites'}>
    <Heart size={size} strokeWidth={2} fill={active?'currentColor':'none'} aria-hidden="true"/><span className="visually-hidden">{active?'Favorited':'Not favorited'}</span>
  </button>;
};
export default FavoriteButton;