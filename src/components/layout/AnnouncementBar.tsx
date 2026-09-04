export default function AnnouncementBar({text}:{text?:string}) {
  return (
    <div className="bg-ink text-white">
      <div className="container-pe flex h-9 items-center justify-center">
        <p className="truncate text-[12px] text-white/75">
          {text ?? "Free shipping on orders above ₹999"}
          <span className="mx-2 text-white/30">·</span>
          Design your own print in seconds
        </p>
      </div>
    </div>
  );
}
