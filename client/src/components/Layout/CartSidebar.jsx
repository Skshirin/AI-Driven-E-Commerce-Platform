import { X, Plus, Minus, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toggleCart } from "../../store/slices/popupSlice";

const CartSidebar = () => {
  const {isCartOpen} = useSelector((state) => state.popup);
  const { cart } = useSelector((state) => state.cart);
  const updateQuantity = (id, quantity) => {
    if (quantity <= 0) {
      dispatch(removeFromCart(id));
    }else{
      dispatch(updateCartQuantity({ id, quantity }));
    }
  };
  let total = 0;
  if(cart){
    total = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  }
  if (isCartOpen) return null;
  return <>
  {/* overlay */}
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
      onClick={() => dispatch(toggleSidebar())}
    />

    {/* cartsidebar */}
  </>;
};

export default CartSidebar;
