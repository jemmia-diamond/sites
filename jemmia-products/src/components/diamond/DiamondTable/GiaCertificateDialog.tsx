import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FilePdf } from "@phosphor-icons/react";

interface GiaCertificateDialogProps {
  previewUrl: string | null;
  onClose: () => void;
}

export function GiaCertificateDialog({ previewUrl, onClose }: GiaCertificateDialogProps) {
  return (
    <Dialog open={!!previewUrl} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[80vw]! max-w-[1200px]! h-[80vh] p-0 overflow-hidden border-none bg-white shadow-2xl rounded-none outline-none">
        <div className="w-full h-full flex flex-col">
          <div className="flex items-center justify-between px-6 py-4 bg-white border-b shrink-0">
            <DialogTitle className="text-sm font-bold uppercase tracking-widest text-secondary-900">
              Chứng Nhận GIA Preview
            </DialogTitle>
          </div>
          <div className="flex-1 bg-gray-100 overflow-hidden">
            {previewUrl && (
              <iframe
                src={`${previewUrl}#zoom=page-width`}
                className="w-full h-full border-none"
                title="GIA Certificate Preview"
              />
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}