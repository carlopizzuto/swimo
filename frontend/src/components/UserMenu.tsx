import { useState, useRef, useEffect } from 'react';
import { User } from '@/types';

interface UserMenuProps {
  user: User;
  onLogout: () => void;
}

export default function UserMenu({ user, onLogout }: UserMenuProps) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const getUserInitial = () => {
    return user.username?.charAt(0)?.toUpperCase() || "U";
  };

  // Handle click outside menu
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
        className="w-12 h-12 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-full flex items-center justify-center text-lg transition-colors shadow-sm"
      >
        {getUserInitial()}
      </button>
      
      {showMenu && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-orange-200 py-2 z-50">
          <div className="px-4 py-2 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-900">{user.username}</p>
          </div>
          
          <button
            onClick={() => handleMenuAction(() => {
              // Placeholder for swipe history
            })}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 transition-colors"
          >
            Swipe History
          </button>
          
          <button
            onClick={() => handleMenuAction(() => {
              // Placeholder for clear swipe history
            })}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 transition-colors"
          >
            Clear Swipe History
          </button>
          
          <button
            onClick={() => handleMenuAction(onLogout)}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 transition-colors"
          >
            Log Out
          </button>
          
          <button
            onClick={() => handleMenuAction(() => {
              // Placeholder for delete account
            })}
            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
          >
            Delete My Account
          </button>
        </div>
      )}
    </div>
  );
} 