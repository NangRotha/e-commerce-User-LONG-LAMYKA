import { useLocation } from "react-router-dom";

/**
 * រុំទំព័រនីមួយៗ ដើម្បីឱ្យមាន animation ចូល (fade + slide) ពេលប្តូរ Route
 * `key={pathname}` ធ្វើឱ្យ animation ចាប់ផ្តើមឡើងវិញរាល់ពេលប្តូរទំព័រ
 */
export default function PageTransition({ children }) {
  const { pathname } = useLocation();
  return (
    <div key={pathname} className="page-enter">
      {children}
    </div>
  );
}
