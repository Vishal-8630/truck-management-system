import React, { useState } from "react";

import Overlay from "@/components/Overlay";

interface ServiceCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  detail: string;
}

const ServiceCard: React.FC<ServiceCardProps> = ({
  icon,
  title,
  description,
  detail,
}) => {
  const [isCardOpen, setIsCardOpen] = useState(false);

  return (
    <>
      <div
        className="card-premium p-8 cursor-pointer group flex flex-col h-full items-start"
        onClick={() => setIsCardOpen(true)}
      >
        <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 mb-6 transition-all duration-300 group-hover:bg-indigo-600 group-hover:text-white group-hover:scale-110 group-hover:rotate-3 shadow-sm group-hover:shadow-indigo-200">
          <div className="w-7 h-7">{icon}</div>
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors">
          {title}
        </h3>
        <p className="text-slate-500 leading-relaxed text-sm">
          {description}
        </p>
      </div>

      {isCardOpen && (
        <Overlay onCancel={() => setIsCardOpen(false)}>
          <div className="max-w-2xl">
            <h2 className="text-3xl font-bold text-slate-900 mb-6">{title}</h2>
            <div className="prose prose-slate lg:prose-lg">
              <p className="text-slate-600 leading-loose">
                {detail}
              </p>
            </div>
          </div>
        </Overlay>
      )}
    </>
  );
};

export default ServiceCard;

