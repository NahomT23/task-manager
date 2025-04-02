interface SkeletonLoaderProps {
    count: number;
  }
  
  const UserCardSkeleton = ({ count }: SkeletonLoaderProps) => {
    const loader = Array.from({ length: count }).map((_, index) => (
      <div
        key={index}
        className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 animate-pulse"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 rounded-full bg-gray-200"></div>
            <div className="space-y-2">
              <div className="w-24 h-4 bg-gray-200 rounded"></div>
              <div className="w-32 h-3 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 mt-4">
          <div className="h-16 bg-gray-200 rounded-lg animate-pulse"></div>
          <div className="h-16 bg-gray-200 rounded-lg animate-pulse"></div>
          <div className="h-16 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>
      </div>
    ));
  
    return <>{loader}</>;
  };
  
  export default UserCardSkeleton;
  