import { useState } from 'react';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Loader } from '../components/common/Loader';
import { StickyDonateBar } from '../components/common/StickyDonateBar';
export const ComponentShowcase = () => {
    const [isStickyBarVisible, setIsStickyBarVisible] = useState(false);
    return (<div className="mx-auto w-full max-w-5xl p-8 flex flex-col gap-16 flex-1 my-8">
      <div>
        <h1 className="text-4xl font-extrabold mb-4 text-gray-900 tracking-tight">Component Showcase</h1>
        <p className="text-lg text-gray-600 max-w-2xl">
          Reusable common components configured to strictly match the Figma design system assignments. 
          Page content is excluded as requested.
        </p>
      </div>

      <section>
        <h2 className="text-2xl font-bold mb-6 border-b border-gray-200 pb-2 text-gray-900">Buttons</h2>
        <div className="flex flex-wrap gap-8 items-center bg-white p-8 rounded-3xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-100">
          <div className="flex flex-col gap-3 items-center">
            <Button variant="primary">Primary Button</Button>
            <span className="text-xs text-gray-500 font-medium">Primary</span>
          </div>
          <div className="flex flex-col gap-3 items-center">
            <Button variant="secondary">Secondary Button</Button>
            <span className="text-xs text-gray-500 font-medium">Secondary</span>
          </div>
          <div className="flex flex-col gap-3 items-center">
            <Button variant="outline">Outline Button</Button>
            <span className="text-xs text-gray-500 font-medium">Outline</span>
          </div>
          <div className="flex flex-col gap-3 items-center">
            <Button variant="primary" disabled>Disabled</Button>
            <span className="text-xs text-gray-500 font-medium">Disabled</span>
          </div>
          <div className="flex flex-col gap-3 items-center">
            <Button variant="primary" isLoading>Processing</Button>
            <span className="text-xs text-gray-500 font-medium">Loading</span>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-6 border-b border-gray-200 pb-2 text-gray-900">Cards</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card>
            <div className="h-12 w-12 rounded-full bg-[var(--color-brand-bg)] flex items-center justify-center mb-4 border border-gray-100">
              <span className="text-[var(--color-brand-orange)] font-bold text-xl">1</span>
            </div>
            <h3 className="font-extrabold text-xl mb-3 text-gray-900">Reusable Card Structure</h3>
            <p className="text-gray-600 leading-relaxed mb-6">
              Cards feature rounded-3xl borders, soft layered shadows, and hover micro-interactions to match the refined, approachable feel of the Figma templates.
            </p>
            <Button variant="outline" size="sm" className="w-full">Action</Button>
          </Card>
          <Card className="bg-[var(--color-brand-orange)] text-white border-transparent">
            <h3 className="font-extrabold text-xl mb-3 text-white">Customizable Props</h3>
            <p className="text-white/90 leading-relaxed">
              The card accepts standard HTML attributes and custom classNames, meaning it can be completely overridden for specific use cases like this filled banner without needing a completely new component.
            </p>
          </Card>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-6 border-b border-gray-200 pb-2 text-gray-900">Loaders</h2>
        <div className="flex flex-col gap-8 bg-white p-8 rounded-3xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-100">
          <div className="flex flex-wrap items-center gap-12">
            <div className="flex flex-col gap-4 items-center">
              <Loader size={40} variant="spinner"/>
              <span className="text-xs text-gray-500 font-medium">Spinner (Default)</span>
            </div>
            <div className="flex flex-col gap-4 items-center">
              <Loader size={24} variant="spinner" className="text-gray-900"/>
              <span className="text-xs text-gray-500 font-medium">Spinner (Custom)</span>
            </div>
          </div>
          <div className="border-t border-gray-100 pt-8 w-full max-w-md flex flex-col gap-4">
            <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">Skeleton Variants:</span>
            <Loader variant="skeleton" size={160} className="h-40 rounded-2xl"/>
            <Loader variant="skeleton" size={24}/>
            <Loader variant="skeleton" size={24} className="w-2/3"/>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-6 border-b border-gray-200 pb-2 text-gray-900">Sticky Donate Bar (Mobile)</h2>
        <div className="bg-white p-8 rounded-3xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-100 flex flex-col items-start gap-4">
          <p className="text-gray-600">
            This component is fixed to the bottom of the viewport on mobile devices (hidden on desktop screens). 
            Toggle it below and resize your browser to mobile width to see it.
          </p>
          <Button variant={isStickyBarVisible ? "outline" : "primary"} onClick={() => setIsStickyBarVisible(!isStickyBarVisible)}>
            {isStickyBarVisible ? 'Hide Sticky Bar' : 'Show Sticky Bar'}
          </Button>
        </div>
        <StickyDonateBar isVisible={isStickyBarVisible}/>
      </section>
    </div>);
};

export default ComponentShowcase;

