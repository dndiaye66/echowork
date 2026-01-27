import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, ArrowDown } from "lucide-react";
import  categoriesEntreprises from "../data/CategoriesEntreprises"; // tableau de catégories
import { useAuth } from "../contexts/AuthContext";

const Navbar = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  const [search, setSearch] = React.useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/categories/${search.toLowerCase().replace(/\s+/g, "-")}`);
      setSearch("");
    }
  };

  return (
    <div className="w-full shadow-2xl bg-white px-4 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
        {/* Nom du site */}
        <Link to="/" className="text-2xl font-bold text-red-600">
          <span className="text-red-600 font-black">ECHO</span><span className="text-black">WORK</span>
        </Link>

        {/* Recherche */}
        <form onSubmit={handleSearch} className="flex-1 max-w-xl w-full hidden md:flex justify-center">
          <div className="flex items-center border-2 border-black rounded-full px-4 py-2 w-full gap-2">
            <input
              type="text"
              placeholder="Rechercher par catégorie d'entreprise"
              className="flex-1 text-black bg-transparent focus:outline-none text-base"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button type="submit">
              <Search className="text-white bg-red-600 rounded-full p-2" size={32} />
            </button>
          </div>
        </form>

        {/* Navigation */}
        <div className="flex items-center gap-4">
          <Link to="/" className="text-lg font-medium">
            Accueil
          </Link>

          <div className="dropdown dropdown-end">
            <label tabIndex={0} className="text-lg font-medium flex items-center gap-1 cursor-pointer">
              Catégorie d'entreprise
              <ArrowDown className="text-black" size={24} />
            </label>
            <ul
              tabIndex={0}
              className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-64 max-h-60 overflow-y-auto"
            >
              {categoriesEntreprises.map((cat, i) => (
                <li key={i}>
                  <Link to={`/categories/${cat.slug}`} className="capitalize">
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {isAuthenticated ? (
            <div className="dropdown dropdown-end">
              <label tabIndex={0} className="text-lg font-medium flex items-center gap-1 cursor-pointer">
                {user?.username || 'User'}
                <ArrowDown className="text-black" size={24} />
              </label>
              <ul
                tabIndex={0}
                className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-48"
              >
                {user?.role === 'ADMIN' && (
                  <li>
                    <Link to="/admin">Admin Dashboard</Link>
                  </li>
                )}
                <li>
                  <button onClick={logout}>Logout</button>
                </li>
              </ul>
            </div>
          ) : (
            <>
              <Link to="/login" className="text-lg font-medium">
                Login
              </Link>
              <Link to="/signup" className="text-lg font-medium">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>

  );
};

export default Navbar;
