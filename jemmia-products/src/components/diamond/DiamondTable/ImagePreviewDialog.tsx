import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ImagePreviewDialogProps {
  imagePreviewUrl: string | null;
  onClose: () => void;
}

export function ImagePreviewDialog({ imagePreviewUrl, onClose }: ImagePreviewDialogProps) {
  return (
    <Dialog open={!!imagePreviewUrl} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-auto max-w-[550px]! h-[80vh] p-0 overflow-hidden border-none bg-white shadow-2xl rounded-none outline-none">
        <div className=" flex flex-col">
          <div className="flex items-center justify-between px-6 py-4 bg-white border-b shrink-0">
            <DialogTitle className="text-sm font-bold uppercase tracking-widest text-secondary-900">
              Hình Ảnh Thực Tế
            </DialogTitle>
          </div>
          <div className=" h-[calc(80vh-53px)] relative flex items-center justify-center p-4 sm:p-8 bg-white overflow-hidden group/viewer">
            {imagePreviewUrl && (
              <img
                src={imagePreviewUrl}
                className="max-w-full max-h-full object-contain animate-in zoom-in-95 duration-500"
                alt="Real Diamond Preview"
                referrerPolicy="no-referrer"
              />
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}