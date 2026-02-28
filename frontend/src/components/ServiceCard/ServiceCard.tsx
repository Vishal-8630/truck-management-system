import React, { useState } from "react";
import Overlay from "@/components/Overlay";
import { ArrowRight } from "lucide-react";

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
        className="card-premium p-8 cursor-pointer group flex flex-col h-full items-start relative overflow-hidden"
        onClick={() => setIsCardOpen(true)}
      >
        <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500"></div>

        <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-6 transition-all duration-300 group-hover:bg-indigo-600 group-hover:text-white group-hover:scale-110 group-hover:rotate-3 shadow-sm group-hover:shadow-indigo-200 dark:group-hover:shadow-indigo-900">
          <div className="w-7 h-7">{icon}</div>
        </div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          {title}
        </h3>
        <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-sm mb-6 flex-1">
          {description}
        </p>

        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs uppercase tracking-widest mt-auto group-hover:translate-x-2 transition-transform duration-300">
          Explore Details
          <ArrowRight className="w-4 h-4" />
        </div>
      </div>

      {isCardOpen && (
        <Overlay onCancel={() => setIsCardOpen(false)}>
          <div className="max-w-2xl">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6 underline decoration-indigo-500/30 underline-offset-8 decoration-4">{title}</h2>
            <div className="prose prose-slate dark:prose-invert lg:prose-lg max-w-none">
              <p className="text-slate-600 dark:text-slate-300 leading-loose whitespace-pre-wrap">
                {detail}
              </p>
            </div>
            <button
              onClick={() => setIsCardOpen(false)}
              className="mt-10 btn-primary w-full sm:w-fit"
            >
              Close Details
            </button>
          </div>
        </Overlay>
      )}
    </>
  );
};

export default ServiceCard;
