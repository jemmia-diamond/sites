import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { getDisplayUrl } from '@/lib/media';
import { CircleNotch, PlayCircle } from '@phosphor-icons/react';
import axios from 'axios';
import { useState } from 'react';

interface ConfirmDeleteDialogProps {
    deleteConfirmOpen: boolean;
    setDeleteConfirmOpen: React.Dispatch<React.SetStateAction<boolean>>;
    selectedMediaUrls: string[];
    uploadConfig?: {
        designCode?: string;
    } | null;
    onDeleteSuccess?: () => Promise<void> | void;
}

const ConfirmDeleteDialog = ({ deleteConfirmOpen, setDeleteConfirmOpen, onDeleteSuccess, selectedMediaUrls, uploadConfig }: ConfirmDeleteDialogProps) => {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleConfirmDelete = async () => {
        const designCode = uploadConfig?.designCode;

        if (!designCode || selectedMediaUrls.length === 0) return;

        setIsDeleting(true);

        try {
            await axios.delete("/image-generation/", {
                data: {
                    designCode,
                    imageUrls: selectedMediaUrls,
                },
            });

            await onDeleteSuccess?.();

            setDeleteConfirmOpen(false);
        } catch (err) {
            console.error(err);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <Dialog open={deleteConfirmOpen} onOpenChange={(open) => !open && setDeleteConfirmOpen(false)}>
            <DialogContent className="w-[95%] md:w-[90%] md:max-w-2xl gap-0 bg-white border-none shadow-2xl p-0 rounded-none! overflow-hidden" showCloseButton={false}>
                <DialogHeader className="px-4 md:px-6 py-3 md:py-4 bg-primary-50/50 border-b border-primary-50">
                    <DialogTitle className="text-sm md:text-base text-secondary-900 font-black tracking-tight flex items-center justify-between">
                        Xác nhận xóa ảnh
                        {uploadConfig?.designCode && (
                            <span className="bg-secondary-900 text-white text-[9px] md:text-[10px] px-2 py-1 rounded-full uppercase tracking-widest">
                                {uploadConfig.designCode}
                            </span>
                        )}
                    </DialogTitle>
                </DialogHeader>
                <div className="px-4 md:px-6 py-3 md:py-4">
                    <p className="text-xs md:text-sm text-secondary-800 font-medium mb-3 md:mb-4">
                        Bạn có chắc chắn muốn xóa{" "}
                        <span className="font-bold text-red-500">
                            {selectedMediaUrls.length} ảnh
                        </span>{" "}
                        không? Hành động này không thể hoàn tác.
                    </p>

                    <div className="grid grid-cols-3 md:grid-cols-4 gap-2 md:gap-3 max-h-[300px] md:max-h-[400px] overflow-y-auto pr-1 md:pr-2">
                        {selectedMediaUrls.map((url, idx) => {
                            return (
                                <div
                                    key={idx}
                                    className="relative aspect-square overflow-hidden border border-primary-100 shadow-sm rounded-none bg-primary-50"
                                >
                                    <img
                                        src={getDisplayUrl(url)}
                                        alt={`Delete Preview ${idx}`}
                                        className="h-full w-full object-cover"
                                    />
                                </div>
                            );
                        })}
                    </div>
                </div>
                <DialogFooter className="px-4 md:px-6 py-3 md:py-4 m-0 bg-primary-50/30 border-t border-primary-50">
                    <div className="flex w-full justify-end gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setDeleteConfirmOpen(false)}
                            disabled={isDeleting}
                            className="border-primary-100 font-bold text-xs rounded-full px-4 md:px-6 h-8 md:h-auto"
                        >
                            Hủy
                        </Button>
                        <Button
                            onClick={handleConfirmDelete}
                            disabled={isDeleting}
                            className="bg-secondary-900 text-white hover:bg-secondary-800 font-bold text-xs rounded-full px-4 md:px-6 h-8 md:h-auto"
                        >
                            {isDeleting ? (
                                <>
                                    <CircleNotch size={12} className="animate-spin mr-1 md:mr-2" weight="bold" />
                                    Đang xóa...
                                </>
                            ) : (
                                "Xác nhận xóa"
                            )}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default ConfirmDeleteDialog
