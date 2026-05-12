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
        <div className="w-full h-full flex flex-col">
          <div className="flex items-center justify-between px-6 py-4 bg-white border-b shrink-0">
            <DialogTitle className="text-sm font-bold uppercase tracking-widest text-secondary-900">
              Hình Ảnh Thực Tế
            </DialogTitle>
          </div>
          <div className="flex-1 bg-gray-50 flex items-center justify-center p-8 overflow-hidden">
            {imagePreviewUrl && (
              <img
                src={imagePreviewUrl}
                className="h-full w-auto object-cover shadow-md"
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