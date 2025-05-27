import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import { User } from '@/types';

interface UserMenuProps {
  user: User;
  onLogout: () => void;
}

export default function UserMenu({ user, onLogout }: UserMenuProps) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const getUserInitial = () => {
    return user.username?.charAt(0)?.toUpperCase() || "U";
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMenuAction = (action: () => void) => {
    action();
    setShowMenu(false);
  };

  return (
    <div className="absolute top-6 right-6" ref={menuRef}>
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="w-12 h-12 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-full flex items-center justify-center text-lg transition-colors shadow-sm"
      >
        {getUserInitial()}
      </button>
      
      {showMenu && (
        <div className="absolute right-0 mt-2 w-56 bg-gray-800 rounded-lg shadow-lg border border-gray-700 py-2 z-50">
          <div className="px-4 py-2 border-b border-gray-700">
            <p className="text-sm font-medium text-gray-100">{user.username}</p>
          </div>
          
          <button
            onClick={() => handleMenuAction(() => {
              router.push('/swipe-history');
            })}
            className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 transition-colors"
          >
            Swipe History
          </button>
          
          <button
            onClick={() => handleMenuAction(onLogout)}
            className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 transition-colors"
          >
            Log Out
          </button>
          
          <button
            onClick={() => handleMenuAction(() => {
              // Placeholder for delete account
            })}
            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-700 hover:text-red-400 transition-colors"
          >
            Delete My Account
          </button>
        </div>
      )}
    </div>
  );
} 