import { Button } from './Button';
export const StickyDonateBar = ({ isVisible = true }) => {
    if (!isVisible)
        return null;
    return (<div className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white p-4 shadow-[0_-4px_20px_-4px_rgba(0,0,0,0.05)] lg:hidden">
      <div className="mx-auto flex max-w-md items-center justify-between gap-4">
        <div className="flex flex-col">
          <span className="font-bold text-gray-900 text-sm">Every child deserves a start</span>
          <span className="text-xs text-gray-500 font-medium">Support our cause</span>
        </div>
        <Button variant="primary" className="whitespace-nowrap px-6 py-2 text-sm shadow-md">
          Donate now
        </Button>
      </div>
    </div>);
};
