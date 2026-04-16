import { Menu, User, ShoppingCart, Sun, Moon, Search } from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";
import { useDispatch, useSelector } from "react-redux";
import { toggleSidebar, toggleAuthPopup, toggleCart, toggleSearchBar } from "../../store/slices/popupSlice.js";

const Navbar = () => {
  const { theme, toggleTheme } = useTheme();
  const dispatch = useDispatch();
  const cart = useSelector((state) => state.cart.items);
  let cartItemsCount = 0;
  if (cart) {
    cartItemsCount = cart.reduce((total, item) => total + item.quantity, 0);
  }
  return <>
  <nav className="fixed left-0 w-full top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
    <div className="max-w-7xl mx-auto px-4">
      <div className="flex items-center justify-between h-16">
        {/* LEFT - HAMBURGER MENU */}
        <button onClick={() => dispatch(toggleSidebar())} className="p-2 rounded-lg hover:bg-secondary transition-colors">
          <Menu className="h-6 w-6 text-foreground" />
        </button>
        {/* CENTER - LOGO */}
        <div className="flex-1 flex justify-center">
          <h1 className="text-2xl font-bold text-primary">
            Evocart
          </h1>
        </div>
        {/* RIGHT - ICONS */}
        <div className="flex items-center space-x-2">
          {/* THEME TOGGLE */}
          <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-secondary transition-colors">
            {theme === "dark" ? <Sun className="h-6 w-6 text-foreground" /> : <Moon className="h-6 w-6 text-foreground" />}
          </button>
          {/* SEARCH */}
          <button onClick={dispatch(toggleSearchBar)}  className="p-2 rounded-lg hover:bg-secondary transition-colors">
            <Search className="h-6 w-6 text-foreground" />
          </button>
          {/* USER Profile*/}
          <button onClick={dispatch(toggleAuthPopup)} className="p-2 rounded-lg hover:bg-secondary transition-colors">
            <User className="h-6 w-6 text-foreground" />
          </button>
          {/* CART */}
          <button onClick={dispatch(toggleCart)} className="relative p-2 rounded-lg hover:bg-secondary transition-colors">
            <ShoppingCart className="h-6 w-6 text-foreground" />
            {cartItemsCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {cartItemsCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  </nav>
  </>;
};

export default Navbar;
