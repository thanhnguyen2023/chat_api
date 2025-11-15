import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

export function VideoZoom({ src }: { src: string }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <video
          src={src}
          className="h-10 w-10 rounded-lg object-cover border cursor-pointer"
          muted
        />
      </DialogTrigger>

      <DialogContent className="p-0 max-w-3xl">
        <video
          src={src}
          className="w-full h-auto rounded-lg"
          controls
          autoPlay
        />
      </DialogContent>
    </Dialog>
  );
}
