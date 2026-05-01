import { useAuth } from '../context/AuthContext';

// Returns true if logged-in user is a seller (or both)
export function useIsSeller() {
  const { user } = useAuth();
  if (!user) return false;
  return user.role === 'seller' || user.role === 'both';
}

// Returns true if logged-in user is a buyer (or both)
export function useIsBuyer() {
  const { user } = useAuth();
  if (!user) return false;
  return user.role === 'buyer' || user.role === 'both';
}

// Returns true if logged-in user owns this resource
export function useIsOwner(resourceUserId) {
  const { user } = useAuth();
  if (!user || !resourceUserId) return false;
  return user.id === resourceUserId;
}

// Returns true if user has a specific seller level
// levels: 'new' | 'level1' | 'level2' | 'top'
export function useSellerLevel(requiredLevel) {
  const { user } = useAuth();
  if (!user) return false;
  const levels = ['new', 'level1', 'level2', 'top'];
  const userLevelIndex = levels.indexOf(user.sellerLevel);
  const requiredIndex = levels.indexOf(requiredLevel);
  return userLevelIndex >= requiredIndex;
}