import React from 'react';

interface HeaderWithChildProps {
  heading: string,
  child: React.ReactNode
}

const HeaderWithChild: React.FC<HeaderWithChildProps> = ({ heading, child }) => {
  return (
    <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
      <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 leading-tight italic uppercase">
        {heading}
      </h1>
      {child}
    </div>
  )
}

export default HeaderWithChild