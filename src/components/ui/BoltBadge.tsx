export function BoltBadge() {
  return (
    <div data-bolt="true">
      <a
        href="https://bolt.new"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-3 py-1.5 bg-black dark:bg-white text-white dark:text-black text-sm font-medium rounded-full hover:opacity-80 transition-opacity"
      >
        <div className="w-4 h-4 bg-white dark:bg-black rounded-full flex items-center justify-center">
          <div className="w-2 h-2 bg-black dark:bg-white rounded-full"></div>
        </div>
        Built with Bolt
      </a>
    </div>
  );
}