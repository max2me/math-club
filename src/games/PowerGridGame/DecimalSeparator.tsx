export function DecimalSeparator() {
  return (
    <div className="relative flex flex-col justify-between items-center w-[12px] sm:w-[24px] md:w-[32px] shrink-0 p-0.5 sm:p-1 md:p-2 transition-all duration-500">
      <div className="text-center h-6 sm:h-10 md:h-12 w-full mb-0.5 sm:mb-1" />
      <div className="flex flex-col flex-1 justify-center items-center w-full min-h-0 py-0.5">
        <div className="h-5 sm:h-8 md:h-10 w-full flex-none" />
        <div className="my-0.5 sm:my-1.5 md:my-2 w-full flex-1 flex items-center justify-center min-h-[20px] sm:min-h-[30px] md:min-h-[40px]">
          <div className="w-2 h-2 sm:w-3 sm:h-3 md:w-4 md:h-4 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)] self-end mb-1 sm:mb-2 md:mb-3" />
        </div>
        <div className="h-5 sm:h-8 md:h-10 w-full flex-none" />
      </div>
      <div className="mt-0.5 sm:mt-1 h-3 sm:h-4 w-full" />
    </div>
  );
}
