import React from "react";
import { Copyright } from "lucide-react";

const Foot = () => {
  const categories = [
    { name: "BANQUES" },
    { name: "RESTAURANTS" },
    { name: "SERVICE PUBLICS" },
    { name: "HÔTELS" },
    { name: "SANTÉ" },
    { name: "VENTES AU DÉTAIL" },
  ];

  return (
    <>
    <div className="w-full bg-red-600 text-white mt-10 px-8 py-10">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Description */}
        <div>
          <h1 className="text-2xl font-black mb-2">
            <span className="text-white">ECHO</span>WORK
          </h1>
          <p className="text-sm">
            EchoWork est une plateforme communautaire où les utilisateurs peuvent noter et évaluer
            les entreprises et services publics : banques, mairies, services gouvernementaux, commerces de détail, restaurants, etc.
          </p>
        </div>

        {/* Liste des catégories */}
        <div>
          <h2 className="text-xl font-bold mb-2">Catégories</h2>
          <ul className="space-y-1">
            {categories.map((category, index) => (
              <li key={index} className="text-sm">
                {category.name}
              </li>
            ))}
          </ul>
        </div>

        
      </div>
      </div>
      {/* Copyright */}
      <footer>
        <div className="bg-black text-white text-sm p-8 text-center">
            <p className="flex items-center justify-center text-lg font-black">Copyright 
            <Copyright size={20} /> ECHOWORK – 2025
            </p>
        </div>
    </footer>
    </>
  );
      
};

export default Foot;
